/* ══════════════════════════════════════════
   POMODORO
══════════════════════════════════════════ */
let pomodoroActive=false,pomodoroPhase='work',pomodoroSessionCount=0,pomodoroTotalSeconds=0,pomodoroRemaining=0,pomodoroFocusTotal=0,pomodoroBreakTotal=0;

function resetPomodoro(){const pd=settings.pomodoro;pomodoroPhase='work';pomodoroSessionCount=0;pomodoroFocusTotal=0;pomodoroBreakTotal=0;pomodoroTotalSeconds=pd.workDuration*60;pomodoroRemaining=pomodoroTotalSeconds;updatePomodoroDisplay();updatePomodoroRing();updatePomodoroPhaseUI();renderPomodoroDots();updatePomodoroStats();show('pomo-btn-start',true);show('pomo-btn-pause',false);show('pomo-btn-resume',false);show('pomo-btn-stop',false);show('pomo-btn-skip',false);const card=document.getElementById('pomodoro-card');if(card){card.classList.remove('running','break-mode');card.classList.add('work-mode');}document.getElementById('pomodoro-sub-label').textContent='';}
function updatePomodoroDisplay(){const m=Math.floor(pomodoroRemaining/60),s=pomodoroRemaining%60;const timeStr=toPersianNum(String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'));const el=document.getElementById('pomodoro-timer-display');if(el)el.textContent=timeStr;const phaseEl=document.getElementById('pomodoro-phase-label');if(phaseEl){const labels={work:'جلسه کاری',shortBreak:'استراحت کوتاه',longBreak:'استراحت بلند'};phaseEl.textContent=labels[pomodoroPhase]||'';}const sessEl=document.getElementById('pomodoro-session-display');if(sessEl){const pd=settings.pomodoro;sessEl.textContent=`جلسه ${toPersianNum(pomodoroSessionCount+1)} از ${toPersianNum(pd.sessionsBeforeLong)}`;}const badge=document.getElementById('topbar-timer-badge');const badgeTime=document.getElementById('topbar-timer-time');if(timerRunning&&pomodoroActive){badge.classList.add('visible');badgeTime.textContent=timeStr;}const gtd=document.getElementById('group-timer-display');if(gtd&&currentGroupId)gtd.textContent=timeStr;}
function updatePomodoroRing(){const fill=document.getElementById('pomodoro-ring-fill');if(!fill||pomodoroTotalSeconds<=0)return;const progress=(pomodoroTotalSeconds-pomodoroRemaining)/pomodoroTotalSeconds;fill.style.strokeDashoffset=POMO_CIRCUMFERENCE*(1-progress);fill.style.stroke=pomodoroPhase==='work'?'var(--accent)':pomodoroPhase==='shortBreak'?'#00B894':'#0984E3';}
function updatePomodoroPhaseUI(){['pomodoro-phase-work','pomodoro-phase-shortBreak','pomodoro-phase-longBreak'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('active-phase');});const activeId=pomodoroPhase==='work'?'pomodoro-phase-work':pomodoroPhase==='shortBreak'?'pomodoro-phase-shortBreak':'pomodoro-phase-longBreak';const activeEl=document.getElementById(activeId);if(activeEl)activeEl.classList.add('active-phase');const card=document.getElementById('pomodoro-card');if(card){card.classList.toggle('work-mode',pomodoroPhase==='work');card.classList.toggle('break-mode',pomodoroPhase!=='work');}}
function renderPomodoroDots(){const container=document.getElementById('pomodoro-phase-dots');if(!container)return;const total=settings.pomodoro.sessionsBeforeLong;let html='';for(let i=0;i<total;i++){const isDone=i<pomodoroSessionCount;const isCurrent=i===pomodoroSessionCount&&pomodoroPhase==='work';html+=`<span class="pomo-dot ${isDone?'done':''} ${isCurrent?'current':''}"></span>`;}container.innerHTML=html;}
function updatePomodoroStats(){const seEl=document.getElementById('pomo-sessions-done');if(seEl)seEl.textContent=toPersianNum(pomodoroSessionCount);const tfEl=document.getElementById('pomo-total-focus');if(tfEl)tfEl.textContent=pomodoroFocusTotal>0?fmtHM(pomodoroFocusTotal):'۰ دقیقه';const tbEl=document.getElementById('pomo-total-break');if(tbEl)tbEl.textContent=pomodoroBreakTotal>0?fmtHM(pomodoroBreakTotal):'۰ دقیقه';}

function pomodoroStart(){
  if(timerRunning){toast('تایمر در حال اجراست','warn');return;}
  const sel=document.getElementById('pomodoro-subject-select');if(!sel||!sel.value){toast('یک درس انتخاب کنید','warn');return;}
  timerSubjectId=sel.value;timerStartTime=new Date();
  const pd=settings.pomodoro;pomodoroPhase='work';pomodoroSessionCount=0;pomodoroFocusTotal=0;pomodoroBreakTotal=0;
  pomodoroTotalSeconds=pd.workDuration*60;pomodoroRemaining=pomodoroTotalSeconds;
  timerRunning=true;timerPaused=false;timerWallRef=Date.now();timerAccumulated=0;
  const subj=state.subjects.find(s=>s.id===timerSubjectId);
  document.getElementById('pomodoro-sub-label').textContent=subj?`مطالعه: ${subj.name}`:'';
  const card=document.getElementById('pomodoro-card');if(card){card.classList.add('running','work-mode');card.classList.remove('break-mode');}
  show('pomo-btn-start',false);show('pomo-btn-pause',true);show('pomo-btn-stop',true);show('pomo-btn-skip',false);show('pomo-btn-resume',false);
  startTimerTick();updateExitWarning();updatePomodoroPhaseUI();renderPomodoroDots();
  toast(`پومودورو شروع: مطالعه ${toPersianNum(pd.workDuration)} دقیقه`,'success');
}
function pomodoroPause(){timerAccumulated+=Date.now()-timerWallRef;timerPaused=true;document.getElementById('pomodoro-card').classList.remove('running');show('pomo-btn-pause',false);show('pomo-btn-resume',true);updateExitWarning();toast('پومودورو متوقف شد','info');}
function pomodoroResume(){timerWallRef=Date.now();timerPaused=false;document.getElementById('pomodoro-card').classList.add('running');show('pomo-btn-pause',true);show('pomo-btn-resume',false);updateExitWarning();toast('پومودورو ادامه یافت','success');}
function pomodoroStop(){
  const elapsedSec=Math.floor(getElapsedMs()/1000);stopTimerTick();
  if(pomodoroPhase==='work')pomodoroFocusTotal+=elapsedSec;else pomodoroBreakTotal+=elapsedSec;
  if(elapsedSec>=10){const subj=state.subjects.find(s=>s.id===timerSubjectId);state.sessions.push({id:uid(),subjectId:timerSubjectId,subjectName:subj?.name||'—',color:subj?.color||'#888',start:timerStartTime.toISOString(),end:new Date().toISOString(),duration:elapsedSec,date:todayKey()});saveState();playSound();toast(`${fmtHM(elapsedSec)} مطالعه ثبت شد`,'success');renderSubjectList();renderDashboardStats();drawPie();drawWeekBars();checkAchievements();}
  resetPomodoroFull();
}
function pomodoroSkip(){if(!timerRunning||timerPaused)return;onPomodoroPhaseEnd();toast('رد شد','info');}
function resetPomodoroFull(){stopTimerTick();timerRunning=false;timerPaused=false;timerWallRef=null;timerAccumulated=0;timerSecs=0;timerSubjectId=null;const card=document.getElementById('pomodoro-card');if(card)card.classList.remove('running','work-mode','break-mode');show('pomo-btn-start',true);show('pomo-btn-pause',false);show('pomo-btn-stop',false);show('pomo-btn-resume',false);show('pomo-btn-skip',false);document.getElementById('pomodoro-sub-label').textContent='';document.getElementById('topbar-timer-badge').classList.remove('visible');resetPomodoro();updateExitWarning();}
function pomodoroTick(){if(!timerRunning||timerPaused||!pomodoroActive)return;const elapsed=Math.floor(getElapsedMs()/1000);pomodoroRemaining=Math.max(0,pomodoroTotalSeconds-elapsed);updatePomodoroDisplay();updatePomodoroRing();if(pomodoroRemaining<=0)onPomodoroPhaseEnd();}
function onPomodoroPhaseEnd(){
  const pd=settings.pomodoro;
  if(pomodoroPhase==='work'){
    pomodoroSessionCount++;pomodoroFocusTotal+=pd.workDuration*60;
    const subj=state.subjects.find(s=>s.id===timerSubjectId);
    state.sessions.push({id:uid(),subjectId:timerSubjectId,subjectName:subj?.name||'—',color:subj?.color||'#888',start:new Date(Date.now()-pd.workDuration*60000).toISOString(),end:new Date().toISOString(),duration:pd.workDuration*60,date:todayKey()});
    saveState();playSound();renderSubjectList();renderDashboardStats();drawPie();drawWeekBars();checkAchievements();
    if(pomodoroSessionCount>=pd.sessionsBeforeLong){pomodoroPhase='longBreak';pomodoroTotalSeconds=pd.longBreak*60;toast(`استراحت بلند: ${toPersianNum(pd.longBreak)} دقیقه`,'achievement');}
    else{pomodoroPhase='shortBreak';pomodoroTotalSeconds=pd.shortBreak*60;toast(`استراحت: ${toPersianNum(pd.shortBreak)} دقیقه`,'info');}
  }else{
    pomodoroBreakTotal+=pomodoroTotalSeconds;playSound();
    if(pomodoroPhase==='longBreak')pomodoroSessionCount=0;
    pomodoroPhase='work';pomodoroTotalSeconds=pd.workDuration*60;toast('زمان مطالعه شروع شد!','success');
  }
  pomodoroRemaining=pomodoroTotalSeconds;timerWallRef=Date.now();timerAccumulated=0;
  updatePomodoroPhaseUI();updatePomodoroDisplay();updatePomodoroRing();renderPomodoroDots();updatePomodoroStats();
  const shouldAuto=pomodoroPhase==='work'?pd.autoStartWork:pd.autoStartBreak;
  if(!shouldAuto){timerPaused=true;show('pomo-btn-pause',false);show('pomo-btn-resume',true);document.getElementById('pomodoro-card')?.classList.remove('running');}
  show('pomo-btn-skip',pomodoroPhase!=='work');
}
