# Send to Perplexity - Chrome Extension

A Chrome extension that lets you instantly send the current page URL to Perplexity for AI-powered analysis.

## Features

- **Smart Quick Send:** Click the extension icon to use your last-used prompt (defaults to Key Insights)
- **5 Optimized Prompts** (via right-click context menu):
  - ✨ Key Insights - Extract core ideas, actionable takeaways, and unique insights, separating signal from filler
  - 🎯 Quick Digest - 2-3 sentence summary in accessible language
  - 📋 Comprehensive Summary - Structured overview with topic, claims, evidence, and conclusion
  - 🔍 Critical Analysis - Analyze arguments with evidence evaluation and counterarguments
  - 🌐 Research Context - Find 3-5 credible sources and expert perspectives

- **Custom Prompts:** Write your own prompts via context menu popup
- **Memory:** Remembers your last used prompt (preset or custom)
- **Context Menu Access:** Right-click anywhere for all options

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `perplexity-extension` folder

## Usage

### Quick Send (Last Used Prompt)
1. Navigate to any webpage
2. Click the extension icon
3. Perplexity opens with your last-used prompt (defaults to "Key Insights" on first use)

### Choose a Preset Prompt
1. Navigate to any webpage
2. Right-click anywhere on the page
3. Select one of the 5 preset prompt options from the context menu
4. Perplexity opens in a new tab with your chosen prompt

### Use a Custom Prompt
1. Navigate to any webpage
2. Right-click anywhere on the page
3. Select "Custom prompt..." from the context menu
4. Enter your custom prompt in the popup window
5. Click "Send to Perplexity" or press Enter

The extension remembers your last custom prompt and your last-used prompt (preset or custom) for quick access via the icon button.

## Files

- `manifest.json` - Extension configuration
- `background.js` - Main functionality (icon clicks, context menus, storage)
- `popup.html` / `popup.js` - Optional popup UI with all prompts
- `custom-prompt.html` / `custom-prompt.js` - Custom prompt entry popup

## Privacy

This extension:
- Only accesses the current tab's URL when you use it
- Stores your last-used prompt and custom prompts locally in your browser
- Does not send data to any server except Perplexity (via URL)
- Does not use Perplexity's API
- No telemetry or tracking

## License

MIT
