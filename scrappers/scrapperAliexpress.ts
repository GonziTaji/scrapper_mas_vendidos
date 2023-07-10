import { JSDOM } from 'jsdom';
import { ProductData } from '../types';

export default async function scrapperAliexpress(category: string, retried?: boolean): Promise<ProductData[]> {
    const data: ProductData[] = [];

    try {

        const url = `https://es.aliexpress.com/category/${category}?sortType=total_tranpro_desc`;

        const dom = await JSDOM.fromURL(url);

        const document = dom.window.document;

        const itemElements = document.querySelectorAll('.list--gallery--34TropR > a');

        if (!itemElements.length && !retried) {
            console.log('no items found. retrying');
            return scrapperAliexpress(category, true);
        }

        console.log('items count: ' + itemElements.length);

        for (let i = 0; i < itemElements.length; i++) {
            const itemEl = itemElements[i];
    
            const itemData: ProductData = {
                position: i+1,
                name: itemEl.querySelector('[class*=manhattan--titleText]')?.textContent,
                url: itemEl.getAttribute('href').replace('//', 'https://'),
                photo: itemEl.querySelector('.product-img')?.getAttribute('src').replace('//', 'https://'),
                price: '',
                stars: itemEl.querySelector('[class*=manhattan--evaluation]')?.textContent,
                reviews: '',
                prices: [],
                sold: itemEl.querySelector('[class*=manhattan--trade]')?.textContent.split(' ')[0],
            };

            const priceElements = [
                ...itemEl.querySelectorAll('[class*=manhattan--price-]:not([class*=manhattan--price--])'),
            ];
            const subPriceElement = itemEl.querySelector('[class*=manhattan--subPrice--]');
    
            if (subPriceElement) {
                priceElements.push(subPriceElement);
            }
    
            for (const element of priceElements) {
                const [_, priceType] = element.className.split('--');
    
                const priceValue = element.textContent.match(/\d/g)?.join('');
    
                if (priceValue) {
                    if (priceType === 'subPrice') {
                        itemData.price = priceValue;
                    } else {
                        itemData.prices.push({ type: priceType.replace('-', ' '), price: priceValue });
                    }
                }
            }
    
            if (!itemData.price && itemData.prices[0]) {
                itemData.price = itemData.prices[0].price;
            }
    
            data.push(itemData);
        }
    } catch (e) {
        console.error(e);
    }

    return data;
}
