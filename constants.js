// Shared constants for the extension

export const DEFAULT_PROMPTS = [
  { id: "key-insights", title: "✨ Key Insights", prompt: "Extract the core ideas, actionable takeaways, and unique insights from this site, separating high-value signal from filler" },
  { id: "quick-digest", title: "🎯 Quick Digest", prompt: "Provide a concise 2-3 sentence summary explaining the main concept in clear, accessible language. Assume no prior knowledge of the topic" },
  { id: "comprehensive-summary", title: "📋 Comprehensive Summary", prompt: "Provide a structured summary with: Main topic and context; Key claims or findings; Supporting evidence; Conclusion. Keep it concise but complete" },
  { id: "critical-analysis", title: "🔍 Critical Analysis", prompt: "Analyze the main arguments presented. For each major claim: identify the evidence supporting it, potential weaknesses, and any counterarguments" },
  { id: "research-context", title: "🌐 Research Context", prompt: "Find additional sources, expert perspectives, and related research on this topic. Suggest 3-5 credible resources or viewpoints that provide more context" },
  { id: "video-learning", title: "🎥 Video Learning", prompt: "I'm interested in learning the topics in this video. Structure its content so I can maximize my learning without having to watch the video" },
  { id: "video-timestamps", title: "⏱️ Timestamped Summary", prompt: "Provide a timestamped summary of this video with 3-5 word descriptions for each major section, then list the single most valuable insight from each section" }
];

export const PERPLEXITY_SEARCH_URL = 'https://www.perplexity.ai/search?q=';

// Maximum query length to avoid URL length limits (leaving margin for base URL)
export const MAX_QUERY_LENGTH = 1800;

// Status message display timeout in milliseconds
export const STATUS_TIMEOUT_MS = 2000;
