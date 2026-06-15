/* ══════════════════════════════════════════
   PARTIALS LOADER — WITH DIAGNOSTICS
══════════════════════════════════════════ */
const HTML_PARTIALS = [
  { url: 'html/auth.html',           target: 'auth-screen' },
  { url: 'html/sidebar.html',        target: 'sidebar-container' },
  { url: 'html/page-dashboard.html', target: 'page-dashboard' },
  { url: 'html/page-stats.html',     target: 'page-stats' },
  { url: 'html/page-tools.html',     target: 'page-tools' },
  { url: 'html/page-groups.html',    target: 'page-groups' },
  { url: 'html/page-settings.html',  target: 'page-settings' },
  { url: 'html/mobile-nav.html',     target: 'mobile-nav-container' },
  { url: 'html/modals.html',         target: 'modals-container' },
];

window._partialsReady = (async function loadPartials() {
  const failed = [];
  const ok = [];

  for (const { url, target } of HTML_PARTIALS) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        failed.push({ url, target, err: 'HTTP ' + res.status });
        console.error('[Partial FAIL]', url, '→', res.status);
        continue;
      }
      const html = await res.text();
      const el = document.getElementById(target);
      if (!el) {
        failed.push({ url, target, err: '#' + target + ' not in DOM' });
        console.error('[Partial FAIL] #' + target + ' not found');
        continue;
      }
      el.innerHTML = html;
      ok.push(url);
      console.log('[Partial OK]', url, '(' + html.length + ' chars)');
    } catch (e) {
      failed.push({ url, target, err: e.message });
      console.error('[Partial ERR]', url, e.message);
    }
  }

  console.log('[Partials]', ok.length + '/' + HTML_PARTIALS.length, 'loaded');

  if (failed.length > 0) {
    var b = document.createElement('div');
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;' +
      'background:#c0392b;color:#fff;padding:14px 20px;font-family:monospace;' +
      'font-size:13px;direction:ltr;text-align:left;line-height:1.8;' +
      'box-shadow:0 4px 20px rgba(0,0,0,0.5)';
    b.innerHTML = '<b>⚠ Partial Load Errors (' + failed.length + ')</b><br>' +
      failed.map(function(f) { return '• ' + f.url + ' → ' + f.err; }).join('<br>') +
      '<br><small>Make sure all files exist inside /html/ folder.</small>';
    document.body.appendChild(b);
  }

  document.body.classList.add('partials-loaded');
  return failed.length === 0;
})();
