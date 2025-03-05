const XLSX = require('xlsx');
const { launch } = require('puppeteer');
const { JSDOM } = require('jsdom');

(async () => {
    const browser = await launch();
    const page = await browser.newPage();

    await page.goto('https://es.aliexpress.com');

    await page.waitForSelector('.categories-list-box > dl');

    await page.evaluate(() => {

    });

    const grandparentCategories = await page.$$('.categories-list-box > dl');

    console.log(grandparentCategories);

    /** ElementHandle<any> | null */
    let tmpEl;

    const categories = [];
    let category = {
        grandparent_name: '',
        grandparent_url: '',
        parent_name: '',
        parent_url: '',
        category_name: '',
        category_url: '',
    };

    for (const grandparentCategory of grandparentCategories) {
        category = {
            grandparent_name: '',
            grandparent_url: '',
            parent_name: '',
            parent_url: '',
            category_name: '',
            category_url: '',
        };

        tmpEl = await grandparentCategory.$('.cate-name a');
        category.grandparent_name = await tmpEl?.evaluate(el => el.textContent);
        category.grandparent_url = 'https://' + (await tmpEl?.evaluate(el => el.getAttribute('href').replace('https://', '').replace('//', '')));

        const parentCategories = await grandparentCategory.$$('.sub-cate-items');

        for (const parentCategory of parentCategories) {
            console.log('category', category);
            tmpEl = await parentCategory.$('.sub-cate-items dt a');
            category.parent_name = await tmpEl?.evaluate(el => el.textContent);
            category.parent_url = 'https://' + (await tmpEl?.evaluate(el => el.getAttribute('href').replace('https://', '').replace('//', '')));

            const childCategories = await parentCategory.$$('.sub-cate-items dd a');

            for (const childCategory of childCategories) {
                category.category_name = await childCategory.evaluate(el => el.textContent);
                category.category_url = 'https://' + (await childCategory.evaluate(el => el.getAttribute('href').replace('https://', '').replace('//', '')));

                categories.push({ ...category });
            }
        }
    }

    browser.close();

    console.log(categories);

    const ws = XLSX.utils.json_to_sheet(categories);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "categorias");

    XLSX.writeFile(wb, './data/ali_categories.xlsx');
});

(async () => {

    const dom = await JSDOM.fromURL('https://www.aliexpress.com/all-wholesale-products.html')
    require('fs').writeFileSync('./out.ali.html', dom.serialize())

    const categorias = []

    const sections = dom.window.document.querySelectorAll('.cg-main .item.util-clearfix')

    let padreCount = 0
    let subCategoriaCount = 0

    for (const section of sections) {
        padreCount++
        for (const subCategoria of section.querySelectorAll('li a')) {
            const categoria = {
                parent_name: section.querySelector('h3')?.textContent.trim(),
                parent_url: section.querySelector('h3 a')?.href,//.replace('//', 'https://'),
                category_name: subCategoria.textContent,
                category_url: subCategoria.href,
            }

            console.log(`Seccion ${padreCount}:${categoria.parent_name} | subCategoria ${subCategoriaCount}: ${categoria.category_name}`)

            categorias.push(categoria)
        }

        subCategoriaCount = 0

    }

    require('fs').writeFileSync('./src/data/ali_categories.json', JSON.stringify(categorias, null, 4))
})();

(async () => {
    const browser = await launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.aliexpress.com/all-wholesale-products.html');


    console.log('waiting .categories-list-box .cl-item');
    const s = await page.waitForSelector('.categories-list-box .cl-item');
    console.log('hovering');
    s?.focus();
    s?.hover();
    await page.hover('.categories-content-title');

    console.log('waiting sub crate items');
    await page.waitForSelector('.sub-cate-items');
    console.log('waited sub crate items');

    const categories = await page.evaluate(() => {
        const grandparentCategories = Array.from(document.querySelectorAll('.categories-list-box > dl'));

        let tmpEl;

        /** @type {{
            grandparent_name: string,
            grandparent_url: string,
            parent_name: string,
            parent_url: string,
            category_name: string,
            category_url: string,
        }}[]  */
        const categories = [];
        let category = {
            grandparent_name: '',
            grandparent_url: '',
            parent_name: '',
            parent_url: '',
            category_name: '',
            category_url: '',
        };

        for (const grandparentCategory of grandparentCategories) {
            category = {
                grandparent_name: '',
                grandparent_url: '',
                parent_name: '',
                parent_url: '',
                category_name: '',
                category_url: '',
            };

            tmpEl = grandparentCategory.querySelector('.cate-name a');
            category.grandparent_name = tmpEl.textContent;
            category.grandparent_url = 'https://' + tmpEl.getAttribute('href').replace('https://', '').replace('//', '');

            const parentCategories = Array.from(grandparentCategory.querySelectorAll('.sub-cate-items'));

            for (const parentCategory of parentCategories) {
                tmpEl = parentCategory.querySelector('.sub-cate-items dt a');
                category.parent_name = tmpEl.textContent;
                category.parent_url = 'https://' + tmpEl.getAttribute('href').replace('https://', '').replace('//', '');

                const childCategories = Array.from(parentCategory.querySelectorAll('.sub-cate-items dd a'));

                for (const childCategory of childCategories) {
                    category.category_name = childCategory.textContent || '';
                    category.category_url = 'https://' + childCategory?.getAttribute('href')?.replace('https://', '').replace('//', '');

                    categories.push({ ...category });
                }
            }
        }

        return categories;
    })

    // console.log('categories', categories);

    browser.close();

    const ws = XLSX.utils.json_to_sheet(categories);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "categorias");

    XLSX.writeFile(wb, './data/ali_categories.xlsx');
});

async function aliexpressCategories() {

    const grandparentCategories = Array.from(document.querySelectorAll('.categories-list-box > dl'));

    console.log(grandparentCategories);

    let tmpEl;

    const categories = [];
    let category = {
        grandparent_name: '',
        grandparent_url: '',
        parent_name: '',
        parent_url: '',
        category_name: '',
        category_url: '',
    };

    for (const grandparentCategory of grandparentCategories) {
        category = {
            grandparent_name: '',
            grandparent_url: '',
            parent_name: '',
            parent_url: '',
            category_name: '',
            category_url: '',
        };

        tmpEl = grandparentCategory.querySelector('.cate-name a');
        category.grandparent_name = tmpEl.textContent;
        category.grandparent_url = 'https://' + tmpEl.getAttribute('href').replace('https://', '').replace('//', '');

        const parentCategories = Array.from(grandparentCategory.querySelectorAll('.sub-cate-items'));

        for (const parentCategory of parentCategories) {
            tmpEl = parentCategory.querySelector('.sub-cate-items dt a');
            category.parent_name = tmpEl.textContent;
            category.parent_url = 'https://' + tmpEl.getAttribute('href').replace('https://', '').replace('//', '');

            const childCategories = Array.from(parentCategory.querySelectorAll('.sub-cate-items dd a'));

            for (const childCategory of childCategories) {
                category.category_name = childCategory.textContent;
                category.category_url = 'https://' + childCategory.getAttribute('href').replace('https://', '').replace('//', '');

                categories.push({ ...category });
            }
        }
    }

    return categories;
}

module.exports = aliexpressCategories;