"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const CONFIG = {

            currentUserEndpoint:
                "/api/mcs/v1/auth/nhan-vien-hien-tai",

            systemSettingEndpoint:
                "/api/mcs/v1/dm-thiet-lap/tong-hop",

            facilityEndpoint:
                "/api/mcs/v1/dm-co-so/tong-hop",

            currentUserKey:
                "currentUser",

            accessTokenKey:
                "accessToken",

            refreshTokenKey:
                "refreshToken",

            fallbackUserName:
                "Người dùng",

            fallbackAccountName:
                "Chưa có tài khoản",

            fallbackSystemName:
                "MCS KITCHENFLOW",

            fallbackSystemLogo:
                "/assets/images/logo/logo.png"

        };


        const elements = {

            systemName:
                document.querySelector(
                    "[data-header-system-name]"
                ),

            systemLogo:
                document.querySelector(
                    "[data-header-system-logo]"
                ),

            userButton:
                document.querySelector(
                    "[data-header-user-button]"
                ),

            userButton:
                document.querySelector(
                    "[data-header-user-button]"
                ),

            userMenu:
                document.querySelector(
                    "[data-header-user-menu]"
                ),

            userArrow:
                document.querySelector(
                    "[data-header-user-arrow]"
                ),

            userName:
                document.querySelector(
                    "[data-header-user-name]"
                ),

            accountName:
                document.querySelector(
                    "[data-header-account-name]"
                ),

            userAvatar:
                document.querySelector(
                    "[data-header-user-avatar]"
                ),

            changePasswordButton:
                document.querySelector(
                    "[data-header-change-password]"
                ),

            logoutButton:
                document.querySelector(
                    "[data-header-logout]"
                ),

            notificationButton:
                document.querySelector(
                    "[data-header-notification-button]"
                ),

            notificationMenu:
                document.querySelector(
                    "[data-header-notification-menu]"
                )

        };


        async function initialize() {

            bindEvents();

            renderStoredCurrentUser();

            await Promise.allSettled([

                loadCurrentUser(),

                loadSystemInformation()

            ]);

        }

        async function loadCurrentUser() {

            const accessToken =
                localStorage.getItem(
                    CONFIG.accessTokenKey
                );

            if (!accessToken) {

                clearAuthentication();

                redirectToLogin();

                return;

            }

            try {

                let result;

                if (
                    window.MCS?.api?.request
                ) {

                    result =
                        await window.MCS.api.request(
                            CONFIG.currentUserEndpoint,
                            {
                                method:
                                    "GET"
                            }
                        );

                } else {

                    const response =
                        await fetch(
                            CONFIG.currentUserEndpoint,
                            {
                                method:
                                    "GET",

                                headers: {

                                    Accept:
                                        "application/json",

                                    Authorization:
                                        `Bearer ${accessToken}`

                                }
                            }
                        );

                    const responseData =
                        await response.json();

                    if (!response.ok) {

                        const error =
                            new Error(
                                responseData?.message ||
                                "Không thể lấy thông tin người dùng."
                            );

                        error.status =
                            response.status;

                        throw error;

                    }

                    result =
                        responseData;

                }

                const currentUser =
                    result?.data;

                if (!currentUser) {

                    throw new Error(
                        "API không trả về thông tin người dùng."
                    );

                }

                saveCurrentUser(
                    currentUser
                );

                renderCurrentUser(
                    currentUser
                );

            } catch (error) {

                console.error(
                    "Không thể tải thông tin người dùng:",
                    error
                );

                if (
                    error?.status === 401 ||
                    error?.status === 403
                ) {

                    clearAuthentication();

                    redirectToLogin();

                    return;

                }

                const storedUser =
                    getStoredCurrentUser();

                if (storedUser) {

                    renderCurrentUser(
                        storedUser
                    );

                }

            }

        }

        async function loadSystemInformation() {

            try {

                const settingResult =
                    await window.MCS
                        .api
                        .request(
                            CONFIG.systemSettingEndpoint
                        );

                const settings =
                    settingResult?.data;

                const systemNameSetting =
                    findSettingByCode(
                        settings,
                        "TEN_HE_THONG"
                    );

                const defaultFacilitySetting =
                    findSettingByCode(
                        settings,
                        "LOGO_CO_SO_MAC_DINH"
                    );

                const systemName =
                    systemNameSetting?.giaTri ||
                    CONFIG.fallbackSystemName;

                if (
                    elements.systemName
                ) {

                    elements.systemName
                        .textContent =
                        systemName;

                }

                document.title =
                    systemName;

                const facilityCode =
                    defaultFacilitySetting?.giaTri;

                if (!facilityCode) {

                    renderSystemLogo(
                        CONFIG.fallbackSystemLogo,
                        systemName
                    );

                    return;

                }

                const facilityResult =
                    await window.MCS
                        .api
                        .request(
                            CONFIG.facilityEndpoint
                        );

                const facilities =
                    facilityResult?.data;

                const facility =
                    findFacilityByCode(
                        facilities,
                        facilityCode
                    );

                const logo =
                    facility?.logo ||
                    CONFIG.fallbackSystemLogo;

                renderSystemLogo(
                    logo,
                    systemName
                );

            } catch (error) {

                console.error(
                    "Không thể tải thông tin hệ thống:",
                    error
                );

                if (
                    elements.systemName
                ) {

                    elements.systemName
                        .textContent =
                        CONFIG.fallbackSystemName;

                }

                renderSystemLogo(
                    CONFIG.fallbackSystemLogo,
                    CONFIG.fallbackSystemName
                );

            }

        }

        function renderSystemLogo(
            logo,
            systemName
        ) {

            if (
                !elements.systemLogo
            ) {
                return;
            }

            elements.systemLogo.src =
                logo ||
                CONFIG.fallbackSystemLogo;

            elements.systemLogo.alt =
                `Logo ${systemName}`;

            elements.systemLogo.onerror =
                () => {

                    elements.systemLogo.onerror =
                        null;

                    elements.systemLogo.src =
                        CONFIG.fallbackSystemLogo;

                };

        }

        function findSettingByCode(
            settings,
            code
        ) {

            if (!Array.isArray(settings)) {
                return null;
            }

            return settings.find(
                item =>
                    String(
                        item?.maThietLap || ""
                    )
                        .trim()
                        .toUpperCase()
                    ===
                    String(code)
                        .trim()
                        .toUpperCase()
            ) || null;

        }

        function findFacilityByCode(
            facilities,
            code
        ) {

            if (!Array.isArray(facilities)) {
                return null;
            }

            return facilities.find(
                item =>
                    String(
                        item?.maCoSo || ""
                    )
                        .trim()
                        .toUpperCase()
                    ===
                    String(code)
                        .trim()
                        .toUpperCase()
            ) || null;

        }

        function getStoredCurrentUser() {

            if (
                window.MCS?.storage
                    ?.getCurrentUser
            ) {

                return window.MCS
                    .storage
                    .getCurrentUser();

            }

            const raw =
                localStorage.getItem(
                    CONFIG.currentUserKey
                );

            if (!raw) {
                return null;
            }

            try {

                return JSON.parse(
                    raw
                );

            } catch (error) {

                console.warn(
                    "Không thể đọc currentUser:",
                    error
                );

                localStorage.removeItem(
                    CONFIG.currentUserKey
                );

                return null;

            }

        }


        /**
         * ==================================================
         * Lưu thông tin người dùng
         * ==================================================
         */
        function saveCurrentUser(
            currentUser
        ) {

            if (
                window.MCS?.storage
                    ?.setCurrentUser
            ) {

                window.MCS.storage
                    .setCurrentUser(
                        currentUser
                    );

                return;

            }

            localStorage.setItem(
                CONFIG.currentUserKey,
                JSON.stringify(
                    currentUser
                )
            );

        }


        /**
         * ==================================================
         * Hiển thị dữ liệu đã lưu trước khi API hoàn tất
         * ==================================================
         */
        function renderStoredCurrentUser() {

            const currentUser =
                getStoredCurrentUser();

            if (!currentUser) {
                return;
            }

            renderCurrentUser(
                currentUser
            );

        }


        /**
         * ==================================================
         * Render thông tin người dùng lên header
         * ==================================================
         */
        function renderCurrentUser(
            currentUser
        ) {

            const hoTen =
                currentUser?.hoTen ||
                CONFIG.fallbackUserName;

            const taiKhoan =
                currentUser?.taiKhoan ||
                currentUser?.tenDangNhap ||
                CONFIG.fallbackAccountName;

            setTextContent(
                elements.userName,
                hoTen
            );

            setTextContent(
                elements.accountName,
                taiKhoan
            );

            /**
             * Cập nhật tất cả vị trí dùng chung tên người dùng.
             */
            document
                .querySelectorAll(
                    "[data-current-user-name]"
                )
                .forEach(
                    element => {

                        element.textContent =
                            hoTen;

                    }
                );

            renderAvatar(
                currentUser
            );

        }


        /**
         * ==================================================
         * Render ảnh đại diện
         * ==================================================
         */
        function renderAvatar(
            currentUser
        ) {

            const container =
                elements.userAvatar;

            if (!container) {
                return;
            }

            const imageUrl =
                currentUser?.anhDaiDien;

            if (!imageUrl) {

                container.innerHTML =
                    "<span aria-hidden=\"true\">👤</span>";

                return;

            }

            container.innerHTML =
                "";

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                imageUrl;

            image.alt =
                `Ảnh đại diện của ${
                    currentUser?.hoTen ||
                    CONFIG.fallbackUserName
                }`;

            image.addEventListener(
                "error",
                () => {

                    container.innerHTML =
                        "<span aria-hidden=\"true\">👤</span>";

                },
                {
                    once:
                        true
                }
            );

            container.appendChild(
                image
            );

        }


        function setTextContent(
            element,
            value
        ) {

            if (!element) {
                return;
            }

            element.textContent =
                value ?? "";

        }


        function isUserMenuOpen() {

            return (
                elements.userMenu &&
                elements.userMenu.hidden === false
            );

        }


        function isNotificationMenuOpen() {

            return (
                elements.notificationMenu &&
                elements.notificationMenu.hidden === false
            );

        }


        function openUserMenu() {

            if (
                !elements.userMenu ||
                !elements.userButton
            ) {
                return;
            }

            closeNotificationMenu();

            elements.userMenu.hidden =
                false;

            elements.userMenu.classList.add(
                "is-open"
            );

            elements.userButton.classList.add(
                "is-open"
            );

            elements.userArrow?.classList.add(
                "is-open"
            );

            elements.userButton.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        function closeUserMenu() {

            if (
                !elements.userMenu ||
                !elements.userButton
            ) {
                return;
            }

            elements.userMenu.hidden =
                true;

            elements.userMenu.classList.remove(
                "is-open"
            );

            elements.userButton.classList.remove(
                "is-open"
            );

            elements.userArrow?.classList.remove(
                "is-open"
            );

            elements.userButton.setAttribute(
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
                !elements.notificationMenu ||
                !elements.notificationButton
            ) {
                return;
            }

            closeUserMenu();

            elements.notificationMenu.hidden =
                false;

            elements.notificationMenu.classList.add(
                "is-open"
            );

            elements.notificationButton.classList.add(
                "is-open"
            );

            elements.notificationButton.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        function closeNotificationMenu() {

            if (
                !elements.notificationMenu ||
                !elements.notificationButton
            ) {
                return;
            }

            elements.notificationMenu.hidden =
                true;

            elements.notificationMenu.classList.remove(
                "is-open"
            );

            elements.notificationButton.classList.remove(
                "is-open"
            );

            elements.notificationButton.setAttribute(
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


        /**
         * ==================================================
         * Đăng xuất
         * ==================================================
         */
        async function logout() {

            closeUserMenu();

            const executeLogout =
                async () => {

                    const refreshToken =
                        localStorage.getItem(
                            CONFIG.refreshTokenKey
                        );

                    try {

                        if (
                            refreshToken &&
                            window.MCS?.api?.request
                        ) {

                            await window.MCS
                                .api
                                .request(
                                    "/api/mcs/v1/auth/logout",
                                    {
                                        method:
                                            "POST",

                                        body: {
                                            refreshToken
                                        }
                                    }
                                );

                        }

                    } catch (error) {

                        console.info(
                            "Không thể thu hồi refresh token:",
                            error.message
                        );

                    } finally {

                        clearAuthentication();

                        redirectToLogin();

                    }

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

                await executeLogout();

            }

        }


        function clearAuthentication() {

            localStorage.removeItem(
                CONFIG.accessTokenKey
            );

            localStorage.removeItem(
                CONFIG.refreshTokenKey
            );

            localStorage.removeItem(
                CONFIG.currentUserKey
            );

            sessionStorage.clear();

        }


        function redirectToLogin() {

            if (
                window.location.pathname
                    === "/auth/login"
            ) {
                return;
            }

            window.location.replace(
                "/auth/login"
            );

        }


        function bindEvents() {

            elements.userButton
                ?.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();

                        toggleUserMenu();

                    }
                );


            elements.notificationButton
                ?.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();

                        toggleNotificationMenu();

                    }
                );


            elements.userMenu
                ?.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                    }
                );


            elements.notificationMenu
                ?.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                    }
                );


            elements.changePasswordButton
                ?.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();

                        openChangePasswordModal();

                    }
                );


            elements.logoutButton
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
                            elements.userMenu
                                ?.contains(
                                    event.target
                                )
                            ||
                            elements.userButton
                                ?.contains(
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
                            elements.notificationMenu
                                ?.contains(
                                    event.target
                                )
                            ||
                            elements.notificationButton
                                ?.contains(
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


        initialize();

    }
);