/* ══════════════════════════════════════════
   TOAST & SOUND
══════════════════════════════════════════ */
function toast(msg,type='info'){if(settings&&!settings.notifications.enabled&&type!=='achievement')return;const c=document.getElementById('toast-container'),t=document.createElement('div');t.className=`toast ${type}`;t.innerHTML=`<div class="toast-dot"></div>${msg}`;c.appendChild(t);setTimeout(()=>{t.style.animation='toastOut 0.22s ease forwards';setTimeout(()=>t.remove(),230);},2600);}
function playSound(){if(!settings||!settings.timer.sound)return;try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.value=800;osc.type='sine';gain.gain.setValueAtTime(0.25,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.6);osc.start(ctx.currentTime);osc.stop(ctx.currentTime+0.6);}catch(e){}}
function playMessageSound(){if(!settings||settings.notifications.messageSound===false)return;try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const o1=ctx.createOscillator(),g1=ctx.createGain();o1.connect(g1);g1.connect(ctx.destination);o1.frequency.value=660;o1.type='sine';g1.gain.setValueAtTime(0.12,ctx.currentTime);g1.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.12);o1.start(ctx.currentTime);o1.stop(ctx.currentTime+0.12);const o2=ctx.createOscillator(),g2=ctx.createGain();o2.connect(g2);g2.connect(ctx.destination);o2.frequency.value=880;o2.type='sine';g2.gain.setValueAtTime(0.1,ctx.currentTime+0.08);g2.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.2);o2.start(ctx.currentTime+0.08);o2.stop(ctx.currentTime+0.2);}catch(e){}}
/* ══════════════════════════════════════════
   CLOSE AD POPUP (generic click handler)
══════════════════════════════════════════ */
function closeAdPopup(event) {
  if (event && event.target !== document.getElementById('ad-popup-modal')) return;
  dismissAdPopup();
}
