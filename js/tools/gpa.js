/* ══════════════════════════════════════════
   GPA CALCULATOR
══════════════════════════════════════════ */
function addGpaCourse(){
  const name=document.getElementById('gpa-course-name').value.trim();
  const units=parseFloat(document.getElementById('gpa-units').value);
  const grade=parseFloat(document.getElementById('gpa-grade').value);
  if(!name){document.getElementById('gpa-course-name').focus();return;}
  if(!units||units<0.5||units>6){toast('تعداد واحد باید بین ۰.۵ تا ۶ باشد','warn');return;}
  if(isNaN(grade)||grade<0||grade>20){toast('نمره باید بین ۰ تا ۲۰ باشد','warn');return;}
  state.gpaCourses.push({id:uid(),name,units,grade});saveState();
  document.getElementById('gpa-course-name').value='';document.getElementById('gpa-units').value='';document.getElementById('gpa-grade').value='';
  renderGpaTable();toast(`درس «${name}» اضافه شد`,'success');
}
function removeGpaCourse(id){state.gpaCourses=state.gpaCourses.filter(c=>c.id!==id);saveState();renderGpaTable();document.getElementById('gpa-result').style.display='none';}
function clearAllCourses(){if(!state.gpaCourses.length)return;if(!confirm('همه دروس پاک شوند؟'))return;state.gpaCourses=[];saveState();renderGpaTable();document.getElementById('gpa-result').style.display='none';toast('لیست دروس پاک شد','warn');}
function calculateGpa(){
  if(!state.gpaCourses.length){toast('ابتدا دروس را اضافه کنید','warn');return;}
  let weightedSum=0,totalUnits=0;state.gpaCourses.forEach(c=>{weightedSum+=c.grade*c.units;totalUnits+=c.units;});
  if(totalUnits===0){toast('مجموع واحد صفر است','warn');return;}
  const gpa=weightedSum/totalUnits;
  document.getElementById('gpa-result').style.display='flex';
  document.getElementById('gpa-result-value').textContent=toPersianNum(gpa.toFixed(2));
  document.getElementById('gpa-total-units').textContent=toPersianNum(totalUnits);
  document.getElementById('gpa-weighted-sum').textContent=toPersianNum(weightedSum.toFixed(2));
  const label=document.getElementById('gpa-grade-label');label.className='gpa-grade-label';
  if(gpa>=18){label.textContent='عالی';label.classList.add('excellent');}
  else if(gpa>=16){label.textContent='خیلی خوب';label.classList.add('good');}
  else if(gpa>=14){label.textContent='خوب';label.classList.add('good');}
  else if(gpa>=12){label.textContent='قابل قبول';label.classList.add('average');}
  else if(gpa>=10){label.textContent='متوسط';label.classList.add('weak');}
  else{label.textContent='مردود';label.classList.add('poor');}
}
function renderGpaTable(){
  const tbody=document.getElementById('gpa-table-body'),empty=document.getElementById('gpa-empty');
  if(!state.gpaCourses.length){tbody.innerHTML='';empty.style.display='flex';document.getElementById('gpa-result').style.display='none';return;}
  empty.style.display='none';
  tbody.innerHTML=state.gpaCourses.map((c,i)=>`<tr><td style="text-align:center;color:var(--text-muted)">${toPersianNum(i+1)}</td><td class="gpa-course-name">${escapeHtml(c.name)}</td><td class="gpa-units-cell">${toPersianNum(c.units)}</td><td class="gpa-grade-cell">${toPersianNum(c.grade)}</td><td class="gpa-actions-cell"><button class="gpa-del-btn" onclick="removeGpaCourse('${c.id}')" title="حذف"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button></td></tr>`).join('');
}
function renderGpaPage(){renderGpaTable();}
