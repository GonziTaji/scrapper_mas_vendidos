import { JSDOM } from 'jsdom';
import * as fs from 'fs';

main();

async function main() {
    const category = 'beauty';
    const url = 'https://www.amazon.com/gp/bestsellers/' + category;

    const dom = await JSDOM.fromURL(url);

    const document = dom.window.document;

    const baseQuery = '[id*=p13n-asin] > div:nth-child(2) > div';

    const photoImgEls = document.querySelectorAll(baseQuery + ' img');
    const nameLinkEls = document.querySelectorAll(baseQuery + ' a:nth-child(2)');
    const starSpanEls = document.querySelectorAll(baseQuery + ' [class*=star] span');
    const reviewsSpanEls = document.querySelectorAll(baseQuery + ' > div:nth-child(3) a > span');
    const priceSpanEls = document.querySelectorAll(baseQuery + ' > div:nth-child(4) a [class*=price]:not([class*=color])');

    console.log('---\nelement lengths:');
    console.table({
        photoImgEls: photoImgEls.length,
        nameLinkEls: nameLinkEls.length,
        starSpanEls: starSpanEls.length,
        reviewsSpanEls: reviewsSpanEls.length,
        priceSpanEls: priceSpanEls.length,
    });

    const data: (string|null)[][] = [
        ['name', 'url', 'photo', 'stars', 'reviews', 'price']
    ]

    for (let i = 0; i < photoImgEls.length; i++) {

        data.push([
            nameLinkEls[i].textContent.replace('', '').replace(' ', ''),
            'https://www.amazon.com' + nameLinkEls[i].getAttribute('href'),
            photoImgEls[i].getAttribute('src'),
            starSpanEls[i].textContent,
            reviewsSpanEls[i].textContent,
            priceSpanEls[i].textContent.replace(' ', ''),
        ]);
    }

    try {
        fs.writeFileSync('data/data_amazon.json', JSON.stringify(data, null, 4));
        fs.writeFileSync('data/data_amazon.csv', data.map(arrValues => arrValues.join(';')).join('\n'));

        console.log('done!');
    } catch(e) {
        console.error('data is not a valid JSON. Data: ' + data);
        return;
    }
}

interface ProductData {
    name: string | null | undefined,
    url: string | null | undefined,
    photo: string | null | undefined,
    price: string | null | undefined,
    stars: string | null | undefined,
    reviews: string | null | undefined,
}
