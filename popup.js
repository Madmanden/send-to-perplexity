// Default prompts to use if none are stored
const DEFAULT_PROMPTS = [
  { id: "key-insights", title: "✨ Key Insights", prompt: "Extract the core ideas, actionable takeaways, and unique insights from this site, separating high-value signal from filler" },
  { id: "quick-digest", title: "🎯 Quick Digest", prompt: "Provide a concise 2-3 sentence summary explaining the main concept in clear, accessible language. Assume no prior knowledge of the topic" },
  { id: "comprehensive-summary", title: "📋 Comprehensive Summary", prompt: "Provide a structured summary with: Main topic and context; Key claims or findings; Supporting evidence; Conclusion. Keep it concise but complete" },
  { id: "critical-analysis", title: "🔍 Critical Analysis", prompt: "Analyze the main arguments presented. For each major claim: identify the evidence supporting it, potential weaknesses, and any counterarguments" },
  { id: "research-context", title: "🌐 Research Context", prompt: "Find additional sources, expert perspectives, and related research on this topic. Suggest 3-5 credible resources or viewpoints that provide more context" },
  { id: "video-learning", title: "🎥 Video Learning", prompt: "I'm interested in learning the topics in this video. Structure its content so I can maximize my learning without having to watch the video" },
  { id: "video-timestamps", title: "⏱️ Timestamped Summary", prompt: "Provide a timestamped summary of this video with 3-5 word descriptions for each major section, then list the single most valuable insight from each section" }
];

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
    
    // Create a simplified preview from the prompt
    const previewText = p.prompt.length > 50 ? p.prompt.substring(0, 47) + '...' : p.prompt;
    
    option.innerHTML = `
      <div class="prompt-title">${p.title}</div>
      <div class="prompt-preview">${previewText}</div>
    `;
    
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

document.addEventListener('DOMContentLoaded', initPopup);
