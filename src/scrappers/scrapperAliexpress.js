const { JSDOM } = require('jsdom');
const { getDigits } = require('./lib');

module.exports = scrapperAliexpress;

/**
 * 
 * @param {string} url 
 * @param {number} retries 
 * @returns Promise<ProductData[]>
 */
// async function scrapperAliexpress(url, retries = 0) {
async function scrapperAliexpress(url) {
    // const max_retries = 5;

    /** @type {ProductData[]} */
    const data = [];

    try {
        const categoryName = url.split('/').pop().split('.')[0]
        let finalUrl = new URL(url)
        finalUrl.searchParams.append('sortType', 'total_tranpro_desc')
        console.log('finaaaaaaal', finalUrl.toString())

        const dom = await JSDOM.fromURL(finalUrl.toString());
        require('fs').writeFileSync('./out.aliexpress.html', dom.serialize())

        const cards = dom.window.document.querySelectorAll('.search-card-item');
        // if (!itemElements.length && retries < max_retries) {
        //     console.log('no items found. retrying in 3 seconds');
        //     return new Promise(resolve => setTimeout(() => {
        //         console.log(`retrying (${retries}/${max_retries})...'`);
        //         scrapperAliexpress(url, ++retries).then(resolve)
        //     }, 3000));
        // }

        console.log('items count: ' + cards.length);

        /** @type {[string,string]} */
        let rawPrices = []

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
    
            /** @type {ProductData} */
            const itemData = {
                position: i+1,
                name: card.querySelector('h3')?.textContent,
                url: card.getAttribute('href')?.replace('//', 'https://'),
                photo: card.querySelector('img')?.getAttribute('src')?.replace('//', 'https://'),
                price: '',
                stars: '', //card.querySelector('[class*=manhattan--evaluation]')?.textContent,
                reviews: '',
                prices: [],
                sold: card.querySelector('.lp_t > div:nth-child(2)')?.textContent?.split(' ')[0],
                category: categoryName,
                source: 'Aliexpress'
            };

            rawPrices = card.querySelector('.lp_et').textContent.split('CLP').map(getDigits)
            rawPrices.shift() // Elimina primer elemento que es string vacío por el primer CLP
            itemData.price = rawPrices[0]
            
            if (rawPrices[1]) {
                itemData.prices.push({type: 'anterior', price: rawPrices[1]})
            }

            // const priceElements = [
            //     ...card.querySelectorAll('[class*=manhattan--price-]:not([class*=manhattan--price--])'),
            // ];
            // const subPriceElement = card.querySelector('[class*=manhattan--subPrice--]');
    
            // if (subPriceElement) {
            //     priceElements.push(subPriceElement);
            // }
    
            // for (const element of priceElements) {
            //     // eslint-disable-next-line no-unused-vars
            //     const [_, priceType] = element.className.split('--');
    
            //     const priceValue = element.textContent && element.textContent.match(/\d/g).join('');
    
            //     if (priceValue) {
            //         if (priceType === 'subPrice') {
            //             itemData.price = priceValue;
            //         } else {
            //             itemData.prices.push({ type: priceType.replace('-', ' '), price: priceValue });
            //         }
            //     }
            // }
    
            // if (!itemData.price && itemData.prices && itemData.prices[0]) {
            //     itemData.price = itemData.prices[0].price;
            // }

            // itemData.price = getDigits(itemData.price);

            data.push(itemData);
        }
    } catch (e) {
        console.error(e);
    }

    return data;
}
