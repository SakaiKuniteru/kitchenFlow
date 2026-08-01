"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "changePasswordForm"
            );

        if (!form) {
            return;
        }


        const fields = {

            matKhauHienTai:
                form.querySelector(
                    '[name="matKhauHienTai"]'
                ),

            matKhauMoi:
                form.querySelector(
                    '[name="matKhauMoi"]'
                ),

            xacNhanMatKhauMoi:
                form.querySelector(
                    '[name="xacNhanMatKhauMoi"]'
                )

        };

        const passwordRules = {

            length:
                form.querySelector(
                    '[data-password-rule="length"]'
                ),

            lowercase:
                form.querySelector(
                    '[data-password-rule="lowercase"]'
                ),

            uppercase:
                form.querySelector(
                    '[data-password-rule="uppercase"]'
                ),

            number:
                form.querySelector(
                    '[data-password-rule="number"]'
                ),

            special:
                form.querySelector(
                    '[data-password-rule="special"]'
                ),

            noSpace:
                form.querySelector(
                    '[data-password-rule="no-space"]'
                )

        };

        const submitButton =
            form.querySelector(
                '[type="submit"]'
            );


        /*
         * Mật khẩu tối thiểu 8 ký tự và bắt buộc có:
         * - ít nhất 1 chữ thường
         * - ít nhất 1 chữ hoa
         * - ít nhất 1 chữ số
         * - ít nhất 1 ký tự đặc biệt
         * - không chứa khoảng trắng
         */
        const PASSWORD_PATTERN =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;


        initializePasswordToggles();

        initializeValidation();


        function initializePasswordToggles() {

            form
                .querySelectorAll(
                    "[data-password-toggle]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            event => {

                                event.preventDefault();

                                event.stopPropagation();

                                const passwordField =
                                    button.closest(
                                        ".password-field"
                                    );

                                const input =
                                    passwordField
                                        ?.querySelector(
                                            "input"
                                        );

                                if (!input) {
                                    return;
                                }

                                const willShow =
                                    input.type ===
                                    "password";

                                input.type =
                                    willShow
                                        ? "text"
                                        : "password";

                                button.classList.toggle(
                                    "is-visible",
                                    willShow
                                );

                                button.setAttribute(
                                    "aria-pressed",
                                    String(willShow)
                                );

                                button.setAttribute(
                                    "aria-label",
                                    willShow
                                        ? "Ẩn mật khẩu"
                                        : "Hiện mật khẩu"
                                );

                                /*
                                 * Giữ con trỏ ở cuối input
                                 * nhưng không kích hoạt validation.
                                 */
                                const length =
                                    input.value.length;

                                input.focus({
                                    preventScroll:
                                        true
                                });

                                try {

                                    input.setSelectionRange(
                                        length,
                                        length
                                    );

                                } catch (error) {

                                    /*
                                     * Một số trình duyệt không hỗ trợ
                                     * setSelectionRange cho loại input.
                                     */

                                }

                            }
                        );

                    }
                );

        }


        function initializeValidation() {

            form.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    clearAllErrors();

                    const valid =
                        validateForm();

                    if (!valid) {
                        return;
                    }

                    const payload = {

                        matKhauHienTai:
                            fields
                                .matKhauHienTai
                                .value,

                        matKhauMoi:
                            fields
                                .matKhauMoi
                                .value,

                        xacNhanMatKhauMoi:
                            fields
                                .xacNhanMatKhauMoi
                                .value

                    };

                    setSubmitting(
                        true
                    );

                    try {

                        console.log(
                            "Dữ liệu đổi mật khẩu hợp lệ:",
                            payload
                        );

                        window.MCS?.toast
                            ?.success(
                                "Đổi mật khẩu thành công."
                            );

                        form.reset();

                        clearAllErrors();

                        updatePasswordRules(
                            ""
                        );

                        form
                            .querySelectorAll(
                                "[data-password-toggle]"
                            )
                            .forEach(
                                button => {

                                    button.classList.remove(
                                        "is-visible"
                                    );

                                    button.setAttribute(
                                        "aria-pressed",
                                        "false"
                                    );

                                    button.setAttribute(
                                        "aria-label",
                                        "Hiện mật khẩu"
                                    );

                                    const passwordField =
                                        button.closest(
                                            ".password-field"
                                        );

                                    const input =
                                        passwordField
                                            ?.querySelector(
                                                "input"
                                            );

                                    if (input) {

                                        input.type =
                                            "password";

                                    }

                                }
                            );

                        window.MCS.modal.close(
                            "changePasswordModal",
                            {
                                force: true
                            }
                        );

                    } catch (error) {

                        window.MCS?.toast
                            ?.error(
                                error.message ||
                                "Không thể đổi mật khẩu."
                            );

                    } finally {

                        setSubmitting(
                            false
                        );

                    }

                }
            );


            Object.values(fields)
                .forEach(
                    field => {

                        field?.addEventListener(
                            "input",
                            () => {

                                clearFieldError(
                                    field.name
                                );


                                if (
                                    field.name ===
                                    "matKhauMoi"
                                ) {

                                    updatePasswordRules(
                                        field.value
                                    );

                                    /*
                                    * Khi mật khẩu mới thay đổi,
                                    * kiểm tra lại trường xác nhận
                                    * nếu người dùng đã nhập.
                                    */
                                    if (
                                        fields
                                            .xacNhanMatKhauMoi
                                            .value
                                    ) {

                                        validateSingleField(
                                            "xacNhanMatKhauMoi"
                                        );

                                    }

                                }

                            }
                        );


                        field?.addEventListener(
                            "blur",
                            () => {

                                validateSingleField(
                                    field.name
                                );

                            }
                        );

                    }
                );

        }

        function updatePasswordRules(
            value
        ) {

            const rules = {

                length:
                    value.length >= 8,

                lowercase:
                    /[a-z]/.test(value),

                uppercase:
                    /[A-Z]/.test(value),

                number:
                    /\d/.test(value),

                special:
                    /[^A-Za-z0-9\s]/.test(
                        value
                    ),

                noSpace:
                    value.length > 0 &&
                    !/\s/.test(value)

            };


            Object.entries(rules)
                .forEach(
                    ([
                        key,
                        valid
                    ]) => {

                        passwordRules[key]
                            ?.classList.toggle(
                                "is-valid",
                                valid
                            );

                    }
                );

        }

        function validateForm() {

            let valid =
                true;

            Object.keys(fields)
                .forEach(
                    fieldName => {

                        const fieldValid =
                            validateSingleField(
                                fieldName
                            );

                        if (!fieldValid) {
                            valid = false;
                        }

                    }
                );


            const matKhauHienTai =
                fields
                    .matKhauHienTai
                    .value;

            const matKhauMoi =
                fields
                    .matKhauMoi
                    .value;


            if (
                matKhauHienTai &&
                matKhauMoi &&
                matKhauHienTai ===
                    matKhauMoi
            ) {

                setFieldError(
                    "matKhauMoi",
                    "Mật khẩu mới phải khác mật khẩu hiện tại."
                );

                valid =
                    false;

            }


            if (!valid) {

                const firstInvalid =
                    form.querySelector(
                        '[aria-invalid="true"]'
                    );

                firstInvalid?.focus();

            }

            return valid;

        }


        function validateSingleField(
            fieldName
        ) {

            const field =
                fields[fieldName];

            if (!field) {
                return true;
            }

            clearFieldError(
                fieldName
            );

            const value =
                field.value;


            if (
                fieldName ===
                "matKhauHienTai"
            ) {

                if (!value) {

                    setFieldError(
                        fieldName,
                        "Vui lòng nhập mật khẩu hiện tại."
                    );

                    return false;

                }

                return true;

            }


            if (
                fieldName ===
                "matKhauMoi"
            ) {

                return validateNewPassword(
                    value
                );

            }


            if (
                fieldName ===
                "xacNhanMatKhauMoi"
            ) {

                if (!value) {

                    setFieldError(
                        fieldName,
                        "Vui lòng nhập lại mật khẩu mới."
                    );

                    return false;

                }

                if (
                    value !==
                    fields
                        .matKhauMoi
                        .value
                ) {

                    setFieldError(
                        fieldName,
                        "Mật khẩu nhập lại không khớp."
                    );

                    return false;

                }

                return true;

            }


            return true;

        }


        function validateNewPassword(
            value
        ) {

            const fieldName =
                "matKhauMoi";


            if (!value) {

                setFieldError(
                    fieldName,
                    "Vui lòng nhập mật khẩu mới."
                );

                return false;

            }


            if (
                value.length < 8
            ) {

                setFieldError(
                    fieldName,
                    "Mật khẩu mới phải có ít nhất 8 ký tự."
                );

                return false;

            }


            if (
                /\s/.test(value)
            ) {

                setFieldError(
                    fieldName,
                    "Mật khẩu không được chứa khoảng trắng."
                );

                return false;

            }


            if (
                !/[a-z]/.test(value)
            ) {

                setFieldError(
                    fieldName,
                    "Mật khẩu phải có ít nhất một chữ thường."
                );

                return false;

            }


            if (
                !/[A-Z]/.test(value)
            ) {

                setFieldError(
                    fieldName,
                    "Mật khẩu phải có ít nhất một chữ hoa."
                );

                return false;

            }


            if (
                !/\d/.test(value)
            ) {

                setFieldError(
                    fieldName,
                    "Mật khẩu phải có ít nhất một chữ số."
                );

                return false;

            }


            if (
                !/[^A-Za-z0-9\s]/.test(
                    value
                )
            ) {

                setFieldError(
                    fieldName,
                    "Mật khẩu phải có ít nhất một ký tự đặc biệt."
                );

                return false;

            }


            if (
                !PASSWORD_PATTERN.test(
                    value
                )
            ) {

                setFieldError(
                    fieldName,
                    "Mật khẩu chưa đáp ứng yêu cầu bảo mật."
                );

                return false;

            }


            return true;

        }


        function setFieldError(
            fieldName,
            message
        ) {

            const field =
                fields[fieldName];

            const container =
                form.querySelector(
                    `[data-form-field="${fieldName}"]`
                );

            const errorElement =
                form.querySelector(
                    `[data-field-error="${fieldName}"]`
                );


            field?.setAttribute(
                "aria-invalid",
                "true"
            );

            field?.setAttribute(
                "aria-describedby",
                `${fieldName}Error`
            );

            container?.classList.add(
                "is-invalid"
            );


            if (errorElement) {

                errorElement.id =
                    `${fieldName}Error`;

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
                fields[fieldName];

            const container =
                form.querySelector(
                    `[data-form-field="${fieldName}"]`
                );

            const errorElement =
                form.querySelector(
                    `[data-field-error="${fieldName}"]`
                );


            field?.removeAttribute(
                "aria-invalid"
            );

            field?.removeAttribute(
                "aria-describedby"
            );

            container?.classList.remove(
                "is-invalid"
            );


            if (errorElement) {

                errorElement.textContent =
                    "";

                errorElement.hidden =
                    true;

            }

        }


        function clearAllErrors() {

            Object.keys(fields)
                .forEach(
                    fieldName => {

                        clearFieldError(
                            fieldName
                        );

                    }
                );

        }


        function setSubmitting(
            submitting
        ) {

            if (submitButton) {

                submitButton.disabled =
                    submitting;

            }

            form
                .querySelectorAll(
                    "input, button"
                )
                .forEach(
                    element => {

                        if (
                            element ===
                            submitButton
                        ) {
                            return;
                        }

                        element.disabled =
                            submitting;

                    }
                );

        }

    }
);