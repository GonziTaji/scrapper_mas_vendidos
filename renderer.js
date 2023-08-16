const btn = document.querySelector('#btn');
const loadingIndicator = document.querySelector('#loading-indicator');

btn.addEventListener('click', () => {
    getProducts();
});

window.addEventListener('DOMContentLoaded', () => {
    // eslint-disable-next-line no-undef
    new DataTable('#datatable');
});

async function getProducts() {
    btn.setAttribute('disabled', true);
    loadingIndicator.style.visibility = 'visible';

    /** @type {ProductData[]} */
    const products = await window.electronAPI.scrap();

    // window.document.querySelector('#products pre').innerHTML = JSON.stringify(products, null, 4);

    console.log('products', products)

    products.forEach((p) => {
        if (!p.sold) {
            p.sold = '';
        }

        if (!p.stars) {
            p.stars = '';
        }
    })

    // eslint-disable-next-line no-undef
    new DataTable('#datatable', {
        data: products,
        columns: [
            { data: 'position' },
            { data: 'name', render: (data, type, row) => `<a target="_blank" href="${row.url}">${data}</a>`},
            { data: 'photo', render: (data) => `<img src="${data}" />`},
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

    btn.removeAttribute('disabled');
    loadingIndicator.style.visibility = 'hidden';
}

