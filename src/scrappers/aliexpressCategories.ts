import * as XLSX from 'xlsx';
import { JSDOM } from 'jsdom';
import { ElementHandle, launch } from 'puppeteer';

(async () => {
    const browser = await launch();
    const page = await browser.newPage();

    await page.goto('https://es.aliexpress.com');

    await page.waitForSelector('.categories-list-box > dl');

    await page.evaluate(() => {

    });

    const grandparentCategories = await page.$$('.categories-list-box > dl');

    console.log(grandparentCategories);

    let tmpEl: ElementHandle<any>;

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
        category.grandparent_name = await tmpEl.evaluate(el => el.textContent);
        category.grandparent_url = 'https://' + (await tmpEl.evaluate(el => el.getAttribute('href').replace('https://', '').replace('//', '')));

        const parentCategories = await grandparentCategory.$$('.sub-cate-items');

        for (const parentCategory of parentCategories) {
            console.log('category', category);
            tmpEl = await parentCategory.$('.sub-cate-items dt a');
            category.parent_name = await tmpEl.evaluate(el => el.textContent);
            category.parent_url = 'https://' + (await tmpEl.evaluate(el => el.getAttribute('href').replace('https://', '').replace('//', '')));

            const childCategories = await parentCategory.$$('.sub-cate-items dd a');

            for (const childCategory of childCategories) {
                category.category_name = await childCategory.evaluate(el => el.textContent);
                category.category_url = 'https://' + (await childCategory.evaluate(el => el.getAttribute('href').replace('https://', '').replace('//', '')));

                categories.push({...category});
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
    const browser = await launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://es.aliexpress.com');

    
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

                    categories.push({...category});
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
})();

export default async function aliexpressCategories() {

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

                categories.push({...category});
            }
        }
    }

    return categories;
}