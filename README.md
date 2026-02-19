# 🍽️ SplitBite

**Split bills without the awkward math.** Snap a photo of your restaurant bill, drag dishes to friends, and see who owes what — instantly.

![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ How It Works

| Step | What Happens |
|------|-------------|
| 📸 **Snap** | Take a photo or upload an image of your bill |
| 🔍 **Extract** | OCR reads every item — edit anything it gets wrong |
| 👥 **Friends** | Add everyone who's splitting the bill |
| 🎯 **Assign** | Drag & drop each dish to whoever ordered it |
| 🎉 **Split** | See per-person totals, copy & share the summary |

## 🛠 Tech Stack

- **Vanilla JS** — zero frameworks, zero bloat
- **Vite** — instant dev server & optimized builds
- **Tesseract.js** — client-side OCR (no server needed, your bill never leaves your device)
- **Custom Drag & Drop** — built from scratch, works on mobile too
- **Receipt-style UI** — warm, paper-textured design with handwritten fonts (Caveat, Gabarito, DM Mono)

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/mindninjaX/splitbite.git
cd splitbite

# Install
npm install

# Run
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and snap a bill.

## 📁 Project Structure

```
src/
├── main.js                # App entry point & state management
├── steps/
│   ├── upload.js          # Step 1 — Camera/file upload
│   ├── extract.js         # Step 2 — OCR + editable item list
│   ├── friends.js         # Step 3 — Add people with emoji avatars
│   ├── assign.js          # Step 4 — Drag dishes to friends
│   └── summary.js         # Step 5 — Per-person breakdown + confetti 🎊
├── utils/
│   ├── ocr.js             # Tesseract.js wrapper
│   ├── parser.js          # Bill text → structured items
│   ├── dishes.js          # Emoji matcher & avatar colors
│   └── drag-drop.js       # Custom drag & drop engine
└── styles/
    ├── index.css           # Design tokens & base styles
    └── components.css      # Component-level styles
```

## 🔒 Privacy

Everything runs in your browser. Your bill image is processed locally via Tesseract.js — **no data is sent to any server**.

## 📝 License

MIT — do whatever you want with it.

---

<p align="center">
  Built with 🍕 by <a href="https://github.com/mindninjaX">mindninjaX</a>
</p>
