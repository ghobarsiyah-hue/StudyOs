/* ══════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════ */
let settings = null;

function settingsKey() {
  return `studyos_settings_${currentUser.username}`;
}

function defaultSettings() {
  return {
    theme: 'dark',
    accentColor: '#6C5CE7',
    font: 'Vazirmatn',
    ui: { density: 'normal', animations: true },
    timer: { autoPause: false, autoResume: false, sound: true },
    notifications: {
      enabled: true,
      sound: true,
      messageSound: true,
      style: 'toast',
      groupChatNotif: true
    },
    pomodoro: {
      enabled: false,
      workDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      sessionsBeforeLong: 4,
      autoStartBreak: true,
      autoStartWork: false,
      sound: true
    },
    isPremium: false,
    adsDismissedUntil: 0
  };
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      out[key] = deepMerge(target[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      out[key] = source[key];
    }
  }
  return out;
}

function loadSettings() {
  const raw = localStorage.getItem(settingsKey());
  const defaults = defaultSettings();
  if (raw) {
    const saved = JSON.parse(raw);
    settings = deepMerge(defaults, saved);
  } else {
    settings = defaults;
  }
}

function saveSettings() {
  localStorage.setItem(settingsKey(), JSON.stringify(settings));
}

function applySettings() {
  if (settings.theme === 'auto') {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }

  document.documentElement.style.setProperty('--accent', settings.accentColor);
  document.documentElement.style.setProperty('--accent-light', lightenColor(settings.accentColor, 18));
  document.documentElement.style.setProperty('--accent-glow', settings.accentColor + '38');
  document.documentElement.setAttribute('data-density', settings.ui.density);
  document.documentElement.setAttribute('data-animations', settings.ui.animations ? 'on' : 'off');

  applyFont(settings.font);
  const fontObj = FONT_OPTIONS.find(f => f.name === settings.font);
  if (fontObj) loadFont(fontObj);

  renderAdVisibility();
}

function toggleSetting(key, val) {
  switch (key) {
    case 'animations': settings.ui.animations = val; break;
    case 'autoPause': settings.timer.autoPause = val; break;
    case 'autoResume': settings.timer.autoResume = val; break;
    case 'timerSound': settings.timer.sound = val; break;
    case 'notifications': settings.notifications.enabled = val; break;
    case 'notifSound': settings.notifications.sound = val; break;
    case 'messageSound': settings.notifications.messageSound = val; break;
    case 'groupChatNotif': settings.notifications.groupChatNotif = val; break;
    case 'pomodoroEnabled': settings.pomodoro.enabled = val; break;
    case 'pomodoroAutoBreak': settings.pomodoro.autoStartBreak = val; break;
    case 'pomodoroAutoWork': settings.pomodoro.autoStartWork = val; break;
    case 'pomodoroSound': settings.pomodoro.sound = val; break;
    case 'isPremium': settings.isPremium = val; break;
    default: console.warn('Unknown setting key:', key); return;
  }
  saveSettings();
  applySettings();
}

