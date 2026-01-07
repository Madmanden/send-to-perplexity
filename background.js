// Background service worker for the extension
import { DEFAULT_PROMPTS, PERPLEXITY_SEARCH_URL, MAX_QUERY_LENGTH } from './constants.js';
import { buildPerplexitySearchUrl } from './perplexity.js';

// Current prompts in use (either defaults or user-customized)
let currentPrompts = [...DEFAULT_PROMPTS];

function showActionError(reason) {
  const message =
    reason === 'unsupported_url'
      ? 'Unsupported page'
      : reason === 'invalid_prompt'
        ? 'Invalid prompt'
        : 'Error';

  chrome.action.setBadgeBackgroundColor({ color: '#d73a49' });
  chrome.action.setBadgeText({ text: '!' });
  chrome.action.setTitle({ title: `Send to Perplexity (${message})` });

  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setTitle({ title: 'Send to Perplexity (Quick Send)' });
  }, 2500);
}

// Initialize prompts from storage
async function initPrompts() {
  const result = await chrome.storage.local.get(['customPrompts']);
  if (result.customPrompts) {
    currentPrompts = result.customPrompts;
  }
  updateContextMenus();
}

// Function to update context menus
function updateContextMenus() {
  chrome.contextMenus.removeAll(() => {
    // Ensure currentPrompts is valid
    const prompts = currentPrompts || DEFAULT_PROMPTS;

    // Create a menu item for each prompt
    prompts.forEach(promptOption => {
      chrome.contextMenus.create({
        id: promptOption.id,
        title: promptOption.title,
        contexts: ["page"]
      });
    });
  });
}

// Listen for storage changes to update currentPrompts and context menus
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.customPrompts) {
    currentPrompts = changes.customPrompts.newValue || DEFAULT_PROMPTS;
    updateContextMenus();
  }
});

// Helper function to save prompt metadata
async function savePromptMeta(type, promptId, promptText) {
  await chrome.storage.local.set({
    lastPromptMeta: {
      type: type,
      id: promptId || null,
      text: promptText
    }
  });
}

// Function to send URL to Perplexity
async function sendToPerplexity(prompt, tabId = null) {
  try {
    let currentUrl;

    if (tabId) {
      const tab = await chrome.tabs.get(tabId);
      currentUrl = tab.url;
    } else {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        console.error("No active tab found");
        return;
      }
      currentUrl = tab.url;
    }

    const result = buildPerplexitySearchUrl({
      prompt,
      pageUrl: currentUrl,
      baseUrl: PERPLEXITY_SEARCH_URL,
      maxQueryLength: MAX_QUERY_LENGTH
    });

    if (!result.ok) {
      console.error('Unable to build Perplexity URL:', result.reason, currentUrl);
      showActionError(result.reason);
      return;
    }

    chrome.action.setBadgeText({ text: '' });
    chrome.action.setTitle({ title: 'Send to Perplexity (Quick Send)' });
    chrome.tabs.create({ url: result.url });
  } catch (error) {
    console.error("Error sending to Perplexity:", error);
  }
}

function parseOmniboxInput(rawText) {
  const text = (rawText || "").trim();
  const match = text.match(/^r\s+(.*)$/i);
  if (!match) {
    return { mode: "p", query: text };
  }

  return { mode: "r", query: match[1] };
}

function buildPerplexityOmniboxQuery(mode, query) {
  const cleanedQuery = (query || "").trim();
  if (!cleanedQuery) {
    return "";
  }

  if (mode === "r") {
    return `${cleanedQuery} site:reddit.com`;
  }

  return cleanedQuery;
}

function openPerplexitySearch(query) {
  const trimmedQuery = (query || "").trim();
  if (!trimmedQuery) {
    return;
  }

  const encoded = encodeURIComponent(trimmedQuery);
  const url = PERPLEXITY_SEARCH_URL + encoded;

  // Get the active tab and update it instead of creating a new one
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      console.error("Error querying tabs:", chrome.runtime.lastError);
      chrome.tabs.create({ url });
      return;
    }

    if (tabs && tabs[0]) {
      chrome.tabs.update(tabs[0].id, { url });
    } else {
      // Fallback: create new tab if no active tab found
      chrome.tabs.create({ url });
    }
  });
}

function escapeOmniboxDescription(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Handle extension icon click - quick send with last used prompt
chrome.action.onClicked.addListener(async (tab) => {
  const data = await chrome.storage.local.get(['lastPromptMeta']);
  const promptMeta = data.lastPromptMeta || {
    type: 'preset',
    id: 'key-insights',
    text: currentPrompts[0].prompt
  };
  await sendToPerplexity(promptMeta.text);
});

// Create context menus on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Send to Perplexity extension installed');

  await initPrompts();

  // Initialize storage with default prompt metadata if not present
  chrome.storage.local.get(['lastPromptMeta'], (result) => {
    if (!result.lastPromptMeta) {
      savePromptMeta('preset', currentPrompts[0].id, currentPrompts[0].prompt);
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // Handle preset prompts
  const selectedPrompt = currentPrompts.find(p => p.id === info.menuItemId);
  if (selectedPrompt) {
    // Save to storage
    await savePromptMeta('preset', selectedPrompt.id, selectedPrompt.prompt);
    // Send to Perplexity
    await sendToPerplexity(selectedPrompt.prompt, tab.id);
  }
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  const { mode } = parseOmniboxInput(text);
  const safeText = escapeOmniboxDescription(text || "");

  const modeDescription =
    mode === "r"
      ? "Reddit"
      : "Perplexity";

  chrome.omnibox.setDefaultSuggestion({
    description: `Search Perplexity (${modeDescription}): ${safeText}`
  });

  suggest([
    { content: text || "", description: "p <query> - Perplexity search" },
    { content: `r ${text || ""}`.trim(), description: "r <query> - Reddit search" }
  ]);
});

chrome.omnibox.onInputEntered.addListener((text) => {
  const { mode, query } = parseOmniboxInput(text);
  const perplexityQuery = buildPerplexityOmniboxQuery(mode, query);
  openPerplexitySearch(perplexityQuery);
});
