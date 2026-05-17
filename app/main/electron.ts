import { app, BrowserWindow, shell } from 'electron'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDatabase } from './db/drizzle'
import { registerEventHandlers } from './ipcHandlers/events'
import { registerExpenseHandlers } from './ipcHandlers/expenses'
import { registerChecklistHandlers } from './ipcHandlers/checklist'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow: BrowserWindow | null = null

function resolvePreloadPath(): string {
  const candidates = [
    path.join(__dirname, '../preload/preload.mjs'),
    path.join(__dirname, '../preload/preload.js')
  ]
  return candidates.find((p) => existsSync(p)) ?? candidates[1]
}

function resolveAppIcon(): string | undefined {
  const resourceDirs = app.isPackaged
    ? [path.join(process.resourcesPath, 'resources')]
    : [
        path.join(__dirname, '../resources'),
        path.join(__dirname, '../../resources'),
        path.join(process.cwd(), 'resources')
      ]

  const fileNames =
    process.platform === 'win32'
      ? ['icon.ico', 'icon.png']
      : process.platform === 'darwin'
        ? ['icon.icns', 'icon.png']
        : ['icon.png']

  for (const dir of resourceDirs) {
    for (const file of fileNames) {
      const iconPath = path.join(dir, file)
      if (existsSync(iconPath)) return iconPath
    }
  }

  return undefined
}

function createWindow(): void {
  const icon = resolveAppIcon()

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    backgroundColor: '#0f1419',
    titleBarStyle: 'hiddenInset',
    ...(icon ? { icon } : {}),
    webPreferences: {
      preload: resolvePreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  const dbPath = path.join(app.getPath('userData'), 'planit.db')
  initDatabase(dbPath)

  registerEventHandlers()
  registerExpenseHandlers()
  registerChecklistHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
