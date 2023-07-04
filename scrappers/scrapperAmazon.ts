import { JSDOM } from 'jsdom';
import { ProductData } from '../types';

export default async function scrapperAmazon(category: string): Promise<ProductData[]> {
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

    const data: ProductData[] = []

    for (let i = 0; i < photoImgEls.length; i++) {
        data.push({
            name: nameLinkEls[i].textContent.replace('', '').replace(' ', ''),
            url: 'https://www.amazon.com' + nameLinkEls[i].getAttribute('href'),
            photo: photoImgEls[i].getAttribute('src'),
            stars: starSpanEls[i].textContent,
            reviews: reviewsSpanEls[i].textContent,
            price: priceSpanEls[i].textContent.replace(' ', ''),
        });
    }

    return data;
}
