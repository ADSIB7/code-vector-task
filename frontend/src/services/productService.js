import { getJson } from "../api/http.js";

function buildProductPath({ category, snapshot_time, next_cursor } = {}) {
    const params = new URLSearchParams();

    if (category) {
        params.set("category", category);
    }

    if (snapshot_time && next_cursor) {
        params.set("snapshot", snapshot_time);
        params.set("cursor_time", next_cursor.created_at);
        params.set("cursor_id", next_cursor.id);
    }

    const query = params.toString();

    return query ? `/products?${query}` : "/products";
}

export async function fetchProductsPage(session, options = {}) {
    const page = await getJson(buildProductPath(session), options);

    return {
        snapshot_time: page.snapshot_time,
        next_cursor: page.next_cursor,
        products: Array.isArray(page.products) ? page.products : []
    };
}

export async function fetchCategories(options = {}) {
    const page = await getJson("/products/categories", options);

    return Array.isArray(page.categories) ? page.categories : [];
}
