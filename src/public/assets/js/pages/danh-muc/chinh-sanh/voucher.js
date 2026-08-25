"use strict";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const API_BASE =
            "/api/mcs/v1/dm-voucher";

        const LOAI_MIEN_GIAM_API =
            "/api/mcs/v1/enums?name=loaiMienGiam";

        const SO_CHU_SO_SAU_DAU_PHAY_API =
            "/api/mcs/v1/thiet-lap/gia-tri?ma=SO_CHU_SO_SAU_DAU_PHAY";

        const QUY_TAC_LAM_TRON_API =
            "/api/mcs/v1/thiet-lap/gia-tri?ma=QUY_TAC_LAM_TRON";


        const LOAI_MIEN_GIAM = {
            PHAN_TRAM: 10,
            SO_TIEN: 20
        };


        let catalog = null;
        let dsVoucher = [];
        let dsLoaiMienGiam = [];
        let soChuSoSauDauPhay = 2;
        let quyTacLamTron = 0;


        initialize();


        async function initialize() {

            try {

                await loadCauHinh();

                await loadDanhSachVoucher();

                await initializeCatalog();

                bindLoaiMienGiamEvents();

                syncGiaTriField();

            } catch (error) {

                console.error(
                    "Không thể khởi tạo danh mục voucher.",
                    error
                );

                window.MCS?.toast?.error(
                    error?.message ||
                    "Không thể tải danh mục voucher."
                );

            }

        }

        async function loadCauHinh() {

            try {

                const [
                    loaiMienGiamResponse,
                    soChuSoResponse,
                    quyTacResponse
                ] =
                    await Promise.all([

                        window.MCS.api.request(
                            LOAI_MIEN_GIAM_API
                        ),

                        window.MCS.api.request(
                            SO_CHU_SO_SAU_DAU_PHAY_API
                        ),

                        window.MCS.api.request(
                            QUY_TAC_LAM_TRON_API
                        )

                    ]);


                dsLoaiMienGiam =
                    normalizeList(
                        loaiMienGiamResponse?.data ??
                        loaiMienGiamResponse
                    );


                const soChuSo =
                    Number(
                        soChuSoResponse?.data?.giaTri ??
                        soChuSoResponse?.giaTri ??
                        soChuSoResponse?.data
                    );


                if (
                    Number.isInteger(soChuSo) &&
                    soChuSo >= 0 &&
                    soChuSo <= 5
                ) {

                    soChuSoSauDauPhay =
                        soChuSo;

                } else {

                    soChuSoSauDauPhay =
                        2;

                }


                const quyTac =
                    Number(
                        quyTacResponse?.data?.giaTri ??
                        quyTacResponse?.giaTri ??
                        quyTacResponse?.data
                    );


                quyTacLamTron =
                    [
                        0,
                        1,
                        2
                    ].includes(
                        quyTac
                    )
                        ? quyTac
                        : 0;


                renderLoaiMienGiam();


            } catch (error) {

                console.error(
                    "Không thể tải thiết lập voucher.",
                    error
                );

                dsLoaiMienGiam = [];

                soChuSoSauDauPhay = 2;

                quyTacLamTron = 0;

                throw error;

            }

        }

        async function loadDanhSachVoucher() {

            const response = await window.MCS.api.request(
                API_BASE
            );

            dsVoucher = normalizeList(
                response?.data ??
                response
            );

        }

        async function initializeCatalog() {

            catalog =
                await window.MCS
                    .pages
                    .createCatalogPage({

                        moduleName:
                            "voucher",


                        columns: [

                            {
                                key:
                                    "maVoucher",

                                label:
                                    "Mã voucher",

                                width:
                                    "160px",

                                sortable:
                                    true,

                                filterable:
                                    true
                            },


                            {
                                key:
                                    "tenVoucher",

                                label:
                                    "Tên voucher",

                                width:
                                    "240px",

                                sortable:
                                    true,

                                filterable:
                                    true
                            },


                            {
                                key:
                                    "loaiMienGiam",

                                label:
                                    "Loại miễn giảm",

                                width:
                                    "160px",

                                sortable:
                                    true,

                                render:
                                    value =>
                                        getLoaiMienGiamLabel(
                                            value
                                        )
                            },


                            {
                                key:
                                    "giaTri",

                                label:
                                    "Giá trị",

                                width:
                                    "160px",

                                sortable:
                                    true,

                                render:
                                    (
                                        value,
                                        record
                                    ) =>
                                        formatGiaTri(
                                            value,
                                            record?.loaiMienGiam
                                        )
                            },


                            {
                                key:
                                    "soLuong",

                                label:
                                    "Số lượng",

                                width:
                                    "120px",

                                sortable:
                                    true,

                                type:
                                    "number"
                            },


                            {
                                key:
                                    "daSuDung",

                                label:
                                    "Đã sử dụng",

                                width:
                                    "120px",

                                sortable:
                                    true,

                                type:
                                    "number"
                            },


                            {
                                key:
                                    "thoiGianBatDau",

                                label:
                                    "Thời gian bắt đầu",

                                width:
                                    "170px",

                                sortable:
                                    true,

                                type:
                                    "date"
                            },


                            {
                                key:
                                    "thoiGianKetThuc",

                                label:
                                    "Thời gian kết thúc",

                                width:
                                    "170px",

                                sortable:
                                    true,

                                type:
                                    "date"
                            },


                            {
                                key:
                                    "active",

                                label:
                                    "Trạng thái",

                                width:
                                    "130px",

                                sortable:
                                    true,

                                className:
                                    "catalog-table__cell--center",

                                render:
                                    window.createStatusBadge
                            }

                        ],


                        defaultValues: {

                            maVoucher:
                                "",

                            tenVoucher:
                                "",

                            loaiMienGiam:
                                "",

                            giaTri:
                                null,

                            soLuong:
                                null,

                            daSuDung:
                                0,

                            thoiGianBatDau:
                                "",

                            thoiGianKetThuc:
                                "",

                            moTa:
                                "",

                            active:
                                true

                        },


                        validation: {

                            maVoucher: {

                                label:
                                    "Mã voucher",

                                required:
                                    true,

                                maxLength:
                                    50,

                                unique:
                                    true,

                                requiredMessage:
                                    "Vui lòng điền vào trường này.",

                                maxLengthMessage:
                                    "Mã voucher không được vượt quá 50 ký tự.",

                                uniqueMessage:
                                    "Mã voucher đã tồn tại."

                            },


                            tenVoucher: {

                                label:
                                    "Tên voucher",

                                required:
                                    true,

                                maxLength:
                                    255,

                                unique:
                                    true,

                                requiredMessage:
                                    "Vui lòng điền vào trường này.",

                                maxLengthMessage:
                                    "Tên voucher không được vượt quá 255 ký tự.",

                                uniqueMessage:
                                    "Tên voucher đã tồn tại."

                            },


                            loaiMienGiam: {

                                label:
                                    "Loại miễn giảm",

                                required:
                                    true,

                                requiredMessage:
                                    "Vui lòng chọn một mục trong danh sách."

                            },


                            giaTri: {

                                label:
                                    "Giá trị voucher",

                                required:
                                    true,

                                requiredMessage:
                                    "Vui lòng điền vào trường này."

                            },


                            soLuong: {

                                label:
                                    "Số lượng",

                                min:
                                    0

                            },


                            daSuDung: {

                                label:
                                    "Đã sử dụng",

                                min:
                                    0

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

                        validate(
                            formData,
                            form,
                            catalogInstance
                        ) {

                            const errors = {};

                            const id =
                                formData.id ??
                                form?.dataset?.id ??
                                "";

                            const maVoucher =
                                String(
                                    formData.maVoucher ??
                                    ""
                                )
                                    .trim()
                                    .toUpperCase();

                            const tenVoucher =
                                String(
                                    formData.tenVoucher ??
                                    ""
                                ).trim();

                            const loaiMienGiam =
                                normalizeNumber(
                                    formData.loaiMienGiam
                                );

                            const giaTri =
                                normalizeNumber(
                                    formData.giaTri
                                );

                            const soLuong =
                                normalizeNumber(
                                    formData.soLuong
                                );

                            const daSuDung =
                                normalizeNumber(
                                    formData.daSuDung
                                );

                            const batDau =
                                normalizeDate(
                                    formData.thoiGianBatDau
                                );

                            const ketThuc =
                                normalizeDate(
                                    formData.thoiGianKetThuc
                                );

                            if (!maVoucher) {

                                errors.maVoucher =
                                    "Vui lòng điền vào trường này.";

                            } else if (maVoucher.length > 50) {

                                errors.maVoucher =
                                    "Mã voucher không được vượt quá 50 ký tự.";

                            } else {

                                const voucherTrung =
                                    dsVoucher.find(
                                        item => {

                                            const itemId =
                                                item?.id ??
                                                "";

                                            const itemMa =
                                                String(
                                                    item?.maVoucher ??
                                                    ""
                                                )
                                                    .trim()
                                                    .toUpperCase();

                                            return (

                                                itemMa ===
                                                maVoucher &&

                                                String(itemId) !==
                                                String(id)

                                            );

                                        }
                                    );

                                if (voucherTrung) {

                                    errors.maVoucher =
                                        "Mã voucher đã tồn tại.";

                                }

                            }

                            if (!tenVoucher) {

                                errors.tenVoucher =
                                    "Vui lòng điền vào trường này.";

                            } else if (tenVoucher.length > 255) {

                                errors.tenVoucher =
                                    "Tên voucher không được vượt quá 255 ký tự.";

                            } else {

                                const voucherTrung =
                                    dsVoucher.find(
                                        item => {

                                            const itemId =
                                                item?.id ??
                                                "";

                                            const itemTen =
                                                String(
                                                    item?.tenVoucher ??
                                                    ""
                                                )
                                                    .trim()
                                                    .toLowerCase();

                                            return (

                                                itemTen ===
                                                tenVoucher.toLowerCase() &&

                                                String(itemId) !==
                                                String(id)

                                            );

                                        }
                                    );

                                if (voucherTrung) {

                                    errors.tenVoucher =
                                        "Tên voucher đã tồn tại.";

                                }

                            }

                            if (
                                loaiMienGiam === null
                            ) {

                                errors.loaiMienGiam =
                                    "Vui lòng chọn một mục trong danh sách.";

                            }

                            if (
                                giaTri === null
                            ) {

                                errors.giaTri =
                                    "Vui lòng điền vào trường này.";

                            } else if (
                                loaiMienGiam ===
                                LOAI_MIEN_GIAM.PHAN_TRAM
                            ) {

                                if (
                                    giaTri < 0 ||
                                    giaTri > 100
                                ) {

                                    errors.giaTri =
                                        "Giá trị phần trăm phải nằm trong khoảng từ 0 đến 100.";

                                }

                                const decimalLength =
                                    getDecimalLength(
                                        formData.giaTri
                                    );

                                if (
                                    decimalLength >
                                    soChuSoSauDauPhay
                                ) {

                                    errors.giaTri =
                                        `Giá trị phần trăm chỉ được phép có tối đa ${soChuSoSauDauPhay} chữ số sau dấu phẩy.`;

                                }

                            } else if (
                                loaiMienGiam ===
                                LOAI_MIEN_GIAM.SO_TIEN
                            ) {

                                if (
                                    giaTri <= 0
                                ) {

                                    errors.giaTri =
                                        "Giá trị tiền phải lớn hơn 0.";

                                }

                                const decimalLength =
                                    getDecimalLength(
                                        formData.giaTri
                                    );

                                if (
                                    decimalLength >
                                    soChuSoSauDauPhay
                                ) {

                                    errors.giaTri =
                                        `Giá trị tiền chỉ được phép có tối đa ${soChuSoSauDauPhay} chữ số sau dấu phẩy.`;

                                }

                            }

                            if (
                                soLuong !== null &&
                                soLuong < 0
                            ) {

                                errors.soLuong =
                                    "Số lượng phải lớn hơn hoặc bằng 0.";

                            }

                            if (
                                daSuDung !== null &&
                                daSuDung < 0
                            ) {

                                errors.daSuDung =
                                    "Số lượng đã sử dụng phải lớn hơn hoặc bằng 0.";

                            }


                            if (
                                soLuong !== null &&
                                daSuDung !== null &&
                                daSuDung > soLuong
                            ) {

                                errors.daSuDung =
                                    "Số lượng đã sử dụng không được lớn hơn số lượng.";

                            }

                            if (
                                batDau &&
                                ketThuc &&
                                batDau > ketThuc
                            ) {

                                errors.thoiGianKetThuc =
                                    "Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu.";

                            }

                            return errors;

                        },
                        
                        getRecordSubtitle(
                            record
                        ) {

                            return (
                                record?.maVoucher ||
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

                            window.setTimeout(
                                () => {

                                    renderLoaiMienGiam(
                                        record?.loaiMienGiam
                                    );

                                    syncGiaTriField(
                                        record?.loaiMienGiam
                                    );

                                    window.MCS
                                        ?.numberInput
                                        ?.refresh?.(
                                            document.getElementById(
                                                "voucherDetailPanel"
                                            )
                                        );

                                },
                                0
                            );


                            return {

                                id:
                                    record?.id ??
                                    "",

                                maVoucher:
                                    record?.maVoucher ||
                                    "",

                                tenVoucher:
                                    record?.tenVoucher ||
                                    "",

                                loaiMienGiam:
                                    record?.loaiMienGiam ??
                                    "",

                                giaTri:
                                    record?.giaTri ??
                                    "",

                                soLuong:
                                    record?.soLuong ??
                                    "",

                                daSuDung:
                                    record?.daSuDung ??
                                    0,

                                thoiGianBatDau:
                                    normalizeDate(
                                        record?.thoiGianBatDau
                                    ),

                                thoiGianKetThuc:
                                    normalizeDate(
                                        record?.thoiGianKetThuc
                                    ),

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

                            const loaiMienGiam =
                                normalizeNumber(
                                    formData.loaiMienGiam
                                );


                            let giaTri =
                                normalizeNumber(
                                    formData.giaTri
                                );


                            if (
                                loaiMienGiam ===
                                LOAI_MIEN_GIAM.SO_TIEN &&
                                giaTri !== null
                            ) {

                                giaTri =
                                    lamTronTheoThietLap(
                                        giaTri
                                    );

                            }


                            return {

                                maVoucher:
                                    String(
                                        formData.maVoucher ||
                                        ""
                                    )
                                        .trim()
                                        .toUpperCase(),

                                tenVoucher:
                                    String(
                                        formData.tenVoucher ||
                                        ""
                                    ).trim(),

                                loaiMienGiam:

                                    loaiMienGiam,

                                giaTri:
                                    giaTri,

                                soLuong:
                                    normalizeNumber(
                                        formData.soLuong
                                    ),

                                daSuDung:
                                    normalizeNumber(
                                        formData.daSuDung
                                    ) ??
                                    0,

                                thoiGianBatDau:
                                    normalizeNullableString(
                                        formData.thoiGianBatDau
                                    ),

                                thoiGianKetThuc:
                                    normalizeNullableString(
                                        formData.thoiGianKetThuc
                                    ),

                                moTa:
                                    normalizeNullableString(
                                        formData.moTa
                                    ),

                                active:
                                    formData.active ===
                                    true

                            };

                        }

                    });

        }

        function bindLoaiMienGiamEvents() {

            const select =
                document.getElementById(
                    "loaiMienGiam"
                );


            if (!select) {

                return;

            }


            if (
                select.dataset.voucherLoaiMienGiamBound ===
                "true"
            ) {

                return;

            }


            select.dataset.voucherLoaiMienGiamBound =
                "true";


            select.addEventListener(
                "change",
                () => {

                    syncGiaTriField();

                }
            );

        }

        function renderLoaiMienGiam(
            selectedValue = ""
        ) {

            const select =
                document.getElementById(
                    "loaiMienGiam"
                );


            if (!select) {

                return;

            }


            const selected =
                selectedValue === null ||
                selectedValue === undefined
                    ? ""
                    : String(
                        selectedValue
                    );


            select.innerHTML = "";


            const emptyOption =
                document.createElement(
                    "option"
                );


            emptyOption.value =
                "";

            emptyOption.textContent =
                "";

            emptyOption.selected =
                selected === "";


            select.appendChild(
                emptyOption
            );


            dsLoaiMienGiam.forEach(
                item => {

                    const value =
                        String(
                            item?.value ??
                            ""
                        );


                    if (!value) {

                        return;

                    }


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        value;

                    option.textContent =
                        item?.name ??
                        value;

                    option.selected =
                        value === selected;


                    select.appendChild(
                        option
                    );

                }
            );


            select.value =
                selected;


            const smartSelectRoot =
                select.closest(
                    "[data-smart-select]"
                );


            window.MCS
                ?.smartSelect
                ?.initialize(
                    smartSelectRoot
                );


            smartSelectRoot
                ?.smartSelect
                ?.refresh?.();

        }

        function syncGiaTriField(
            explicitLoaiMienGiam
        ) {

            const select =
                document.getElementById(
                    "loaiMienGiam"
                );


            const input =
                document.getElementById(
                    "giaTri"
                );


            if (
                !input
            ) {

                return;

            }


            const loaiMienGiam =
                normalizeNumber(
                    explicitLoaiMienGiam ??
                    select?.value
                );


            const field =
                input.closest(
                    "[data-form-field='giaTri']"
                ) ||
                input.closest(
                    ".form-field"
                );


            let suffix =
                field?.querySelector(
                    ".form-field__suffix"
                );


            if (
                !suffix &&
                field
            ) {

                const control =
                    field.querySelector(
                        ".form-field__control"
                    );


                if (
                    control
                ) {

                    suffix =
                        document.createElement(
                            "span"
                        );


                    suffix.className =
                        "form-field__suffix";


                    control.appendChild(
                        suffix
                    );

                }

            }


            if (
                loaiMienGiam ===
                LOAI_MIEN_GIAM.PHAN_TRAM
            ) {

                input.min =
                    "0";

                input.max =
                    "100";

                input.step =
                    getStepValue();

                if (
                    suffix
                ) {

                    suffix.textContent =
                        "%";

                }

            } else if (
                loaiMienGiam ===
                LOAI_MIEN_GIAM.SO_TIEN
            ) {

                input.min =
                    "0";

                input.removeAttribute(
                    "max"
                );

                input.step =
                    getStepValue();

                if (
                    suffix
                ) {

                    suffix.textContent =
                        "VNĐ";

                }

            } else {

                input.min =
                    "0";

                input.removeAttribute(
                    "max"
                );

                input.step =
                    getStepValue();

                if (
                    suffix
                ) {

                    suffix.textContent =
                        "";

                }

            }


            const numberInput =
                input.numberInput ||
                window.MCS
                    ?.numberInput
                    ?.initialize?.(
                        input
                    );


            numberInput?.refresh?.();

        }

        function getStepValue() {

            if (
                soChuSoSauDauPhay <=
                0
            ) {

                return "1";

            }


            return `0.${"0".repeat(
                soChuSoSauDauPhay - 1
            )}1`;

        }

        function getLoaiMienGiamLabel(
            value
        ) {

            const item =
                dsLoaiMienGiam.find(
                    current =>
                        Number(
                            current?.value
                        ) ===
                        Number(
                            value
                        )
                );


            return (
                item?.name ||
                "—"
            );

        }

        function formatGiaTri(
            value,
            loaiMienGiam
        ) {

            const number =
                normalizeNumber(
                    value
                );


            if (
                number === null
            ) {

                return "—";

            }


            if (
                Number(
                    loaiMienGiam
                ) ===
                LOAI_MIEN_GIAM.PHAN_TRAM
            ) {

                return `${formatNumber(
                    number,
                    soChuSoSauDauPhay
                )} %`;

            }


            if (
                Number(
                    loaiMienGiam
                ) ===
                LOAI_MIEN_GIAM.SO_TIEN
            ) {

                return `${formatNumber(
                    lamTronTheoThietLap(
                        number
                    ),
                    soChuSoSauDauPhay
                )} VNĐ`;

            }


            return formatNumber(
                number,
                soChuSoSauDauPhay
            );

        }

        function formatNumber(
            value,
            decimalPlaces
        ) {

            const number =
                Number(
                    value
                );


            if (
                !Number.isFinite(
                    number
                )
            ) {

                return "—";

            }


            return new Intl.NumberFormat(
                "vi-VN",
                {
                    minimumFractionDigits:
                        0,

                    maximumFractionDigits:
                        decimalPlaces
                }
            ).format(
                number
            );

        }

        function lamTronTheoThietLap(
            value
        ) {

            const number =
                Number(
                    value
                );


            if (
                !Number.isFinite(
                    number
                )
            ) {

                return null;

            }


            const digits =
                Number.isInteger(
                    Number(
                        soChuSoSauDauPhay
                    )
                )
                    ? Math.max(
                        0,
                        Number(
                            soChuSoSauDauPhay
                        )
                    )
                    : 0;


            const factor =
                Math.pow(
                    10,
                    digits
                );


            const scaled =
                number *
                factor;


            let result;


            switch (
                Number(
                    quyTacLamTron
                )
            ) {

                case 1:

                    result =
                        Math.ceil(
                            scaled
                        );

                    break;


                case 2:

                    result =
                        Math.floor(
                            scaled
                        );

                    break;


                case 0:

                default:

                    result =
                        Math.floor(
                            scaled +
                            0.5
                        );

                    break;

            }


            return Number(
                (
                    result /
                    factor
                ).toFixed(
                    digits
                )
            );

        }

        function getDecimalLength(
            value
        ) {

            if (
                value === null ||
                value === undefined
            ) {

                return 0;

            }


            const text =
                String(
                    value
                )
                    .trim()
                    .replace(
                        /,/g,
                        "."
                    );


            if (
                !text.includes(
                    "."
                )
            ) {

                return 0;

            }


            return text.split(
                "."
            )[1]?.length || 0;

        }

        function normalizeNumber(
            value
        ) {

            if (
                value === null ||
                value === undefined ||
                String(
                    value
                ).trim() === ""
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

        function normalizeNullableString(
            value
        ) {

            if (
                value === null ||
                value === undefined
            ) {

                return null;

            }


            const text =
                String(
                    value
                ).trim();


            return (
                text ||
                null
            );

        }

        function normalizeDate(
            value
        ) {

            if (
                !value
            ) {

                return "";

            }


            return String(
                value
            ).substring(
                0,
                10
            );

        }

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
                    value?.danhSach
                )
            ) {

                return value.danhSach;

            }


            return [];

        }

    }
);