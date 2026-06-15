/* ══════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════ */
const PAGE_LABELS={dashboard:'داشبورد',stats:'آمار و تحلیل',tools:'ابزارها',groups:'گروه‌ها',settings:'تنظیمات'};
function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const page=document.getElementById('page-'+name);if(page)page.classList.add('active');
  document.querySelectorAll('.nav-item,.mob-btn').forEach(b=>b.classList.remove('active'));
  const nb=document.querySelector(`.nav-item[data-page="${name}"]`);if(nb)nb.classList.add('active');
  const mb=document.getElementById('mob-'+name);if(mb)mb.classList.add('active');
  document.getElementById('topbar-title').textContent=PAGE_LABELS[name]||'';
  switch(name){
    case'dashboard':renderDashboard();break;
    case'stats':renderStats('today');renderTasks();break;
    case'tools':closeTool();break;
    case'groups':if(currentGroupId)renderGroupDetail();else renderGroups();break;
    case'settings':renderSettings();renderProfile();break;
  }
}
