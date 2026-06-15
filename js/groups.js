/* ══════════════════════════════════════════
   GROUPS — COMPLETE MODULE
══════════════════════════════════════════ */

var GROUP_COLORS = [
  '#6C5CE7', '#00CEC9', '#FDCB6E', '#E17055', '#FD79A8',
  '#a29bfe', '#55efc4', '#74b9ff', '#ff7675', '#fdcb6e'
];

var currentGroupId = null;
var replyingToMsg = null;
var editingMsgId  = null;

/* ═══════════ DATA HELPERS ═══════════ */

function getGroups() {
  try {
    return JSON.parse(localStorage.getItem('studyos_groups')) || [];
  } catch (e) { return []; }
}

function saveGroups(groups) {
  localStorage.setItem('studyos_groups', JSON.stringify(groups));
}

function generateGroupId() {
  return 'g_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

function generateGroupCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for (var i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function findGroup(groupId) {
  var groups = getGroups();
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].id === groupId) return groups[i];
  }
  return null;
}

function findGroupIndex(groupId) {
  var groups = getGroups();
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].id === groupId) return i;
  }
  return -1;
}

function isGroupMember(group) {
  if (!currentUser || !group) return false;
  var members = group.members || [];
  for (var i = 0; i < members.length; i++) {
    if (members[i].username === currentUser.username) return true;
  }
  return false;
}

function getMemberRole(group) {
  if (!currentUser || !group) return null;
  var members = group.members || [];
  for (var i = 0; i < members.length; i++) {
    if (members[i].username === currentUser.username) return members[i].role;
  }
  return null;
}

function isAdminOrOwner(group) {
  var role = getMemberRole(group);
  return role === 'owner' || role === 'admin';
}

/* ═══════════ MODALS ═══════════ */

function openCreateGroupModal() {
  var modal = document.getElementById('create-group-modal');
  if (!modal) { console.warn('create-group-modal not found'); return; }

  // پاک کردن فیلدها
  var nameEl  = document.getElementById('new-group-name');
  var descEl  = document.getElementById('new-group-desc');
  var goalEl  = document.getElementById('new-group-goal');
  var maxEl   = document.getElementById('new-group-max-members');
  if (nameEl)  nameEl.value = '';
  if (descEl)  descEl.value = '';
  if (goalEl)  goalEl.value = '';
  if (maxEl)   maxEl.value = '';

  // رنگ پیش‌فرض
  window._selectedNewGroupColor = GROUP_COLORS[0];
  renderColorPicker('new-group-color-picker', GROUP_COLORS[0], function(color) {
    window._selectedNewGroupColor = color;
  });

  // عکس پیش‌فرض
  window._newGroupPhoto = null;
  var preview = document.getElementById('new-group-profile-preview');
  if (preview) {
    preview.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
  }

  modal.classList.add('open');
}

function openJoinGroupModal() {
  var modal = document.getElementById('join-group-modal');
  if (!modal) return;
  var codeEl = document.getElementById('join-group-code');
  if (codeEl) codeEl.value = '';
  modal.classList.add('open');
}

function closeModalGeneric(event, modalId) {
  if (event && event.target !== event.currentTarget) return;
  var modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

function closeAllModals() {
  var modals = document.querySelectorAll('.modal-overlay.open');
  for (var i = 0; i < modals.length; i++) {
    modals[i].classList.remove('open');
  }
}

/* ═══════════ COLOR PICKER HELPER ═══════════ */

function renderColorPicker(containerId, selected, callback) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var html = '';
  for (var i = 0; i < GROUP_COLORS.length; i++) {
    var c = GROUP_COLORS[i];
    var sel = c === selected ? ' selected' : '';
    html += '<div class="color-swatch' + sel + '" style="background:' + c + '" ';
    html += 'data-color="' + c + '" ';
    html += 'onclick="pickGroupColor(\'' + containerId + '\', \'' + c + '\')"></div>';
  }
  container.innerHTML = html;
  window['_colorCb_' + containerId] = callback;
}

function pickGroupColor(containerId, color) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var swatches = container.querySelectorAll('.color-swatch');
  for (var i = 0; i < swatches.length; i++) {
    swatches[i].classList.remove('selected');
    if (swatches[i].getAttribute('data-color') === color) {
      swatches[i].classList.add('selected');
    }
  }
  var cb = window['_colorCb_' + containerId];
  if (cb) cb(color);
}

/* ═══════════ PHOTO HELPERS ═══════════ */

function handleNewGroupPhoto(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    window._newGroupPhoto = e.target.result;
    var preview = document.getElementById('new-group-profile-preview');
    if (preview) {
      preview.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px">';
    }
  };
  reader.readAsDataURL(file);
}

/* ═══════════ CREATE / JOIN / LEAVE ═══════════ */

function createGroup() {
  if (!currentUser) { toast('ابتدا وارد شوید', 'warn'); return; }

  var nameEl = document.getElementById('new-group-name');
  var descEl = document.getElementById('new-group-desc');
  var goalEl = document.getElementById('new-group-goal');
  var maxEl  = document.getElementById('new-group-max-members');

  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) { toast('نام گروه را وارد کنید', 'warn'); return; }

  var desc = descEl ? descEl.value.trim() : '';
  var goal = goalEl ? parseFloat(goalEl.value) || 2 : 2;
  var maxMembers = maxEl ? parseInt(maxEl.value) || 10 : 10;

  var groups = getGroups();

  var group = {
    id: generateGroupId(),
    code: generateGroupCode(),
    name: name,
    description: desc,
    color: window._selectedNewGroupColor || GROUP_COLORS[0],
    photo: window._newGroupPhoto || null,
    dailyGoal: goal,
    maxMembers: maxMembers,
    chatEnabled: true,
    createdAt: Date.now(),
    createdBy: currentUser.username,
    members: [{
      username: currentUser.username,
      displayName: currentUser.displayName || currentUser.username,
      role: 'owner',
      joinedAt: Date.now()
    }],
    messages: [],
    permissions: {
      send_message: true,
      send_file: true,
      send_voice: true,
      edit_own: true,
      delete_own: true,
      delete_others: false,
      pin_message: false,
      manage_members: false,
      edit_settings: false
    }
  };

  groups.push(group);
  saveGroups(groups);

  window._newGroupPhoto = null;
  closeAllModals();
  renderGroupsList();
  renderSuggestedGroups();
  toast('گروه «' + name + '» ساخته شد', 'success');
}

function joinGroup() {
  if (!currentUser) { toast('ابتدا وارد شوید', 'warn'); return; }

  var codeEl = document.getElementById('join-group-code');
  var code = codeEl ? codeEl.value.trim().toUpperCase() : '';
  if (!code || code.length < 4) { toast('کد گروه را وارد کنید', 'warn'); return; }

  var groups = getGroups();
  var found = false;

  for (var i = 0; i < groups.length; i++) {
    if (groups[i].code === code) {
      // عضو هست؟
      if (isGroupMember(groups[i])) {
        toast('شما قبلاً عضو این گروه هستید', 'warn');
        return;
      }
      // پر شده؟
      if (groups[i].members.length >= (groups[i].maxMembers || 100)) {
        toast('ظرفیت گروه تکمیل است', 'warn');
        return;
      }

      groups[i].members.push({
        username: currentUser.username,
        displayName: currentUser.displayName || currentUser.username,
        role: 'member',
        joinedAt: Date.now()
      });

      saveGroups(groups);
      closeAllModals();
      renderGroupsList();
      renderSuggestedGroups();
      toast('به گروه «' + groups[i].name + '» پیوستید', 'success');
      found = true;
      break;
    }
  }

  if (!found) toast('گروهی با این کد یافت نشد', 'warn');
}

function leaveGroup(groupId) {
  if (!confirm('آیا می‌خواهید از این گروه خارج شوید؟')) return;

  var groups = getGroups();
  var idx = findGroupIndex(groupId);
  if (idx === -1) return;

  var group = groups[idx];

  // اگه owner هست
  if (getMemberRole(group) === 'owner') {
    if (group.members.length > 1) {
      toast('ابتدا مالکیت را به عضو دیگری منتقل کنید', 'warn');
      return;
    }
    // تنها عضو → حذف گروه
    groups.splice(idx, 1);
    saveGroups(groups);
    closeGroupDetail();
    renderGroupsList();
    renderSuggestedGroups();
    toast('گروه حذف شد', 'info');
    return;
  }

  // حذف عضو
  group.members = group.members.filter(function(m) {
    return m.username !== currentUser.username;
  });

  saveGroups(groups);
  closeGroupDetail();
  renderGroupsList();
  toast('از گروه خارج شدید', 'info');
}

