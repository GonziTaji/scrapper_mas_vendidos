import { createExcel } from './lib';
import scrapperAliexpress from './scrappers/scrapperAliexpress';
import scrapperFalabella from './scrappers/scrapperFalabella';
import { Category, ExcelData, ProductData, ScrapperFn } from './types';

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

    const aliexpressCategories = [
        { label: 'cocina comedor y bar', name: '204003396/kitchen-dining-bar.html' },
        { label: 'accesorios smartphone', name: '204030002/mobile-phone-accessories.html' },
        { label: 'mouse y teclados', name: '204004469/mouse-keyboards.html' },
        { label: 'smartwatches', name: '204011179/smart-watches.html' }
    ]

    /** number is delay */
    const input: [{ label: string; fn: ScrapperFn }, Category[], number][] = [
        [{ label: 'Falabella', fn: scrapperFalabella }, falabellaCategories, 0],
        // [{ label: 'Amazon', fn: scrapperAmazon }, amazonCategories, 0],
        [{ label: 'Aliexpress', fn: scrapperAliexpress }, aliexpressCategories, 3]
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

    const response = createExcel(output, './data/output.xlsx');

    console.log(response);
    // https://docs.sheetjs.com/docs/csf/features/formulae

    // escape html characters from url (there are some with commas)
    // =image("https://images-na.ssl-images-amazon.com/images/I/61R1bc4lmdL._AC_UL300_SR300%2C200_.jpg")

}

function resolveInSeconds(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds*1000));
}