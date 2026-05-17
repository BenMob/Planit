# Planit

Desktop app for budgeting expenses for events — trips, parties, and any activity that needs money allocation.

**Repository:** [github.com/BenMob/Planit](https://github.com/BenMob/Planit)

## Stack

- **Electron** — desktop shell
- **React + Vite + TypeScript** — UI
- **Tailwind CSS** — styling
- **SQLite** (`planit.db` in app user data) — local storage
- **Drizzle ORM** — schema and migrations
- **Recharts** — expense charts

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (Windows)

```bat
deploy.bat   REM optimizes icons, builds portable exe, copies to Desktop (see .env.local)
clean.bat    REM removes out/, release/, and other build artifacts
npm run icons  REM resize icon.png + generate icon.ico (also runs before dist/deploy)
```

Build uses `compression: maximum` and English-only Electron locales to reduce portable exe size.

Copy `.env.example` to `.env.local` and set `PLANIT_DEPLOY_DIR` to your Desktop path.

## Bills

Planit includes a **global Bills** view (separate from Events) for tracking monthly bills:

- **All Bills** — CRUD, due day, auto-pay, status (paid / due / upcoming)
- **Payments** — record amount and date
- **Dashboard** — pie chart, summary cards, and bills table (highest to lowest)

Auto-pay runs on app startup and when you open any Bills page.

## Data

The database file is stored at:

- **Windows:** `%APPDATA%/planit/planit.db`
- **macOS:** `~/Library/Application Support/planit/planit.db`
- **Linux:** `~/.config/planit/planit.db`

All CRUD goes through Electron IPC; the renderer never touches the filesystem or database directly.
