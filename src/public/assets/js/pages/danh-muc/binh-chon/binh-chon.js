"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const API_BASE =
        "/api/mcs/v1/binh-chon";

    const API_TRANG_THAI =
        "/api/mcs/v1/enums?name=trangThaiTaoBinhChon";

    const API_THUC_DON_NGAY_HOP_LE =
        `${API_BASE}/thuc-don-ngay-hop-le`;

    let catalog =
        null;

    let dsTrangThai =
        [];

    let dsThucDonNgay =
        [];

    let permissionSet =
        new Set();

    initialize();

    async function initialize() {
        try {
            await loadDanhMucPhu();

            await initializeCatalog();

            permissionSet =
                getCurrentPermissionSet();

            applyRecordUpdatePermission();

            bindEvents();
        } catch (
            error
        ) {
            console.error(
                "Không thể khởi tạo quản lý bình chọn.",
                error
            );

            window.MCS
                ?.toast
                ?.error(
                    error?.message ||
                    "Không thể tải quản lý bình chọn."
                );
        }
    }

    async function loadDanhMucPhu() {
        const result =
            await window.MCS.api
                .request(
                    API_TRANG_THAI
                );

        dsTrangThai =
            Array.isArray(
                result?.data
            )
                ? result.data
                : [];
    }

    async function initializeCatalog() {
        catalog =
            await window.MCS.pages
                .createCatalogPage({
                    moduleName:
                        "binh-chon",

                    permissionCodes: {
                        view: [
                            "Q001018",
                            "Q001019",
                            "Q001020"
                        ],

                        create: [
                            "Q001019"
                        ],

                        update: [
                            "Q001020"
                        ]
                    },

                    detailTitle:
                        "Thông tin đợt bình chọn",

                    createTitle:
                        "Thêm đợt bình chọn",

                    updateTitle:
                        "Cập nhật đợt bình chọn",

                    columns: [
                        {
                            key:
                                "ngayHienThi",

                            label:
                                "Ngày",

                            width:
                                "120px",

                            sortable:
                                true,

                            filterable:
                                true,

                            className:
                                "catalog-table__cell--center"
                        },

                        {
                            key:
                                "tenThucDon",

                            label:
                                "Thực đơn",

                            width:
                                "240px",

                            sortable:
                                true,

                            filterable:
                                true
                        },

                        {
                            key:
                                "tenNhaAn",

                            label:
                                "Nhà ăn",

                            width:
                                "180px",

                            sortable:
                                true,

                            filterable:
                                true
                        },

                        {
                            key:
                                "tenCaAn",

                            label:
                                "Ca ăn",

                            width:
                                "140px",

                            sortable:
                                true,

                            filterable:
                                true,

                            className:
                                "catalog-table__cell--center"
                        },

                        {
                            key:
                                "batDauHienThi",

                            label:
                                "Bắt đầu",

                            width:
                                "170px",

                            sortable:
                                true,

                            className:
                                "catalog-table__cell--center"
                        },

                        {
                            key:
                                "hanHienThi",

                            label:
                                "Hạn bình chọn",

                            width:
                                "170px",

                            sortable:
                                true,

                            className:
                                "catalog-table__cell--center"
                        },

                        {
                            key:
                                "trangThaiHienThi",

                            label:
                                "Trạng thái",

                            width:
                                "130px",

                            sortable:
                                true,

                            filterable:
                                true,

                            className:
                                "catalog-table__cell--center"
                        },

                        {
                            key:
                                "tongBinhChon",

                            label:
                                "Đã bình chọn",

                            width:
                                "120px",

                            sortable:
                                true,

                            type:
                                "number",

                            className:
                                "catalog-table__cell--center"
                        },

                        {
                            key:
                                "coThamGia",

                            label:
                                "Tham gia",

                            width:
                                "100px",

                            sortable:
                                true,

                            type:
                                "number",

                            className:
                                "catalog-table__cell--center"
                        }
                    ],

                    defaultValues: {
                        thucDonNgayId:
                            "",

                        batDauBinhChon:
                            "",

                        hanBinhChon:
                            "",

                        choPhepThayDoi:
                            true,

                        trangThai:
                            "",

                        trangThaiThoiGian:
                            "",

                        nguoiTao:
                            "",

                        nguoiGui:
                            "",

                        thoiGianGui:
                            "",

                        nguoiHuy:
                            "",

                        thoiGianHuy:
                            "",

                        lyDoHuy:
                            ""
                    },

                    validation: {
                        thucDonNgayId: {
                            label:
                                "Ngày thực đơn",

                            required:
                                true,

                            requiredMessage:
                                "Vui lòng chọn ngày thực đơn."
                        },

                        batDauBinhChon: {
                            label:
                                "Bắt đầu bình chọn",

                            required:
                                true,

                            requiredMessage:
                                "Vui lòng chọn thời gian bắt đầu bình chọn."
                        },

                        hanBinhChon: {
                            label:
                                "Hạn bình chọn",

                            required:
                                true,

                            requiredMessage:
                                "Vui lòng chọn hạn bình chọn."
                        }
                    },

                    validate(
                        formData
                    ) {
                        const errors =
                            {};

                        const batDau =
                            parseDate(
                                formData.batDauBinhChon
                            );

                        const han =
                            parseDate(
                                formData.hanBinhChon
                            );

                        if (
                            batDau &&
                            han &&
                            batDau >=
                            han
                        ) {
                            errors.hanBinhChon =
                                "Hạn bình chọn phải lớn hơn thời gian bắt đầu.";
                        }

                        return errors;
                    },

                    mapListResponse(
                        result
                    ) {
                        const records =
                            Array.isArray(
                                result?.data
                            )
                                ? result.data
                                : [];

                        return records.map(
                            mapBinhChonHienThi
                        );
                    },

                    mapDetailResponse(
                        result
                    ) {
                        return mapBinhChonHienThi(
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

                            thucDonNgayId:
                                record?.thucDonNgayId ??
                                "",

                            batDauBinhChon:
                                toDatePickerValue(
                                    record?.batDauBinhChon
                                ),

                            hanBinhChon:
                                toDatePickerValue(
                                    record?.hanBinhChon
                                ),

                            choPhepThayDoi:
                                record?.choPhepThayDoi !==
                                false,

                            trangThai:
                                getTrangThaiLabel(
                                    record
                                ),

                            trangThaiThoiGian:
                                record
                                    ?.trangThaiThoiGian
                                    ?.name ||
                                "",

                            nguoiTao:
                                getNguoiLabel(
                                    record?.nguoiTao
                                ),

                            nguoiGui:
                                getNguoiLabel(
                                    record?.nguoiGui
                                ),

                            thoiGianGui:
                                toDatePickerValue(
                                    record?.thoiGianGui
                                ),

                            nguoiHuy:
                                getNguoiLabel(
                                    record?.nguoiHuy
                                ),

                            thoiGianHuy:
                                toDatePickerValue(
                                    record?.thoiGianHuy
                                ),

                            lyDoHuy:
                                record?.lyDoHuy ||
                                ""
                        };
                    },

                    async onRecordLoaded(
                        record,
                        mode
                    ) {
                        const dotBinhChonId =
                            record?.id ||
                            null;

                        await loadThucDonNgayHopLe(
                            dotBinhChonId
                        );

                        renderThucDonNgayOptions(
                            record?.thucDonNgayId ??
                            ""
                        );

                        renderThongTinThucDon(
                            record?.thucDonNgayId
                        );

                        setDatePickerValue(
                            "batDauBinhChon",
                            toDatePickerValue(
                                record?.batDauBinhChon
                            )
                        );

                        setDatePickerValue(
                            "hanBinhChon",
                            toDatePickerValue(
                                record?.hanBinhChon
                            )
                        );

                        setDatePickerValue(
                            "thoiGianGui",
                            toDatePickerValue(
                                record?.thoiGianGui
                            )
                        );

                        setDatePickerValue(
                            "thoiGianHuy",
                            toDatePickerValue(
                                record?.thoiGianHuy
                            )
                        );

                        renderThongKe(
                            record
                        );

                        syncLyDoHuyField(
                            record
                        );
                    },

                    transformPayload(
                        formData
                    ) {
                        return {
                            thucDonNgayId:
                                Number(
                                    formData
                                        .thucDonNgayId
                                ),

                            batDauBinhChon:
                                formData.batDauBinhChon,

                            hanBinhChon:
                                formData.hanBinhChon,

                            choPhepThayDoi:
                                formData
                                    .choPhepThayDoi ===
                                true
                        };
                    },

                    getRecordSubtitle(
                        record
                    ) {
                        return [
                            record
                                ?.ngayHienThi,

                            record
                                ?.tenCaAn
                        ]
                            .filter(
                                Boolean
                            )
                            .join(
                                " - "
                            );
                    },

                    headerActions: [
                        {
                            action:
                                "gui-binh-chon",

                            label:
                                "Gửi",

                            icon:
                                "fa-solid fa-paper-plane",

                            variant:
                                "primary",

                            modes: [
                                "view",
                                "update"
                            ],

                            permission:
                                "Q001021",

                            when({
                                record
                            }) {
                                return [
                                    10,
                                    30
                                ].includes(
                                    getTrangThaiValue(
                                        record
                                    )
                                );
                            }
                        },

                        {
                            action:
                                "huy-binh-chon",

                            label:
                                "Hủy",

                            icon:
                                "fa-solid fa-ban",

                            variant:
                                "danger",

                            modes: [
                                "view"
                            ],

                            permission:
                                "Q001022",

                            when({
                                record
                            }) {
                                return (
                                    getTrangThaiValue(
                                        record
                                    ) ===
                                    20
                                );
                            }
                        }
                    ],

                    onHeaderAction(
                        {
                            action,
                            record
                        },
                        catalogInstance
                    ) {
                        if (
                            action ===
                            "gui-binh-chon"
                        ) {
                            handleGui(
                                record,
                                catalogInstance
                            );

                            return;
                        }

                        if (
                            action ===
                            "huy-binh-chon"
                        ) {
                            handleHuy(
                                record,
                                catalogInstance
                            );
                        }
                    },

                    toolbarActions: [
                        {
                            action:
                                "filter",

                            label:
                                "Tìm kiếm chi tiết",

                            icon:
                                "search"
                        }
                    ]
                });
    }

    function syncLyDoHuyField(
        record
    ) {
        const field =
            document.getElementById(
                "lyDoHuy"
            );

        const container =
            document.querySelector(
                '[data-form-field="lyDoHuy"]'
            );

        if (
            !field ||
            !container
        ) {
            return;
        }

        const trangThai =
            getTrangThaiValue(
                record
            );

        const requiredMark =
            container.querySelector(
                ".form-field__required"
            );

        if (
            trangThai ===
            20
        ) {
            field.disabled =
                false;

            field.readOnly =
                false;

            field.required =
                true;

            field.tabIndex =
                0;

            field.setAttribute(
                "aria-required",
                "true"
            );

            if (
                requiredMark
            ) {
                requiredMark.hidden =
                    false;
            }

            catalog
                ?.form
                ?.clearFieldError(
                    "lyDoHuy"
                );

            return;
        }

        field.disabled =
            true;

        field.readOnly =
            true;

        field.required =
            false;

        field.tabIndex =
            -1;

        field.removeAttribute(
            "aria-required"
        );

        if (
            requiredMark
        ) {
            requiredMark.hidden =
                true;
        }

        catalog
            ?.form
            ?.clearFieldError(
                "lyDoHuy"
            );
    }

    function getCurrentPermissionSet() {
        return new Set(
            String(
                catalog
                    ?.root
                    ?.dataset
                    ?.permissions ||
                ""
            )
                .split(
                    ","
                )
                .map(
                    item =>
                        item
                            .trim()
                            .toUpperCase()
                )
                .filter(
                    Boolean
                )
        );
    }

    function applyRecordUpdatePermission() {
        if (
            !catalog ||
            catalog
                ._binhChonUpdateWrapped ===
                true
        ) {
            return;
        }

        const openUpdate =
            catalog.openUpdate.bind(
                catalog
            );

        catalog.openUpdate =
            async id => {
                const record =
                    catalog.state
                        .allData
                        .find(
                            item =>
                                String(
                                    item?.id
                                ) ===
                                String(
                                    id
                                )
                        );

                if (
                    !record ||
                    !canUpdateRecord(
                        record
                    )
                ) {
                    return catalog
                        .openDetail(
                            id
                        );
                }

                return openUpdate(
                    id
                );
            };

        catalog
            ._binhChonUpdateWrapped =
            true;
    }

    function canUpdateRecord(
        record
    ) {
        if (!record) {
            return false;
        }

        const trangThai =
            getTrangThaiValue(
                record
            );

        if (
            ![
                10,
                30
            ].includes(
                trangThai
            )
        ) {
            return false;
        }

        return permissionSet.has(
            "Q001020"
        );
    }

    function bindEvents() {
        const select =
            document.getElementById(
                "thucDonNgayId"
            );

        if (
            select &&
            select.dataset
                .binhChonBound !==
            "true"
        ) {
            select.dataset
                .binhChonBound =
                "true";

            select.addEventListener(
                "change",
                event => {
                    renderThongTinThucDon(
                        event.target.value
                    );
                }
            );
        }

        catalog
            ?.elements
            ?.create
            ?.addEventListener(
                "click",
                () => {
                    window.setTimeout(
                        async () => {
                            await loadThucDonNgayHopLe();

                            renderThucDonNgayOptions(
                                ""
                            );

                            renderThongTinThucDon(
                                null
                            );

                            renderThongKe(
                                null
                            );
                        },
                        0
                    );
                }
            );
    }

    function toDatePickerValue(
        value
    ) {
        if (!value) {
            return "";
        }

        const date =
            new Date(
                value
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() +
                1
            )
                .padStart(
                    2,
                    "0"
                );

        const day =
            String(
                date.getDate()
            )
                .padStart(
                    2,
                    "0"
                );

        const hour =
            String(
                date.getHours()
            )
                .padStart(
                    2,
                    "0"
                );

        const minute =
            String(
                date.getMinutes()
            )
                .padStart(
                    2,
                    "0"
                );

        const second =
            String(
                date.getSeconds()
            )
                .padStart(
                    2,
                    "0"
                );

        return (
            `${year}-${month}-${day} ` +
            `${hour}:${minute}:${second}`
        );
    }

    function setDatePickerValue(
        id,
        value
    ) {
        const hiddenInput =
            document.getElementById(
                id
            );

        if (!hiddenInput) {
            return;
        }

        const root =
            hiddenInput.closest(
                "[data-date-picker]"
            );

        if (!root) {
            return;
        }

        const datePicker =
            root.datePicker;

        if (
            datePicker &&
            typeof datePicker.setValue ===
            "function"
        ) {
            datePicker.setValue(
                value || "",
                false
            );

            return;
        }

        hiddenInput.value =
            value ||
            "";

        hiddenInput.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles:
                        true
                }
            )
        );
    }

    async function loadThucDonNgayHopLe(
        dotBinhChonId = null
    ) {
        let url =
            API_THUC_DON_NGAY_HOP_LE;

        if (
            dotBinhChonId
        ) {
            url +=
                `?dotBinhChonId=${encodeURIComponent(
                    dotBinhChonId
                )}`;
        }

        const result =
            await window.MCS.api
                .request(
                    url
                );

        dsThucDonNgay =
            Array.isArray(
                result?.data
            )
                ? result.data
                : [];
    }

    function renderThucDonNgayOptions(
        selectedValue = ""
    ) {
        const select =
            document.getElementById(
                "thucDonNgayId"
            );

        if (!select) {
            return;
        }

        const selected =
            selectedValue ===
                null ||
            selectedValue ===
                undefined
                ? ""
                : String(
                    selectedValue
                );

        select.innerHTML =
            "";

        const emptyOption =
            document.createElement(
                "option"
            );

        emptyOption.value =
            "";

        emptyOption.textContent =
            "";

        select.appendChild(
            emptyOption
        );

        dsThucDonNgay.forEach(
            item => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    String(
                        item.id
                    );

                option.textContent =
                    buildThucDonNgayLabel(
                        item
                    );

                option.selected =
                    String(
                        item.id
                    ) ===
                    selected;

                select.appendChild(
                    option
                );
            }
        );

        select.value =
            selected;

        const smartSelect =
            getSmartSelect(
                select
            );

        smartSelect
            ?.refresh
            ?.();

        smartSelect
            ?.setValue
            ?.(
                selected,
                false
            );
    }

    function buildThucDonNgayLabel(
        item
    ) {
        return [
            formatDate(
                item?.ngay
            ),

            item?.tenThucDon,

            item?.tenNhaAn,

            item?.tenCaAn
        ]
            .filter(
                Boolean
            )
            .join(
                " - "
            );
    }

    function renderThongTinThucDon(
        thucDonNgayId
    ) {
        const root =
            document.querySelector(
                "[data-binh-chon-thuc-don-info]"
            );

        if (!root) {
            return;
        }

        const record =
            dsThucDonNgay.find(
                item =>
                    String(
                        item?.id
                    ) ===
                    String(
                        thucDonNgayId
                    )
            );

        root.hidden =
            !record;

        setText(
            "[data-binh-chon-ten-thuc-don]",
            record
                ? buildCodeName(
                    record.maThucDon,
                    record.tenThucDon
                )
                : "-"
        );

        setText(
            "[data-binh-chon-nha-an]",
            record
                ? buildCodeName(
                    record.maNhaAn,
                    record.tenNhaAn
                )
                : "-"
        );

        setText(
            "[data-binh-chon-ca-an]",
            record
                ? buildCodeName(
                    record.maCaAn,
                    record.tenCaAn
                )
                : "-"
        );

        setText(
            "[data-binh-chon-ngay]",
            record
                ? formatDate(
                    record.ngay
                )
                : "-"
        );
    }

    function renderThongKe(
        record
    ) {
        const root =
            document.querySelector(
                "[data-binh-chon-thong-ke]"
            );

        if (!root) {
            return;
        }

        root.hidden =
            !record?.id;

        setText(
            "[data-binh-chon-tong]",
            Number(
                record
                    ?.thongKe
                    ?.tongBinhChon ??
                record
                    ?.tongBinhChon ??
                0
            )
        );

        setText(
            "[data-binh-chon-co]",
            Number(
                record
                    ?.thongKe
                    ?.coThamGia ??
                record
                    ?.coThamGia ??
                0
            )
        );

        setText(
            "[data-binh-chon-khong]",
            Number(
                record
                    ?.thongKe
                    ?.khongThamGia ??
                record
                    ?.khongThamGia ??
                0
            )
        );
    }

    function mapBinhChonHienThi(
        record
    ) {
        if (!record) {
            return null;
        }

        return {
            ...record,

            ngayHienThi:
                formatDate(
                    record.ngay
                ),

            batDauHienThi:
                formatDateTime(
                    record.batDauBinhChon
                ),

            hanHienThi:
                formatDateTime(
                    record.hanBinhChon
                ),

            trangThaiHienThi:
                getTrangThaiLabel(
                    record
                )
        };
    }

    function getTrangThaiValue(
        record
    ) {
        const value =
            record
                ?.trangThai
                ?.value ??
            record
                ?.trangThai;

        const number =
            Number(
                value
            );

        return Number.isFinite(
            number
        )
            ? number
            : null;
    }

    function getTrangThaiLabel(
        record
    ) {
        if (
            record
                ?.trangThai
                ?.name
        ) {
            return record
                .trangThai
                .name;
        }

        const value =
            getTrangThaiValue(
                record
            );

        const item =
            dsTrangThai.find(
                current =>
                    Number(
                        current?.value
                    ) ===
                    value
            );

        return (
            item?.name ||
            "-"
        );
    }

    async function handleGui(
        record,
        catalogInstance
    ) {
        if (
            !record?.id
        ) {
            return;
        }

        const trangThai =
            getTrangThaiValue(
                record
            );

        if (
            ![
                10,
                30
            ].includes(
                trangThai
            )
        ) {
            window.MCS
                ?.toast
                ?.error(
                    "Chỉ được gửi đợt bình chọn ở trạng thái Tạo mới hoặc Đã hủy."
                );

            return;
        }

        window.MCS.confirm
            ?.show({
                title:
                    "Gửi đợt bình chọn",

                message:
                    "Bạn có chắc chắn muốn gửi đợt bình chọn này không?",

                confirmLabel:
                    "Gửi",

                type:
                    "primary",

                onConfirm:
                    async () => {
                        try {
                            const result =
                                await window.MCS.api
                                    .request(
                                        `${API_BASE}/gui/${record.id}`,
                                        {
                                            method:
                                                "PATCH"
                                        }
                                    );

                            window.MCS
                                ?.toast
                                ?.success(
                                    result?.message ||
                                    "Gửi đợt bình chọn thành công."
                                );

                            await catalogInstance
                                .load();

                            await catalogInstance
                                .openDetail(
                                    record.id
                                );
                        } catch (
                            error
                        ) {
                            console.error(
                                "Không thể gửi đợt bình chọn:",
                                error
                            );

                            window.MCS
                                ?.toast
                                ?.error(
                                    error?.message ||
                                    "Không thể gửi đợt bình chọn."
                                );
                        }
                    }
            });
    }

    async function handleHuy(
        record,
        catalogInstance
    ) {
        if (
            !record?.id
        ) {
            return;
        }

        if (
            getTrangThaiValue(
                record
            ) !==
            20
        ) {
            window.MCS
                ?.toast
                ?.error(
                    "Chỉ được hủy đợt bình chọn đã gửi."
                );

            return;
        }

        const field =
            document.getElementById(
                "lyDoHuy"
            );

        const lyDo =
            String(
                field?.value ||
                ""
            )
                .trim();

        if (!lyDo) {
            catalogInstance
                ?.form
                ?.setFieldError(
                    "lyDoHuy",
                    "Vui lòng nhập lý do trước khi hủy."
                );

            field?.focus();

            return;
        }

        if (
            lyDo.length >
            500
        ) {
            catalogInstance
                ?.form
                ?.setFieldError(
                    "lyDoHuy",
                    "Lý do hủy không được vượt quá 500 ký tự."
                );

            field?.focus();

            return;
        }

        catalogInstance
            ?.form
            ?.clearFieldError(
                "lyDoHuy"
            );

        window.MCS.confirm
            ?.show({
                title:
                    "Hủy gửi đợt bình chọn",

                message:
                    "Bạn có chắc chắn muốn hủy gửi đợt bình chọn này không?",

                confirmLabel:
                    "Hủy",

                type:
                    "danger",

                onConfirm:
                    async () => {
                        try {
                            const result =
                                await window.MCS.api
                                    .request(
                                        `${API_BASE}/huy/${record.id}`,
                                        {
                                            method:
                                                "PATCH",

                                            body:
                                                JSON.stringify({
                                                    lyDoHuy:
                                                        lyDo
                                                })
                                        }
                                    );

                            window.MCS
                                ?.toast
                                ?.success(
                                    result?.message ||
                                    "Hủy gửi đợt bình chọn thành công."
                                );

                            await catalogInstance
                                .load();

                            await catalogInstance
                                .openUpdate(
                                    record.id
                                );
                        } catch (
                            error
                        ) {
                            console.error(
                                "Không thể hủy gửi đợt bình chọn:",
                                error
                            );

                            if (
                                error?.data?.errors
                            ) {
                                catalogInstance
                                    ?.form
                                    ?.setErrors(
                                        error.data.errors
                                    );

                                return;
                            }

                            window.MCS
                                ?.toast
                                ?.error(
                                    error?.message ||
                                    "Không thể hủy gửi đợt bình chọn."
                                );
                        }
                    }
            });
    }

    function getNguoiLabel(
        value
    ) {
        if (!value) {
            return "";
        }

        return (
            value?.hoTen ||
            value
                ?.nhanVien
                ?.hoTen ||
            value?.tenDangNhap ||
            ""
        );
    }

    function getSmartSelect(
        select
    ) {
        if (!select) {
            return null;
        }

        const root =
            select.closest(
                "[data-smart-select]"
            );

        if (!root) {
            return null;
        }

        return (
            root.smartSelect ||
            window.MCS
                ?.smartSelect
                ?.initialize?.(
                    root
                ) ||
            null
        );
    }

    function buildCodeName(
        code,
        name
    ) {
        return [
            code,
            name
        ]
            .filter(
                Boolean
            )
            .join(
                " - "
            ) ||
            "-";
    }

    function setText(
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
            value ===
                null ||
            value ===
                undefined ||
            value ===
                ""
                ? "-"
                : String(
                    value
                );
    }

    function parseDate(
        value
    ) {
        if (!value) {
            return null;
        }

        const date =
            new Date(
                value
            );

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;
    }

    function formatDate(
        value
    ) {
        const date =
            parseDate(
                value
            );

        if (!date) {
            return "";
        }

        return new Intl
            .DateTimeFormat(
                "vi-VN",
                {
                    day:
                        "2-digit",

                    month:
                        "2-digit",

                    year:
                        "numeric"
                }
            )
            .format(
                date
            );
    }

    function formatDateTime(
        value
    ) {
        const date =
            parseDate(
                value
            );

        if (!date) {
            return "";
        }

        return new Intl
            .DateTimeFormat(
                "vi-VN",
                {
                    day:
                        "2-digit",

                    month:
                        "2-digit",

                    year:
                        "numeric",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit",

                    hour12:
                        false
                }
            )
            .format(
                date
            );
    }

    function toDateTimeLocal(
        value
    ) {
        const date =
            parseDate(
                value
            );

        if (!date) {
            return "";
        }

        const pad =
            number =>
                String(
                    number
                )
                    .padStart(
                        2,
                        "0"
                    );

        return (
            `${date.getFullYear()}-` +
            `${pad(
                date.getMonth() +
                1
            )}-` +
            `${pad(
                date.getDate()
            )}T` +
            `${pad(
                date.getHours()
            )}:` +
            `${pad(
                date.getMinutes()
            )}`
        );
    }

    function toIsoValue(
        value
    ) {
        if (!value) {
            return null;
        }

        const date =
            new Date(
                value
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return value;
        }

        return date.toISOString();
    }
});