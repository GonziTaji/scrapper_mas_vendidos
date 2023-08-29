// https://www.electronjs.org/docs/latest/tutorial/quick-start
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const XLSX = require('xlsx');
const { generateWorkbook, getAliexpressCategoriesByParent, scrapper } = require('./src/scrapper');
const scrapperAliexpress = require('./src/scrappers/scrapperAliexpress');

if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    ipcMain.handle('scrap', (_, source, categories) => scrap(source, categories, createLogger(win)));
    ipcMain.handle('createWorkbook', (_, payload) => createWorkbook(payload));
    ipcMain.handle('get-categories', (_, source) => getCategories(source))

    win.loadFile('index.html');

    return win;
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

/**
 * @param {string} source 
 * @param {{name: string, label: string}[]}
 * @param {{ (message) => void }} logger
 * @returns {ProductData[]}
 */
async function scrap(source, categories, logger) {
    let scrapperFn;

    switch (source.toLowerCase()) {
        case 'aliexpress':
            scrapperFn = scrapperAliexpress;
            break;

        case 'mercadolibre':
            scrapperFn = scrapperMercadoLibre;
            break;

        default:
            throw new Error('Invalid scrapper source: ' + source);
    }


    const products = await scrapper(scrapperFn, categories, 1, { scrapper_name: source, logger });

    return products;
}

/**
 * 
 * @param {BrowserWindow} win 
 */
function createLogger(win) {
    return (message) => win.webContents.send('process-message', appendTimestamp(message));
}

function appendTimestamp(text) {
    return (new Date()).toISOString() + ': ' + text;
}

/**
 * 
 * @param {ProductData[]} products 
 * @returns Buffer
 */
async function createWorkbook(products) {
    const wb = generateWorkbook(products);
    const fileBuffer = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'buffer'
    });

    return fileBuffer;
}

function getCategories(source) {
    switch (source) {
        case 'aliexpress': 
            return getAliexpressCategoriesByParent();
        
        case 'mercadolibre':
            return getMercadolibreCategoriesByParent();

        default:
            throw new Error('unhandled category source: ' + source);
    }
}
