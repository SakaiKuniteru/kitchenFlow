"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const CONFIG = {

            loginEndpoint:
                "/api/mcs/v1/auth/login",

            changePasswordEndpoint:
                "/api/mcs/v1/auth/doi-mat-khau",

            systemNameEndpoint:
                "/api/mcs/v1/thiet-lap/gia-tri-public?ma=TEN_HE_THONG",

            systemLogoEndpoint:
                "/api/mcs/v1/thiet-lap/gia-tri-public?ma=LOGO_CO_SO_MAC_DINH",

            defaultSystemName:
                "MCS KITCHENFLOW",

            defaultSystemLogo:
                "/assets/images/logo/logo.png",

            homePath:
                "/",

            rememberedAccountKey:
                "mcsKitchenFlowRememberedAccount",

            accessTokenKey:
                "accessToken",

            refreshTokenKey:
                "refreshToken",

            userKey:
                "currentUser"

        };


        const elements = {

            systemNames:
                document.querySelectorAll(
                    "[data-system-name]"
                ),

            systemLogos:
                document.querySelectorAll(
                    "[data-system-logo]"
                ),

            loginForm:
                document.getElementById(
                    "loginForm"
                ),

            taiKhoan:
                document.getElementById(
                    "taiKhoan"
                ),

            matKhau:
                document.getElementById(
                    "matKhau"
                ),

            rememberAccount:
                document.getElementById(
                    "rememberAccount"
                ),

            loginSubmitButton:
                document.getElementById(
                    "loginSubmitButton"
                ),

            loginSubmitLabel:
                document.querySelector(
                    "[data-login-submit-label]"
                ),

            loginSpinner:
                document.querySelector(
                    "[data-login-spinner]"
                ),

            loginMessage:
                document.getElementById(
                    "loginMessage"
                ),

            loginMessageText:
                document.querySelector(
                    "[data-login-message]"
                ),

            togglePasswordButton:
                document.getElementById(
                    "togglePasswordButton"
                ),

            passwordShowIcon:
                document.querySelector(
                    "[data-password-show-icon]"
                ),

            passwordHideIcon:
                document.querySelector(
                    "[data-password-hide-icon]"
                ),

            changePasswordModal:
                document.getElementById(
                    "changePasswordModal"
                ),

            changePasswordForm:
                document.getElementById(
                    "changePasswordForm"
                ),

            changePasswordMessage:
                document.querySelector(
                    "[data-change-password-message]"
                )

        };


        let isSubmittingLogin =
            false;

        let isChangingPassword =
            false;

        let mustChangePassword =
            false;

        function initialize() {

            loadSystemBranding();

            restoreRememberedAccount();

            bindLoginEvents();

            bindChangePasswordEvents();

        }
        
        async function loadSystemBranding() {

            setSystemName(
                CONFIG.defaultSystemName
            );

            setSystemLogo(
                CONFIG.defaultSystemLogo
            );


            await Promise.allSettled([

                loadSystemName(),

                loadSystemLogo()

            ]);

        }

        async function loadSystemName() {

            try {

                const response =
                    await fetch(
                        CONFIG.systemNameEndpoint,
                        {
                            method:
                                "GET",

                            headers: {

                                Accept:
                                    "application/json"

                            },

                            credentials:
                                "include"

                        }
                    );


                if (
                    !response.ok
                ) {

                    return;

                }


                const result =
                    await parseJsonResponse(
                        response
                    );


                const data =
                    result?.data ??
                    result;


                const systemName =
                    String(
                        data?.giaTri ??
                        ""
                    ).trim();


                if (
                    !systemName
                ) {

                    return;

                }


                setSystemName(
                    systemName
                );

            }
            catch (error) {

                console.warn(
                    "[Login] Không thể tải tên hệ thống:",
                    error
                );

            }

        }

        async function loadSystemLogo() {

            try {

                const response =
                    await fetch(
                        CONFIG.systemLogoEndpoint,
                        {
                            method:
                                "GET",

                            headers: {

                                Accept:
                                    "application/json"

                            },

                            credentials:
                                "include"

                        }
                    );


                if (
                    !response.ok
                ) {

                    return;

                }


                const result =
                    await parseJsonResponse(
                        response
                    );


                const data =
                    result?.data ??
                    result;


                const logo =
                    String(
                        data?.giaTri ??
                        ""
                    ).trim();


                if (
                    !logo
                ) {

                    return;

                }


                setSystemLogo(
                    normalizeLogoUrl(
                        logo
                    )
                );

            }
            catch (error) {

                console.warn(
                    "[Login] Không thể tải logo hệ thống:",
                    error
                );

            }

        }

        function setSystemName(
            name
        ) {

            const value =
                String(
                    name ??
                    ""
                ).trim() ||
                CONFIG.defaultSystemName;


            elements.systemNames
                ?.forEach(
                    element => {

                        element.textContent =
                            value;

                    }
                );

        }

        function setSystemLogo(
            src
        ) {

            const value =
                String(
                    src ??
                    ""
                ).trim() ||
                CONFIG.defaultSystemLogo;


            elements.systemLogos
                ?.forEach(
                    image => {

                        image.onerror =
                            () => {

                                image.onerror =
                                    null;


                                image.src =
                                    CONFIG.defaultSystemLogo;

                            };


                        image.src =
                            value;

                    }
                );

        }

        function normalizeLogoUrl(
            value
        ) {

            const logo =
                String(
                    value ??
                    ""
                ).trim();


            if (
                !logo
            ) {

                return CONFIG
                    .defaultSystemLogo;

            }


            if (
                /^https?:\/\//i.test(
                    logo
                ) ||
                logo.startsWith(
                    "/"
                )
            ) {

                return logo;

            }


            return `/${logo}`;

        }

        function bindLoginEvents() {

            if (
                elements.loginForm
            ) {

                elements.loginForm
                    .addEventListener(
                        "submit",
                        handleLoginSubmit
                    );

            }

            if (
                elements.togglePasswordButton
            ) {

                elements.togglePasswordButton
                    .addEventListener(
                        "click",
                        togglePasswordVisibility
                    );

            }

            [
                elements.taiKhoan,
                elements.matKhau
            ]
                .filter(Boolean)
                .forEach(
                    input => {

                        input.addEventListener(
                            "input",
                            () => {

                                clearFieldError(
                                    input.name
                                );

                                hideLoginMessage();

                            }
                        );

                    }
                );

        }

        function bindChangePasswordEvents() {

            if (
                elements.changePasswordForm
            ) {

                elements.changePasswordForm
                    .addEventListener(
                        "submit",
                        handleChangePasswordSubmit
                    );

            }

            document.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Escape" &&
                        mustChangePassword
                    ) {

                        event.preventDefault();

                    }

                }
            );

        }

        function restoreRememberedAccount() {

            if (
                !elements.taiKhoan ||
                !elements.rememberAccount
            ) {
                return;
            }

            const rememberedAccount =
                localStorage.getItem(
                    CONFIG.rememberedAccountKey
                );

            if (!rememberedAccount) {
                return;
            }

            elements.taiKhoan.value =
                rememberedAccount;

            elements.rememberAccount.checked =
                true;

            elements.matKhau
                ?.focus();

        }

        function saveRememberedAccount(
            taiKhoan
        ) {

            if (
                elements.rememberAccount
                    ?.checked
            ) {

                localStorage.setItem(
                    CONFIG.rememberedAccountKey,
                    taiKhoan
                );

                return;

            }

            localStorage.removeItem(
                CONFIG.rememberedAccountKey
            );

        }

        function togglePasswordVisibility() {

            if (
                !elements.matKhau ||
                !elements.togglePasswordButton
            ) {
                return;
            }

            const isPasswordVisible =
                elements.matKhau.type ===
                "text";

            elements.matKhau.type =
                isPasswordVisible
                    ? "password"
                    : "text";

            elements.togglePasswordButton
                .setAttribute(
                    "aria-pressed",
                    String(
                        !isPasswordVisible
                    )
                );

            elements.togglePasswordButton
                .setAttribute(
                    "aria-label",
                    isPasswordVisible
                        ? "Hiện mật khẩu"
                        : "Ẩn mật khẩu"
                );

            if (
                elements.passwordShowIcon
            ) {

                elements.passwordShowIcon.hidden =
                    !isPasswordVisible;

            }

            if (
                elements.passwordHideIcon
            ) {

                elements.passwordHideIcon.hidden =
                    isPasswordVisible;

            }

            elements.matKhau.focus();

        }

        async function handleLoginSubmit(
            event
        ) {

            event.preventDefault();

            if (isSubmittingLogin) {
                return;
            }

            clearAllFieldErrors();

            hideLoginMessage();

            const taiKhoan =
                elements.taiKhoan
                    ?.value
                    .trim() || "";

            const matKhau =
                elements.matKhau
                    ?.value || "";

            if (
                !validateLoginForm(
                    taiKhoan,
                    matKhau
                )
            ) {
                return;
            }

            setLoginSubmitting(
                true
            );

            try {

                const response =
                    await fetch(
                        CONFIG.loginEndpoint,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Accept:
                                    "application/json"
                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({
                                    taiKhoan,
                                    matKhau
                                })
                        }
                    );

                const result =
                    await parseJsonResponse(
                        response
                    );

                if (
                    !response.ok ||
                    result.success === false
                ) {

                    throw createRequestError(
                        result,
                        response.status
                    );

                }

                const loginData =
                    result.data || {};

                saveRememberedAccount(
                    taiKhoan
                );

                saveAuthenticationData(
                    loginData
                );

                if (
                    loginData.firstLogin ===
                    true
                ) {

                    openRequiredChangePasswordModal();

                    return;

                }

                redirectToHome();

            } catch (error) {

                handleLoginError(
                    error
                );

            } finally {

                setLoginSubmitting(
                    false
                );

            }

        }

        function validateLoginForm(
            taiKhoan,
            matKhau
        ) {

            let valid =
                true;

            if (
                !taiKhoan &&
                !matKhau
            ) {

                showFieldError(
                    "taiKhoan",
                    "Tên đăng nhập không được để trống."
                );

                showFieldError(
                    "matKhau",
                    "Mật khẩu không được để trống."
                );

                showLoginMessage(
                    "Tên đăng nhập và mật khẩu không được để trống.",
                    "error"
                );

                elements.taiKhoan
                    ?.focus();

                return false;

            }

            if (!taiKhoan) {

                showFieldError(
                    "taiKhoan",
                    "Tên đăng nhập không được để trống."
                );

                elements.taiKhoan
                    ?.focus();

                valid =
                    false;

            }

            if (!matKhau) {

                showFieldError(
                    "matKhau",
                    "Mật khẩu không được để trống."
                );

                if (valid) {

                    elements.matKhau
                        ?.focus();

                }

                valid =
                    false;

            }

            return valid;

        }

        function saveAuthenticationData(
            loginData
        ) {

            if (
                loginData.accessToken
            ) {

                localStorage.setItem(
                    CONFIG.accessTokenKey,
                    loginData.accessToken
                );

            }

            if (
                loginData.refreshToken
            ) {

                localStorage.setItem(
                    CONFIG.refreshTokenKey,
                    loginData.refreshToken
                );

            }

            const userData = {

                id:
                    loginData.id,

                nhanVienId:
                    loginData.nhanVienId,

                maNhanVien:
                    loginData.maNhanVien,

                hoTen:
                    loginData.hoTen,

                taiKhoan:
                    loginData.taiKhoan,

                email:
                    loginData.email,

                anhDaiDien:
                    loginData.anhDaiDien,

                coSoId:
                    loginData.coSoId,

                coSo:
                    loginData.coSo,

                phongBanId:
                    loginData.phongBanId,

                phongBan:
                    loginData.phongBan,

                chucVuId:
                    loginData.chucVuId,

                chucVu:
                    loginData.chucVu,

                roles:
                    loginData.roles || [],

                dsVaiTroId:
                    loginData.dsVaiTroId || [],

                dsVaiTro:
                    loginData.dsVaiTro || [],

                dsQuyenId:
                    loginData.dsQuyenId || [],

                dsQuyen:
                    loginData.dsQuyen || []

            };

            localStorage.setItem(
                CONFIG.userKey,
                JSON.stringify(
                    userData
                )
            );

        }

        function openRequiredChangePasswordModal() {

            if (
                !elements.changePasswordModal
            ) {

                showLoginMessage(
                    "Không thể mở biểu mẫu đổi mật khẩu.",
                    "error"
                );

                return;

            }

            mustChangePassword =
                true;

            elements.changePasswordModal.hidden =
                false;

            elements.changePasswordModal
                .classList
                .add(
                    "is-open",
                    "is-required"
                );

            document.body
                .classList
                .add(
                    "modal-open"
                );

            resetChangePasswordForm();

            const firstInput =
                getChangePasswordInput(
                    [
                        "oldMatKhau",
                        "currentPassword"
                    ]
                );

            window.setTimeout(
                () => {

                    firstInput?.focus();

                },
                50
            );

        }


        function closeChangePasswordModal() {

            if (
                !elements.changePasswordModal
            ) {
                return;
            }

            elements.changePasswordModal.hidden =
                true;

            elements.changePasswordModal
                .classList
                .remove(
                    "is-open",
                    "is-required"
                );

            document.body
                .classList
                .remove(
                    "modal-open"
                );

            mustChangePassword =
                false;

        }


        async function handleChangePasswordSubmit(
            event
        ) {

            event.preventDefault();

            if (isChangingPassword) {
                return;
            }

            clearChangePasswordMessage();

            const oldMatKhauInput =
                getChangePasswordInput(
                    [
                        "oldMatKhau",
                        "currentPassword"
                    ]
                );

            const newMatKhauInput =
                getChangePasswordInput(
                    [
                        "newMatKhau",
                        "newPassword"
                    ]
                );

            const confirmMatKhauInput =
                getChangePasswordInput(
                    [
                        "confirmMatKhau",
                        "confirmPassword"
                    ]
                );

            const oldMatKhau =
                oldMatKhauInput
                    ?.value || "";

            const newMatKhau =
                newMatKhauInput
                    ?.value || "";

            const confirmMatKhau =
                confirmMatKhauInput
                    ?.value || "";

            const validationMessage =
                validateChangePassword(
                    oldMatKhau,
                    newMatKhau,
                    confirmMatKhau
                );

            if (validationMessage) {

                showChangePasswordMessage(
                    validationMessage
                );

                return;

            }

            setChangePasswordSubmitting(
                true
            );

            try {

                const accessToken =
                    localStorage.getItem(
                        CONFIG.accessTokenKey
                    );

                const response =
                    await fetch(
                        CONFIG.changePasswordEndpoint,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Accept:
                                    "application/json",

                                Authorization:
                                    `Bearer ${accessToken}`
                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({
                                    oldMatKhau,
                                    newMatKhau
                                })
                        }
                    );

                const result =
                    await parseJsonResponse(
                        response
                    );

                if (
                    !response.ok ||
                    result.success === false
                ) {

                    throw createRequestError(
                        result,
                        response.status
                    );

                }

                closeChangePasswordModal();

                showLoginMessage(
                    result.message ||
                    "Đổi mật khẩu thành công. Đang chuyển vào hệ thống...",
                    "success"
                );

                window.setTimeout(
                    redirectToHome,
                    700
                );

            } catch (error) {

                showChangePasswordMessage(
                    error.message ||
                    "Không thể đổi mật khẩu."
                );

            } finally {

                setChangePasswordSubmitting(
                    false
                );

            }

        }


        function validateChangePassword(
            oldMatKhau,
            newMatKhau,
            confirmMatKhau
        ) {

            if (
                !oldMatKhau ||
                !newMatKhau ||
                !confirmMatKhau
            ) {

                return "Vui lòng nhập đầy đủ thông tin đổi mật khẩu.";

            }

            if (
                oldMatKhau ===
                newMatKhau
            ) {

                return "Mật khẩu mới phải khác mật khẩu hiện tại.";

            }

            if (
                newMatKhau !==
                confirmMatKhau
            ) {

                return "Mật khẩu nhập lại không khớp.";

            }

            if (
                newMatKhau.length < 8
            ) {

                return "Mật khẩu mới phải có ít nhất 8 ký tự.";

            }

            return null;

        }


        function getChangePasswordInput(
            names
        ) {

            if (
                !elements.changePasswordForm
            ) {
                return null;
            }

            for (
                const name of names
            ) {

                const input =
                    elements.changePasswordForm
                        .querySelector(
                            `[name="${name}"]`
                        );

                if (input) {
                    return input;
                }

            }

            return null;

        }


        function resetChangePasswordForm() {

            elements.changePasswordForm
                ?.reset();

            clearChangePasswordMessage();

        }


        function showChangePasswordMessage(
            message
        ) {

            if (
                !elements.changePasswordMessage
            ) {
                return;
            }

            elements.changePasswordMessage
                .textContent =
                message;

            elements.changePasswordMessage.hidden =
                false;

        }


        function clearChangePasswordMessage() {

            if (
                !elements.changePasswordMessage
            ) {
                return;
            }

            elements.changePasswordMessage
                .textContent =
                "";

            elements.changePasswordMessage.hidden =
                true;

        }


        function setLoginSubmitting(
            submitting
        ) {

            isSubmittingLogin =
                submitting;

            if (
                elements.loginSubmitButton
            ) {

                elements.loginSubmitButton.disabled =
                    submitting;

                elements.loginSubmitButton
                    .setAttribute(
                        "aria-busy",
                        String(submitting)
                    );

            }

            if (
                elements.loginSpinner
            ) {

                elements.loginSpinner.hidden =
                    !submitting;

            }

            if (
                elements.loginSubmitLabel
            ) {

                elements.loginSubmitLabel
                    .textContent =
                    submitting
                        ? "Đang đăng nhập..."
                        : "Đăng nhập";

            }

            if (
                elements.taiKhoan
            ) {

                elements.taiKhoan.disabled =
                    submitting;

            }

            if (
                elements.matKhau
            ) {

                elements.matKhau.disabled =
                    submitting;

            }

        }


        function setChangePasswordSubmitting(
            submitting
        ) {

            isChangingPassword =
                submitting;

            const submitButton =
                elements.changePasswordForm
                    ?.querySelector(
                        '[type="submit"]'
                    );

            if (submitButton) {

                submitButton.disabled =
                    submitting;

                submitButton.textContent =
                    submitting
                        ? "Đang cập nhật..."
                        : "Đổi mật khẩu";

            }

            elements.changePasswordForm
                ?.querySelectorAll(
                    "input"
                )
                .forEach(
                    input => {

                        input.disabled =
                            submitting;

                    }
                );

        }


        function showFieldError(
            fieldName,
            message
        ) {

            const field =
                document.querySelector(
                    `[data-form-field="${fieldName}"]`
                );

            const input =
                field?.querySelector(
                    `[name="${fieldName}"]`
                );

            const errorElement =
                document.querySelector(
                    `[data-field-error="${fieldName}"]`
                );

            field?.classList.add(
                "is-invalid"
            );

            input?.setAttribute(
                "aria-invalid",
                "true"
            );

            if (
                errorElement
            ) {

                errorElement.textContent =
                    message;

                errorElement.hidden =
                    false;

            }

        }


        function clearFieldError(
            fieldName
        ) {

            const field =
                document.querySelector(
                    `[data-form-field="${fieldName}"]`
                );

            const input =
                field?.querySelector(
                    `[name="${fieldName}"]`
                );

            const errorElement =
                document.querySelector(
                    `[data-field-error="${fieldName}"]`
                );

            field?.classList.remove(
                "is-invalid"
            );

            input?.removeAttribute(
                "aria-invalid"
            );

            if (
                errorElement
            ) {

                errorElement.textContent =
                    "";

                errorElement.hidden =
                    true;

            }

        }


        function clearAllFieldErrors() {

            clearFieldError(
                "taiKhoan"
            );

            clearFieldError(
                "matKhau"
            );

        }


        function showLoginMessage(
            message,
            type = "error"
        ) {

            if (
                !elements.loginMessage ||
                !elements.loginMessageText
            ) {
                return;
            }

            elements.loginMessage
                .classList
                .remove(
                    "login-card__message--success",
                    "login-card__message--warning"
                );

            if (
                type === "success"
            ) {

                elements.loginMessage
                    .classList
                    .add(
                        "login-card__message--success"
                    );

            }

            if (
                type === "warning"
            ) {

                elements.loginMessage
                    .classList
                    .add(
                        "login-card__message--warning"
                    );

            }

            elements.loginMessageText
                .textContent =
                message;

            elements.loginMessage.hidden =
                false;

        }


        function hideLoginMessage() {

            if (
                !elements.loginMessage
            ) {
                return;
            }

            elements.loginMessage.hidden =
                true;

            elements.loginMessage
                .classList
                .remove(
                    "login-card__message--success",
                    "login-card__message--warning"
                );

            if (
                elements.loginMessageText
            ) {

                elements.loginMessageText
                    .textContent =
                    "";

            }

        }


        function handleLoginError(
            error
        ) {

            const message =
                error.message ||
                "Đăng nhập không thành công.";

            const type =
                error.statusCode === 423
                    ? "warning"
                    : "error";

            showLoginMessage(
                message,
                type
            );

            if (
                error.statusCode === 401
            ) {

                elements.matKhau
                    ?.focus();

                elements.matKhau
                    ?.select();

            }

        }


        async function parseJsonResponse(
            response
        ) {

            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";

            if (
                !contentType.includes(
                    "application/json"
                )
            ) {

                return {
                    success:
                        false,

                    message:
                        "Phản hồi từ máy chủ không hợp lệ."
                };

            }

            return await response.json();

        }


        function createRequestError(
            result,
            statusCode
        ) {

            const error =
                new Error(
                    result.message ||
                    "Yêu cầu không thành công."
                );

            error.statusCode =
                statusCode;

            error.data =
                result.data;

            return error;

        }


        function redirectToHome() {

            window.location.href =
                CONFIG.homePath;

        }


        initialize();

    }
);