import { JSDOM } from 'jsdom';
import { writeFileSync } from 'fs';

mercadoLibreCategories();

export default async function mercadoLibreCategories(): Promise<void> {
    const url = `https://www.mercadolibre.cl/categorias#menu=categories/`;

    const dom = await JSDOM.fromURL(url);
    const document = dom.window.document;

    const parentCategories = Array.from(document.querySelectorAll('.categories__container'));

    let tmpEl;

    const categories = [];
    let category = {
        parent_name: '',
        parent_url: '',
        category_name: '',
        category_url: '',
    };

    for (const parentCategory of parentCategories) {
        category = {
            parent_name: '',
            parent_url: '',
            category_name: '',
            category_url: '',
        };

        tmpEl = parentCategory.querySelector('.categories__title a');
        category.parent_name = tmpEl.textContent;
        category.parent_url = tmpEl.getAttribute('href');

        console.log(category);

        const childCategories = Array.from(parentCategory.querySelectorAll('.categories__item a'));

        for (const childCategory2 of childCategories) {
            console.log(category);
            category.category_name = childCategory2.textContent;
            category.category_url = childCategory2.getAttribute('href');
            categories.push({ ...category });
        }
    }

    console.log(categories);

    writeFileSync('./data/ml_categories.json', JSON.stringify(categories));

    console.log('ok!');

    // const ws = XLSX.utils.json_to_sheet(categories);
    // const wb = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, "categorias");

    // XLSX.writeFile(wb, './data/categories.xlsx');
}