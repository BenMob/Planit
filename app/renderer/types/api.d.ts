import type { PlanitAPI } from '../../main/preload'

declare global {
  interface Window {
    api: PlanitAPI
  }
}

export {}
