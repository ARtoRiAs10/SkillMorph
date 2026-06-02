# SkillMorph – AI‑Powered Personalized Learning Path Generator  

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

---

## Badges
| | |
|---|---|
| **CI** | _(no CI badges detected)_ |
| **License** | ![License: MIT](https://img.shields.io/badge/License-MIT-green.svg) |
| **Node** | ![Node.js](https://img.shields.io/badge/Node-%3E%3D%2018-brightgreen) |
| **Vite** | ![Vite](https://img.shields.io/badge/Vite-6.x-blue) |
| **React** | ![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react) |
| **Google Gemini** | ![Gemini API](https://img.shields.io/badge/Gemini-API-blue) |

---

## 📖 Overview  

SkillMorph is a modern web application that generates **custom, week‑by‑week learning roadmaps** for anyone looking to transition into a new tech role. By feeding the AI model (Google Gemini) with a user’s current skill set, target role, available study time, and preferred learning style, SkillMorph produces a structured plan that includes curated resources, weekly objectives, and hands‑on project ideas.  

The project is built with **React 19**, **Vite 6**, and **TypeScript**, making it fast to develop and easy to extend. It is ideal for:

* **Career‑switchers** who need a clear, realistic path to a new role.  
* **Self‑learners** who want a balanced mix of videos, articles, and practice.  
* **Mentors & educators** looking for a quick way to generate syllabus outlines for students.  

All heavy lifting is done on the client side; the only server‑side requirement is a valid **Gemini API key**.

---

## ✨ Features  

- **AI‑Generated Roadmaps** – Leverages Google Gemini to produce a multi‑week curriculum tailored to the user’s profile.  
- **Learning‑Style Awareness** – Supports `video`, `article`, `practice`, and `mixed` styles, automatically weighting resources.  
- **Resource Curation** – Returns a typed list of resources (`video`, `article`, `docs`, `course`, `interactive`, `project_idea`) with titles and URLs.  
- **Weekly Project Ideas** – Each week ends with a concrete mini‑project to solidify learning.  
- **Responsive UI** – Powered by Vite’s fast HMR and React 19’s concurrent rendering for a smooth experience on desktop and mobile.  
- **Environment‑Safe Configuration** – API keys are injected via Vite’s `define` and stored in `.env.local`.  
- **Extensible Type System** – All domain models (`UserInput`, `Roadmap`, `WeeklyPlan`, etc.) are defined in `types.ts`, making it trivial to add new fields.  
- **Zero‑Backend Deployment** – Can be hosted on any static‑site platform (Vercel, Netlify, GitHub Pages).  

---

## 📋 Table of Contents  

- [Project title](#skillmorph--ai-powered-personalized-learning-path-generator)  
- [Badges](#badges)  
- [Overview](#-overview)  
- [Features](#-features)  
- [Architecture / How it works](#-architecture--how-it-works)  
- [Prerequisites](#-prerequisites)  
- [Installation](#-installation)  
- [Quick Start](#-quick-start)  
- [Configuration](#-configuration)  
- [API Reference / Usage](#-api-reference--usage)  
- [Project Structure](#-project-structure)  
- [Running Tests](#-running-tests)  
- [Contributing](#-contributing)  
- [License](#-license)  

---

## 🏗️ Architecture / How it works  

```
+-------------------+          +-------------------+          +-------------------+
|   Browser (SPA)  |  <--->   |   Vite + React    |  <--->   |   Google Gemini   |
|  (index.html)    |          |   (dev server)    |          |   (LLM API)       |
+-------------------+          +-------------------+          +-------------------+
        |                               |                               |
        | 1. Load static assets         |                               |
        | 2. User fills form (UserInput)------------------------------------|
        |                               | 3. POST /generateRoadmap       |
        |                               |    (API key injected via env) |
        |                               |                               |
        |                               | 4. Gemini returns Roadmap JSON |
        |                               |                               |
        | 5. Render Roadmap & WeeklyPlan components (types.ts)               |
        +-------------------------------------------------------------------+
```

1. **Vite** serves the React application with hot‑module replacement for rapid development.  
2. The UI collects a `UserInput` object (current skills, target role, weekly time, learning style).  
3. The client sends this payload to the Gemini API using the key defined in `process.env.GEMINI_API_KEY`.  
4. Gemini returns a `Roadmap` JSON that conforms to the TypeScript interfaces in `types.ts`.  
5. React components render the roadmap, weekly plans, resources, and project suggestions.  

All data stays in the browser; no server‑side storage is required, which simplifies deployment and privacy.

---

## ⚙️ Prerequisites  

| Requirement | Minimum version | Why |
|-------------|----------------|-----|
| **Node.js** | 18.x (LTS) | Vite 6 requires Node ≥ 18. |
| **npm** | 9.x | Package manager for installing dependencies. |
| **Git** | any | For cloning the repository. |
| **Gemini API key** | – | Needed to call the LLM; store in `.env.local`. |
| **Supported OS** | macOS, Linux, Windows | Vite works cross‑platform. |

> **Note:** The project is pure JavaScript/TypeScript; no Python runtime is needed.

---

## 🚀 Installation  

```bash
# 1️⃣ Clone the repository
git clone https://github.com/ARtoRiAs10/SkillMorph.git
cd SkillMorph

# 2️⃣ Install Node dependencies
npm ci   # uses package-lock.json for reproducible installs

# 3️⃣ Create a local environment file
cp .env.example .env.local   # if .env.example exists; otherwise create manually

# 4️⃣ Add your Gemini API key
echo "GEMINI_API_KEY=YOUR_KEY_HERE" >> .env.local

# 5️⃣ Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`. Vite will automatically reload on file changes.

---

## 📖 Quick Start  

```tsx
// src/components/Demo.tsx
import { useState } from 'react';
import { UserInput, Roadmap } from '@/types';

export default function Demo() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  const handleGenerate = async () => {
    const payload: UserInput = {
      currentSkills: "HTML, CSS, basic JavaScript",
      targetRole: "Frontend Engineer",
      timePerWeek: 8,
      learningStyle: "mixed",
    };

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: JSON.stringify(payload) }] }] })
    });

    const data = await response.json();
    setRoadmap(data.roadmap as Roadmap);
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate My Roadmap</button>
      {roadmap && (
        <pre>{JSON.stringify(roadmap, null, 2)}</pre>
      )}
    </div>
  );
}
```

**Result (truncated)**  

```json
{
  "title": "Frontend Engineer Path",
  "totalWeeks": 12,
  "weeklyPlans": [
    {
      "week": 1,
      "topic": "Modern HTML & CSS",
      "objectives": ["Understand semantic HTML", "Learn Flexbox & Grid"],
      "resources": [
        { "type": "video", "title": "CSS Grid Crash Course", "url": "https://youtu.be/..." },
        { "type": "article", "title": "HTML5 Semantic Elements", "url": "https://developer.mozilla.org/..." }
      ],
      "project": {
        "title": "Responsive Portfolio",
        "description": "Build a static portfolio using Flexbox and Grid."
      }
    }
    // … more weeks …
  ]
}
```

The UI now displays a fully‑typed, week‑by‑week learning plan.

---

## 🔧 Configuration  

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_PORT` | number | `3000` | Port used by Vite dev server (can be overridden in `.env.local`). |
| `GEMINI_API_KEY` | string | – | Your private Google Gemini API key; **must** be set in `.env.local`. |
| `VITE_HOST` | string | `0.0.0.0` | Host address for dev server; useful for containerised development. |
| `REACT_STRICT_MODE` | boolean | `true` | Enables React Strict Mode; can be toggled in `main.tsx`. |

All environment variables are injected via Vite’s `define` block in `vite.config.ts`.

---

## 📚 API Reference / Usage  

### Types (`src/types.ts`)

| Export | Description |
|--------|-------------|
| `LearningStyle` | Union type: `'video' | 'articles' | 'practice' | 'mixed'`. |
| `UserInput` | Shape of the data sent to Gemini: `currentSkills`, `targetRole`, `timePerWeek`, `learningStyle`. |
| `Resource` | Individual learning material (`type`, `title`, `url`). |
| `WeeklyPlan` | One week of the roadmap: `week`, `topic`, `objectives`, `resources`, `project`. |
| `Roadmap` | Top‑level object: `title`, `totalWeeks`, `weeklyPlans`. |

### Core Function (`src/api/generateRoadmap.ts`)

```ts
export async function generateRoadmap(input: UserInput): Promise<Roadmap> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: JSON.stringify(input) }] }] })
    }
  );
  const { roadmap } = await response.json();
  return roadmap as Roadmap;
}
```

**Usage**

```ts
import { generateRoadmap } from '@/api/generateRoadmap';
import { UserInput } from '@/types';

const input: UserInput = { /* … */ };
const roadmap = await generateRoadmap(input);
console.log(roadmap.title);
```

### CLI (optional)

If you add a small Node script `scripts/generate.ts`, you can run:

```bash
npm run generate -- --skills "Python, SQL" --role "Data Engineer" --hours 10 --style practice
```

*(CLI not shipped yet – placeholder for future extension.)*

---

## 🗂️ Project Structure  

```
SkillMorph/
├─ .env.local               # Local environment variables (GEMINI_API_KEY)
├─ .gitignore               # Standard Node ignores
├─ index.html               # Entry HTML
├─ package.json             # NPM manifest (React, Vite, Gemini)
├─ vite.config.ts           # Vite configuration, env injection, alias
├─ tsconfig.json            # TypeScript compiler options
├─ src/
│  ├─ main.tsx              # React entry point, mounts <App />
│  ├─ App.tsx               # Top‑level component, routing
│  ├─ components/
│  │   ├─ RoadmapViewer.tsx # Renders Roadmap → WeeklyPlan cards
│  │   └─ InputForm.tsx     # Collects UserInput
│  ├─ api/
│  │   └─ generateRoadmap.ts# Wrapper around Gemini request
│  └─ types.ts              # Domain type definitions (UserInput, Roadmap, …)
├─ public/
│  └─ assets/               # Static images, favicon, etc.
└─ README.md                # ← you are here
```

*Each file is typed with TypeScript, ensuring compile‑time safety.*

---

## 🧪 Running Tests  

The repository currently does **not** include a test suite. When tests are added (e.g., using Vitest or Jest), the standard commands will be:

```bash
npm run test          # run once
npm run test:watch    # watch mode during development
npm run test:coverage # generate coverage report
```

Feel free to contribute tests for `generateRoadmap` and UI components.

---

## 🤝 Contributing  

We welcome contributions! Follow these steps to get started:

1. **Fork** the repository and clone your fork.  
2. **Create a branch** for your feature or bugfix:  
   ```bash
   git checkout -b feat/awesome-feature
   ```
3. **Install dependencies** (`npm ci`) and **run the dev server** (`npm run dev`).  
4. **Write code** adhering to the existing TypeScript style (strict typing, `eslint`‑compatible).  
5. **Add tests** (if applicable) and ensure the existing build passes:  
   ```bash
   npm run build
   ```
6. **Commit** with a clear message following the Conventional Commits format.  
7. **Push** to your fork and open a **Pull Request** against `main`.  
8. PR reviewers may ask for minor changes; iterate until approval.  

**Code style**:  
* Use 2‑space indentation.  
* Prefer functional React components with hooks.  
* Keep the public API (functions in `src/api`) stable.  

---

## 📄 License  

This project is licensed under the **MIT License** – see the `LICENSE` file for details.