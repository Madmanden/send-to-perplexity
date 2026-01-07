export function isHttpUrl(url) {
  return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"));
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

  const maxUrlLength = maxQueryLength - encodeURIComponent(promptPrefix).length - 20;
  const safeMaxUrlLength = Math.max(0, maxUrlLength);
  const truncatedUrl = `${pageUrl.substring(0, safeMaxUrlLength)}...`;
  const truncatedQuery = encodeURIComponent(`${promptPrefix}${truncatedUrl}`);

  return { ok: true, url: baseUrl + truncatedQuery, truncated: true };
}
