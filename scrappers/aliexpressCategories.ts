import * as XLSX from 'xlsx';
import { JSDOM } from 'jsdom';

export default async function aliexpressCategories(): Promise<void> {
    const url = `https://es.aliexpress.com/`;

    const dom = await JSDOM.fromURL(url);
    const document = dom.window.document;

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

        const parentCategories = Array.from(document.querySelectorAll('.sub-cate-items'));

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

    console.log(categories);

    const ws = XLSX.utils.json_to_sheet(categories);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "categorias");

    XLSX.writeFile(wb, './data/categories.xlsx');
}