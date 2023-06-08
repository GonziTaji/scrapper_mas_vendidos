import axios from 'axios'
import fs from 'fs';

main();

async function main() {
    const r = await axios('https://www.falabella.com/falabella-cl/category/cat7190053/Wearables');

    // const pResponse = new Promise<void>(resolve => {
    //     fs.writeFile('response.json', JSON.stringify(r), () => {
    //         resolve();
    //     });
    // })

    const bResponse = new Promise<void>(resolve => {
        fs.writeFile('body.html', String(r.data), () => {
            resolve();
        });
    });

    await Promise.all([
        // pResponse, 
        bResponse
    ]);

    console.log('ok!');
}