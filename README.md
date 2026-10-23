# AcadMail AI 🎓⚡
> AI-powered Email Management Extension tailored for Students & Academics.

Built with **React, TypeScript, Vite, Tailwind CSS, Manifest V3, and Google Gemini 1.5 Flash**.

---

## Features
- **Smart Categorization**: Instantly classifies incoming emails into **Academics**, **Workshops**, **Class Rescheduling**, or **General**.
- **Bullet Summaries**: 2–3 concise bullets highlighting what matters most.
- **Deadline Extraction & Calendar Sync**: Pulls due dates and provides a 1-click **"+ Google Calendar"** pre-filled event creator.
- **Meeting Detection**: Automatically detects Zoom, Google Meet, and Microsoft Teams links.
- **Suggested Quick Replies**: 1-click polite academic replies for professors and TAs.
- **Chrome Side Panel**: Seamlessly docks next to Gmail or Outlook without cluttering your inbox.
- **Manual Paste Fallback**: Paste any syllabus, announcement, or email directly into the side panel for instant analysis.

---

## How to Load into Your Browser (Chrome / Arc / Brave / Edge)

1. Open **Google Chrome** (or Arc / Brave / Edge).
2. Go to `chrome://extensions/` in the URL bar.
3. Turn **ON** the **"Developer mode"** toggle in the top-right corner.
4. Click the **"Load unpacked"** button in the top-left.
5. Select the **`dist`** folder inside this project directory:
   `/Users/ojaskumardeshmukh/Documents/antigravity/sds/dist`
6. Click the extension icon in your toolbar, paste your **Gemini API Key**, and open Gmail (`mail.google.com`)!

---

## Development

Run development build with auto-rebuild on changes:
```bash
npm run dev
```

Run production build:
```bash
npm run build
```
