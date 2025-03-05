/* global electronAPI */
/* global DataTable */

const searchBtn = document.querySelector('#scrap-btn');
const downloadBtn = document.querySelector('#download-btn');
const loadingIndicator = document.querySelector('#loading-indicator');
const messagesContainer = document.querySelector('#messages-container');

/** @type {{ [source: string]: CategorySelector}} */
let categorySelectors = {};
/** @type {ProductData[]} */
let products = [];

window.addEventListener('DOMContentLoaded', init);

// html events
searchBtn.addEventListener('click', getProducts);
downloadBtn.addEventListener('click', btnDownloadOnClick);

// electron events
electronAPI.onInfoMessage(onInfoMessage);

function init() {
    new DataTable('#datatable');

    getCategories('aliexpress');
    getCategories('mercadolibre');
    getCategories('falabella');
}

function btnDownloadOnClick() {
    electronAPI.createWorkbook(products).then((buffer) => {
        const byteArray = new Uint8Array(buffer);
        const a = document.createElement('a');

        a.href = window.URL.createObjectURL(new Blob([byteArray], { type: 'application/octet-stream' }));
        a.download = 'download.xlsx';

        // Append anchor to body.
        document.body.appendChild(a);
        a.click();

        // Remove anchor from body
        document.body.removeChild(a);
    });
}

function getCategories(source) {
    console.log('getting categories from ' + source);
    electronAPI.getCategories(source).then((categories) => {
        const wrapperSelector = '#category-wrapper #' + source;
        console.log('selector', wrapperSelector);
        categorySelectors[source] = new CategorySelector(wrapperSelector, categories);
        console.log(categorySelectors);
    });
}

function onInfoMessage(_event, message) {
    const maxScrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
    const scrollDelta = maxScrollTop - messagesContainer.scrollTop;

    const scrollToBottom = scrollDelta < 12;

    messagesContainer.textContent += '\n' + message;

    if (scrollToBottom) {
        messagesContainer.scroll(0, messagesContainer.scrollHeight);
    }
}

async function getProducts() {
    console.log('getting products');
    searchBtn.setAttribute('disabled', true);
    loadingIndicator.style.display = '';

    /** @type {ProductData[]} */
    products = [];

    let tmpProds = [];
    for (const [source, categorySelector] of Object.entries(categorySelectors)) {
        tmpProds = await electronAPI.scrap(source, categorySelector.getSelection());
        products.push(...tmpProds);
    }

    products.forEach((p) => {
        if (!p.sold) {
            p.sold = '';
        }

        if (!p.stars) {
            p.stars = '';
        }
    });

    new DataTable('#datatable', {
        data: products,
        columns: [
            { data: 'position' },
            { data: 'name', render: (data, type, row) => `<a target="_blank" href="${row.url}">${data}</a>` },
            { data: 'photo', render: (data) => `<img src="${data}" />` },
            { data: 'price' },
            { data: 'stars' },
            { data: 'reviews' },
            // { data: 'prices' },
            { data: 'sold' },
            { data: 'category' },
            { data: 'source' },
        ],
        destroy: true,
    });

    searchBtn.removeAttribute('disabled');
    loadingIndicator.style.display = 'none';

    downloadBtn.removeAttribute('disabled');

    setTimeout(() => {
        document.querySelector('#products').scrollIntoView();
    }, 300);
}

class CategorySelector {
    /**
     * @param {string} selector the selector this component will be rendered
     * @param {Category[]} categories
     */
    constructor(selector, categories) {
        /**
         * @name CategorySelector#element
         * @type {HTMLElement} This component's element */
        this.element = document.querySelector(selector);
        /** @type {Category[]} */
        this.categories = categories;
        /** @type {Category[]} */
        this.visibleCategories = categories;

        this.parentLiTemplate = document.querySelector('#parent-category-item');
        this.childLiTemplate = document.querySelector('#child-category');

        if (!this.element) {
            throw new Error('no element of selector ' + selector + ' found');
        }

        this.render();
    }

    getSelection() {
        const selection = [];

        for (const { children } of this.categories) {
            for (const child of children) {
                if (child.selected) {
                    selection.push({
                        name: child.category_url,
                        label: child.category_name,
                    });
                }
            }
        }

        return selection;
    }

    filterCategories(term) {
        term = normalizeText(term);
        const regexp = new RegExp(term);

        this.visibleCategories = [];

        for (const category of this.categories) {
            const children = [];
            for (const child of category.children) {
                if (regexp.test(normalizeText(child.category_name))) {
                    children.push(child);
                }
            }

            if (children.length) {
                this.visibleCategories.push({
                    category_name: category.category_name,
                    children,
                });
            }
        }

        this.renderCategories();
    }

    render() {
        /** @type {HTMLInputElement} */
        const searchInput = this.element.querySelector('.category-search');
        searchInput.oninput = (ev) => {
            this.filterCategories(ev.currentTarget.value);
        };

        this.renderCategories();
    }

    renderCategories() {
        const mainUl = this.element.querySelector('.categories-list');
        mainUl.innerHTML = '';

        const parentLiNodes = [];
        for (const parentCategory of this.visibleCategories) {
            const tmpClone = this.parentLiTemplate.content.cloneNode(true);
            const liElement = tmpClone.querySelector('li');
            const checkboxElement = tmpClone.querySelector('input[type=checkbox]');
            checkboxElement.id = parentCategory.category_name;

            checkboxElement.onchange = (ev) => {
                parentCategory.selected = ev.target.checked;

                if (parentCategory.children) {
                    for (const child of parentCategory.children) {
                        child.selected = ev.target.checked;
                        liElement
                            .querySelectorAll(`input[type=checkbox]:not(#${parentCategory.category_name})`)
                            .forEach((e) => (e.checked = ev.target.checked));
                    }
                }
            };

            const label = tmpClone.querySelector('label');
            label.setAttribute('for', parentCategory.category_name);
            label.textContent = parentCategory.category_name;

            if (parentCategory.children && parentCategory.children.length) {
                const spanElement = tmpClone.querySelector('span');
                spanElement.innerText = parentCategory.children.length + ' Subcategories';

                const ulElement = tmpClone.querySelector('ul');
                const liNodes = [];

                for (const child of parentCategory.children) {
                    const tmpChildClone = this.childLiTemplate.content.cloneNode(true);
                    const childLiElement = tmpChildClone.querySelector('li');
                    const checkboxElement = tmpChildClone.querySelector('input[type=checkbox]');
                    checkboxElement.id = child.category_name;

                    checkboxElement.onchange = (ev) => {
                        child.selected = ev.target.checked;
                    };

                    const label = tmpChildClone.querySelector('label');
                    label.setAttribute('for', child.category_name);
                    label.textContent = child.category_name;

                    liNodes.push(childLiElement);
                }

                ulElement.append(...liNodes);
                liElement.append(ulElement);
            }

            parentLiNodes.push(liElement);
        }

        mainUl.append(...parentLiNodes);

        this.element.append(mainUl);
    }
}

function normalizeText(text) {
    // https://es.stackoverflow.com/questions/62031/eliminar-signos-diacr%C3%ADticos-en-javascript-eliminar-tildes-acentos-ortogr%C3%A1ficos
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

/** @typedef {{
 *      category_name: string,
 *      children: {
 *          grandparent_name: string;
 *          grandparent_url: string;
 *          parent_name: string;
 *          parent_url: string;
 *          category_name: string;
 *          category_url: string;
 *          selected: boolean;
 *      }[]
 * }} Category */
