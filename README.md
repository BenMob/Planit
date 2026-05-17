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

## Data

The database file is stored at:

- **Windows:** `%APPDATA%/planit/planit.db`
- **macOS:** `~/Library/Application Support/planit/planit.db`
- **Linux:** `~/.config/planit/planit.db`

All CRUD goes through Electron IPC; the renderer never touches the filesystem or database directly.
