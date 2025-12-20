// Handle preset prompt clicks
document.querySelectorAll('.prompt-option').forEach(option => {
  option.addEventListener('click', async () => {
    const prompt = option.dataset.prompt;
    const promptId = option.dataset.id;

    // Save to storage
    await chrome.storage.local.set({
      lastPromptMeta: {
        type: 'preset',
        id: promptId,
        text: prompt
      }
    });

    await sendToPerplexity(prompt);
  });
});

// Handle custom prompt
document.getElementById('sendCustom').addEventListener('click', async () => {
  const customPrompt = document.getElementById('customPrompt').value.trim();
  if (customPrompt) {
    // Save to storage
    await chrome.storage.local.set({
      lastCustomPrompt: customPrompt,
      lastPromptMeta: {
        type: 'custom',
        id: null,
        text: customPrompt
      }
    });

    await sendToPerplexity(customPrompt);
  }
});

// Load last custom prompt
chrome.storage.local.get(['lastCustomPrompt'], (result) => {
  if (result.lastCustomPrompt) {
    document.getElementById('customPrompt').value = result.lastCustomPrompt;
  }
});

// Function to send URL to Perplexity
async function sendToPerplexity(prompt) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = tab.url;
  
  const query = encodeURIComponent(`${prompt}: ${currentUrl}`);
  const perplexityUrl = `https://www.perplexity.ai/search?q=${query}`;
  
  chrome.tabs.create({ url: perplexityUrl });
  window.close(); // Close the popup after sending
}
