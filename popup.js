import { DEFAULT_PROMPTS, PERPLEXITY_SEARCH_URL, MAX_QUERY_LENGTH } from './constants.js';

const promptsContainer = document.getElementById('prompts-container');

// Load and render prompts
function initPopup() {
  chrome.storage.local.get(['customPrompts'], (result) => {
    const prompts = result.customPrompts || DEFAULT_PROMPTS;
    renderPrompts(prompts);
  });
}

function renderPrompts(prompts) {
  promptsContainer.innerHTML = '';
  prompts.forEach(p => {
    const option = document.createElement('div');
    option.className = 'prompt-option';
    option.dataset.id = p.id;
    option.dataset.prompt = p.prompt;
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'prompt-title';
    titleDiv.textContent = p.title;
    
    const previewDiv = document.createElement('div');
    previewDiv.className = 'prompt-preview';
    const previewText = p.prompt.length > 50 ? p.prompt.substring(0, 47) + '...' : p.prompt;
    previewDiv.textContent = previewText;
    
    option.appendChild(titleDiv);
    option.appendChild(previewDiv);
    
    option.addEventListener('click', async () => {
      // Save to storage
      await chrome.storage.local.set({
        lastPromptMeta: {
          type: 'preset',
          id: p.id,
          text: p.prompt
        }
      });

      await sendToPerplexity(p.prompt);
    });
    
    promptsContainer.appendChild(option);
  });
}

// Function to send URL to Perplexity
async function sendToPerplexity(prompt) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
      console.error('No active tab found');
      return;
    }

    const currentUrl = tab.url;

    // Validate URL protocol
    if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
      console.error('Invalid URL protocol:', currentUrl);
      return;
    }

    const fullQuery = `${prompt}: ${currentUrl}`;
    const encodedQuery = encodeURIComponent(fullQuery);

    // Validate query length to avoid URL length limits
    if (encodedQuery.length > MAX_QUERY_LENGTH) {
      console.error('Query too long:', encodedQuery.length, 'characters');
      // Truncate the URL if needed
      const maxUrlLength = MAX_QUERY_LENGTH - encodeURIComponent(`${prompt}: `).length - 20;
      const truncatedUrl = currentUrl.substring(0, maxUrlLength) + '...';
      const truncatedQuery = encodeURIComponent(`${prompt}: ${truncatedUrl}`);
      const perplexityUrl = PERPLEXITY_SEARCH_URL + truncatedQuery;
      chrome.tabs.create({ url: perplexityUrl });
      window.close();
      return;
    }

    const perplexityUrl = PERPLEXITY_SEARCH_URL + encodedQuery;
    chrome.tabs.create({ url: perplexityUrl });
    window.close(); // Close the popup after sending
  } catch (error) {
    console.error('Error sending to Perplexity:', error);
  }
}

document.addEventListener('DOMContentLoaded', initPopup);
