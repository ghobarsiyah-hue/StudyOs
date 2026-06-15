/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const COLORS = ['#6C5CE7','#00CEC9','#FDCB6E','#E17055','#FD79A8','#0984E3','#00B894','#E84393','#74B9FF','#A29BFE','#55EFC4','#FAB1A0','#FF7675','#81ECEC','#DFE6E9'];
const ACCENT_COLORS = ['#6C5CE7','#0984E3','#00CEC9','#00B894','#FDCB6E','#E17055','#FD79A8','#E84393','#A29BFE','#74B9FF','#55EFC4','#FF7675'];
const DEFAULT_SUBJECTS = [
  {name:'آناتومی',color:'#0984E3',cat:'علوم پایه پزشکی',goal:90},
  {name:'فیزیولوژی',color:'#6C5CE7',cat:'علوم پایه پزشکی',goal:90},
  {name:'بیوشیمی',color:'#00CEC9',cat:'علوم پایه پزشکی',goal:75},
  {name:'پاتولوژی',color:'#E17055',cat:'علوم بالینی',goal:60},
  {name:'فارماکولوژی',color:'#FD79A8',cat:'علوم دارویی',goal:60},
  {name:'میکروب‌شناسی',color:'#FDCB6E',cat:'علوم آزمایشگاهی',goal:45},
  {name:'ایمنی‌شناسی',color:'#00B894',cat:'علوم پایه پزشکی',goal:45},
  {name:'زبان تخصصی',color:'#A29BFE',cat:'زبان تخصصی',goal:60},
];
const REACTION_ICONS = {
  like:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>',
  heart:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  think:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/></svg>',
  celebrate:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  question:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
};
const FONT_OPTIONS = [
  {name:'Vazirmatn',label:'وزیرمتن',url:'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap'},
  {name:'Shabnam',label:'شبنم',url:'https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@v5.0.1/dist/font-face.css'},
  {name:'Sahel',label:'ساحل',url:'https://cdn.jsdelivr.net/gh/rastikerdar/sahel-font@v3.4.0/dist/font-face.css'},
  {name:'Samim',label:'صمیم',url:'https://cdn.jsdelivr.net/gh/rastikerdar/samim-font@v1.0.5/dist/font-face.css'},
  {name:'Tanha',label:'تنهـــا',url:'https://cdn.jsdelivr.net/gh/rastikerdar/tanha-font@v1.0.0/dist/font-face.css'},
  {name:'Yekan',label:'یکان‌بخ',url:'https://cdn.jsdelivr.net/gh/rastikerdar/yekan-font@v1.0.2/dist/font-face.css'},
];
const POMO_CIRCUMFERENCE = 502.65;
