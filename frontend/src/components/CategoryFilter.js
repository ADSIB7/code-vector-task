function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function createCategoryFilter({ onChange }) {
    const wrapper = document.createElement("label");
    wrapper.className = "category-filter";
    wrapper.innerHTML = `
        <span>Category</span>
        <select aria-label="Filter products by category">
            <option value="">All categories</option>
        </select>
    `;

    const select = wrapper.querySelector("select");

    select.addEventListener("change", () => {
        onChange(select.value);
    });

    function render({ categories, selectedCategory, loading, error }) {
        const options = [
            `<option value="">All categories</option>`,
            ...categories.map((category) => {
                const selected = category === selectedCategory ? " selected" : "";
                return `<option value="${escapeHtml(category)}"${selected}>${escapeHtml(category)}</option>`;
            })
        ];

        select.innerHTML = options.join("");
        select.value = selectedCategory || "";
        select.disabled = Boolean(loading && categories.length === 0);
        wrapper.dataset.active = selectedCategory ? "true" : "false";
        wrapper.dataset.loading = loading ? "true" : "false";
        wrapper.title = error || "";
    }

    return {
        element: wrapper,
        render
    };
}
