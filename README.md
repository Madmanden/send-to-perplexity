# Send to Perplexity - Chrome Extension

A Chrome extension that lets you instantly send the current page URL to Perplexity for AI-powered analysis.

## Features

- **Smart Quick Send:** Click the extension icon to use your last-used prompt (defaults to Key Insights)
- **7 Optimized Prompts** (via right-click context menu):
  - ✨ Key Insights - Extract core ideas, actionable takeaways, and unique insights, separating signal from filler
  - 🎯 Quick Digest - 2-3 sentence summary in accessible language
  - 📋 Comprehensive Summary - Structured overview with topic, claims, evidence, and conclusion
  - 🔍 Critical Analysis - Analyze arguments with evidence evaluation and counterarguments
  - 🌐 Research Context - Find 3-5 credible sources and expert perspectives
  - 🎥 Video Learning - Structure video content for learning without watching
  - ⏱️ Timestamped Summary - Video summaries with timestamps and insights

- **Customizable:** Add, edit, delete, and reorder prompts via the options page
- **Memory:** Remembers your last used prompt for quick access
- **Context Menu Access:** Right-click anywhere for all options
- **Omnibox Search:** Type `p` + Tab in address bar for quick Perplexity searches

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the folder that contains `manifest.json` (the repo folder)

## Usage

### Quick Send (Last Used Prompt)
1. Navigate to any webpage
2. Click the extension icon
3. Perplexity opens with your last-used prompt (defaults to "Key Insights" on first use)

### Choose a Preset Prompt
1. Navigate to any webpage
2. Right-click anywhere on the page
3. Select one of the preset prompt options from the context menu
4. Perplexity opens in a new tab with your chosen prompt

The extension remembers your last-used prompt for quick access via the icon button.

### Customize Prompts
1. Right-click the extension icon and select "Options"
2. Add new prompts with the "Add New Prompt" button
3. Edit existing prompt titles and text
4. Drag and drop prompts to reorder them
5. Delete prompts you don't need
6. Click "Save Changes" to apply
7. Use "Reset to Defaults" to restore the original 7 prompts

### Omnibox Search (Address Bar)
Type `p` + Tab in the Chrome address bar, then:
- `your query` - Search Perplexity normally
- `r your query` - Search Reddit only (adds `site:reddit.com`)

Omnibox searches update the current active tab.

Examples:
- `p best coffee shops` → Searches Perplexity for "best coffee shops"
- `p r best coffee shops` → Searches Reddit for "best coffee shops"

## Files

- `manifest.json` - Extension configuration (Manifest V3)
- `constants.js` - Shared constants and default prompts
- `perplexity.js` - Shared Perplexity URL/query builder used by the background script
- `background.js` - Service worker (main functionality, context menus, storage)
- `options.html` / `options.js` - Options page for customizing prompts

## Privacy

This extension:
- Only accesses the current tab's URL when you explicitly use it
- Stores your prompts and last-used prompt locally in your browser only
- Does not send data to any server except Perplexity (via URL parameters)
- Does not use Perplexity's API
- No telemetry, analytics, or tracking of any kind
- All data stays on your device

## Troubleshooting

- If you try to run the extension on a non-`http(s)` page (for example `chrome://extensions`), the extension will refuse to run and briefly show a `!` badge on the toolbar icon.
- If the generated query becomes too long, the extension truncates the page URL to stay within URL length limits.

## License

MIT
