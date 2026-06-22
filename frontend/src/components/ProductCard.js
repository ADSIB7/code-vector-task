const categoryImageMap = {
    Electronics: "assets/category-images/electronics.png",
    Clothing: "assets/category-images/clothing.png",
    Furniture: "assets/category-images/furniture.png",
    Sports: "assets/category-images/sports.png",
    Beauty: "assets/category-images/beauty.png",
    Decor: "assets/category-images/decor.png",
    Home: "assets/category-images/home.png"
};

const fallbackCategoryStyles = {
    Electronics: ["#103d5e", "#21a0a0", "#d6f6ff"],
    Clothing: ["#5a2a53", "#d9577f", "#ffe3ee"],
    Books: ["#214e78", "#4b7bec", "#d9ecff"],
    "Home & Kitchen": ["#34523f", "#f59e0b", "#f8edd7"],
    "Sports & Fitness": ["#244b2d", "#5fad56", "#e3f9df"],
    "Beauty & Personal Care": ["#663f46", "#d17b88", "#ffe0e6"],
    "Toys & Games": ["#5b3cc4", "#f97316", "#fef3c7"],
    Automotive: ["#1f2937", "#64748b", "#e2e8f0"],
    Grocery: ["#166534", "#84cc16", "#ecfccb"],
    "Pet Supplies": ["#7c2d12", "#fb923c", "#ffedd5"]
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

function escapeXml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

function fallbackProductImage(product) {
    const [primary, secondary, accent] = fallbackCategoryStyles[product.category] || ["#243b53", "#627d98", "#f0f4f8"];
    const label = escapeXml((product.category || "Product").slice(0, 12));
    const title = escapeXml((product.name || "Product").slice(0, 18));
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
            <defs>
                <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="${primary}"/>
                    <stop offset="100%" stop-color="${secondary}"/>
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#111827" flood-opacity=".28"/>
                </filter>
            </defs>
            <rect width="640" height="480" rx="34" fill="url(#bg)"/>
            <circle cx="520" cy="88" r="76" fill="${accent}" opacity=".28"/>
            <circle cx="92" cy="396" r="96" fill="${accent}" opacity=".18"/>
            <rect x="178" y="114" width="284" height="236" rx="30" fill="${accent}" opacity=".96" filter="url(#shadow)"/>
            <rect x="218" y="154" width="204" height="18" rx="9" fill="${primary}" opacity=".32"/>
            <rect x="218" y="198" width="132" height="132" rx="24" fill="${primary}" opacity=".20"/>
            <path d="M376 224h46v20h-46zM376 264h46v20h-46zM376 304h34v20h-34z" fill="${primary}" opacity=".30"/>
            <text x="320" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#ffffff">${label}</text>
            <text x="320" y="434" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#ffffff" opacity=".82">${title}</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function productImage(product) {
    return categoryImageMap[product.category] || fallbackProductImage(product);
}

export function createProductCard(product) {
    const article = document.createElement("article");
    article.className = "product-card";
    article.dataset.productId = product.id;
    article.innerHTML = `
        <div class="product-card__media">
            <img src="${productImage(product)}" alt="${escapeHtml(product.name)}" loading="lazy">
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
