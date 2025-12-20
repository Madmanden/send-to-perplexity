// Handle preset prompt clicks
document.querySelectorAll('.prompt-option').forEach(option => {
  option.addEventListener('click', async () => {
    const prompt = option.dataset.prompt;
    await sendToPerplexity(prompt);
  });
});

// Handle custom prompt
document.getElementById('sendCustom').addEventListener('click', async () => {
  const customPrompt = document.getElementById('customPrompt').value.trim();
  if (customPrompt) {
    await sendToPerplexity(customPrompt);
    // Save the custom prompt for next time
    chrome.storage.local.set({ lastCustomPrompt: customPrompt });
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
