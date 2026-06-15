/* ══════════════════════════════════════════
   ACHIEVEMENTS
══════════════════════════════════════════ */
let lastUnlocked=[];
function getAchievementsData(){
  const sessions=state.sessions||[];const dateSet=new Set(sessions.map(s=>s.date));let streak=0;
  if(sessions.length){const now=new Date();for(let i=0;i<365;i++){const d=new Date(now);d.setDate(d.getDate()-i);const key=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;if(dateSet.has(key))streak++;else if(i>0)break;}}
  const daily={};sessions.forEach(s=>{daily[s.date]=(daily[s.date]||0)+s.duration;});const maxDaily=Math.max(...Object.values(daily),0);
  const earlyBird=sessions.some(s=>{const t=new Date(s.start);return t.getHours()<6;});
  const nightOwl=sessions.some(s=>{const t=new Date(s.start);return t.getHours()>=0&&t.getHours()<4;});
  let maxMembers=0;getGroups().filter(g=>g.createdBy===currentUser.username).forEach(g=>{maxMembers=Math.max(maxMembers,g.members.length);});
  let perfectDays=0;[...dateSet].forEach(date=>{const daySec={};sessions.filter(s=>s.date===date).forEach(s=>{daySec[s.subjectId]=(daySec[s.subjectId]||0)+s.duration;});if(state.subjects.every(subj=>!subj.goal||subj.goal<=0||(daySec[subj.id]||0)>=subj.goal*60))perfectDays++;});
  const totalHrs=sessions.reduce((a,s)=>a+s.duration,0)/3600;
  let totalMsgs=0;getGroups().filter(g=>g.members.includes(currentUser.username)).forEach(g=>{(g.messages||[]).forEach(m=>{if(m.user===currentUser.username)totalMsgs++;});});
  return{'first-step':{unlocked:sessions.length>0,progress:Math.min(sessions.length,1),total:1},'streak':{unlocked:streak>=7,progress:Math.min(streak,7),total:7},'marathon':{unlocked:maxDaily>=14400,progress:maxDaily>=14400?1:0,total:1},'researcher':{unlocked:sessions.length>=100,progress:Math.min(sessions.length,100),total:100},'early-bird':{unlocked:earlyBird,progress:earlyBird?1:0,total:1},'night-owl':{unlocked:nightOwl,progress:nightOwl?1:0,total:1},'group-leader':{unlocked:maxMembers>=5,progress:Math.min(maxMembers,5),total:5},'perfectionist':{unlocked:perfectDays>=7,progress:Math.min(perfectDays,7),total:7},'legend':{unlocked:totalHrs>=1000,progress:Math.min(Math.floor(totalHrs),1000),total:1000},'team-player':{unlocked:totalMsgs>=100,progress:Math.min(totalMsgs,100),total:100}};
}
function renderAchievements(){
  const data=getAchievementsData();let unlocked=0;const labels={'streak':' روز','researcher':' جلسه','group-leader':' عضو','perfectionist':' روز','legend':' ساعت','team-player':' پیام'};
  Object.entries(data).forEach(([key,info])=>{const card=document.getElementById('ach-'+key);if(!card)return;card.classList.toggle('unlocked',info.unlocked);if(info.unlocked)unlocked++;if(info.total>1){const fill=card.querySelector('.achievement-progress-fill');const text=card.querySelector('.achievement-progress-text');if(fill)fill.style.width=Math.round(info.progress/info.total*100)+'%';if(text)text.textContent=toPersianNum(info.progress)+' از '+toPersianNum(info.total)+(labels[key]||'');}});
  const uEl=document.getElementById('achievements-unlocked-count');const tEl=document.getElementById('achievements-total-count');if(uEl)uEl.textContent=toPersianNum(unlocked);if(tEl)tEl.textContent='۱۰';
}
function checkAchievements(){const data=getAchievementsData();Object.entries(data).forEach(([key,info])=>{if(info.unlocked&&!lastUnlocked.includes(key)){lastUnlocked.push(key);const card=document.getElementById('ach-'+key);if(card){const title=card.querySelector('.achievement-title');if(title)toast(`دستاورد جدید: ${title.textContent}`,'achievement');card.classList.add('just-unlocked');setTimeout(()=>card.classList.remove('just-unlocked'),2000);}}});}
