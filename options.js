import { DEFAULT_PROMPTS, STATUS_TIMEOUT_MS } from './constants.js';

const container = document.getElementById('prompts-container');
const status = document.getElementById('status');

// Single delegated event handler for drag operations (prevents memory leaks)
let dragoverHandler = null;

// Load prompts from storage or use defaults
function loadPrompts() {
  chrome.storage.local.get(['customPrompts'], (result) => {
    const prompts = result.customPrompts || DEFAULT_PROMPTS;
    renderPrompts(prompts);
  });
}

function renderPrompts(prompts) {
  // Clear container safely
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  prompts.forEach((p, index) => {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.draggable = true;

    // Create DOM elements safely to prevent XSS
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '⋮⋮';
    dragHandle.setAttribute('aria-label', 'Drag to reorder prompt');
    dragHandle.setAttribute('role', 'button');
    dragHandle.setAttribute('tabindex', '0');

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('data-index', index);
    deleteBtn.setAttribute('title', 'Delete prompt');
    deleteBtn.setAttribute('aria-label', `Delete prompt: ${p.title}`);
    deleteBtn.textContent = '×';

    const promptHeader = document.createElement('div');
    promptHeader.className = 'prompt-header';

    const titleInputGroup = document.createElement('div');
    titleInputGroup.className = 'input-group';

    const titleLabel = document.createElement('label');
    titleLabel.style.marginLeft = '20px';
    titleLabel.textContent = 'Title';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'prompt-title';
    titleInput.setAttribute('data-id', p.id);
    titleInput.value = p.title;

    titleInputGroup.appendChild(titleLabel);
    titleInputGroup.appendChild(titleInput);
    promptHeader.appendChild(titleInputGroup);

    const promptInputGroup = document.createElement('div');
    promptInputGroup.className = 'input-group';

    const promptLabel = document.createElement('label');
    promptLabel.style.marginLeft = '20px';
    promptLabel.textContent = 'Prompt Template';

    const promptTextarea = document.createElement('textarea');
    promptTextarea.className = 'prompt-text';
    promptTextarea.setAttribute('data-id', p.id);
    promptTextarea.value = p.prompt;

    promptInputGroup.appendChild(promptLabel);
    promptInputGroup.appendChild(promptTextarea);

    card.appendChild(dragHandle);
    card.appendChild(deleteBtn);
    card.appendChild(promptHeader);
    card.appendChild(promptInputGroup);
    
    container.appendChild(card);

    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', index);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });

    // Add keyboard support for deletion
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' && (e.target === card || e.target.classList.contains('prompt-title') || e.target.classList.contains('prompt-text'))) {
        e.preventDefault();
        if (confirm(`Delete prompt "${p.title}"?`)) {
          deletePrompt(index);
        }
      }
    });
  });

  // Remove old dragover listener to prevent memory leak
  if (dragoverHandler) {
    container.removeEventListener('dragover', dragoverHandler);
  }

  // Create and attach new dragover listener
  dragoverHandler = (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    const dragging = document.querySelector('.dragging');
    if (dragging) {
      if (afterElement == null) {
        container.appendChild(dragging);
      } else {
        container.insertBefore(dragging, afterElement);
      }
    }
  };
  container.addEventListener('dragover', dragoverHandler);

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

      // Focus management: focus on the next available prompt card
      const cards = container.querySelectorAll('.prompt-card');
      if (cards.length > 0) {
        // Focus on same index (now the next card) or the last card if we deleted the last one
        const focusIndex = Math.min(index, cards.length - 1);
        const titleInput = cards[focusIndex].querySelector('.prompt-title');
        if (titleInput) {
          titleInput.focus();
        }
      }
    });
  });
}

// Add new prompt
document.getElementById('add-prompt').addEventListener('click', () => {
  chrome.storage.local.get(['customPrompts'], (result) => {
    const prompts = result.customPrompts || [...DEFAULT_PROMPTS];
    const newPrompt = {
      id: crypto.randomUUID(),
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

  // Validate and filter out empty prompts
  const newPrompts = Array.from(titles)
    .map((titleInput, index) => ({
      id: titleInput.dataset.id,
      title: titleInput.value.trim(),
      prompt: texts[index].value.trim()
    }))
    .filter(p => p.title && p.prompt); // Remove prompts with empty title or text

  // Ensure at least one prompt exists
  if (newPrompts.length === 0) {
    showStatus('Error: At least one prompt is required', true);
    return;
  }

  chrome.storage.local.set({ customPrompts: newPrompts }, () => {
    // If prompts were filtered out, re-render to show the cleaned version
    if (newPrompts.length !== titles.length) {
      renderPrompts(newPrompts);
    }
    showStatus('Settings saved!');
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

function showStatus(message = 'Settings saved!', isError = false) {
  status.textContent = message;
  status.style.color = isError ? '#d73a49' : '#28a745';
  status.classList.add('show');
  setTimeout(() => {
    status.classList.remove('show');
  }, STATUS_TIMEOUT_MS);
}

document.addEventListener('DOMContentLoaded', loadPrompts);
