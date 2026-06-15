/* ══════════════════════════════════════════
   AD SYSTEM
══════════════════════════════════════════ */
function shouldShowAds(){if(!settings)return true;if(settings.isPremium)return false;if(settings.adsDismissedUntil>Date.now())return false;return true;}
function renderAdVisibility(){document.querySelectorAll('.ad-banner,.ad-sidebar,.ad-inline').forEach(ad=>{ad.style.display=shouldShowAds()?'block':'none';});}
function showAdPopup(){if(!shouldShowAds())return;const popup=document.getElementById('ad-popup-overlay');if(popup)popup.style.display='flex';}
function dismissAdPopup(){const popup=document.getElementById('ad-popup-overlay');if(popup)popup.style.display='none';}
function dismissAdsForSession(){settings.adsDismissedUntil=Date.now()+3600000;saveSettings();renderAdVisibility();dismissAdPopup();}
function purchasePremium(){settings.isPremium=true;saveSettings();applySettings();renderSettings();renderAdVisibility();dismissAdPopup();toast('اشتراک پرمیوم فعال شد!','achievement');}
/* ══════════════════════════════════════════
   AD BANNER
══════════════════════════════════════════ */
function closeAdBanner() {
  const el = document.getElementById('ad-banner-top');
  if (el) el.style.display = 'none';
}
/* ══════════════════════════════════════════
   SUBSCRIPTION MODAL
══════════════════════════════════════════ */
function openSubscriptionModal() {
  const modal = document.getElementById('subscription-modal');
  if (modal) modal.classList.add('open');
}

function selectPlan(plan) {
  document.querySelectorAll('.subscription-plan').forEach(p => p.classList.remove('selected'));
  const cards = document.querySelectorAll('.subscription-plan');
  if (plan === 'monthly' && cards[0]) cards[0].classList.add('selected');
  if (plan === 'yearly' && cards[1]) cards[1].classList.add('selected');
}
function purchasePremium() {
  settings.isPremium = true;
  saveSettings();
  applySettings();
  renderSettings();
  renderAdVisibility();
  dismissAdPopup();
  const subModal = document.getElementById('subscription-modal');
  if (subModal) subModal.classList.remove('open');
  toast('اشتراک پرمیوم فعال شد!', 'achievement');
}
