var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
main();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const category = 'beauty';
        const url = 'https://www.amazon.es/gp/bestsellers/' + category;
        const dom = yield JSDOM.fromURL(url);
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
        const data = [
            ['name', 'url', 'photo', 'stars', 'reviews', 'price']
        ];
        for (let i = 0; i < photoImgEls.length; i++) {
            data.push([
                nameLinkEls[i].textContent,
                nameLinkEls[i].getAttribute('href'),
                photoImgEls[i].getAttribute('href'),
                starSpanEls[i].textContent,
                reviewsSpanEls[i].textContent,
                priceSpanEls[i].textContent,
            ]);
        }
        try {
            fs.writeFileSync('out/data_amazon.json', JSON.stringify(data, null, 4));
            console.log('done!');
        }
        catch (e) {
            console.error('data is not a valid JSON. Data: ' + data);
            return;
        }
    });
}
// https://github.com/jsdom/jsdom/issues/1245#issuecomment-1243809196
function naiveInnerText(node) {
    const Node = node; // We need Node(DOM's Node) for the constants, but Node doesn't exist in the nodejs global space, and any Node instance references the constants through the prototype chain
    return [...node.childNodes]
        .map((node) => {
        switch (node.nodeType) {
            case Node.TEXT_NODE:
                return node.textContent;
            case Node.ELEMENT_NODE:
                return naiveInnerText(node);
            default:
                return '';
        }
    })
        .join('\n');
}
