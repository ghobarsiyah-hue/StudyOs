/* ══════════════════════════════════════════
   SUBJECT MODAL & LIST
══════════════════════════════════════════ */
function buildColorPicker(selected){
  const picker=document.getElementById('color-picker');if(!picker)return;
  picker.innerHTML=COLORS.map(c=>`<div class="color-swatch${c===selected?' selected':''}" style="background:${c}" data-color="${c}" onclick="selectColor('${c}')"></div>`).join('');
}
function selectColor(c){
  document.querySelectorAll('#color-picker .color-swatch').forEach(s=>s.classList.remove('selected'));
  const el=document.querySelector(`#color-picker .color-swatch[data-color="${c}"]`);if(el)el.classList.add('selected');
}
function openSubjectModal(id){
  const modal=document.getElementById('subject-modal');if(!modal)return;
  document.getElementById('modal-edit-id').value=id||'';
  if(id){
    const s=state.subjects.find(x=>x.id===id);if(!s)return;
    document.getElementById('modal-title-text').textContent='ویرایش درس';
    document.getElementById('modal-subject-name').value=s.name;
    document.getElementById('modal-subject-category').value=s.category||'علوم پایه پزشکی';
    document.getElementById('modal-subject-goal').value=s.goal||'';
    buildColorPicker(s.color);
  }else{
    document.getElementById('modal-title-text').textContent='درس جدید';
    document.getElementById('modal-subject-name').value='';
    document.getElementById('modal-subject-category').value='علوم پایه پزشکی';
    document.getElementById('modal-subject-goal').value='';
    buildColorPicker(COLORS[state.subjects.length%COLORS.length]);
  }
  modal.classList.add('open');setTimeout(()=>document.getElementById('modal-subject-name').focus(),200);
}
function closeSubjectModal(e){if(e&&e.target!==document.getElementById('subject-modal'))return;document.getElementById('subject-modal').classList.remove('open');}
function saveSubject(){
  const nameInput=document.getElementById('modal-subject-name');const name=nameInput.value.trim();
  const cat=document.getElementById('modal-subject-category').value;
  const goal=parseInt(document.getElementById('modal-subject-goal').value)||0;
  const selectedSwatch=document.querySelector('#color-picker .color-swatch.selected');
  const color=selectedSwatch?selectedSwatch.dataset.color:COLORS[0];
  const editId=document.getElementById('modal-edit-id').value;
  if(!name){nameInput.focus();nameInput.style.borderColor='var(--danger)';setTimeout(()=>{nameInput.style.borderColor='';},1500);toast('نام درس را وارد کنید','warn');return;}
  if(editId){
    const s=state.subjects.find(x=>x.id===editId);if(s){s.name=name;s.color=color;s.category=cat;s.goal=goal;}
    toast(`«${name}» ویرایش شد`,'success');
  }else{
    if(state.subjects.find(x=>x.name===name)){toast('این درس قبلاً وجود دارد','warn');return;}
    state.subjects.push({id:uid(),name,color,category:cat,goal});toast(`«${name}» اضافه شد`,'success');
  }
  saveState();document.getElementById('subject-modal').classList.remove('open');
  renderSubjectList();renderSubjectSelect();renderTaskSubjectTags();renderDashboardStats();
}
function deleteSubject(id){
  const s=state.subjects.find(x=>x.id===id);if(!s)return;
  if(!confirm(`درس «${s.name}» حذف شود؟`))return;
  state.subjects=state.subjects.filter(x=>x.id!==id);
  state.sessions=state.sessions.filter(x=>x.subjectId!==id);
  saveState();renderSubjectList();renderSubjectSelect();renderTaskSubjectTags();renderDashboardStats();
  toast(`«${s.name}» حذف شد`,'warn');
}
function renderSubjectList(){
  const el=document.getElementById('subject-list');if(!el||!state||!state.subjects)return;
  const sorted=[...state.subjects].sort((a,b)=>getTodaySecs(b.id)-getTodaySecs(a.id));
  if(!sorted.length){el.innerHTML='<div class="empty-state"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg><span>هنوز درسی ندارید</span></div>';return;}
  const html=sorted.map(s=>{const secs=getTodaySecs(s.id),goalSecs=(s.goal||0)*60,pct=goalSecs>0?Math.min(100,Math.round(secs/goalSecs*100)):0;return `<div class="subject-row"><div class="subject-color-dot" style="background:${s.color}" onclick="openSubjectModal('${s.id}')" title="ویرایش"></div><div style="flex:1;min-width:0"><div style="display:flex;align-items:center;justify-content:space-between"><span class="subject-row-name">${escapeHtml(s.name)}</span><span class="subject-row-time">${secs>0?fmtHM(secs):'—'}</span></div>${goalSecs>0?`<div style="margin-top:4px"><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${s.color}"></div></div><span style="font-size:0.65rem;color:var(--text-muted);margin-top:2px;display:block">هدف: ${toPersianNum(s.goal)} دقیقه — ${toPersianNum(pct)}٪</span></div>`:''}</div><div class="subject-row-actions"><button class="subject-action-btn" onclick="openSubjectModal('${s.id}')" title="ویرایش"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="subject-action-btn del" onclick="deleteSubject('${s.id}')" title="حذف"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button></div></div>`;}).join('');
  el.innerHTML=html;
  const pomoList=document.getElementById('pomodoro-subject-list');if(pomoList)pomoList.innerHTML=html;
}
function renderSubjectSelect(){
  const sel=document.getElementById('subject-select');if(!sel||!state||!state.subjects)return;
  const v=sel.value;sel.innerHTML=state.subjects.map(s=>`<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
  if(v&&state.subjects.find(s=>s.id===v))sel.value=v;
  const pomoSel=document.getElementById('pomodoro-subject-select');if(pomoSel){pomoSel.innerHTML=sel.innerHTML;if(sel.value)pomoSel.value=sel.value;}
}
function renderTaskSubjectTags(){
  const sel=document.getElementById('todo-subject-tag');if(!sel)return;
  sel.innerHTML='<option value="">درس (اختیاری)</option>'+state.subjects.map(s=>`<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
}
