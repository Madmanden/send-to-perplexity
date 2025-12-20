const promptInput = document.getElementById('promptInput');
const sendBtn = document.getElementById('sendBtn');

// Load last custom prompt and focus input
chrome.storage.local.get(['lastCustomPrompt'], (result) => {
  if (result.lastCustomPrompt) {
    promptInput.value = result.lastCustomPrompt;
  }
  // Update button state after loading
  sendBtn.disabled = promptInput.value.trim() === '';
  promptInput.focus();
  promptInput.select();
});

// Handle send button click
sendBtn.addEventListener('click', async () => {
  const customPrompt = promptInput.value.trim();
  if (customPrompt) {
    // Get the tab URL that was saved when opening this popup
    const data = await chrome.storage.local.get(['currentTabUrl']);
    const tabUrl = data.currentTabUrl;

    // Save to storage
    await chrome.storage.local.set({
      lastCustomPrompt: customPrompt,
      lastPromptMeta: {
        type: 'custom',
        id: null,
        text: customPrompt
      }
    });

    // Send to Perplexity
    const query = encodeURIComponent(`${customPrompt}: ${tabUrl}`);
    const perplexityUrl = `https://www.perplexity.ai/search?q=${query}`;
    chrome.tabs.create({ url: perplexityUrl });

    // Close popup window
    window.close();
  }
});

// Handle Enter key (with Shift for newlines)
promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

// Handle ESC key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.close();
  }
});

// Disable button if input is empty
promptInput.addEventListener('input', () => {
  sendBtn.disabled = promptInput.value.trim() === '';
});

// Initial button state
sendBtn.disabled = promptInput.value.trim() === '';
