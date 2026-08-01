"use strict";


window.MCS =
    window.MCS || {};


window.MCS.catalog =
    window.MCS.catalog || {};


class MCSPagination {

    constructor(
        root,
        options = {}
    ) {

        this.root =
            typeof root === "string"
                ? document.querySelector(
                    root
                )
                : root;

        this.options = {
            page:
                1,

            pageSize:
                20,

            total:
                0,

            maxVisiblePages:
                5,

            onChange:
                null,

            ...options
        };

        this.elements = {

            from:
                this.root?.querySelector(
                    "[data-pagination-from]"
                ),

            to:
                this.root?.querySelector(
                    "[data-pagination-to]"
                ),

            total:
                this.root?.querySelector(
                    "[data-pagination-total]"
                ),

            pageSize:
                this.root?.querySelector(
                    "[data-pagination-size]"
                ),

            pages:
                this.root?.querySelector(
                    "[data-pagination-pages]"
                ),

            first:
                this.root?.querySelector(
                    "[data-pagination-first]"
                ),

            previous:
                this.root?.querySelector(
                    "[data-pagination-previous]"
                ),

            next:
                this.root?.querySelector(
                    "[data-pagination-next]"
                ),

            last:
                this.root?.querySelector(
                    "[data-pagination-last]"
                )

        };

        if (
            this.elements.pageSize
        ) {

            this.elements.pageSize.value =
                String(
                    this.options.pageSize
                );

        }

        this.bindEvents();

        this.render();

    }


    bindEvents() {

        this.elements.first
            ?.addEventListener(
                "click",
                () =>
                    this.goTo(1)
            );

        this.elements.previous
            ?.addEventListener(
                "click",
                () =>
                    this.goTo(
                        this.options.page - 1
                    )
            );

        this.elements.next
            ?.addEventListener(
                "click",
                () =>
                    this.goTo(
                        this.options.page + 1
                    )
            );

        this.elements.last
            ?.addEventListener(
                "click",
                () =>
                    this.goTo(
                        this.totalPages
                    )
            );

        this.elements.pageSize
            ?.addEventListener(
                "change",
                event => {

                    this.options.pageSize =
                        Number(
                            event.target.value
                        );

                    this.options.page =
                        1;

                    this.render();

                    this.emitChange();

                }
            );

        this.elements.pages
            ?.addEventListener(
                "click",
                event => {

                    const button =
                        event.target.closest(
                            "[data-page]"
                        );

                    if (!button) {
                        return;
                    }

                    this.goTo(
                        Number(
                            button.dataset.page
                        )
                    );

                }
            );

    }


    get totalPages() {

        return Math.max(
            1,
            Math.ceil(
                this.options.total /
                this.options.pageSize
            )
        );

    }


    setData({
        page,
        pageSize,
        total
    } = {}) {

        if (
            page !== undefined
        ) {

            this.options.page =
                Math.max(
                    1,
                    Number(page)
                );

        }

        if (
            pageSize !== undefined
        ) {

            this.options.pageSize =
                Math.max(
                    1,
                    Number(pageSize)
                );

        }

        if (
            total !== undefined
        ) {

            this.options.total =
                Math.max(
                    0,
                    Number(total)
                );

        }

        if (
            this.options.page >
            this.totalPages
        ) {

            this.options.page =
                this.totalPages;

        }

        this.render();

    }


    getState() {

        return {
            page:
                this.options.page,

            pageSize:
                this.options.pageSize,

            total:
                this.options.total,

            totalPages:
                this.totalPages
        };

    }


    goTo(page) {

        const target =
            Math.min(
                this.totalPages,
                Math.max(
                    1,
                    Number(page)
                )
            );

        if (
            target ===
            this.options.page
        ) {
            return;
        }

        this.options.page =
            target;

        this.render();

        this.emitChange();

    }


    emitChange() {

        this.options.onChange?.(
            this.getState()
        );

    }


    render() {

        if (!this.root) {
            return;
        }

        const total =
            this.options.total;

        const page =
            this.options.page;

        const pageSize =
            this.options.pageSize;

        const from =
            total === 0
                ? 0
                : (
                    (page - 1) *
                    pageSize +
                    1
                );

        const to =
            Math.min(
                total,
                page * pageSize
            );

        if (this.elements.from) {

            this.elements.from.textContent =
                from;

        }

        if (this.elements.to) {

            this.elements.to.textContent =
                to;

        }

        if (this.elements.total) {

            this.elements.total.textContent =
                new Intl
                    .NumberFormat(
                        "vi-VN"
                    )
                    .format(total);

        }

        if (
            this.elements.pageSize
        ) {

            this.elements.pageSize.value =
                String(pageSize);

        }

        if (this.elements.first) {

            this.elements.first.disabled =
                page <= 1;

        }

        if (this.elements.previous) {

            this.elements.previous.disabled =
                page <= 1;

        }

        if (this.elements.next) {

            this.elements.next.disabled =
                page >= this.totalPages;

        }

        if (this.elements.last) {

            this.elements.last.disabled =
                page >= this.totalPages;

        }

        this.renderPages();

    }


    renderPages() {

        if (!this.elements.pages) {
            return;
        }

        this.elements.pages.innerHTML =
            "";

        const pages =
            this.getVisiblePages();

        pages.forEach(
            item => {

                if (
                    item === "ellipsis"
                ) {

                    const ellipsis =
                        document.createElement(
                            "span"
                        );

                    ellipsis.className =
                        "catalog-pagination__ellipsis";

                    ellipsis.textContent =
                        "…";

                    this.elements.pages
                        .appendChild(
                            ellipsis
                        );

                    return;

                }

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "catalog-pagination__button";

                button.dataset.page =
                    item;

                button.textContent =
                    item;

                if (
                    item ===
                    this.options.page
                ) {

                    button.classList.add(
                        "is-active"
                    );

                    button.setAttribute(
                        "aria-current",
                        "page"
                    );

                }

                this.elements.pages
                    .appendChild(
                        button
                    );

            }
        );

    }


    getVisiblePages() {

        const totalPages =
            this.totalPages;

        const current =
            this.options.page;

        const maxVisible =
            this.options
                .maxVisiblePages;

        if (
            totalPages <=
            maxVisible + 2
        ) {

            return Array.from(
                {
                    length:
                        totalPages
                },
                (
                    _,
                    index
                ) =>
                    index + 1
            );

        }

        const result =
            [1];

        const half =
            Math.floor(
                maxVisible / 2
            );

        let start =
            Math.max(
                2,
                current - half
            );

        let end =
            Math.min(
                totalPages - 1,
                start +
                maxVisible -
                1
            );

        start =
            Math.max(
                2,
                end -
                maxVisible +
                1
            );

        if (start > 2) {

            result.push(
                "ellipsis"
            );

        }

        for (
            let page = start;
            page <= end;
            page += 1
        ) {

            result.push(page);

        }

        if (
            end <
            totalPages - 1
        ) {

            result.push(
                "ellipsis"
            );

        }

        result.push(
            totalPages
        );

        return result;

    }

}


window.MCS.catalog.Pagination =
    MCSPagination;