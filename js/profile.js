/* ══════════════════════════════════════════
   PROFILE
══════════════════════════════════════════ */
function renderProfile(){
  if(!currentUser)return;const p=currentUser.profile||{};
  const av=document.getElementById('profile-avatar-large');if(av){av.style.background=p.avatarColor||avatarColor(currentUser.username);if(p.photo){av.innerHTML=`<img src="${p.photo}">`;}else{av.textContent=(currentUser.displayName||currentUser.username)[0];av.style.color='#fff';}}
  const el=(id,prop,val)=>{const e=document.getElementById(id);if(e)e[prop]=val;};
  el('profile-display-name','textContent',currentUser.displayName||currentUser.username);
  el('profile-username-display','textContent','@'+currentUser.username);
  el('profile-field-display','textContent',p.field||'');
  el('profile-bio-display','textContent',p.bio||'بیوگرافی ثبت نشده');
  el('profile-name-input','value',currentUser.displayName||'');
  el('profile-email-input','value',p.email||'');
  el('profile-field-input','value',p.field||'پزشکی عمومی');
  el('profile-bio-input','value',p.bio||'');
  if(state){const sessions=state.sessions||[];const totalSec=sessions.reduce((a,s)=>a+s.duration,0);el('profile-total-sessions','textContent',toPersianNum(sessions.length));el('profile-total-hours','textContent',Math.floor(totalSec/3600)+'h');el('profile-total-subjects','textContent',toPersianNum((state.subjects||[]).length));el('profile-joined-groups','textContent',toPersianNum(getUserGroups().length));}
}
function saveProfile(){
  if(!currentUser)return;const users=getUsers();const user=users.find(u=>u.username===currentUser.username);if(!user)return;
  user.displayName=document.getElementById('profile-name-input').value.trim()||user.username;
  if(!user.profile)user.profile={};
  user.profile.email=document.getElementById('profile-email-input').value.trim();
  user.profile.field=document.getElementById('profile-field-input').value;
  user.profile.bio=document.getElementById('profile-bio-input').value.trim();
  saveUsers(users);currentUser=user;renderSidebarUser();renderProfile();toast('پروفایل ذخیره شد','success');
}
function handleProfilePhoto(event){
  const file=event.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=function(e){
    const img=new Image();img.onload=function(){
      const canvas=document.createElement('canvas');const size=128;canvas.width=size;canvas.height=size;
      const ctx=canvas.getContext('2d');const min=Math.min(img.width,img.height);
      const sx=(img.width-min)/2,sy=(img.height-min)/2;
      ctx.drawImage(img,sx,sy,min,min,0,0,size,size);
      const dataUrl=canvas.toDataURL('image/jpeg',0.8);
      const users=getUsers();const user=users.find(u=>u.username===currentUser.username);
      if(user){if(!user.profile)user.profile={};user.profile.photo=dataUrl;saveUsers(users);currentUser=user;renderProfile();renderSidebarUser();toast('عکس پروفایل به‌روزرسانی شد','success');}
    };img.src=e.target.result;
  };reader.readAsDataURL(file);
}
function getUserBio(username){const users=getUsers(),u=users.find(x=>x.username===username);return(u&&u.profile)?u.profile.bio||'':'';}
