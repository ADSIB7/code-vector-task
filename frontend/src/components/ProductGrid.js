import { createProductCard } from "./ProductCard.js";

export function createProductGrid() {
    const grid = document.createElement("section");
    grid.className = "product-grid";
    grid.setAttribute("aria-label", "Product catalog");

    let renderedIds = new Set();

    function render(products) {
        const nextIds = new Set(products.map((product) => product.id));

        if (products.length === 0) {
            grid.innerHTML = "";
            renderedIds.clear();
            return;
        }

        products.forEach((product) => {
            if (renderedIds.has(product.id)) {
                return;
            }

            grid.appendChild(createProductCard(product));
            renderedIds.add(product.id);
        });

        renderedIds.forEach((id) => {
            if (!nextIds.has(id)) {
                grid.querySelector(`[data-product-id="${id}"]`)?.remove();
                renderedIds.delete(id);
            }
        });
    }

    return {
        element: grid,
        render
    };
}
