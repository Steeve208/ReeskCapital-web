// Feature Flags Configuration
// This file controls which features are enabled/disabled in the application

console.log('Feature flags script loading...');

const FEATURE_FLAGS = {
  // Bank functionality - set to false to hide bank features
  BANK_ENABLED: false,
  
  // Other feature flags can be added here
  QR_PAYMENTS_ENABLED: false,
  CONTACTLESS_PAYMENTS_ENABLED: false,
  AUTO_CONVERSION_ENABLED: false,
  
  // Future features
  STAKING_V2_ENABLED: true,
  P2P_TRADING_ENABLED: true,
  WALLET_V2_ENABLED: true
};

// Function to check if a feature is enabled
function isFeatureEnabled(featureName) {
  return FEATURE_FLAGS[featureName] === true;
}

// Function to get all feature flags (for debugging)
function getAllFeatureFlags() {
  return { ...FEATURE_FLAGS };
}

// Function to enable/disable features programmatically
function setFeatureFlag(featureName, enabled) {
  if (featureName in FEATURE_FLAGS) {
    FEATURE_FLAGS[featureName] = enabled;
    console.log(`Feature flag '${featureName}' set to: ${enabled}`);
  } else {
    console.warn(`Feature flag '${featureName}' does not exist`);
  }
}

// Initialize feature flags on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Feature flags script loaded');
  console.log('BANK_ENABLED:', isFeatureEnabled('BANK_ENABLED'));
  
  // Hide bank-related elements if bank is disabled
  if (!isFeatureEnabled('BANK_ENABLED')) {
    console.log('Hiding bank features...');
    hideBankFeatures();
  }
});

// Function to hide bank features
function hideBankFeatures() {
  console.log('Executing hideBankFeatures()');
  
  // Hide bank navigation links
  const bankLinks = document.querySelectorAll('a[href="bank.html"]');
  console.log('Found bank links:', bankLinks.length);
  bankLinks.forEach((link, index) => {
    const listItem = link.closest('li');
    if (listItem) {
      listItem.style.display = 'none';
      console.log(`Hidden bank link ${index + 1}:`, link.textContent.trim());
    }
  });
  
  // Hide bank-related content in index page
  const bankProductItems = document.querySelectorAll('a[href="bank.html"].product-item');
  console.log('Found bank product items:', bankProductItems.length);
  bankProductItems.forEach((item, index) => {
    const productCard = item.closest('.product-card, .product-item');
    if (productCard) {
      productCard.style.display = 'none';
      console.log(`Hidden bank product item ${index + 1}`);
    }
  });
  
  // Also hide bank links with pages/bank.html
  const bankPagesLinks = document.querySelectorAll('a[href="pages/bank.html"]');
  console.log('Found bank pages links:', bankPagesLinks.length);
  bankPagesLinks.forEach((link, index) => {
    const listItem = link.closest('li');
    if (listItem) {
      listItem.style.display = 'none';
      console.log(`Hidden bank pages link ${index + 1}:`, link.textContent.trim());
    }
  });
  
  console.log('Bank features have been hidden');
}

// Function to show bank features (for future use)
function showBankFeatures() {
  console.log('Executing showBankFeatures()');
  
  // Show bank navigation links
  const bankLinks = document.querySelectorAll('a[href="bank.html"]');
  bankLinks.forEach(link => {
    const listItem = link.closest('li');
    if (listItem) {
      listItem.style.display = '';
    }
  });
  
  // Show bank-related content in index page
  const bankProductItems = document.querySelectorAll('a[href="bank.html"].product-item');
  bankProductItems.forEach(item => {
    const productCard = item.closest('.product-card, .product-item');
    if (productCard) {
      productCard.style.display = '';
    }
  });
  
  // Also show bank links with pages/bank.html
  const bankPagesLinks = document.querySelectorAll('a[href="pages/bank.html"]');
  bankPagesLinks.forEach(link => {
    const listItem = link.closest('li');
    if (listItem) {
      listItem.style.display = '';
    }
  });
  
  console.log('Bank features have been shown');
}

// Export for use in other scripts
window.FEATURE_FLAGS = FEATURE_FLAGS;
window.isFeatureEnabled = isFeatureEnabled;
window.getAllFeatureFlags = getAllFeatureFlags;
window.setFeatureFlag = setFeatureFlag;
window.hideBankFeatures = hideBankFeatures;
window.showBankFeatures = showBankFeatures;

// Execute immediately to hide bank features as soon as possible
if (!isFeatureEnabled('BANK_ENABLED')) {
  console.log('Immediately hiding bank features...');
  // Use setTimeout to ensure DOM is ready
  setTimeout(() => {
    hideBankFeatures();
  }, 100);
  
  // Also try after a longer delay to ensure everything is loaded
  setTimeout(() => {
    console.log('Delayed bank features hiding...');
    hideBankFeatures();
  }, 1000);
  
  // Also try on window load
  window.addEventListener('load', () => {
    console.log('Window load - hiding bank features...');
    hideBankFeatures();
  });
} 