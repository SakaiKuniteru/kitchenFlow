"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const API_BASE =
            "/api/mcs/v1/thuc-don";

        const ACTIONS = {

            view: {
                icon:
                    "fa-regular fa-eye",

                title:
                    "Xem chi tiết",

                className:
                    "is-view"
            },

            print: {
                icon:
                    "fa-solid fa-print",

                title:
                    "In thực đơn",

                className:
                    "is-print"
            },

            delete: {
                icon:
                    "fa-regular fa-trash-can",

                title:
                    "Xóa",

                className:
                    "is-delete"
            }

        };

        const state = {

            keyword: "",

            createdFrom: "",

            createdTo: "",

            effectiveFrom: "",

            effectiveTo: "",

            loaiThucDon: [],

            coSoId: [],

            nhaAnId: [],

            caAnId: [],

            trangThai: [],

            page: 1,

            limit: 20

        };


        const elements = {

            search:
                document.querySelector(
                    "[data-list-search]"
                ),

            body:
                document.querySelector(
                    "[data-list-body]"
                ),

            empty:
                document.querySelector(
                    "[data-list-empty]"
                ),

            filterToggle:
                document.querySelector(
                    "[data-list-filter-toggle]"
                ),

            filterPanel:
                document.querySelector(
                    "[data-list-filter-panel]"
                ),

            applyFilter:
                document.querySelector(
                    "[data-list-filter-apply]"
                ),

            resetFilter:
                document.querySelector(
                    "[data-list-filter-reset]"
                ),

            pagination:
                document.querySelector(
                    "[data-list-pagination]"
                )

        };


        initialize();


        async function initialize() {

            bindEvents();

            await loadData();

        }


        function bindEvents() {

            bindFilter();

            bindSearch();

            bindTableActions();

        }


        function bindFilter() {

            elements.filterToggle
                ?.addEventListener(
                    "click",
                    () => {

                        const open =
                            elements.filterPanel
                                .hidden;

                        elements.filterPanel.hidden =
                            !open;

                        elements.filterToggle
                            .classList.toggle(
                                "is-active",
                                open
                            );

                    }
                );


            elements.applyFilter
                ?.addEventListener(
                    "click",
                    async () => {

                        readFilterState();

                        state.page =
                            1;

                        await loadData();

                    }
                );


            elements.resetFilter
                ?.addEventListener(
                    "click",
                    async () => {

                        resetFilters();

                        state.page =
                            1;

                        await loadData();

                    }
                );

        }


        function bindSearch() {

            elements.search
                ?.addEventListener(
                    "input",
                    debounce(
                        async event => {

                            state.keyword =
                                event.target
                                    .value
                                    .trim();

                            state.page =
                                1;

                            await loadData();

                        },
                        350
                    )
                );

        }

        function bindTableActions() {

            elements.body
                ?.addEventListener(
                    "click",
                    async event => {

                        const button =
                            event.target.closest(
                                "[data-action]"
                            );


                        if (!button) {
                            return;
                        }


                        event.preventDefault();

                        event.stopPropagation();


                        const action =
                            button.dataset
                                .action;


                        const id =
                            Number(
                                button.dataset
                                    .id
                            );


                        if (!id) {
                            return;
                        }


                        switch (
                            action
                        ) {

                            case "view":

                                window.location.href =
                                    `/thuc-don/thong-tin-chi-tiet-thuc-don/${id}`;

                                break;

                            case "print":

                                return;



                            case "delete":

                                await deleteRecord(
                                    id
                                );

                                break;

                        }

                    }
                );

        }

        async function loadData() {

            try {

                setLoading(
                    true
                );


                const query =
                    buildQuery();


                const response =
                    await window.MCS.api.request(
                        `${API_BASE}/tong-hop?${query}`
                    );


                const result =
                    normalizeListResponse(
                        response
                    );


                renderRows(
                    result.items
                );


                renderPagination(
                    result
                );

            } catch (
                error
            ) {

                console.error(
                    error
                );


                renderRows(
                    []
                );


                showError(
                    error?.message ||
                    "Không thể tải danh sách thực đơn."
                );

            } finally {

                setLoading(
                    false
                );

            }

        }


        function normalizeListResponse(
            response
        ) {

            const data =
                response?.data;

            if (
                Array.isArray(
                    data
                )
            ) {

                return {

                    items:
                        data,

                    total:
                        data.length,

                    page:
                        state.page,

                    limit:
                        state.limit

                };

            }

            const items =
                data?.danhSach ||
                data?.items ||
                data?.rows ||
                [];


            return {

                items:
                    Array.isArray(
                        items
                    )
                        ? items
                        : [],

                total:
                    Number(
                        data?.total ||
                        data?.tongSoBanGhi ||
                        data?.tongSo ||
                        items.length ||
                        0
                    ),

                page:
                    Number(
                        data?.page ||
                        state.page
                    ),

                limit:
                    Number(
                        data?.limit ||
                        state.limit
                    )

            };

        }


        function buildQuery() {

            const params =
                new URLSearchParams();


            if (
                state.keyword
            ) {

                params.set(
                    "keyword",
                    state.keyword
                );

            }


            appendArray(
                params,
                "loaiThucDon",
                state.loaiThucDon
            );


            appendArray(
                params,
                "coSoId",
                state.coSoId
            );


            appendArray(
                params,
                "nhaAnId",
                state.nhaAnId
            );


            appendArray(
                params,
                "caAnId",
                state.caAnId
            );


            appendArray(
                params,
                "trangThai",
                state.trangThai
            );


            if (
                state.createdFrom
            ) {

                params.set(
                    "createdFrom",
                    state.createdFrom
                );

            }


            if (
                state.createdTo
            ) {

                params.set(
                    "createdTo",
                    state.createdTo
                );

            }


            if (
                state.effectiveFrom
            ) {

                params.set(
                    "effectiveFrom",
                    state.effectiveFrom
                );

            }


            if (
                state.effectiveTo
            ) {

                params.set(
                    "effectiveTo",
                    state.effectiveTo
                );

            }


            params.set(
                "page",
                String(
                    state.page
                )
            );


            params.set(
                "limit",
                String(
                    state.limit
                )
            );


            return params
                .toString();

        }


        function appendArray(
            params,
            key,
            values
        ) {

            if (
                !Array.isArray(
                    values
                ) ||
                values.length === 0
            ) {

                return;

            }


            params.set(
                key,
                values.join(
                    ","
                )
            );

        }


        function readFilterState() {

            state.createdFrom =
                getValue(
                    "createdFrom"
                );


            state.createdTo =
                getValue(
                    "createdTo"
                );


            state.effectiveFrom =
                getValue(
                    "effectiveFrom"
                );


            state.effectiveTo =
                getValue(
                    "effectiveTo"
                );


            state.loaiThucDon =
                getMultiValues(
                    "loaiThucDon"
                );


            state.coSoId =
                getMultiValues(
                    "coSoId"
                );


            state.nhaAnId =
                getMultiValues(
                    "nhaAnId"
                );


            state.caAnId =
                getMultiValues(
                    "caAnId"
                );


            state.trangThai =
                getMultiValues(
                    "trangThai"
                );

        }


        function getValue(
            id
        ) {

            const element =
                document.getElementById(
                    id
                );


            return (
                element?.value ||
                ""
            ).trim();

        }


        function getMultiValues(
            id
        ) {

            const select =
                document.getElementById(
                    id
                );


            if (!select) {

                return [];

            }


            const values =
                Array
                    .from(
                        select
                            .selectedOptions ||
                        []
                    )
                    .map(
                        option =>
                            option.value
                    )
                    .filter(
                        value =>
                            value &&
                            value !==
                            "__ALL__"
                    );


            return values;

        }


        function resetFilters() {

            state.createdFrom =
                "";

            state.createdTo =
                "";

            state.effectiveFrom =
                "";

            state.effectiveTo =
                "";

            state.loaiThucDon =
                [];

            state.coSoId =
                [];

            state.nhaAnId =
                [];

            state.caAnId =
                [];

            state.trangThai =
                [];

            document
                .querySelectorAll(
                    "[data-smart-select]"
                )
                .forEach(
                    root => {

                        const native =
                            root.querySelector(
                                "[data-smart-select-native]"
                            );


                        if (!native) {
                            return;
                        }


                        Array
                            .from(
                                native.options
                            )
                            .forEach(
                                option => {

                                    option.selected =
                                        false;

                                }
                            );


                        native.dispatchEvent(
                            new Event(
                                "change",
                                {
                                    bubbles:
                                        true
                                }
                            )
                        );

                    }
                );

            resetDateRange(
                "createdFrom",
                "00:00:00"
            );

            resetDateRange(
                "createdTo",
                "23:59:59"
            );

            resetDateRange(
                "effectiveFrom",
                "00:00:00"
            );

            resetDateRange(
                "effectiveTo",
                "23:59:59"
            );

        }


        function resetDateRange(
            id,
            time
        ) {

            const hidden =
                document.getElementById(
                    id
                );

            const display =
                document.getElementById(
                    `${id}Display`
                );


            if (
                !hidden ||
                !display
            ) {
                return;
            }


            const now =
                new Date();


            const year =
                now.getFullYear();

            const month =
                String(
                    now.getMonth() +
                    1
                )
                    .padStart(
                        2,
                        "0"
                    );

            const day =
                String(
                    now.getDate()
                )
                    .padStart(
                        2,
                        "0"
                    );


            hidden.value =
                `${year}-${month}-${day} ${time}`;


            display.value =
                `${day}/${month}/${year} ${time}`;


            hidden.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles:
                            true
                    }
                )
            );

        }

        function renderAction(
            action,
            id
        ) {

            const config =
                ACTIONS[action];


            if (!config) {
                return "";
            }


            return `
                <button
                    type="button"
                    class="
                        module-list-table__action
                        ${config.className || ""}
                    "
                    data-action="${action}"
                    data-id="${id}"
                    title="${config.title}"
                    aria-label="${config.title}">

                    <i
                        class="${config.icon}">
                    </i>

                </button>
            `;

        }

        function renderRows(
            danhSach
        ) {

            if (
                !elements.body
            ) {
                return;
            }


            elements.body.innerHTML =
                "";


            if (
                !Array.isArray(
                    danhSach
                ) ||
                danhSach.length === 0
            ) {

                if (
                    elements.empty
                ) {

                    elements.empty.hidden =
                        false;

                }

                return;

            }


            if (
                elements.empty
            ) {

                elements.empty.hidden =
                    true;

            }


            danhSach.forEach(
                item => {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML =
                        `
                            <td>
                                ${escapeHtml(
                                    item.maThucDon ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.tenThucDon ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.loaiThucDonText ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.tenCoSo ||
                                    item.coSo?.tenCoSo ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.tenNhaAn ||
                                    item.nhaAn?.tenNhaAn ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.tenCaAn ||
                                    item.caAn?.tenCaAn ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${renderStatus(
                                    item
                                )}
                            </td>

                            <td>

                                <div
                                    class="
                                        module-list-table__row-actions
                                    ">

                                    ${
                                        renderAction(
                                            "view",
                                            item.id
                                        )
                                    }
                                    
                                    ${
                                        renderAction(
                                            "print",
                                            item.id
                                        )
                                    }

                                    ${
                                        renderAction(
                                            "delete",
                                            item.id
                                        )
                                    }

                                </div>

                            </td>
                        `;


                    elements.body
                        .appendChild(
                            row
                        );

                }
            );

        }


        function renderStatus(
            item
        ) {

            const text =
                item.trangThaiText ||
                "";


            if (!text) {

                return "—";

            }


            return `
                <span
                    class="
                        module-list-table__status
                        status-${Number(
                            item.trangThai ||
                            0
                        )}
                    ">

                    ${escapeHtml(
                        text
                    )}

                </span>
            `;

        }


        async function deleteRecord(
            id
        ) {

            const confirmed =
                await confirmDelete();


            if (!confirmed) {

                return;

            }


            try {

                setLoading(
                    true
                );


                const response =
                    await window.MCS.api.request(
                        `${API_BASE}/xoa/${id}`,
                        {
                            method:
                                "DELETE"
                        }
                    );


                showSuccess(
                    response?.message ||
                    "Xóa thực đơn thành công."
                );

                await loadData();

            } catch (
                error
            ) {

                console.error(
                    error
                );


                showError(
                    error?.message ||
                    "Xóa thực đơn thất bại."
                );

            } finally {

                setLoading(
                    false
                );

            }

        }


        async function confirmDelete() {

            if (
                window.MCS?.modal
                    ?.confirm
            ) {

                return await window.MCS
                    .modal
                    .confirm({

                        title:
                            "Xóa thực đơn",

                        message:
                            "Bạn có chắc chắn muốn xóa thực đơn này không?",

                        confirmText:
                            "Xóa",

                        cancelText:
                            "Hủy",

                        type:
                            "danger"

                    });

            }

            return window.confirm(
                "Bạn có chắc chắn muốn xóa thực đơn này không?"
            );

        }


        function showSuccess(
            message
        ) {

            if (
                window.MCS?.toast
                    ?.success
            ) {

                window.MCS
                    .toast
                    .success(
                        message
                    );

                return;

            }


            console.log(
                message
            );

        }


        function showError(
            message
        ) {

            if (
                window.MCS?.toast
                    ?.error
            ) {

                window.MCS
                    .toast
                    .error(
                        message
                    );

                return;

            }


            console.error(
                message
            );

        }


        function renderPagination(
            result
        ) {

            if (
                !elements.pagination
            ) {
                return;
            }


            const total =
                Number(
                    result.total ||
                    0
                );

            const limit =
                Number(
                    result.limit ||
                    state.limit
                );

            const currentPage =
                Number(
                    result.page ||
                    state.page
                );


            const totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        total /
                        limit
                    )
                );


            if (
                totalPages <= 1
            ) {

                elements.pagination
                    .innerHTML =
                    "";

                return;

            }


            elements.pagination
                .innerHTML =
                `
                    <button
                        type="button"
                        data-page="${
                            currentPage -
                            1
                        }"
                        ${
                            currentPage <=
                            1
                                ? "disabled"
                                : ""
                        }>
                        ‹
                    </button>

                    <span>
                        Trang
                        ${currentPage}
                        /
                        ${totalPages}
                    </span>

                    <button
                        type="button"
                        data-page="${
                            currentPage +
                            1
                        }"
                        ${
                            currentPage >=
                            totalPages
                                ? "disabled"
                                : ""
                        }>
                        ›
                    </button>
                `;


            elements.pagination
                .querySelectorAll(
                    "[data-page]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            async () => {

                                const page =
                                    Number(
                                        button
                                            .dataset
                                            .page
                                    );


                                if (
                                    page < 1 ||
                                    page >
                                        totalPages
                                ) {
                                    return;
                                }


                                state.page =
                                    page;


                                await loadData();

                            }
                        );

                    }
                );

        }


        function setLoading(
            loading
        ) {

            if (
                loading &&
                window.MCS?.loading
                    ?.show
            ) {

                window.MCS
                    .loading
                    .show();

                return;

            }


            if (
                !loading &&
                window.MCS?.loading
                    ?.hide
            ) {

                window.MCS
                    .loading
                    .hide();

            }

        }


        function escapeHtml(
            value
        ) {

            return String(
                value ??
                ""
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }


        function debounce(
            callback,
            delay
        ) {

            let timeout;


            return (
                ...args
            ) => {

                clearTimeout(
                    timeout
                );


                timeout =
                    setTimeout(
                        () => {

                            callback(
                                ...args
                            );

                        },
                        delay
                    );

            };

        }

    }
);