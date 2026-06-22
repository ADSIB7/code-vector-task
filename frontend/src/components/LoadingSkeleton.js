export function createSkeletonGrid(count = 8) {
    const wrapper = document.createElement("div");
    wrapper.className = "skeleton-grid";
    wrapper.setAttribute("aria-hidden", "true");

    for (let index = 0; index < count; index += 1) {
        const item = document.createElement("div");
        item.className = "skeleton-card";
        item.innerHTML = `
            <div class="skeleton-card__media shimmer"></div>
            <div class="skeleton-card__line shimmer"></div>
            <div class="skeleton-card__line skeleton-card__line--short shimmer"></div>
            <div class="skeleton-card__button shimmer"></div>
        `;
        wrapper.appendChild(item);
    }

    return wrapper;
}

export function createSpinner() {
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    spinner.setAttribute("role", "status");
    spinner.setAttribute("aria-label", "Loading products");
    return spinner;
}
