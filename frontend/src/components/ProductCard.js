const categoryImageMap = {
    Electronics: "assets/category-images/electronics.png",
    Clothing: "assets/category-images/clothing.png",
    Furniture: "assets/category-images/furniture.png",
    Sports: "assets/category-images/sports.png",
    Beauty: "assets/category-images/beauty.png",
    Decor: "assets/category-images/decor.png",
    Home: "assets/category-images/home.png"
};

const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function createProductCard(product) {
    const article = document.createElement("article");
    article.className = "product-card";
    article.dataset.productId = product.id;
    article.innerHTML = `
        <div class="product-card__media">
            <img src="${categoryImageMap[product.category] || ""}" alt="${escapeHtml(product.name)}" loading="lazy">
            <span class="product-card__badge">${escapeHtml(product.category)}</span>
        </div>
        <div class="product-card__body">
            <h2>${escapeHtml(product.name)}</h2>
            <div class="product-card__meta">
                <span class="product-card__price">${formatter.format(Number(product.price || 0))}</span>
                <span class="product-card__rating" aria-label="Rated 4.6 out of 5">4.6</span>
            </div>
            <button class="product-card__button" type="button" aria-label="View ${escapeHtml(product.name)}">
                View product
            </button>
        </div>
    `;

    return article;
}
