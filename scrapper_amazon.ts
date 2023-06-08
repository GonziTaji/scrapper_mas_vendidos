import { JSDOM } from 'jsdom';
import fs from 'fs';

main();

async function main() {
    const params = new URLSearchParams();

    const objParams = {
        i: 'electronics-intl-ship', // category
        bbn: '16225009011', // category-related id
        rh: 'n%3A16225009011%2Cn%3A2811119011',
        s: 'exact-aware-popularity-rank', // sorting for best seller
        language: 'es',
        ds: 'v1%3A6geBDj8ti%2Fbmwa9QCqYbTctv%2BqTbPwh5t7Dnoeyww5w',
        qid: '1685919634',
        ref: 'sr_st_exact-aware-popularity-rank',
    }

    let url = 'https://www.amazon.com/s?';

    for (const [key, value] of Object.entries(objParams)) {
        url += '&' + key + '=' + value;
    }

    const dom = await JSDOM.fromURL(url);

    const document = dom.window.document;

    const els = document.querySelectorAll('div[cel_widget_id*="MAIN-SEARCH_RESULTS-"] > div > div');

    if (!els.length) {
        return 'No element found!'
    }


    const headers = [
        'link',
        'photoUrl',
        'productName',
        'stars',
        'price',
        'oldPrice',
    ]

    let productsCSV = headers.join(',') + '\n';
    
    let productName : string, stars: string, price: string, oldPrice: string, photoUrl: string, link: string;
    let divChildIndex = 1;

    for (const el of els) {
        link = 'www.amazon.com' + el.querySelector('div:nth-child(1) a')?.getAttribute('href');
        photoUrl = el.querySelector('div:nth-child(1) img')?.getAttribute('src') || '';

        if (el.querySelectorAll('div:nth-child(2) > div').length > 4) {
            divChildIndex = 1;
        } else {
            divChildIndex = 2;
        }

        productName = el.querySelector(`div:nth-child(2) > div:nth-child(${divChildIndex})`)?.textContent?.replace(/,/g, ';') || '';
        stars = el.querySelector(`div:nth-child(2) > div:nth-child(${divChildIndex+1})`)?.textContent || '';
        price = el.querySelector(`div:nth-child(2) > div:nth-child(${divChildIndex+2}) a > span span`)?.textContent?.split(/\s/).pop() || '';
        oldPrice = el.querySelector(`div:nth-child(2) > div:nth-child(${divChildIndex+2}) a div`)?.textContent?.split(/\s/).pop()?.split('CLP').pop() || '';
        
        productsCSV += [link, photoUrl, productName, stars, price, oldPrice].join(',') + '\n';
    }

    fs.writeFileSync('out/products_amazon.csv', productsCSV);
}

// https://github.com/jsdom/jsdom/issues/1245#issuecomment-1243809196
function naiveInnerText(node: Node): string {
    const Node = node; // We need Node(DOM's Node) for the constants, but Node doesn't exist in the nodejs global space, and any Node instance references the constants through the prototype chain
    return [...node.childNodes].map(node => {
        switch (node.nodeType) {
            case Node.TEXT_NODE:
                return node.textContent;
            case Node.ELEMENT_NODE:
                return naiveInnerText(node);
            default:
                return "";
        }
    }).join("\n");
}
