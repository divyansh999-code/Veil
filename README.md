# VEIL

> *See through the manipulation.*

Veil is a Chrome extension that uses AI to detect and expose psychological manipulation tactics on any webpage — in real time, directly on the page.

![Veil in action on Amazon](demo.png)

---

## What it does

Most websites are engineered to manipulate you into clicking, buying, or staying longer than you intended. Veil scans any page and calls out exactly what's being done to you and why.

**Detected manipulation categories:**
- Fake Urgency
- Misleading Discounts
- Guilt Tripping
- Social Proof Manipulation
- Fear of Missing Out
- Hidden Costs
- Dark Pattern Navigation
- Emotional Manipulation

---

## How it works

1. Click the Veil icon in your Chrome toolbar
2. A sidebar slides in over the page
3. Hit **Scan Page**
4. Veil sends the page content to your chosen AI provider
5. Flagged elements appear as cards with category, quoted text, and explanation

---

## Installation

Veil is not yet on the Chrome Web Store. Install it manually as an unpacked extension:

1. Clone or download this repo as a ZIP
2. Go to `chrome://extensions/` in Chrome
3. Enable **Developer Mode** (top right toggle)
4. Click **Load unpacked**
5. Select the extension folder
6. The Veil icon will appear in your toolbar

---

## Setup

1. Click the Veil icon → **Settings**
2. Choose your AI provider: **Groq**, **Gemini**, **OpenAI**, or **Claude**
3. Paste your API key
4. Hit Save

**Recommended: Groq** — free tier, no credit card required, very fast.
Get a free Groq key at [console.groq.com](https://console.groq.com)

---

## Tech stack

- Vanilla JavaScript — no frameworks
- Chrome Extension Manifest V3
- Shadow DOM for isolated sidebar injection
- Supports Groq, Gemini, OpenAI, and Claude APIs
- `chrome.storage.local` for secure key storage

---

## Built by

Divyansh Khandal — second year AI & Data Science student.

[LinkedIn](https://linkedin.com/in/) · [GitHub](https://github.com/)

---

*Veil doesn't store your data. Your API key never leaves your browser.*