/* ═══════════ RENDER GROUPS LIST ═══════════ */

function renderGroupsList() {
  if (!currentUser) return;

  var groups = getGroups();
  var myGroups = groups.filter(function(g) { return isGroupMember(g); });
  var grid = document.getElementById('groups-grid');
  if (!grid) return;

  if (myGroups.length === 0) {
    grid.innerHTML = '<div class="empty-state"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><p>هنوز عضو هیچ گروهی نیستید</p><p style="font-size:0.72rem;opacity:0.6">یک گروه بسازید یا با کد بپیوندید</p></div>';
    return;
  }

  var html = '';
  for (var i = 0; i < myGroups.length; i++) {
    var g = myGroups[i];
    var avatarHtml = g.photo
      ? '<img src="' + g.photo + '">'
      : g.name[0];
    var memberCount = (g.members || []).length;
    var onlineCount = Math.floor(Math.random() * memberCount); // placeholder

    html += '<div class="group-card" onclick="openGroupDetail(\'' + g.id + '\')" style="border-top: 3px solid ' + g.color + '">';
    html += '  <div class="group-card-top">';
    html += '    <div class="group-card-avatar" style="background:' + g.color + '">' + avatarHtml + '</div>';
    html += '    <div class="group-card-info">';
    html += '      <div class="group-card-name">' + escapeHtml(g.name) + '</div>';
    html += '    </div>';
    html += '  </div>';

    if (g.description) {
      html += '<div class="group-card-desc">' + escapeHtml(g.description) + '</div>';
    }

    html += '  <div class="group-card-goal">⏱ ' + g.dailyGoal + ' ساعت/روز</div>';
    html += '  <div class="group-card-meta">';
    html += '    <div class="group-card-members"><span class="group-online-dot"></span> ' + memberCount + ' عضو</div>';
    html += '    <div class="group-card-code">' + g.code + '</div>';
    html += '  </div>';
    html += '</div>';
  }

  grid.innerHTML = html;
}

/* ═══════════ RENDER SUGGESTED GROUPS ═══════════ */

function renderSuggestedGroups() {
  if (!currentUser) return;

  var groups = getGroups();
  var myGroupIds = {};
  groups.forEach(function(g) {
    if (isGroupMember(g)) myGroupIds[g.id] = true;
  });

  var suggested = groups.filter(function(g) {
    return !myGroupIds[g.id] && g.members.length < (g.maxMembers || 100);
  }).slice(0, 6);

  var section = document.getElementById('suggested-groups-section');
  var grid    = document.getElementById('suggested-groups-grid');
  if (!section || !grid) return;

  if (suggested.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';

  var html = '';
  for (var i = 0; i < suggested.length; i++) {
    var g = suggested[i];
    var avatarHtml = g.photo ? '<img src="' + g.photo + '">' : g.name[0];

    html += '<div class="suggested-group-card" style="border-top: 3px solid ' + g.color + '">';
    html += '  <div class="suggested-group-top">';
    html += '    <div class="suggested-group-avatar" style="background:' + g.color + '">' + avatarHtml + '</div>';
    html += '    <div class="suggested-group-info">';
    html += '      <div class="suggested-group-name">' + escapeHtml(g.name) + '</div>';
    html += '      <div class="suggested-group-reason">گروه عمومی</div>';
    html += '    </div>';
    html += '  </div>';
    if (g.description) {
      html += '<div class="suggested-group-desc">' + escapeHtml(g.description) + '</div>';
    }
    html += '  <div class="suggested-group-footer">';
    html += '    <div class="suggested-group-members">';
    html += '      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>';
    html += '      ' + g.members.length + ' عضو';
    html += '    </div>';
    html += '    <button class="suggested-join-btn" onclick="joinGroupByCode(\'' + g.code + '\')">پیوستن</button>';
    html += '  </div>';
    html += '</div>';
  }

  grid.innerHTML = html;
}

function joinGroupByCode(code) {
  var codeEl = document.getElementById('join-group-code');
  if (codeEl) codeEl.value = code;
  joinGroup();
}

/* ═══════════ GROUP DETAIL ═══════════ */

function openGroupDetail(groupId) {
  var group = findGroup(groupId);
  if (!group) { toast('گروه یافت نشد', 'warn'); return; }

  currentGroupId = groupId;

  // نمایش/مخفی کردن ویوها
  var listView  = document.getElementById('groups-list-view');
  var detailView = document.getElementById('group-detail-view');
  if (listView)  listView.style.display = 'none';
  if (detailView) detailView.style.display = 'block';

  // هدر
  var avatarEl  = document.getElementById('group-detail-avatar');
  var nameEl    = document.getElementById('group-detail-name');
  var countEl   = document.getElementById('group-detail-member-count-header');
  var codeEl    = document.getElementById('group-detail-code');
  var settingsBtn = document.getElementById('group-settings-btn');

  if (avatarEl) {
    avatarEl.style.background = group.color;
    avatarEl.innerHTML = group.photo
      ? '<img src="' + group.photo + '">'
      : group.name[0];
  }
  if (nameEl) nameEl.textContent = group.name;
  if (countEl) countEl.textContent = (group.members || []).length + ' عضو';
  if (codeEl) codeEl.textContent = group.code;

  // نمایش دکمه تنظیمات فقط برای ادمین/مالک
  if (settingsBtn) {
    settingsBtn.style.display = isAdminOrOwner(group) ? '' : 'none';
  }

  // هدف روزانه
  var goalBanner = document.getElementById('group-goal-banner');
  var goalText   = document.getElementById('group-goal-text');
  if (goalBanner && goalText) {
    goalText.textContent = 'هدف مطالعه روزانه گروه: ' + group.dailyGoal + ' ساعت';
    goalBanner.style.display = '';
  }

  // تب پیش‌فرض
  switchGroupTab('workspace');

  // رندر اعضا
  renderGroupMembers(group);

  // رندر چت
  renderGroupChat(group);

  // تایمر گروهی
  renderGroupTimer(group);

  // اسکرول به بالا
  window.scrollTo(0, 0);
}

function closeGroupDetail() {
  currentGroupId = null;
  var listView   = document.getElementById('groups-list-view');
  var detailView = document.getElementById('group-detail-view');
  if (listView)   listView.style.display = '';
  if (detailView) detailView.style.display = 'none';
  renderGroupsList();
}

function switchGroupTab(tab, btn) {
  // تب‌ها
  var tabs = document.querySelectorAll('.group-detail-tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  if (btn) btn.classList.add('active');
  else {
    // پیدا کردن دکمه مرتبط
    for (var j = 0; j < tabs.length; j++) {
      var onclick = tabs[j].getAttribute('onclick') || '';
      if (onclick.indexOf("'" + tab + "'") !== -1) {
        tabs[j].classList.add('active');
        break;
      }
    }
  }

  // محتوا
  var contents = document.querySelectorAll('.group-tab-content');
  for (var k = 0; k < contents.length; k++) contents[k].classList.remove('active');

  var targetId = 'group-' + tab + '-content';
  var target = document.getElementById(targetId);
  if (target) {
    target.classList.add('active');
    target.style.display = '';
  }

  // بقیه رو مخفی کن
  for (var m = 0; m < contents.length; m++) {
    if (contents[m].id !== targetId) contents[m].style.display = 'none';
  }
}

function copyGroupCode() {
  var group = findGroup(currentGroupId);
  if (!group) return;
  navigator.clipboard.writeText(group.code).then(function() {
    toast('کد گروه کپی شد: ' + group.code, 'success');
  }).catch(function() {
    toast('کد گروه: ' + group.code, 'info');
  });
}

/* ═══════════ MEMBERS ═══════════ */

function renderGroupMembers(group) {
  if (!group) group = findGroup(currentGroupId);
  if (!group) return;

  var listEl = document.getElementById('group-members-list');
  var countEl = document.getElementById('group-members-count');
  if (countEl) countEl.textContent = group.members.length;
  if (!listEl) return;

  var html = '';
  for (var i = 0; i < group.members.length; i++) {
    var m = group.members[i];
    var isMe = currentUser && m.username === currentUser.username;
    var roleClass = m.role === 'owner' ? 'role-owner' : m.role === 'admin' ? 'role-admin' : 'role-member';
    var roleLabel = m.role === 'owner' ? 'مالک' : m.role === 'admin' ? 'مدیر' : 'عضو';
    var initial = (m.displayName || m.username)[0];
    var color = avatarColor(m.username);

    html += '<div class="group-member-row">';
    html += '  <div class="group-member-avatar" style="background:' + color + ';color:#fff">' + initial + '</div>';
    html += '  <div class="group-member-info">';
    html += '    <div class="group-member-name">' + escapeHtml(m.displayName || m.username) + (isMe ? ' (شما)' : '') + '</div>';
    html += '  </div>';
    html += '  <span class="group-member-role ' + roleClass + '">' + roleLabel + '</span>';
    html += '  <div class="group-member-online on"></div>';
    html += '</div>';
  }

  listEl.innerHTML = html;
}

/* ═══════════ GROUP TIMER ═══════════ */

function renderGroupTimer(group) {
  if (!group) group = findGroup(currentGroupId);
  if (!group) return;

  var membersEl = document.getElementById('group-timer-members');
  if (!membersEl) return;

  var html = '';
  for (var i = 0; i < group.members.length; i++) {
    var m = group.members[i];
    var isMe = currentUser && m.username === currentUser.username;
    var statusClass = isMe && pomodoroActive ? 'studying' : (isMe ? 'online' : 'offline');
    var statusText = statusClass === 'studying' ? 'در حال مطالعه' : (statusClass === 'online' ? 'آنلاین' : 'آفلاین');

    html += '<div class="group-member-status">';
    html += '  <span class="status-dot ' + statusClass + '"></span>';
    html += '  ' + escapeHtml(m.displayName || m.username) + ' — ' + statusText;
    html += '</div>';
  }

  membersEl.innerHTML = html;
}

/* ═══════════ GROUP CHAT — BASIC RENDER ═══════════ */

function renderGroupChat(group) {
  if (!group) group = findGroup(currentGroupId);
  if (!group) return;

  var messagesEl = document.getElementById('group-chat-messages');
  if (!messagesEl) return;

  // چت فعال/غیرفعال
  var overlay = document.getElementById('chat-disabled-overlay');
  if (overlay) overlay.style.display = group.chatEnabled ? 'none' : '';
  var inputArea = document.getElementById('chat-input-area');
  if (inputArea) inputArea.style.display = group.chatEnabled ? '' : 'none';

  var messages = group.messages || [];
  if (messages.length === 0) {
    messagesEl.innerHTML = '<div class="empty-state"><p>هنوز پیامی ارسال نشده</p><p style="font-size:0.72rem;opacity:0.6">اولین پیام را ارسال کنید</p></div>';
    return;
  }

  var html = '';
  for (var i = 0; i < messages.length; i++) {
    var msg = messages[i];
    var isSelf = currentUser && msg.username === currentUser.username;
    var msgClass = isSelf ? 'self' : 'other';
    var time = new Date(msg.timestamp);
    var timeStr = padZero(time.getHours()) + ':' + padZero(time.getMinutes());

    html += '<div class="chat-msg ' + msgClass + '" data-msg-id="' + msg.id + '">';

    // هدر
    html += '  <div class="chat-msg-header">';
    html += '    <span class="chat-msg-user">' + escapeHtml(msg.displayName || msg.username) + '</span>';
    html += '    <span class="chat-msg-time">' + timeStr + '</span>';
    html += '  </div>';

    // متن
    if (msg.text) {
      html += '<div class="chat-msg-text">' + escapeHtml(msg.text) + '</div>';
    }

    // فایل
    if (msg.file) {
      html += '<div class="chat-msg-file">';
      html += '  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
      html += '  <div class="chat-msg-file-info">';
      html += '    <div class="chat-msg-file-name">' + escapeHtml(msg.file.name) + '</div>';
      html += '    <div class="chat-msg-file-size">' + msg.file.size + '</div>';
      html += '  </div>';
      html += '</div>';
    }

    // تصویر
    if (msg.image) {
      html += '<img class="chat-msg-image" src="' + msg.image + '" alt="تصویر">';
    }

    html += '</div>';
  }

  messagesEl.innerHTML = html;
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/* ═══════════ SEND MESSAGE ═══════════ */

function sendGroupMessage() {
  if (!currentUser || !currentGroupId) return;

  var group = findGroup(currentGroupId);
  if (!group) return;
  if (!group.chatEnabled) { toast('چت غیرفعال است', 'warn'); return; }

  var inputEl = document.getElementById('group-chat-input');
  var text = inputEl ? inputEl.value.trim() : '';

  // اگه فایل داریم
  if (window._pendingChatFile) {
    text = text || '';
  }

  if (!text && !window._pendingChatFile && !window._pendingChatImage && !window._pendingVoice) return;

  var msg = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    username: currentUser.username,
    displayName: currentUser.displayName || currentUser.username,
    text: text || null,
    timestamp: Date.now(),
    reactions: {}
  };

  if (window._pendingChatFile) {
    msg.file = window._pendingChatFile;
    window._pendingChatFile = null;
    cancelFileUpload();
  }

  if (window._pendingChatImage) {
    msg.image = window._pendingChatImage;
    window._pendingChatImage = null;
  }

  if (replyingToMsg) {
    msg.replyTo = {
      id: replyingToMsg.id,
      username: replyingToMsg.displayName || replyingToMsg.username,
      text: replyingToMsg.text ? replyingToMsg.text.substring(0, 60) : 'فایل'
    };
    cancelReply();
  }

  // ذخیره
  var groups = getGroups();
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].id === currentGroupId) {
      if (!groups[i].messages) groups[i].messages = [];
      groups[i].messages.push(msg);
      saveGroups(groups);
      break;
    }
  }

  if (inputEl) inputEl.value = '';
  renderGroupChat(findGroup(currentGroupId));
}

function handleChatKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendGroupMessage();
  }
}

/* ═══════════ CHAT TOGGLES ═══════════ */

function toggleChatSearch() {
  var bar = document.getElementById('chat-search-bar');
  if (bar) bar.style.display = bar.style.display === 'none' ? '' : 'none';
  var input = document.getElementById('chat-search-input');
  if (input && bar.style.display !== 'none') input.focus();
}

function togglePinnedMessages() {
  var area = document.getElementById('chat-pinned-area');
  if (area) area.style.display = area.style.display === 'none' ? '' : 'none';
}

function scrollChatToBottom() {
  var c = document.getElementById('group-chat-messages');
  if (c) c.scrollTop = c.scrollHeight;
}

function toggleAttachmentMenu() {
  var menu = document.getElementById('attachment-menu');
  if (menu) menu.style.display = menu.style.display === 'none' ? '' : 'none';
}

/* ═══════════ CHAT FILE / IMAGE ═══════════ */

function triggerChatFileUpload() {
  var inp = document.getElementById('chat-file-input');
  if (inp) inp.click();
  toggleAttachmentMenu();
}

function triggerChatImageUpload() {
  var inp = document.getElementById('chat-image-input');
  if (inp) inp.click();
  toggleAttachmentMenu();
}

function handleChatFile(event) {
  var file = event.target.files[0];
  if (!file) return;
  window._pendingChatFile = { name: file.name, size: formatFileSize(file.size) };
  var preview = document.getElementById('chat-file-preview');
  var nameEl  = document.getElementById('file-preview-name');
  var sizeEl  = document.getElementById('file-preview-size');
  if (nameEl) nameEl.textContent = file.name;
  if (sizeEl) sizeEl.textContent = formatFileSize(file.size);
  if (preview) preview.style.display = '';
}

function handleChatImage(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    window._pendingChatImage = e.target.result;
    sendGroupMessage();
  };
  reader.readAsDataURL(file);
}

function cancelFileUpload() {
  window._pendingChatFile = null;
  var preview = document.getElementById('chat-file-preview');
  if (preview) preview.style.display = 'none';
}

/* ═══════════ CHAT REPLY / EDIT ═══════════ */

function cancelReply() {
  replyingToMsg = null;
  var preview = document.getElementById('chat-reply-preview');
  if (preview) preview.style.display = 'none';
}

function cancelEdit() {
  editingMsgId = null;
  var preview = document.getElementById('chat-edit-preview');
  if (preview) preview.style.display = 'none';
}

function cancelVoiceRecord() {
  window._pendingVoice = null;
  var preview = document.getElementById('chat-voice-preview');
  if (preview) preview.style.display = 'none';
  var btn = document.getElementById('voice-record-btn');
  if (btn) btn.classList.remove('recording');
}

