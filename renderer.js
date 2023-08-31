/* global electronAPI */
/* global DataTable */

const searchBtn = document.querySelector('#btn');
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

        alert('File saved!');

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
    messagesContainer.textContent = '';
    messagesContainer.style.display = '';

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
    messagesContainer.style.display = 'none';

    downloadBtn.removeAttribute('disabled');
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

    filterCategories() {
        const term = normalizeText(this.element.querySelector('.category-search').value);
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
        this.element.innerHTML = '';

        const searchInput = document.createElement('input');
        searchInput.className = 'category-search';
        searchInput.onkeydown = ({ key }) => {
            if (key === 'Enter') {
                this.filterCategories();
            }
        };

        const btnSearch = document.createElement('button');
        btnSearch.textContent = 'Filtrar';
        btnSearch.onclick = () => {
            this.filterCategories();
        };

        const divElement = document.createElement('div');
        divElement.className = 'search-wrapper';

        divElement.append(searchInput, btnSearch);
        console.log(divElement);
        this.element.append(divElement);

        this.renderCategories();
    }

    renderCategories() {
        const existingUl = this.element.querySelector('.categories-list');

        if (existingUl) {
            existingUl.remove();
        }

        /** @param {Category} category */
        const categoryItem = (category) => {
            const liElement = document.createElement('li');
            const checkboxElement = document.createElement('input');
            checkboxElement.setAttribute('type', 'checkbox');
            checkboxElement.id = category.category_name;

            checkboxElement.onchange = (ev) => {
                category.selected = ev.target.checked;

                if (category.children) {
                    for (const child of category.children) {
                        child.selected = ev.target.checked;
                        liElement
                            .querySelectorAll(`input[type=checkbox]:not(#${category.category_name})`)
                            .forEach((e) => (e.checked = ev.target.checked));
                    }
                }
            };

            const label = document.createElement('label');
            label.setAttribute('for', category.category_name);
            label.textContent = category.category_name;

            liElement.append(checkboxElement, label);

            if (category.children && category.children.length) {
                const spanElement = document.createElement('span');
                spanElement.style.fontStyle = 'italic';
                spanElement.style.fontSize = '0.8em';
                spanElement.style.paddingLeft = '0.25rem';
                spanElement.innerText = category.children.length + ' Subcategories';

                liElement.append(spanElement);

                const ulElement = document.createElement('ul');
                ulElement.style.listStyle = 'none';
                const liNodes = [];

                for (const child of category.children) {
                    const childLiElement = document.createElement('li');
                    childLiElement.style = 'display: flex; align-items: center; padding 0.25rem; 0';
                    const checkboxElement = document.createElement('input');
                    checkboxElement.setAttribute('type', 'checkbox');
                    checkboxElement.id = child.category_name;

                    checkboxElement.onchange = (ev) => {
                        child.selected = ev.target.checked;
                    };

                    const label = document.createElement('label');
                    label.setAttribute('for', child.category_name);
                    label.textContent = child.category_name;

                    childLiElement.append(checkboxElement, label);

                    liNodes.push(childLiElement);
                }

                ulElement.append(...liNodes);
                liElement.append(ulElement);
            }

            // console.log('2', { liElement });

            return liElement;
        };

        const ulElement = document.createElement('ul');
        ulElement.style.listStyle = 'none';
        ulElement.style.overflow = 'auto';
        ulElement.style.height = '400px';
        ulElement.className = 'categories-list';

        const liNodes = [];
        for (const child of this.visibleCategories) {
            liNodes.push(categoryItem(child));
        }

        ulElement.append(...liNodes);

        this.element.append(ulElement);
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
