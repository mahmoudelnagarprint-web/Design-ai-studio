# 🎨 NAGAR DESIGN AI STUDIO

> **Advanced AI-Powered Design, Prepress & Laser/CNC Production Suite**  
> Built with React 18, TypeScript, Tailwind CSS, Express, and Google Gemini API.

---

## 🌟 Features

- **Prompt Studio**: Advanced prompt engineering with styles, lighting, camera controls, negative prompt extraction, and SVG layout previews.
- **Image-to-Prompt**: Deconstruct any uploaded artwork into 4 prompt formats (Quick, Detailed, Production Ready, Negative).
- **Design Decomposer**: Extract color palettes (HEX), font typography matching, and layer decomposition.
- **Laser & CNC Prep**: Convert graphics to 1-bit monochrome dithering, vector contours, and contrast prep for laser engraving and cutting machines.
- **Print Prep Studio**: 300 DPI resolution validation, CMYK tone proofing, and Bleed/Trim cut guides.
- **Google Account & Credit Integration**: Multi-account quota switching with in-app direct activation and support for custom Gemini API keys.
- **Asset Library & History**: Full local project state management and asset export (SVG, PNG, JSON).

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** / **pnpm**
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Installation

Clone this repository and install dependencies:

```bash
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
cd <YOUR_REPO_NAME>
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and set your Google Gemini API key:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 4. Running the Development Server

Start the full-stack server (Express backend + Vite frontend):

```bash
npm run dev
```

Open your browser at `http://localhost:3000`.

### 5. Building for Production

```bash
npm run build
npm start
```

---

## 📂 Project Architecture

```text
├── src/
│   ├── components/
│   │   ├── layout/       # Sidebar, Topbar, Layout Shell
│   │   ├── modals/       # Google Accounts, Keys, Export Dialogs
│   │   └── views/        # Feature Views (PromptStudio, LaserPrep, PrintPrep, etc.)
│   ├── context/          # StudioContext (State management, Accounts, History)
│   ├── services/         # API client & backend communication
│   ├── types/            # TypeScript interfaces and models
│   └── App.tsx           # Main application root
├── server.ts             # Express server handling Gemini AI proxy routes
├── PROJECT_SUMMARY.md    # Detailed Arabic documentation of features & updates
└── package.json
```

---

## 📄 License
This project is licensed under the MIT License.