/* ═══════════ CHAT CONTEXT MENU ═══════════ */

var _ctxMsgId = null;

function ctxReplyToMsg() {
  hideContextMenu();
  if (!_ctxMsgId) return;
  var group = findGroup(currentGroupId);
  if (!group) return;
  var msg = null;
  for (var i = 0; i < group.messages.length; i++) {
    if (group.messages[i].id === _ctxMsgId) { msg = group.messages[i]; break; }
  }
  if (!msg) return;
  replyingToMsg = msg;
  var preview = document.getElementById('chat-reply-preview');
  var nameEl  = document.getElementById('reply-preview-name');
  var textEl  = document.getElementById('reply-preview-text');
  if (nameEl) nameEl.textContent = msg.displayName || msg.username;
  if (textEl) textEl.textContent = msg.text ? msg.text.substring(0, 60) : 'فایل';
  if (preview) preview.style.display = '';
  var input = document.getElementById('group-chat-input');
  if (input) input.focus();
}

function ctxEditMsg() {
  hideContextMenu();
  toast('ویرایش پیام — بزودی', 'info');
}

function ctxPinMsg() {
  hideContextMenu();
  toast('پین پیام — بزودی', 'info');
}

function ctxCopyMsg() {
  hideContextMenu();
  if (!_ctxMsgId) return;
  var group = findGroup(currentGroupId);
  if (!group) return;
  for (var i = 0; i < group.messages.length; i++) {
    if (group.messages[i].id === _ctxMsgId && group.messages[i].text) {
      navigator.clipboard.writeText(group.messages[i].text);
      toast('متن کپی شد', 'success');
      break;
    }
  }
}

function ctxDeleteMsg() {
  hideContextMenu();
  if (!_ctxMsgId) return;
  if (!confirm('این پیام حذف شود؟')) return;

  var groups = getGroups();
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].id === currentGroupId) {
      groups[i].messages = groups[i].messages.filter(function(m) {
        if (m.id === _ctxMsgId) {
          // فقط خودش یا ادمین/مالک
          if (m.username === (currentUser && currentUser.username)) return false;
          if (isAdminOrOwner(groups[i])) return false;
          return true; // حذف نکن
        }
        return true;
      });
      saveGroups(groups);
      renderGroupChat(groups[i]);
      toast('پیام حذف شد', 'info');
      break;
    }
  }
}

function hideContextMenu() {
  var menu = document.getElementById('msg-context-menu');
  if (menu) menu.style.display = 'none';
}

/* ═══════════ VOICE (placeholder) ═══════════ */

function startVoiceRecord() {
  var btn = document.getElementById('voice-record-btn');
  if (btn) btn.classList.add('recording');
}

function stopVoiceRecord() {
  var btn = document.getElementById('voice-record-btn');
  if (btn) btn.classList.remove('recording');
  toast('ضبط صوت — بزودی', 'info');
}

/* ═══════════ REACTIONS (placeholder) ═══════════ */

function addReaction(type) {
  var picker = document.getElementById('reaction-picker');
  if (picker) picker.style.display = 'none';
  toast('واکنش اضافه شد', 'success');
}

/* ═══════════ CHAT SEARCH (placeholder) ═══════════ */

function searchChatMessages(query) {
  // placeholder
}

/* ═══════════ GROUP SETTINGS MODAL ═══════════ */

function openGroupSettingsModal() {
  var group = findGroup(currentGroupId);
  if (!group) return;

  var modal = document.getElementById('group-settings-modal');
  if (!modal) return;

  // پر کردن فیلدها
  var nameEl   = document.getElementById('group-edit-name');
  var descEl   = document.getElementById('group-edit-desc');
  var goalEl   = document.getElementById('group-edit-goal');
  var maxEl    = document.getElementById('group-edit-max-members');
  var chatEl   = document.getElementById('group-chat-enabled');

  if (nameEl) nameEl.value = group.name;
  if (descEl) descEl.value = group.description || '';
  if (goalEl) goalEl.value = group.dailyGoal || 2;
  if (maxEl)  maxEl.value  = group.maxMembers || 10;
  if (chatEl) chatEl.checked = group.chatEnabled !== false;

  // رنگ
  window._selectedGroupEditColor = group.color;
  renderColorPicker('group-edit-color-picker', group.color, function(color) {
    window._selectedGroupEditColor = color;
  });

  // عکس
  var preview = document.getElementById('group-profile-preview');
  if (preview) {
    if (group.photo) {
      preview.innerHTML = '<img src="' + group.photo + '" style="width:100%;height:100%;object-fit:cover;border-radius:16px">';
    } else {
      preview.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
    }
  }

  // دسترسی‌ها
  if (group.permissions) {
    var toggles = document.querySelectorAll('.perm-toggle');
    for (var i = 0; i < toggles.length; i++) {
      var perm = toggles[i].getAttribute('data-perm');
      if (perm && group.permissions[perm] !== undefined) {
        toggles[i].checked = group.permissions[perm];
      }
    }
  }

  // مدیریت اعضا
  renderSettingsMembers(group);

  // تب پیش‌فرض
  switchGroupSettingsTab('general');

  modal.classList.add('open');
}

function saveGroupSettings() {
  var groups = getGroups();
  var idx = findGroupIndex(currentGroupId);
  if (idx === -1) return;

  var group = groups[idx];

  var nameEl = document.getElementById('group-edit-name');
  var descEl = document.getElementById('group-edit-desc');
  var goalEl = document.getElementById('group-edit-goal');
  var maxEl  = document.getElementById('group-edit-max-members');
  var chatEl = document.getElementById('group-chat-enabled');

  if (nameEl) group.name = nameEl.value.trim() || group.name;
  if (descEl) group.description = descEl.value.trim();
  if (goalEl) group.dailyGoal = parseFloat(goalEl.value) || 2;
  if (maxEl)  group.maxMembers = parseInt(maxEl.value) || 10;
  if (chatEl) group.chatEnabled = chatEl.checked;
  if (window._selectedGroupEditColor) group.color = window._selectedGroupEditColor;

  saveGroups(groups);
  closeAllModals();
  openGroupDetail(currentGroupId);
  toast('تنظیمات ذخیره شد', 'success');
}

function switchGroupSettingsTab(tab, btn) {
  var tabs = document.querySelectorAll('.group-settings-tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  if (btn) btn.classList.add('active');
  else {
    for (var j = 0; j < tabs.length; j++) {
      if ((tabs[j].getAttribute('onclick') || '').indexOf("'" + tab + "'") !== -1) {
        tabs[j].classList.add('active');
        break;
      }
    }
  }

  var contents = document.querySelectorAll('.group-settings-content');
  for (var k = 0; k < contents.length; k++) {
    contents[k].classList.remove('active');
    contents[k].style.display = 'none';
  }

  var target = document.getElementById('group-settings-' + tab);
  if (target) {
    target.classList.add('active');
    target.style.display = '';
  }
}

function handleGroupPhoto(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var groups = getGroups();
    var idx = findGroupIndex(currentGroupId);
    if (idx !== -1) {
      groups[idx].photo = e.target.result;
      saveGroups(groups);
    }
    var preview = document.getElementById('group-profile-preview');
    if (preview) {
      preview.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:16px">';
    }
  };
  reader.readAsDataURL(file);
}

function removeGroupPhoto() {
  var groups = getGroups();
  var idx = findGroupIndex(currentGroupId);
  if (idx !== -1) {
    groups[idx].photo = null;
    saveGroups(groups);
  }
  var preview = document.getElementById('group-profile-preview');
  if (preview) {
    preview.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
  }
}

function toggleGroupChat(enabled) {
  var groups = getGroups();
  var idx = findGroupIndex(currentGroupId);
  if (idx === -1) return;
  groups[idx].chatEnabled = enabled;
  saveGroups(groups);
  toast(enabled ? 'چت فعال شد' : 'چت غیرفعال شد', 'info');
}

function saveGroupPermissions() {
  var groups = getGroups();
  var idx = findGroupIndex(currentGroupId);
  if (idx === -1) return;

  var toggles = document.querySelectorAll('.perm-toggle');
  var perms = {};
  for (var i = 0; i < toggles.length; i++) {
    var key = toggles[i].getAttribute('data-perm');
    if (key) perms[key] = toggles[i].checked;
  }
  groups[idx].permissions = perms;
  saveGroups(groups);
  toast('دسترسی‌ها ذخیره شد', 'success');
}

