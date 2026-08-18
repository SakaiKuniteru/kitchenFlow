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

    refreshPromise:
        null,


    async request(
        url,
        options = {}
    ) {

        let result =
            await this.send(
                url,
                options
            );

        if (
            result.response.status ===
                401 &&
            options.allowRefresh !==
                false
        ) {

            const refreshed =
                await this.refreshAuthentication();


            if (
                refreshed
            ) {

                result =
                    await this.send(
                        url,
                        {
                            ...options,

                            allowRefresh:
                                false
                        }
                    );

            } else {

                window.MCS.storage
                    .clearAuthentication();


                if (
                    window.location.pathname !==
                    window.MCS.config.loginPath
                ) {

                    window.location.replace(
                        window.MCS.config.loginPath
                    );

                }


                const error =
                    new Error(
                        "Phiên đăng nhập đã hết hạn."
                    );


                error.statusCode =
                    401;


                throw error;

            }

        }

        if (
            !result.response.ok
        ) {

            const error =
                new Error(
                    result.data?.message ||
                    "Yêu cầu không thành công."
                );


            error.statusCode =
                result.response.status;


            error.data =
                result.data?.data;


            throw error;

        }


        return result.data;

    },


    async send(
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
                options.body instanceof
                FormData
            )
        ) {

            headers[
                "Content-Type"
            ] =
                "application/json";

        }


        if (
            accessToken &&
            options.withoutAccessToken !==
                true
        ) {

            headers.Authorization =
                `Bearer ${accessToken}`;

        }


        const fetchOptions = {

            credentials:
                "include",

            ...options,

            headers

        };


        delete fetchOptions
            .allowRefresh;

        delete fetchOptions
            .withoutAccessToken;


        const response =
            await fetch(
                url,
                fetchOptions
            );


        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let data =
            null;


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            try {

                data =
                    await response.json();

            }
            catch {

                data =
                    null;

            }

        }


        return {

            response,

            data

        };

    },


    async refreshAuthentication() {

        const refreshToken =
            window.MCS.storage
                .getRefreshToken();


        if (
            !refreshToken
        ) {

            return false;

        }


        if (
            this.refreshPromise
        ) {

            return await this.refreshPromise;

        }


        this.refreshPromise =
            this.performRefresh(
                refreshToken
            );


        try {

            return await this.refreshPromise;

        }
        finally {

            this.refreshPromise =
                null;

        }

    },


    async performRefresh(
        refreshToken
    ) {

        try {

            const response =
                await fetch(
                    "/api/mcs/v1/auth/lam-moi-token",
                    {
                        method:
                            "POST",

                        credentials:
                            "include",

                        headers: {

                            Accept:
                                "application/json",

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({
                                refreshToken
                            })

                    }
                );


            if (
                !response.ok
            ) {

                return false;

            }


            const result =
                await response.json();


            const data =
                result?.data ??
                result;


            if (
                !data?.accessToken ||
                !data?.refreshToken
            ) {

                return false;

            }


            localStorage.setItem(
                window.MCS.config
                    .accessTokenKey,
                data.accessToken
            );


            localStorage.setItem(
                window.MCS.config
                    .refreshTokenKey,
                data.refreshToken
            );


            return true;

        }
        catch (
            error
        ) {

            console.warn(
                "[Auth] Không thể làm mới token:",
                error
            );


            return false;

        }

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