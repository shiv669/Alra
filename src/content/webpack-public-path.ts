/**
 * Webpack Public Path Configuration for Chrome Extension
 * 
 * This file sets up the correct public path for webpack chunks
 * to load from the extension's context instead of the webpage's context.
 * 
 * CRITICAL: This must be imported FIRST in content.ts before any dynamic imports
 */

// Set webpack's public path to use chrome.runtime.getURL for chunk loading
// This ensures chunks load from chrome-extension:// URLs instead of the webpage
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
  // Get the extension's base URL
  const extensionURL = chrome.runtime.getURL('/');
  
  // Set webpack's public path dynamically
  // @ts-ignore - __webpack_public_path__ is a webpack global
  __webpack_public_path__ = extensionURL;
  
  console.log('✅ ALRA: Webpack public path set to:', extensionURL);
} else {
  console.warn('⚠️ ALRA: chrome.runtime.getURL not available, chunks may not load correctly');
}

export {}; // Make this a module