function renderSettingsMembers(group) {
  var listEl = document.getElementById('members-manage-list');
  if (!listEl) return;

  var html = '';
  for (var i = 0; i < group.members.length; i++) {
    var m = group.members[i];
    var isMe = currentUser && m.username === currentUser.username;
    var initial = (m.displayName || m.username)[0];
    var color = avatarColor(m.username);
    var roleClass = m.role === 'owner' ? 'role-owner' : m.role === 'admin' ? 'role-admin' : 'role-member';
    var roleLabel = m.role === 'owner' ? 'مالک' : m.role === 'admin' ? 'مدیر' : 'عضو';

    html += '<div class="member-manage-row">';
    html += '  <div class="member-manage-avatar" style="background:' + color + ';color:#fff">' + initial + '</div>';
    html += '  <div class="member-manage-info">';
    html += '    <div class="member-manage-name">' + escapeHtml(m.displayName || m.username) + (isMe ? ' (شما)' : '') + '</div>';
    html += '    <div class="member-manage-username">@' + escapeHtml(m.username) + '</div>';
    html += '  </div>';
    html += '  <span class="group-member-role ' + roleClass + '">' + roleLabel + '</span>';

    if (!isMe && isAdminOrOwner(group) && m.role !== 'owner') {
      html += '<div class="member-manage-actions">';
      if (getMemberRole(group) === 'owner') {
        if (m.role === 'admin') {
          html += '<button class="btn btn-ghost btn-xs" onclick="changeRole(\'' + m.username + '\',\'member\')">حذف مدیریت</button>';
        } else {
          html += '<button class="btn btn-ghost btn-xs" onclick="changeRole(\'' + m.username + '\',\'admin\')">مدیر کردن</button>';
        }
      }
      html += '<button class="btn btn-danger btn-xs" onclick="removeMember(\'' + m.username + '\')">اخراج</button>';
      html += '</div>';
    }

    html += '</div>';
  }

  listEl.innerHTML = html;
}

function changeRole(username, newRole) {
  var groups = getGroups();
  var idx = findGroupIndex(currentGroupId);
  if (idx === -1) return;

  for (var i = 0; i < groups[idx].members.length; i++) {
    if (groups[idx].members[i].username === username) {
      groups[idx].members[i].role = newRole;
      break;
    }
  }
  saveGroups(groups);
  renderSettingsMembers(groups[idx]);
  toast('نقش تغییر کرد', 'success');
}

function removeMember(username) {
  if (!confirm('این عضو اخراج شود؟')) return;

  var groups = getGroups();
  var idx = findGroupIndex(currentGroupId);
  if (idx === -1) return;

  groups[idx].members = groups[idx].members.filter(function(m) {
    return m.username !== username;
  });

  saveGroups(groups);
  renderSettingsMembers(groups[idx]);
  renderGroupMembers(groups[idx]);
  toast('عضو اخراج شد', 'info');
}

function searchMembers(query) {
  var group = findGroup(currentGroupId);
  if (!group) return;

  var listEl = document.getElementById('members-manage-list');
  if (!listEl) return;

  if (!query || !query.trim()) {
    renderSettingsMembers(group);
    return;
  }

  query = query.trim().toLowerCase();
  var filtered = group.members.filter(function(m) {
    return (m.displayName || '').toLowerCase().indexOf(query) !== -1 ||
           m.username.toLowerCase().indexOf(query) !== -1;
  });

  // رندر ساده
  var html = '';
  for (var i = 0; i < filtered.length; i++) {
    var m = filtered[i];
    var initial = (m.displayName || m.username)[0];
    var color = avatarColor(m.username);
    html += '<div class="member-manage-row">';
    html += '  <div class="member-manage-avatar" style="background:' + color + ';color:#fff">' + initial + '</div>';
    html += '  <div class="member-manage-info">';
    html += '    <div class="member-manage-name">' + escapeHtml(m.displayName || m.username) + '</div>';
    html += '    <div class="member-manage-username">@' + escapeHtml(m.username) + '</div>';
    html += '  </div>';
    html += '</div>';
  }
  listEl.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:20px">نتیجه‌ای یافت نشد</p>';
}

/* ═══════════ CONTEXT MENU ON MSG ═══════════ */

document.addEventListener('contextmenu', function(e) {
  var msgEl = e.target.closest('.chat-msg');
  if (!msgEl) return;
  e.preventDefault();
  _ctxMsgId = msgEl.getAttribute('data-msg-id');

  var menu = document.getElementById('msg-context-menu');
  if (!menu) return;
  menu.style.display = 'flex';
  menu.style.top = e.clientY + 'px';
  menu.style.left = e.clientX + 'px';
});

document.addEventListener('click', function(e) {
  var menu = document.getElementById('msg-context-menu');
  if (menu && !menu.contains(e.target)) menu.style.display = 'none';

  var picker = document.getElementById('reaction-picker');
  if (picker && !picker.contains(e.target)) picker.style.display = 'none';
});

/* ═══════════ HELPERS ═══════════ */

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function padZero(n) { return n < 10 ? '0' + n : '' + n; }

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function avatarColor(name) {
  if (!name) return GROUP_COLORS[0];
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GROUP_COLORS[Math.abs(hash) % GROUP_COLORS.length];
}
/* ══════════════════════════════════════════
   GROUP CHAT — FULL FIXED VERSION
   ✅ reactions desktop
   ✅ file upload mobile
   ✅ image inline display + zoom
   ✅ chat search
   ✅ voice recording
══════════════════════════════════════════ */

var replyingToMsg   = null;
var editingMsgId    = null;
var _pendingFile    = null;
var _pendingImage   = null;
var _pendingVoice   = null;
var _isRecording    = false;
var _mediaRecorder  = null;
var _audioChunks    = [];
var _recordStart    = 0;
var _recordTimer    = null;
var _ctxMsgId       = null;
var _currentAudio   = null;
var _currentBtn     = null;
var _progressTimer  = null;

/* ═══════════════════════════════
   RENDER GROUP CHAT
═════════════════════════════════ */
function renderGroupChat(group) {
  if (!group) group = findGroup(currentGroupId);
  if (!group) return;

  var messagesEl = document.getElementById('group-chat-messages');
  if (!messagesEl) return;

  var overlay   = document.getElementById('chat-disabled-overlay');
  var inputArea = document.getElementById('chat-input-area');
  if (overlay)   overlay.style.display   = group.chatEnabled ? 'none' : '';
  if (inputArea) inputArea.style.display = group.chatEnabled ? '' : 'none';

  var messages = group.messages || [];
  if (messages.length === 0) {
    messagesEl.innerHTML = '<div class="empty-state"><p>هنوز پیامی ارسال نشده</p><p style="font-size:0.72rem;opacity:0.6">اولین پیام را ارسال کنید</p></div>';
    return;
  }

  var html = '';
  for (var i = 0; i < messages.length; i++) {
    var msg    = messages[i];
    var isSelf = currentUser && msg.username === currentUser.username;
    var cls    = isSelf ? 'self' : 'other';
    var time   = new Date(msg.timestamp);
    var tStr   = padZero(time.getHours()) + ':' + padZero(time.getMinutes());

    html += '<div class="chat-msg ' + cls + '" data-msg-id="' + msg.id + '">';

    // reply ref
    if (msg.replyTo) {
      html += '<div class="chat-msg-reply-ref">';
      html += '  <span class="reply-ref-name">' + escapeHtml(msg.replyTo.username) + '</span>';
      html += '  <span class="reply-ref-text">' + escapeHtml(msg.replyTo.text || '') + '</span>';
      html += '</div>';
    }

    // header
    html += '<div class="chat-msg-header">';
    html += '  <span class="chat-msg-user">' + escapeHtml(msg.displayName || msg.username) + '</span>';
    html += '  <span class="chat-msg-time">' + tStr + '</span>';
    if (msg.edited) html += '  <span class="chat-msg-edited">(ویرایش)</span>';
    html += '</div>';

    // text
    if (msg.text) {
      html += '<div class="chat-msg-text" data-searchable>' + escapeHtml(msg.text).replace(/\n/g, '<br>') + '</div>';
    }

    // image — inline with zoom
    if (msg.image) {
      html += '<img class="chat-msg-image" src="' + msg.image + '" ';
      html += 'onclick="openImageFullscreen(this.src)" ';
      html += 'alt="تصویر" loading="lazy">';
    }

    // file — downloadable
    if (msg.file) {
      html += '<a class="chat-msg-file" href="' + (msg.file.data || '#') + '" ';
      html += 'download="' + escapeHtml(msg.file.name) + '">';
      html += getFileIcon(msg.file.name);
      html += '<div class="chat-msg-file-info">';
      html += '  <div class="chat-msg-file-name">' + escapeHtml(msg.file.name) + '</div>';
      html += '  <div class="chat-msg-file-size">' + escapeHtml(msg.file.sizeFormatted || '') + '</div>';
      html += '</div></a>';
      if (msg.file.caption) {
        html += '<div class="chat-msg-file-caption">' + escapeHtml(msg.file.caption) + '</div>';
      }
    }

    // voice
    if (msg.voice) {
      html += renderVoiceMessage(msg);
    }

    // reactions
    html += renderReactions(msg);

    // hover actions
    html += '<div class="chat-msg-actions">';
    html += '  <button class="msg-action-btn" data-action="react" data-msgid="' + msg.id + '" title="واکنش">';
    html += '    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
    html += '  </button>';
    html += '  <button class="msg-action-btn" data-action="reply" data-msgid="' + msg.id + '" title="پاسخ">';
    html += '    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>';
    html += '  </button>';
    html += '</div>';

    html += '</div>';
  }

  messagesEl.innerHTML = html;
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // attach event listeners after innerHTML
  attachChatEventListeners();
}

