const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('habitMosaicDesktop', {
  getSettings: () => ipcRenderer.invoke('desktop:get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('desktop:save-settings', settings),
  testApiKey: (payload) => ipcRenderer.invoke('desktop:test-api-key', payload),
  openAiStudio: () => ipcRenderer.invoke('desktop:open-ai-studio'),
  showApp: () => ipcRenderer.invoke('desktop:show-app'),
  openSettings: () => ipcRenderer.invoke('desktop:open-settings'),
  requestApi: (route, body) => ipcRenderer.invoke('desktop:api-request', { route, body }),
  syncSnapshot: (payload) => ipcRenderer.invoke('desktop:sync-snapshot', payload),
  getPersistenceStatus: () => ipcRenderer.invoke('desktop:get-persistence-status'),
  createDataBackup: () => ipcRenderer.invoke('desktop:create-data-backup'),
  openDataFolder: () => ipcRenderer.invoke('desktop:open-data-folder'),
  setSmartContext: (payload) => ipcRenderer.invoke('desktop:set-smart-context', payload),
  refreshMarketCatalog: (payload) => ipcRenderer.invoke('desktop:refresh-market-catalog', payload),
});
