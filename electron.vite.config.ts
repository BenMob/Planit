import { cpSync, existsSync } from 'fs'
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

function copyMigrationsPlugin(): Plugin {
  return {
    name: 'copy-migrations',
    closeBundle() {
      const src = resolve(__dirname, 'app/main/db/migrations')
      const dest = resolve(__dirname, 'out/main/db/migrations')
      cpSync(src, dest, { recursive: true })
    }
  }
}

function copyResourcesPlugin(): Plugin {
  return {
    name: 'copy-resources',
    closeBundle() {
      const src = resolve(__dirname, 'resources')
      const dest = resolve(__dirname, 'out/resources')
      if (existsSync(src)) {
        cpSync(src, dest, { recursive: true })
      }
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copyMigrationsPlugin(), copyResourcesPlugin()],
    build: {
      rollupOptions: {
        input: {
          electron: resolve(__dirname, 'app/main/electron.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          preload: resolve(__dirname, 'app/main/preload.ts')
        }
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'app/renderer'),
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'app/renderer/index.html')
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'app/renderer')
      }
    }
  }
})
