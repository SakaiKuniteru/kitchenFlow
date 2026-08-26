"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const API_LOAI_CHINH_SACH =
            "/api/mcs/v1/enums?name=loaiChinhSach";

        const API_VOUCHER =
            "/api/mcs/v1/dm-voucher/tong-hop";

        const API_VAI_TRO =
            "/api/mcs/v1/dm-vai-tro/tong-hop";

        const API_CHUC_VU =
            "/api/mcs/v1/dm-chuc-vu/tong-hop";

        const API_TAI_KHOAN =
            "/api/mcs/v1/dm-tai-khoan/tong-hop";


        const LOAI_CHINH_SACH = {

            VAI_TRO:
                10,

            CHUC_VU:
                20,

            TAI_KHOAN:
                30

        };

        const PHAM_VI_CONFIG = {

            [LOAI_CHINH_SACH.VAI_TRO]: {
                api: API_VAI_TRO,
                getLabel: buildVaiTroLabel
            },

            [LOAI_CHINH_SACH.CHUC_VU]: {
                api: API_CHUC_VU,
                getLabel: buildChucVuLabel
            },

            [LOAI_CHINH_SACH.TAI_KHOAN]: {
                api: API_TAI_KHOAN,
                getLabel: buildTaiKhoanLabel
            }

        };

        let catalog =
            null;


        let dsLoaiChinhSach =
            [];


        let dsVoucher =
            [];


        /*
         * Cache để khi user đổi qua lại:
         *
         * Vai trò
         * -> Chức vụ
         * -> Vai trò
         *
         * không phải gọi lại API Vai trò.
         */
        const phamViCache =
            new Map();

        let dsPhamViHienTai = [];


        initialize();


        async function initialize() {

            /*
             * Chỉ load những dữ liệu luôn cần:
             *
             * - Enum loại chính sách
             * - Voucher
             *
             * Vai trò / chức vụ / tài khoản
             * chỉ gọi khi user chọn loại.
             */
            await Promise.all([
                loadLoaiChinhSach(),
                loadVoucher()
            ]);


            await initializeCatalog();


            renderLoaiChinhSach();

            renderVoucher();


            bindEvents();

            bindMucDoUuTienRules();


            await syncPhamViTheoLoai(
                null
            );

        }


        function requiredField(
            label,
            message =
                "Vui lòng điền vào trường này."
        ) {

            return {

                label,

                required:
                    true,

                requiredMessage:
                    message

            };

        }


        function requiredSelect(
            label
        ) {

            return requiredField(
                label,
                "Vui lòng chọn một mục trong danh sách."
            );

        }


        async function initializeCatalog() {

            try {

                catalog =
                    await window.MCS.pages
                        .createCatalogPage({

                            moduleName:
                                "chinh-sach",

                            detailTitle:
                                "Thông tin chính sách",

                            createTitle:
                                "Thêm chính sách",

                            updateTitle:
                                "Cập nhật chính sách",


                            columns: [

                                {
                                    key:
                                        "maChinhSach",

                                    label:
                                        "Mã chính sách",

                                    sortable:
                                        true,

                                    filterable:
                                        true
                                },


                                {
                                    key:
                                        "tenChinhSach",

                                    label:
                                        "Tên chính sách",

                                    sortable:
                                        true,

                                    filterable:
                                        true
                                },


                                {
                                    key:
                                        "loaiChinhSach",

                                    label:
                                        "Loại chính sách",

                                    sortable:
                                        true,

                                    filterable:
                                        true,

                                    className:
                                        "catalog-table__cell--center",

                                    render(
                                        value
                                    ) {

                                        return getLoaiChinhSachLabel(
                                            value
                                        );

                                    }
                                },


                                {
                                    key:
                                        "mucDoUuTien",

                                    label:
                                        "Mức độ ưu tiên",

                                    sortable:
                                        true,

                                    type:
                                        "number",

                                    className:
                                        "catalog-table__cell--center"
                                },


                                {
                                    key:
                                        "moTa",

                                    label:
                                        "Mô tả",

                                    filterable:
                                        true
                                },


                                {
                                    key:
                                        "active",

                                    label:
                                        "Trạng thái",

                                    sortable:
                                        true,

                                    className:
                                        "catalog-table__cell--center",

                                    render:
                                        window.createStatusBadge
                                }

                            ],


                            defaultValues: {

                                maChinhSach:
                                    "",

                                tenChinhSach:
                                    "",

                                loaiChinhSach:
                                    "",

                                voucherIds:
                                    [],

                                doiTuongApDungIds:
                                    [],

                                mucDoUuTien:
                                    "",

                                moTa:
                                    "",

                                active:
                                    true

                            },


                            /*
                             * ====================================
                             * VALIDATION CHUNG
                             * ====================================
                             *
                             * Không tự viết div/span lỗi.
                             *
                             * createCatalogPage xử lý
                             * giống thuc-pham / voucher.
                             */
                            validation: {

                                maChinhSach: {

                                    ...requiredField(
                                        "Mã chính sách"
                                    ),

                                    maxLength:
                                        50,

                                    unique:
                                        true,

                                    maxLengthMessage:
                                        "Mã chính sách không được vượt quá 50 ký tự.",

                                    uniqueMessage:
                                        "Mã chính sách đã tồn tại."

                                },


                                tenChinhSach: {

                                    ...requiredField(
                                        "Tên chính sách"
                                    ),

                                    maxLength:
                                        255,

                                    maxLengthMessage:
                                        "Tên chính sách không được vượt quá 255 ký tự."

                                },


                                loaiChinhSach: {

                                    ...requiredSelect(
                                        "Loại chính sách"
                                    )

                                },


                                /*
                                 * Multi-select:
                                 *
                                 * vẫn khai báo field ở đây để
                                 * validation chung biết vị trí
                                 * hiển thị lỗi.
                                 */
                                voucherIds: {

                                    label:
                                        "Voucher áp dụng"

                                },


                                doiTuongApDungIds: {

                                    label:
                                        "Đối tượng áp dụng"

                                },


                                mucDoUuTien: {

                                    ...requiredField(
                                        "Mức độ ưu tiên"
                                    ),

                                    min:
                                        1,

                                    minMessage:
                                        "Mức độ ưu tiên phải lớn hơn 0."

                                },


                                moTa: {

                                    label:
                                        "Mô tả",

                                    maxLength:
                                        500,

                                    maxLengthMessage:
                                        "Mô tả không được vượt quá 500 ký tự."

                                }

                            },


                            /*
                             * ====================================
                             * VALIDATION NGHIỆP VỤ
                             * ====================================
                             */
                            validate(
                                formData
                            ) {

                                const errors =
                                    {};


                                const loaiChinhSach =
                                    toNullableNumber(
                                        formData.loaiChinhSach
                                    );


                                const mucDoUuTien =
                                    getNumberFieldValue(
                                        "mucDoUuTien",
                                        formData.mucDoUuTien
                                    );

                                const voucherIds =
                                    getSelectedValues(
                                        "voucherIds",
                                        dsVoucher
                                    );


                                const doiTuongIds =
                                    getSelectedValues(
                                        "doiTuongApDungIds",
                                        dsPhamViHienTai
                                    );
                                    
                                if (
                                    loaiChinhSach !==
                                    null
                                ) {

                                    const exists =
                                        dsLoaiChinhSach
                                            .some(
                                                item =>
                                                    Number(
                                                        item.value
                                                    ) ===
                                                    loaiChinhSach
                                            );


                                    if (!exists) {

                                        errors.loaiChinhSach =
                                            "Loại chính sách không hợp lệ.";

                                    }

                                }


                                /*
                                 * Phải chọn ít nhất 1 voucher.
                                 */
                                if (
                                    voucherIds.length ===
                                    0
                                ) {

                                    errors.voucherIds =
                                        "Vui lòng chọn ít nhất một voucher.";

                                }


                                /*
                                 * Sau khi đã chọn loại
                                 * thì phải chọn đối tượng áp dụng.
                                 */
                                if (
                                    loaiChinhSach !==
                                    null &&
                                    doiTuongIds.length ===
                                    0
                                ) {

                                    errors.doiTuongApDungIds =
                                        "Vui lòng chọn ít nhất một đối tượng áp dụng.";

                                }


                                /*
                                 * Mức độ ưu tiên:
                                 *
                                 * > 0
                                 * số nguyên.
                                 */
                                if (
                                    mucDoUuTien !==
                                    null
                                ) {

                                    if (
                                        !Number.isInteger(
                                            mucDoUuTien
                                        )
                                    ) {

                                        errors.mucDoUuTien =
                                            "Mức độ ưu tiên phải là số nguyên.";

                                    } else if (
                                        mucDoUuTien <=
                                        0
                                    ) {

                                        errors.mucDoUuTien =
                                            "Mức độ ưu tiên phải lớn hơn 0.";

                                    }

                                }


                                return errors;

                            },


                            mapListResponse(
                                result
                            ) {

                                return Array.isArray(
                                    result?.data
                                )
                                    ? result.data
                                    : (
                                        result
                                            ?.data
                                            ?.items ||

                                        result
                                            ?.data
                                            ?.data ||

                                        []
                                    );

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

                                const loaiChinhSach =
                                    toNullableNumber(
                                        record?.loaiChinhSach
                                    );


                                const voucherIds =
                                    getRecordVoucherIds(
                                        record
                                    );


                                const doiTuongIds =
                                    getRecordDoiTuongIds(
                                        record,
                                        loaiChinhSach
                                    );


                                /*
                                 * Sau khi factory đổ dữ liệu
                                 * cơ bản xong thì sync
                                 * SmartSelect / NumberInput.
                                 */
                                window.setTimeout(
                                    async () => {

                                        renderLoaiChinhSach(
                                            loaiChinhSach ??
                                            ""
                                        );


                                        renderVoucher(
                                            voucherIds
                                        );


                                        await syncPhamViTheoLoai(
                                            loaiChinhSach,
                                            doiTuongIds
                                        );


                                        syncNumberField(
                                            "mucDoUuTien",
                                            record?.mucDoUuTien ??
                                            ""
                                        );

                                    },
                                    0
                                );


                                return {

                                    id:
                                        record?.id ??
                                        "",

                                    maChinhSach:
                                        record?.maChinhSach ||
                                        "",

                                    tenChinhSach:
                                        record?.tenChinhSach ||
                                        "",

                                    loaiChinhSach:
                                        loaiChinhSach ??
                                        "",

                                    voucherIds,

                                    doiTuongApDungIds:
                                        doiTuongIds,

                                    mucDoUuTien:
                                        record?.mucDoUuTien ??
                                        "",

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

                                const loaiChinhSach =
                                    toNullableNumber(
                                        formData.loaiChinhSach
                                    );

                            const voucherIds =
                                getSelectedValues(
                                    "voucherIds",
                                    dsVoucher
                                );


                            const doiTuongIds =
                                getSelectedValues(
                                    "doiTuongApDungIds",
                                    dsPhamViHienTai
                                );

                                const payload = {

                                    maChinhSach:
                                        String(
                                            formData.maChinhSach ||
                                            ""
                                        )
                                            .trim()
                                            .toUpperCase(),

                                    tenChinhSach:
                                        String(
                                            formData.tenChinhSach ||
                                            ""
                                        )
                                            .trim(),

                                    loaiChinhSach,

                                    /*
                                     * Nhiều voucher.
                                     */
                                    dsVoucherId:
                                        voucherIds,

                                    mucDoUuTien:
                                        Math.trunc(
                                            getNumberFieldValue(
                                                "mucDoUuTien",
                                                formData.mucDoUuTien
                                            ) ??
                                            0
                                        ),

                                    moTa:
                                        normalizeNullableText(
                                            formData.moTa
                                        ),

                                    /*
                                     * Luôn gửi đủ 3 mảng.
                                     *
                                     * Loại nào không áp dụng
                                     * thì gửi [].
                                     */
                                    dsVaiTroId:
                                        [],

                                    dsChucVuId:
                                        [],

                                    dsTaiKhoanId:
                                        [],

                                    active:
                                        formData.active ===
                                        true

                                };


                                /*
                                 * =================================
                                 * MAP PHẠM VI THEO LOẠI
                                 * =================================
                                 */
                                switch (
                                    loaiChinhSach
                                ) {

                                    case LOAI_CHINH_SACH.VAI_TRO:

                                        payload.dsVaiTroId =
                                            doiTuongIds;

                                        break;


                                    case LOAI_CHINH_SACH.CHUC_VU:

                                        payload.dsChucVuId =
                                            doiTuongIds;

                                        break;


                                    case LOAI_CHINH_SACH.TAI_KHOAN:

                                        payload.dsTaiKhoanId =
                                            doiTuongIds;

                                        break;

                                }


                                return payload;

                            },

                            getRecordSubtitle(
                                record
                            ) {

                                return (
                                    record?.maChinhSach ||
                                    ""
                                );

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

            } catch (error) {

                console.error(
                    "Không thể khởi tạo danh mục chính sách.",
                    error
                );


                window.MCS?.toast?.error(
                    error?.message ||
                    "Không thể tải danh mục chính sách."
                );

            }

        }


        /*
         * ================================================
         * LOAD ENUM LOẠI CHÍNH SÁCH
         * ================================================
         */

        async function loadLoaiChinhSach() {

            try {

                const response =
                    await window.MCS.api.request(
                        API_LOAI_CHINH_SACH
                    );


                dsLoaiChinhSach =
                    normalizeEnumData(
                        response?.data ??
                        response
                    );

            } catch (error) {

                dsLoaiChinhSach =
                    [];


                console.error(
                    "Không thể tải loại chính sách.",
                    error
                );


                window.MCS?.toast?.error(
                    error?.message ||
                    "Không thể tải loại chính sách."
                );

            }

        }


        /*
         * ================================================
         * LOAD VOUCHER
         * ================================================
         */

        async function loadVoucher() {

            try {

                const response =
                    await window.MCS.api.request(
                        API_VOUCHER
                    );


                dsVoucher =
                    normalizeList(
                        response?.data ??
                        response
                    )
                        .filter(
                            item =>
                                item?.active !==
                                false
                        );

            } catch (error) {

                dsVoucher =
                    [];


                console.error(
                    "Không thể tải voucher.",
                    error
                );


                window.MCS?.toast?.error(
                    error?.message ||
                    "Không thể tải danh sách voucher."
                );

            }

        }


        /*
         * ================================================
         * LOẠI CHÍNH SÁCH CHANGE
         * ================================================
         */

        function bindEvents() {

            const loaiChinhSach =
                document.getElementById(
                    "loaiChinhSach"
                );


            loaiChinhSach
                ?.addEventListener(
                    "change",
                    async event => {

                        /*
                         * Khi đổi loại:
                         *
                         * xóa toàn bộ lựa chọn
                         * của loại cũ.
                         */
                        await syncPhamViTheoLoai(
                            event.target.value,
                            []
                        );

                    }
                );

        }


        /*
         * ================================================
         * LOAD PHẠM VI THEO LOẠI
         * ================================================
         */

        async function syncPhamViTheoLoai(
            loaiValue,
            selectedValues = []
        ) {

            const loai =
                toNullableNumber(
                    loaiValue
                );


            const select =
                document.getElementById(
                    "doiTuongApDungIds"
                );


            if (!select) {

                return;

            }


            /*
             * Chưa chọn loại.
             */
            if (
                loai ===
                null
            ) {
                dsPhamViHienTai = [];
                renderMultipleSelect(
                    "doiTuongApDungIds",
                    [],
                    item =>
                        item.id,
                    item =>
                        String(
                            item.id
                        ),
                    []
                );


                setSelectState(
                    "doiTuongApDungIds",
                    true,
                    "Chọn loại chính sách trước"
                );


                return;

            }


            const config =
                PHAM_VI_CONFIG[
                    loai
                ];


            if (!config) {
                dsPhamViHienTai = [];

                renderMultipleSelect(
                    "doiTuongApDungIds",
                    [],
                    item =>
                        item.id,
                    item =>
                        String(
                            item.id
                        ),
                    []
                );


                setSelectState(
                    "doiTuongApDungIds",
                    true,
                    "Loại chính sách không hợp lệ"
                );


                return;

            }


            /*
             * Khóa trong lúc load.
             */
            setSelectState(
                "doiTuongApDungIds",
                true,
                "Đang tải dữ liệu..."
            );


            try {

                const items =
                    await loadPhamVi(
                        loai,
                        config.api
                    );


                dsPhamViHienTai =
                    items;


                renderMultipleSelect(
                    "doiTuongApDungIds",
                    items,

                    item =>
                        item.id,

                    config.getLabel,

                    selectedValues
                );

                setSelectState(
                    "doiTuongApDungIds",
                    false,
                    "Chọn đối tượng áp dụng..."
                );

            } catch (error) {
                dsPhamViHienTai = [];

                renderMultipleSelect(
                    "doiTuongApDungIds",
                    [],
                    item =>
                        item.id,
                    item =>
                        String(
                            item.id
                        ),
                    []
                );


                setSelectState(
                    "doiTuongApDungIds",
                    true,
                    "Không thể tải dữ liệu"
                );


                console.error(
                    "Không thể tải phạm vi áp dụng.",
                    error
                );


                window.MCS?.toast?.error(
                    error?.message ||
                    "Không thể tải phạm vi áp dụng."
                );

            }

        }


        async function loadPhamVi(
            loai,
            api
        ) {

            /*
             * Đã load trước đó
             * thì sử dụng cache.
             */
            if (
                phamViCache.has(
                    loai
                )
            ) {

                return phamViCache.get(
                    loai
                );

            }


            const response =
                await window.MCS.api.request(
                    api
                );


            const items =
                normalizeList(
                    response?.data ??
                    response
                )
                    .filter(
                        item =>
                            item?.active !==
                            false
                    );


            phamViCache.set(
                loai,
                items
            );


            return items;

        }


        /*
         * ================================================
         * RENDER LOẠI CHÍNH SÁCH
         * ================================================
         */

        function renderLoaiChinhSach(
            selectedValue = ""
        ) {

            renderSingleSelect(
                "loaiChinhSach",
                dsLoaiChinhSach,

                item =>
                    item.value,

                item =>
                    item.label,

                selectedValue
            );

        }


        /*
         * ================================================
         * RENDER VOUCHER
         * ================================================
         */

        function renderVoucher(
            selectedValues = []
        ) {

            renderMultipleSelect(
                "voucherIds",
                dsVoucher,

                item =>
                    item.id,

                buildVoucherLabel,

                selectedValues
            );

        }


        /*
         * ================================================
         * SINGLE SELECT
         * ================================================
         */

        function renderSingleSelect(
            selectId,
            items,
            getValue,
            getLabel,
            selectedValue = ""
        ) {

            const select =
                document.getElementById(
                    selectId
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

            emptyOption.selected =
                selected ===
                "";


            select.appendChild(
                emptyOption
            );


            items.forEach(
                item => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    const value =
                        String(
                            getValue(
                                item
                            )
                        );


                    option.value =
                        value;


                    option.textContent =
                        getLabel(
                            item
                        );


                    option.selected =
                        value ===
                        selected;


                    select.appendChild(
                        option
                    );

                }
            );


            select.value =
                selected;


            refreshSmartSelect(
                select
            );

        }

        function renderMultipleSelect(
            selectId,
            items,
            getValue,
            getLabel,
            selectedValues = []
        ) {

            const select =
                document.getElementById(
                    selectId
                );


            if (!select) {

                return;

            }


            const selectedSet =
                new Set(
                    normalizeIdArray(
                        selectedValues
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


            /*
            * =========================================
            * TẤT CẢ
            * =========================================
            *
            * Làm giống hệt module Quyền.
            */
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


            /*
            * =========================================
            * CÁC OPTION THẬT
            * =========================================
            */
            items.forEach(
                item => {

                    const value =
                        String(
                            getValue(
                                item
                            )
                        );


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        value;


                    option.textContent =
                        getLabel(
                            item
                        );


                    option.selected =
                        selectedSet.has(
                            value
                        );


                    select.appendChild(
                        option
                    );

                }
            );


            const smartSelect =
                refreshSmartSelect(
                    select
                );


            smartSelect
                ?.setValue?.(
                    Array.from(
                        selectedSet
                    ),
                    false
                );

        }

        function setSelectState(
            selectId,
            disabled,
            placeholder
        ) {

            const select =
                document.getElementById(
                    selectId
                );

            if (!select) {
                return;
            }


            select.disabled =
                disabled;


            const root =
                select.closest(
                    "[data-smart-select]"
                );


            /*
            * Cập nhật placeholder trên DOM.
            */
            if (
                placeholder !== undefined
            ) {

                select.dataset.placeholder =
                    placeholder;

                if (root) {

                    root.dataset.placeholder =
                        placeholder;

                }

            }


            const smartSelect =
                root?.smartSelect ||
                window.MCS
                    ?.smartSelect
                    ?.initialize?.(
                        root
                    );


            /*
            * Enable / disable component.
            */
            smartSelect
                ?.setDisabled?.(
                    disabled
                );


            /*
            * Refresh options trước.
            */
            smartSelect
                ?.refresh?.();


            /*
            * Không có giá trị đang chọn thì
            * ép text hiển thị về placeholder mới.
            */
            const hasSelectedValue =
                Array.from(
                    select.selectedOptions ||
                    []
                )
                    .some(
                        option =>
                            option.value &&
                            option.value !== "__ALL__"
                    );


            if (
                !hasSelectedValue &&
                placeholder
            ) {

                const display =
                    root?.querySelector(
                        ".smart-select__value, .smart-select__placeholder, [data-smart-select-value]"
                    );


                if (display) {

                    display.textContent =
                        placeholder;

                }

            }

        }

        function refreshSmartSelect(
            select
        ) {

            const root =
                select?.closest(
                    "[data-smart-select]"
                );


            if (!root) {

                return null;

            }


            const smartSelect =
                root.smartSelect ||

                window.MCS
                    ?.smartSelect
                    ?.initialize?.(
                        root
                    );


            smartSelect
                ?.refresh?.();


            return smartSelect;

        }


        /*
         * ================================================
         * MỨC ĐỘ ƯU TIÊN
         * ================================================
         */

        function bindMucDoUuTienRules() {

            const input =
                document.getElementById(
                    "mucDoUuTien"
                );


            if (
                !input ||
                input.dataset
                    .mucDoUuTienBound ===
                    "true"
            ) {

                return;

            }


            input.dataset
                .mucDoUuTienBound =
                "true";


            input.inputMode =
                "numeric";


            /*
             * Không cho nhập:
             *
             * 1,2
             * 1.2
             * -1
             * +1
             * 1e2
             */
            input.addEventListener(
                "keydown",
                event => {

                    if (
                        [
                            ".",
                            ",",
                            "-",
                            "+",
                            "e",
                            "E"
                        ].includes(
                            event.key
                        )
                    ) {

                        event.preventDefault();

                    }

                }
            );


            let syncing =
                false;


            input.addEventListener(
                "input",
                () => {

                    if (syncing) {

                        return;

                    }


                    const value =
                        getNumberFieldValue(
                            "mucDoUuTien"
                        );


                    if (
                        value ===
                        null
                    ) {

                        return;

                    }


                    const number =
                        Math.max(
                            0,
                            Math.trunc(
                                value
                            )
                        );


                    /*
                     * Bỏ số 0 phía trước:
                     *
                     * 01 -> 1
                     * 0012 -> 12
                     *
                     * 0 vẫn để 0 để validation
                     * báo "phải lớn hơn 0".
                     */
                    const raw =
                        String(
                            input.value ??
                            ""
                        )
                            .replace(
                                /\./g,
                                ""
                            )
                            .trim();


                    const leadingZero =
                        /^0\d+/.test(
                            raw
                        );


                    const needSync =
                        !Number.isInteger(
                            value
                        ) ||
                        value <
                            0 ||
                        leadingZero;


                    if (!needSync) {

                        return;

                    }


                    syncing =
                        true;


                    setNumberInputValue(
                        input,
                        number
                    );


                    syncing =
                        false;

                }
            );


            input.addEventListener(
                "blur",
                () => {

                    const value =
                        getNumberFieldValue(
                            "mucDoUuTien"
                        );


                    if (
                        value ===
                        null
                    ) {

                        return;

                    }


                    setNumberInputValue(
                        input,
                        Math.max(
                            0,
                            Math.trunc(
                                value
                            )
                        )
                    );

                }
            );

        }


        /*
         * ================================================
         * NUMBER INPUT CHUNG
         * ================================================
         */

        function getNumberInput(
            input
        ) {

            if (!input) {

                return null;

            }


            return (

                input.numberInput ||

                window.MCS
                    ?.numberInput
                    ?.initialize?.(
                        input
                    ) ||

                null

            );

        }


        function getNumberFieldValue(
            inputId,
            fallbackValue = null
        ) {

            const input =
                document.getElementById(
                    inputId
                );


            if (!input) {

                return toNullableNumber(
                    fallbackValue
                );

            }


            const numberInput =
                getNumberInput(
                    input
                );


            const value =
                numberInput?.getValue
                    ? numberInput.getValue()
                    : input.value;


            return toNullableNumber(
                value
            );

        }


        function setNumberInputValue(
            input,
            value
        ) {

            if (!input) {

                return;

            }


            const numberInput =
                getNumberInput(
                    input
                );


            if (
                numberInput?.setValue
            ) {

                numberInput.setValue(
                    value
                );

                return;

            }


            input.value =
                value === null ||
                value === undefined
                    ? ""
                    : String(
                        value
                    );

        }


        function syncNumberField(
            inputId,
            value
        ) {

            const input =
                document.getElementById(
                    inputId
                );


            if (!input) {

                return;

            }


            setNumberInputValue(
                input,
                value
            );

        }

        function getSelectedValues(
            selectId,
            items = []
        ) {

            const select =
                document.getElementById(
                    selectId
                );


            if (!select) {

                return [];

            }


            const selectedOptions =
                Array.from(
                    select.selectedOptions ||
                    []
                );


            /*
            * =========================================
            * CHỌN TẤT CẢ
            * =========================================
            */
            const selectedAll =
                selectedOptions.some(
                    option =>
                        option.value ===
                        "__ALL__"
                );


            if (
                selectedAll
            ) {

                return items
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

        function buildVoucherLabel(
            item
        ) {

            return buildLabel(
                item?.maVoucher,
                item?.tenVoucher
            );

        }


        function buildVaiTroLabel(
            item
        ) {

            return buildLabel(
                item?.maVaiTro,
                item?.tenVaiTro ??
                item?.ten
            );

        }


        function buildChucVuLabel(
            item
        ) {

            return buildLabel(
                item?.maChucVu,
                item?.tenChucVu ??
                item?.ten
            );

        }

        function buildTaiKhoanLabel(
            item
        ) {

            return buildLabel(
                item?.tenDangNhap,

                item?.nhanVien?.hoTen ??
                item?.hoTenNhanVien ??
                item?.hoTen ??
                item?.tenNhanVien
            );

        }

        function buildLabel(
            ma,
            ten
        ) {

            return [
                ma,
                ten
            ]
                .filter(
                    Boolean
                )
                .join(
                    " - "
                ) ||
                "-";

        }


        /*
         * ================================================
         * ENUM
         * ================================================
         */

        function normalizeEnumData(
            value
        ) {

            return normalizeList(
                value
            )
                .map(
                    item => ({

                        value:
                            item?.value,

                        label:
                            item?.label ??
                            item?.name ??
                            item?.ten ??
                            String(
                                item?.value ??
                                ""
                            )

                    })
                );

        }


        function getLoaiChinhSachLabel(
            value
        ) {

            const item =
                dsLoaiChinhSach.find(
                    current =>
                        Number(
                            current.value
                        ) ===
                        Number(
                            value
                        )
                );


            return (
                item?.label ||
                "-"
            );

        }


        /*
         * ================================================
         * DETAIL IDS
         * ================================================
         */

        function getRecordVoucherIds(
            record
        ) {

            return normalizeRecordIds(
                record?.dsVoucherId ??
                record?.voucherIds ??
                record?.dsVoucher ??
                record?.vouchers ??
                (
                    record?.voucherId
                        ? [
                            record.voucherId
                        ]
                        : []
                ),
                [
                    "voucherId",
                    "id"
                ]
            );

        }


        function getRecordDoiTuongIds(
            record,
            loai
        ) {

            switch (
                loai
            ) {

                case LOAI_CHINH_SACH.VAI_TRO:

                    return normalizeRecordIds(
                        record?.dsVaiTroId ??
                        record?.dsVaiTro ??
                        record?.vaiTro ??
                        [],
                        [
                            "vaiTroId",
                            "id"
                        ]
                    );


                case LOAI_CHINH_SACH.CHUC_VU:

                    return normalizeRecordIds(
                        record?.dsChucVuId ??
                        record?.dsChucVu ??
                        record?.chucVu ??
                        [],
                        [
                            "chucVuId",
                            "id"
                        ]
                    );


                case LOAI_CHINH_SACH.TAI_KHOAN:

                    return normalizeRecordIds(
                        record?.dsTaiKhoanId ??
                        record?.dsTaiKhoan ??
                        record?.taiKhoan ??
                        [],
                        [
                            "taiKhoanId",
                            "id"
                        ]
                    );


                default:

                    return [];

            }

        }


        function normalizeRecordIds(
            value,
            idKeys = [
                "id"
            ]
        ) {

            const list =
                Array.isArray(
                    value
                )
                    ? value
                    : (
                        value === null ||
                        value === undefined ||
                        value === ""
                            ? []
                            : [
                                value
                            ]
                    );


            return list
                .map(
                    item => {

                        if (
                            typeof item !==
                            "object"
                        ) {

                            return Number(
                                item
                            );

                        }


                        for (
                            const key
                            of idKeys
                        ) {

                            if (
                                item?.[key] !==
                                undefined
                            ) {

                                return Number(
                                    item[key]
                                );

                            }

                        }


                        return null;

                    }
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


        function normalizeIdArray(
            value
        ) {

            return normalizeRecordIds(
                value,
                [
                    "id"
                ]
            );

        }


        /*
         * ================================================
         * HELPERS
         * ================================================
         */

        function normalizeList(
            value
        ) {

            if (
                Array.isArray(
                    value
                )
            ) {

                return value;

            }


            if (
                Array.isArray(
                    value?.items
                )
            ) {

                return value.items;

            }


            if (
                Array.isArray(
                    value?.rows
                )
            ) {

                return value.rows;

            }


            if (
                Array.isArray(
                    value?.data
                )
            ) {

                return value.data;

            }


            if (
                Array.isArray(
                    value?.danhSach
                )
            ) {

                return value.danhSach;

            }


            return [];

        }


        function toNullableNumber(
            value
        ) {

            if (
                value === null ||
                value === undefined ||
                String(
                    value
                ).trim() ===
                ""
            ) {

                return null;

            }


            const normalized =
                String(
                    value
                )
                    .trim()
                    .replace(
                        /\./g,
                        ""
                    )
                    .replace(
                        /,/g,
                        "."
                    );


            const number =
                Number(
                    normalized
                );


            return Number.isFinite(
                number
            )
                ? number
                : null;

        }


        function normalizeNullableText(
            value
        ) {

            const text =
                String(
                    value ??
                    ""
                ).trim();


            return (
                text ||
                null
            );

        }

    }
);