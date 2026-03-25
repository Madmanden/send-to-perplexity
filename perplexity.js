export function isHttpUrl(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
}

const ELLIPSIS = '...';

function encodedLength(value) {
  return encodeURIComponent(value).length;
}

function truncateToEncodedLength(value, maxEncodedLength) {
  if (maxEncodedLength <= 0) {
    return '';
  }

  if (encodedLength(value) <= maxEncodedLength) {
    return value;
  }

  const ellipsisLength = encodedLength(ELLIPSIS);
  if (maxEncodedLength <= ellipsisLength) {
    return '';
  }

  const characters = Array.from(value);
  let low = 0;
  let high = characters.length;
  let best = '';

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = `${characters.slice(0, mid).join('')}${ELLIPSIS}`;
    if (encodedLength(candidate) <= maxEncodedLength) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}

function buildEncodedUrl(baseUrl, query) {
  return baseUrl + encodeURIComponent(query);
}

export function buildPerplexitySearchQueryUrl({
  query,
  baseUrl,
  maxQueryLength
}) {
  if (typeof query !== 'string' || !query.trim()) {
    return { ok: false, reason: 'invalid_query' };
  }

  if (typeof baseUrl !== 'string' || !baseUrl) {
    return { ok: false, reason: 'invalid_base_url' };
  }

  if (typeof maxQueryLength !== 'number' || !Number.isFinite(maxQueryLength) || maxQueryLength <= 0) {
    return { ok: false, reason: 'invalid_max_query_length' };
  }

  const trimmedQuery = query.trim();
  if (encodedLength(trimmedQuery) <= maxQueryLength) {
    return { ok: true, url: buildEncodedUrl(baseUrl, trimmedQuery), truncated: false };
  }

  const truncatedQuery = truncateToEncodedLength(trimmedQuery, maxQueryLength);
  if (!truncatedQuery) {
    return { ok: false, reason: 'query_budget_too_small' };
  }

  return {
    ok: true,
    url: buildEncodedUrl(baseUrl, truncatedQuery),
    truncated: truncatedQuery !== trimmedQuery
  };
}

export function buildPerplexitySearchUrl({
  prompt,
  pageUrl,
  baseUrl,
  maxQueryLength
}) {
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return { ok: false, reason: 'invalid_prompt' };
  }

  if (!isHttpUrl(pageUrl)) {
    return { ok: false, reason: 'unsupported_url' };
  }

  if (typeof baseUrl !== 'string' || !baseUrl) {
    return { ok: false, reason: 'invalid_base_url' };
  }

  if (typeof maxQueryLength !== 'number' || !Number.isFinite(maxQueryLength) || maxQueryLength <= 0) {
    return { ok: false, reason: 'invalid_max_query_length' };
  }

  const trimmedPrompt = prompt.trim();
  const trimmedPageUrl = pageUrl.trim();
  const separator = ': ';
  const fullQuery = `${trimmedPrompt}${separator}${trimmedPageUrl}`;

  if (encodedLength(fullQuery) <= maxQueryLength) {
    return { ok: true, url: buildEncodedUrl(baseUrl, fullQuery), truncated: false };
  }

  const truncatedPrompt = truncateToEncodedLength(trimmedPrompt, maxQueryLength);
  if (!truncatedPrompt) {
    return { ok: false, reason: 'query_budget_too_small' };
  }

  const promptEncodedLength = encodedLength(truncatedPrompt);
  const remainingBudget = maxQueryLength - promptEncodedLength;
  const separatorEncodedLength = encodedLength(separator);

  if (remainingBudget < separatorEncodedLength) {
    return {
      ok: true,
      url: buildEncodedUrl(baseUrl, truncatedPrompt),
      truncated: true
    };
  }

  const pageBudget = remainingBudget - separatorEncodedLength;
  const truncatedPageUrl = truncateToEncodedLength(trimmedPageUrl, pageBudget);
  if (!truncatedPageUrl) {
    return {
      ok: true,
      url: buildEncodedUrl(baseUrl, truncatedPrompt),
      truncated: true
    };
  }

  const truncatedQuery = `${truncatedPrompt}${separator}${truncatedPageUrl}`;

  return {
    ok: true,
    url: buildEncodedUrl(baseUrl, truncatedQuery),
    truncated: truncatedPrompt !== trimmedPrompt || truncatedPageUrl !== trimmedPageUrl
  };
}
