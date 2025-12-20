# Send to Perplexity - Chrome Extension

A Chrome extension that lets you instantly send the current page URL to Perplexity for AI-powered analysis.

## Features

- **Quick Send:** Click the extension icon to instantly send the page with the default prompt
- **5 Preset Prompts** (via right-click context menu):
  - ✨ Key Insights - Extract key points, aha moments, and actionable insights (default)
  - 📝 Summarize - Get a concise summary
  - 💡 ELI5 - Explain in simple terms
  - ⚖️ Pros & Cons - Analyze arguments
  - 🔍 Research - Find additional sources

- **Fast & Simple:** No popup to slow you down
- **Context Menu Access:** Right-click anywhere for all prompt options

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `perplexity-extension` folder

## Usage

### Quick Send (Default Prompt)
1. Navigate to any webpage
2. Click the extension icon
3. Perplexity opens in a new tab with the "Key Insights" prompt

### Choose a Different Prompt
1. Navigate to any webpage
2. Right-click anywhere on the page
3. Select one of the "Send to Perplexity" prompt options from the context menu
4. Perplexity opens in a new tab with your chosen prompt

## Files

- `manifest.json` - Extension configuration
- `background.js` - Main functionality (icon clicks, context menus)
- `popup.html` / `popup.js` - Unused (legacy files)

## Privacy

This extension:
- Only accesses the current tab's URL when you click it
- Stores your last custom prompt locally (optional)
- Does not send data to any server except Perplexity (via URL)
- Does not use Perplexity's API

## License

MIT
