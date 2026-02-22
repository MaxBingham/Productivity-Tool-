const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('timeBlocker', {
  getPlan: (dateStr) => ipcRenderer.invoke('getPlan', dateStr),
  setPlan: (dateStr, blocks) => ipcRenderer.invoke('setPlan', dateStr, blocks),
  getTodaySegments: (dateStr) => ipcRenderer.invoke('getTodaySegments', dateStr),
  getSettings: () => ipcRenderer.invoke('getSettings'),
  setSettings: (settings) => ipcRenderer.invoke('setSettings', settings)
});
