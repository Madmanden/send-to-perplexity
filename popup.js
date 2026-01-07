import { DEFAULT_PROMPTS, PERPLEXITY_SEARCH_URL, MAX_QUERY_LENGTH } from './constants.js';
import { buildPerplexitySearchUrl } from './perplexity.js';

const promptsContainer = document.getElementById('prompts-container');

function getOrCreateStatusElement() {
  let el = document.getElementById('status');
  if (el) {
    return el;
  }

  el = document.createElement('div');
  el.id = 'status';
  el.style.marginTop = '10px';
  el.style.fontSize = '12px';
  el.style.color = '#d73a49';
  el.style.display = 'none';
  promptsContainer.insertAdjacentElement('afterend', el);
  return el;
}

function showStatus(message) {
  const el = getOrCreateStatusElement();
  el.textContent = message;
  el.style.display = message ? 'block' : 'none';
}

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

    const result = buildPerplexitySearchUrl({
      prompt,
      pageUrl: currentUrl,
      baseUrl: PERPLEXITY_SEARCH_URL,
      maxQueryLength: MAX_QUERY_LENGTH
    });

    if (!result.ok) {
      console.error('Unable to build Perplexity URL:', result.reason, currentUrl);
      const message =
        result.reason === 'unsupported_url'
          ? 'Unsupported page. Open an http(s) page first.'
          : 'Unable to build Perplexity query.';
      showStatus(message);
      return;
    }

    showStatus('');
    chrome.tabs.create({ url: result.url });
    window.close(); // Close the popup after sending
  } catch (error) {
    console.error('Error sending to Perplexity:', error);
  }
}

document.addEventListener('DOMContentLoaded', initPopup);
