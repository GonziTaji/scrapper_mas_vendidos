const { JSDOM } = require('jsdom');
const { getDigits } = require('./lib');

module.exports = scrapperAliexpress;

/**
 * 
 * @param {string} url 
 * @param {number} retries 
 * @returns Promise<ProductData[]>
 */
async function scrapperAliexpress(url, retries = 0) {
    const max_retries = 5;

    /** @type {ProductData[]} */
    const data = [];

    try {
        const dom = await JSDOM.fromURL(url);

        const document = dom.window.document;

        const itemElements = document.querySelectorAll('.list--gallery--34TropR > a');

        if (!itemElements.length && retries < max_retries) {
            console.log('no items found. retrying in 3 seconds');
            return new Promise(resolve => setTimeout(() => {
                console.log(`retrying (${retries}/${max_retries})...'`);
                scrapperAliexpress(url, ++retries).then(resolve)
            }, 3000));
        }

        console.log('items count: ' + itemElements.length);

        for (let i = 0; i < itemElements.length; i++) {
            const itemEl = itemElements[i];
    
            /** @type {ProductData} */
            const itemData = {
                position: i+1,
                name: itemEl.querySelector('[class*=manhattan--titleText]')?.textContent,
                url: itemEl.getAttribute('href')?.replace('//', 'https://'),
                photo: itemEl.querySelector('.product-img')?.getAttribute('src')?.replace('//', 'https://'),
                price: '',
                stars: itemEl.querySelector('[class*=manhattan--evaluation]')?.textContent,
                reviews: '',
                prices: [],
                sold: itemEl.querySelector('[class*=manhattan--trade]')?.textContent?.split(' ')[0],
                category: '',
                source: 'Aliexpress'
            };

            const priceElements = [
                ...itemEl.querySelectorAll('[class*=manhattan--price-]:not([class*=manhattan--price--])'),
            ];
            const subPriceElement = itemEl.querySelector('[class*=manhattan--subPrice--]');
    
            if (subPriceElement) {
                priceElements.push(subPriceElement);
            }
    
            for (const element of priceElements) {
                // eslint-disable-next-line no-unused-vars
                const [_, priceType] = element.className.split('--');
    
                const priceValue = element.textContent && element.textContent.match(/\d/g).join('');
    
                if (priceValue) {
                    if (priceType === 'subPrice') {
                        itemData.price = priceValue;
                    } else {
                        itemData.prices.push({ type: priceType.replace('-', ' '), price: priceValue });
                    }
                }
            }
    
            if (!itemData.price && itemData.prices && itemData.prices[0]) {
                itemData.price = itemData.prices[0].price;
            }

            itemData.price = getDigits(itemData.price);

            data.push(itemData);
        }
    } catch (e) {
        console.error(e);
    }

    return data;
}
