import { createProductCatalogStore } from "./hooks/useProductCatalog.js";
import { createProductGrid } from "./components/ProductGrid.js";
import { createInfiniteScroll } from "./components/InfiniteScroll.js";
import { createSkeletonGrid, createSpinner } from "./components/LoadingSkeleton.js";
import { withErrorBoundary } from "./components/ErrorBoundary.js";
import { createCategoryFilter } from "./components/CategoryFilter.js";

const app = document.querySelector("#app");
const catalog = createProductCatalogStore();
const grid = createProductGrid();
const spinner = createSpinner();
const skeleton = createSkeletonGrid(8);
const categoryFilter = createCategoryFilter({
    onChange: (category) => catalog.setCategory(category)
});

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

const shell = document.createElement("main");
shell.className = "catalog-shell";
shell.innerHTML = `
    <header class="catalog-header">
        <div>
            <p class="eyebrow">Marketplace catalog</p>
            <h1>Discover products for every cart</h1>
        </div>
        <div class="catalog-actions">
            <div class="filter-slot"></div>
            <button class="refresh-button" type="button">Refresh</button>
        </div>
    </header>
    <section class="filter-summary" aria-live="polite"></section>
    <section class="status-panel" aria-live="polite"></section>
`;

const statusPanel = shell.querySelector(".status-panel");
const filterSummary = shell.querySelector(".filter-summary");
const filterSlot = shell.querySelector(".filter-slot");
const refreshButton = shell.querySelector(".refresh-button");
const infiniteScroll = createInfiniteScroll({
    onLoadMore: () => catalog.loadNextPage()
});

filterSlot.appendChild(categoryFilter.element);
shell.appendChild(grid.element);
shell.appendChild(infiniteScroll.element);
app.appendChild(shell);

function renderError(message) {
    statusPanel.innerHTML = `
        <div class="feedback feedback--error">
            <strong>Products could not be loaded</strong>
            <span>${message}</span>
            <button class="retry-button" type="button">Retry</button>
        </div>
    `;
    statusPanel.querySelector(".retry-button").addEventListener("click", catalog.retry);
}

function renderEmpty() {
    statusPanel.innerHTML = `
        <div class="feedback">
            <strong>No products found</strong>
            <span>No products match the selected category.</span>
        </div>
    `;
}

function renderEnd() {
    statusPanel.innerHTML = `
        <div class="end-marker">You have reached the end of the catalog.</div>
    `;
}

function renderState(state) {
    withErrorBoundary(() => {
        categoryFilter.render({
            categories: state.categories,
            selectedCategory: state.selectedCategory,
            loading: state.categoriesLoading,
            error: state.categoryError
        });

        filterSummary.innerHTML = state.selectedCategory
            ? `<span>Filtering by&nbsp;<strong>${escapeHtml(state.selectedCategory)}</strong></span>`
            : "";

        grid.render(state.products);
        statusPanel.innerHTML = "";
        spinner.remove();
        skeleton.remove();

        if (state.loading && !state.initialized) {
            grid.element.before(skeleton);
            return;
        }

        if (state.error) {
            renderError(state.error);
            return;
        }

        if (state.initialized && state.products.length === 0) {
            renderEmpty();
            return;
        }

        if (state.loading) {
            statusPanel.appendChild(spinner);
            return;
        }

        if (state.initialized && !state.hasMore) {
            renderEnd();
        }
    }, (error) => {
        renderError(error.message || "Something went wrong while rendering the catalog.");
    });
}

refreshButton.addEventListener("click", catalog.reset);
catalog.subscribe(renderState);
catalog.loadCategories();
catalog.loadNextPage();
