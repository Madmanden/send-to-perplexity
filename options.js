const DEFAULT_PROMPTS = [
  { id: "key-insights", title: "✨ Key Insights", prompt: "Extract the core ideas, actionable takeaways, and unique insights from this site, separating high-value signal from filler" },
  { id: "quick-digest", title: "🎯 Quick Digest", prompt: "Provide a concise 2-3 sentence summary explaining the main concept in clear, accessible language. Assume no prior knowledge of the topic" },
  { id: "comprehensive-summary", title: "📋 Comprehensive Summary", prompt: "Provide a structured summary with: Main topic and context; Key claims or findings; Supporting evidence; Conclusion. Keep it concise but complete" },
  { id: "critical-analysis", title: "🔍 Critical Analysis", prompt: "Analyze the main arguments presented. For each major claim: identify the evidence supporting it, potential weaknesses, and any counterarguments" },
  { id: "research-context", title: "🌐 Research Context", prompt: "Find additional sources, expert perspectives, and related research on this topic. Suggest 3-5 credible resources or viewpoints that provide more context" },
  { id: "video-learning", title: "🎥 Video Learning", prompt: "I'm interested in learning the topics in this video. Structure its content so I can maximize my learning without having to watch the video" },
  { id: "video-timestamps", title: "⏱️ Timestamped Summary", prompt: "Provide a timestamped summary of this video with 3-5 word descriptions for each major section, then list the single most valuable insight from each section" }
];

const container = document.getElementById('prompts-container');
const status = document.getElementById('status');

// Load prompts from storage or use defaults
function loadPrompts() {
  chrome.storage.local.get(['customPrompts'], (result) => {
    const prompts = result.customPrompts || DEFAULT_PROMPTS;
    renderPrompts(prompts);
  });
}

function renderPrompts(prompts) {
  container.innerHTML = '';
  prompts.forEach((p, index) => {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.innerHTML = `
      <div class="prompt-header">
        <div class="input-group">
          <label>Title (with Emoji)</label>
          <input type="text" class="prompt-title" value="${p.title}" data-id="${p.id}">
        </div>
      </div>
      <div class="input-group">
        <label>Prompt Template</label>
        <textarea class="prompt-text" data-id="${p.id}">${p.prompt}</textarea>
      </div>
    `;
    container.appendChild(card);
  });
}

// Save prompts to storage
document.getElementById('save').addEventListener('click', () => {
  const titles = document.querySelectorAll('.prompt-title');
  const texts = document.querySelectorAll('.prompt-text');
  
  const newPrompts = Array.from(titles).map((titleInput, index) => ({
    id: titleInput.dataset.id,
    title: titleInput.value,
    prompt: texts[index].value
  }));

  chrome.storage.local.set({ customPrompts: newPrompts }, () => {
    showStatus();
  });
});

// Reset to defaults
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all prompts to their default values?')) {
    chrome.storage.local.set({ customPrompts: DEFAULT_PROMPTS }, () => {
      renderPrompts(DEFAULT_PROMPTS);
      showStatus('Defaults restored!');
    });
  }
});

function showStatus(message = 'Settings saved!') {
  status.textContent = message;
  status.classList.add('show');
  setTimeout(() => {
    status.classList.remove('show');
  }, 2000);
}

document.addEventListener('DOMContentLoaded', loadPrompts);
