import * as fs from 'fs';
import * as XLSX from 'xlsx';
import scrapperAmazon from './scrappers/scrapperAmazon';
import scrapperFalabella from './scrappers/scrapperFalabella';
import { Category, ProductData, ScrapperFn } from './types';

main();

async function main() {
    const falabellaCategories = [
        { label: 'Wearables', name: 'cat7190053'},
        { label: 'Audifonos inalámbricos', name: 'cat1640002' },
        { label: 'Drones y accesorios', name: 'cat7230062' },
    ];
    
    const amazonCategories = [
        { label: 'Headphones & Earbuds', name: 'Best-Sellers-Electronics-Headphones-Earbuds/zgbs/electronics/172541'},
        { label: 'Car Electronics', name: 'Best-Sellers-Electronics-Car-Electronics/zgbs/electronics/1077068' },
        { label: 'Wearable Technology', name: 'Best-Sellers-Electronics-Wearable-Technology/zgbs/electronics/10048700011/' },
        { label: 'Quadcopters & Multirotors', name: 'Best-Sellers-Toys-Games-Hobby-RC-Quadcopters-Multirotors/zgbs/toys-and-games/11608080011/' },
    ];

    /** number is delay */
    const input: [{ label: string; fn: ScrapperFn }, Category[], number][] = [
        // [{ label: 'Falabella', fn: scrapperFalabella }, falabellaCategories, 0],
        [{ label: 'Amazon', fn: scrapperAmazon }, amazonCategories, 0]
    ];

    const output: ExcelData[]= [];
    let scrapperResults: ProductData[]= [];
    let tmpPrices = '';
    let waitPromise: Promise<void>;
    for (const [scrapper, categories, delay] of input) {
        for (const category of categories) {
            if (waitPromise) {
                console.log('waiting promise');
                await waitPromise;
                console.log('promise awaited');
            }

            waitPromise = resolveInSeconds(delay || 0);

            console.log(`Scrapping: ${scrapper.label} - ${category.label}`);

            scrapperResults = await scrapper.fn(category.name);

            for (const result of scrapperResults) {
                if (result.prices) {
                    tmpPrices = '';
                    for (const price of result.prices) {
                        tmpPrices += `${price.type}: $${price.price}\n`;
                    }

                    result.prices = tmpPrices as any;
                }

                output.push({
                    photo_display: '',
                    ...result,
                    category: category.label,
                    source: scrapper.label
                })
            }
        }
    }

    if (output.length === 0) {
        console.log('no results');
        return 0;
    }

    fs.writeFileSync('data/output.json', JSON.stringify(output, null, 4));

    var ws = XLSX.utils.json_to_sheet(output);

    const rowDataStart = 1; // headers at 0
    const lastRow = rowDataStart + output.length - 1;

    const photoUrlColumn = Object.keys(output[0]).indexOf('photo');

    const photoUrlRange: XLSX.Range = { s: { c: photoUrlColumn, r: 1 }, e: { c: photoUrlColumn, r: lastRow } };
    const photoDisplayRange: XLSX.Range = { s: { c: 0, r: 1 }, e: { c: 0, r: lastRow } };

    const encodedPhotoUrlRange = XLSX.utils.encode_range(photoUrlRange);

    XLSX.utils.sheet_set_array_formula(ws, photoDisplayRange, `IMAGE(${encodedPhotoUrlRange})`);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "productos");

    const filepath = './data/output.xlsx';

    const response = XLSX.writeFile(wb, filepath);

    console.log(response);
    // https://docs.sheetjs.com/docs/csf/features/formulae

    // escape html characters from url (there are some with commas)
    // =image("https://images-na.ssl-images-amazon.com/images/I/61R1bc4lmdL._AC_UL300_SR300%2C200_.jpg")

}

function resolveInSeconds(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds*1000));
}

interface ExcelData extends ProductData {
    photo_display: string;
    category: string;
    source: string;
}