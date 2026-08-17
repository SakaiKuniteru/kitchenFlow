"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const CONFIG = {

            enumsEndpoint:
                "/api/mcs/v1/enums",

            employeeDetailEndpoint:
                "/api/mcs/v1/dm-nhan-vien",

            employeeUpdateEndpoint:
                "/api/mcs/v1/dm-nhan-vien/cap-nhat",

            countryEndpoint:
                "/api/mcs/v1/dm-quoc-gia/tong-hop?active=true",

            provinceEndpoint:
                "/api/mcs/v1/dm-tinh-thanh/tong-hop?active=true",

            wardEndpoint:
                "/api/mcs/v1/dm-xa-phuong/tong-hop?active=true",

            currentUserEndpoint:
                "/api/mcs/v1/auth/nhan-vien-hien-tai",

            systemNameEndpoint:
                "/api/mcs/v1/thiet-lap/gia-tri?ma=TEN_HE_THONG",

            systemLogoEndpoint:
                "/api/mcs/v1/thiet-lap/gia-tri?ma=LOGO_CO_SO_MAC_DINH",

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

            genderSelect:
                document.getElementById(
                    "gioiTinh"
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

        const enumState = {
            gioiTinh:
                []
        };

        const addressState = {

            countries:
                [],

            provinces:
                [],

            wards:
                []

        };

        const PROFILE_FIELD_LABELS = {

            hoTen:
                "Họ tên",

            email:
                "Email",

            soDienThoai:
                "Số điện thoại",

            ngaySinh:
                "Ngày sinh",

            gioiTinh:
                "Giới tính",

            quocGiaId:
                "Quốc gia",

            tinhThanhId:
                "Tỉnh thành",

            xaPhuongId:
                "Xã/phường",

            diaChi:
                "Địa chỉ",

            anhDaiDien:
                "Ảnh đại diện"

        };

        let avatarPreviewUrl = null;

        function initialize() {

            initializeAddressSmartSelects();

            initializeProfileFieldValidation();

            bindEvents();

            renderStoredCurrentUser();

            Promise.allSettled([
                loadCurrentUser(),
                loadSystemInformation()
            ]);

        }

        async function loadProfileEnums() {

            try {

                const result =
                    await authenticatedRequest(
                        CONFIG.enumsEndpoint,
                        {
                            method:
                                "GET"
                        }
                    );


                const enums =
                    result?.data ||
                    result ||
                    {};


                enumState.gioiTinh =
                    Array.isArray(
                        enums.gioiTinh
                    )
                        ? enums.gioiTinh
                        : [];


                setSmartSelectOptions(
                    elements.genderSelect,

                    enumState.gioiTinh.map(
                        item => ({

                            value:
                                String(
                                    item.value
                                ),

                            label:
                                item.label ||
                                item.name ||
                                ""

                        })
                    ),

                    null
                );

            } catch (
                error
            ) {

                console.error(
                    "Không thể tải enum cho thông tin nhân viên:",
                    error
                );

                enumState.gioiTinh =
                    [];

                setSmartSelectOptions(
                    elements.genderSelect,
                    [],
                    null
                );

            }

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

                console.log(
                    "Current user API:",
                    currentUser
                );

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

            let systemName =
                CONFIG.fallbackSystemName;


            let systemLogo =
                CONFIG.fallbackSystemLogo;


            try {

                const [
                    nameResult,
                    logoResult
                ] =
                    await Promise.allSettled([

                        authenticatedRequest(
                            CONFIG.systemNameEndpoint,
                            {
                                method:
                                    "GET"
                            }
                        ),

                        authenticatedRequest(
                            CONFIG.systemLogoEndpoint,
                            {
                                method:
                                    "GET"
                            }
                        )

                    ]);


                /*
                * TÊN HỆ THỐNG
                */
                if (
                    nameResult.status ===
                    "fulfilled"
                ) {

                    const value =
                        String(
                            nameResult.value
                                ?.data
                                ?.giaTri ??
                            ""
                        ).trim();


                    if (
                        value
                    ) {

                        systemName =
                            value;

                    }

                }


                /*
                * LOGO HỆ THỐNG
                *
                * Backend đã xử lý:
                * LOGO_CO_SO_MAC_DINH
                * -> lấy mã cơ sở
                * -> tìm dm_co_so
                * -> trả về logo.
                */
                if (
                    logoResult.status ===
                    "fulfilled"
                ) {

                    const value =
                        String(
                            logoResult.value
                                ?.data
                                ?.giaTri ??
                            ""
                        ).trim();


                    if (
                        value
                    ) {

                        systemLogo =
                            value;

                    }

                }


            }
            catch (
                error
            ) {

                console.error(
                    "Không thể tải thông tin hệ thống:",
                    error
                );

            }


            /*
            * Luôn render.
            * API lỗi/rỗng => dùng fallback.
            */
            if (
                elements.systemName
            ) {

                elements.systemName.textContent =
                    systemName;

            }


            renderSystemLogo(
                systemLogo,
                systemName
            );

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

                await Promise.all([
                    loadProfileEnums(),
                    loadAddressOptions(
                        employee
                    )
                ]);

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
            
            const formValid =
                validateEmployeeProfileForm();

            if (!formValid) {
                return;
            }

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

                const handled =
                    applyProfileApiErrors(
                        error
                    );

                if (!handled) {

                    setProfileMessage(
                        error.message ||
                        "Không thể cập nhật thông tin nhân viên."
                    );

                }

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

                error.data =
                    result?.data;

                error.errors =
                    result?.errors ||
                    result?.data?.errors ||
                    null;

                error.responseData =
                    result;

                throw error;

            }

            return result;

        }

        function applyProfileApiErrors(
            error
        ) {

            clearAllProfileErrors();

            const fieldErrors =
                extractProfileApiFieldErrors(
                    error
                );

            const entries =
                Object.entries(
                    fieldErrors
                );

            if (!entries.length) {
                return false;
            }

            entries.forEach(
                ([
                    fieldName,
                    message
                ]) => {

                    setProfileFieldError(
                        fieldName,
                        message
                    );

                }
            );

            focusFirstProfileError();

            return true;

        }

        function extractProfileApiFieldErrors(
            error
        ) {

            const errors = {};

            const responseErrors =
                error?.data?.errors ||
                error?.errors ||
                error?.response?.data?.errors;

            if (
                responseErrors &&
                typeof responseErrors ===
                    "object" &&
                !Array.isArray(
                    responseErrors
                )
            ) {

                Object.entries(
                    responseErrors
                ).forEach(
                    ([
                        fieldName,
                        message
                    ]) => {

                        const normalizedField =
                            normalizeProfileFieldName(
                                fieldName
                            );

                        if (
                            normalizedField &&
                            message
                        ) {

                            errors[normalizedField] =
                                Array.isArray(message)
                                    ? message.join(" ")
                                    : String(message);

                        }

                    }
                );

            }

            const message =
                String(
                    error?.message || ""
                ).trim();

            if (!message) {
                return errors;
            }

            const messageParts =
                message
                    .split(
                        /,|\n|;/
                    )
                    .map(
                        item =>
                            item.trim()
                    )
                    .filter(Boolean);

            messageParts.forEach(
                part => {

                    const fieldName =
                        detectProfileFieldFromMessage(
                            part
                        );

                    if (
                        fieldName &&
                        !errors[fieldName]
                    ) {

                        errors[fieldName] =
                            normalizeProfileErrorMessage(
                                fieldName,
                                part
                            );

                    }

                }
            );

            return errors;

        }

        function normalizeProfileFieldName(
            fieldName
        ) {

            const normalized =
                String(fieldName || "")
                    .trim()
                    .toLowerCase()
                    .replace(
                        /[_\-\s]/g,
                        ""
                    );

            const fieldMap = {

                hoten:
                    "hoTen",

                email:
                    "email",

                sodienthoai:
                    "soDienThoai",

                ngaysinh:
                    "ngaySinh",

                gioitinh:
                    "gioiTinh",

                quocgiaid:
                    "quocGiaId",

                tinhthanhid:
                    "tinhThanhId",

                xaphuongid:
                    "xaPhuongId",

                diachi:
                    "diaChi",

                anhdaidien:
                    "anhDaiDien"

            };

            return fieldMap[normalized] || null;

        }

        function detectProfileFieldFromMessage(
            message
        ) {

            const normalized =
                normalizeSearchText(
                    message
                );

            if (
                normalized.includes(
                    "ho ten"
                )
            ) {
                return "hoTen";
            }

            if (
                normalized.includes(
                    "email"
                )
            ) {
                return "email";
            }

            if (
                normalized.includes(
                    "so dien thoai"
                ) ||
                normalized.includes(
                    "dien thoai"
                )
            ) {
                return "soDienThoai";
            }

            if (
                normalized.includes(
                    "ngay sinh"
                )
            ) {
                return "ngaySinh";
            }

            if (
                normalized.includes(
                    "gioi tinh"
                )
            ) {
                return "gioiTinh";
            }

            if (
                normalized.includes(
                    "quoc gia"
                )
            ) {
                return "quocGiaId";
            }

            if (
                normalized.includes(
                    "tinh/thanh"
                ) ||
                normalized.includes(
                    "tinh thanh"
                ) ||
                normalized.includes(
                    "tinh/thanh pho"
                )
            ) {
                return "tinhThanhId";
            }

            if (
                normalized.includes(
                    "xa/phuong"
                ) ||
                normalized.includes(
                    "xa phuong"
                )
            ) {
                return "xaPhuongId";
            }

            if (
                normalized.includes(
                    "dia chi"
                )
            ) {
                return "diaChi";
            }

            if (
                normalized.includes(
                    "anh dai dien"
                ) ||
                normalized.includes(
                    "jpg"
                ) ||
                normalized.includes(
                    "png"
                ) ||
                normalized.includes(
                    "webp"
                )
            ) {
                return "anhDaiDien";
            }

            return null;

        }

        function normalizeProfileErrorMessage(
            fieldName,
            message
        ) {

            const normalized =
                normalizeSearchText(
                    message
                );

            if (
                fieldName === "quocGiaId" &&
                normalized.includes(
                    "phai la so"
                )
            ) {

                return "Vui lòng chọn quốc gia hợp lệ.";

            }

            if (
                fieldName === "tinhThanhId" &&
                normalized.includes(
                    "phai la so"
                )
            ) {

                return "Vui lòng chọn tỉnh thành hợp lệ.";

            }

            if (
                fieldName === "xaPhuongId" &&
                normalized.includes(
                    "phai la so"
                )
            ) {

                return "Vui lòng chọn xã/phường hợp lệ.";

            }

            return message;

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
                ).filter(
                    item =>
                        item.active === true
                );

            addressState.provinces =
                extractArrayData(
                    provinceResult
                ).filter(
                    item =>
                        item.active === true
                );

            addressState.wards =
                extractArrayData(
                    wardResult
                ).filter(
                    item =>
                        item.active === true
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
                            )

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

        function initializeProfileFieldValidation() {

            const form =
                elements.profileForm;

            if (!form) {
                return;
            }

            form.addEventListener(
                "input",
                event => {

                    const fieldName =
                        getProfileFieldNameFromTarget(
                            event.target
                        );

                    if (fieldName) {

                        clearProfileFieldError(
                            fieldName
                        );

                    }

                }
            );

            form.addEventListener(
                "change",
                event => {

                    const fieldName =
                        getProfileFieldNameFromTarget(
                            event.target
                        );

                    if (fieldName) {

                        clearProfileFieldError(
                            fieldName
                        );

                    }

                }
            );

        }

        function getProfileFieldNameFromTarget(
            target
        ) {

            if (
                !(target instanceof Element)
            ) {
                return null;
            }

            if (
                target.matches(
                    "[data-date-input]"
                )
            ) {

                return target.closest(
                    "[data-form-field]"
                )?.dataset.formField || null;

            }

            const namedField =
                target.closest(
                    "[name]"
                );

            if (
                namedField?.name
            ) {

                return namedField.name;

            }

            return target.closest(
                "[data-form-field]"
            )?.dataset.formField || null;

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

        function normalizeAssetUrl(
            url,
            fallback = ""
        ) {

            const value =
                url ||
                fallback;

            if (!value) {
                return "";
            }

            if (
                value.startsWith("blob:")
                ||
                value.startsWith("data:")
                ||
                value.startsWith("http://")
                ||
                value.startsWith("https://")
                ||
                value.startsWith("/")
            ) {
                return value;
            }

            return `/${value}`;

        }

        function renderSystemLogo(
            logo,
            systemName
        ) {

            if (!elements.systemLogo) {
                return;
            }

            elements.systemLogo.src =
                normalizeAssetUrl(
                    logo,
                    CONFIG.fallbackSystemLogo
                );

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

            elements.userAvatars.forEach(
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

                    container.innerHTML = "";

                    const image =
                        document.createElement(
                            "img"
                        );

                    image.src =
                        normalizeAssetUrl(
                            imageUrl
                        );

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
                            )

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
                            )

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

                setProfileFieldError(
                    "anhDaiDien",
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

                setProfileFieldError(
                    "anhDaiDien",
                    "Ảnh đại diện không được vượt quá 5 MB."
                );

                return;

            }

            clearProfileFieldError(
                "anhDaiDien"
            );

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
                employee.coSo?.ten ||
                ""
            );

            setFormValue(
                form,
                "phongBan",
                employee.phongBan?.ten ||
                ""
            );

            setFormValue(
                form,
                "chucVu",
                employee.chucVu?.ten ||
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
                normalizeAssetUrl(
                    imageUrl
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

        function setProfileFieldError(
            fieldName,
            message
        ) {

            const form =
                elements.profileForm;

            if (!form) {
                return;
            }

            const fieldContainer =
                form.querySelector(
                    `[data-form-field="${fieldName}"]`
                );

            const errorElement =
                form.querySelector(
                    `[data-field-error="${fieldName}"]`
                );

            const field =
                form.elements.namedItem(
                    fieldName
                );

            fieldContainer?.classList.add(
                "is-invalid"
            );

            if (field) {

                field.setAttribute(
                    "aria-invalid",
                    "true"
                );

                field.setAttribute(
                    "aria-describedby",
                    `${fieldName}Error`
                );

            }

            /*
            * Date picker dùng input hiển thị riêng.
            */
            const dateInput =
                fieldContainer?.querySelector(
                    "[data-date-input]"
                );

            if (dateInput) {

                dateInput.setAttribute(
                    "aria-invalid",
                    "true"
                );

                dateInput.setAttribute(
                    "aria-describedby",
                    `${fieldName}Error`
                );

            }

            /*
            * Smart select dùng control riêng.
            */
            const smartSelect =
                fieldContainer?.querySelector(
                    "[data-smart-select]"
                );

            const smartSelectControl =
                smartSelect?.querySelector(
                    "[data-smart-select-control]"
                );

            if (smartSelect) {

                smartSelect.classList.add(
                    "is-invalid"
                );

            }

            if (smartSelectControl) {

                smartSelectControl.setAttribute(
                    "aria-invalid",
                    "true"
                );

                smartSelectControl.setAttribute(
                    "aria-describedby",
                    `${fieldName}Error`
                );

            }

            if (errorElement) {

                errorElement.id =
                    `${fieldName}Error`;

                errorElement.textContent =
                    message;

                errorElement.hidden =
                    false;

            }

        }

        function clearProfileFieldError(
            fieldName
        ) {

            const form =
                elements.profileForm;

            if (!form) {
                return;
            }

            const fieldContainer =
                form.querySelector(
                    `[data-form-field="${fieldName}"]`
                );

            const errorElement =
                form.querySelector(
                    `[data-field-error="${fieldName}"]`
                );

            const field =
                form.elements.namedItem(
                    fieldName
                );

            fieldContainer?.classList.remove(
                "is-invalid"
            );

            field?.removeAttribute(
                "aria-invalid"
            );

            field?.removeAttribute(
                "aria-describedby"
            );

            const dateInput =
                fieldContainer?.querySelector(
                    "[data-date-input]"
                );

            dateInput?.removeAttribute(
                "aria-invalid"
            );

            dateInput?.removeAttribute(
                "aria-describedby"
            );

            const smartSelect =
                fieldContainer?.querySelector(
                    "[data-smart-select]"
                );

            const smartSelectControl =
                smartSelect?.querySelector(
                    "[data-smart-select-control]"
                );

            smartSelect?.classList.remove(
                "is-invalid"
            );

            smartSelectControl?.removeAttribute(
                "aria-invalid"
            );

            smartSelectControl?.removeAttribute(
                "aria-describedby"
            );

            if (errorElement) {

                errorElement.textContent =
                    "";

                errorElement.hidden =
                    true;

            }

        }

        function clearAllProfileErrors() {

            Object.keys(
                PROFILE_FIELD_LABELS
            ).forEach(
                fieldName => {

                    clearProfileFieldError(
                        fieldName
                    );

                }
            );

            setProfileMessage("");

        }

        function validateEmployeeProfileForm() {

            const form =
                elements.profileForm;

            if (!form) {
                return false;
            }

            clearAllProfileErrors();

            let valid =
                true;

            const hoTen =
                String(
                    form.elements.namedItem(
                        "hoTen"
                    )?.value || ""
                ).trim();

            const email =
                String(
                    form.elements.namedItem(
                        "email"
                    )?.value || ""
                ).trim();

            const soDienThoai =
                String(
                    form.elements.namedItem(
                        "soDienThoai"
                    )?.value || ""
                ).trim();

            const ngaySinhField =
                form.querySelector(
                    '[data-form-field="ngaySinh"]'
                );


            const ngaySinh =
                String(
                    form.elements.namedItem(
                        "ngaySinh"
                    )?.value || ""
                ).trim();


            const ngaySinhDisplay =
                String(
                    ngaySinhField
                        ?.querySelector(
                            "[data-date-input]"
                        )
                        ?.value || ""
                ).trim();

            const gioiTinh =
                String(
                    form.elements.namedItem(
                        "gioiTinh"
                    )?.value || ""
                ).trim();

            const quocGiaId =
                String(
                    form.elements.namedItem(
                        "quocGiaId"
                    )?.value || ""
                ).trim();

            const tinhThanhId =
                String(
                    form.elements.namedItem(
                        "tinhThanhId"
                    )?.value || ""
                ).trim();

            const xaPhuongId =
                String(
                    form.elements.namedItem(
                        "xaPhuongId"
                    )?.value || ""
                ).trim();


            if (!hoTen) {

                setProfileFieldError(
                    "hoTen",
                    "Vui lòng nhập họ tên."
                );

                valid =
                    false;

            } else if (
                hoTen.length < 2
            ) {

                setProfileFieldError(
                    "hoTen",
                    "Họ tên phải có ít nhất 2 ký tự."
                );

                valid =
                    false;

            } else if (
                hoTen.length > 255
            ) {

                setProfileFieldError(
                    "hoTen",
                    "Họ tên không được vượt quá 255 ký tự."
                );

                valid =
                    false;

            }


            if (!email) {

                setProfileFieldError(
                    "email",
                    "Vui lòng nhập email."
                );

                valid =
                    false;

            } else if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    email
                )
            ) {

                setProfileFieldError(
                    "email",
                    "Email không đúng định dạng."
                );

                valid =
                    false;

            }


            if (!soDienThoai) {

                setProfileFieldError(
                    "soDienThoai",
                    "Vui lòng nhập số điện thoại."
                );

                valid =
                    false;

            } else if (
                !/^(0|\+84)[0-9]{8,10}$/.test(
                    soDienThoai.replace(
                        /[\s.-]/g,
                        ""
                    )
                )
            ) {

                setProfileFieldError(
                    "soDienThoai",
                    "Số điện thoại không đúng định dạng."
                );

                valid =
                    false;

            }

            if (
                !ngaySinh &&
                !ngaySinhDisplay
            ) {

                setProfileFieldError(
                    "ngaySinh",
                    "Vui lòng chọn ngày sinh."
                );

                valid =
                    false;

            } else if (
                !ngaySinh ||
                !isValidDatabaseDate(
                    ngaySinh
                )
            ) {

                setProfileFieldError(
                    "ngaySinh",
                    "Ngày sinh không hợp lệ."
                );

                valid =
                    false;

            }
            
            if (!gioiTinh) {

                setProfileFieldError(
                    "gioiTinh",
                    "Vui lòng chọn giới tính."
                );

                valid =
                    false;

            } else if (
                !enumState.gioiTinh.some(
                    item =>
                        String(
                            item.value
                        ) ===
                        gioiTinh
                )
            ) {

                setProfileFieldError(
                    "gioiTinh",
                    "Giới tính không hợp lệ."
                );

                valid =
                    false;

            }

            if (!quocGiaId) {

                setProfileFieldError(
                    "quocGiaId",
                    "Vui lòng chọn quốc gia."
                );

                valid =
                    false;

            } else if (
                !toPositiveInteger(
                    quocGiaId
                )
            ) {

                setProfileFieldError(
                    "quocGiaId",
                    "Quốc gia không hợp lệ."
                );

                valid =
                    false;

            }


            if (!tinhThanhId) {

                setProfileFieldError(
                    "tinhThanhId",
                    "Vui lòng chọn tỉnh thành."
                );

                valid =
                    false;

            } else if (
                !toPositiveInteger(
                    tinhThanhId
                )
            ) {

                setProfileFieldError(
                    "tinhThanhId",
                    "Tỉnh thành không hợp lệ."
                );

                valid =
                    false;

            }


            if (!xaPhuongId) {

                setProfileFieldError(
                    "xaPhuongId",
                    "Vui lòng chọn xã/phường."
                );

                valid =
                    false;

            } else if (
                !toPositiveInteger(
                    xaPhuongId
                )
            ) {

                setProfileFieldError(
                    "xaPhuongId",
                    "Xã/phường không hợp lệ."
                );

                valid =
                    false;

            }


            if (!valid) {

                focusFirstProfileError();

            }

            return valid;

        }

        function isValidDatabaseDate(
            value
        ) {

            const match =
                String(value).match(
                    /^(\d{4})-(\d{2})-(\d{2})$/
                );

            if (!match) {
                return false;
            }

            const year =
                Number(match[1]);

            const month =
                Number(match[2]);

            const day =
                Number(match[3]);

            const date =
                new Date(
                    year,
                    month - 1,
                    day
                );

            return (
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day
            );

        }

        function focusFirstProfileError() {

            const form =
                elements.profileForm;

            const invalidContainer =
                form?.querySelector(
                    ".form-field.is-invalid"
                );

            if (!invalidContainer) {
                return;
            }

            const focusable =
                invalidContainer.querySelector(
                    [
                        "[data-date-input]",
                        "[data-smart-select-search]",
                        "input:not([type='hidden']):not([disabled])",
                        "select:not([disabled])",
                        "textarea:not([disabled])",
                        "button:not([disabled])"
                    ].join(",")
                );

            focusable?.focus({
                preventScroll:
                    false
            });

            invalidContainer.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "center"
            });

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