/* ═══════════════════════════════
   EVENT LISTENERS — after render
═════════════════════════════════ */
function attachChatEventListeners() {
  // action buttons (react, reply)
  var actionBtns = document.querySelectorAll('.msg-action-btn[data-action]');
  for (var i = 0; i < actionBtns.length; i++) {
    actionBtns[i].addEventListener('click', handleMsgAction);
  }

  // right-click context menu
  var msgs = document.querySelectorAll('.chat-msg[data-msg-id]');
  for (var j = 0; j < msgs.length; j++) {
    msgs[j].addEventListener('contextmenu', handleMsgContextMenu);
    // mobile long press
    msgs[j].addEventListener('touchstart', handleTouchStart, { passive: true });
    msgs[j].addEventListener('touchend', handleTouchEnd, { passive: true });
    msgs[j].addEventListener('touchmove', handleTouchMove, { passive: true });
  }
}

function handleMsgAction(e) {
  e.stopPropagation();
  var btn    = e.currentTarget;
  var action = btn.getAttribute('data-action');
  var msgId  = btn.getAttribute('data-msgid');
  if (!action || !msgId) return;

  if (action === 'react') {
    showReactionPicker(e, msgId);
  } else if (action === 'reply') {
    replyToMessage(msgId);
  }
}

function handleMsgContextMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  var msgId = e.currentTarget.getAttribute('data-msg-id');
  if (msgId) showMsgContextMenu(e, msgId);
}

var _longPressTimer = null;

function handleTouchStart(e) {
  var msgEl = e.currentTarget;
  var msgId = msgEl.getAttribute('data-msg-id');
  if (!msgId) return;
  _longPressTimer = setTimeout(function() {
    showMsgContextMenu({
      preventDefault: function(){},
      stopPropagation: function(){},
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY
    }, msgId);
  }, 600);
}

function handleTouchEnd() {
  if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
}

function handleTouchMove() {
  if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
}


/* ═══════════════════════════════
   RENDER REACTIONS HTML
═════════════════════════════════ */
function renderReactions(msg) {
  if (!msg.reactions || Object.keys(msg.reactions).length === 0) return '';
  var html = '<div class="chat-msg-reactions">';
  for (var rKey in msg.reactions) {
    var rUsers = msg.reactions[rKey];
    if (!rUsers || rUsers.length === 0) continue;
    var reacted = currentUser && rUsers.indexOf(currentUser.username) !== -1;
    html += '<span class="msg-reaction-chip' + (reacted ? ' user-reacted' : '') + '" ';
    html += 'data-msgid="' + msg.id + '" data-reaction="' + rKey + '">';
    html += getReactionEmoji(rKey);
    html += ' <span class="msg-reaction-count">' + rUsers.length + '</span>';
    html += '</span>';
  }
  html += '</div>';
  return html;
}


/* ═══════════════════════════════
   REACTION PICKER
═════════════════════════════════ */
function showReactionPicker(event, msgId) {
  event.stopPropagation();
  _ctxMsgId = msgId;

  var picker = document.getElementById('reaction-picker');
  if (!picker) return;

  // position
  var x = event.clientX || 0;
  var y = event.clientY || 0;
  if (event.touches && event.touches[0]) {
    x = event.touches[0].clientX;
    y = event.touches[0].clientY;
  }

  picker.style.display = 'flex';

  // keep in viewport
  setTimeout(function() {
    var pw = picker.offsetWidth  || 200;
    var ph = picker.offsetHeight || 40;
    if (x + pw > window.innerWidth)  x = window.innerWidth - pw - 10;
    if (y - ph - 10 < 0)            y = y + 40;
    else                             y = y - ph - 10;
    if (x < 0) x = 10;
    picker.style.top  = y + 'px';
    picker.style.left = x + 'px';
  }, 10);
}

function addReaction(type) {
  if (!_ctxMsgId) return;
  toggleReaction(_ctxMsgId, type);
  var picker = document.getElementById('reaction-picker');
  if (picker) picker.style.display = 'none';
}

function toggleReaction(msgId, type) {
  var groups = getGroups();
  for (var g = 0; g < groups.length; g++) {
    if (groups[g].id !== currentGroupId) continue;
    for (var m = 0; m < groups[g].messages.length; m++) {
      if (groups[g].messages[m].id !== msgId) continue;
      var msg = groups[g].messages[m];
      if (!msg.reactions) msg.reactions = {};
      if (!msg.reactions[type]) msg.reactions[type] = [];
      var idx = msg.reactions[type].indexOf(currentUser.username);
      if (idx === -1) {
        msg.reactions[type].push(currentUser.username);
      } else {
        msg.reactions[type].splice(idx, 1);
        if (msg.reactions[type].length === 0) delete msg.reactions[type];
      }
      saveGroups(groups);
      renderGroupChat(groups[g]);
      return;
    }
  }
}

function getReactionEmoji(type) {
  return { like:'👍', heart:'❤️', think:'🤔', celebrate:'⭐', question:'❓' }[type] || '👍';
}


/* ═══════════════════════════════
   SEND MESSAGE
═════════════════════════════════ */
function sendGroupMessage() {
  if (!currentUser || !currentGroupId) return;
  var group = findGroup(currentGroupId);
  if (!group || !group.chatEnabled) { toast('چت غیرفعال است', 'warn'); return; }

  var inputEl = document.getElementById('group-chat-input');
  var text    = inputEl ? inputEl.value.trim() : '';

  if (!text && !_pendingFile && !_pendingImage && !_pendingVoice) return;

  var msg = {
    id:          'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    username:    currentUser.username,
    displayName: currentUser.displayName || currentUser.username,
    text:        text || null,
    timestamp:   Date.now(),
    reactions:   {}
  };

  if (_pendingFile) {
    msg.file      = _pendingFile;
    _pendingFile  = null;
    hidePreview('chat-file-preview');
  }

  if (_pendingImage) {
    msg.image      = _pendingImage;
    _pendingImage  = null;
  }

  if (_pendingVoice) {
    msg.voice      = _pendingVoice;
    _pendingVoice  = null;
    hidePreview('chat-voice-preview');
  }

  if (replyingToMsg) {
    msg.replyTo = {
      id:       replyingToMsg.id,
      username: replyingToMsg.displayName || replyingToMsg.username,
      text:     replyingToMsg.text ? replyingToMsg.text.substring(0, 80) :
                replyingToMsg.image ? '📷 تصویر' :
                replyingToMsg.file ? '📎 ' + replyingToMsg.file.name :
                replyingToMsg.voice ? '🎤 پیام صوتی' : ''
    };
    cancelReply();
  }

  var groups = getGroups();
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].id === currentGroupId) {
      if (!groups[i].messages) groups[i].messages = [];
      groups[i].messages.push(msg);
      saveGroups(groups);
      break;
    }
  }

  if (inputEl) inputEl.value = '';
  renderGroupChat(findGroup(currentGroupId));
}


/* ═══════════════════════════════
   FILE UPLOAD — mobile fix
═════════════════════════════════ */
function triggerChatFileUpload() {
  closeAttachmentMenu();
  setTimeout(function() {
    var inp = document.getElementById('chat-file-input');
    if (inp) { inp.value = ''; inp.click(); }
  }, 100);
}

