/* ══════════════════════════════════════════
   AUTH STATE
══════════════════════════════════════════ */
let currentUser=null;
function getUsers(){return JSON.parse(localStorage.getItem('studyos_users')||'[]');}
function saveUsers(u){localStorage.setItem('studyos_users',JSON.stringify(u));}

function renderQuickLogin(){
  const users=getUsers(),sec=document.getElementById('quick-login-section'),list=document.getElementById('quick-login-list');
  if(!sec||!list)return;
  if(!users.length){sec.style.display='none';return;}
  sec.style.display='block';
  list.innerHTML=users.map(u=>`<div class="auth-user-chip" onclick="quickLogin('${u.username}')"><div class="auth-avatar" style="background:${avatarColor(u.username)};color:#fff">${u.profile&&u.profile.photo?'<img src="'+u.profile.photo+'">':(u.displayName||u.username)[0]}</div><span class="auth-user-name">${escapeHtml(u.displayName||u.username)}</span><span style="font-size:0.74rem;color:var(--text-muted)">@${escapeHtml(u.username)}</span></div>`).join('');
}
function switchAuthTab(tab){document.querySelectorAll('.auth-tab').forEach((b,i)=>b.classList.toggle('active',(tab==='login'&&i===0)||(tab==='register'&&i===1)));document.getElementById('auth-login-form').style.display=tab==='login'?'block':'none';document.getElementById('auth-register-form').style.display=tab==='register'?'block':'none';document.getElementById('auth-error').classList.remove('show');}
function showAuthError(msg){const el=document.getElementById('auth-error');el.textContent=msg;el.classList.add('show');}
function doLogin(){const u=document.getElementById('login-username').value.trim(),p=document.getElementById('login-password').value;const users=getUsers(),user=users.find(x=>x.username===u);if(!user){showAuthError('کاربری با این نام یافت نشد');return;}if(user.password!==hashPass(p)){showAuthError('رمز عبور اشتباه است');return;}loginAs(user);}
function quickLogin(username){const user=getUsers().find(x=>x.username===username);if(user)loginAs(user);}
function doRegister(){const u=document.getElementById('reg-username').value.trim(),dn=document.getElementById('reg-displayname').value.trim();const p=document.getElementById('reg-password').value,p2=document.getElementById('reg-password2').value;if(!u){showAuthError('نام کاربری را وارد کنید');return;}if(!/^[a-zA-Z0-9_\u0600-\u06FF]{2,20}$/.test(u)){showAuthError('نام کاربری باید ۲ تا ۲۰ کاراکتر باشد');return;}if(p.length<4){showAuthError('رمز عبور باید حداقل ۴ کاراکتر باشد');return;}if(p!==p2){showAuthError('رمز عبور با تکرارش یکی نیست');return;}const users=getUsers();if(users.find(x=>x.username===u)){showAuthError('این نام کاربری قبلاً استفاده شده');return;}const newUser={username:u,displayName:dn||u,password:hashPass(p),createdAt:Date.now(),profile:{email:'',field:'پزشکی عمومی',bio:'',photo:null,avatarColor:avatarColor(u)}};users.push(newUser);saveUsers(users);loginAs(newUser);}
function loginAs(user){currentUser=user;if(!user.profile)user.profile={email:'',field:'پزشکی عمومی',bio:'',photo:null,avatarColor:avatarColor(user.username)};localStorage.setItem('studyos_current_user',user.username);document.getElementById('auth-screen').style.display='none';document.getElementById('app-screen').classList.add('visible');initApp();}
function doLogout(){if(timerRunning){toast('ابتدا تایمر را متوقف کنید','warn');return;}if(!confirm('از حساب خارج شوید؟'))return;if(window._voiceAudio){window._voiceAudio.pause();window._voiceAudio=null;}currentUser=null;localStorage.removeItem('studyos_current_user');document.getElementById('app-screen').classList.remove('visible');document.getElementById('auth-screen').style.display='flex';renderQuickLogin();}
