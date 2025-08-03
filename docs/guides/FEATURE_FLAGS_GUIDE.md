# Feature Flags Guide - RSC Web Platform

## Overview

The RSC Web Platform now includes a feature flags system that allows you to easily enable or disable specific features without modifying the code. This is particularly useful for hiding the bank functionality until it's ready for production.

## Current Feature Flags

### Bank Features
- `BANK_ENABLED`: Controls the visibility of bank functionality (currently **DISABLED**)
- `QR_PAYMENTS_ENABLED`: Controls QR payment features (currently **DISABLED**)
- `CONTACTLESS_PAYMENTS_ENABLED`: Controls contactless payment features (currently **DISABLED**)
- `AUTO_CONVERSION_ENABLED`: Controls automatic currency conversion (currently **DISABLED**)

### Other Features
- `STAKING_V2_ENABLED`: Controls staking functionality (currently **ENABLED**)
- `P2P_TRADING_ENABLED`: Controls P2P trading (currently **ENABLED**)
- `WALLET_V2_ENABLED`: Controls wallet functionality (currently **ENABLED**)

## How to Use

### Method 1: Admin Panel (Recommended)

1. **Open the Admin Panel**: Press `Ctrl + Shift + A` on any page
2. **Toggle Features**: Use the checkboxes to enable/disable features
3. **Changes Apply Immediately**: No page refresh needed
4. **Close Panel**: Press `Ctrl + Shift + A` again or click the × button

### Method 2: Code Modification

Edit `assets/js/feature-flags.js` and change the values:

```javascript
const FEATURE_FLAGS = {
  BANK_ENABLED: true,  // Set to true to enable bank features
  // ... other flags
};
```

### Method 3: Browser Console

Open browser console and run:

```javascript
// Enable bank features
setFeatureFlag('BANK_ENABLED', true);
showBankFeatures();

// Disable bank features
setFeatureFlag('BANK_ENABLED', false);
hideBankFeatures();
```

## What Gets Hidden When Bank is Disabled

When `BANK_ENABLED` is set to `false`:

1. **Navigation Links**: All "Bank" links in the navigation menu are hidden
2. **Homepage Content**: Bank-related content on the homepage is hidden
3. **Direct Access**: Users can still access `bank.html` directly, but it won't appear in navigation

## Future Activation

To activate the bank functionality in a future update:

1. **Option A**: Use the admin panel (`Ctrl + Shift + A`) and toggle `BANK_ENABLED` to `true`
2. **Option B**: Edit `assets/js/feature-flags.js` and set `BANK_ENABLED: true`
3. **Option C**: Use browser console: `setFeatureFlag('BANK_ENABLED', true)`

## Adding New Feature Flags

To add a new feature flag:

1. Add it to the `FEATURE_FLAGS` object in `assets/js/feature-flags.js`
2. Create corresponding show/hide functions if needed
3. The admin panel will automatically pick up new flags

Example:
```javascript
const FEATURE_FLAGS = {
  // ... existing flags
  NEW_FEATURE_ENABLED: false,
};
```

## Troubleshooting

### Admin Panel Not Working
- Make sure you're pressing `Ctrl + Shift + A` (not `Cmd` on Mac)
- Check browser console for any JavaScript errors
- Ensure `feature-flags.js` and `admin-panel.js` are loaded

### Features Not Hiding/Showing
- Refresh the page after changing flags via code
- Check that the feature flag functions are properly defined
- Verify the CSS selectors in `hideBankFeatures()` and `showBankFeatures()`

### Console Errors
- Check that all required scripts are loaded in the correct order
- Ensure `feature-flags.js` is loaded before `admin-panel.js`

## Security Notes

- The admin panel is for development/testing purposes
- In production, consider removing or securing the admin panel
- Feature flags are client-side only - server-side validation is still needed
- The bank.html file still exists and is accessible directly

## File Structure

```
assets/js/
├── feature-flags.js      # Feature flags configuration
├── admin-panel.js        # Admin panel interface
└── ... (other scripts)

HTML files
├── index.html           # Main page with feature flags
├── bank.html           # Bank page (hidden when disabled)
└── ... (other pages)
```

## Quick Reference

| Action | Method |
|--------|--------|
| Enable Bank | `Ctrl + Shift + A` → Toggle `BANK_ENABLED` |
| Disable Bank | `Ctrl + Shift + A` → Untoggle `BANK_ENABLED` |
| Check Status | `Ctrl + Shift + A` → View current flags |
| Reset | Refresh page (resets to default values) |
| Debug | Browser console: `getAllFeatureFlags()` | 