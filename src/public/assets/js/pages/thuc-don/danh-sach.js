"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const API_BASE =
            "/api/mcs/v1/thuc-don";


        const state = {

            keyword:
                "",

            createdFrom:
                "",

            createdTo:
                "",

            effectiveFrom:
                "",

            effectiveTo:
                "",

            loaiThucDon:
                [],

            coSoId:
                [],

            nhaAnId:
                [],

            caAnId:
                [],

            trangThai:
                [],

            page:
                1,

            limit:
                20

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
                )

        };


        initialize();


        async function initialize() {

            bindEvents();


            await loadData();

        }

        function bindEvents() {

            elements.filterToggle
                ?.addEventListener(
                    "click",
                    () => {

                        const open =
                            elements.filterPanel.hidden;

                        elements.filterPanel.hidden =
                            !open;

                        elements.filterToggle
                            .classList.toggle(
                                "is-active",
                                open
                            );

                    }
                );
                
            elements.search
                ?.addEventListener(
                    "input",
                    debounce(
                        async event => {

                            state.keyword =
                                event.target.value
                                    .trim();

                            state.page =
                                1;

                            await loadData();

                        },
                        300
                    )
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

                        await loadData();

                    }
                );

        }


        async function loadData() {

            const query =
                buildQuery();

            const response =
                await window.MCS.api.request(
                    `${API_BASE}/tong-hop?${query}`
                );

            renderRows(
                response?.data || []
            );

        }


        function buildQuery() {

            const params =
                new URLSearchParams();


            if (state.keyword) {

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


            if (state.createdFrom) {

                params.set(
                    "createdFrom",
                    state.createdFrom
                );

            }

            if (state.createdTo) {

                params.set(
                    "createdTo",
                    state.createdTo
                );

            }

            if (state.effectiveFrom) {

                params.set(
                    "effectiveFrom",
                    state.effectiveFrom
                );

            }

            if (state.effectiveTo) {

                params.set(
                    "effectiveTo",
                    state.effectiveTo
                );

            }


            params.set(
                "page",
                state.page
            );

            params.set(
                "limit",
                state.limit
            );


            return params.toString();

        }


        function appendArray(
            params,
            key,
            values
        ) {

            if (
                !Array.isArray(values) ||
                values.length === 0
            ) {
                return;
            }

            params.set(
                key,
                values.join(",")
            );

        }


        function renderRows(
            danhSach
        ) {

            elements.body.innerHTML =
                "";


            danhSach.forEach(
                item => {

                    const row =
                        document.createElement(
                            "tr"
                        );

                    row.innerHTML =
                        `
                            <td>
                                ${escapeHtml(item.maThucDon)}
                            </td>

                            <td>
                                ${escapeHtml(item.tenThucDon)}
                            </td>

                            <td>
                                ${escapeHtml(item.loaiThucDonText || "")}
                            </td>

                            <td>
                                ${escapeHtml(item.coSo?.tenCoSo || "")}
                            </td>

                            <td>
                                ${escapeHtml(item.nhaAn?.tenNhaAn || "")}
                            </td>

                            <td>
                                ${escapeHtml(item.caAn?.tenCaAn || "")}
                            </td>

                            <td>
                                ${escapeHtml(item.trangThaiText || "")}
                            </td>

                            <td>
                                <div class="module-list-table__row-actions">

                                    <a
                                        href="/thuc-don/thong-tin-chi-tiet-thuc-don/${item.id}"
                                        aria-label="Xem thực đơn">

                                        👁

                                    </a>

                                    <button
                                        type="button"
                                        data-delete-id="${item.id}"
                                        aria-label="Xóa thực đơn">

                                        🗑

                                    </button>

                                </div>
                            </td>
                        `;

                    elements.body.appendChild(
                        row
                    );

                }
            );

        }

    }
);