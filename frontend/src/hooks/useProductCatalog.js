import { fetchCategories, fetchProductsPage } from "../services/productService.js";

const initialState = {
    products: [],
    categories: [],
    selectedCategory: "",
    snapshot_time: null,
    next_cursor: null,
    loading: false,
    categoriesLoading: false,
    hasMore: true,
    error: null,
    categoryError: null,
    initialized: false
};

export function createProductCatalogStore() {
    let state = { ...initialState };
    let controller = null;
    let categoryController = null;
    let requestSequence = 0;
    const subscribers = new Set();
    const productIds = new Set();

    function notify() {
        subscribers.forEach((subscriber) => subscriber(state));
    }

    function setState(nextState) {
        state = {
            ...state,
            ...nextState
        };
        notify();
    }

    function appendProducts(products) {
        const uniqueProducts = [];

        products.forEach((product) => {
            if (!product?.id || productIds.has(product.id)) {
                return;
            }

            productIds.add(product.id);
            uniqueProducts.push(product);
        });

        return uniqueProducts;
    }

    async function loadNextPage() {
        if (state.loading || !state.hasMore) {
            return;
        }

        controller?.abort();
        controller = new AbortController();
        const requestId = requestSequence;

        setState({
            loading: true,
            error: null
        });

        try {
            const page = await fetchProductsPage({
                category: state.selectedCategory,
                snapshot_time: state.snapshot_time,
                next_cursor: state.next_cursor
            }, {
                signal: controller.signal
            });

            if (requestId !== requestSequence) {
                return;
            }

            const uniqueProducts = appendProducts(page.products);

            setState({
                products: [...state.products, ...uniqueProducts],
                snapshot_time: state.snapshot_time || page.snapshot_time,
                next_cursor: page.next_cursor,
                hasMore: Boolean(page.next_cursor),
                loading: false,
                initialized: true
            });
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            setState({
                loading: false,
                error: error.message || "Unable to load products",
                initialized: true
            });
        }
    }

    async function loadCategories() {
        categoryController?.abort();
        categoryController = new AbortController();

        setState({
            categoriesLoading: true,
            categoryError: null
        });

        try {
            const categories = await fetchCategories({
                signal: categoryController.signal
            });

            setState({
                categories,
                categoriesLoading: false
            });
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            setState({
                categoriesLoading: false,
                categoryError: error.message || "Unable to load categories"
            });
        }
    }

    function retry() {
        loadNextPage();
    }

    function resetProducts(nextCategory = state.selectedCategory) {
        controller?.abort();
        requestSequence += 1;
        productIds.clear();
        state = {
            ...state,
            products: [],
            selectedCategory: nextCategory,
            snapshot_time: null,
            next_cursor: null,
            loading: false,
            hasMore: true,
            error: null,
            initialized: false
        };
        notify();
        loadNextPage();
    }

    function setCategory(category) {
        const nextCategory = category || "";

        if (nextCategory === state.selectedCategory) {
            return;
        }

        resetProducts(nextCategory);
    }

    function reset() {
        resetProducts(state.selectedCategory);
    }

    function subscribe(subscriber) {
        subscribers.add(subscriber);
        subscriber(state);

        return () => {
            subscribers.delete(subscriber);
        };
    }

    return {
        subscribe,
        loadNextPage,
        loadCategories,
        retry,
        reset,
        setCategory,
        getState: () => state
    };
}
