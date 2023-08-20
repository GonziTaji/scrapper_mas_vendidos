const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    scrap: (categories) => ipcRenderer.invoke('scrap', categories),
    createWorkbook: (products) => ipcRenderer.invoke('createWorkbook', products),
    onInfoMessage: (callback) => ipcRenderer.on('process-message', callback),
    getCategories: (source) => ipcRenderer.invoke('get-categories', source),
});

window.addEventListener('DOMContentLoaded', () => {
    // node apis can be used here
});