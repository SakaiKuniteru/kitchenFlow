"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const API_BASE =
            "/api/mcs/v1/dm-thiet-lap";


        const API_NHOM_TINH_NANG =
            "/api/mcs/v1/dm-nhom-tinh-nang/tong-hop?active=true";


        let catalog =
            null;


        let dsNhomTinhNang =
            [];


        initialize();

        async function initialize() {
            await initializeCatalog();
            await loadNhomTinhNang();
            syncCurrentNhomTinhNang();
            initializeNhomTinhNangUI();
        }

        function initializeNhomTinhNangUI() {

            const select =
                getNhomTinhNangSelect();


            const root =
                getNhomTinhNangRoot();


            const control =
                root?.querySelector(
                    "[data-smart-select-control]"
                );


            if (
                !select ||
                !root ||
                !control
            ) {
                return;
            }

            let clearButton =
                control.querySelector(
                    "[data-nhom-tinh-nang-clear]"
                );


            if (!clearButton) {

                clearButton =
                    document.createElement(
                        "button"
                    );


                clearButton.type =
                    "button";


                clearButton.className =
                    "thiet-lap-nhom-tinh-nang__clear";


                clearButton.dataset
                    .nhomTinhNangClear =
                    "true";


                clearButton.setAttribute(
                    "title",
                    "Xóa lựa chọn"
                );


                clearButton.setAttribute(
                    "aria-label",
                    "Xóa lựa chọn"
                );


                const icon =
                    document.createElement(
                        "i"
                    );


                icon.className =
                    "fa-solid fa-xmark";


                clearButton.appendChild(
                    icon
                );


                control.appendChild(
                    clearButton
                );


                clearButton.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        clearNhomTinhNang();

                    }
                );

            }

            if (
                select.dataset
                    .nhomTinhNangUiBound !==
                "true"
            ) {

                select.addEventListener(
                    "change",
                    () => {

                        requestAnimationFrame(
                            syncNhomTinhNangUI
                        );

                    }
                );


                select.dataset
                    .nhomTinhNangUiBound =
                    "true";

            }

            if (
                root.dataset
                    .nhomTinhNangRootBound !==
                "true"
            ) {

                root.addEventListener(
                    "click",
                    () => {

                        requestAnimationFrame(
                            syncNhomTinhNangUI
                        );

                    }
                );


                root.dataset
                    .nhomTinhNangRootBound =
                    "true";

            }

            const search =
                root.querySelector(
                    "[data-smart-select-search]"
                );


            if (
                search &&
                search.dataset
                    .nhomTinhNangSearchBound !==
                    "true"
            ) {

                search.addEventListener(
                    "focus",
                    () => {

                        requestAnimationFrame(
                            syncNhomTinhNangUI
                        );

                    }
                );


                search.addEventListener(
                    "input",
                    () => {

                        requestAnimationFrame(
                            () => {

                                syncNhomTinhNangUI();

                                resizeNhomTinhNangSearch();

                            }
                        );

                    }
                );

                search.dataset
                    .nhomTinhNangSearchBound =
                    "true";

            }


            syncNhomTinhNangUI();

        }

        function syncNhomTinhNangUI() {

            const select =
                getNhomTinhNangSelect();


            const root =
                getNhomTinhNangRoot();


            if (
                !select ||
                !root
            ) {
                return;
            }


            const search =
                root.querySelector(
                    "[data-smart-select-search]"
                );


            const placeholder =
                root.querySelector(
                    ".smart-select__placeholder"
                );


            const toggle =
                root.querySelector(
                    "[data-smart-select-toggle]"
                );


            const clearButton =
                root.querySelector(
                    "[data-nhom-tinh-nang-clear]"
                );


            const hasValue =
                Array
                    .from(
                        select.options
                    )
                    .some(
                        option =>
                            option.selected &&
                            Boolean(
                                option.value
                            )
                    );


            const opened =
                root.classList.contains(
                    "is-open"
                );

            if (search) {

                if (
                    !opened &&
                    !hasValue
                ) {

                    search.hidden =
                        true;


                    search.placeholder =
                        "";

                } else {

                    search.hidden =
                        false;


                    if (
                        opened &&
                        !hasValue
                    ) {

                        search.placeholder =
                            "Chọn nhóm tính năng...";

                    } else {

                        search.placeholder =
                            "";

                    }

                }

            }


            if (
                placeholder
            ) {

                placeholder.hidden =
                    opened;

            }

            if (
                clearButton
            ) {

                clearButton.hidden =
                    !hasValue;

            }


            if (
                toggle
            ) {

                toggle.hidden =
                    hasValue;

            }


            root.classList.toggle(
                "has-nhom-tinh-nang-value",
                hasValue
            );


            root.classList.toggle(
                "has-nhom-tinh-nang-clear",
                hasValue
            );

            resizeNhomTinhNangSearch();

        }

        function clearNhomTinhNang() {

            const select =
                getNhomTinhNangSelect();


            const root =
                getNhomTinhNangRoot();


            if (
                !select ||
                !root
            ) {
                return;
            }

            if (
                root.smartSelect
                    ?.clear
            ) {

                root.smartSelect
                    .clear(
                        true
                    );

            } else {

                Array
                    .from(
                        select.options
                    )
                    .forEach(
                        option => {

                            option.selected =
                                false;

                        }
                    );


                select.dispatchEvent(
                    new Event(
                        "change",
                        {
                            bubbles:
                                true
                        }
                    )
                );

            }


            requestAnimationFrame(
                () => {

                    syncNhomTinhNangUI();

                }
            );

        }

        async function initializeCatalog() {

            try {

                catalog =
                    await window.MCS
                        .pages
                        .createCatalogPage({

                            moduleName:
                                "thiet-lap",


                            columns: [

                                {
                                    key:
                                        "maThietLap",

                                    label:
                                        "Mã thiết lập",

                                    width:
                                        "230px",

                                    sortable:
                                        true,

                                    filterable:
                                        true
                                },


                                {
                                    key:
                                        "tenThietLap",

                                    label:
                                        "Tên thiết lập",

                                    width:
                                        "220px",

                                    sortable:
                                        true,

                                    filterable:
                                        true
                                },


                                {
                                    key:
                                        "giaTri",

                                    label:
                                        "Giá trị",

                                    width:
                                        "160px",

                                    filterable:
                                        true
                                },


                                {
                                    key:
                                        "nhomTinhNang",

                                    label:
                                        "Nhóm tính năng",

                                    width:
                                        "220px",

                                    sortable:
                                        true,

                                    filterable:
                                        true
                                },


                                {
                                    key:
                                        "moTa",

                                    label:
                                        "Mô tả",

                                    width:
                                        "250px",

                                    filterable:
                                        true
                                },


                                {
                                    key:
                                        "active",

                                    label:
                                        "Hiệu lực",

                                    width:
                                        "130px",

                                    sortable:
                                        true,

                                    isBoolean:
                                        true,

                                    trueLabel:
                                        "TRUE",

                                    falseLabel:
                                        "FALSE"
                                }

                            ],


                            defaultValues: {

                                maThietLap:
                                    "",

                                tenThietLap:
                                    "",

                                giaTri:
                                    "",

                                dsNhomTinhNangId:
                                    [],

                                moTa:
                                    "",

                                active:
                                    true

                            },


                            detailTitle:
                                "Thông tin thiết lập",


                            createTitle:
                                "Thêm thiết lập",


                            updateTitle:
                                "Cập nhật thiết lập",


                            getRecordSubtitle(
                                record
                            ) {

                                return (
                                    record?.maThietLap ||
                                    ""
                                );

                            },


                            mapListResponse(
                                result
                            ) {

                                return Array.isArray(
                                    result?.data
                                )
                                    ? result.data
                                    : [];

                            },


                            mapDetailResponse(
                                result
                            ) {

                                return (
                                    result?.data ||
                                    null
                                );

                            },


                            mapRecordToForm(
                                record
                            ) {

                                return {

                                    id:
                                        record?.id ??
                                        "",

                                    maThietLap:
                                        record?.maThietLap ||
                                        "",

                                    tenThietLap:
                                        record?.tenThietLap ||
                                        "",

                                    giaTri:
                                        record?.giaTri ??
                                        "",

                                    dsNhomTinhNangId:
                                        Array.isArray(
                                            record
                                                ?.dsNhomTinhNangId
                                        )
                                            ? record
                                                .dsNhomTinhNangId
                                            : [],

                                    moTa:
                                        record?.moTa ||
                                        "",

                                    active:
                                        record?.active ===
                                        true

                                };

                            },


                            transformPayload(
                                formData
                            ) {

                                return {

                                    maThietLap:
                                        String(
                                            formData
                                                .maThietLap ||
                                            ""
                                        )
                                            .trim()
                                            .toUpperCase(),

                                    tenThietLap:
                                        String(
                                            formData
                                                .tenThietLap ||
                                            ""
                                        )
                                            .trim(),

                                    giaTri:
                                        String(
                                            formData
                                                .giaTri ??
                                            ""
                                        )
                                            .trim(),

                                    dsNhomTinhNangId:
                                        getSelectedNhomTinhNangIds(),

                                    moTa:
                                        String(
                                            formData
                                                .moTa ||
                                            ""
                                        )
                                            .trim() ||
                                        null,

                                    active:
                                        formData.active ===
                                        true

                                };

                            },


                            onRecordLoaded(
                                record,
                                mode
                            ) {

                                const selectedIds =
                                    Array.isArray(
                                        record
                                            ?.dsNhomTinhNangId
                                    )
                                        ? record
                                            .dsNhomTinhNangId
                                        : [];


                                renderNhomTinhNangOptions(
                                    selectedIds
                                );


                                setNhomTinhNangReadonly(
                                    mode ===
                                        "view"
                                );

                            },


                            onAction(
                                action,
                                id,
                                catalogInstance
                            ) {

                                if (
                                    action ===
                                    "export"
                                ) {

                                    exportData();

                                    return;

                                }


                                if (
                                    action ===
                                    "import"
                                ) {

                                    importData(
                                        catalogInstance
                                    );

                                }

                            }

                        });

            } catch (
                error
            ) {

                console.error(
                    "Không thể khởi tạo danh mục thiết lập.",
                    error
                );


                window.MCS
                    ?.toast
                    ?.error(
                        error?.message ||
                        "Không thể tải danh mục thiết lập."
                    );

            }

        }

        async function loadNhomTinhNang() {

            try {

                const response =
                    await window.MCS
                        .api
                        .request(
                            API_NHOM_TINH_NANG
                        );


                const data =
                    response?.data;


                if (
                    Array.isArray(
                        data
                    )
                ) {

                    dsNhomTinhNang =
                        data;

                    return;

                }

                dsNhomTinhNang =
                    data?.items ||
                    data?.data ||
                    [];

            } catch (
                error
            ) {

                dsNhomTinhNang =
                    [];


                console.error(
                    "Không thể tải nhóm tính năng.",
                    error
                );


                window.MCS
                    ?.toast
                    ?.error(
                        error?.message ||
                        "Không thể tải danh sách nhóm tính năng."
                    );

            }

        }

        function getNhomTinhNangSelect() {

            return document
                .getElementById(
                    "dsNhomTinhNangId"
                );

        }

        function resizeNhomTinhNangSearch() {

            const root =
                getNhomTinhNangRoot();


            const search =
                root?.querySelector(
                    "[data-smart-select-search]"
                );


            if (
                !root ||
                !search
            ) {
                return;
            }


            const hasValue =
                root.classList.contains(
                    "has-nhom-tinh-nang-value"
                );


            if (!hasValue) {

                search.style.width =
                    "";

                return;

            }


            const value =
                search.value ||
                "";

            const width =
                Math.min(
                    180,
                    Math.max(
                        24,
                        (
                            value.length +
                            1
                        ) *
                        8
                    )
                );


            search.style.width =
                `${width}px`;

        }

        function getNhomTinhNangRoot() {

            return getNhomTinhNangSelect()
                ?.closest(
                    "[data-smart-select]"
                ) ||
                null;

        }

        function renderNhomTinhNangOptions(
            selectedIds = []
        ) {

            const select =
                getNhomTinhNangSelect();


            if (!select) {
                return;
            }


            const selectedSet =
                new Set(
                    (
                        selectedIds ||
                        []
                    )
                        .map(
                            value =>
                                String(
                                    value
                                )
                        )
                );


            select.innerHTML =
                "";

            const allOption =
                document.createElement(
                    "option"
                );


            allOption.value =
                "__ALL__";


            allOption.textContent =
                "Tất cả";


            select.appendChild(
                allOption
            );

            dsNhomTinhNang
                .forEach(
                    item => {

                        const option =
                            document
                                .createElement(
                                    "option"
                                );


                        option.value =
                            String(
                                item.id
                            );


                        option.textContent =
                            getNhomTinhNangLabel(
                                item
                            );


                        option.selected =
                            selectedSet.has(
                                String(
                                    item.id
                                )
                            );


                        select.appendChild(
                            option
                        );

                    }
                );


            const root =
                getNhomTinhNangRoot();


            root
                ?.smartSelect
                ?.refresh?.();


            requestAnimationFrame(
                () => {

                    syncNhomTinhNangUI();

                }
            );

        }

        function getNhomTinhNangLabel(
            item
        ) {

            const ma =
                item?.maNhomTinhNang ||
                "";


            const ten =
                item?.tenNhomTinhNang ||
                "";


            if (
                ma &&
                ten
            ) {

                return `${ma} - ${ten}`;

            }


            return (
                ten ||
                ma ||
                `Nhóm ${item?.id || ""}`
            );

        }

        function getSelectedNhomTinhNangIds() {

            const select =
                getNhomTinhNangSelect();


            if (!select) {
                return [];
            }


            const selectedOptions =
                Array.from(
                    select.selectedOptions ||
                    []
                );


            const selectedAll =
                selectedOptions.some(
                    option =>
                        option.value ===
                        "__ALL__"
                );

            if (
                selectedAll
            ) {

                return dsNhomTinhNang
                    .map(
                        item =>
                            Number(
                                item.id
                            )
                    )
                    .filter(
                        value =>
                            Number.isInteger(
                                value
                            ) &&
                            value >
                                0
                    );

            }


            return selectedOptions
                .map(
                    option =>
                        Number(
                            option.value
                        )
                )
                .filter(
                    value =>
                        Number.isInteger(
                            value
                        ) &&
                        value >
                            0
                );

        }

        function setNhomTinhNangReadonly(
            readonly
        ) {

            const root =
                getNhomTinhNangRoot();


            if (!root) {
                return;
            }


            root.smartSelect
                ?.setDisabled?.(
                    readonly
                );


            const clearButton =
                root.querySelector(
                    "[data-nhom-tinh-nang-clear]"
                );


            if (
                clearButton
            ) {

                clearButton.disabled =
                    readonly;

            }


            requestAnimationFrame(
                syncNhomTinhNangUI
            );

        }

        function syncCurrentNhomTinhNang() {

            if (!catalog) {
                return;
            }

            if (
                catalog.state
                    .selectedId !==
                null
            ) {

                const record =
                    catalog.state
                        .allData
                        .find(
                            item =>
                                String(
                                    item.id
                                ) ===
                                String(
                                    catalog.state
                                        .selectedId
                                )
                        );


                renderNhomTinhNangOptions(
                    record
                        ?.dsNhomTinhNangId ||
                    []
                );


                return;

            }


            renderNhomTinhNangOptions(
                []
            );

        }

        function exportData() {

            window.location.href =
                `${API_BASE}/xuat-du-lieu`;

        }

        function importData(
            catalogInstance
        ) {

            const input =
                document
                    .createElement(
                        "input"
                    );


            input.type =
                "file";


            input.accept =
                ".xlsx,.xls";


            input.hidden =
                true;


            document.body
                .appendChild(
                    input
                );


            input.addEventListener(
                "change",
                async () => {

                    const file =
                        input.files?.[0];


                    if (!file) {

                        input.remove();

                        return;

                    }


                    const body =
                        new FormData();


                    body.append(
                        "file",
                        file
                    );


                    try {

                        const response =
                            await window.MCS
                                .api
                                .request(
                                    `${API_BASE}/import-du-lieu`,
                                    {

                                        method:
                                            "POST",

                                        body

                                    }
                                );


                        window.MCS
                            ?.toast
                            ?.success(
                                response?.message ||
                                "Import dữ liệu thành công."
                            );


                        await catalogInstance
                            .load();

                    } catch (
                        error
                    ) {

                        window.MCS
                            ?.toast
                            ?.error(
                                error?.message ||
                                "Import dữ liệu thất bại."
                            );

                    } finally {

                        input.remove();

                    }

                }
            );


            input.click();

        }

    }
);