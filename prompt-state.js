import { DEFAULT_PROMPTS } from './constants.js';

export function getValidPrompts(prompts) {
  const sourcePrompts = Array.isArray(prompts) && prompts.length > 0 ? prompts : DEFAULT_PROMPTS;
  return sourcePrompts.map(prompt => ({ ...prompt }));
}

export function resolvePromptFromMeta(promptMeta, prompts) {
  const validPrompts = getValidPrompts(prompts);

  if (promptMeta && typeof promptMeta.id === 'string') {
    const matchedPrompt = validPrompts.find(prompt => prompt.id === promptMeta.id);
    if (matchedPrompt) {
      return matchedPrompt;
    }
  }

  return validPrompts[0];
}
