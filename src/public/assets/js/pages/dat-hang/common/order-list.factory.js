'use strict';

(() => {

    const C =
        MCS.orders;


    const {
        $,
        state,
        api,
        mount
    } = C;


    C.createOrderListPage =
        async function createOrderListPage(
            options = {}
        ) {

            const management =
                options.management ===
                true;


            const root =
                $(
                    '[data-order-page]'
                );


            if (!root) {
                return null;
            }


            const listRoot =
                $(
                    '[data-order-list-common]',
                    root
                );


            if (!listRoot) {

                throw new Error(
                    'Không tìm thấy [data-order-list-common].'
                );

            }


            const table =
                $(
                    '[data-list-body]',
                    listRoot
                );

                const filterPanel =
                    $(
                        '[data-list-filter-panel]',
                        root
                    );


                const filterButton =
                    $(
                        '[data-toggle-filters]',
                        root
                    );

            const search =
                $(
                    '#orderListSearch',
                    listRoot
                );


            const paginationRoot =
                $(
                    '.data-list-card__footer ' +
                    '[data-catalog-pagination]',
                    listRoot
                );


            const detailTarget =
                management
                    ? $(
                        '[data-management-detail]',
                        root
                    )
                    : null;


            if (!table) {

                throw new Error(
                    'Không tìm thấy [data-list-body] của common/data-list/data-card.'
                );

            }


            const endpoint =
                management
                    ? '/nv-don-hang/quan-ly'
                    : '/nv-don-hang/cua-toi';


            let listPage =
                1;

            let pageSize =
                20;

            let filters =
                {};

            let keyword =
                '';

            let sequence =
                0;

            let selectedId =
                '';

            let detailBusy =
                false;

            let sort = {

                key:
                    null,

                direction:
                    'none'

            };

            /*
             * ===============================================
             * PAGINATION COMMON
             * ===============================================
             */

            const pagination =
                C.createPagination(
                    paginationRoot,
                    {
                        page:
                            listPage,

                        pageSize,

                        total:
                            0,

                        onChange(
                            paginationState
                        ) {

                            listPage =
                                paginationState
                                    .page;

                            pageSize =
                                paginationState
                                    .pageSize;

                            void load();

                        }
                    }
                );


            /*
             * ===============================================
             * DETAIL
             * ===============================================
             */

            const detailController =
                management
                    ? C.createOrderDetailController(
                        {
                            root,

                            management:
                                true,

                            detailTarget,

                            autoRefresh:
                                false,

                            async onChanged() {

                                await load();

                            }
                        }
                    )
                    : null;


            function setPagination(
                result
            ) {

                const paginationData =
                    result.pagination ||
                    {};


                pagination
                    ?.setData(
                        {
                            page:
                                Number(
                                    paginationData
                                        .page ||
                                    listPage
                                ),

                            pageSize:
                                Number(
                                    paginationData
                                        .limit ||
                                    pageSize
                                ),

                            total:
                                Number(
                                    paginationData
                                        .total ||
                                    0
                                )
                        }
                    );

            }


            /*
             * ===============================================
             * STATISTICS
             * ===============================================
             */

            function renderStatistics(
                result
            ) {

                if (!management) {
                    return;
                }


                const counts =
                    result.thongKe ||
                    {};


                const target =
                    $(
                        '[data-management-stats]',
                        root
                    );


                if (!target) {
                    return;
                }


                mount(
                    target,
                    'quan-ly-don',
                    {
                        type:
                            'statistics',

                        statistics: [

                            {
                                label:
                                    'Chờ xác nhận',

                                count:
                                    Number(
                                        counts
                                            .choXacNhan ||
                                        0
                                    ),

                                theme:
                                    'warning',

                                icon:
                                    'fa-clock'
                            },

                            {
                                label:
                                    'Đang chuẩn bị',

                                count:
                                    Number(
                                        counts
                                            .dangChuanBi ||
                                        0
                                    ),

                                theme:
                                    'primary',

                                icon:
                                    'fa-kitchen-set'
                            },

                            {
                                label:
                                    'Sẵn sàng / đang giao',

                                count:
                                    Number(
                                        counts
                                            .sanSangVaDangGiao ||
                                        0
                                    ),

                                theme:
                                    'success',

                                icon:
                                    'fa-truck'
                            },

                            {
                                label:
                                    'Hoàn thành',

                                count:
                                    Number(
                                        counts
                                            .hoanThanh ||
                                        0
                                    ),

                                theme:
                                    'muted',

                                icon:
                                    'fa-circle-check'
                            }

                        ]
                    }
                );

            }


            function detailUrl(
                item
            ) {

                if (
                    management
                ) {

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


            /*
             * ===============================================
             * ROW
             * ===============================================
             */

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
                    listRoot
                        .querySelectorAll(
                            '.data-list-table ' +
                            'thead th'
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

                table
                    .replaceChildren();


                const row =
                    table
                        .insertRow();


                const cell =
                    row
                        .insertCell();


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

                table
                    .replaceChildren();


                const row =
                    table
                        .insertRow();


                const cell =
                    row
                        .insertCell();


                cell.colSpan =
                    getTableColspan();


                mount(
                    cell,
                    'dung-chung',
                    {
                        type:
                            'empty',

                        title,

                        description,

                        retry
                    }
                );

            }


            /*
             * ===============================================
             * LOAD
             * ===============================================
             */

            async function load(
                quiet = false
            ) {

                const current =
                    ++sequence;


                if (!quiet) {

                    C.loadingStart
                        ?.();

                    renderLoading();

                }


                try {

                    const requestQuery = {

                        ...filters,

                        keyword,

                        page:
                            listPage,

                        limit:
                            pageSize

                    };


                    if (
                        sort.key &&
                        sort.direction !==
                            'none'
                    ) {

                        requestQuery.sortBy =
                            sort.key;

                        requestQuery.sortDir =
                            sort.direction;

                    }


                    const result =
                        await api(
                            `${endpoint}?${C.query(
                                requestQuery
                            )}`
                        );

                    if (
                        current !==
                        sequence
                    ) {

                        return;

                    }


                    const items =
                        Array.isArray(
                            result.items
                        )
                            ? result.items
                            : [];


                    const paginationData =
                        result.pagination ||
                        {};


                    if (
                        listPage >
                            1 &&
                        !items.length
                    ) {

                        listPage =
                            Math.max(
                                1,

                                Number(
                                    paginationData
                                        .totalPages
                                ) ||
                                1
                            );


                        return await load(
                            quiet
                        );

                    }


                    renderStatistics(
                        result
                    );


                    renderRows(
                        items
                    );


                    setPagination(
                        result
                    );


                    if (
                        !items.length
                    ) {

                        renderEmpty(
                            'Chưa có đơn hàng phù hợp',
                            'Thử thay đổi từ khóa hoặc bộ lọc.'
                        );


                        if (
                            detailTarget
                        ) {

                            selectedId =
                                '';


                            mount(
                                detailTarget,
                                'dung-chung',
                                {
                                    type:
                                        'empty',

                                    title:
                                        'Chưa chọn đơn hàng',

                                    description:
                                        'Chọn một đơn hàng trong danh sách để xem thông tin.'
                                }
                            );

                        }


                        return;

                    }


                    if (
                        management &&
                        detailController
                    ) {

                        const item =
                            items.find(
                                row =>
                                    String(
                                        row.id
                                    ) ===
                                    selectedId
                            ) ||
                            items[0];


                        selectedId =
                            String(
                                item.id
                            );


                        /*
                         * Detail đầu tiên tải cùng list.
                         * Không bật thêm overlay lần nữa.
                         */
                        await detailController
                            .load(
                                item.id,
                                true
                            );

                    }

                } catch (
                    error
                ) {

                    if (
                        current !==
                        sequence
                    ) {

                        return;

                    }


                    renderEmpty(
                        'Không tải được danh sách đơn',
                        error.message,
                        true
                    );

                } finally {

                    if (
                        !quiet &&
                        current ===
                            sequence
                    ) {

                        C.loadingEnd
                            ?.();

                    }

                }

            }


            /*
             * ===============================================
             * FILTER COMMON
             * ===============================================
             */

            function bindFilters() {

                    C.setOptions(
                        $(
                            '#orderStatusFilter',
                            filterPanel
                        ),

                    Object.entries(
                        C.statuses
                    )
                        .map(
                            ([
                                value,
                                row
                            ]) => ({
                                value,

                                label:
                                    row[0]
                            })
                        )
                );


                C.setOptions(
                    $(
                        '#orderPaymentFilter',
                        filterPanel
                    ),

                    Object.entries(
                        C.paymentStatuses
                    )
                        .map(
                            ([
                                value,
                                label
                            ]) => ({
                                value,
                                label
                            })
                        )
                );


                search
                    ?.addEventListener(
                        'input',

                        C.debounce(
                            event => {

                                keyword =
                                    event
                                        .target
                                        .value
                                        .trim();


                                listPage =
                                    1;


                                void load();

                            }
                        )
                    );


                $(
                    '[data-search-picker-clear]',

                    search
                        ?.closest(
                            '[data-search-picker]'
                        )
                )
                    ?.addEventListener(
                        'click',
                        () => {

                            search.value =
                                '';

                            keyword =
                                '';

                            listPage =
                                1;

                            void load();

                        }
                    );

            }

            function updateSortIcons() {

                listRoot
                    .querySelectorAll(
                        '[data-list-sort]'
                    )
                    .forEach(
                        button => {

                            const icon =
                                button
                                    .querySelector(
                                        '[data-sort-icon]'
                                    );


                            if (!icon) {
                                return;
                            }


                            icon.dataset
                                .sortDirection =
                                    button.dataset
                                        .listSort ===
                                    sort.key
                                        ? sort.direction
                                        : 'none';

                        }
                    );

            }

            function bindSort() {

                listRoot
                    .querySelectorAll(
                        '[data-list-sort]'
                    )
                    .forEach(
                        button => {

                            button
                                .addEventListener(
                                    'click',
                                    () => {

                                        const key =
                                            button.dataset
                                                .listSort;


                                        if (
                                            sort.key !==
                                            key
                                        ) {

                                            sort = {

                                                key,

                                                direction:
                                                    'asc'

                                            };

                                        } else {

                                            const next = {

                                                none:
                                                    'asc',

                                                asc:
                                                    'desc',

                                                desc:
                                                    'none'

                                            };


                                            const direction =
                                                next[
                                                    sort.direction
                                                ];


                                            sort =
                                                direction ===
                                                    'none'
                                                    ? {
                                                        key:
                                                            null,

                                                        direction:
                                                            'none'
                                                    }
                                                    : {
                                                        key,

                                                        direction
                                                    };

                                        }


                                        listPage =
                                            1;


                                        updateSortIcons();


                                        void load();

                                    }
                                );

                        }
                    );


                updateSortIcons();

            }

            function closeFilter() {

                if (!filterPanel) {
                    return;
                }


                filterPanel.hidden =
                    true;


                filterButton
                    ?.setAttribute(
                        'aria-expanded',
                        'false'
                    );

            }

            function bindFilterDismiss() {

                const handlePointerDown =
                    event => {

                        if (
                            !filterPanel ||
                            filterPanel.hidden
                        ) {

                            return;

                        }


                        const target =
                            event.target;


                        if (
                            filterPanel.contains(
                                target
                            ) ||
                            filterButton
                                ?.contains(
                                    target
                                )
                        ) {

                            return;

                        }


                        closeFilter();

                    };


                document
                    .addEventListener(
                        'pointerdown',
                        handlePointerDown
                    );


                window
                    .addEventListener(
                        'pagehide',
                        () => {

                            document
                                .removeEventListener(
                                    'pointerdown',
                                    handlePointerDown
                                );

                        },
                        {
                            once:
                                true
                        }
                    );

            }

            function resetFilters() {

                filterPanel
                    ?.querySelectorAll(
                        '[data-date-picker]'
                    )
                    .forEach(
                        field => {

                            field
                                .datePicker
                                ?.setValue(
                                    '',
                                    false
                                );

                        }
                    );

                    C.setSelectValue(
                        $(
                            '#orderStatusFilter',
                            filterPanel
                        ),
                        ''
                    );


                    C.setSelectValue(
                        $(
                            '#orderPaymentFilter',
                            filterPanel
                        ),
                        ''
                    );

                filters =
                    {};


                listPage =
                    1;

            }


            /*
             * ===============================================
             * DETAIL CLICK
             * ===============================================
             */

            async function loadSelectedDetail(
                id
            ) {

                if (
                    !management ||
                    !detailController ||
                    !id ||
                    detailBusy
                ) {

                    return;

                }


                detailBusy =
                    true;


                C.loadingStart
                    ?.();


                try {

                    selectedId =
                        String(
                            id
                        );


                    await detailController
                        .load(
                            selectedId
                        );

                } finally {

                    C.loadingEnd
                        ?.();


                    detailBusy =
                        false;

                }

            }


            /*
             * ===============================================
             * ACTIONS
             * ===============================================
             */

            function bindActions() {

                root
                    .addEventListener(
                        'click',

                        async event => {

                            const select =
                                event.target
                                    .closest(
                                        '[data-order-select]'
                                    );


                            if (
                                select &&
                                management &&
                                detailController
                            ) {

                                event
                                    .preventDefault();


                                await loadSelectedDetail(
                                    select.dataset
                                        .orderSelect
                                );


                                return;

                            }


                            const row =
                                event.target
                                    .closest(
                                        '[data-order-row]'
                                    );


                            if (
                                row &&
                                !select
                            ) {

                                if (
                                    management &&
                                    detailController
                                ) {

                                    await loadSelectedDetail(
                                        row.dataset
                                            .orderRow
                                    );

                                } else {

                                    const link =
                                        $(
                                            '[data-order-select]',
                                            row
                                        );


                                    if (link) {

                                        C.navigate(
                                            link.href
                                        );

                                    }

                                }


                                return;

                            }


                            const button =
                                event.target
                                    .closest(
                                        'button'
                                    );


                            if (!button) {
                                return;
                            }


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

                                event.stopPropagation();


                                if (!filterPanel) {
                                    return;
                                }


                                const opening =
                                    filterPanel.hidden;


                                filterPanel.hidden =
                                    !opening;


                                filterButton
                                    ?.setAttribute(
                                        'aria-expanded',
                                        String(
                                            opening
                                        )
                                    );


                                return;

                            }

                            if (
                                button.hasAttribute(
                                    'data-list-filter-apply'
                                )
                            ) {

                                const tuNgay =
                                    $(
                                        '#orderFromDate',
                                        filterPanel
                                    )
                                        ?.value ||
                                    '';


                                const denNgay =
                                    $(
                                        '#orderToDate',
                                        filterPanel
                                    )
                                        ?.value ||
                                    '';

                                if (
                                    tuNgay &&
                                    denNgay &&
                                    denNgay <
                                        tuNgay
                                ) {

                                    MCS.toast
                                        .warning(
                                            'Ngày kết thúc phải từ ngày bắt đầu trở đi.'
                                        );


                                    return;

                                }

                                filters = {

                                    trangThai:
                                        $(
                                            '#orderStatusFilter',
                                            filterPanel
                                        )
                                            ?.value ||
                                        '',

                                    trangThaiThanhToan:
                                        $(
                                            '#orderPaymentFilter',
                                            filterPanel
                                        )
                                            ?.value ||
                                        '',

                                    tuNgay,

                                    denNgay

                                };
                                
                                listPage =
                                    1;


                                closeFilter();


                                await load();


                                return;

                            }


                            if (
                                button.hasAttribute(
                                    'data-list-filter-reset'
                                )
                            ) {

                                resetFilters();

                                closeFilter();

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


                                C.loadingStart
                                    ?.();


                                try {

                                    const file =
                                        await MCS.api
                                            .requestFile(
                                                `/api/mcs/v1/nv-don-hang/quan-ly/xuat-du-lieu?${C.query({
                                                    ...filters,
                                                    keyword
                                                })}`
                                            );


                                    MCS.api
                                        .downloadBlob(
                                            file.blob,

                                            file.fileName ||
                                            'don-hang.xlsx'
                                        );

                                } catch (
                                    error
                                ) {

                                    MCS.toast
                                        .error(
                                            error.message
                                        );

                                } finally {

                                    C.loadingEnd
                                        ?.();


                                    button.disabled =
                                        false;

                                }

                            }

                        }
                    );

            }
            bindFilters();
            bindSort();
            bindActions();
            bindFilterDismiss();
            await load();

            const timer =
                setInterval(
                    () => {

                        if (
                            !document.hidden &&
                            !$(
                                '[data-order-action-dialog]'
                            )
                                ?.open
                        ) {

                            void load(
                                true
                            );

                        }

                    },
                    20000
                );


            window
                .addEventListener(
                    'pagehide',
                    () => {

                        clearInterval(
                            timer
                        );

                    },
                    {
                        once:
                            true
                    }
                );


            document
                .addEventListener(
                    'visibilitychange',
                    () => {

                        if (
                            !document.hidden
                        ) {

                            void load(
                                true
                            );

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