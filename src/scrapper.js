const aliCategories = require('./data/ali_categories.json');
const XLSX = require('xlsx');

module.exports = {
    getAliexpressCategories,
    getAliexpressCategoriesByParent,
    scrapper,
    generateWorkbook,
}

/**
 * @returns {ParentChildrenCategory[]}
 */
function getAliexpressCategoriesByParent() {
    const rawCategories = aliCategories;

    const parents = new Map();

    for (const category of rawCategories) {
        const parent = category.parent_name;

        if (parents.has(parent)) {
            parents.set(parent, [...parents.get(parent), category])
        } else {
            parents.set(parent, [category])
        }
    }

    /** @type {ParentChildrenCategory[]} */
    const categories = [];

    parents.forEach((children, parentName) => {
        categories.push({
            category_name: parentName,
            children,
        })
    })

    return categories;
}

function getAliexpressCategories() {
    const rawCategories = aliCategories;

    return rawCategories.map(({ category_name, category_url }) => ({
        name: category_url,
        label: category_name,
    }));
}

/**
 * 
 * @param {(category: string) => Promise<ProductData[]>} fn Scrapper function
 * @param {{name: string; label: string;}} categories 
 * @param {number} delay 
 * @param {{ scrapper_name: string, logger: (message: string) => void }} options 
 * @returns {Promise<ProductData[]>}
 */
async function scrapper(fn, categories, delay, options) {
    /** @type {ProductData[]} */
    const scrapperResults = [];
    /** @type {ProductData[]} */
    let tmpResults;
    /** @type {Promise<void>} */
    let waitPromise;

    let processedCount = 0;

    for (const category of categories) {
        if (waitPromise) {
            console.log('waiting promise');
            await waitPromise;
            console.log('promise awaited');
        }

        waitPromise = resolveInSeconds(delay || 0);

        options.logger(`(${++processedCount}/${categories.length}) Reading category ${category.label}...`);

        tmpResults = await fn(category.name);

        options.logger(`Got ${tmpResults.length} products from category`);

        for (const result of tmpResults) {
            scrapperResults.push({
                ...result,
                category: category.label,
                source: options.scrapper_name || 'unknown',
            });
        }
    }

    return scrapperResults;
}

/**
 * 
 * @param {ProductData[]} products
 * @returns {XLSX.WorkBook}
 */
function generateWorkbook(products) {
    /** @type {ExcelData[]} */
    const output = [];

    let tmpPrices = '';
    for (const result of products) {
        if (result.prices) {
            tmpPrices = '';
            for (const price of result.prices) {
                tmpPrices += `${price.type}: $${price.price}\n`;
            }

            result.prices = tmpPrices;
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

    /** @type {XLSX.Range} */
    const photoUrlRange = { s: { c: photoUrlColumn, r: 1 }, e: { c: photoUrlColumn, r: lastRow } };
    /** @type {XLSX.Range} */
    const photoDisplayRange = { s: { c: 0, r: 1 }, e: { c: 0, r: lastRow } };

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

/**
 * 
 * @param {number} seconds 
 * @returns {Promise<void>}
 */
function resolveInSeconds(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds*1000));
}

/**
 * @typedef {{
 * position: number;
 * name: string | null | undefined;
 * url: string | null | undefined;
 * photo: string | null | undefined;
 * price: string | number | null | undefined;
 * stars: string | null | undefined;
 * reviews: string | null | undefined;
 * prices?: { type: string, price: string }[];
 * sold?: string;
 * category: string;
 * source: string;
 * }} ProductData
*/

/**
 * @typedef {{
 * position: number;
 * name: string | null | undefined;
 * url: string | null | undefined;
 * photo: string | null | undefined;
 * price: string | number | null | undefined;
 * stars: string | null | undefined;
 * reviews: string | null | undefined;
 * prices?: { type: string, price: string }[];
 * sold?: string;
 * category: string;
 * source: string;
 * photo_display: string;
 * category: string;
 * source: string;
 * }} ExcelData
*/

/** @typedef {{
 *      name: string,
 *      children: {
 *          grandparent_name: string;
 *          grandparent_url: string;
 *          parent_name: string;
 *          parent_url: string;
 *          category_name: string;
 *          category_url: string;
 *      }[]
 * }} ParentChildrenCategory */