function handleChatFile(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    _pendingFile = {
      name:          file.name,
      sizeFormatted: formatFileSize(file.size),
      size:          file.size,
      type:          file.type,
      data:          e.target.result
    };

    var preview = document.getElementById('chat-file-preview');
    var nameEl  = document.getElementById('file-preview-name');
    var sizeEl  = document.getElementById('file-preview-size');
    var iconEl  = document.getElementById('file-preview-icon');

    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatFileSize(file.size);
    if (iconEl) iconEl.innerHTML = getFileIcon(file.name);
    if (preview) preview.style.display = '';

    var caption = document.getElementById('file-caption-input');
    if (caption) caption.value = '';

    var input = document.getElementById('group-chat-input');
    if (input) input.focus();
  };
  reader.readAsDataURL(file);
}

function cancelFileUpload() {
  _pendingFile = null;
  hidePreview('chat-file-preview');
  var inp = document.getElementById('chat-file-input');
  if (inp) inp.value = '';
}


/* ═══════════════════════════════
   IMAGE UPLOAD — mobile fix + inline
═════════════════════════════════ */
function triggerChatImageUpload() {
  closeAttachmentMenu();
  setTimeout(function() {
    var inp = document.getElementById('chat-image-input');
    if (inp) { inp.value = ''; inp.click(); }
  }, 100);
}

function handleChatImage(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    compressImage(e.target.result, 800, 0.8, function(compressed) {
      _pendingImage = compressed;
      sendGroupMessage(); // auto-send
    });
  };
  reader.readAsDataURL(file);
}

function compressImage(dataUrl, maxW, quality, callback) {
  var img = new Image();
  img.onload = function() {
    var w = img.width, h = img.height;
    if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    callback(canvas.toDataURL('image/jpeg', quality));
  };
  img.onerror = function() { callback(dataUrl); };
  img.src = dataUrl;
}

function openImageFullscreen(src) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);' +
    'display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:20px;' +
    'animation:fadeIn 0.2s ease';
  overlay.onclick = function() { document.body.removeChild(overlay); };

  var img = document.createElement('img');
  img.src = src;
  img.style.cssText = 'max-width:95vw;max-height:92vh;border-radius:12px;object-fit:contain;' +
    'box-shadow:0 20px 60px rgba(0,0,0,0.8);animation:modalIn 0.25s ease';

  overlay.appendChild(img);
  document.body.appendChild(overlay);
}


/* ═══════════════════════════════
   VOICE RECORDING — real
═════════════════════════════════ */
function startVoiceRecord() {
  if (_isRecording) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    toast('مرورگر از ضبط صوت پشتیبانی نمی‌کند', 'warn');
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
      _isRecording  = true;
      _audioChunks  = [];
      _recordStart  = Date.now();

      var btn = document.getElementById('voice-record-btn');
      if (btn) btn.classList.add('recording');

      try { _mediaRecorder = new MediaRecorder(stream); }
      catch(e) { _mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); }

      _mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) _audioChunks.push(e.data);
      };

      _mediaRecorder.onstop = function() {
        stream.getTracks().forEach(function(t) { t.stop(); });
        var blob = new Blob(_audioChunks, { type: 'audio/webm' });
        var reader = new FileReader();
        reader.onload = function(ev) {
          var duration = Math.round((Date.now() - _recordStart) / 1000);
          if (duration < 1) { toast('ضبط خیلی کوتاه بود', 'warn'); return; }
          _pendingVoice = { data: ev.target.result, duration: duration };
          sendGroupMessage();
        };
        reader.readAsDataURL(blob);
      };

      _mediaRecorder.start();

      var preview    = document.getElementById('chat-voice-preview');
      var durationEl = document.getElementById('voice-preview-duration');
      if (preview) preview.style.display = '';
      _recordTimer = setInterval(function() {
        var elapsed = Math.round((Date.now() - _recordStart) / 1000);
        if (durationEl) durationEl.textContent = formatDuration(elapsed);
      }, 1000);

      toast('در حال ضبط… رها کنید تا ارسال شود', 'info');
    })
    .catch(function(err) {
      console.error('Mic error:', err);
      toast('دسترسی به میکروفون رد شد — لطفاً اجازه دهید', 'warn');
    });
}

function stopVoiceRecord() {
  if (!_isRecording || !_mediaRecorder) return;
  _isRecording = false;
  clearInterval(_recordTimer);
  var btn = document.getElementById('voice-record-btn');
  if (btn) btn.classList.remove('recording');
  if (_mediaRecorder.state !== 'inactive') _mediaRecorder.stop();
}

function cancelVoiceRecord() {
  if (_isRecording) {
    _isRecording = false;
    clearInterval(_recordTimer);
    var btn = document.getElementById('voice-record-btn');
    if (btn) btn.classList.remove('recording');
    if (_mediaRecorder && _mediaRecorder.state !== 'inactive') _mediaRecorder.stop();
  }
  _pendingVoice = null;
  hidePreview('chat-voice-preview');
}

function renderVoiceMessage(msg) {
  var id   = msg.id;
  var dur  = msg.voice ? msg.voice.duration : 0;
  var data = msg.voice ? msg.voice.data : '';
  var bars = '';
  for (var i = 0; i < 24; i++) {
    bars += '<span style="height:' + (Math.floor(Math.random() * 16) + 4) + 'px"></span>';
  }
  var html = '<div class="chat-msg-voice">';
  html += '  <button class="voice-play-btn" data-id="' + id + '" data-playing="false">';
  html += '    <svg class="play-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
  html += '    <svg class="pause-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="display:none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  html += '  </button>';
  html += '  <div class="voice-waveform" id="waveform-' + id + '">' + bars + '</div>';
  html += '  <span class="voice-duration">' + formatDuration(dur) + '</span>';
  html += '</div>';
  html += '<audio id="audio-' + id + '" preload="none"><source src="' + data + '" type="audio/webm"></audio>';
  return html;
}

// delegated voice play (works after innerHTML)
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.voice-play-btn');
  if (!btn) return;
  var msgId = btn.getAttribute('data-id');
  if (msgId) toggleVoicePlayback(btn, msgId);
});

function toggleVoicePlayback(btn, msgId) {
  var audio = document.getElementById('audio-' + msgId);
  if (!audio) return;

  if (_currentAudio && _currentAudio !== audio) {
    _currentAudio.pause();
    _currentAudio.currentTime = 0;
    if (_currentBtn) {
      _currentBtn.setAttribute('data-playing', 'false');
      var pi = _currentBtn.querySelector('.play-icon');
      var pa = _currentBtn.querySelector('.pause-icon');
      if (pi) pi.style.display = '';
      if (pa) pa.style.display = 'none';
      _currentBtn.classList.remove('playing');
    }
    clearInterval(_progressTimer);
    resetWaveforms();
  }

  var isPlaying = btn.getAttribute('data-playing') === 'true';

  if (isPlaying) {
    audio.pause();
    btn.setAttribute('data-playing', 'false');
    btn.querySelector('.play-icon').style.display  = '';
    btn.querySelector('.pause-icon').style.display = 'none';
    btn.classList.remove('playing');
    clearInterval(_progressTimer);
    _currentAudio = null; _currentBtn = null;
  } else {
    audio.play();
    btn.setAttribute('data-playing', 'true');
    btn.querySelector('.play-icon').style.display  = 'none';
    btn.querySelector('.pause-icon').style.display = '';
    btn.classList.add('playing');
    _currentAudio = audio; _currentBtn = btn;

    var waveform = document.getElementById('waveform-' + msgId);
    if (waveform) {
      var spans = waveform.querySelectorAll('span');
      _progressTimer = setInterval(function() {
        if (!audio.duration) return;
        var pct = audio.currentTime / audio.duration;
        var activeIdx = Math.floor(pct * spans.length);
        for (var i = 0; i < spans.length; i++) {
          spans[i].classList.toggle('active', i <= activeIdx);
        }
      }, 100);
    }

    audio.onended = function() {
      btn.setAttribute('data-playing', 'false');
      btn.querySelector('.play-icon').style.display  = '';
      btn.querySelector('.pause-icon').style.display = 'none';
      btn.classList.remove('playing');
      clearInterval(_progressTimer);
      resetWaveforms();
      _currentAudio = null; _currentBtn = null;
    };
  }
}

function resetWaveforms() {
  var all = document.querySelectorAll('.voice-waveform span.active');
  for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
}


