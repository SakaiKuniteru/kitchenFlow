"use strict";


window.MCS =
    window.MCS || {};


window.MCS.config = {

    accessTokenKey:
        "accessToken",

    refreshTokenKey:
        "refreshToken",

    currentUserKey:
        "currentUser",

    loginPath:
        "/auth/login",

    homePath:
        "/"

};


window.MCS.storage = {

    getAccessToken() {

        return localStorage.getItem(
            window.MCS.config
                .accessTokenKey
        );

    },


    getRefreshToken() {

        return localStorage.getItem(
            window.MCS.config
                .refreshTokenKey
        );

    },


    getCurrentUser() {

        const raw =
            localStorage.getItem(
                window.MCS.config
                    .currentUserKey
            );

        if (!raw) {
            return null;
        }

        try {

            return JSON.parse(raw);

        } catch {

            return null;

        }

    },


    clearAuthentication() {

        localStorage.removeItem(
            window.MCS.config
                .accessTokenKey
        );

        localStorage.removeItem(
            window.MCS.config
                .refreshTokenKey
        );

        localStorage.removeItem(
            window.MCS.config
                .currentUserKey
        );

    }

};


window.MCS.api = {

    async request(
        url,
        options = {}
    ) {

        const accessToken =
            window.MCS.storage
                .getAccessToken();

        const headers = {

            Accept:
                "application/json",

            ...options.headers

        };

        if (
            options.body &&
            !(
                options.body
                instanceof FormData
            )
        ) {

            headers[
                "Content-Type"
            ] =
                "application/json";

        }

        if (accessToken) {

            headers.Authorization =
                `Bearer ${accessToken}`;

        }

        const response =
            await fetch(
                url,
                {
                    credentials:
                        "include",

                    ...options,

                    headers
                }
            );

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";

        let result = null;

        if (
            contentType.includes(
                "application/json"
            )
        ) {

            result =
                await response.json();

        }

        if (!response.ok) {

            if (
                response.status === 401
            ) {

                window.MCS.storage
                    .clearAuthentication();

            }

            const error =
                new Error(
                    result?.message ||
                    "Yêu cầu không thành công."
                );

            error.statusCode =
                response.status;

            error.data =
                result?.data;

            throw error;

        }

        return result;

    }

};


window.MCS.escapeHtml =
    value => {

        const element =
            document.createElement(
                "div"
            );

        element.textContent =
            value ?? "";

        return element.innerHTML;

    };


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const currentUser =
            window.MCS.storage
                .getCurrentUser();

        document
            .querySelectorAll(
                "[data-current-user-name]"
            )
            .forEach(
                element => {

                    element.textContent =
                        currentUser?.hoTen ||
                        "Người dùng";

                }
            );

        const changePasswordButtons =
            document.querySelectorAll(
                "#changePasswordButton, " +
                "#homeChangePasswordButton"
            );

        changePasswordButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        window.MCS.modal
                            ?.open(
                                "changePasswordModal"
                            );

                    }
                );

            }
        );

    }
);