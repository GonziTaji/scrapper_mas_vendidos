import { JSDOM } from 'jsdom';
import * as fs from 'fs';

main();

async function main() {
    const dom = await JSDOM.fromURL('https://www.falabella.com/falabella-cl/category/cat7190053/Wearables');

    const document = dom.window.document;

    const el = document.getElementById('__NEXT_DATA__');

    console.log('el', el);


    if (!el) {
        return 'No NEXT DATA element found!'
    }

    console.log(el);

    try {
        const data = JSON.parse(el.innerHTML);

        fs.writeFileSync('data/data_falabella.json', JSON.stringify(data, null, 4));
        fs.writeFileSync('data/products_falabella.json', JSON.stringify(data.props.pageProps.results , null, 4));
    } catch(e) {
        console.error('data is not a valid JSON. Data: ' + el.innerHTML);
        return;
    }
}