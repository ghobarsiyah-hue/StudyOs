/* ══════════════════════════════════════════
   ANSWER SHEET TOOL
   ⚠ openTool / closeTool تعریف نمی‌شن — از فایل اصلی استفاده می‌شه
══════════════════════════════════════════ */

var ANSWER_LABELS_4 = ['الف', 'ب', 'ج', 'د'];
var ANSWER_LABELS_5 = ['الف', 'ب', 'ج', 'د', 'ه'];
var ANSWER_KEYS_4   = ['a', 'b', 'c', 'd'];
var ANSWER_KEYS_5   = ['a', 'b', 'c', 'd', 'e'];
var answerSheetData = {};

/* ── نمایش تعداد به فارسی ── */
function updateAnswerCountDisplay() {
  var inp = document.getElementById('answer-q-count');
  if (inp) {
    var v = parseInt(inp.value) || 50;
    v = Math.max(5, Math.min(200, v));
    inp.value = v;
  }
}

/* ── تنظیم تعداد سوال ── */
function setAnswerCount(n) {
  var inp = document.getElementById('answer-q-count');
  if (!inp) return;
  inp.value = n;
  generateAnswerSheet();
}

function adjustAnswerCount(delta) {
  var inp = document.getElementById('answer-q-count');
  if (!inp) return;
  var v = parseInt(inp.value) + delta;
  v = Math.max(5, Math.min(200, v));
  inp.value = v;
  generateAnswerSheet();
}

/* ── تولید پاسخنامه ── */
function generateAnswerSheet() {
  var countEl = document.getElementById('answer-q-count');
  var gridEl  = document.getElementById('answer-sheet-grid');
  var guideEl = document.getElementById('answer-sheet-guide');
  var resultEl = document.getElementById('answer-sheet-result');
  if (!countEl || !gridEl) return;

  var count = parseInt(countEl.value) || 50;
  count = Math.max(5, Math.min(200, count));

  var optCountSel = document.getElementById('answer-options-count');
  var optCount = optCountSel ? parseInt(optCountSel.value) : 4;

  var labels = optCount === 5 ? ANSWER_LABELS_5 : ANSWER_LABELS_4;
  var keys   = optCount === 5 ? ANSWER_KEYS_5   : ANSWER_KEYS_4;

  // به‌روزرسانی راهنما
  if (guideEl) {
    var guideHtml = '';
    var guideColors = ['guide-dot-a', 'guide-dot-b', 'guide-dot-c', 'guide-dot-d', 'guide-dot-e'];
    for (var i = 0; i < labels.length; i++) {
      guideHtml += '<span class="answer-guide-item"><span class="answer-guide-dot ' + guideColors[i] + '"></span>' + labels[i] + '</span>';
    }
    guideEl.innerHTML = guideHtml;
  }

  // ذخیره انتخاب‌های قبلی
  var prevSelections = {};
  for (var k in answerSheetData) {
    if (answerSheetData[k] && answerSheetData[k].selected) {
      prevSelections[k] = answerSheetData[k].selected;
    }
  }
  answerSheetData = {};

  // ساخت گرید
  var html = '';
  for (var q = 1; q <= count; q++) {
    var prevSel = prevSelections[q] || null;

    html += '<div class="answer-item" id="answer-item-' + q + '">';
    html += '  <div class="answer-item-num">' + toPersianNum(q) + '</div>';
    html += '  <div class="answer-options">';

    for (var o = 0; o < keys.length; o++) {
      var selClass = prevSel === keys[o] ? ' selected' : '';
      html += '<button class="answer-opt' + selClass + '" ';
      html += 'data-q="' + q + '" data-key="' + keys[o] + '" ';
      html += 'onclick="selectAnswer(' + q + ',\'' + keys[o] + '\')" ';
      html += 'title="' + labels[o] + '">';
      html += labels[o];
      html += '</button>';
    }

    html += '  </div>';
    html += '  <div class="answer-item-key">';
    html += '    <button class="answer-key-btn" data-type="correct" onclick="markAnswerKey(' + q + ',\'correct\')" title="پاسخ صحیح">';
    html += '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
    html += '    </button>';
    html += '    <button class="answer-key-btn" data-type="wrong" onclick="markAnswerKey(' + q + ',\'wrong\')" title="پاسخ غلط">';
    html += '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    answerSheetData[q] = { selected: prevSel, key: null };
  }

  gridEl.innerHTML = html;

  if (resultEl) resultEl.style.display = 'none';
}

/* ── انتخاب گزینه ── */
function selectAnswer(qNum, key) {
  if (!answerSheetData[qNum]) answerSheetData[qNum] = { selected: null, key: null };
  answerSheetData[qNum].selected = key;

  var item = document.getElementById('answer-item-' + qNum);
  if (!item) return;

  var opts = item.querySelectorAll('.answer-opt');
  for (var i = 0; i < opts.length; i++) {
    opts[i].classList.remove('selected');
    if (opts[i].getAttribute('data-key') === key) {
      opts[i].classList.add('selected');
    }
  }
}

