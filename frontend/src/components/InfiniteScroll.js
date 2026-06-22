export function createInfiniteScroll({ onLoadMore }) {
    const sentinel = document.createElement("div");
    sentinel.className = "scroll-sentinel";
    sentinel.setAttribute("aria-hidden", "true");

    const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
            onLoadMore();
        }
    }, {
        root: null,
        rootMargin: "480px 0px",
        threshold: 0
    });

    observer.observe(sentinel);

    return {
        element: sentinel,
        disconnect: () => observer.disconnect()
    };
}
