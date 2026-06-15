/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function toPersianNum(s){return String(s).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);}
function todayKey(){const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}
function fmtHM(s){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);if(h===0&&m===0)return 'کمتر از ۱ دقیقه';if(h===0)return toPersianNum(m)+' دقیقه';if(m===0)return toPersianNum(h)+' ساعت';return toPersianNum(h)+' ساعت و '+toPersianNum(m)+' دقیقه';}
function fmtClock(s){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;const pad=n=>String(n).padStart(2,'0');return toPersianNum(pad(h)+':'+pad(m)+':'+pad(sec));}
function fmtClockDown(s){if(s<=0)return '۰۰:۰۰:۰۰';return fmtClock(s);}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,5);}
function escapeHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function persianDayName(d){const ir=['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'];return ir[d.getDay()];}
function gregDate(d){const mo=['ژانویه','فوریه','مارس','آوریل','مه','ژوئن','ژوئیه','اوت','سپتامبر','اکتبر','نوامبر','دسامبر'];return `${persianDayName(d)}، ${d.getDate()} ${mo[d.getMonth()]}`;}
function getTodaySecs(sid){const k=todayKey();return(state.sessions||[]).filter(s=>s.subjectId===sid&&s.date===k).reduce((a,s)=>a+s.duration,0);}
function lightenColor(hex,pct){let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.min(255,Math.round(r+(255-r)*pct/100));g=Math.min(255,Math.round(g+(255-g)*pct/100));b=Math.min(255,Math.round(b+(255-b)*pct/100));return '#'+[r,g,b].map(c=>c.toString(16).padStart(2,'0')).join('');}
function avatarColor(name){const p=['#6C5CE7','#00CEC9','#E17055','#FD79A8','#FDCB6E','#0984E3'];let h=0;for(let c of name)h=(h*31+c.charCodeAt(0))&0xFFFFFF;return p[Math.abs(h)%p.length];}
function hashPass(p){let h=0;for(let i=0;i<p.length;i++){h=((h<<5)-h)+p.charCodeAt(i);h|=0;}return String(h);}
function getReactionIcon(type){return REACTION_ICONS[type]||'';}
function isMobileDevice(){return window.innerWidth<=600;}
function loadFont(fontObj){if(!fontObj||!fontObj.url)return;if(document.querySelector(`link[href="${fontObj.url}"]`))return;const link=document.createElement('link');link.rel='stylesheet';link.href=fontObj.url;document.head.appendChild(link);}
function applyFont(fontName){if(!fontName)fontName='Vazirmatn';document.documentElement.style.setProperty('--font-main',`'${fontName}', -apple-system, sans-serif`);document.body.style.fontFamily=`var(--font-main)`;}
function show(id,v){const el=document.getElementById(id);if(el)el.style.display=v?'':'none';}
