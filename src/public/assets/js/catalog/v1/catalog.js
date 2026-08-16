"use strict";


window.MCS =
    window.MCS || {};


window.MCS.catalog =
    window.MCS.catalog || {};


class MCSCatalog {

    constructor(
        options = {}
    ) {

        this.options = {

            root:
                "[data-catalog-page]",

            endpoints: {

                list:
                    "",

                detail:
                    "",

                create:
                    "",

                update:
                    ""

            },

            columns:
                [],

            rowKey:
                "id",

            pageSize:
                20,

            clientPagination:
                true,

            debounce:
                350,

            defaultValues: {
                active:
                    true
            },

            form:
                {},

            table:
                {},

            mapListResponse:
                result =>
                    result?.data || [],

            mapDetailResponse:
                result =>
                    result?.data || null,

            buildDetailUrl:
                (
                    endpoint,
                    id
                ) =>
                    `${endpoint}/${id}`,

            buildUpdateUrl:
                (
                    endpoint,
                    id
                ) =>
                    `${endpoint}/${id}`,

            onBeforeLoad:
                null,

            onAfterLoad:
                null,

            onRecordLoaded:
                null,

            onAction:
                null,

            ...options

        };


        this.root =
            typeof this.options.root ===
                "string"
                ? document.querySelector(
                    this.options.root
                )
                : this.options.root;


        if (!this.root) {

            throw new Error(
                "Không tìm thấy catalog root."
            );

        }


        this.state = {

            allData:
                [],

            filteredData:
                [],

            visibleData:
                [],

            selectedId:
                null,

            keyword:
                "",

            filters:
                {},

            sort: {

                key:
                    null,

                direction:
                    "none"

            },

            page:
                1,

            pageSize:
                this.options
                    .pageSize,

            loading:
                false

        };


        this.elements = {

            search:
                this.root.querySelector(
                    "[data-catalog-search]"
                ),

            clearSearch:
                this.root.querySelector(
                    "[data-catalog-clear-search]"
                ),

            create:
                this.root.querySelector(
                    "[data-catalog-create]"
                ),

            refresh:
                this.root.querySelector(
                    "[data-catalog-refresh]"
                ),

            filterToggle:
                this.root.querySelector(
                    "[data-catalog-filter-toggle]"
                ),

            filterRow:
                this.root.querySelector(
                    "[data-table-filter-row]"
                ),

            clearFilters:
                this.root.querySelector(
                    "[data-clear-table-filters]"
                ),

            total:
                this.root.querySelector(
                    "[data-catalog-total]"
                ),

            detailRoot:
                this.root.querySelector(
                    "[data-catalog-detail-panel]"
                ),

            form:
                this.root.querySelector(
                    "[data-catalog-form]"
                ),

            overlay:
                this.root.querySelector(
                    "[data-catalog-overlay]"
                )

        };


        this.table =
            new window.MCS.catalog.Table(
                this.root.querySelector(
                    "[data-catalog-table-wrapper]"
                ),
                {

                    columns:
                        this.options
                            .columns,

                    rowKey:
                        this.options
                            .rowKey,

                    showIndex:
                        true,

                    showActions:
                        true,

                    actions:
                        this.options
                            .table
                            .actions,

                    onRowClick:
                        record => {

                            if (!record) {
                                return;
                            }


                            const id =
                                record[
                                    this.options
                                        .rowKey
                                ];


                            if (
                                id === null ||
                                id === undefined
                            ) {
                                return;
                            }


                            this.openDetail(
                                id
                            );

                        },

                    onAction:
                        (
                            action,
                            id
                        ) =>
                            this.handleAction(
                                action,
                                id
                            ),

                    onSort:
                        sort => {

                            this.state.sort =
                                sort;


                            this.applyState();

                        }

                }
            );


        this.pagination =
            new window.MCS.catalog.Pagination(
                this.root.querySelector(
                    "[data-catalog-pagination]"
                ),
                {

                    page:
                        this.state.page,

                    pageSize:
                        this.state.pageSize,

                    total:
                        0,

                    onChange:
                        pagination => {

                            this.state.page =
                                pagination.page;


                            this.state.pageSize =
                                pagination.pageSize;


                            this.applyPagination();

                        }

                }
            );


        this.detailPanel =
            new window.MCS.catalog.DetailPanel(
                this.elements
                    .detailRoot,
                {

                    defaultTitle:
                        this.options
                            .detailTitle ||
                        "Thông tin chi tiết",

                    onEdit:
                        record => {

                            if (!record) {
                                return;
                            }


                            const id =
                                record[
                                    this.options
                                        .rowKey
                                ];


                            if (
                                id === null ||
                                id === undefined
                            ) {
                                return;
                            }


                            this.openUpdate(
                                id
                            );

                        },

                    onClose:
                        () => {

                            this.table
                                .clearSelection();


                            this.state
                                .selectedId =
                                null;


                            this.initializeDefaultDetail();

                        }

                }
            );


        this.form =
            new window.MCS.catalog.Form(
                this.elements.form,
                {

                    ...this.options.form,

                    onSubmit:
                        (
                            data,
                            form
                        ) =>
                            this.submitForm(
                                data,
                                form
                            ),

                    onCancel:
                        () =>
                            this.cancelForm()

                }
            );


        this.bindEvents();

    }


