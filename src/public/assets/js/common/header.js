"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const userButton =
            document.querySelector(
                "[data-header-user-button]"
            );

        const userMenu =
            document.querySelector(
                "[data-header-user-menu]"
            );

        const userArrow =
            document.querySelector(
                "[data-header-user-arrow]"
            );

        const changePasswordButton =
            document.querySelector(
                "[data-header-change-password]"
            );

        const logoutButton =
            document.querySelector(
                "[data-header-logout]"
            );

        const notificationButton =
            document.querySelector(
                "[data-header-notification-button]"
            );

        const notificationMenu =
            document.querySelector(
                "[data-header-notification-menu]"
            );


        function isUserMenuOpen() {

            return (
                userMenu &&
                userMenu.hidden === false
            );

        }


        function isNotificationMenuOpen() {

            return (
                notificationMenu &&
                notificationMenu.hidden === false
            );

        }


        function openUserMenu() {

            if (
                !userMenu ||
                !userButton
            ) {
                return;
            }

            closeNotificationMenu();

            userMenu.hidden =
                false;

            userMenu.classList.add(
                "is-open"
            );

            userButton.classList.add(
                "is-open"
            );

            userArrow?.classList.add(
                "is-open"
            );

            userButton.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        function closeUserMenu() {

            if (
                !userMenu ||
                !userButton
            ) {
                return;
            }

            userMenu.hidden =
                true;

            userMenu.classList.remove(
                "is-open"
            );

            userButton.classList.remove(
                "is-open"
            );

            userArrow?.classList.remove(
                "is-open"
            );

            userButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }


        function toggleUserMenu() {

            if (
                isUserMenuOpen()
            ) {

                closeUserMenu();

            } else {

                openUserMenu();

            }

        }


        function openNotificationMenu() {

            if (
                !notificationMenu ||
                !notificationButton
            ) {
                return;
            }

            closeUserMenu();

            notificationMenu.hidden =
                false;

            notificationMenu.classList.add(
                "is-open"
            );

            notificationButton.classList.add(
                "is-open"
            );

            notificationButton.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        function closeNotificationMenu() {

            if (
                !notificationMenu ||
                !notificationButton
            ) {
                return;
            }

            notificationMenu.hidden =
                true;

            notificationMenu.classList.remove(
                "is-open"
            );

            notificationButton.classList.remove(
                "is-open"
            );

            notificationButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }


        function toggleNotificationMenu() {

            if (
                isNotificationMenuOpen()
            ) {

                closeNotificationMenu();

            } else {

                openNotificationMenu();

            }

        }


        function openChangePasswordModal() {

            closeUserMenu();

            const modal =
                document.getElementById(
                    "changePasswordModal"
                );

            if (!modal) {

                window.MCS?.toast
                    ?.error(
                        "Không tìm thấy cửa sổ đổi mật khẩu."
                    );

                return;

            }

            window.MCS?.modal
                ?.open(
                    modal
                );

        }


        function logout() {

            closeUserMenu();

            const executeLogout =
                () => {

                    localStorage.removeItem(
                        "accessToken"
                    );

                    localStorage.removeItem(
                        "refreshToken"
                    );

                    localStorage.removeItem(
                        "currentUser"
                    );

                    sessionStorage.clear();

                    window.location.replace(
                        "/auth/login"
                    );

                };


            if (
                window.MCS?.confirm
                    ?.show
            ) {

                window.MCS.confirm.show({

                    title:
                        "Xác nhận đăng xuất",

                    message:
                        "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",

                    confirmLabel:
                        "Đăng xuất",

                    type:
                        "danger",

                    onConfirm:
                        executeLogout

                });

                return;

            }

            const confirmed =
                window.confirm(
                    "Bạn có chắc chắn muốn đăng xuất?"
                );

            if (confirmed) {

                executeLogout();

            }

        }


        userButton?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                toggleUserMenu();

            }
        );


        notificationButton
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    toggleNotificationMenu();

                }
            );


        userMenu?.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );


        notificationMenu
            ?.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                }
            );


        changePasswordButton
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    openChangePasswordModal();

                }
            );


        logoutButton
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    logout();

                }
            );


        document.addEventListener(
            "click",
            event => {

                const clickedInsideUser =
                    (
                        userMenu?.contains(
                            event.target
                        ) ||
                        userButton?.contains(
                            event.target
                        )
                    );

                if (
                    !clickedInsideUser
                ) {

                    closeUserMenu();

                }


                const clickedInsideNotification =
                    (
                        notificationMenu?.contains(
                            event.target
                        ) ||
                        notificationButton?.contains(
                            event.target
                        )
                    );

                if (
                    !clickedInsideNotification
                ) {

                    closeNotificationMenu();

                }

            }
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                    "Escape"
                ) {
                    return;
                }

                closeUserMenu();

                closeNotificationMenu();

            }
        );

    }
);