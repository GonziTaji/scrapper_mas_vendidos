import { AliexpressCategories, Category, ExcelData, ProductData, ScrapperFn } from './types';
import aliCategories from './data/ali_categories.json'
import * as XLSX from 'xlsx';

export function getAliexpressCategories() {
    // const fileBuffer = readFileSync('./data/ali_categories.json');
    // const rawCategories: AliexpressCategories[] = JSON.parse(fileBuffer.toString());

    const rawCategories: AliexpressCategories[] = aliCategories;

    return rawCategories.map(({ category_name, category_url }) => ({
        name: category_url,
        label: category_name,
    }));
}

interface ScrapperInfo {
    scrapper_name: string;
}

export async function scrapper(fn: ScrapperFn, categories: Category[], delay: number = 0, info: ScrapperInfo) {
    const scrapperResults: ProductData[]= [];
    let tmpResults : ProductData[];
    let waitPromise: Promise<void> = Promise.resolve();

    for (const category of categories) {
        if (waitPromise) {
            console.log('waiting promise');
            await waitPromise;
            console.log('promise awaited');
        }

        waitPromise = resolveInSeconds(delay || 0);

        console.log(`Scrapping: ${category.label}`);

        tmpResults = await fn(category.name);

        for (const result of tmpResults) {
            scrapperResults.push({
                ...result,
                category: category.label,
                source: info.scrapper_name || 'unknown',
            });
        }
    }

    return scrapperResults;
}

/**
 * 
 * @param products 
 * @param filepath file path without extension
 * @returns 
 */
export function generateWorkbook(products: ProductData[]) {
    const output: ExcelData[] = [];

    let tmpPrices = '';
    for (const result of products) {
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
            category: result.category,
            source: result.source
        });
    }

    var ws = XLSX.utils.json_to_sheet(output);

    const rowDataStart = 1; // headers at 0
    const lastRow = rowDataStart + output.length - 1;

    const photoUrlColumn = Object.keys(output[0]).indexOf('photo');

    const photoUrlRange: XLSX.Range = { s: { c: photoUrlColumn, r: 1 }, e: { c: photoUrlColumn, r: lastRow } };
    const photoDisplayRange: XLSX.Range = { s: { c: 0, r: 1 }, e: { c: 0, r: lastRow } };

    const encodedPhotoUrlRange = XLSX.utils.encode_range(photoUrlRange);

    XLSX.utils.sheet_set_array_formula(ws, photoDisplayRange, `IMAGE(${encodedPhotoUrlRange})`);

    for (let i = 2; i < output.length + 2; i++) {
        ws["F" + i].z = '"$"#,##0_);\\("$"#,##0\\)';
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "productos");

    return wb;
    // https://docs.sheetjs.com/docs/csf/features/formulae

    // escape html characters from url (there are some with commas)
    // =image("https://images-na.ssl-images-amazon.com/images/I/61R1bc4lmdL._AC_UL300_SR300%2C200_.jpg")

}

function resolveInSeconds(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds*1000));
}