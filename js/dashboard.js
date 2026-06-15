/* ══════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════ */
function renderDashboardStats(){
  const k=todayKey(),today=(state.sessions||[]).filter(s=>s.date===k);
  const total=today.reduce((a,s)=>a+s.duration,0),count=today.length;
  const avg=count?Math.round(total/count):0;
  const bySubj={};today.forEach(s=>{bySubj[s.subjectId]=(bySubj[s.subjectId]||0)+s.duration;});
  let bestId=null,bestS=0;Object.entries(bySubj).forEach(([id,s])=>{if(s>bestS){bestS=s;bestId=id;}});
  const best=state.subjects.find(s=>s.id===bestId);
  const h=s=>toPersianNum(String(Math.floor(s/3600)).padStart(1,'0')+':'+String(Math.floor((s%3600)/60)).padStart(2,'0'));
  document.getElementById('stat-total').textContent=total?h(total):'۰:۰۰';
  document.getElementById('stat-sessions').textContent=toPersianNum(count);
  document.getElementById('stat-best').textContent=best?best.name:'—';
  document.getElementById('stat-avg').textContent=avg?h(avg):'۰:۰۰';
}
function drawPie(){
  const canvas=document.getElementById('pie-chart');if(!canvas)return;
  const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);
  const k=todayKey(),bySubj={};
  (state.sessions||[]).filter(s=>s.date===k).forEach(s=>{if(!bySubj[s.subjectId])bySubj[s.subjectId]={name:s.subjectName,color:s.color,secs:0};bySubj[s.subjectId].secs+=s.duration;});
  const entries=Object.values(bySubj).filter(e=>e.secs>0).sort((a,b)=>b.secs-a.secs);
  const total=entries.reduce((a,e)=>a+e.secs,0);const legend=document.getElementById('pie-legend');
  if(!total){ctx.beginPath();ctx.arc(W/2,H/2,W/2-7,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,0.07)';ctx.lineWidth=10;ctx.stroke();ctx.fillStyle='rgba(255,255,255,0.12)';ctx.font='11px Vazirmatn,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('بدون داده',W/2,H/2);legend.innerHTML='';return;}
  let angle=-Math.PI/2;
  entries.forEach(e=>{const sweep=e.secs/total*Math.PI*2;ctx.beginPath();ctx.moveTo(W/2,H/2);ctx.arc(W/2,H/2,W/2-7,angle,angle+sweep);ctx.closePath();ctx.fillStyle=e.color;ctx.fill();angle+=sweep;});
  ctx.beginPath();ctx.arc(W/2,H/2,(W/2-7)*0.52,0,Math.PI*2);ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim()||'#12121C';ctx.fill();
  legend.innerHTML=entries.map(e=>{const pct=Math.round(e.secs/total*100);return `<div class="pie-legend-row"><div class="pie-legend-left"><div class="pie-legend-dot" style="background:${e.color}"></div><span class="pie-legend-name">${e.name}</span></div><div class="pie-legend-right"><span>${fmtHM(e.secs)}</span><span class="pie-legend-pct">${toPersianNum(pct)}٪</span></div></div>`;}).join('');
}
function drawWeekBars(){
  const wrap=document.getElementById('week-bars');if(!wrap)return;
  const now=new Date(),jsDay=now.getDay(),irIdx=jsDay===6?0:jsDay+1;
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-irIdx);
  const IR_LABELS=['ش','ی','د','س','چ','پ','ج'];
  const days=Array.from({length:7},(_,i)=>{const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);const key=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;const secs=(state.sessions||[]).filter(s=>s.date===key).reduce((a,s)=>a+s.duration,0);return{label:IR_LABELS[i],secs,isToday:key===todayKey()};});
  const max=Math.max(...days.map(d=>d.secs),1);
  wrap.innerHTML=days.map(d=>`<div class="week-bar-row"><span class="week-bar-label" style="${d.isToday?'color:var(--accent);':''}">${d.label}</span><div class="week-bar-track"><div class="week-bar-fill" style="width:${Math.round(d.secs/max*100)}%${d.isToday?';box-shadow:0 0 8px var(--accent-glow)':''}"></div></div><span class="week-bar-val">${d.secs?fmtHM(d.secs):'—'}</span></div>`).join('');
}
function renderDashboard(){
  renderSubjectSelect();renderSubjectList();renderDashboardStats();drawPie();drawWeekBars();renderAdVisibility();
  if(shouldShowAds()&&settings.adsDismissedUntil<Date.now())setTimeout(()=>{if(shouldShowAds())showAdPopup();},10000);
}
