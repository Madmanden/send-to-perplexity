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
    card.draggable = true;
    
    // Use innerHTML for structure but be careful with values
    card.innerHTML = `
      <div class="drag-handle">⋮⋮</div>
      <button class="delete-btn" data-index="${index}" title="Delete prompt">×</button>
      <div class="prompt-header">
        <div class="input-group">
          <label style="margin-left: 20px;">Title</label>
          <input type="text" class="prompt-title" data-id="${p.id}">
        </div>
      </div>
      <div class="input-group">
        <label style="margin-left: 20px;">Prompt Template</label>
        <textarea class="prompt-text" data-id="${p.id}"></textarea>
      </div>
    `;
    
    // Set values safely to prevent XSS
    card.querySelector('.prompt-title').value = p.title;
    card.querySelector('.prompt-text').value = p.prompt;
    
    container.appendChild(card);

    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', index);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    const dragging = document.querySelector('.dragging');
    if (afterElement == null) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, afterElement);
    }
  });

  // Add delete event listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      deletePrompt(index);
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.prompt-card:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function deletePrompt(index) {
  chrome.storage.local.get(['customPrompts'], (result) => {
    const prompts = result.customPrompts || [...DEFAULT_PROMPTS];
    prompts.splice(index, 1);
    chrome.storage.local.set({ customPrompts: prompts }, () => {
      renderPrompts(prompts);
      showStatus('Prompt deleted');
    });
  });
}

// Add new prompt
document.getElementById('add-prompt').addEventListener('click', () => {
  chrome.storage.local.get(['customPrompts'], (result) => {
    const prompts = result.customPrompts || [...DEFAULT_PROMPTS];
    const newPrompt = {
      id: 'custom-' + Date.now(),
      title: 'New Prompt',
      prompt: ''
    };
    prompts.push(newPrompt);
    chrome.storage.local.set({ customPrompts: prompts }, () => {
      renderPrompts(prompts);
      showStatus('New prompt added');
    });
  });
});

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
