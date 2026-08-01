"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const CONFIG = {

            summaryEndpoint:
                "/api/mcs/v1/dashboard/tong-hop",

            currentUserKey:
                "currentUser",

            fallbackUserName:
                "Người dùng"

        };


        const elements = {

            currentDate:
                document.querySelector(
                    "[data-current-date]"
                ),

            homeUserName:
                document.querySelector(
                    "[data-home-user-name]"
                ),

            currentUserNames:
                document.querySelectorAll(
                    "[data-current-user-name]"
                ),

            changePasswordButton:
                document.getElementById(
                    "homeChangePasswordButton"
                ),

            summaryCards:
                document.querySelectorAll(
                    "[data-summary-card]"
                )

        };


        function initialize() {

            renderCurrentDate();

            renderCurrentUser();

            bindEvents();

            loadSummary();

        }


        function bindEvents() {

            elements.changePasswordButton
                ?.addEventListener(
                    "click",
                    openChangePasswordModal
                );

            document
                .querySelectorAll(
                    ".home-summary-card__link, " +
                    ".home-quick-link"
                )
                .forEach(
                    link => {

                        link.addEventListener(
                            "click",
                            event => {

                                if (
                                    link.getAttribute(
                                        "href"
                                    ) === "#"
                                ) {

                                    event.preventDefault();

                                }

                            }
                        );

                    }
                );

        }


        function renderCurrentDate() {

            if (
                !elements.currentDate
            ) {
                return;
            }

            const date =
                new Date();

            const formatter =
                new Intl.DateTimeFormat(
                    "vi-VN",
                    {
                        weekday:
                            "long",

                        day:
                            "2-digit",

                        month:
                            "2-digit",

                        year:
                            "numeric"
                    }
                );

            let value =
                formatter.format(
                    date
                );

            value =
                value.charAt(0)
                    .toUpperCase() +
                value.slice(1);

            elements.currentDate
                .textContent =
                value;

        }


        function getCurrentUser() {

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
                    "Không thể đọc thông tin người dùng.",
                    error
                );

                return null;

            }

        }


        function renderCurrentUser() {

            const user =
                getCurrentUser();

            const hoTen =
                user?.hoTen ||
                CONFIG.fallbackUserName;

            if (
                elements.homeUserName
            ) {

                elements.homeUserName
                    .textContent =
                    hoTen;

            }

            elements.currentUserNames
                .forEach(
                    element => {

                        element.textContent =
                            hoTen;

                    }
                );

            setTextContent(
                "[data-home-profile-name]",
                hoTen
            );

            setTextContent(
                "[data-home-profile-username]",
                user?.taiKhoan ||
                user?.tenDangNhap ||
                "Chưa có thông tin tài khoản"
            );

            setTextContent(
                "[data-home-profile-employee-code]",
                user?.maNhanVien ||
                "—"
            );

            setTextContent(
                "[data-home-profile-facility]",
                getRelationName(
                    user?.coSo
                )
            );

            setTextContent(
                "[data-home-profile-department]",
                getRelationName(
                    user?.phongBan
                )
            );

            setTextContent(
                "[data-home-profile-position]",
                getRelationName(
                    user?.chucVu
                )
            );

            renderAvatar(
                user
            );

        }


        function getRelationName(
            relation
        ) {

            if (!relation) {
                return "—";
            }

            return (
                relation.ten ||
                relation.tenCoSo ||
                relation.tenPhongBan ||
                relation.tenChucVu ||
                "—"
            );

        }


        function renderAvatar(user) {

            const avatarContainer =
                document.querySelector(
                    ".home-profile__avatar"
                );

            if (!avatarContainer) {
                return;
            }

            const imageUrl =
                user?.anhDaiDien;

            if (!imageUrl) {
                return;
            }

            avatarContainer.innerHTML =
                "";

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                imageUrl;

            image.alt =
                `Ảnh đại diện của ${
                    user.hoTen ||
                    "người dùng"
                }`;

            image.addEventListener(
                "error",
                () => {

                    avatarContainer.innerHTML =
                        "<span aria-hidden=\"true\">👤</span>";

                },
                {
                    once:
                        true
                }
            );

            avatarContainer.appendChild(
                image
            );

        }


        async function loadSummary() {

            if (
                !window.MCS?.api
                    ?.request
            ) {

                return;

            }

            setSummaryLoading(
                true
            );

            try {

                const result =
                    await window.MCS
                        .api
                        .request(
                            CONFIG.summaryEndpoint
                        );

                const data =
                    result?.data;

                if (!data) {
                    return;
                }

                updateSummaryValue(
                    "co-so",
                    data.tongCoSo
                );

                updateSummaryValue(
                    "nha-an",
                    data.tongNhaAn
                );

                updateSummaryValue(
                    "kho",
                    data.tongKho
                );

                updateSummaryValue(
                    "nhan-vien",
                    data.tongNhanVien
                );

            } catch (error) {

                /*
                 * API dashboard có thể chưa được làm ở giai đoạn FE.
                 * Không hiển thị lỗi làm gián đoạn trang chủ.
                 * Các số liệu do server render vẫn được giữ nguyên.
                 */

                console.info(
                    "API thống kê trang chủ chưa sẵn sàng:",
                    error.message
                );

            } finally {

                setSummaryLoading(
                    false
                );

            }

        }


        function updateSummaryValue(
            key,
            value
        ) {

            if (
                value === undefined ||
                value === null
            ) {
                return;
            }

            const element =
                document.querySelector(
                    `[data-summary-value="${key}"]`
                );

            if (!element) {
                return;
            }

            const numericValue =
                Number(value);

            element.textContent =
                Number.isFinite(
                    numericValue
                )
                    ? new Intl
                        .NumberFormat(
                            "vi-VN"
                        )
                        .format(
                            numericValue
                        )
                    : value;

        }


        function setSummaryLoading(
            loading
        ) {

            elements.summaryCards
                .forEach(
                    card => {

                        card.classList
                            .toggle(
                                "is-loading",
                                loading
                            );

                        card.setAttribute(
                            "aria-busy",
                            String(loading)
                        );

                    }
                );

        }


        function openChangePasswordModal() {

            const modal =
                document.getElementById(
                    "changePasswordModal"
                );

            if (!modal) {

                window.MCS?.toast
                    ?.warning(
                        "Chức năng đổi mật khẩu chưa được cấu hình."
                    );

                return;

            }

            if (
                window.MCS?.modal
                    ?.open
            ) {

                window.MCS.modal.open(
                    modal
                );

                return;

            }

            modal.hidden =
                false;

            document.body
                .classList
                .add(
                    "modal-open"
                );

        }


        function setTextContent(
            selector,
            value
        ) {

            const element =
                document.querySelector(
                    selector
                );

            if (!element) {
                return;
            }

            element.textContent =
                value ?? "—";

        }


        initialize();

    }
);