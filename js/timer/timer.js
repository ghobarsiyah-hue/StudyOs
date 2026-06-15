/* ══════════════════════════════════════════
   TIMER STATE
══════════════════════════════════════════ */
let timerRunning=false,timerPaused=false,timerWallRef=null,timerAccumulated=0,timerSubjectId=null,timerStartTime=null,timerSecs=0,timerTickInterval=null;
function getElapsedMs(){if(!timerRunning)return 0;if(timerPaused)return timerAccumulated;return timerAccumulated+(Date.now()-timerWallRef);}

/* ══════════════════════════════════════════
   TIMER MODE SWITCH
══════════════════════════════════════════ */
function switchTimerMode(mode){
  if(timerRunning){toast('ابتدا تایمر فعلی را متوقف کنید','warn');return;}
  const isPomo=mode==='pomodoro';pomodoroActive=isPomo;
  document.getElementById('timer-mode-stopwatch').classList.toggle('active',!isPomo);
  document.getElementById('timer-mode-pomodoro').classList.toggle('active',isPomo);
  document.getElementById('timer-stopwatch-ui').style.display=isPomo?'none':'';
  document.getElementById('timer-pomodoro-ui').style.display=isPomo?'':'none';
  if(isPomo){resetPomodoro();syncPomodoroSubjectSelect();renderPomodoroSubjectList();}
}
function syncPomodoroSubjectSelect(){const normal=document.getElementById('subject-select');const pomo=document.getElementById('pomodoro-subject-select');if(!normal||!pomo)return;pomo.innerHTML=normal.innerHTML;if(normal.value)pomo.value=normal.value;}
function renderPomodoroSubjectList(){const src=document.getElementById('subject-list');const dst=document.getElementById('pomodoro-subject-list');if(src&&dst)dst.innerHTML=src.innerHTML;}

/* ══════════════════════════════════════════
   NORMAL TIMER
══════════════════════════════════════════ */
function updateTimerDisplay(){const ms=getElapsedMs();timerSecs=Math.floor(ms/1000);if(pomodoroActive){pomodoroTick();return;}const display=fmtClock(timerSecs);document.getElementById('timer-display').textContent=display;const badge=document.getElementById('topbar-timer-badge');const badgeTime=document.getElementById('topbar-timer-time');if(timerRunning){badge.classList.add('visible');badgeTime.textContent=display;}else badge.classList.remove('visible');const gtd=document.getElementById('group-timer-display');if(gtd&&currentGroupId)gtd.textContent=display;}
function startTimerTick(){if(timerTickInterval)clearInterval(timerTickInterval);timerTickInterval=setInterval(()=>{if(timerRunning&&!timerPaused)updateTimerDisplay();},200);}
function stopTimerTick(){if(timerTickInterval){clearInterval(timerTickInterval);timerTickInterval=null;}}

function timerStart(){
  if(pomodoroActive){pomodoroStart();return;}
  const sel=document.getElementById('subject-select');if(!sel.value){toast('یک درس انتخاب کن','warn');return;}
  timerSubjectId=sel.value;timerStartTime=new Date();timerWallRef=Date.now();timerAccumulated=0;timerRunning=true;timerPaused=false;
  const subj=state.subjects.find(s=>s.id===timerSubjectId);
  document.getElementById('timer-sub-label').textContent=subj?`در حال مطالعه: ${subj.name}`:'';
  document.getElementById('timer-card').classList.add('running');
  show('btn-start',false);show('btn-pause',true);show('btn-stop',true);show('btn-resume',false);
  startTimerTick();updateExitWarning();toast(`تایمر برای ${subj?.name||''} شروع شد`,'success');
}
function timerPause(){if(pomodoroActive){pomodoroPause();return;}timerAccumulated+=Date.now()-timerWallRef;timerPaused=true;document.getElementById('timer-card').classList.remove('running');show('btn-pause',false);show('btn-resume',true);updateExitWarning();toast('تایمر متوقف شد','info');}
function timerResume(){if(pomodoroActive){pomodoroResume();return;}timerWallRef=Date.now();timerPaused=false;document.getElementById('timer-card').classList.add('running');show('btn-pause',true);show('btn-resume',false);updateExitWarning();toast('تایمر ادامه یافت','success');}
function timerStop(){
  if(pomodoroActive){pomodoroStop();return;}
  const elapsedSec=Math.floor(getElapsedMs()/1000);stopTimerTick();
  if(elapsedSec<10){toast('جلسه خیلی کوتاه بود — ثبت نشد','warn');timerReset();return;}
  const subj=state.subjects.find(s=>s.id===timerSubjectId);
  state.sessions.push({id:uid(),subjectId:timerSubjectId,subjectName:subj?.name||'—',color:subj?.color||'#888',start:timerStartTime.toISOString(),end:new Date().toISOString(),duration:elapsedSec,date:todayKey()});
  saveState();playSound();toast(`${fmtHM(elapsedSec)} برای ${subj?.name||''} ثبت شد`,'success');
  timerReset();renderSubjectList();renderDashboardStats();drawPie();drawWeekBars();checkAchievements();
}
function timerReset(){
  stopTimerTick();timerRunning=false;timerPaused=false;timerWallRef=null;timerAccumulated=0;timerSecs=0;timerSubjectId=null;
  document.getElementById('timer-display').textContent='۰۰:۰۰:۰۰';document.getElementById('timer-sub-label').textContent='';
  document.getElementById('timer-card').classList.remove('running');
  show('btn-start',true);show('btn-pause',false);show('btn-stop',false);show('btn-resume',false);
  document.getElementById('topbar-timer-badge').classList.remove('visible');updateExitWarning();
}

/* ══════════════════════════════════════════
   EXIT WARNING & VISIBILITY
══════════════════════════════════════════ */
function updateExitWarning(){const b=document.getElementById('exit-warning');if(b){if(timerRunning&&!timerPaused)b.classList.add('visible');else b.classList.remove('visible');}}
window.addEventListener('beforeunload',e=>{if(timerRunning&&!timerPaused){e.preventDefault();e.returnValue='';}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&timerRunning)updateTimerDisplay();});
