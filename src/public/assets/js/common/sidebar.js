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


    if (!sidebar) {

        console.error(
            "Không tìm thấy sidebar."
        );

        return;

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


                sidebar
                    .querySelectorAll(
                        "[data-sidebar-child-submenu]"
                    )
                    .forEach(
                        item => {

                            if (
                                item === submenu
                            ) {
                                return;
                            }

                            item.hidden =
                                true;

                            const itemName =
                                item.dataset
                                    .sidebarChildSubmenu;

                            const itemButton =
                                sidebar.querySelector(
                                    `[data-sidebar-child-toggle="${itemName}"]`
                                );

                            itemButton?.setAttribute(
                                "aria-expanded",
                                "false"
                            );

                            itemButton?.classList.remove(
                                "is-open"
                            );

                        }
                    );


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


    overlay?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            closeMobileSidebar();

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

})();