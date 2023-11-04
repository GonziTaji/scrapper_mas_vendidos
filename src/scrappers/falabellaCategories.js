const categorias = [];
// hover the grandparent category and run this function in the console, for every grandparent category
// eslint-disable-next-line no-unused-vars
function rasparCategorias() {
    const els = document.querySelectorAll('.SecondLevelCategories-module_secondLevelCategory__3SPXi');

    [...els].map((el) => {
        const link = el.querySelector('a');
        const parent_name = link.textContent;
        const parent_url = link.getAttribute('href');

        const childrenLinks = el.querySelectorAll(
            '.SecondLevelCategories-module_thirdLevelCategory__2ZQFF:not([class~=verTodo]) a'
        );

        for (const link of childrenLinks) {
            categorias.push({
                parent_name,
                parent_url,
                category_name: link.textContent,
                category_url: link.getAttribute('href'),
            });
        }
    });
}
