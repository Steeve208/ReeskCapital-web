// Test script for feature flags
console.log('=== FEATURE FLAGS TEST ===');

// Test if feature flags are loaded
if (typeof window.FEATURE_FLAGS !== 'undefined') {
  console.log('✅ Feature flags loaded:', window.FEATURE_FLAGS);
} else {
  console.log('❌ Feature flags not loaded');
}

// Test if bank is disabled
if (typeof window.isFeatureEnabled === 'function') {
  const bankEnabled = window.isFeatureEnabled('BANK_ENABLED');
  console.log('✅ Bank enabled:', bankEnabled);
} else {
  console.log('❌ isFeatureEnabled function not available');
}

// Test if hideBankFeatures function is available
if (typeof window.hideBankFeatures === 'function') {
  console.log('✅ hideBankFeatures function available');
} else {
  console.log('❌ hideBankFeatures function not available');
}

// Count bank links
const bankLinks = document.querySelectorAll('a[href="bank.html"]');
const bankPagesLinks = document.querySelectorAll('a[href="pages/bank.html"]');
console.log('📊 Bank links found:', bankLinks.length + bankPagesLinks.length);
console.log('   - bank.html links:', bankLinks.length);
console.log('   - pages/bank.html links:', bankPagesLinks.length);

// Check if any bank links are visible
let visibleBankLinks = 0;
bankLinks.forEach(link => {
  const listItem = link.closest('li');
  if (listItem && listItem.style.display !== 'none') {
    visibleBankLinks++;
    console.log('⚠️ Visible bank link:', link.textContent.trim());
  }
});

bankPagesLinks.forEach(link => {
  const listItem = link.closest('li');
  if (listItem && listItem.style.display !== 'none') {
    visibleBankLinks++;
    console.log('⚠️ Visible bank pages link:', link.textContent.trim());
  }
});

console.log('📊 Visible bank links:', visibleBankLinks);

if (visibleBankLinks === 0) {
  console.log('✅ All bank links are hidden');
} else {
  console.log('❌ Some bank links are still visible');
}

console.log('=== END FEATURE FLAGS TEST ==='); 