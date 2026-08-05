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
            
            profileMessage:
                document.querySelector(
                    "[data-employee-profile-message]"
                ),

            countryPicker:
                document.querySelector(
                    '[data-searchable-select="country"]'
                ),

            provincePicker:
                document.querySelector(
                    '[data-searchable-select="province"]'
                ),

            wardPicker:
                document.querySelector(
                    '[data-searchable-select="ward"]'
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

        let countryPicker = null;

        let provincePicker = null;

        let wardPicker = null;

        async function initialize() {

            initializeSearchableAddress();

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
                        field.value
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
                Number(
                    employee?.quocGiaId ||
                    0
                );

            const currentProvinceId =
                Number(
                    employee?.tinhThanhId ||
                    0
                );

            const currentWardId =
                Number(
                    employee?.xaPhuongId ||
                    0
                );


            /*
            * Quốc gia
            */
            countryPicker.setItems(

                addressState.countries.map(
                    item => ({

                        ...item,

                        label:
                            getCountryLabel(
                                item
                            )

                    })
                ),

                currentCountryId || null

            );


            /*
            * Tỉnh/thành thuộc quốc gia
            */
            const provinces =
                addressState.provinces.filter(
                    item => {

                        return (
                            getProvinceCountryId(
                                item
                            ) === currentCountryId
                        );

                    }
                );


            provincePicker.setItems(

                provinces.map(
                    item => ({

                        ...item,

                        label:
                            getProvinceLabel(
                                item
                            )

                    })
                ),

                currentProvinceId || null

            );


            provincePicker.setDisabled(

                !currentCountryId,

                currentCountryId
                    ? "Chọn tỉnh thành..."
                    : "Chọn quốc gia trước"

            );


            /*
            * Xã/phường thuộc tỉnh
            */
            const wards =
                addressState.wards.filter(
                    item => {

                        return (
                            getWardProvinceId(
                                item
                            ) === currentProvinceId
                        );

                    }
                );


            wardPicker.setItems(

                wards.map(
                    item => ({

                        ...item,

                        label:
                            getWardLabel(
                                item
                            )

                    })
                ),

                currentWardId || null

            );


            wardPicker.setDisabled(

                !currentProvinceId,

                currentProvinceId
                    ? "Chọn xã/phường..."
                    : "Chọn tỉnh thành trước"

            );


            console.log(
                "Địa chỉ nhân viên:",
                {
                    currentCountryId,
                    currentProvinceId,
                    currentWardId
                }
            );

            console.log(
                "Số tỉnh phù hợp:",
                provinces.length,
                provinces[0]
            );

            console.log(
                "Số xã/phường phù hợp:",
                wards.length,
                wards[0]
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

        function renderProvinceOptions(
            countryId,
            selectedProvinceId = null
        ) {

            const id =
                Number(countryId);

            const provinces =
                Number.isInteger(id) &&
                id > 0
                    ? addressState.provinces.filter(
                        item =>
                            getProvinceCountryId(
                                item
                            ) === id
                    )
                    : [];

            fillSelectElement(
                elements.provinceSelect,
                provinces,
                "tenTinhThanh",
                selectedProvinceId,
                id
                    ? "Chưa chọn"
                    : "Chọn quốc gia trước"
            );

            if (
                elements.provinceSelect
            ) {

                elements.provinceSelect.disabled =
                    !id;

            }

            if (
                elements.provinceSearch
            ) {

                elements.provinceSearch.disabled =
                    !id;

            }
        }

        function renderWardOptions(
            provinceId,
            selectedWardId = null
        ) {

            const id =
                Number(provinceId);

            const wards =
                Number.isInteger(id) &&
                id > 0
                    ? addressState.wards.filter(
                        item =>
                            getWardProvinceId(
                                item
                            ) === id
                    )
                    : [];

            fillSelectElement(
                elements.wardSelect,
                wards,
                "tenXaPhuong",
                selectedWardId,
                id
                    ? "Chưa chọn"
                    : "Chọn tỉnh thành trước"
            );

            if (
                elements.wardSelect
            ) {

                elements.wardSelect.disabled =
                    !id;

            }

            if (
                elements.wardSearch
            ) {

                elements.wardSearch.disabled =
                    !id;

            }
        }

        function fillSelectElement(
            select,
            items,
            labelKey,
            selectedValue = null,
            placeholder = "Chưa chọn"
        ) {

            if (!select) {
                return;
            }

            select.innerHTML =
                "";

            const emptyOption =
                document.createElement(
                    "option"
                );

            emptyOption.value =
                "";

            emptyOption.textContent =
                placeholder;

            select.appendChild(
                emptyOption
            );

            items.forEach(
                item => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        item.id;

                    option.textContent =
                        item[labelKey] ||
                        item.ten ||
                        `ID ${item.id}`;

                    option.selected =
                        Number(item.id) ===
                        Number(selectedValue);

                    select.appendChild(
                        option
                    );

                }
            );

        }

        function fillSelect(
            selector,
            items,
            valueKey,
            labelKey,
            selectedValue
        ) {

            const select =
                document.querySelector(
                    selector
                );

            if (!select) {
                return;
            }

            select.innerHTML =
                '<option value="">Chưa chọn</option>';

            if (!Array.isArray(items)) {
                return;
            }

            items.forEach(
                item => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        item[valueKey];

                    option.textContent =
                        item[labelKey];

                    option.selected =
                        Number(item[valueKey]) ===
                        Number(selectedValue);

                    select.appendChild(
                        option
                    );

                }
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

        function initializeSearchableAddress() {

            countryPicker =
                createSearchableSelect(
                    elements.countryPicker,
                    {
                        onChange:
                            country => {

                                const countryId =
                                    Number(
                                        country?.id ||
                                        0
                                    );

                                const provinces =
                                    countryId
                                        ? addressState.provinces
                                            .filter(
                                                item => {

                                                    return (
                                                        getProvinceCountryId(
                                                            item
                                                        ) ===
                                                        countryId
                                                    );

                                                }
                                            )
                                            .map(
                                                item => ({

                                                    ...item,

                                                    label:
                                                        getProvinceLabel(
                                                            item
                                                        )

                                                })
                                            )
                                        : [];


                                provincePicker.setItems(
                                    provinces
                                );

                                provincePicker.setDisabled(

                                    !countryId,

                                    countryId
                                        ? "Chọn tỉnh thành..."
                                        : "Chọn quốc gia trước"

                                );


                                wardPicker.setItems(
                                    []
                                );

                                wardPicker.clear(
                                    "Chọn tỉnh thành trước"
                                );

                                wardPicker.setDisabled(
                                    true,
                                    "Chọn tỉnh thành trước"
                                );

                            }
                    }
                );

            provincePicker =
                createSearchableSelect(
                    elements.provincePicker,
                    {
                        onChange:
                            province => {

                                const provinceId =
                                    Number(
                                        province?.id ||
                                        0
                                    );

                                const wards =
                                    provinceId
                                        ? addressState.wards
                                            .filter(
                                                item => {

                                                    return (
                                                        getWardProvinceId(
                                                            item
                                                        ) ===
                                                        provinceId
                                                    );

                                                }
                                            )
                                            .map(
                                                item => ({

                                                    ...item,

                                                    label:
                                                        getWardLabel(
                                                            item
                                                        )

                                                })
                                            )
                                        : [];


                                wardPicker.setItems(
                                    wards
                                );

                                wardPicker.setDisabled(

                                    !provinceId,

                                    provinceId
                                        ? "Chọn xã/phường..."
                                        : "Chọn tỉnh thành trước"

                                );

                            }
                    }
                );

            wardPicker =
                createSearchableSelect(
                    elements.wardPicker
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

            elements.countrySelect
                ?.addEventListener(
                    "change",
                    () => {

                        const countryId =
                            elements.countrySelect
                                .value;

                        renderProvinceOptions(
                            countryId
                        );

                        renderWardOptions(
                            null
                        );

                        if (
                            elements.provinceSearch
                        ) {

                            elements.provinceSearch.value =
                                "";

                        }

                        if (
                            elements.wardSearch
                        ) {

                            elements.wardSearch.value =
                                "";

                        }
                    }
                );

            elements.provinceSelect
                ?.addEventListener(
                    "change",
                    () => {

                        const provinceId =
                            elements.provinceSelect
                                .value;

                        renderWardOptions(
                            provinceId
                        );

                        elements.wardSearch.value =
                            "";

                    }
                );

            bindSelectSearch(
                elements.countrySearch,
                elements.countrySelect
            );

            bindSelectSearch(
                elements.provinceSearch,
                elements.provinceSelect
            );

            bindSelectSearch(
                elements.wardSearch,
                elements.wardSelect
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

            document.addEventListener(
                "click",
                () => {

                    countryPicker?.close();

                    provincePicker?.close();

                    wardPicker?.close();

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

        function createSearchableSelect(
            container,
            {
                onChange = null
            } = {}
        ) {

            if (!container) {
                return null;
            }

            const input =
                container.querySelector(
                    "[data-searchable-input]"
                );

            const hiddenInput =
                container.querySelector(
                    "[data-searchable-value]"
                );

            const toggleButton =
                container.querySelector(
                    "[data-searchable-toggle]"
                );

            const dropdown =
                container.querySelector(
                    "[data-searchable-dropdown]"
                );

            const optionsContainer =
                container.querySelector(
                    "[data-searchable-options]"
                );

            const state = {

                items:
                    [],

                filteredItems:
                    [],

                selectedId:
                    null,

                selectedItem:
                    null,

                disabled:
                    input?.disabled === true

            };


            function getItemLabel(
                item
            ) {

                return item?.label ||
                    item?.ten ||
                    "";
            }


            function open() {

                if (state.disabled) {
                    return;
                }

                dropdown.hidden =
                    false;

                container.classList.add(
                    "is-open"
                );

                renderOptions(
                    input.value
                );

            }


            function close() {

                dropdown.hidden =
                    true;

                container.classList.remove(
                    "is-open"
                );

                if (
                    state.selectedItem
                ) {

                    input.value =
                        getItemLabel(
                            state.selectedItem
                        );

                }

            }


            function toggle() {

                if (
                    dropdown.hidden
                ) {

                    open();

                } else {

                    close();

                }

            }


            function renderOptions(
                keyword = ""
            ) {

                const normalizedKeyword =
                    normalizeSearchText(
                        keyword
                    );

                state.filteredItems =
                    state.items.filter(
                        item => {

                            const label =
                                normalizeSearchText(
                                    getItemLabel(
                                        item
                                    )
                                );

                            return !normalizedKeyword ||
                                label.includes(
                                    normalizedKeyword
                                );

                        }
                    );

                optionsContainer.innerHTML =
                    "";

                if (
                    state.filteredItems.length === 0
                ) {

                    const empty =
                        document.createElement(
                            "div"
                        );

                    empty.className =
                        "searchable-select__empty";

                    empty.textContent =
                        "Không tìm thấy dữ liệu.";

                    optionsContainer.appendChild(
                        empty
                    );

                    return;

                }

                state.filteredItems.forEach(
                    item => {

                        const button =
                            document.createElement(
                                "button"
                            );

                        button.type =
                            "button";

                        button.className =
                            "searchable-select__option";

                        button.textContent =
                            getItemLabel(
                                item
                            );

                        if (
                            Number(item.id) ===
                            Number(state.selectedId)
                        ) {

                            button.classList.add(
                                "is-selected"
                            );

                        }

                        button.addEventListener(
                            "click",
                            () => {

                                selectItem(
                                    item
                                );

                            }
                        );

                        optionsContainer.appendChild(
                            button
                        );

                    }
                );

            }


            function selectItem(
                item,
                emitChange = true
            ) {

                state.selectedId =
                    item?.id ?? null;

                state.selectedItem =
                    item || null;

                hiddenInput.value =
                    item?.id ?? "";

                input.value =
                    item
                        ? getItemLabel(item)
                        : "";

                close();

                if (
                    emitChange &&
                    typeof onChange ===
                        "function"
                ) {

                    onChange(
                        item
                    );

                }

            }


            function setItems(
                items,
                selectedId = null
            ) {

                state.items =
                    Array.isArray(items)
                        ? items
                        : [];

                const selectedItem =
                    state.items.find(
                        item =>
                            Number(item.id) ===
                            Number(selectedId)
                    ) || null;

                selectItem(
                    selectedItem,
                    false
                );

                renderOptions();

            }


            function setDisabled(
                disabled,
                placeholder = ""
            ) {

                state.disabled =
                    Boolean(disabled);

                input.disabled =
                    state.disabled;

                toggleButton.disabled =
                    state.disabled;

                container.classList.toggle(
                    "is-disabled",
                    state.disabled
                );

                if (
                    placeholder
                ) {

                    input.placeholder =
                        placeholder;

                }

                if (
                    state.disabled
                ) {

                    close();

                }

            }


            function clear(
                placeholder = ""
            ) {

                selectItem(
                    null,
                    false
                );

                if (
                    placeholder
                ) {

                    input.placeholder =
                        placeholder;

                }

                renderOptions();

            }


            input.addEventListener(
                "focus",
                open
            );


            input.addEventListener(
                "input",
                () => {

                    state.selectedId =
                        null;

                    state.selectedItem =
                        null;

                    hiddenInput.value =
                        "";

                    open();

                    renderOptions(
                        input.value
                    );

                }
            );


            toggleButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    toggle();

                }
            );


            container.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                }
            );


            return {

                setItems,

                setDisabled,

                clear,

                close,

                getValue() {

                    return hiddenInput.value;

                }

            };

        }

        function bindSelectSearch(
            searchInput,
            select
        ) {

            if (
                !searchInput ||
                !select
            ) {
                return;
            }

            searchInput.addEventListener(
                "input",
                () => {

                    const keyword =
                        normalizeSearchText(
                            searchInput.value
                        );

                    Array.from(
                        select.options
                    )
                        .forEach(
                            (
                                option,
                                index
                            ) => {

                                if (
                                    index === 0
                                ) {

                                    option.hidden =
                                        false;

                                    return;

                                }

                                const text =
                                    normalizeSearchText(
                                        option.textContent
                                    );

                                option.hidden =
                                    Boolean(keyword) &&
                                    !text.includes(
                                        keyword
                                    );

                            }
                        );

                }
            );

        }

        function clearAddressSearchFields() {

            [
                elements.countrySearch,
                elements.provinceSearch,
                elements.wardSearch
            ].forEach(
                input => {

                    if (input) {

                        input.value =
                            "";

                    }

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

        function bindSelectSearch(
            searchInput,
            select
        ) {

            if (
                !searchInput ||
                !select
            ) {
                return;
            }

            searchInput.addEventListener(
                "input",
                () => {

                    const keyword =
                        normalizeSearchText(
                            searchInput.value
                        );

                    Array.from(
                        select.options
                    ).forEach(
                        (
                            option,
                            index
                        ) => {

                            if (
                                index === 0
                            ) {

                                option.hidden =
                                    false;

                                return;

                            }

                            const text =
                                normalizeSearchText(
                                    option.textContent
                                );

                            option.hidden =
                                Boolean(keyword) &&
                                !text.includes(
                                    keyword
                                );

                        }
                    );

                }
            );

        }

        function clearAddressSearchFields() {

            [
                elements.countrySearch,
                elements.provinceSearch,
                elements.wardSearch
            ].forEach(
                input => {

                    if (input) {

                        input.value =
                            "";

                    }

                }
            );

        }

        function fillEmployeeProfile(
            employee
        ) {

            const form =
                elements.profileForm;

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
                employee.coSo?.tenCoSo
            );

            setFormValue(
                form,
                "phongBan",
                employee.phongBan?.tenPhongBan
            );

            setFormValue(
                form,
                "chucVu",
                employee.chucVu?.tenChucVu
            );

            setFormValue(
                form,
                "ngaySinh",
                formatDateInput(
                    employee.ngaySinh
                )
            );

            setFormValue(
                form,
                "gioiTinh",
                employee.gioiTinh
            );

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

        function formatDateInput(
            value
        ) {

            if (!value) {
                return "";
            }

            const date =
                new Date(value);

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return "";
            }

            return date
                .toISOString()
                .slice(0, 10);

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