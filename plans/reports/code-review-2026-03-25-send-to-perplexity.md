# Code Review — Send to Perplexity

## Scope
Reviewed the extension’s core files for logic, architecture, and docs:
- `background.js`
- `perplexity.js`
- `options.js`
- `constants.js`
- `manifest.json`
- `README.md`
- `options.html`

## Overall assessment
The extension is small and mostly cohesive, but there are a few correctness issues in the URL builder and prompt persistence flows that can break user-visible behavior. The docs are mostly in sync with the code, but they omit a couple of edge cases the implementation currently does not handle.

## Findings

### 1) Unicode truncation can throw `URIError` during URL shortening
**Files:** `perplexity.js:7-36`, `perplexity.js:39-82`

`truncateToEncodedLength()` slices the raw string by UTF-16 code unit index and immediately feeds the candidate into `encodeURIComponent()`. For strings containing astral characters (emoji, some CJK extensions, etc.), a slice can split a surrogate pair and cause `encodeURIComponent()` to throw `URIError: URI malformed`.

I reproduced this with emoji-heavy prompt/page input; the truncation path throws instead of returning a safe shortened URL.

**Impact:** Quick-send can fail outright for valid user prompts or page URLs containing emoji/astral characters when truncation is needed.

**Confidence:** 95%

---

### 2) Omnibox search bypasses the shared length guard, so long queries can still exceed browser URL limits
**Files:** `background.js:134-156`, `background.js:238-242`, `perplexity.js:39-82`, `constants.js:15-16`

The quick-send path uses `buildPerplexitySearchUrl()` and `MAX_QUERY_LENGTH`, but the omnibox path goes through `openPerplexitySearch()` and concatenates `encodeURIComponent(trimmedQuery)` directly onto `PERPLEXITY_SEARCH_URL`.

That means the documentation promise about truncation/length safety only applies to the icon/context-menu path. The omnibox can still generate arbitrarily long URLs and fail or behave unpredictably on very large inputs.

**Impact:** Inconsistent behavior between two user-facing entry points; long omnibox queries are not protected.

**Confidence:** 92%

---

### 3) Edited/reset prompts can leave `lastPromptMeta` stale, so quick-send reuses deleted or outdated text
**Files:** `background.js:63-70`, `background.js:175-181`, `options.js:218-233`

`lastPromptMeta` stores a snapshot of `{ id, text }`, and the icon click path uses `promptMeta.text` directly. The options page only updates `customPrompts`; it never reconciles `lastPromptMeta` after save or reset.

So if a user:
- selects a prompt from the context menu,
- then edits or deletes that prompt in Options, or resets to defaults,
- then clicks the extension icon,

…the icon can still send the old snapshot text instead of the currently saved prompt set.

This also weakens the README claim that the extension “remembers your last-used prompt” because it does not stay in sync with edits.

**Impact:** Quick-send can become semantically wrong after prompt edits/reset; users can unknowingly send obsolete content.

**Confidence:** 96%

---

### 4) Saving filters out blank prompts and silently deletes partially edited entries
**Files:** `options.js:198-225`

On save, the code maps all visible rows and then filters out any prompt with an empty title or empty prompt text:

```js
.filter(p => p.title && p.prompt)
```

That means a user editing a prompt can lose the entire entry just by temporarily leaving one field blank and clicking Save. There is no warning or explicit confirmation that the row will be deleted.

This is destructive behavior hidden behind a “Save Changes” action.

**Impact:** Accidental data loss / surprising UX during normal editing.

**Confidence:** 90%

## Documentation notes
- `README.md` is mostly aligned with the implemented feature set.
- It does not mention the stale-`lastPromptMeta` behavior after prompt edits/reset.
- It also implies URL-length handling broadly, but the omnibox path currently skips the shared truncation logic.

## Positive observations
- Context menu and options-page text insertion use DOM APIs instead of `innerHTML`, which is good for XSS safety.
- The codebase is small and easy to reason about.
- The shared `buildPerplexitySearchUrl()` function centralizes the main quick-send URL construction logic.
