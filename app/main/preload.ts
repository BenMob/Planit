import { contextBridge, ipcRenderer } from 'electron'
import type { Event, Expense, ChecklistItem, Bill } from './db/schema'
import type { BillSummary } from './services/billLogic'

export interface PlanitAPI {
  events: {
    list: () => Promise<Event[]>
    create: (data: { name: string; description?: string }) => Promise<Event>
    update: (data: { id: string; name: string; description?: string }) => Promise<Event>
    delete: (data: { id: string }) => Promise<{ success: boolean }>
  }
  expenses: {
    listByEvent: (data: { eventId: string }) => Promise<Expense[]>
    create: (data: {
      eventId: string
      name: string
      amount: number
      category: string
      notes?: string
    }) => Promise<Expense>
    update: (data: {
      id: string
      name: string
      amount: number
      category: string
      notes?: string
    }) => Promise<Expense>
    delete: (data: { id: string }) => Promise<{ success: boolean }>
  }
  checklist: {
    listByEvent: (data: { eventId: string }) => Promise<ChecklistItem[]>
    create: (data: { eventId: string; label: string }) => Promise<ChecklistItem>
    update: (data: { id: string; label?: string; done?: boolean }) => Promise<ChecklistItem>
    delete: (data: { id: string }) => Promise<{ success: boolean }>
  }
  bills: {
    list: () => Promise<Bill[]>
    create: (data: {
      name: string
      amountDue: number
      dueDate: number
      autoPay: boolean
    }) => Promise<Bill>
    update: (data: {
      id: string
      name: string
      amountDue: number
      dueDate: number
      autoPay: boolean
    }) => Promise<Bill>
    delete: (data: { id: string }) => Promise<{ success: boolean }>
    recordPayment: (data: {
      id: string
      amountPaid: number
      paidDate?: string
    }) => Promise<Bill>
    processAutoPay: () => Promise<{ autoPaid: string[] }>
    summary: () => Promise<BillSummary>
  }
}

const api: PlanitAPI = {
  events: {
    list: () => ipcRenderer.invoke('events:list'),
    create: (data) => ipcRenderer.invoke('events:create', data),
    update: (data) => ipcRenderer.invoke('events:update', data),
    delete: (data) => ipcRenderer.invoke('events:delete', data)
  },
  expenses: {
    listByEvent: (data) => ipcRenderer.invoke('expenses:listByEvent', data),
    create: (data) => ipcRenderer.invoke('expenses:create', data),
    update: (data) => ipcRenderer.invoke('expenses:update', data),
    delete: (data) => ipcRenderer.invoke('expenses:delete', data)
  },
  checklist: {
    listByEvent: (data) => ipcRenderer.invoke('checklist:listByEvent', data),
    create: (data) => ipcRenderer.invoke('checklist:create', data),
    update: (data) => ipcRenderer.invoke('checklist:update', data),
    delete: (data) => ipcRenderer.invoke('checklist:delete', data)
  },
  bills: {
    list: () => ipcRenderer.invoke('bills:list'),
    create: (data) => ipcRenderer.invoke('bills:create', data),
    update: (data) => ipcRenderer.invoke('bills:update', data),
    delete: (data) => ipcRenderer.invoke('bills:delete', data),
    recordPayment: (data) => ipcRenderer.invoke('bills:recordPayment', data),
    processAutoPay: () => ipcRenderer.invoke('bills:processAutoPay'),
    summary: () => ipcRenderer.invoke('bills:summary')
  }
}

contextBridge.exposeInMainWorld('api', api)