/* ═══════════════════════════════
   REPLY
═════════════════════════════════ */
function replyToMessage(msgId) {
  var group = findGroup(currentGroupId);
  if (!group) return;
  var msg = null;
  for (var i = 0; i < group.messages.length; i++) {
    if (group.messages[i].id === msgId) { msg = group.messages[i]; break; }
  }
  if (!msg) return;

  replyingToMsg = msg;
  var preview = document.getElementById('chat-reply-preview');
  var nameEl  = document.getElementById('reply-preview-name');
  var textEl  = document.getElementById('reply-preview-text');
  if (nameEl) nameEl.textContent = msg.displayName || msg.username;
  if (textEl) textEl.textContent = msg.text ? msg.text.substring(0, 80) :
    msg.image ? '📷 تصویر' : msg.file ? '📎 ' + msg.file.name : msg.voice ? '🎤 صوت' : '';
  if (preview) preview.style.display = '';

  var input = document.getElementById('group-chat-input');
  if (input) input.focus();
}

function cancelReply() {
  replyingToMsg = null;
  hidePreview('chat-reply-preview');
}

function cancelEdit() {
  editingMsgId = null;
  hidePreview('chat-edit-preview');
}


/* ═══════════════════════════════
   CONTEXT MENU
═════════════════════════════════ */
function showMsgContextMenu(event, msgId) {
  event.preventDefault();
  event.stopPropagation();
  _ctxMsgId = msgId;

  var menu = document.getElementById('msg-context-menu');
  if (!menu) return;
  menu.style.display = 'flex';

  var x = event.clientX || 0;
  var y = event.clientY || 0;

  setTimeout(function() {
    var mw = menu.offsetWidth  || 170;
    var mh = menu.offsetHeight || 220;
    if (x + mw > window.innerWidth)  x = window.innerWidth - mw - 10;
    if (y + mh > window.innerHeight) y = window.innerHeight - mh - 10;
    if (x < 0) x = 10;
    if (y < 0) y = 10;
    menu.style.top  = y + 'px';
    menu.style.left = x + 'px';
  }, 10);
}

function ctxReplyToMsg() { hideMsgContextMenu(); replyToMessage(_ctxMsgId); }
function ctxEditMsg()    { hideMsgContextMenu(); toast('ویرایش — بزودی', 'info'); }
function ctxPinMsg()     { hideMsgContextMenu(); toast('پین — بزودی', 'info'); }

function ctxCopyMsg() {
  hideMsgContextMenu();
  var group = findGroup(currentGroupId);
  if (!group) return;
  for (var i = 0; i < group.messages.length; i++) {
    if (group.messages[i].id === _ctxMsgId) {
      var txt = group.messages[i].text || '';
      if (navigator.clipboard && txt) navigator.clipboard.writeText(txt);
      toast('متن کپی شد', 'success');
      return;
    }
  }
}

function ctxDeleteMsg() {
  hideMsgContextMenu();
  if (!_ctxMsgId) return;
  if (!confirm('این پیام حذف شود؟')) return;

  var groups = getGroups();
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].id !== currentGroupId) continue;
    var isAdmin = isAdminOrOwner(groups[i]);
    groups[i].messages = groups[i].messages.filter(function(m) {
      if (m.id !== _ctxMsgId) return true;
      return !(m.username === (currentUser && currentUser.username) || isAdmin);
    });
    saveGroups(groups);
    renderGroupChat(groups[i]);
    toast('پیام حذف شد', 'info');
    return;
  }
}

function hideMsgContextMenu() {
  var menu = document.getElementById('msg-context-menu');
  if (menu) menu.style.display = 'none';
}


/* ═══════════════════════════════
   ATTACHMENT MENU
═════════════════════════════════ */
function toggleAttachmentMenu() {
  var menu = document.getElementById('attachment-menu');
  if (!menu) return;
  if (menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = '';
  } else {
    menu.style.display = 'none';
  }
}

function closeAttachmentMenu() {
  var menu = document.getElementById('attachment-menu');
  if (menu) menu.style.display = 'none';
}


/* ═══════════════════════════════
   CHAT SEARCH — complete
═════════════════════════════════ */
var _searchIdx = 0;
var _searchResults = [];

function toggleChatSearch() {
  var bar   = document.getElementById('chat-search-bar');
  var input = document.getElementById('chat-search-input');
  if (!bar) return;

  if (bar.style.display === 'none' || bar.style.display === '') {
    bar.style.display = '';
    if (input) { input.value = ''; input.focus(); }
    clearSearchHighlights();
  } else {
    bar.style.display = 'none';
    clearSearchHighlights();
  }
}

function searchChatMessages(query) {
  clearSearchHighlights();
  _searchResults = [];
  _searchIdx = 0;

  if (!query || !query.trim()) return;

  var q = query.trim().toLowerCase();
  var msgEls = document.querySelectorAll('.chat-msg');

  for (var i = 0; i < msgEls.length; i++) {
    var textEl = msgEls[i].querySelector('.chat-msg-text');
    if (!textEl) continue;
    if (textEl.textContent.toLowerCase().indexOf(q) !== -1) {
      _searchResults.push(msgEls[i]);
      textEl.classList.add('search-highlight');
    }
  }

  if (_searchResults.length > 0) {
    _searchResults[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    _searchResults[0].classList.add('search-active');
    toast(_searchResults.length + ' نتیجه یافت شد', 'info');
  } else {
    toast('نتیجه‌ای یافت نشد', 'warn');
  }
}

function clearSearchHighlights() {
  var highlighted = document.querySelectorAll('.search-highlight');
  for (var i = 0; i < highlighted.length; i++) highlighted[i].classList.remove('search-highlight');
  var actives = document.querySelectorAll('.search-active');
  for (var j = 0; j < actives.length; j++) actives[j].classList.remove('search-active');
}

function scrollChatToBottom() {
  var c = document.getElementById('group-chat-messages');
  if (c) c.scrollTop = c.scrollHeight;
}


/* ═══════════════════════════════
   KEYBOARD
═════════════════════════════════ */
function handleChatKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendGroupMessage();
  }
  // search nav: Enter in search
  if (event.key === 'Enter' && event.target.id === 'chat-search-input') {
    event.preventDefault();
    if (_searchResults.length > 0) {
      _searchIdx = (_searchIdx + 1) % _searchResults.length;
      _searchResults[_searchIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}


/* ═══════════════════════════════
   TOGGLES
═════════════════════════════════ */
function togglePinnedMessages() {
  var area = document.getElementById('chat-pinned-area');
  if (area) area.style.display = area.style.display === 'none' ? '' : 'none';
}


/* ═══════════════════════════════
   HELPERS
═════════════════════════════════ */
function hidePreview(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; }
function formatDuration(sec) { return Math.floor(sec / 60) + ':' + padZero(sec % 60); }
function formatFileSize(bytes) { if (bytes < 1024) return bytes + ' B'; if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB'; return (bytes/1048576).toFixed(1) + ' MB'; }
function escapeHtml(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function padZero(n) { return n < 10 ? '0' + n : '' + n; }
function getFileIcon(name) { var ext = (name||'').split('.').pop().toLowerCase(); var c = 'var(--accent)'; if (['jpg','jpeg','png','gif','webp'].indexOf(ext)!==-1) c='var(--accent-5)'; if (['pdf'].indexOf(ext)!==-1) c='var(--danger)'; return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'; }


/* ═══════════════════════════════
   GLOBAL CLICK — close menus
═════════════════════════════════ */
document.addEventListener('click', function(e) {
  // context menu
  var ctx = document.getElementById('msg-context-menu');
  if (ctx && !ctx.contains(e.target) && !e.target.closest('.msg-action-btn')) ctx.style.display = 'none';

  // reaction picker
  var picker = document.getElementById('reaction-picker');
  if (picker && !picker.contains(e.target) && !e.target.closest('.msg-action-btn')) picker.style.display = 'none';

  // attachment menu
  var attach = document.getElementById('attachment-menu');
  if (attach && !attach.contains(e.target) && !e.target.closest('[onclick*="toggleAttachment"]')) attach.style.display = 'none';
});

// delegated reaction chip click
document.addEventListener('click', function(e) {
  var chip = e.target.closest('.msg-reaction-chip');
  if (!chip) return;
  var msgId = chip.getAttribute('data-msgid');
  var reaction = chip.getAttribute('data-reaction');
  if (msgId && reaction) toggleReaction(msgId, reaction);
});
