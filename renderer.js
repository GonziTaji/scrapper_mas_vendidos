const btn = document.querySelector('#btn');
const loadingIndicator = document.querySelector('#loading-indicator');

btn.addEventListener('click', () => {
    getProducts();
});

async function getProducts() {
    btn.setAttribute('disabled', true);
    loadingIndicator.style.visibility = 'visible';

    const products = await window.electronAPI.scrap();

    window.document.querySelector('#products pre').innerHTML = JSON.stringify(products, null, 4);

    btn.removeAttribute('disabled');
    loadingIndicator.style.visibility = 'hidden';
}

