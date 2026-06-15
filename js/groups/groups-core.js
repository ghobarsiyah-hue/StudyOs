/* ══════════════════════════════════════════
   GROUPS
══════════════════════════════════════════ */
let currentGroupId=null;
function getGroups(){return JSON.parse(localStorage.getItem('studyos_groups')||'[]');}
function saveGroups(g){localStorage.setItem('studyos_groups',JSON.stringify(g));}
function getUserGroups(){return getGroups().filter(g=>g.members.includes(currentUser.username));}
function generateGroupCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code='';for(let i=0;i<6;i++)code+=chars[Math.floor(Math.random()*chars.length)];return code;}
function defaultPermissions(){return{send_message:true,send_file:true,send_voice:true,edit_own:true,delete_own:true,delete_others:false,pin_message:false,manage_members:false,edit_settings:false};}
function isGroupOwnerOrAdmin(g,u){if(u===g.createdBy)return true;return(g.roles&&g.roles[u]==='admin');}
function hasPermission(g,u,p){if(u===g.createdBy)return true;if(g.roles&&g.roles[u]==='admin')return true;return(g.permissions&&g.permissions[p]!==undefined)?g.permissions[p]:true;}

function createGroup(){
  const name=document.getElementById('new-group-name').value.trim();
  const desc=document.getElementById('new-group-desc').value.trim();
  const minHours=parseFloat(document.getElementById('new-group-min-hours').value)||0;
  const maxMembers=parseInt(document.getElementById('new-group-max-members').value)||0;
  if(!name){document.getElementById('new-group-name').focus();return;}
  const selectedColor=document.querySelector('#new-group-color-picker .color-swatch.selected');
  const color=selectedColor?selectedColor.dataset.color:COLORS[0];
  const groups=getGroups();
  const group={id:uid(),name,description:desc,minDailyHours:minHours,maxMembers,color,photo:null,code:generateGroupCode(),createdAt:Date.now(),createdBy:currentUser.username,members:[currentUser.username],messages:[],chatEnabled:true,permissions:defaultPermissions(),roles:{}};
  groups.push(group);saveGroups(groups);
  document.getElementById('create-group-modal').classList.remove('open');
  document.getElementById('new-group-name').value='';document.getElementById('new-group-desc').value='';
  document.getElementById('new-group-min-hours').value='';document.getElementById('new-group-max-members').value='';
  renderGroups();toast(`گروه «${name}» ساخته شد. کد: ${group.code}`,'success');checkAchievements();
}
function joinGroup(){
  const code=document.getElementById('join-group-code').value.trim().toUpperCase();
  if(!code||code.length!==6){toast('کد ۶ کاراکتری وارد کنید','warn');return;}
  const groups=getGroups();const group=groups.find(g=>g.code===code);
  if(!group){toast('گروهی با این کد یافت نشد','warn');return;}
  if(group.members.includes(currentUser.username)){toast('قبلاً عضو این گروه هستید','info');return;}
  if(group.maxMembers&&group.members.length>=group.maxMembers){toast('ظرفیت گروه تکمیل است','warn');return;}
  group.members.push(currentUser.username);saveGroups(groups);
  document.getElementById('join-group-modal').classList.remove('open');
  document.getElementById('join-group-code').value='';renderGroups();toast(`به گروه «${group.name}» پیوستید`,'success');
}
function joinSuggestedGroup(groupId){
  const groups=getGroups();const group=groups.find(g=>g.id===groupId);if(!group)return;
  if(group.members.includes(currentUser.username)){toast('قبلاً عضو هستید','info');return;}
  if(group.maxMembers&&group.members.length>=group.maxMembers){toast('ظرفیت تکمیل است','warn');return;}
  group.members.push(currentUser.username);saveGroups(groups);renderGroups();toast(`به گروه «${group.name}» پیوستید`,'success');
}
function openCreateGroupModal(){
  document.getElementById('create-group-modal').classList.add('open');
  const picker=document.getElementById('new-group-color-picker');
  if(picker)picker.innerHTML=COLORS.slice(0,8).map((c,i)=>`<div class="color-swatch${i===0?' selected':''}" style="background:${c}" data-color="${c}" onclick="selectNewGroupColor('${c}')"></div>`).join('');
  setTimeout(()=>document.getElementById('new-group-name').focus(),180);
}
function selectNewGroupColor(c){document.querySelectorAll('#new-group-color-picker .color-swatch').forEach(s=>s.classList.remove('selected'));const el=document.querySelector(`#new-group-color-picker .color-swatch[data-color="${c}"]`);if(el)el.classList.add('selected');}
function openJoinGroupModal(){document.getElementById('join-group-modal').classList.add('open');setTimeout(()=>document.getElementById('join-group-code').focus(),180);}
function closeModalGeneric(e,id){if(e.target!==document.getElementById(id))return;document.getElementById(id).classList.remove('open');}
function isMemberOnline(username,groupId){if(username===currentUser.username)return true;const minute=Math.floor(Date.now()/60000);let h=0;const str=username+groupId+minute;for(let i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return Math.abs(h)%3!==0;}
function isMemberStudying(username){if(username===currentUser.username)return timerRunning&&!timerPaused;const minute=Math.floor(Date.now()/300000);let h=0;const str=username+'study'+minute;for(let i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return Math.abs(h)%4===0;}
function getUserStudyCategories(){if(!state||!state.subjects)return[];return[...new Set(state.subjects.map(s=>s.category).filter(Boolean))];}

function renderSuggestedGroups(){
  const sec=document.getElementById('suggested-groups-section');const grid=document.getElementById('suggested-groups-grid');if(!sec||!grid)return;
  const allGroups=getGroups();const userGroupIds=new Set(getUserGroups().map(g=>g.id));const userCats=getUserStudyCategories();
  const suggestions=allGroups.filter(g=>{if(userGroupIds.has(g.id))return false;if(g.maxMembers&&g.members.length>=g.maxMembers)return false;if(g.description){const desc=g.description.toLowerCase();if(userCats.some(c=>desc.includes(c.toLowerCase())))return true;}if(g.minDailyHours&&state){const avgGoal=state.subjects.reduce((a,s)=>a+(s.goal||0),0)/Math.max(state.subjects.length,1);if(Math.abs(g.minDailyHours*60-avgGoal)<60)return true;}return false;}).slice(0,4);
  const fallback=allGroups.filter(g=>!userGroupIds.has(g.id)).slice(0,4);const final=suggestions.length>=2?suggestions:fallback;
  if(!final.length){sec.style.display='none';return;}sec.style.display='block';
  grid.innerHTML=final.map(g=>{const onlineCount=g.members.filter(m=>isMemberOnline(m,g.id)).length;const photoHtml=g.photo?`<img src="${g.photo}" style="width:40px;height:40px;object-fit:cover;border-radius:12px">`:`<div style="width:40px;height:40px;border-radius:12px;background:${g.color||COLORS[0]};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.1rem">${g.name[0]}</div>`;return `<div class="group-card suggested-group-card" style="border-top:3px solid ${g.color||COLORS[0]}"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">${photoHtml}<div><div class="group-card-name">${escapeHtml(g.name)}</div><div style="font-size:0.72rem;color:var(--text-muted)">${toPersianNum(g.members.length)} عضو${g.minDailyHours?' · حداقل '+toPersianNum(g.minDailyHours)+'ساعت/روز':''}</div></div></div><div class="group-card-desc">${escapeHtml(g.description||'بدون توضیح')}</div><button class="btn btn-accent btn-sm" style="margin-top:8px;width:100%" onclick="joinSuggestedGroup('${g.id}')">پیوستن</button></div>`;}).join('');
}

function renderGroups(){
  const userGroups=getUserGroups(),grid=document.getElementById('groups-grid');if(!grid)return;
  if(!userGroups.length){grid.innerHTML='<div class="empty-state" style="grid-column:1/-1;padding:48px 0"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>هنوز عضو گروهی نیستید</span><span style="font-size:0.72rem">یک گروه بسازید یا با کد بپیوندید</span></div>';}
  else{grid.innerHTML=userGroups.map(g=>{const onlineCount=g.members.filter(m=>isMemberOnline(m,g.id)).length;const photoHtml=g.photo?`<div class="group-card-photo"><img src="${g.photo}"></div>`:`<div class="group-card-photo group-card-initial" style="background:${g.color||COLORS[0]}">${g.name[0]}</div>`;return `<div class="group-card" onclick="openGroupDetail('${g.id}')" style="border-right:4px solid ${g.color||'transparent'}">${photoHtml}<div class="group-card-info"><div class="group-card-name">${escapeHtml(g.name)}</div><div class="group-card-desc">${escapeHtml(g.description||'بدون توضیح')}</div>${g.minDailyHours?`<div style="font-size:0.68rem;color:var(--accent);margin-top:2px">حداقل ${toPersianNum(g.minDailyHours)} ساعت مطالعه روزانه</div>`:''}</div><div class="group-card-meta"><div class="group-card-members"><span class="group-online-dot"></span> ${toPersianNum(onlineCount)} آنلاین از ${toPersianNum(g.members.length)}</div><div class="group-card-code">${g.code}</div></div></div>`;}).join('');}
  renderSuggestedGroups();
}

function openGroupDetail(id){
  currentGroupId=id;chatReplyToId=null;chatEditId=null;activeChatMsgId=null;pendingFileData=null;
  document.getElementById('groups-list-view').style.display='none';document.getElementById('group-detail-view').style.display='block';
  document.querySelectorAll('.group-detail-tab').forEach((b,i)=>b.classList.toggle('active',i===0));
  document.getElementById('group-workspace-content').classList.add('active');document.getElementById('group-workspace-content').style.display='block';
  document.getElementById('group-achievements-content').style.display='none';
  const badge=document.getElementById('group-chat-notif');if(badge){badge.textContent='0';badge.style.display='none';}
  renderGroupDetail();
}
function closeGroupDetail(){currentGroupId=null;pendingFileData=null;document.getElementById('groups-list-view').style.display='block';document.getElementById('group-detail-view').style.display='none';renderGroups();}

function renderGroupDetail(){
  const groups=getGroups(),group=groups.find(g=>g.id===currentGroupId);if(!group){closeGroupDetail();return;}
  const ghPhoto=document.getElementById('group-detail-photo');
  if(ghPhoto){if(group.photo)ghPhoto.innerHTML=`<img src="${group.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:14px">`;else{ghPhoto.innerHTML=`<span style="font-size:1.5rem;font-weight:700;color:#fff">${group.name[0]}</span>`;ghPhoto.style.background=group.color||COLORS[0];}}
  document.getElementById('group-detail-name').textContent=group.name;
  document.getElementById('group-detail-code').textContent=group.code;
  document.getElementById('group-timer-display').textContent=timerRunning?(pomodoroActive?fmtClockDown(pomodoroRemaining):fmtClock(timerSecs)):'۰۰:۰۰:۰۰';
  document.getElementById('group-members-count').textContent=toPersianNum(group.members.length);
  const goalBanner=document.getElementById('group-goal-banner');const goalText=document.getElementById('group-goal-text');
  if(group.minDailyHours&&group.minDailyHours>0){goalBanner.style.display='flex';goalText.textContent=`هدف: حداقل ${toPersianNum(group.minDailyHours)} ساعت مطالعه روزانه`;}else if(goalBanner){goalBanner.style.display='none';}
  const settingsBtn=document.getElementById('group-settings-btn');if(settingsBtn)settingsBtn.style.display=isGroupOwnerOrAdmin(group,currentUser.username)?'':'none';
  const chatOverlay=document.getElementById('chat-disabled-overlay');const inputArea=document.getElementById('chat-input-area');
  if(group.chatEnabled===false){if(chatOverlay)chatOverlay.style.display='flex';if(inputArea){inputArea.style.opacity='0.3';inputArea.style.pointerEvents='none';}}else{if(chatOverlay)chatOverlay.style.display='none';if(inputArea){inputArea.style.opacity='1';inputArea.style.pointerEvents='auto';}}
  const membersList=document.getElementById('group-members-list');
  membersList.innerHTML=group.members.map(m=>{const online=isMemberOnline(m,group.id),studying=isMemberStudying(m);const users=getUsers(),u=users.find(x=>x.username===m);const dn=u?u.displayName:m;const col=u&&u.profile&&u.profile.avatarColor?u.profile.avatarColor:avatarColor(m);const photo=u&&u.profile&&u.profile.photo;const bio=u&&u.profile?u.profile.bio||'':'';const role=m===group.createdBy?'owner':((group.roles&&group.roles[m])||'member');return `<div class="group-member-row"><div class="group-member-avatar" style="background:${col}">${photo?'<img src="'+photo+'">':escapeHtml(dn[0])}</div><div class="group-member-info"><div class="group-member-name">${m===currentUser.username?escapeHtml(dn)+' (شما)':escapeHtml(dn)} <span class="group-member-role role-${role}">${role==='owner'?'مالک':role==='admin'?'مدیر':'عضو'}</span></div>${bio?`<div class="group-member-bio">${escapeHtml(bio)}</div>`:''}<div class="group-member-status-text">${studying?'در حال مطالعه':online?'آنلاین':'آفلاین'}</div></div><div class="group-member-online ${online?'on':'off'}"></div></div>`;}).join('');
  const timerMembers=document.getElementById('group-timer-members');
  timerMembers.innerHTML=group.members.filter(m=>isMemberOnline(m,group.id)).map(m=>{const studying=isMemberStudying(m);const dn=(getUsers().find(x=>x.username===m)||{}).displayName||m;return `<div class="group-member-status"><span class="status-dot ${studying||(m===currentUser.username&&timerRunning)?'studying':'online'}"></span>${escapeHtml(dn)}</div>`;}).join('');
  renderGroupChat();
}
const minHours = parseFloat(document.getElementById('new-group-goal').value) || 0;
const gmhEl = document.getElementById('group-edit-goal');
function handleNewGroupPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById('new-group-profile-preview');
    if (preview) {
      preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:12px">`;
    }
    // ذخیره موقت — هنگام createGroup استفاده می‌شود
    window._newGroupPhoto = e.target.result;
  };
  reader.readAsDataURL(file);
}


