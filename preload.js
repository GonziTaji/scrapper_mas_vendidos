const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    scrap: () => ipcRenderer.invoke('scrap'),
    createWorkbook: (products) => ipcRenderer.invoke('createWorkbook', products),

});

window.addEventListener('DOMContentLoaded', () => {
    // node apis can be used here
});