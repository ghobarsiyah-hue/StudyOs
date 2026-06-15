/* ══════════════════════════════════════════
   TOOLS PAGE
══════════════════════════════════════════ */
function openTool(toolId){
  document.getElementById('tools-landing').style.display='none';
  document.getElementById('tools-gpa').style.display=toolId==='gpa'?'block':'none';
  document.getElementById('tools-answer-sheet').style.display=toolId==='answer-sheet'?'block':'none';
  if(toolId==='gpa')renderGpaPage();
  if(toolId==='answer-sheet'){updateAnswerCountDisplay();generateAnswerSheet();}
}
function closeTool(){
  document.getElementById('tools-landing').style.display='block';
  document.getElementById('tools-gpa').style.display='none';
  document.getElementById('tools-answer-sheet').style.display='none';
}
