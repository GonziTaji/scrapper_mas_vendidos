// https://www.electronjs.org/docs/latest/tutorial/quick-start
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const XLSX = require('xlsx');
const { generateWorkbook, getAliexpressCategories, scrapper } = require('./src/scrapper');
const scrapperAliexpress = require('./src/scrappers/scrapperAliexpress');

const createWindow = () => {
    ipcMain.handle('scrap', async () => {
        const [ cat1 ] = getAliexpressCategories();

        const categories = [ cat1 ];

        const products = await scrapper(scrapperAliexpress, categories, 0, { scrapper_name: 'Aliexpress' });

        return products;
    });

    ipcMain.handle('createWorkbook', (event, products) => {
        const wb = generateWorkbook(products);
        const fileBuffer = XLSX.write(wb, {
            bookType: 'xlsx',
            type: 'buffer'
        });

        return fileBuffer;
    })

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    win.loadFile('index.html');
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
