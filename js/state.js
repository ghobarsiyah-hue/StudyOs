/* ══════════════════════════════════════════
   PER-USER STATE
══════════════════════════════════════════ */
let state=null;
function stateKey(){return `studyos_state_${currentUser.username}`;}
function loadState(){const raw=localStorage.getItem(stateKey());if(raw){const s=JSON.parse(raw);if(!s.gpaCourses)s.gpaCourses=[];if(!s.tasks)s.tasks={todo:[],done:[]};return s;}return{subjects:DEFAULT_SUBJECTS.map((s,i)=>({id:'subj_'+i,name:s.name,color:s.color,category:s.cat,goal:s.goal})),sessions:[],tasks:{todo:[],done:[]},gpaCourses:[]};}
function saveState(){localStorage.setItem(stateKey(),JSON.stringify(state));}