    bindEvents() {

        this.elements.search
            ?.addEventListener(
                "input",
                this.debounce(
                    event => {

                        this.state.keyword =
                            event.target
                                .value
                                .trim();


                        this.state.page =
                            1;


                        if (
                            this.elements
                                .clearSearch
                        ) {

                            this.elements
                                .clearSearch
                                .hidden =
                                !this.state
                                    .keyword;

                        }


                        this.applyState();

                    },
                    this.options
                        .debounce
                )
            );


        this.elements.clearSearch
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    if (
                        this.elements
                            .search
                    ) {

                        this.elements
                            .search
                            .value =
                            "";

                    }


                    this.state.keyword =
                        "";


                    this.state.page =
                        1;


                    this.elements
                        .clearSearch
                        .hidden =
                        true;


                    this.applyState();


                    this.elements
                        .search
                        ?.focus();

                }
            );


        this.elements.create
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    this.openCreate();

                }
            );


        this.elements.refresh
            ?.addEventListener(
                "click",
                async event => {

                    event.preventDefault();

                    event.stopPropagation();


                    if (
                        this.state.loading
                    ) {
                        return;
                    }


                    this.elements
                        .refresh
                        .disabled =
                        true;


                    try {

                        await this.load();

                    } finally {

                        this.elements
                            .refresh
                            .disabled =
                            false;

                    }

                }
            );


        this.elements.filterToggle
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    this.toggleFilterRow();

                }
            );


        this.root.addEventListener(
            "input",
            event => {

                const filter =
                    event.target.closest(
                        "[data-filter-key]"
                    );


                if (!filter) {
                    return;
                }


                this.state.filters[
                    filter.dataset
                        .filterKey
                ] =
                    filter.value;


                this.state.page =
                    1;


                this.applyState();

            }
        );


        this.root.addEventListener(
            "change",
            event => {

                const filter =
                    event.target.closest(
                        "[data-filter-key]"
                    );


                if (!filter) {
                    return;
                }


                this.state.filters[
                    filter.dataset
                        .filterKey
                ] =
                    filter.value;


                this.state.page =
                    1;


                this.applyState();

            }
        );


        this.elements.clearFilters
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    this.clearFilters();

                }
            );


        this.elements.overlay
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    this.detailPanel
                        .close();

                }
            );

    }


    async initialize() {

        this.initializeDefaultDetail();


        await this.load();


        return this;

    }


    initializeDefaultDetail() {

        this.state.selectedId =
            null;


        this.table
            .clearSelection();


        this.form
            .clear();


        this.form
            .setMode(
                "view"
            );


        this.form
            .setData(
                this.options
                    .defaultValues ||
                {
                    active:
                        true
                }
            );


        this.detailPanel
            .showDefault({

                title:
                    this.options
                        .detailTitle ||
                    "Thông tin chi tiết",

                subtitle:
                    ""

            });


        this.options
            .onRecordLoaded?.(
                null,
                "view",
                this
            );

    }


    toggleFilterRow() {

        const filterRow =
            this.elements
                .filterRow;


        const button =
            this.elements
                .filterToggle;


        if (
            !filterRow ||
            !button
        ) {
            return;
        }


        const willOpen =
            filterRow.hidden;


        filterRow.hidden =
            !willOpen;


        button.classList.toggle(
            "is-active",
            willOpen
        );


        button.setAttribute(
            "aria-expanded",
            String(willOpen)
        );


        if (willOpen) {

            filterRow
                .querySelector(
                    "input, select"
                )
                ?.focus();

        }

    }


    async load() {

        if (
            !this.options
                .endpoints
                .list
        ) {

            throw new Error(
                "Chưa cấu hình API danh sách."
            );

        }


        this.setLoading(
            true
        );


        try {

            this.options
                .onBeforeLoad?.(
                    this
                );


            const result =
                await window.MCS.api
                    .request(
                        this.options
                            .endpoints
                            .list
                    );


            const mapped =
                this.options
                    .mapListResponse(
                        result
                    );


            const list =
                Array.isArray(mapped)
                    ? mapped
                    : (
                        mapped?.items ||
                        mapped?.data ||
                        []
                    );


            this.state.allData =
                Array.isArray(list)
                    ? list.filter(
                        record => {

                            if (
                                !record ||
                                typeof record !==
                                    "object"
                            ) {
                                return false;
                            }


                            const id =
                                record[
                                    this.options
                                        .rowKey
                                ];


                            return (
                                id !== null &&
                                id !== undefined &&
                                id !== ""
                            );

                        }
                    )
                    : [];


            this.applyState();


            this.options
                .onAfterLoad?.(
                    this.state
                        .allData,
                    this
                );

        } catch (error) {

            window.MCS.toast
                ?.error(
                    error.message ||
                    "Không thể tải dữ liệu."
                );


            this.state.allData =
                [];


            this.applyState();


            throw error;

        } finally {

            this.setLoading(
                false
            );

        }

    }


    applyState() {

        let data = [
            ...this.state
                .allData
        ];


        data =
            this.applySearch(
                data
            );


        data =
            this.applyFilters(
                data
            );


        data =
            this.applySort(
                data
            );


        this.state.filteredData =
            data;


        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    data.length /
                    this.state.pageSize
                )
            );


        this.state.page =
            Math.min(
                Math.max(
                    1,
                    this.state.page
                ),
                totalPages
            );


        this.pagination
            .setData({

                page:
                    this.state.page,

                pageSize:
                    this.state
                        .pageSize,

                total:
                    data.length

            });


        this.applyPagination();


        this.updateTotal();

    }


    applySearch(
        data
    ) {

        const keyword =
            this.normalizeText(
                this.state.keyword
            );


        if (!keyword) {
            return data;
        }


        const searchableColumns =
            this.options.columns
                .filter(
                    column =>
                        column.searchable !==
                        false
                );


        return data.filter(
            record => {

                return searchableColumns
                    .some(
                        column => {

                            const value =
                                this.resolveValue(
                                    record,
                                    column.key
                                );


                            return this
                                .normalizeText(
                                    value
                                )
                                .includes(
                                    keyword
                                );

                        }
                    );

            }
        );

    }


    applyFilters(
        data
    ) {

        const filters =
            Object.entries(
                this.state.filters
            )
                .filter(
                    ([
                        ,
                        value
                    ]) =>
                        (
                            value !== "" &&
                            value !== null &&
                            value !== undefined
                        )
                );


        if (
            filters.length === 0
        ) {
            return data;
        }


        return data.filter(
            record => {

                return filters.every(
                    ([
                        key,
                        expected
                    ]) => {

                        const actual =
                            this.resolveValue(
                                record,
                                key
                            );


                        if (
                            String(expected) ===
                            "true"
                        ) {

                            return actual ===
                                true;

                        }


                        if (
                            String(expected) ===
                            "false"
                        ) {

                            return actual ===
                                false;

                        }


                        return this
                            .normalizeText(
                                actual
                            )
                            .includes(
                                this.normalizeText(
                                    expected
                                )
                            );

                    }
                );

            }
        );

    }


    applySort(
        data
    ) {

        const {
            key,
            direction
        } =
            this.state.sort;


        if (
            !key ||
            direction === "none"
        ) {
            return data;
        }


        return [
            ...data
        ].sort(
            (
                first,
                second
            ) => {

                const firstValue =
                    this.resolveValue(
                        first,
                        key
                    );


                const secondValue =
                    this.resolveValue(
                        second,
                        key
                    );


                const result =
                    this.compareValues(
                        firstValue,
                        secondValue
                    );


                return direction ===
                    "asc"
                    ? result
                    : -result;

            }
        );

    }


    applyPagination() {

        const start =
            (
                this.state.page -
                1
            ) *
            this.state.pageSize;


        const end =
            start +
            this.state.pageSize;


        this.state.visibleData =
            this.state.filteredData
                .slice(
                    start,
                    end
                );


        this.table.options.offset =
            start;


        this.table.setData(
            this.state
                .visibleData
        );


        if (
            this.state
                .selectedId !== null
        ) {

            this.table.selectRow(
                this.state
                    .selectedId
            );

        }

    }


    async openDetail(
        id
    ) {

        const record =
            await this.getDetail(
                id
            );


        if (!record) {
            return;
        }


        this.state.selectedId =
            id;


        this.table
            .selectRow(
                id
            );


        this.form
            .setMode(
                "view"
            );


        this.form
            .setData(
                this.mapRecordToForm(
                    record
                )
            );


        this.detailPanel
            .showForm({

                mode:
                    "view",

                record,

                title:
                    this.options
                        .detailTitle ||
                    "Thông tin chi tiết",

                subtitle:
                    this.getRecordSubtitle(
                        record
                    )

            });


        this.options
            .onRecordLoaded?.(
                record,
                "view",
                this
            );

    }


    openCreate() {

        this.state.selectedId =
            null;


        this.table
            .clearSelection();


        this.form
            .clear();


        this.form
            .setMode(
                "create"
            );


        this.form
            .setData(
                this.options
                    .defaultValues ||
                {
                    active:
                        true
                }
            );


        this.detailPanel
            .showForm({

                mode:
                    "create",

                record:
                    null,

                title:
                    this.options
                        .createTitle ||
                    "Thêm mới",

                subtitle:
                    ""

            });


        this.options
            .onRecordLoaded?.(
                null,
                "create",
                this
            );

    }


    async openUpdate(
        id
    ) {

        const record =
            await this.getDetail(
                id
            );


        if (!record) {
            return;
        }


        this.state.selectedId =
            id;


        this.table
            .selectRow(
                id
            );


        this.form
            .setMode(
                "update"
            );


        this.form
            .setData(
                this.mapRecordToForm(
                    record
                )
            );


        this.detailPanel
            .showForm({

                mode:
                    "update",

                record,

                title:
                    this.options
                        .updateTitle ||
                    "Cập nhật",

                subtitle:
                    this.getRecordSubtitle(
                        record
                    )

            });


        this.options
            .onRecordLoaded?.(
                record,
                "update",
                this
            );

    }


    async getDetail(
        id
    ) {

        const local =
            this.state.allData
                .find(
                    item =>
                        String(
                            item[
                                this.options
                                    .rowKey
                            ]
                        ) ===
                        String(id)
                );


        if (
            !this.options
                .endpoints
                .detail
        ) {

            return local || null;

        }


        this.setLoading(
            true
        );


        try {

            const url =
                this.options
                    .buildDetailUrl(
                        this.options
                            .endpoints
                            .detail,
                        id
                    );


            const result =
                await window.MCS.api
                    .request(
                        url
                    );


            return this.options
                .mapDetailResponse(
                    result
                );

        } catch (error) {

            window.MCS.toast
                ?.error(
                    error.message ||
                    "Không thể lấy chi tiết dữ liệu."
                );


            return null;

        } finally {

            this.setLoading(
                false
            );

        }

    }


    async submitForm(
        data,
        form
    ) {

        const mode =
            form.options.mode;


        const isCreate =
            mode ===
            "create";


        const id =
            this.state
                .selectedId;


        let url;


        let method;


        if (isCreate) {

            url =
                this.options
                    .endpoints
                    .create;


            method =
                "POST";

        } else {

            if (
                id === null ||
                id === undefined
            ) {

                throw new Error(
                    "Chưa chọn dữ liệu cần cập nhật."
                );

            }


            url =
                this.options
                    .buildUpdateUrl(
                        this.options
                            .endpoints
                            .update,
                        id
                    );


            method =
                "PATCH";

        }


        if (!url) {

            throw new Error(
                "Chưa cấu hình API lưu dữ liệu."
            );

        }


        try {

            const result =
                await window.MCS.api
                    .request(
                        url,
                        {

                            method,

                            body:
                                data instanceof
                                    FormData
                                    ? data
                                    : JSON.stringify(
                                        data
                                    )

                        }
                    );


            const saved =
                result?.data ||
                null;


            window.MCS.toast
                ?.success(
                    result?.message ||
                    (
                        isCreate
                            ? "Thêm dữ liệu thành công."
                            : "Cập nhật dữ liệu thành công."
                    )
                );


            await this.load();


            const savedId =
                saved?.[
                    this.options
                        .rowKey
                ] ||
                id;


            if (savedId) {

                await this.openDetail(
                    savedId
                );

            } else {

                this.initializeDefaultDetail();

            }


            return saved;

        } catch (error) {

            window.MCS.toast
                ?.error(
                    error.message ||
                    "Không thể lưu dữ liệu."
                );


            throw error;

        }

    }


    cancelForm() {

        if (
            this.form.isDirty
        ) {

            window.MCS.confirm
                ?.show({

                    title:
                        "Hủy thay đổi",

                    message:
                        "Dữ liệu chưa được lưu. Bạn có chắc chắn muốn hủy thay đổi không?",

                    confirmLabel:
                        "Hủy thay đổi",

                    type:
                        "danger",

                    onConfirm:
                        () =>
                            this.finishCancel()

                });


            return;

        }


        this.finishCancel();

    }


    finishCancel() {

        if (
            this.state
                .selectedId !== null
        ) {

            this.openDetail(
                this.state
                    .selectedId
            );


            return;

        }


        this.initializeDefaultDetail();

    }


    async handleAction(
        action,
        id
    ) {

        switch (
            action
        ) {

            case "view":

                await this.openDetail(
                    id
                );

                break;


            case "edit":

                await this.openUpdate(
                    id
                );

                break;


            case "lock":

                await this.confirmActiveChange(
                    id,
                    false
                );

                break;


            case "unlock":

                await this.confirmActiveChange(
                    id,
                    true
                );

                break;


            default:

                this.options
                    .onAction?.(
                        action,
                        id,
                        this
                    );

        }

    }


    async confirmActiveChange(
        id,
        active
    ) {

        window.MCS.confirm
            ?.show({

                title:
                    active
                        ? "Mở khóa dữ liệu"
                        : "Khóa dữ liệu",

                message:
                    active
                        ? "Bạn có chắc chắn muốn mở khóa dữ liệu này không?"
                        : "Bạn có chắc chắn muốn khóa dữ liệu này không?",

                confirmLabel:
                    active
                        ? "Mở khóa"
                        : "Khóa",

                type:
                    active
                        ? "primary"
                        : "danger",

                onConfirm:
                    async () => {

                        const url =
                            this.options
                                .buildUpdateUrl(
                                    this.options
                                        .endpoints
                                        .update,
                                    id
                                );


                        const result =
                            await window.MCS.api
                                .request(
                                    url,
                                    {

                                        method:
                                            "PATCH",

                                        body:
                                            JSON.stringify({
                                                active
                                            })

                                    }
                                );


                        window.MCS.toast
                            ?.success(
                                result?.message ||
                                (
                                    active
                                        ? "Mở khóa thành công."
                                        : "Khóa thành công."
                                )
                            );


                        await this.load();


                        await this.openDetail(
                            id
                        );

                    }

            });

    }


    clearFilters() {

        this.state.filters =
            {};


        this.root
            .querySelectorAll(
                "[data-filter-key]"
            )
            .forEach(
                field => {

                    field.value =
                        "";

                }
            );


        this.state.page =
            1;


        this.applyState();

    }


    setLoading(
        loading
    ) {

        this.state.loading =
            loading;


        this.table[
            loading
                ? "showLoading"
                : "hideLoading"
        ]();


        this.root.classList.toggle(
            "is-loading",
            loading
        );

    }


    updateTotal() {

        if (
            !this.elements
                .total
        ) {
            return;
        }


        this.elements.total.textContent =
            `${
                new Intl
                    .NumberFormat(
                        "vi-VN"
                    )
                    .format(
                        this.state
                            .filteredData
                            .length
                    )
            } bản ghi`;

    }


    mapRecordToForm(
        record
    ) {

        if (
            typeof this.options
                .mapRecordToForm ===
                "function"
        ) {

            return this.options
                .mapRecordToForm(
                    record,
                    this
                );

        }


        return record;

    }


    getRecordSubtitle(
        record
    ) {

        if (
            typeof this.options
                .getRecordSubtitle ===
                "function"
        ) {

            return this.options
                .getRecordSubtitle(
                    record
                );

        }


        return (
            record?.ma ||
            record?.maCoSo ||
            record?.maPhongBan ||
            record?.maChucVu ||
            ""
        );

    }


    resolveValue(
        object,
        path
    ) {

        if (!path) {
            return undefined;
        }


        return String(path)
            .split(".")
            .reduce(
                (
                    value,
                    key
                ) =>
                    value?.[key],
                object
            );

    }


    normalizeText(
        value
    ) {

        return String(
            value ?? ""
        )
            .normalize(
                "NFD"
            )
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .trim();

    }


    compareValues(
        first,
        second
    ) {

        if (
            first === second
        ) {
            return 0;
        }


        if (
            first === null ||
            first === undefined
        ) {
            return 1;
        }


        if (
            second === null ||
            second === undefined
        ) {
            return -1;
        }


        if (
            typeof first ===
                "number" &&
            typeof second ===
                "number"
        ) {

            return (
                first -
                second
            );

        }


        if (
            typeof first ===
                "boolean" &&
            typeof second ===
                "boolean"
        ) {

            return (
                Number(first) -
                Number(second)
            );

        }


        return String(first)
            .localeCompare(
                String(second),
                "vi",
                {

                    sensitivity:
                        "base",

                    numeric:
                        true

                }
            );

    }


    debounce(
        callback,
        delay
    ) {

        let timeout;


        return (
            ...args
        ) => {

            window.clearTimeout(
                timeout
            );


            timeout =
                window.setTimeout(
                    () =>
                        callback(
                            ...args
                        ),
                    delay
                );

        };

    }

}


window.MCS.catalog.Catalog =
    MCSCatalog;