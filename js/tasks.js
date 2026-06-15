/* ══════════════════════════════════════════
   TASKS
══════════════════════════════════════════ */
let dragId=null,dragCol=null;
function addTask(col){
  const inp=document.getElementById('todo-input'),text=inp.value.trim();if(!text){inp.focus();return;}
  const priority=document.getElementById('todo-priority').value;
  const subjectId=document.getElementById('todo-subject-tag').value;
  const estimate=document.getElementById('todo-estimate').value.trim();
  const subj=state.subjects.find(s=>s.id===subjectId);
  state.tasks[col].unshift({id:uid(),text,priority,subjectId,subjectName:subj?.name||'',estimate});
  saveState();inp.value='';document.getElementById('todo-estimate').value='';renderTasks();toast('آیتم اضافه شد','success');
}
function deleteTask(col,id){state.tasks[col]=state.tasks[col].filter(t=>t.id!==id);saveState();renderTasks();}
function moveTask(from,to,id){const idx=state.tasks[from].findIndex(t=>t.id===id);if(idx<0)return;const[item]=state.tasks[from].splice(idx,1);state.tasks[to].unshift(item);saveState();renderTasks();}
function clearDone(){if(!state.tasks.done.length)return;if(!confirm('همه تمام‌شده‌ها پاک شوند؟'))return;state.tasks.done=[];saveState();renderTasks();toast('لیست تمام‌شده‌ها پاک شد','warn');}
function onDragStart(e,col,id){dragId=id;dragCol=col;e.dataTransfer.effectAllowed='move';setTimeout(()=>e.target.classList.add('dragging'),0);}
function onDragEnd(e){e.target.classList.remove('dragging');}
function onDragOver(e,col){e.preventDefault();e.currentTarget.classList.add('drag-over');}
function onDragLeave(e){e.currentTarget.classList.remove('drag-over');}
function onDrop(e,col){e.preventDefault();e.currentTarget.classList.remove('drag-over');if(!dragId||dragCol===col){dragId=null;dragCol=null;return;}moveTask(dragCol,col,dragId);dragId=null;dragCol=null;toast(col==='done'?'آیتم تمام شد':'آیتم برگردانده شد',col==='done'?'success':'info');}
function renderTasks(){
  renderTaskSubjectTags();
  ['todo','done'].forEach(col=>{
    const list=document.getElementById(col+'-list'),cnt=document.getElementById(col+'-count'),items=state.tasks[col];
    cnt.textContent=toPersianNum(items.length);
    if(!items.length){const msgs={todo:'هیچ موضوعی ندارید',done:'هنوز چیزی تمام نشده'};list.innerHTML=`<div class="empty-state"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">${col==='todo'?'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>':'<polyline points="20 6 9 17 4 12"/>'}</svg>${msgs[col]}</div>`;return;}
    list.innerHTML=items.map(t=>{
      const subj=state.subjects.find(s=>s.id===t.subjectId);
      return `<div class="task-item${col==='done'?' task-done':''}" draggable="true" ondragstart="onDragStart(event,'${col}','${t.id}')" ondragend="onDragEnd(event)"><div class="task-grip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="17" r="1" fill="currentColor"/><circle cx="15" cy="7" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="17" r="1" fill="currentColor"/></svg></div><div class="task-priority-dot p-${t.priority||'medium'}"></div><div class="task-body"><div class="task-text">${escapeHtml(t.text)}</div><div class="task-meta-row">${t.priority==='high'?'<span class="task-tag" style="color:var(--danger);background:rgba(255,107,107,0.1)">اولویت بالا</span>':''}${subj?`<span class="task-tag task-subj" style="color:${subj.color};background:${subj.color}18">${subj.name}</span>`:''}${t.estimate?`<span class="task-tag task-est">${t.estimate}</span>`:''}</div></div><div class="task-actions-wrap">${col==='todo'?`<button class="task-act-btn" onclick="moveTask('todo','done','${t.id}')" title="تمام شد"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></button>`:`<button class="task-act-btn" onclick="moveTask('done','todo','${t.id}')" title="برگرداندن"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.7"/></svg></button>`}<button class="task-act-btn del" onclick="deleteTask('${col}','${t.id}')" title="حذف"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div></div>`;
    }).join('');
  });
}
