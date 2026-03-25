import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPerplexitySearchQueryUrl, buildPerplexitySearchUrl } from '../perplexity.js';
import { PERPLEXITY_SEARCH_URL } from '../constants.js';

function encodedQueryLength(url) {
  const query = url.slice(PERPLEXITY_SEARCH_URL.length);
  return encodeURIComponent(decodeURIComponent(query)).length;
}

test('buildPerplexitySearchUrl truncates emoji input without throwing', () => {
  const prompt = 'Investigate 😀😀😀😀😀😀😀😀😀😀';
  const pageUrl = 'https://example.com/' + '🧪'.repeat(200);

  const result = buildPerplexitySearchUrl({
    prompt,
    pageUrl,
    baseUrl: PERPLEXITY_SEARCH_URL,
    maxQueryLength: 120
  });

  assert.equal(result.ok, true);
  assert.equal(encodedQueryLength(result.url) <= 120, true);
});

test('buildPerplexitySearchQueryUrl truncates long omnibox queries safely', () => {
  const query = 'search 😀 ' + '🧠'.repeat(500);

  const result = buildPerplexitySearchQueryUrl({
    query,
    baseUrl: PERPLEXITY_SEARCH_URL,
    maxQueryLength: 80
  });

  assert.equal(result.ok, true);
  assert.equal(encodedQueryLength(result.url) <= 80, true);
});

test('buildPerplexitySearchUrl rejects non-http pages', () => {
  const result = buildPerplexitySearchUrl({
    prompt: 'Investigate',
    pageUrl: 'chrome://extensions',
    baseUrl: PERPLEXITY_SEARCH_URL,
    maxQueryLength: 120
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'unsupported_url');
});
