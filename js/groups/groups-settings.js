/* ══════════════════════════════════════════
   GROUP SETTINGS
══════════════════════════════════════════ */
function openGroupSettingsModal(){
  if(!currentGroupId)return;const groups=getGroups(),group=groups.find(g=>g.id===currentGroupId);
  if(!group||!isGroupOwnerOrAdmin(group,currentUser.username)){toast('فقط مدیر گروه می‌تواند تنظیمات را تغییر دهد','warn');return;}
  document.getElementById('group-edit-name').value=group.name;
  document.getElementById('group-edit-desc').value=group.description||'';
  const gmhEl=document.getElementById('group-edit-min-hours');if(gmhEl)gmhEl.value=group.minDailyHours||'';
  document.getElementById('group-edit-max-members').value=group.maxMembers||'';
  const colorPicker=document.getElementById('group-edit-color-picker');
  colorPicker.innerHTML=COLORS.slice(0,8).map(c=>`<div class="color-swatch${(group.color||COLORS[0])===c?' selected':''}" style="background:${c}" data-color="${c}" onclick="selectGroupEditColor('${c}')"></div>`).join('');
  const preview=document.getElementById('group-profile-preview');
  if(group.photo){preview.innerHTML=`<img src="${group.photo}">`;}else{preview.innerHTML=`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${group.color||COLORS[0]};border-radius:12px;color:#fff;font-size:2rem;font-weight:700">${group.name[0]}</div>`;}
  document.getElementById('group-chat-enabled').checked=group.chatEnabled!==false;
  const perms=group.permissions||defaultPermissions();
  document.querySelectorAll('.perm-toggle').forEach(t=>{const p=t.dataset.perm;t.checked=(perms[p]!==undefined)?perms[p]:true;});
  renderMemberManagement(group);
  document.querySelectorAll('.group-settings-tab').forEach((b,i)=>b.classList.toggle('active',i===0));
  ['general','permissions','members'].forEach((t,i)=>{const el=document.getElementById('group-settings-'+t);if(el){el.style.display=i===0?'block':'none';el.classList.toggle('active',i===0);}});
  document.getElementById('group-settings-modal').classList.add('open');
}
function selectGroupEditColor(c){document.querySelectorAll('#group-edit-color-picker .color-swatch').forEach(s=>s.classList.remove('selected'));const el=document.querySelector(`#group-edit-color-picker .color-swatch[data-color="${c}"]`);if(el)el.classList.add('selected');}
function switchGroupSettingsTab(tab,btn){document.querySelectorAll('.group-settings-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');['general','permissions','members'].forEach(t=>{const el=document.getElementById('group-settings-'+t);if(el){el.style.display=t===tab?'block':'none';el.classList.toggle('active',t===tab);}});}
function saveGroupSettings(){
  if(!currentGroupId)return;const groups=getGroups(),group=groups.find(g=>g.id===currentGroupId);if(!group)return;
  group.name=document.getElementById('group-edit-name').value.trim()||group.name;
  group.description=document.getElementById('group-edit-desc').value.trim();
  const gmhEl=document.getElementById('group-edit-min-hours');if(gmhEl)group.minDailyHours=parseFloat(gmhEl.value)||0;
  group.maxMembers=parseInt(document.getElementById('group-edit-max-members').value)||0;
  group.chatEnabled=document.getElementById('group-chat-enabled').checked;
  const selColor=document.querySelector('#group-edit-color-picker .color-swatch.selected');if(selColor)group.color=selColor.dataset.color;
  saveGroups(groups);document.getElementById('group-settings-modal').classList.remove('open');renderGroupDetail();renderGroups();toast('تنظیمات گروه ذخیره شد','success');
}
function saveGroupPermissions(){
  if(!currentGroupId)return;const groups=getGroups(),group=groups.find(g=>g.id===currentGroupId);if(!group)return;
  if(!group.permissions)group.permissions={};
  document.querySelectorAll('.perm-toggle').forEach(t=>{group.permissions[t.dataset.perm]=t.checked;});
  saveGroups(groups);toast('دسترسی‌ها ذخیره شد','success');
}
function toggleGroupChat(enabled){
  if(!currentGroupId)return;const groups=getGroups(),group=groups.find(g=>g.id===currentGroupId);if(!group)return;
  group.chatEnabled=enabled;saveGroups(groups);
  const overlay=document.getElementById('chat-disabled-overlay');const inputArea=document.getElementById('chat-input-area');
  if(overlay)overlay.style.display=enabled?'none':'flex';
  if(inputArea){inputArea.style.opacity=enabled?'1':'0.3';inputArea.style.pointerEvents=enabled?'auto':'none';}
  toast(enabled?'چت گروه فعال شد':'چت گروه غیرفعال شد','info');
}
function handleGroupPhoto(event){
  const file=event.target.files[0];if(!file||!currentGroupId)return;
  const reader=new FileReader();reader.onload=function(e){const groups=getGroups(),group=groups.find(g=>g.id===currentGroupId);if(!group)return;group.photo=e.target.result;saveGroups(groups);document.getElementById('group-profile-preview').innerHTML=`<img src="${e.target.result}">`;toast('تصویر گروه به‌روزرسانی شد','success');};reader.readAsDataURL(file);
}
function removeGroupPhoto(){
  if(!currentGroupId)return;const groups=getGroups(),group=groups.find(g=>g.id===currentGroupId);if(!group)return;
  group.photo=null;saveGroups(groups);
  const preview=document.getElementById('group-profile-preview');
  if(preview)preview.innerHTML=`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${group.color||COLORS[0]};border-radius:12px;color:#fff;font-size:2rem;font-weight:700">${group.name[0]}</div>`;
  toast('تصویر گروه حذف شد','info');
}
function renderMemberManagement(group){
  const list=document.getElementById('members-manage-list');if(!list)return;
  list.innerHTML=group.members.map(m=>{
    const users=getUsers(),u=users.find(x=>x.username===m);const dn=u?u.displayName:m;
    const col=u&&u.profile&&u.profile.avatarColor?u.profile.avatarColor:avatarColor(m);
    const photo=u&&u.profile&&u.profile.photo;const bio=u&&u.profile?u.profile.bio||'':'';
    const role=m===group.createdBy?'owner':((group.roles&&group.roles[m])||'member');
    const isOwner=m===group.createdBy;const canManage=group.createdBy===currentUser.username&&!isOwner;
    return `<div class="member-manage-row"><div class="member-manage-avatar" style="background:${col}">${photo?'<img src="'+photo+'">':escapeHtml(dn[0])}</div><div class="member-manage-info"><div class="member-manage-name">${escapeHtml(dn)} ${isOwner?'(مالک)':''}</div><div class="member-manage-username">@${escapeHtml(m)}</div>${bio?`<div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px">${escapeHtml(bio)}</div>`:''}</div><span class="group-member-role role-${role}">${role==='owner'?'مالک':role==='admin'?'مدیر':'عضو'}</span>${canManage?`<div class="member-manage-actions">${role!=='admin'?`<button class="btn btn-ghost btn-xs" onclick="setMemberRole('${m}','admin')">مدیر</button>`:`<button class="btn btn-ghost btn-xs" onclick="setMemberRole('${m}','member')">عزل</button>`}<button class="btn btn-danger btn-xs" onclick="removeMember('${m}')">اخراج</button></div>`:''}</div>`;
  }).join('');
}
function setMemberRole(username,role){if(!currentGroupId)return;const groups=getGroups(),group=groups.find(g=>g.id===currentGroupId);if(!group)return;if(!group.roles)group.roles={};group.roles[username]=role;saveGroups(groups);renderMemberManagement(group);toast(`نقش ${username} تغییر کرد`,'success');}
function removeMember(username){if(!currentGroupId)return;if(!confirm(`آیا ${username} از گروه اخراج شود؟`))return;const groups=getGroups(),group=groups.find(g=>g.id===currentGroupId);if(!group)return;group.members=group.members.filter(m=>m!==username);if(group.roles)delete group.roles[username];saveGroups(groups);renderMemberManagement(group);renderGroupDetail();toast(`${username} اخراج شد`,'warn');}
function searchMembers(query){const rows=document.querySelectorAll('#members-manage-list .member-manage-row');rows.forEach(r=>{const name=r.querySelector('.member-manage-name')?.textContent||'';const uname=r.querySelector('.member-manage-username')?.textContent||'';r.style.display=(query&&!name.includes(query)&&!uname.includes(query))?'none':'';});}
