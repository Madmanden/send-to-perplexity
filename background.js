// Background service worker for the extension
// Currently minimal - main functionality is in popup.js
// Can be extended in the future for background tasks

chrome.runtime.onInstalled.addListener(() => {
  console.log('Send to Perplexity extension installed');
});
