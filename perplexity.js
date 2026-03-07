export function isHttpUrl(url) {
  return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"));
}

const ELLIPSIS = "...";

function truncateToEncodedLength(value, maxEncodedLength) {
  if (maxEncodedLength <= 0) {
    return "";
  }

  if (encodeURIComponent(value).length <= maxEncodedLength) {
    return value;
  }

  const ellipsisLength = encodeURIComponent(ELLIPSIS).length;
  if (maxEncodedLength <= ellipsisLength) {
    return "";
  }

  let low = 0;
  let high = value.length;
  let best = "";

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = `${value.slice(0, mid)}${ELLIPSIS}`;
    if (encodeURIComponent(candidate).length <= maxEncodedLength) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}

export function buildPerplexitySearchUrl({
  prompt,
  pageUrl,
  baseUrl,
  maxQueryLength
}) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    return { ok: false, reason: "invalid_prompt" };
  }

  if (!isHttpUrl(pageUrl)) {
    return { ok: false, reason: "unsupported_url" };
  }

  if (typeof baseUrl !== "string" || !baseUrl) {
    return { ok: false, reason: "invalid_base_url" };
  }

  if (typeof maxQueryLength !== "number" || !Number.isFinite(maxQueryLength) || maxQueryLength <= 0) {
    return { ok: false, reason: "invalid_max_query_length" };
  }

  const promptPrefix = `${prompt}: `;
  const fullQuery = `${promptPrefix}${pageUrl}`;
  const encodedQuery = encodeURIComponent(fullQuery);

  if (encodedQuery.length <= maxQueryLength) {
    return { ok: true, url: baseUrl + encodedQuery, truncated: false };
  }

  const encodedPageUrlLength = encodeURIComponent(pageUrl).length;
  const targetUrlLength = Math.max(1, Math.floor(maxQueryLength * 0.25));
  const minPromptBudget = maxQueryLength - targetUrlLength;
  const truncatedPromptPrefix = `${truncateToEncodedLength(prompt, Math.max(0, minPromptBudget - encodeURIComponent(": ").length))}: `;
  const promptBudget = Math.min(maxQueryLength, encodeURIComponent(truncatedPromptPrefix).length);
  const remainingUrlBudget = Math.max(0, maxQueryLength - promptBudget);
  const truncatedUrl = truncateToEncodedLength(pageUrl, remainingUrlBudget);
  const truncatedQuery = encodeURIComponent(`${truncatedPromptPrefix}${truncatedUrl}`);

  return {
    ok: true,
    url: baseUrl + truncatedQuery,
    truncated: truncatedPromptPrefix !== promptPrefix || truncatedUrl !== pageUrl || encodedPageUrlLength > remainingUrlBudget
  };
}
