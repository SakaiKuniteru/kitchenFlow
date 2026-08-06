"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const CONFIG = {

            employeeDetailEndpoint:
                "/api/mcs/v1/dm-nhan-vien",

            employeeUpdateEndpoint:
                "/api/mcs/v1/dm-nhan-vien/cap-nhat",

            countryEndpoint:
                "/api/mcs/v1/dm-quoc-gia/tong-hop",

            provinceEndpoint:
                "/api/mcs/v1/dm-tinh-thanh/tong-hop",

            wardEndpoint:
                "/api/mcs/v1/dm-xa-phuong/tong-hop",

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

            userMenu:
                document.querySelector(
                    "[data-header-user-menu]"
                ),

            userArrow:
                document.querySelector(
                    "[data-header-user-arrow]"
                ),

            userNames:
                document.querySelectorAll(
                    "[data-header-user-name]"
                ),

            accountNames:
                document.querySelectorAll(
                    "[data-header-account-name]"
                ),

            userAvatars:
                document.querySelectorAll(
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
                ),

            profileOpenButton:
                document.querySelector(
                    "[data-header-profile-open]"
                ),

            profileModal:
                document.getElementById(
                    "employeeProfileModal"
                ),

            profileForm:
                document.getElementById(
                    "employeeProfileForm"
                ),

            profileAvatar:
                document.querySelector(
                    "[data-employee-profile-avatar]"
                ),

            profileAvatarInput:
                document.querySelector(
                    "[data-employee-avatar-input]"
                ),

            profileMessage:
                document.querySelector(
                    "[data-employee-profile-message]"
                ),

            countrySelect:
                document.getElementById(
                    "quocGiaId"
                ),

            provinceSelect:
                document.getElementById(
                    "tinhThanhId"
                ),

            wardSelect:
                document.getElementById(
                    "xaPhuongId"
                )
        };

        const addressState = {

            countries:
                [],

            provinces:
                [],

            wards:
                []

        };

        let avatarPreviewUrl = null;

        async function initialize() {

            initializeAddressSmartSelects();

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

        async function openEmployeeProfile() {

            const currentUser =
                getStoredCurrentUser();

            const nhanVienId =
                Number(
                    currentUser?.nhanVienId
                );

            if (
                !Number.isInteger(nhanVienId) ||
                nhanVienId <= 0
            ) {

                window.MCS?.toast?.error(
                    "Không xác định được nhân viên đang đăng nhập."
                );

                return;

            }

            try {

                setProfileMessage("");

                if (
                    elements.profileAvatarInput
                ) {

                    elements.profileAvatarInput.value =
                        "";

                }
                const result =
                    await authenticatedRequest(
                        `${CONFIG.employeeDetailEndpoint}/${nhanVienId}`,
                        {
                            method: "GET"
                        }
                    );

                const employee =
                    result?.data;

                if (!employee) {

                    throw new Error(
                        "API không trả về thông tin nhân viên."
                    );

                }

                elements.profileForm.dataset
                    .employeeId =
                    String(nhanVienId);

                await loadAddressOptions(
                    employee
                );

                fillEmployeeProfile(
                    employee
                );

                window.MCS.modal.open(
                    elements.profileModal
                );

            } catch (error) {

                window.MCS?.toast?.error(
                    error.message ||
                    "Không thể tải thông tin nhân viên."
                );

            }

        }

        async function updateEmployeeProfile(
            event
        ) {

            event.preventDefault();

            const form =
                elements.profileForm;

            const nhanVienId =
                Number(
                    form.dataset.employeeId
                );

            if (
                !Number.isInteger(nhanVienId) ||
                nhanVienId <= 0
            ) {

                setProfileMessage(
                    "ID nhân viên không hợp lệ."
                );

                return;

            }

            const submitButton =
                form.querySelector(
                    "[data-employee-profile-submit]"
                );

            const formData =
                new FormData();

            const editableFields = [
                "hoTen",
                "email",
                "soDienThoai",
                "ngaySinh",
                "gioiTinh",
                "diaChi",
                "quocGiaId",
                "tinhThanhId",
                "xaPhuongId"
            ];

            editableFields.forEach(
                fieldName => {

                    const field =
                        form.elements.namedItem(
                            fieldName
                        );

                    if (!field) {
                        return;
                    }

                    formData.append(
                        fieldName,
                        field.value ?? ""
                    );

                }
            );

            const avatarInput =
                form.elements.namedItem(
                    "anhDaiDien"
                );

            if (
                avatarInput?.files?.[0]
            ) {

                formData.append(
                    "anhDaiDien",
                    avatarInput.files[0]
                );

            }

            submitButton.disabled =
                true;

            submitButton.textContent =
                "Đang cập nhật...";

            try {

                const result =
                    await authenticatedRequest(
                        `${CONFIG.employeeUpdateEndpoint}/${nhanVienId}`,
                        {
                            method: "PATCH",
                            body: formData
                        }
                    );

                const updatedEmployee =
                    result?.data;

                if (updatedEmployee) {

                    const currentUser =
                        getStoredCurrentUser() || {};

                    const updatedCurrentUser = {

                        ...currentUser,

                        hoTen:
                            updatedEmployee.hoTen,

                        email:
                            updatedEmployee.email,

                        soDienThoai:
                            updatedEmployee.soDienThoai,

                        anhDaiDien:
                            updatedEmployee.anhDaiDien,

                        ngaySinh:
                            updatedEmployee.ngaySinh,

                        gioiTinh:
                            updatedEmployee.gioiTinh,

                        diaChi:
                            updatedEmployee.diaChi,

                        quocGiaId:
                            updatedEmployee.quocGiaId,

                        tinhThanhId:
                            updatedEmployee.tinhThanhId,

                        xaPhuongId:
                            updatedEmployee.xaPhuongId

                    };

                    saveCurrentUser(
                        updatedCurrentUser
                    );

                    renderCurrentUser(
                        updatedCurrentUser
                    );

                }

                window.MCS.modal.close(
                    elements.profileModal
                );

                window.MCS?.toast?.success(
                    result?.message ||
                    "Cập nhật thông tin nhân viên thành công."
                );

            } catch (error) {

                setProfileMessage(
                    error.message ||
                    "Không thể cập nhật thông tin nhân viên."
                );

            } finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Cập nhật";

            }

        }

        async function authenticatedRequest(
            url,
            options = {}
        ) {

            const accessToken =
                localStorage.getItem(
                    CONFIG.accessTokenKey
                );

            if (!accessToken) {

                throw new Error(
                    "Phiên đăng nhập không tồn tại."
                );

            }

            const headers = {
                Accept:
                    "application/json",

                Authorization:
                    `Bearer ${accessToken}`,

                ...(options.headers || {})
            };

            if (
                options.body &&
                !(options.body instanceof FormData)
            ) {

                headers["Content-Type"] =
                    "application/json";

            }

            const response =
                await fetch(
                    url,
                    {
                        ...options,
                        headers,
                        body:
                            options.body instanceof FormData
                                ? options.body
                                : (
                                    options.body
                                        ? JSON.stringify(
                                            options.body
                                        )
                                        : undefined
                                )
                    }
                );

            const result =
                await response.json()
                    .catch(
                        () => null
                    );

            if (!response.ok) {

                const error =
                    new Error(
                        result?.message ||
                        "Yêu cầu không thành công."
                    );

                error.status =
                    response.status;

                throw error;

            }

            return result;

        }

        function extractArrayData(
            result
        ) {

            if (
                Array.isArray(
                    result?.data
                )
            ) {

                return result.data;

            }

            if (
                Array.isArray(
                    result?.data?.items
                )
            ) {

                return result.data.items;

            }

            if (
                Array.isArray(
                    result?.data?.rows
                )
            ) {

                return result.data.rows;

            }

            return [];

        }

        async function loadAddressOptions(
            employee
        ) {

            const [
                countryResult,
                provinceResult,
                wardResult
            ] = await Promise.all([

                authenticatedRequest(
                    CONFIG.countryEndpoint,
                    {
                        method:
                            "GET"
                    }
                ),

                authenticatedRequest(
                    CONFIG.provinceEndpoint,
                    {
                        method:
                            "GET"
                    }
                ),

                authenticatedRequest(
                    CONFIG.wardEndpoint,
                    {
                        method:
                            "GET"
                    }
                )

            ]);


            addressState.countries =
                extractArrayData(
                    countryResult
                );

            addressState.provinces =
                extractArrayData(
                    provinceResult
                );

            addressState.wards =
                extractArrayData(
                    wardResult
                );


            const currentCountryId =
                toPositiveInteger(
                    employee?.quocGiaId
                );

            const currentProvinceId =
                toPositiveInteger(
                    employee?.tinhThanhId
                );

            const currentWardId =
                toPositiveInteger(
                    employee?.xaPhuongId
                );

            setSmartSelectOptions(
                elements.countrySelect,
                addressState.countries.map(
                    country => ({

                        value:
                            String(country.id),

                        label:
                            getCountryLabel(
                                country
                            ),

                        disabled:
                            country.active === false

                    })
                ),
                currentCountryId
            );

            renderProvinceOptions(
                currentCountryId,
                currentProvinceId
            );

            renderWardOptions(
                currentProvinceId,
                currentWardId
            );

        }

        function getProvinceCountryId(
            province
        ) {

            return Number(

                province?.quocGiaId ??
                province?.quoc_gia_id ??
                province?.quocGia?.id ??
                province?.quoc_gia?.id ??
                0

            );

        }

        function getWardProvinceId(
            ward
        ) {

            return Number(

                ward?.tinhThanhId ??
                ward?.tinh_thanh_id ??
                ward?.tinhThanh?.id ??
                ward?.tinh_thanh?.id ??
                0

            );

        }

        function getProvinceLabel(
            province
        ) {

            return (

                province?.tenTinhThanh ||
                province?.ten_tinh_thanh ||
                province?.ten ||
                province?.name ||
                `Tỉnh/thành #${province?.id || ""}`

            );

        }

        function getWardLabel(
            ward
        ) {

            return (

                ward?.tenXaPhuong ||
                ward?.ten_xa_phuong ||
                ward?.ten ||
                ward?.name ||
                `Xã/phường #${ward?.id || ""}`

            );

        }

        function getCountryLabel(
            country
        ) {

            return (

                country?.tenQuocGia ||
                country?.ten_quoc_gia ||
                country?.ten ||
                country?.name ||
                `Quốc gia #${country?.id || ""}`

            );

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

            elements.userNames
                .forEach(
                    element => {

                        element.textContent =
                            hoTen;

                    }
                );

            elements.accountNames
                .forEach(
                    element => {

                        element.textContent =
                            taiKhoan;

                    }
                );

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

        function renderAvatar(
            currentUser
        ) {

            const imageUrl =
                currentUser?.anhDaiDien;

            elements.userAvatars
                .forEach(
                    container => {

                        if (!imageUrl) {

                            container.innerHTML =
                                `
                                    <span aria-hidden="true">
                                        👤
                                    </span>
                                `;

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
                                    `
                                        <span aria-hidden="true">
                                            👤
                                        </span>
                                    `;

                            },
                            {
                                once: true
                            }
                        );

                        container.appendChild(
                            image
                        );

                    }
                );

        }

        function renderProvinceOptions(
            countryId,
            selectedProvinceId = null
        ) {

            const normalizedCountryId =
                toPositiveInteger(
                    countryId
                );

            const provinces =
                normalizedCountryId
                    ? addressState.provinces.filter(
                        province =>
                            getProvinceCountryId(
                                province
                            ) ===
                            normalizedCountryId
                    )
                    : [];


            setSmartSelectOptions(
                elements.provinceSelect,
                provinces.map(
                    province => ({

                        value:
                            String(province.id),

                        label:
                            getProvinceLabel(
                                province
                            ),

                        disabled:
                            province.active === false

                    })
                ),
                selectedProvinceId
            );


            setSmartSelectDisabled(
                elements.provinceSelect,
                !normalizedCountryId,
                normalizedCountryId
                    ? (
                        provinces.length > 0
                            ? "Tỉnh/Thành phố..."
                            : "Quốc gia chưa có tỉnh thành"
                    )
                    : "Chọn quốc gia trước"
            );

        }

        function renderWardOptions(
            provinceId,
            selectedWardId = null
        ) {

            const normalizedProvinceId =
                toPositiveInteger(
                    provinceId
                );

            const wards =
                normalizedProvinceId
                    ? addressState.wards.filter(
                        ward =>
                            getWardProvinceId(
                                ward
                            ) ===
                            normalizedProvinceId
                    )
                    : [];


            setSmartSelectOptions(
                elements.wardSelect,
                wards.map(
                    ward => ({

                        value:
                            String(ward.id),

                        label:
                            getWardLabel(
                                ward
                            ),

                        disabled:
                            ward.active === false

                    })
                ),
                selectedWardId
            );


            setSmartSelectDisabled(
                elements.wardSelect,
                !normalizedProvinceId,
                normalizedProvinceId
                    ? (
                        wards.length > 0
                            ? "Xã/Phường..."
                            : "Tỉnh thành chưa có xã/phường"
                    )
                    : "Chọn tỉnh thành trước"
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

        function initializeAddressSmartSelects() {

            elements.countrySelect
                ?.addEventListener(
                    "change",
                    handleCountryChange
                );

            elements.provinceSelect
                ?.addEventListener(
                    "change",
                    handleProvinceChange
                );

            elements.wardSelect
                ?.addEventListener(
                    "change",
                    handleWardChange
                );

        }

        function handleCountryChange() {

            const countryId =
                toPositiveInteger(
                    elements.countrySelect?.value
                );

            renderProvinceOptions(
                countryId,
                null
            );

            renderWardOptions(
                null,
                null
            );

        }

        function handleProvinceChange() {

            const provinceId =
                toPositiveInteger(
                    elements.provinceSelect?.value
                );

            renderWardOptions(
                provinceId,
                null
            );

        }

        function handleWardChange() {

            const wardId =
                toPositiveInteger(
                    elements.wardSelect?.value
                );

            console.log(
                "Xã/phường đã chọn:",
                wardId
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

            elements.profileOpenButton
                ?.addEventListener(
                    "click",
                    async event => {

                        event.preventDefault();

                        event.stopPropagation();

                        closeUserMenu();

                        await openEmployeeProfile();

                    }
                );

            elements.profileForm
                ?.addEventListener(
                    "submit",
                    updateEmployeeProfile
                );

            elements.profileAvatarInput
                ?.addEventListener(
                    "change",
                    handleAvatarPreview
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

        function handleAvatarPreview(
            event
        ) {

            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                event.target.value =
                    "";

                setProfileMessage(
                    "Ảnh đại diện chỉ hỗ trợ JPG, PNG hoặc WEBP."
                );

                return;

            }

            const maxSize =
                5 * 1024 * 1024;

            if (
                file.size > maxSize
            ) {

                event.target.value =
                    "";

                setProfileMessage(
                    "Ảnh đại diện không được vượt quá 5 MB."
                );

                return;

            }

            setProfileMessage("");

            if (avatarPreviewUrl) {

                URL.revokeObjectURL(
                    avatarPreviewUrl
                );

            }

            avatarPreviewUrl =
                URL.createObjectURL(
                    file
                );

            renderProfileAvatar(
                avatarPreviewUrl
            );

        }

        function normalizeSearchText(
            value
        ) {

            return String(
                value || ""
            )
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .toLowerCase()
                .trim();

        }

        function fillEmployeeProfile(
            employee
        ) {

            const form =
                elements.profileForm;

            if (!form) {
                return;
            }


            setFormValue(
                form,
                "maNhanVien",
                employee.maNhanVien
            );

            setFormValue(
                form,
                "hoTen",
                employee.hoTen
            );

            setFormValue(
                form,
                "email",
                employee.email
            );

            setFormValue(
                form,
                "soDienThoai",
                employee.soDienThoai
            );

            setFormValue(
                form,
                "coSo",
                employee.coSo?.tenCoSo ||
                ""
            );

            setFormValue(
                form,
                "phongBan",
                employee.phongBan?.tenPhongBan ||
                ""
            );

            setFormValue(
                form,
                "chucVu",
                employee.chucVu?.tenChucVu ||
                ""
            );

            setDatePickerValue(
                form,
                "ngaySinh",
                employee.ngaySinh
            );

            const genderNativeSelect =
                form.elements.namedItem(
                    "gioiTinh"
                );

            const genderSmartSelectRoot =
                genderNativeSelect?.closest(
                    "[data-smart-select]"
                );


            if (
                genderSmartSelectRoot
            ) {

                window.MCS.smartSelect
                    .initialize(
                        genderSmartSelectRoot
                    );

                genderSmartSelectRoot
                    .smartSelect
                    .setValue(
                        String(
                            employee.gioiTinh ??
                            ""
                        ),
                        false
                    );

            }


            setFormValue(
                form,
                "diaChi",
                employee.diaChi
            );


            renderProfileAvatar(
                employee.anhDaiDien
            );

        }

        function setFormValue(
            form,
            name,
            value
        ) {

            const field =
                form?.elements?.namedItem(
                    name
                );

            if (!field) {
                return;
            }

            field.value =
                value ?? "";

        }

        function setDatePickerValue(
            form,
            fieldName,
            value
        ) {

            const fieldContainer =
                form.querySelector(
                    `[data-form-field="${fieldName}"]`
                );

            if (!fieldContainer) {
                return;
            }

            const hiddenInput =
                fieldContainer.querySelector(
                    "[data-date-value]"
                );

            const displayInput =
                fieldContainer.querySelector(
                    "[data-date-input]"
                );

            const databaseValue =
                normalizeDateValue(
                    value
                );

            const displayValue =
                formatDateDisplay(
                    databaseValue
                );


            /*
            * Giá trị gửi backend: YYYY-MM-DD
            */
            if (hiddenInput) {

                hiddenInput.value =
                    databaseValue;

            }


            /*
            * Giá trị hiển thị: DD/MM/YYYY
            */
            if (displayInput) {

                displayInput.value =
                    displayValue;

            }


            /*
            * Đồng bộ với date-picker.js nếu component
            * đã được khởi tạo.
            */
            const datePickerApi =
                fieldContainer.datePicker ||
                fieldContainer.querySelector(
                    ".date-picker"
                )?.datePicker;


            if (
                datePickerApi?.setValue
            ) {

                datePickerApi.setValue(
                    databaseValue,
                    false
                );

            }


            hiddenInput?.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles:
                            true
                    }
                )
            );

        }

        function setSmartSelectOptions(
            nativeSelect,
            options,
            selectedValue = null
        ) {

            if (!nativeSelect) {
                return;
            }

            const smartSelectRoot =
                nativeSelect.closest(
                    "[data-smart-select]"
                );

            const normalizedOptions =
                Array.isArray(options)
                    ? options
                    : [];

            const normalizedSelectedValue =
                selectedValue === null ||
                selectedValue === undefined ||
                selectedValue === ""
                    ? ""
                    : String(selectedValue);

            nativeSelect.innerHTML =
                "";

            const placeholderOption =
                document.createElement(
                    "option"
                );

            placeholderOption.value =
                "";

            placeholderOption.textContent =
                "";

            nativeSelect.appendChild(
                placeholderOption
            );

            normalizedOptions.forEach(
                option => {

                    const optionElement =
                        document.createElement(
                            "option"
                        );

                    optionElement.value =
                        String(
                            option.value
                        );

                    optionElement.textContent =
                        option.label || "";

                    optionElement.disabled =
                        option.disabled === true;

                    optionElement.selected =
                        String(option.value) ===
                        normalizedSelectedValue;

                    nativeSelect.appendChild(
                        optionElement
                    );

                }
            );


            nativeSelect.value =
                normalizedSelectedValue;


            if (!smartSelectRoot) {
                return;
            }

            window.MCS?.smartSelect
                ?.initialize(
                    smartSelectRoot
                );

            if (
                typeof smartSelectRoot
                    .smartSelect
                    ?.setOptions ===
                "function"
            ) {

                smartSelectRoot
                    .smartSelect
                    .setOptions(
                        normalizedOptions,
                        false
                    );

            }


            if (
                typeof smartSelectRoot
                    .smartSelect
                    ?.setValue ===
                "function"
            ) {

                smartSelectRoot
                    .smartSelect
                    .setValue(
                        normalizedSelectedValue,
                        false
                    );

            } else {

                nativeSelect.dispatchEvent(
                    new Event(
                        "change",
                        {
                            bubbles:
                                true
                        }
                    )
                );

            }

        }

        function setSmartSelectDisabled(
            nativeSelect,
            disabled,
            placeholder
        ) {

            if (!nativeSelect) {
                return;
            }

            const smartSelectRoot =
                nativeSelect.closest(
                    "[data-smart-select]"
                );

            if (!smartSelectRoot) {
                return;
            }

            const searchInput =
                smartSelectRoot.querySelector(
                    "[data-smart-select-search]"
                );

            const toggleButton =
                smartSelectRoot.querySelector(
                    "[data-smart-select-toggle]"
                );

            const isDisabled =
                Boolean(disabled);


            nativeSelect.disabled =
                isDisabled;

            if (searchInput) {

                searchInput.disabled =
                    isDisabled;

                /*
                * Không đặt placeholder trực tiếp lên ô tìm kiếm.
                * Placeholder chính do Smart Select tự render.
                */
                searchInput.placeholder =
                    "";

            }

            if (toggleButton) {

                toggleButton.disabled =
                    isDisabled;

            }

            smartSelectRoot.classList.toggle(
                "is-disabled",
                isDisabled
            );

            /*
            * Cập nhật placeholder chính của component.
            */
            if (placeholder) {

                smartSelectRoot.dataset
                    .selectPlaceholder =
                    placeholder;

            }

            const api =
                smartSelectRoot.smartSelect;

            if (
                typeof api?.setDisabled ===
                "function"
            ) {

                api.setDisabled(
                    isDisabled
                );

            }

            /*
            * Render lại để placeholder và giá trị không chồng nhau.
            */
            if (
                typeof api?.refresh ===
                "function"
            ) {

                api.refresh();

            }

        }

        function toPositiveInteger(
            value
        ) {

            const number =
                Number(value);

            if (
                !Number.isInteger(number) ||
                number <= 0
            ) {
                return null;
            }

            return number;

        }

        function normalizeDateValue(
            value
        ) {

            if (!value) {
                return "";
            }

            const rawValue =
                String(value).trim();


            /*
            * API trả YYYY-MM-DD
            */
            const databaseMatch =
                rawValue.match(
                    /^(\d{4})-(\d{2})-(\d{2})/
                );

            if (databaseMatch) {

                return [
                    databaseMatch[1],
                    databaseMatch[2],
                    databaseMatch[3]
                ].join("-");

            }


            /*
            * API trả DD/MM/YYYY
            */
            const displayMatch =
                rawValue.match(
                    /^(\d{2})\/(\d{2})\/(\d{4})$/
                );

            if (displayMatch) {

                return [
                    displayMatch[3],
                    displayMatch[2],
                    displayMatch[1]
                ].join("-");

            }


            /*
            * Trường hợp API trả chuỗi ngày giờ đầy đủ.
            */
            const date =
                new Date(
                    rawValue
                );

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return "";
            }

            const year =
                date.getFullYear();

            const month =
                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );

            const day =
                String(
                    date.getDate()
                ).padStart(
                    2,
                    "0"
                );

            return `${year}-${month}-${day}`;

        }

        function formatDateDisplay(
            databaseValue
        ) {

            if (!databaseValue) {
                return "";
            }

            const match =
                String(databaseValue).match(
                    /^(\d{4})-(\d{2})-(\d{2})$/
                );

            if (!match) {
                return "";
            }

            return [
                match[3],
                match[2],
                match[1]
            ].join("/");

        }

        function renderProfileAvatar(
            imageUrl
        ) {

            const container =
                elements.profileAvatar;

            if (!container) {
                return;
            }

            if (!imageUrl) {

                container.innerHTML =
                    "<span aria-hidden=\"true\">👤</span>";

                return;

            }

            container.innerHTML = "";

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                imageUrl.startsWith("blob:")
                ||
                imageUrl.startsWith("data:")
                ||
                imageUrl.startsWith("http://")
                ||
                imageUrl.startsWith("https://")
                    ? imageUrl
                    : (
                        imageUrl.startsWith("/")
                            ? imageUrl
                            : `/${imageUrl}`
                    );

            image.alt =
                "Ảnh đại diện nhân viên";

            image.addEventListener(
                "error",
                () => {

                    container.innerHTML =
                        "<span aria-hidden=\"true\">👤</span>";

                },
                {
                    once: true
                }
            );

            container.appendChild(
                image
            );

        }

        function setProfileMessage(message = "", type = "error") {

            const element =
                elements.profileMessage;

            if (!element) {
                return;
            }

            if (!message) {

                element.hidden = true;
                element.textContent = "";
                element.classList.remove(
                    "is-success",
                    "is-error"
                );

                return;

            }

            element.hidden = false;

            element.textContent =
                message;

            element.classList.remove(
                "is-success",
                "is-error"
            );

            element.classList.add(
                type === "success"
                    ? "is-success"
                    : "is-error"
            );

        }

        initialize();

    }
);