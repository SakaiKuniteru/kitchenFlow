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
        "/",

    accessTokenRefreshBeforeSeconds: 120,

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

window.MCS.authSession = {

    refreshTimer:
        null,


    decodeAccessToken(
        token
    ) {

        if (!token) {
            return null;
        }


        try {

            const parts =
                token.split(
                    "."
                );


            if (
                parts.length !== 3
            ) {

                return null;

            }


            let payload =
                parts[1]
                    .replace(
                        /-/g,
                        "+"
                    )
                    .replace(
                        /_/g,
                        "/"
                    );


            while (
                payload.length %
                4
            ) {

                payload +=
                    "=";

            }


            const decoded =
                decodeURIComponent(
                    atob(
                        payload
                    )
                        .split(
                            ""
                        )
                        .map(
                            character =>
                                "%" +
                                (
                                    "00" +
                                    character
                                        .charCodeAt(
                                            0
                                        )
                                        .toString(
                                            16
                                        )
                                )
                                    .slice(
                                        -2
                                    )
                        )
                        .join(
                            ""
                        )
                );


            return JSON.parse(
                decoded
            );

        } catch (
            error
        ) {

            console.warn(
                "[Auth] Không thể đọc Access Token:",
                error
            );


            return null;

        }

    },


    clearRefreshTimer() {

        if (
            this.refreshTimer
        ) {

            clearTimeout(
                this.refreshTimer
            );


            this.refreshTimer =
                null;

        }

    },


    scheduleAccessTokenRefresh() {

        this.clearRefreshTimer();


        const accessToken =
            window.MCS.storage
                .getAccessToken();


        const refreshToken =
            window.MCS.storage
                .getRefreshToken();


        if (
            !accessToken ||
            !refreshToken
        ) {

            return;

        }


        const payload =
            this.decodeAccessToken(
                accessToken
            );


        if (
            !payload?.exp
        ) {

            return;

        }


        const expiresAt =
            Number(
                payload.exp
            ) *
            1000;


        const refreshBefore =
            window.MCS.config
                .accessTokenRefreshBeforeSeconds *
            1000;


        const now =
            Date.now();


        const delay =
            expiresAt -
            now -
            refreshBefore;

        if (
            delay <= 0
        ) {

            this.refreshAccessTokenNow();

            return;

        }


        this.refreshTimer =
            setTimeout(
                () => {

                    this.refreshAccessTokenNow();

                },
                delay
            );

    },


    async refreshAccessTokenNow() {

        if (
            window.location.pathname ===
            window.MCS.config.loginPath
        ) {

            return;

        }


        const refreshToken =
            window.MCS.storage
                .getRefreshToken();


        if (!refreshToken) {

            return;

        }


        try {

            const refreshed =
                await window.MCS.api
                    .refreshAuthentication();


            if (
                !refreshed
            ) {

                window.MCS.storage
                    .clearAuthentication();


                this.clearRefreshTimer();


                if (
                    window.location.pathname !==
                    window.MCS.config.loginPath
                ) {

                    window.location.replace(
                        window.MCS.config.loginPath
                    );

                }


                return;

            }

            this.scheduleAccessTokenRefresh();

        } catch (
            error
        ) {

            console.warn(
                "[Auth] Làm mới Access Token tự động thất bại:",
                error
            );

        }

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

    async requestFile(
        url,
        options = {}
    ) {

        let result =
            await this.sendFile(
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
                await this
                    .refreshAuthentication();


            if (
                refreshed
            ) {

                result =
                    await this.sendFile(
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

            let message =
                "Yêu cầu không thành công.";

            if (
                result.contentType.includes(
                    "application/json"
                )
            ) {

                try {

                    const text =
                        await result.blob
                            .text();


                    const data =
                        JSON.parse(
                            text
                        );


                    message =
                        data?.message ||
                        message;

                } catch (
                    error
                ) {

                    console.warn(
                        "Không đọc được lỗi tải file:",
                        error
                    );

                }

            }


            const error =
                new Error(
                    message
                );


            error.statusCode =
                result.response.status;


            throw error;

        }


        return {

            blob:
                result.blob,

            fileName:
                this.getDownloadFileName(
                    result.response
                ),

            contentType:
                result.contentType

        };

    },

    async sendFile(
        url,
        options = {}
    ) {

        const accessToken =
            window.MCS.storage
                .getAccessToken();


        const headers = {

            Accept:
                "*/*",

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
            ) ||
            "";


        const blob =
            await response.blob();


        return {

            response,

            blob,

            contentType

        };

    },


    getDownloadFileName(
        response
    ) {

        const disposition =
            response.headers.get(
                "content-disposition"
            ) ||
            "";

        const utf8Match =
            disposition.match(
                /filename\*=UTF-8''([^;]+)/i
            );


        if (
            utf8Match?.[1]
        ) {

            try {

                return decodeURIComponent(
                    utf8Match[1]
                );

            } catch (
                error
            ) {

                return utf8Match[1];

            }

        }


        /*
        * filename="ten-file.xlsx"
        */
        const normalMatch =
            disposition.match(
                /filename="?([^";]+)"?/i
            );


        return (
            normalMatch?.[1] ||
            null
        );

    },

    downloadBlob(
        blob,
        fileName =
            "download.xlsx"
    ) {

        if (
            !(blob instanceof Blob)
        ) {

            throw new Error(
                "Dữ liệu tải xuống không hợp lệ."
            );

        }


        const objectUrl =
            URL.createObjectURL(
                blob
            );


        const anchor =
            document.createElement(
                "a"
            );


        anchor.href =
            objectUrl;


        anchor.download =
            fileName;


        anchor.style.display =
            "none";


        document.body
            .appendChild(
                anchor
            );


        anchor.click();


        anchor.remove();


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    objectUrl
                );

            },
            1000
        );

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

            window.MCS.authSession
                ?.scheduleAccessTokenRefresh();

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

        window.MCS.authSession
            .scheduleAccessTokenRefresh();
            
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