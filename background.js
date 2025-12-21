// Background service worker for the extension

// Default prompt for quick send
const DEFAULT_PROMPT = "Extract the core ideas, actionable takeaways, and unique insights from this site, separating high-value signal from filler";

// Prompt options
const PROMPTS = [
  { id: "key-insights", title: "✨ Key Insights", prompt: "Extract the core ideas, actionable takeaways, and unique insights from this site, separating high-value signal from filler" },
  { id: "quick-digest", title: "🎯 Quick Digest", prompt: "Provide a concise 2-3 sentence summary explaining the main concept in clear, accessible language. Assume no prior knowledge of the topic" },
  { id: "comprehensive-summary", title: "📋 Comprehensive Summary", prompt: "Provide a structured summary with: Main topic and context; Key claims or findings; Supporting evidence; Conclusion. Keep it concise but complete" },
  { id: "critical-analysis", title: "🔍 Critical Analysis", prompt: "Analyze the main arguments presented. For each major claim: identify the evidence supporting it, potential weaknesses, and any counterarguments" },
  { id: "research-context", title: "🌐 Research Context", prompt: "Find additional sources, expert perspectives, and related research on this topic. Suggest 3-5 credible resources or viewpoints that provide more context" },
  { id: "video-learning", title: "🎥 Video Learning", prompt: "I'm interested in learning the topics in this video. Structure its content so I can maximize my learning without having to watch the video" }
];

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
  let currentUrl;

  if (tabId) {
    const tab = await chrome.tabs.get(tabId);
    currentUrl = tab.url;
  } else {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentUrl = tab.url;
  }

  const query = encodeURIComponent(`${prompt}: ${currentUrl}`);
  const perplexityUrl = `https://www.perplexity.ai/search?q=${query}`;

  chrome.tabs.create({ url: perplexityUrl });
}

// Handle extension icon click - quick send with last used prompt
chrome.action.onClicked.addListener(async (tab) => {
  const data = await chrome.storage.local.get(['lastPromptMeta']);
  const promptMeta = data.lastPromptMeta || {
    type: 'preset',
    id: 'key-insights',
    text: DEFAULT_PROMPT
  };
  await sendToPerplexity(promptMeta.text);
});

// Create context menus on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Send to Perplexity extension installed');

  // Initialize storage with default prompt
  chrome.storage.local.get(['lastPromptMeta'], (result) => {
    if (!result.lastPromptMeta) {
      savePromptMeta('preset', 'key-insights', DEFAULT_PROMPT);
    }
  });

  // Create a menu item for each prompt
  PROMPTS.forEach(promptOption => {
    chrome.contextMenus.create({
      id: promptOption.id,
      title: promptOption.title,
      contexts: ["page"]
    });
  });

  // Add custom prompt menu item
  chrome.contextMenus.create({
    id: "custom-prompt",
    title: "✏️ Custom prompt...",
    contexts: ["page"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // Handle custom prompt option
  if (info.menuItemId === "custom-prompt") {
    // Save the current tab URL for the popup to use
    await chrome.storage.local.set({ currentTabUrl: tab.url });
    chrome.windows.create({
      url: 'custom-prompt.html',
      type: 'popup',
      width: 420,
      height: 230
    });
    return;
  }

  // Handle preset prompts
  const selectedPrompt = PROMPTS.find(p => p.id === info.menuItemId);
  if (selectedPrompt) {
    // Save to storage
    await savePromptMeta('preset', selectedPrompt.id, selectedPrompt.prompt);
    // Send to Perplexity
    await sendToPerplexity(selectedPrompt.prompt, tab.id);
  }
});
