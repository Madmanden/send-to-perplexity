import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PROMPTS } from '../constants.js';
import { getValidPrompts, resolvePromptFromMeta } from '../prompt-state.js';

const customPrompts = [
  { id: 'key-insights', title: 'Key Insights', prompt: 'Updated text' },
  { id: 'custom', title: 'Custom', prompt: 'Custom prompt text' }
];

test('getValidPrompts falls back to defaults when storage is empty', () => {
  const result = getValidPrompts(null);

  assert.deepEqual(result, DEFAULT_PROMPTS);
});

test('resolvePromptFromMeta uses the latest saved text for the matching prompt id', () => {
  const prompt = resolvePromptFromMeta({ type: 'preset', id: 'key-insights' }, customPrompts);

  assert.deepEqual(prompt, customPrompts[0]);
});

test('resolvePromptFromMeta falls back to the first prompt when the stored prompt no longer exists', () => {
  const prompt = resolvePromptFromMeta({ type: 'preset', id: 'deleted-prompt' }, customPrompts);

  assert.deepEqual(prompt, customPrompts[0]);
});