/* ── علامت‌گذاری کلید پاسخ ── */
function markAnswerKey(qNum, type) {
  if (!answerSheetData[qNum]) answerSheetData[qNum] = { selected: null, key: null };
  answerSheetData[qNum].key = type;

  var item = document.getElementById('answer-item-' + qNum);
  if (!item) return;

  var btns = item.querySelectorAll('.answer-key-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('mark-correct', 'mark-wrong');
  }

  var targetBtn = item.querySelector('.answer-key-btn[data-type="' + type + '"]');
  if (targetBtn) {
    targetBtn.classList.add(type === 'correct' ? 'mark-correct' : 'mark-wrong');
  }
}

/* ── پاک کردن ── */
function clearAnswerSheet() {
  if (!confirm('همه پاسخ‌ها پاک شوند؟')) return;

  var opts = document.querySelectorAll('.answer-opt');
  for (var i = 0; i < opts.length; i++) {
    opts[i].classList.remove('selected', 'correct', 'wrong');
  }

  var btns = document.querySelectorAll('.answer-key-btn');
  for (var j = 0; j < btns.length; j++) {
    btns[j].classList.remove('mark-correct', 'mark-wrong');
  }

  var items = document.querySelectorAll('.answer-item');
  for (var k = 0; k < items.length; k++) {
    items[k].classList.remove('evaluated-correct', 'evaluated-wrong', 'evaluated-blank');
  }

  for (var q in answerSheetData) {
    if (answerSheetData[q]) {
      answerSheetData[q].selected = null;
      answerSheetData[q].key = null;
    }
  }

  var resultEl = document.getElementById('answer-sheet-result');
  if (resultEl) resultEl.style.display = 'none';

  toast('پاسخنامه پاک شد', 'info');
}

/* ── تصحیح ── */
function evaluateAnswerSheet() {
  var correctCount = 0;
  var wrongCount   = 0;
  var blankCount   = 0;
  var noKeyCount   = 0;
  var total        = 0;

  var negativeSel  = document.getElementById('answer-negative-mark');
  var negativeRatio = negativeSel ? parseFloat(negativeSel.value) : 0;

  for (var q in answerSheetData) {
    var data = answerSheetData[q];
    if (!data) continue;
    total++;

    var item = document.getElementById('answer-item-' + q);
    if (!item) continue;

    item.classList.remove('evaluated-correct', 'evaluated-wrong', 'evaluated-blank');

    var optBtns = item.querySelectorAll('.answer-opt');
    for (var i = 0; i < optBtns.length; i++) {
      optBtns[i].classList.remove('correct', 'wrong');
    }

    var hasSelection = !!data.selected;
    var key = data.key;

    if (!key) {
      noKeyCount++;
      if (!hasSelection) {
        blankCount++;
        item.classList.add('evaluated-blank');
      }
      continue;
    }

    if (!hasSelection) {
      blankCount++;
      item.classList.add('evaluated-blank');
    } else if (key === 'correct') {
      correctCount++;
      item.classList.add('evaluated-correct');
      for (var j = 0; j < optBtns.length; j++) {
        if (optBtns[j].getAttribute('data-key') === data.selected) {
          optBtns[j].classList.add('correct');
        }
      }
    } else {
      wrongCount++;
      item.classList.add('evaluated-wrong');
      for (var m = 0; m < optBtns.length; m++) {
        if (optBtns[m].getAttribute('data-key') === data.selected) {
          optBtns[m].classList.add('wrong');
        }
      }
    }
  }

  // محاسبه درصد
  var rawScore = correctCount - (wrongCount * negativeRatio);
  var percent  = total > 0 ? Math.max(0, (rawScore / total) * 100) : 0;

  // نمایش نتیجه
  var correctEl = document.getElementById('answer-correct-count');
  var wrongEl   = document.getElementById('answer-wrong-count');
  var blankEl   = document.getElementById('answer-blank-count');
  var scoreEl   = document.getElementById('answer-score-percent');
  var resultEl  = document.getElementById('answer-sheet-result');

  if (correctEl) correctEl.textContent = toPersianNum(correctCount);
  if (wrongEl)   wrongEl.textContent   = toPersianNum(wrongCount);
  if (blankEl)   blankEl.textContent   = toPersianNum(blankCount);
  if (scoreEl)   scoreEl.textContent   = '٪' + toPersianNum(Math.round(percent));
  if (resultEl)  resultEl.style.display = 'block';

  if (resultEl) resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  if (noKeyCount > 0) {
    toast(toPersianNum(noKeyCount) + ' سوال کلید پاسخ ندارد', 'warn');
  } else {
    toast('تصحیح انجام شد', 'success');
  }
}

/* ── تبدیل عدد به فارسی ── */
function toPersianNum(n) {
  if (n === null || n === undefined) return '—';
  var d = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).replace(/\d/g, function(c) { return d[parseInt(c)]; });
}
