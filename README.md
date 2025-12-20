# Send to Perplexity - Chrome Extension

A Chrome extension that lets you send the current page URL to Perplexity with preset or custom prompts.

## Features

- **5 Preset Prompts:**
  - ✨ Key Insights - Extract key points, aha moments, and actionable insights
  - 📝 Summarize - Get a concise summary
  - 💡 ELI5 - Explain in simple terms
  - ⚖️ Pros & Cons - Analyze arguments
  - 🔍 Research - Find additional sources

- **Custom Prompt Mode:** Type your own prompt for maximum flexibility
- **Memory:** Remembers your last custom prompt
- **One-Click:** Opens Perplexity in a new tab with your query ready

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `perplexity-extension` folder

## Usage

1. Navigate to any webpage
2. Click the extension icon in your toolbar
3. Choose a preset prompt or enter a custom one
4. The extension opens Perplexity with your prompt + the current URL

## Files

- `manifest.json` - Extension configuration
- `popup.html` - User interface
- `popup.js` - Main functionality
- `background.js` - Service worker (minimal)

## Privacy

This extension:
- Only accesses the current tab's URL when you click it
- Stores your last custom prompt locally (optional)
- Does not send data to any server except Perplexity (via URL)
- Does not use Perplexity's API

## License

MIT