function renderSettings() {
  if (!currentUser || !settings) return;

  function setEl(id, value, prop) {
    const el = document.getElementById(id);
    if (!el) return;
    if (prop === 'checked') el.checked = !!value;
    else if (prop === 'value') el.value = value != null ? value : '';
  }

  const logoutDisp = document.getElementById('logout-user-display');
  if (logoutDisp) logoutDisp.textContent = '@' + currentUser.username;

  const to = document.getElementById('theme-options');
  if (to) {
    to.innerHTML = [['dark','تاریک'],['light','روشن'],['auto','خودکار']].map(([v,l]) =>
      `<button class="theme-opt${settings.theme===v?' active':''}" onclick="setTheme('${v}')">${l}</button>`
    ).join('');
  }

  const ap = document.getElementById('accent-picker');
  if (ap) {
    ap.innerHTML = ACCENT_COLORS.map(c =>
      `<div class="accent-swatch${settings.accentColor===c?' selected':''}" style="background:${c}" onclick="setAccent('${c}')"></div>`
    ).join('');
  }

  const fp = document.getElementById('font-picker');
  if (fp) {
    fp.innerHTML = FONT_OPTIONS.map(f =>
      `<button class="font-opt${settings.font===f.name?' active':''}" onclick="setFont('${f.name}')" style="font-family:'${f.name}',sans-serif">${f.label}</button>`
    ).join('');
  }

  const dp = document.getElementById('density-options');
  if (dp) {
    dp.innerHTML = [['normal','عادی'],['compact','فشرده']].map(([v,l]) =>
      `<button class="density-opt${settings.ui.density===v?' active':''}" onclick="setDensity('${v}')">${l}</button>`
    ).join('');
  }

  setEl('setting-animations', settings.ui.animations, 'checked');
  setEl('setting-auto-pause', settings.timer.autoPause, 'checked');
  setEl('setting-auto-resume', settings.timer.autoResume, 'checked');
  setEl('setting-timer-sound', settings.timer.sound, 'checked');
  setEl('setting-notifications', settings.notifications.enabled, 'checked');
  setEl('setting-notif-sound', settings.notifications.sound, 'checked');
  setEl('setting-msg-sound', settings.notifications.messageSound !== false, 'checked');
  setEl('setting-group-chat-notif', settings.notifications.groupChatNotif !== false, 'checked');

  const nst = document.getElementById('notif-style-options');
  if (nst) {
    nst.innerHTML = [['toast','Toast'],['banner','Banner']].map(([v,l]) =>
      `<button class="notif-opt${settings.notifications.style===v?' active':''}" onclick="setNotifStyle('${v}')">${l}</button>`
    ).join('');
  }

  setEl('setting-pomodoro-enabled', settings.pomodoro.enabled, 'checked');
  setEl('pomodoro-work-duration', settings.pomodoro.workDuration, 'value');
  setEl('pomodoro-short-break', settings.pomodoro.shortBreak, 'value');
  setEl('pomodoro-long-break', settings.pomodoro.longBreak, 'value');
  setEl('pomodoro-sessions-before-long', settings.pomodoro.sessionsBeforeLong, 'value');
  setEl('setting-pomodoro-auto-break', settings.pomodoro.autoStartBreak, 'checked');
  setEl('setting-pomodoro-auto-work', settings.pomodoro.autoStartWork, 'checked');
  setEl('setting-pomodoro-sound', settings.pomodoro.sound, 'checked');
  setEl('setting-is-premium', settings.isPremium, 'checked');

  renderProfile();
}

function setTheme(v) { settings.theme=v; saveSettings(); applySettings(); renderSettings(); }
function setAccent(v) { settings.accentColor=v; saveSettings(); applySettings(); renderSettings(); }
function setDensity(v) { settings.ui.density=v; saveSettings(); applySettings(); renderSettings(); }
function setNotifStyle(v) { settings.notifications.style=v; saveSettings(); renderSettings(); }
function setFont(v) {
  settings.font=v; saveSettings();
  const fontObj=FONT_OPTIONS.find(f=>f.name===v);
  if(fontObj)loadFont(fontObj);
  applyFont(v); renderSettings();
}

function savePomodoroSettings() {
  const w=parseInt(document.getElementById('pomodoro-work-duration')?.value)||25;
  const sb=parseInt(document.getElementById('pomodoro-short-break')?.value)||5;
  const lb=parseInt(document.getElementById('pomodoro-long-break')?.value)||15;
  const sl=parseInt(document.getElementById('pomodoro-sessions-before-long')?.value)||4;
  settings.pomodoro.workDuration=Math.max(1,Math.min(120,w));
  settings.pomodoro.shortBreak=Math.max(1,Math.min(30,sb));
  settings.pomodoro.longBreak=Math.max(1,Math.min(60,lb));
  settings.pomodoro.sessionsBeforeLong=Math.max(1,Math.min(10,sl));
  saveSettings();
  toast('تنظیمات پومودورو ذخیره شد','success');
}
/* ══════════════════════════════════════════
   POMODORO STEPPER
══════════════════════════════════════════ */
function adjustPomoSetting(key, delta) {
  const limits = {
    work:              { min: 1,  max: 120, step: 5 },
    shortBreak:        { min: 1,  max: 30,  step: 1 },
    longBreak:         { min: 1,  max: 60,  step: 5 },
    sessionsBeforeLong:{ min: 1,  max: 10,  step: 1 }
  };
  const cfg = limits[key];
  if (!cfg) return;

  settings.pomodoro[key] = Math.max(cfg.min, Math.min(cfg.max,
    (settings.pomodoro[key] || 0) + delta
  ));
  saveSettings();
  renderSettings();
}
