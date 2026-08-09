"use strict";


(function initializeSidebar() {

    const sidebar =
        document.querySelector(
            "[data-app-sidebar]"
        );

    const mainToggle =
        document.querySelector(
            "[data-sidebar-main-toggle]"
        );

    const overlay =
        document.querySelector(
            "[data-sidebar-overlay]"
        );

    const expandAllButton =
        document.querySelector(
            "[data-sidebar-expand-all]"
        );

    const collapseAllButton =
        document.querySelector(
            "[data-sidebar-collapse-all]"
        );

    const searchInput =
        document.querySelector(
            "[data-sidebar-search]"
        );

    const searchClear =
        document.querySelector(
            "[data-sidebar-search-clear]"
        );

    const moreButton =
        document.querySelector(
            "[data-sidebar-more-toggle]"
        );

    const moreMenu =
        document.querySelector(
            "[data-sidebar-more-menu]"
        );

    const sortStartButton =
        document.querySelector(
            "[data-sidebar-sort-start]"
        );

    const sortActions =
        document.querySelector(
            "[data-sidebar-sort-actions]"
        );

    const sortSaveButton =
        document.querySelector(
            "[data-sidebar-sort-save]"
        );

    const sortResetButton =
        document.querySelector(
            "[data-sidebar-sort-reset]"
        );

    const sortCancelButton =
        document.querySelector(
            "[data-sidebar-sort-cancel]"
        );

    let searchMode = false;

    let stateBeforeSearch = null;

    let sortMode = false;

    let sortSnapshot = null;

    let systemOrder = null;

    let stateBeforeSort = null;


    if (!sidebar) {

        console.error(
            "Không tìm thấy sidebar."
        );

        return;

    }

    const SIDEBAR_ORDER_KEY =
        "kitchenflow.sidebar.order";

    function expandSortingLevel() {

        sidebar
            .querySelectorAll(
                "[data-sidebar-submenu]"
            )
            .forEach(
                submenu => {

                    submenu.hidden = false;

                    const name =
                        submenu.dataset.sidebarSubmenu;

                    const button =
                        sidebar.querySelector(
                            `[data-sidebar-toggle="${name}"]`
                        );

                    button?.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                    button?.classList.add(
                        "is-open"
                    );

                }
            );


        sidebar
            .querySelectorAll(
                "[data-sidebar-child-submenu]"
            )
            .forEach(
                submenu => {

                    submenu.hidden = true;

                    const name =
                        submenu.dataset.sidebarChildSubmenu;

                    const button =
                        sidebar.querySelector(
                            `[data-sidebar-child-toggle="${name}"]`
                        );

                    button?.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    button?.classList.remove(
                        "is-open"
                    );

                }
            );

    }

    function getSortableKey(item) {

        const mainToggle =
            item.querySelector(
                ":scope > [data-sidebar-toggle]"
            );

        if (mainToggle) {

            return `main:${mainToggle.dataset.sidebarToggle}`;

        }


        const childToggle =
            item.querySelector(
                ":scope > [data-sidebar-child-toggle]"
            );

        if (childToggle) {

            return `child:${childToggle.dataset.sidebarChildToggle}`;

        }


        const link =
            item.querySelector(
                ":scope > [data-sidebar-link]"
            );

        if (link) {

            return `link:${link.dataset.sidebarLink}`;

        }


        return null;

    }

    function getSortableContainers() {

        return [

            sidebar.querySelector(
                ".app-sidebar__menu"
            ),

            ...sidebar.querySelectorAll(
                "[data-sidebar-submenu]"
            ),

            ...sidebar.querySelectorAll(
                "[data-sidebar-child-submenu]"
            )

        ].filter(Boolean);

    }

    function getContainerKey(container) {

        if (
            container.classList.contains(
                "app-sidebar__menu"
            )
        ) {

            return "root";

        }

        if (
            container.dataset
                .sidebarSubmenu
        ) {

            return `submenu:${container.dataset.sidebarSubmenu}`;

        }

        if (
            container.dataset
                .sidebarChildSubmenu
        ) {

            return `child-submenu:${container.dataset.sidebarChildSubmenu}`;

        }

        return null;

    }

    function captureSidebarOrder() {

        const state = {};

        getSortableContainers()
            .forEach(
                container => {

                    const key =
                        getContainerKey(
                            container
                        );

                    if (!key) {
                        return;
                    }

                    state[key] =
                        Array.from(
                            container.children
                        )
                            .map(
                                item =>
                                    getSortableKey(
                                        item
                                    )
                            )
                            .filter(Boolean);

                }
            );

        return state;

    }

    function applySidebarOrder(state) {

        if (!state) {
            return;
        }

        getSortableContainers()
            .forEach(
                container => {

                    const containerKey =
                        getContainerKey(
                            container
                        );

                    const order =
                        state[
                            containerKey
                        ];

                    if (!Array.isArray(order)) {
                        return;
                    }

                    order.forEach(
                        itemKey => {

                            const item =
                                Array.from(
                                    container.children
                                )
                                    .find(
                                        child =>
                                            getSortableKey(
                                                child
                                            ) === itemKey
                                    );

                            if (item) {

                                container.appendChild(
                                    item
                                );

                            }

                        }
                    );

                }
            );

    }

    function saveSidebarOrder() {

        localStorage.setItem(
            SIDEBAR_ORDER_KEY,
            JSON.stringify(
                captureSidebarOrder()
            )
        );

    }

    function restoreSidebarOrder() {

        let state = null;

        try {

            state =
                JSON.parse(
                    localStorage.getItem(
                        SIDEBAR_ORDER_KEY
                    )
                );

        } catch {

            state = null;

        }

        if (state) {

            applySidebarOrder(
                state
            );

        }

    }

    function getDragAfterElement(
        container,
        y
    ) {

        const elements =
            Array.from(
                container.children
            )
                .filter(
                    item =>
                        !item.classList.contains(
                            "is-dragging"
                        ) &&
                        !item.classList.contains(
                            "is-search-hidden"
                        )
                );


        return elements.reduce(
            (
                closest,
                element
            ) => {

                const box =
                    element.getBoundingClientRect();

                const offset =
                    y -
                    box.top -
                    box.height / 2;


                if (
                    offset < 0 &&
                    offset > closest.offset
                ) {

                    return {
                        offset,
                        element
                    };

                }

                return closest;

            },
            {
                offset:
                    Number.NEGATIVE_INFINITY,

                element:
                    null
            }
        ).element;

    }

    function removeDragHandles() {

        sidebar
            .querySelectorAll(
                "[data-sidebar-drag-handle]"
            )
            .forEach(
                handle => handle.remove()
            );

    }

    function createDragHandles() {

        removeDragHandles();

        getSortableContainers()
            .forEach(
                container => {

                    Array.from(
                        container.children
                    )
                        .forEach(
                            item => {

                                if (
                                    !getSortableKey(
                                        item
                                    )
                                ) {
                                    return;
                                }

                                const target =
                                    item.querySelector(
                                        ":scope > button, :scope > a"
                                    );

                                if (!target) {
                                    return;
                                }

                                const handle =
                                    document.createElement(
                                        "span"
                                    );

                                handle.className =
                                    "app-sidebar__drag-handle";

                                handle.dataset
                                    .sidebarDragHandle =
                                    "";

                                handle.textContent =
                                    "⋮⋮";

                                handle.draggable =
                                    true;

                                target.appendChild(
                                    handle
                                );

                            }
                        );

                }
            );

    }

    function initializeSidebarSorting() {

        let dragging =
            null;


        sidebar.addEventListener(
            "dragstart",
            event => {

                if (!sortMode) {
                    return;
                }

                const handle =
                    event.target.closest(
                        "[data-sidebar-drag-handle]"
                    );

                if (!handle) {

                    event.preventDefault();
                    return;

                }

                event.stopPropagation();

                const item =
                    handle.closest(
                        "li"
                    );

                if (!item) {

                    event.preventDefault();
                    return;

                }

                dragging =
                    item;

                item.classList.add(
                    "is-dragging"
                );

                event.dataTransfer.effectAllowed =
                    "move";

                event.dataTransfer.setData(
                    "text/plain",
                    getSortableKey(item) || ""
                );

            }
        );


        sidebar.addEventListener(
            "dragover",
            event => {

                if (
                    !sortMode ||
                    !dragging
                ) {
                    return;
                }

                const container =
                    event.target.closest(
                        ".app-sidebar__menu, " +
                        "[data-sidebar-submenu], " +
                        "[data-sidebar-child-submenu]"
                    );

                if (
                    !container ||
                    dragging.parentElement !==
                        container
                ) {
                    return;
                }

                event.preventDefault();

                const afterElement =
                    getDragAfterElement(
                        container,
                        event.clientY
                    );

                if (!afterElement) {

                    container.appendChild(
                        dragging
                    );

                } else {

                    container.insertBefore(
                        dragging,
                        afterElement
                    );

                }

            }
        );


        sidebar.addEventListener(
            "dragend",
            event => {

                const item =
                    event.target
                        .closest?.(
                            "[data-sidebar-drag-handle]"
                        )
                        ?.closest(
                            "li"
                        ) ||
                    dragging;

                item?.classList.remove(
                    "is-dragging"
                );

                dragging =
                    null;

            }
        );

    }

    function startSorting() {

        if (sortMode) {
            return;
        }

        if (searchInput?.value) {

            searchInput.value =
                "";

            searchSidebar("");

        }


        sortSnapshot =
            captureSidebarOrder();

        stateBeforeSort =
            captureOpenState();


        sortMode =
            true;


        sidebar.classList.add(
            "is-sorting"
        );


        if (sortActions) {

            sortActions.hidden =
                false;

        }


        if (moreMenu) {

            moreMenu.hidden =
                true;

        }


        moreButton?.setAttribute(
            "aria-expanded",
            "false"
        );


        if (searchInput) {

            searchInput.disabled =
                true;

        }


        expandSortingLevel();

        createDragHandles();

    }

    function finishSorting() {

        sortMode =
            false;

        sidebar.classList.remove(
            "is-sorting"
        );

        removeDragHandles();


        if (sortActions) {

            sortActions.hidden =
                true;

        }


        if (searchInput) {

            searchInput.disabled =
                false;

        }


        restoreOpenState(
            stateBeforeSort
        );


        stateBeforeSort =
            null;

        sortSnapshot =
            null;

    }

    function expandAll() {

        sidebar
            .querySelectorAll(
                "[data-sidebar-submenu], [data-sidebar-child-submenu]"
            )
            .forEach(
                submenu => {

                    submenu.hidden =
                        false;

                }
            );

        sidebar
            .querySelectorAll(
                "[data-sidebar-toggle], [data-sidebar-child-toggle]"
            )
            .forEach(
                button => {

                    button.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                    button.classList.add(
                        "is-open"
                    );

                }
            );

    }

    function collapseAll() {

        sidebar
            .querySelectorAll(
                "[data-sidebar-submenu], [data-sidebar-child-submenu]"
            )
            .forEach(
                submenu => {

                    submenu.hidden =
                        true;

                }
            );

        sidebar
            .querySelectorAll(
                "[data-sidebar-toggle], [data-sidebar-child-toggle]"
            )
            .forEach(
                button => {

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    button.classList.remove(
                        "is-open"
                    );

                }
            );

    }

    function isMobile() {

        return window.innerWidth <= 1024;

    }

    function openMobileSidebar() {

        document.body.classList.add(
            "sidebar-open"
        );

        if (overlay) {

            overlay.hidden =
                false;

        }

        mainToggle?.setAttribute(
            "aria-expanded",
            "true"
        );

    }

    function closeMobileSidebar() {

        document.body.classList.remove(
            "sidebar-open"
        );

        if (overlay) {

            overlay.hidden =
                true;

        }

        mainToggle?.setAttribute(
            "aria-expanded",
            "false"
        );

    }

    function toggleDesktopSidebar() {

        const collapsed =
            document.body.classList.toggle(
                "sidebar-collapsed"
            );

        localStorage.setItem(
            "sidebarCollapsed",
            String(collapsed)
        );

    }

    function normalizeSearchText(value) {

        return String(value || "")
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /đ/g,
                "d"
            )
            .toLowerCase()
            .trim();

    }

    function getInitials(value) {

        return normalizeSearchText(value)
            .split(/\s+/)
            .filter(Boolean)
            .map(
                word => word.charAt(0)
            )
            .join("");

    }

    function matchesSearch(
        value,
        keyword
    ) {

        const text =
            normalizeSearchText(value);

        const initials =
            getInitials(value);

        return (
            text.includes(keyword) ||
            initials.includes(keyword)
        );

    }

    function searchSidebar(value) {

        const keyword =
            normalizeSearchText(
                value
            );


        if (!keyword) {

            sidebar
                .querySelectorAll(
                    ".is-search-hidden"
                )
                .forEach(
                    item =>
                        item.classList.remove(
                            "is-search-hidden"
                        )
                );


            if (searchMode) {

                restoreOpenState(
                    stateBeforeSearch
                );

            }


            searchMode =
                false;

            stateBeforeSearch =
                null;


            if (searchClear) {
                searchClear.hidden = true;
            }

            return;

        }


        if (!searchMode) {

            stateBeforeSearch =
                captureOpenState();

            searchMode =
                true;

        }


        if (searchClear) {
            searchClear.hidden = false;
        }


        const topItems =
            sidebar.querySelectorAll(
                ".app-sidebar__menu > li"
            );


        topItems.forEach(
            topItem => {

                const directLink =
                    topItem.querySelector(
                        ":scope > .app-sidebar__menu-link"
                    );


                if (directLink) {

                    const matched =
                        matchesSearch(
                            directLink.textContent,
                            keyword
                        );

                    topItem.classList.toggle(
                        "is-search-hidden",
                        !matched
                    );

                    return;

                }


                const mainButton =
                    topItem.querySelector(
                        ":scope > .app-sidebar__group-button"
                    );

                const mainSubmenu =
                    topItem.querySelector(
                        ":scope > .app-sidebar__submenu"
                    );


                if (
                    !mainButton ||
                    !mainSubmenu
                ) {
                    return;
                }


                const mainMatched =
                    matchesSearch(
                        mainButton.textContent,
                        keyword
                    );


                let hasChildMatch =
                    false;


                const childGroups =
                    mainSubmenu.querySelectorAll(
                        ":scope > .app-sidebar__submenu-group"
                    );


                childGroups.forEach(
                    childGroup => {

                        const childButton =
                            childGroup.querySelector(
                                ":scope > [data-sidebar-child-toggle]"
                            );

                        const childList =
                            childGroup.querySelector(
                                ":scope > [data-sidebar-child-submenu]"
                            );


                        const directChildLink =
                            childGroup.querySelector(
                                ":scope > a[data-sidebar-link]"
                            );


                        if (directChildLink) {

                            const matched =
                                mainMatched ||
                                matchesSearch(
                                    directChildLink.textContent,
                                    keyword
                                );

                            childGroup.classList.toggle(
                                "is-search-hidden",
                                !matched
                            );

                            if (matched) {
                                hasChildMatch = true;
                            }

                            return;

                        }


                        if (!childButton) {
                            return;
                        }


                        const childMatched =
                            matchesSearch(
                                childButton.textContent,
                                keyword
                            );


                        let hasLeafMatch =
                            false;


                        const leafItems =
                            childList
                                ?.querySelectorAll(
                                    ":scope > li"
                                ) || [];


                        leafItems.forEach(
                            leafItem => {

                                const link =
                                    leafItem.querySelector(
                                        ":scope > a"
                                    );

                                const leafMatched =
                                    matchesSearch(
                                        link?.textContent,
                                        keyword
                                    );


                                let visible =
                                    false;


                                if (mainMatched) {

                                    visible =
                                        false;

                                } else if (childMatched) {

                                    visible =
                                        true;

                                } else if (leafMatched) {

                                    visible =
                                        true;

                                    hasLeafMatch =
                                        true;

                                }


                                leafItem.classList.toggle(
                                    "is-search-hidden",
                                    !visible
                                );

                            }
                        );


                        const groupVisible =
                            mainMatched ||
                            childMatched ||
                            hasLeafMatch;


                        childGroup.classList.toggle(
                            "is-search-hidden",
                            !groupVisible
                        );


                        if (groupVisible) {

                            hasChildMatch =
                                true;

                        }


                        if (mainMatched) {

                            if (childList) {
                                childList.hidden = true;
                            }

                            childButton.setAttribute(
                                "aria-expanded",
                                "false"
                            );

                            childButton.classList.remove(
                                "is-open"
                            );

                        } else if (
                            childMatched ||
                            hasLeafMatch
                        ) {

                            if (childList) {
                                childList.hidden = false;
                            }

                            childButton.setAttribute(
                                "aria-expanded",
                                "true"
                            );

                            childButton.classList.add(
                                "is-open"
                            );

                        }

                    }
                );


                const topVisible =
                    mainMatched ||
                    hasChildMatch;


                topItem.classList.toggle(
                    "is-search-hidden",
                    !topVisible
                );


                if (topVisible) {

                    mainSubmenu.hidden =
                        false;

                    mainButton.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                    mainButton.classList.add(
                        "is-open"
                    );

                } else {

                    mainSubmenu.hidden =
                        true;

                    mainButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    mainButton.classList.remove(
                        "is-open"
                    );

                }

            }
        );

    }

    function captureOpenState() {

        return {

            main:
                Array.from(
                    sidebar.querySelectorAll(
                        "[data-sidebar-submenu]"
                    )
                )
                    .map(
                        submenu => ({
                            name:
                                submenu.dataset.sidebarSubmenu,
                            open:
                                !submenu.hidden
                        })
                    ),

            child:
                Array.from(
                    sidebar.querySelectorAll(
                        "[data-sidebar-child-submenu]"
                    )
                )
                    .map(
                        submenu => ({
                            name:
                                submenu.dataset.sidebarChildSubmenu,
                            open:
                                !submenu.hidden
                        })
                    )

        };

    }

    function restoreOpenState(state) {

        if (!state) {
            return;
        }


        state.main.forEach(
            item => {

                const submenu =
                    sidebar.querySelector(
                        `[data-sidebar-submenu="${item.name}"]`
                    );

                const button =
                    sidebar.querySelector(
                        `[data-sidebar-toggle="${item.name}"]`
                    );

                if (!submenu) {
                    return;
                }

                submenu.hidden =
                    !item.open;

                button?.setAttribute(
                    "aria-expanded",
                    String(item.open)
                );

                button?.classList.toggle(
                    "is-open",
                    item.open
                );

            }
        );


        state.child.forEach(
            item => {

                const submenu =
                    sidebar.querySelector(
                        `[data-sidebar-child-submenu="${item.name}"]`
                    );

                const button =
                    sidebar.querySelector(
                        `[data-sidebar-child-toggle="${item.name}"]`
                    );

                if (!submenu) {
                    return;
                }

                submenu.hidden =
                    !item.open;

                button?.setAttribute(
                    "aria-expanded",
                    String(item.open)
                );

                button?.classList.toggle(
                    "is-open",
                    item.open
                );

            }
        );

    }

    mainToggle?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            if (isMobile()) {

                const isOpen =
                    document.body.classList
                        .contains(
                            "sidebar-open"
                        );

                if (isOpen) {

                    closeMobileSidebar();

                } else {

                    openMobileSidebar();

                }

            } else {

                toggleDesktopSidebar();

            }

        }
    );

    expandAllButton?.addEventListener(
        "click",
        () => {

            if (
                document.body.classList
                    .contains(
                        "sidebar-collapsed"
                    )
            ) {

                document.body.classList.remove(
                    "sidebar-collapsed"
                );

                localStorage.setItem(
                    "sidebarCollapsed",
                    "false"
                );

            }

            expandAll();

            if (moreMenu) {
                moreMenu.hidden = true;
            }

            moreButton?.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    );

    collapseAllButton?.addEventListener(
        "click",
        () => {

            collapseAll();

            if (moreMenu) {
                moreMenu.hidden = true;
            }

            moreButton?.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    );

    searchInput?.addEventListener(
        "input",
        event => {

            searchSidebar(
                event.target.value
            );

        }
    );

    searchClear?.addEventListener(
        "click",
        () => {

            searchInput.value = "";

            searchSidebar("");

            searchInput.focus();

        }
    );

    sidebar.addEventListener(
        "click",
        event => {

            const mainButton =
                event.target.closest(
                    "[data-sidebar-toggle]"
                );

            if (mainButton) {

                event.preventDefault();

                event.stopPropagation();

                const name =
                    mainButton.dataset
                        .sidebarToggle;

                const submenu =
                    sidebar.querySelector(
                        `[data-sidebar-submenu="${name}"]`
                    );

                if (!submenu) {

                    console.error(
                        `Không tìm thấy submenu: ${name}`
                    );

                    return;

                }


                if (
                    document.body.classList
                        .contains(
                            "sidebar-collapsed"
                        )
                ) {

                    document.body.classList.remove(
                        "sidebar-collapsed"
                    );

                    localStorage.setItem(
                        "sidebarCollapsed",
                        "false"
                    );

                }


                const open =
                    submenu.hidden;

                submenu.hidden =
                    !open;

                mainButton.classList.toggle(
                    "is-open",
                    open
                );

                mainButton.setAttribute(
                    "aria-expanded",
                    String(open)
                );

                return;

            }


            const childButton =
                event.target.closest(
                    "[data-sidebar-child-toggle]"
                );

            if (childButton) {

                event.preventDefault();

                event.stopPropagation();

                const name =
                    childButton.dataset
                        .sidebarChildToggle;

                const submenu =
                    sidebar.querySelector(
                        `[data-sidebar-child-submenu="${name}"]`
                    );

                if (!submenu) {

                    console.error(
                        `Không tìm thấy menu con: ${name}`
                    );

                    return;

                }


                const open =
                    submenu.hidden;


                // sidebar
                //     .querySelectorAll(
                //         "[data-sidebar-child-submenu]"
                //     )
                //     .forEach(
                //         item => {

                //             if (
                //                 item === submenu
                //             ) {
                //                 return;
                //             }

                //             item.hidden =
                //                 true;

                //             const itemName =
                //                 item.dataset
                //                     .sidebarChildSubmenu;

                //             const itemButton =
                //                 sidebar.querySelector(
                //                     `[data-sidebar-child-toggle="${itemName}"]`
                //                 );

                //             itemButton?.setAttribute(
                //                 "aria-expanded",
                //                 "false"
                //             );

                //             itemButton?.classList.remove(
                //                 "is-open"
                //             );

                //         }
                //     );


                submenu.hidden =
                    !open;

                childButton.classList.toggle(
                    "is-open",
                    open
                );

                childButton.setAttribute(
                    "aria-expanded",
                    String(open)
                );

                return;

            }


            const link =
                event.target.closest(
                    "a[href]"
                );

            if (
                link &&
                isMobile()
            ) {

                closeMobileSidebar();

            }

        }
    );

    sortStartButton?.addEventListener(
        "click",
        () => {

            startSorting();

        }
    );

    sortSaveButton?.addEventListener(
        "click",
        () => {

            saveSidebarOrder();

            finishSorting();

        }
    );

    sortCancelButton?.addEventListener(
        "click",
        () => {

            if (sortSnapshot) {

                applySidebarOrder(
                    sortSnapshot
                );

            }

            finishSorting();

        }
    );

    sortResetButton?.addEventListener(
        "click",
        () => {

            if (!systemOrder) {
                return;
            }

            applySidebarOrder(
                systemOrder
            );

        }
    );

    overlay?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            closeMobileSidebar();

        }
    );

    moreButton?.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            const open =
                moreMenu.hidden;

            moreMenu.hidden =
                !open;

            moreButton.setAttribute(
                "aria-expanded",
                String(open)
            );

        }
    );

    document.addEventListener(
        "click",
        event => {

            if (
                moreMenu?.hidden
            ) {
                return;
            }

            if (
                event.target.closest(
                    ".app-sidebar__more"
                )
            ) {
                return;
            }

            moreMenu.hidden =
                true;

            moreButton?.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    );

    window.addEventListener(
        "resize",
        () => {

            if (!isMobile()) {

                closeMobileSidebar();

            }

        }
    );

    if (!isMobile()) {

        const collapsed =
            localStorage.getItem(
                "sidebarCollapsed"
            ) === "true";

        document.body.classList.toggle(
            "sidebar-collapsed",
            collapsed
        );

    }

    systemOrder =
        captureSidebarOrder();

    restoreSidebarOrder();

    initializeSidebarSorting();
})();