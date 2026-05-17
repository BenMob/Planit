# Planit — Architecture

Desktop event budgeting app. All data stays local; the renderer never touches the filesystem or database directly.

## System overview

```mermaid
flowchart TB
  subgraph Desktop["Electron desktop app"]
    subgraph Renderer["Renderer process (React + Vite)"]
      UI["Pages & components"]
      Hooks["Hooks: useEvents, useExpenses, useChecklist, useBills"]
      UI --> Hooks
    end

    subgraph Bridge["Preload (contextBridge)"]
      API["window.api"]
    end

    subgraph Main["Main process (Node.js)"]
      Electron["electron.ts"]
      IPC["IPC handlers + Zod validation"]
      DBLayer["Drizzle ORM"]
      Electron --> IPC
      IPC --> DBLayer
    end

    Hooks -->|"ipcRenderer.invoke"| API
    API -->|"contextBridge"| IPC
  end

  subgraph Storage["Local storage"]
    SQLite[("planit.db\n(SQLite)")]
  end

  DBLayer --> SQLite

  style Renderer fill:#1a2332,stroke:#2d3a4f,color:#e5e7eb
  style Main fill:#0f1419,stroke:#3b82f6,color:#e5e7eb
  style Storage fill:#0f1419,stroke:#10b981,color:#e5e7eb
```

## Process boundaries

| Layer | Runs in | Responsibility |
|-------|---------|----------------|
| **Renderer** | Chromium (sandboxed) | UI, routing, charts, calls `window.api` only |
| **Preload** | Isolated bridge | Exposes typed `PlanitAPI` via `contextBridge` |
| **Main** | Node.js | Window lifecycle, IPC, DB access, migrations |
| **SQLite** | Disk (`userData/planit.db`) | Persistent events, expenses, checklist, bills |

## IPC request flow

```mermaid
sequenceDiagram
  participant Page as React page / hook
  participant API as window.api (preload)
  participant IPC as ipcMain handler
  participant Zod as Zod schema
  participant ORM as Drizzle
  participant DB as SQLite

  Page->>API: api.events.list()
  API->>IPC: invoke("events:list")
  IPC->>Zod: parse input (if any)
  Zod-->>IPC: validated payload
  IPC->>ORM: query / mutate
  ORM->>DB: SQL
  DB-->>ORM: rows
  ORM-->>IPC: typed result
  IPC-->>API: structured clone
  API-->>Page: Promise resolved
```

## IPC channels

```mermaid
flowchart LR
  subgraph Events
    E1["events:list"]
    E2["events:create"]
    E3["events:update"]
    E4["events:delete"]
  end

  subgraph Expenses
    X1["expenses:listByEvent"]
    X2["expenses:create"]
    X3["expenses:update"]
    X4["expenses:delete"]
  end

  subgraph Checklist
    C1["checklist:listByEvent"]
    C2["checklist:create"]
    C3["checklist:update"]
    C4["checklist:delete"]
  end

  subgraph Bills
    B1["bills:list"]
    B2["bills:create"]
    B3["bills:update"]
    B4["bills:delete"]
    B5["bills:recordPayment"]
    B6["bills:processAutoPay"]
    B7["bills:summary"]
  end

  Handlers["ipcHandlers/\nevents · expenses · checklist · bills"]
  Events --> Handlers
  Expenses --> Handlers
  Checklist --> Handlers
  Bills --> Handlers
```

Every handler validates input with **Zod** before touching the database.

## Data model

```mermaid
erDiagram
  events ||--o{ expenses : "has"
  events ||--o{ checklist_items : "has"

  events {
    text id PK
    text name
    text description
    int created_at
  }

  expenses {
    text id PK
    text event_id FK
    text name
    real amount
    text category
    text notes
    int created_at
  }

  checklist_items {
    text id PK
    text event_id FK
    text label
    int done
    int created_at
  }

  bills {
    text id PK
    text name
    real amount_due
    int due_date
    real last_paid_amount
    text last_paid_date
    int auto_pay
    int created_at
  }
```

Deleting an **event** cascades to its expenses and checklist items. **Bills** are global (no `event_id`) — separate from the event budgeting domain.

## Bills module

Global monthly bill tracking (BillDash-inspired, native to Planit):

- **Routes:** `/bills`, `/bills/payments`, `/bills/charts`
- **Logic:** [`app/main/services/billLogic.ts`](app/main/services/billLogic.ts) — validation, auto-pay, status, totals
- **Auto-pay:** runs on app start and when any Bills page loads

## UI routing

```mermaid
flowchart TD
  Home["/  Home\n(list · create · rename · delete events)"]
  Dash["/event/:id  EventDashboard\n(total · chart · expenses)"]
  List["/event/:id/checklist  Checklist\n(tasks · done/pending)"]

  Home -->|Open| Dash
  Dash -->|View Checklist| List
  List -->|Dashboard| Dash
  Dash -->|All events| Home
  List -->|All events| Home

  BillsHome["/bills  Bills list"]
  BillsPay["/bills/payments"]
  BillsCharts["/bills/charts"]

  BillsHome --> BillsPay
  BillsHome --> BillsCharts
  BillsPay --> BillsHome
  BillsCharts --> BillsHome
```

Header nav: **Events** | **Bills** (sibling top-level areas).

## Repository layout

```mermaid
flowchart TB
  root["planit/"]

  root --> main["app/main/"]
  root --> renderer["app/renderer/"]

  main --> electron["electron.ts"]
  main --> preload["preload.ts"]
  main --> ipc["ipcHandlers/"]
  main --> db["db/"]

  db --> schema["schema.ts"]
  db --> drizzle["drizzle.ts"]
  db --> migrations["migrations/"]

  renderer --> pages["pages/"]
  renderer --> components["components/"]
  renderer --> hooks["hooks/"]
  renderer --> utils["utils/"]

  pages --> home["Home"]
  pages --> dash["EventDashboard"]
  pages --> checklist["Checklist"]
  pages --> billsPages["bills/ Bills · Payments · Charts"]

  main --> billLogic["services/billLogic.ts"]
```

## Build & runtime

```mermaid
flowchart LR
  Dev["npm run dev\nelectron-vite"]
  Build["npm run build"]

  Dev --> MainOut["out/main/"]
  Dev --> PreloadOut["out/preload/"]
  Dev --> RendererDev["Vite dev server\n:5173"]

  Build --> Dist["out/\n(main · preload · renderer)"]

  MainOut --> ElectronApp["Electron app"]
  PreloadOut --> ElectronApp
  RendererDev --> ElectronApp
  Dist --> ElectronApp

  ElectronApp --> UserData["%APPDATA%/planit/planit.db"]
```

## Security model

- **contextIsolation: true** — renderer cannot access Node or `ipcRenderer` directly
- **nodeIntegration: false** — no Node APIs in the UI bundle
- **Preload-only API** — single surface (`window.api`) for all data operations
- **No network backend** — no remote API; SQLite file is local to the machine
