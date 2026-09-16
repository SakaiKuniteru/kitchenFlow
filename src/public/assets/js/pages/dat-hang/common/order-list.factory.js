'use strict';

(() => {
    const C = MCS.orders;
    const {
        $,
        state,
        api,
        mount
    } = C;

    C.createOrderListPage = async function createOrderListPage(
        options = {}
    ) {
        const management =
            options.management === true;

        const root =
            $('[data-order-page]');

        if (!root) return null;

        if (
            management &&
            !C.requirePermission(
                C.permissions
                    .MANAGEMENT_VIEW,
                root
            )
        ) {

            return null;

        }

        const endpoint =
            management
                ? '/nv-don-hang/quan-ly'
                : '/nv-don-hang/cua-toi';

        let listPage = 1;
        let pageSize = 20;
        let filters = {};
        let keyword = '';
        let sequence = 0;
        let selectedId = '';

        const table = $('[data-list-body]');

        const detailTarget =
            management
                ? $('[data-management-detail]')
                : null;

        const pagination =
            C.createPagination(
                $(
                    '.data-list-card__footer ' +
                    '[data-catalog-pagination]'
                ),
                {
                    page: listPage,
                    pageSize,
                    total: 0,

                    onChange(state) {
                        listPage =
                            state.page;

                        pageSize =
                            state.pageSize;

                        void load();
                    }
                }
            );

        const detailController =
            management
                ? C.createOrderDetailController({
                      root,
                      management: true,
                      detailTarget,
                      autoRefresh: false,

                      async onChanged() {
                          await load();
                      }
                  })
                : null;

        function setPagination(
            result
        ) {
            pagination?.setData({
                page:
                    Number(
                        result.pagination
                            .page
                    ),

                pageSize:
                    Number(
                        result.pagination
                            .limit ||
                        pageSize
                    ),

                total:
                    Number(
                        result.pagination
                            .total ||
                        0
                    )
            });
        }

        function renderStatistics(
            result
        ) {
            if (!management) return;

            const counts =
                result.thongKe;

            mount(
                '[data-management-stats]',
                'quan-ly-don',
                {
                    type: 'statistics',

                    statistics: [
                        {
                            label:
                                'Chờ xác nhận',

                            count:
                                counts
                                    .choXacNhan,

                            theme:
                                'warning',

                            icon:
                                'fa-clock'
                        },

                        {
                            label:
                                'Đang chuẩn bị',

                            count:
                                counts
                                    .dangChuanBi,

                            theme:
                                'primary',

                            icon:
                                'fa-kitchen-set'
                        },

                        {
                            label:
                                'Sẵn sàng / đang giao',

                            count:
                                counts
                                    .sanSangVaDangGiao,

                            theme:
                                'success',

                            icon:
                                'fa-truck'
                        },

                        {
                            label:
                                'Hoàn thành',

                            count:
                                counts
                                    .hoanThanh,

                            theme:
                                'muted',

                            icon:
                                'fa-circle-check'
                        }
                    ]
                }
            );
        }

        function detailUrl(item) {
            if (management) {
                return C.paths
                    .managementDetail(
                        item.nguoiDatId,
                        item.id
                    );
            }

            return C.paths
                .myDetail(
                    state.user
                        .taiKhoanId,
                    item.id
                );
        }

        function renderRows(
            items
        ) {
            table.innerHTML =
                items
                    .map(
                        (
                            item,
                            index
                        ) =>
                            C.render(
                                'quan-ly-don',
                                {
                                    type:
                                        'table-row',

                                    ...item,

                                    index:
                                        (
                                            listPage -
                                            1
                                        ) *
                                            pageSize +
                                        index +
                                        1,

                                    management,

                                    selected:
                                        String(
                                            item.id
                                        ) ===
                                        selectedId,

                                    detailUrl:
                                        detailUrl(
                                            item
                                        )
                                }
                            )
                    )
                    .join('');
        }

        function getTableColspan() {

            return (
                root
                    .querySelectorAll(
                        '.data-list-table thead th'
                    )
                    .length ||
                (
                    management
                        ? 10
                        : 8
                )
            );

        }


        function renderLoading() {

            table.replaceChildren();


            const row =
                table.insertRow();


            const cell =
                row.insertCell();


            cell.colSpan =
                getTableColspan();


            mount(
                cell,
                'dung-chung',
                {
                    type:
                        'loading'
                }
            );

        }

        function renderEmpty(
            title,
            description,
            retry = false
        ) {
            table.replaceChildren();

            const cell =
                table
                    .insertRow()
                    .insertCell();

            cell.colSpan = getTableColspan();

            mount(
                cell,
                'dung-chung',
                {
                    type: 'empty',
                    title,
                    description,
                    retry
                }
            );
        }

        async function load(
            quiet = false
        ) {
            const current =
                ++sequence;

            if (!quiet) {
                renderLoading();
            }

            try {
                const result =
                    await api(
                        `${endpoint}?${C.query({
                            ...filters,
                            keyword,
                            page: listPage,
                            limit: pageSize
                        })}`
                    );

                if (
                    current !== sequence
                ) {
                    return;
                }

                if (
                    listPage > 1 &&
                    !result.items.length
                ) {
                    listPage =
                        Math.max(
                            1,
                            result.pagination
                                .totalPages
                        );

                    return load();
                }

                renderStatistics(
                    result
                );

                renderRows(
                    result.items
                );

                setPagination(
                    result
                );

                if (
                    !result.items.length
                ) {
                    renderEmpty(
                        'Chưa có đơn hàng phù hợp',
                        'Thử thay đổi từ khóa hoặc bộ lọc.'
                    );

                    if (
                        detailTarget
                    ) {
                        selectedId = '';

                        mount(
                            detailTarget,
                            'dung-chung',
                            {
                                type:
                                    'empty',

                                title:
                                    'Chưa chọn đơn hàng'
                            }
                        );
                    }

                    return;
                }

                if (management) {
                    const item =
                        result.items.find(
                            (row) =>
                                String(
                                    row.id
                                ) ===
                                selectedId
                        ) ||
                        result.items[0];

                    selectedId =
                        String(item.id);

                    await detailController
                        .load(
                            item.id,
                            quiet
                        );
                }
            } catch (error) {
                if (
                    current !== sequence
                ) {
                    return;
                }

                renderEmpty(
                    'Không tải được danh sách đơn',
                    error.message,
                    true
                );
            }
        }

        function bindFilters() {
            C.setOptions(
                $('#orderStatusFilter'),

                Object.entries(
                    C.statuses
                ).map(
                    ([
                        value,
                        row
                    ]) => ({
                        value,
                        label: row[0]
                    })
                )
            );

            C.setOptions(
                $('#orderPaymentFilter'),

                Object.entries(
                    C.paymentStatuses
                ).map(
                    ([
                        value,
                        label
                    ]) => ({
                        value,
                        label
                    })
                )
            );

            const search =
                $('#orderListSearch');

            search?.addEventListener(
                'input',

                C.debounce(
                    (event) => {
                        keyword =
                            event.target
                                .value
                                .trim();

                        listPage = 1;

                        void load();
                    }
                )
            );

            $('[data-search-picker-clear]',
                search?.closest(
                    '[data-search-picker]'
                )
            )?.addEventListener(
                'click',
                () => {
                    search.value = '';

                    keyword = '';
                    listPage = 1;

                    void load();
                }
            );
        }

        function bindActions() {
            root.addEventListener(
                'click',
                async (event) => {
                    const select =
                        event.target.closest(
                            '[data-order-select]'
                        );

                    if (
                        select &&
                        management
                    ) {
                        event.preventDefault();

                        selectedId =
                            select.dataset
                                .orderSelect;

                        await detailController
                            .load(
                                selectedId
                            );

                        return;
                    }

                    const row =
                        event.target.closest(
                            '[data-order-row]'
                        );

                    if (
                        row &&
                        !select
                    ) {
                        if (management) {
                            selectedId =
                                row.dataset
                                    .orderRow;

                            await detailController
                                .load(
                                    selectedId
                                );
                        } else {
                            const link = $(
                                '[data-order-select]',
                                row
                            );

                            if (link) {
                                location.assign(
                                    link.href
                                );
                            }
                        }

                        return;
                    }

                    const button =
                        event.target.closest(
                            'button'
                        );

                    if (!button) return;

                    if (
                        button.hasAttribute(
                            'data-orders-refresh'
                        ) ||
                        button.hasAttribute(
                            'data-retry'
                        )
                    ) {
                        await load();

                        return;
                    }

                    if (
                        button.hasAttribute(
                            'data-toggle-filters'
                        )
                    ) {

                        const panel =
                            $(
                                '[data-list-filter-panel]'
                            );


                        if (
                            !panel
                        ) {
                            return;
                        }


                        panel.hidden =
                            !panel.hidden;


                        button.setAttribute(
                            'aria-expanded',
                            String(
                                !panel.hidden
                            )
                        );


                        return;

                    }

                    if (
                        button.hasAttribute(
                            'data-list-filter-apply'
                        )
                    ) {

                        const panel =
                            $(
                                '[data-list-filter-panel]'
                            );


                        const tuNgay =
                            $('#orderFromDate')
                                ?.value || '';


                        const denNgay =
                            $('#orderToDate')
                                ?.value || '';


                        if (
                            tuNgay &&
                            denNgay &&
                            denNgay <
                                tuNgay
                        ) {

                            MCS.toast.warning(
                                'Ngày kết thúc phải từ ngày bắt đầu trở đi.'
                            );


                            return;

                        }


                        filters = {

                            trangThai:
                                $('#orderStatusFilter')
                                    ?.value || '',

                            trangThaiThanhToan:
                                $('#orderPaymentFilter')
                                    ?.value || '',

                            tuNgay,

                            denNgay

                        };


                        listPage =
                            1;


                        await load();


                        return;

                    }


                    if (
                        button.hasAttribute(
                            'data-list-filter-reset'
                        )
                    ) {

                        const panel =
                            $(
                                '[data-list-filter-panel]'
                            );


                        panel
                            ?.querySelectorAll(
                                '[data-date-picker]'
                            )
                            .forEach(
                                field => {

                                    field.datePicker
                                        ?.setValue(
                                            '',
                                            false
                                        );

                                }
                            );


                        C.setSelectValue(
                            $('#orderStatusFilter'),
                            ''
                        );


                        C.setSelectValue(
                            $('#orderPaymentFilter'),
                            ''
                        );


                        filters =
                            {};


                        listPage =
                            1;


                        await load();


                        return;

                    }

                    if (
                        management &&
                        button.hasAttribute(
                            'data-management-export'
                        )
                    ) {
                        button.disabled =
                            true;

                        try {
                            const file =
                                await MCS.api
                                    .requestFile(
                                        `/api/mcs/v1/nv-don-hang/quan-ly/xuat-du-lieu?${C.query({
                                            ...filters,
                                            keyword
                                        })}`
                                    );

                            MCS.api.downloadBlob(
                                file.blob,

                                file.fileName ||
                                    'don-hang.xlsx'
                            );
                        } catch (error) {
                            MCS.toast.error(
                                error.message
                            );
                        } finally {
                            button.disabled =
                                false;
                        }
                    }
                }
            );
        }

        bindFilters();
        bindActions();

        await load();

        const timer =
            setInterval(
                () => {
                    if (
                        !document.hidden &&
                        !$(
                            '[data-order-action-dialog]'
                        )?.open
                    ) {
                        void load(true);
                    }
                },
                20000
            );

        window.addEventListener(
            'pagehide',
            () =>
                clearInterval(
                    timer
                ),
            {
                once: true
            }
        );

        document.addEventListener(
            'visibilitychange',
            () => {
                if (
                    !document.hidden
                ) {
                    void load(true);
                }
            }
        );

        return {
            load,

            refresh() {
                return load();
            }
        };
    };
})();