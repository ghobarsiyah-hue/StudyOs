/* ══════════════════════════════════════════
   STATS
══════════════════════════════════════════ */
function switchStatsTab(tab,btn){
  document.querySelectorAll('.stats-page-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  document.querySelectorAll('.stats-tab-content').forEach(c=>{c.classList.remove('active');c.style.display='none';});
  const content=document.getElementById('stats-'+tab+'-content');
  if(content){content.classList.add('active');content.style.display='block';}
  if(tab==='analysis')renderStats('today');else if(tab==='tasks')renderTasks();
}
function selectPeriodTab(tab,btn){document.querySelectorAll('.period-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderStats(tab);}
function getPeriodSessions(period){
  const now=new Date(),today=todayKey();
  if(period==='today')return(state.sessions||[]).filter(s=>s.date===today);
  if(period==='week'){const keys=new Set();for(let i=0;i<7;i++){const d=new Date(now);d.setDate(d.getDate()-i);keys.add(`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`);}return(state.sessions||[]).filter(s=>keys.has(s.date));}
  return(state.sessions||[]).filter(s=>{const p=s.date.split('-');return+p[0]===now.getFullYear()&&+p[1]===now.getMonth()+1;});
}
function renderStats(period){
  const sessions=getPeriodSessions(period);const total=sessions.reduce((a,s)=>a+s.duration,0),count=sessions.length;
  const bySubj={};sessions.forEach(s=>{bySubj[s.subjectId]=(bySubj[s.subjectId]||0)+s.duration;});
  let bestId=null,bestS=0;Object.entries(bySubj).forEach(([id,s])=>{if(s>bestS){bestS=s;bestId=id;}});
  const best=state.subjects.find(s=>s.id===bestId);
  const h=s=>toPersianNum(String(Math.floor(s/3600)).padStart(1,'0')+':'+String(Math.floor((s%3600)/60)).padStart(2,'0'));
  document.getElementById('stats-summary-grid').innerHTML=`<div class="summary-card"><div class="summary-val">${total?h(total):'۰:۰۰'}</div><div class="summary-label">مجموع مطالعه</div></div><div class="summary-card"><div class="summary-val" style="font-size:1.9rem;letter-spacing:-0.03em">${best?best.name:'—'}</div><div class="summary-label">بهترین درس</div></div><div class="summary-card"><div class="summary-val">${toPersianNum(count)}</div><div class="summary-label">تعداد جلسات</div></div>`;
  const entries=Object.entries(bySubj).map(([id,secs])=>({subj:state.subjects.find(s=>s.id===id),secs})).filter(e=>e.subj).sort((a,b)=>b.secs-a.secs);
  const bars=document.getElementById('subject-bars');
  if(!entries.length){bars.innerHTML='<div class="empty-state" style="padding:28px">هنوز مطالعه‌ای ثبت نشده</div>';}
  else bars.innerHTML=entries.map(e=>{const pct=total?Math.round(e.secs/total*100):0;return `<div class="subject-bar-row"><div class="subject-bar-header"><div class="subject-bar-name"><div style="width:9px;height:9px;border-radius:3px;background:${e.subj.color};flex-shrink:0"></div>${e.subj.name}</div><div class="subject-bar-meta"><span>${fmtHM(e.secs)}</span><span class="subject-bar-pct">${toPersianNum(pct)}٪</span></div></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${e.subj.color}"></div></div></div>`;}).join('');
  const log=document.getElementById('log-list');const recent=[...sessions].reverse().slice(0,25);
  if(!recent.length){log.innerHTML='<div class="empty-state" style="padding:28px">هیچ جلسه‌ای ثبت نشده</div>';return;}
  log.innerHTML=recent.map(s=>{const t=new Date(s.start);const ts=toPersianNum(String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0'));return `<div class="log-row"><span class="log-subj-pill" style="background:${s.color}18;color:${s.color}"><div style="width:6px;height:6px;border-radius:50%;background:${s.color}"></div>${s.subjectName}</span><span class="log-time">${ts}</span><span class="log-dur">${fmtHM(s.duration)}</span></div>`;}).join('');
}
