/* ══════════════════════════════════════════
   MISC
══════════════════════════════════════════ */
function clearTodayConfirm() {
  if (!confirm('داده‌های امروز پاک شوند؟')) return;
  state.sessions = (state.sessions || []).filter(function(s) {
    return s.date !== todayKey();
  });
  saveState();
  renderDashboard();
  toast('داده‌های امروز پاک شد', 'warn');
}

function renderSidebarUser() {
  if (!currentUser) return;

  var av = document.getElementById('sidebar-avatar');
  if (!av) {
    console.warn('[renderSidebarUser] #sidebar-avatar not found — sidebar may not be loaded yet');
    // تلاش مجدد بعد از ۵۰۰ میلی‌ثانیه
    setTimeout(function() {
      var retry = document.getElementById('sidebar-avatar');
      if (retry) renderSidebarUserInner(retry);
    }, 500);
    return;
  }
  renderSidebarUserInner(av);
}

function renderSidebarUserInner(av) {
  var p = currentUser.profile || {};
  if (p.photo) {
    av.innerHTML = '<img src="' + p.photo + '" style="width:30px;height:30px;border-radius:50%;object-fit:cover">';
    av.style.background = 'transparent';
    av.style.color = 'transparent';
  } else {
    av.style.background = p.avatarColor || avatarColor(currentUser.username);
    av.style.color = '#fff';
    av.textContent = (currentUser.displayName || currentUser.username)[0];
  }
  var uname = document.getElementById('sidebar-uname');
  if (uname) uname.textContent = currentUser.displayName || currentUser.username;
  var sdate = document.getElementById('sidebar-date');
  if (sdate) sdate.textContent = gregDate(new Date());
}
