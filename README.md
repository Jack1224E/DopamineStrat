# DopamineStrategy 🎮

A modern, gamified habit tracker inspired by Habitica. Built with Next.js 16, React 19, and TypeScript.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📁 Project Structure

```
DopamineStrategy/
├── app/                    # Next.js App Router pages
│   ├── globals.css         # Global styles + theme variables
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home (redirects to /today)
│   └── today/
│       └── page.tsx        # Main habit tracker page
│
├── components/
│   ├── layout/             # Layout components
│   │   ├── ClientLayout.tsx
│   │   ├── Header.tsx
│   │   └── StatsBar.tsx
│   ├── task/               # Task-related components
│   │   ├── TaskCard.tsx
│   │   ├── TaskColumn.tsx
│   │   └── TaskSection.tsx
│   └── ui/                 # shadcn/ui primitives
│       ├── button.tsx
│       └── progress.tsx
│
├── lib/                    # Utilities
│   ├── sounds.ts           # Audio effects
│   ├── theme-context.tsx   # Theme provider
│   └── utils.ts            # shadcn utilities
│
├── store/
│   └── gameStore.ts        # Zustand state management
│
├── styles/
│   └── themes.css          # CSS variable tokens
│
└── types/
    └── index.ts            # TypeScript definitions
```

---

## 🧩 Component Architecture

### Layout Components (`/components/layout/`)

| Component | Purpose |
|-----------|---------|
| **ClientLayout.tsx** | Wraps app with ThemeProvider for client-side rendering |
| **Header.tsx** | App header with branding, theme toggle, sound toggle, reset button |
| **StatsBar.tsx** | Displays avatar, HP bar, XP bar, and level |

### Task Components (`/components/task/`)

| Component | Purpose |
|-----------|---------|
| **TaskCard.tsx** | Reusable card for habits/dailies/todos. Supports compact mode with +/− buttons for habits |
| **TaskColumn.tsx** | Habitica-style vertical column with header, add input, and task list |
| **TaskSection.tsx** | Alternative section layout (not used in current UI) |

### UI Primitives (`/components/ui/`)

These are [shadcn/ui](https://ui.shadcn.com) components built on Radix primitives:

- **button.tsx** - Styled button with variants
- **progress.tsx** - Animated progress bar for HP/XP

---

## 📄 File Responsibilities

### App Layer

| File | What It Does |
|------|--------------|
| `app/layout.tsx` | Root layout, sets up fonts, imports global CSS, wraps with ClientLayout |
| `app/page.tsx` | Home route, redirects to `/today` |
| `app/today/page.tsx` | Main page, renders StatsBar and 3 TaskColumns using Zustand state |
| `app/globals.css` | Tailwind imports, theme variables (light + cyberpunk), base styles |

### State Management

| File | What It Does |
|------|--------------|
| `store/gameStore.ts` | Zustand store with: HP, XP, Level, tasks (habits/dailies/todos), sound toggle. Persists to localStorage |

### Utilities

| File | What It Does |
|------|--------------|
| `lib/theme-context.tsx` | React context for theme switching (light/cyberpunk) |
| `lib/sounds.ts` | Web Audio API for success sound effects |
| `lib/utils.ts` | `cn()` helper for merging Tailwind classes |

### Types

| File | What It Does |
|------|--------------|
| `types/index.ts` | TypeScript interfaces: `Task`, `TaskType`, `Theme`, `GameState` |

### Styles

| File | What It Does |
|------|--------------|
| `styles/themes.css` | CSS custom properties for theming (colors, shadows, radii) |

---

## 🎨 Theming

Two themes available, toggle via header button:

| Theme | Description |
|-------|-------------|
| **Light** | Clean whites, blue primary, soft shadows |
| **Cyberpunk** | Dark purple-blue, neon cyan/magenta accents, glowing borders |

Themes use CSS variables defined in `app/globals.css` and `styles/themes.css`.

---

## 🔧 Key Technologies

- **Next.js 16** - App Router, React Server Components
- **React 19** - Latest React with concurrent features
- **TypeScript** - Strict mode enabled
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Radix-based component primitives
- **Zustand** - Lightweight state management with persistence
- **Framer Motion** - Animations
- **canvas-confetti** - Celebration effects
- **Howler.js** - Audio (installed, Web Audio API used)
- **Lucide** - Icon library

---

## 🎮 Features

- ✅ HP and XP bars with level progression
- ✅ Three task types: Habits, Dailies, To-Dos
- ✅ Repeatable +/− buttons for habits
- ✅ Checkbox completion for dailies/todos
- ✅ Confetti burst on task completion
- ✅ Sound effects (toggleable)
- ✅ Add new tasks dynamically
- ✅ Dark/Light theme toggle
- ✅ Persistent state (localStorage)

---

## 📝 License

MIT
