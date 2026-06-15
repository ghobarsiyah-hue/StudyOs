/* ══════════════════════════════════════════
   SAFE CALL HELPER
══════════════════════════════════════════ */
function safeCall(fn, name) {
  try { fn(); }
  catch (e) { console.error('[INIT FAIL]', name, e); }
}
function safeEl(id) { return document.getElementById(id); }

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
function initApp() {
  state = loadState();
  loadSettings();
  applySettings();

  safeCall(renderSidebarUser, 'renderSidebarUser');

  var lp = safeEl('login-password');
  if (lp) lp.onkeydown = function(e) { if (e.key === 'Enter') doLogin(); };
  var rp = safeEl('reg-password2');
  if (rp) rp.onkeydown = function(e) { if (e.key === 'Enter') doRegister(); };

  var fontObj = typeof FONT_OPTIONS !== 'undefined'
    ? FONT_OPTIONS.find(function(f) { return f.name === settings.font; })
    : null;
  if (fontObj) loadFont(fontObj);
  applyFont(settings.font);

  pomodoroActive = false;

  safeCall(renderSubjectSelect,  'renderSubjectSelect');
  safeCall(renderSubjectList,    'renderSubjectList');
  safeCall(renderTaskSubjectTags,'renderTaskSubjectTags');
  safeCall(renderDashboardStats, 'renderDashboardStats');
  safeCall(drawPie,              'drawPie');
  safeCall(drawWeekBars,         'drawWeekBars');
  safeCall(renderAdVisibility,   'renderAdVisibility');
safeCall(renderGroupsList, 'renderGroupsList');
safeCall(renderSuggestedGroups, 'renderSuggestedGroups');
safeCall(renderSubjectSelect, 'renderSubjectSelect');


  showPage('dashboard');

  lastUnlocked = [];
  try {
    var data = getAchievementsData();
    Object.entries(data).forEach(function(pair) {
      if (pair[1].unlocked) lastUnlocked.push(pair[0]);
    });
  } catch (e) { console.error('[INIT] achievements:', e); }

  setTimeout(function() {
    var c = safeEl('group-chat-messages');
    if (c) c.scrollTop = c.scrollHeight;
  }, 300);
}

document.addEventListener('DOMContentLoaded', async function() {
  await window._partialsReady;

  try { renderQuickLogin(); }
  catch (e) { console.error('[INIT] renderQuickLogin:', e); }

  var saved = localStorage.getItem('studyos_current_user');
  if (saved) {
    var users = getUsers();
    var u = users ? users.find(function(x) { return x.username === saved; }) : null;
    if (u) { loginAs(u); return; }
  }

  var lu = safeEl('login-username');
  if (lu) {
    lu.onkeydown = function(e) {
      if (e.key === 'Enter') {
        var pw = safeEl('login-password');
        if (pw) pw.focus();
      }
    };
  }
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
  if (settings && settings.theme === 'auto') applySettings();
});

window.addEventListener('resize', function() {
  var am = safeEl('attachment-menu');
  if (am && am.style.display !== 'none')
    am.classList.toggle('attachment-menu-mobile', isMobileDevice());
});
