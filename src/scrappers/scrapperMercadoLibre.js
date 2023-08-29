const { JSDOM } = require('jsdom');

module.exports = scrapperMercadoLibre;

/**
 * @async
 * @param {string} url
 * @param {boolean} retried 
 * @returns Promise<ProductData[]>
 */
async function scrapperMercadoLibre(url, retried = false) {
    /* @type {ProductData[]} */
    const data = [];

    try {
        const dom = await JSDOM.fromURL(url);

        const document = dom.window.document;

        /* @type {HTMLAnchorElement */
        let anchor;
        /* @type {string} */
        let price;
        /* @type {string} */
        let originalPrice;
        /* @type {HTMLImageElement} */
        let img;
        /* @type {string } */
        let photo;

        const itemContainers = document.querySelectorAll('.ui-recommendations-card');

        console.log('data length: ' + data.length);

        for (const container of itemContainers) {
            anchor = container.querySelector('a');

            price = container.querySelector('.ui-recommendations-card__price-and-discount .andes-money-amount__fraction')?.textContent.replace('.', '')
            originalPrice = container.querySelector('.ui-recommendations-card__price-original-price .andes-money-amount__fraction')?.textContent.replace('.', '')

            img = container.querySelector('img');
            photo = img?.getAttribute('src');

            // console.log('photo: ' + photo);

            // deals with lazy loaded images
            if (photo.match('data:image/gif')) {
                photo = img?.getAttribute('data-src');
                // console.log('changed to new photo: ' + photo);
            }

            data.push({
                photo: photo,
                url: anchor?.getAttribute('href'),
                name: anchor?.textContent,
                position: data.length + 1,
                price: price,
                reviews: '',
                stars: '',
                prices: [
                    { type: 'originalPrice', price: originalPrice || price },
                    { type: 'currentPrice', price: price },
                ]
            });
        }

    } catch (e) {
        console.error(e);
    }

    return data;
}
