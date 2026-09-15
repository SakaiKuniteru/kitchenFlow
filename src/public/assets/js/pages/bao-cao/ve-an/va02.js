'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-va02-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG VA02
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/ve-an/va02',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            caAn:
                '/api/mcs/v1/dm-ca-an/tong-hop?active=true',

            nhanVien:
                '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true',

            phongBan:
                '/api/mcs/v1/dm-phong-ban/tong-hop?active=true',

            trangThaiVe:
                '/api/mcs/v1/enums?name=trangThaiVe',

            trangThaiThanhToan:
                '/api/mcs/v1/enums?name=trangThaiPhieuThu'

        };


        /*
         * ==========================================
         * LOẠI THỜI GIAN
         * ==========================================
         *
         * Khớp trực tiếp với:
         *
         * Va02Repository.getTimeExpression()
         */

        const LOAI_THOI_GIAN_OPTIONS = [

            {
                value:
                    'NGAY_TAO',

                label:
                    'Ngày tạo vé'
            },

            {
                value:
                    'NGAY_SU_DUNG',

                label:
                    'Ngày sử dụng'
            }

        ];


        /*
         * ==========================================
         * TRẠNG THÁI PHIẾU KHÔNG DÙNG
         * ==========================================
         *
         * Validation BE đã loại:
         *
         * value = -10
         */

        const TRANG_THAI_PHIEU_KHONG_DUNG =
            -10;


        /*
         * ==========================================
         * DEFAULT MULTI SELECT
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                coSoIds:
                    true,

                /*
                 * Nhà ăn phụ thuộc Cơ sở.
                 */

                nhaAnIds:
                    false,

                caAnIds:
                    true,

                /*
                 * Không mặc định chọn nhân viên
                 * hoặc phòng ban cụ thể.
                 */

                nhanVienIds:
                    false,

                phongBanIds:
                    false,

                trangThaiVe:
                    true,

                trangThaiThanhToan:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG VA02
         * ==========================================
         */

        const state = {

            coSo:
                [],

            nhaAn:
                [],

            caAn:
                [],

            nhanVien:
                [],

            phongBan:
                []

        };


        /*
         * ==========================================
         * REPORT ENGINE
         * ==========================================
         */

        const report =
            window.MCS
                .baoCao
                .create({

                    root,

                    permission:
                        'Q003012',

                    api:
                        API.baoCao,

                    fileName:
                        'va02',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        /*
         * Phải truyền function.
         */

        report.start(
            initialize
        );


        /*
         * ==========================================
         * INIT VA02
         * ==========================================
         */

        async function initialize() {

            try {

                report.setLoading(
                    true
                );


                const [
                    coSo,
                    nhaAn,
                    caAn,
                    nhanVien,
                    phongBan,
                    trangThaiVe,
                    trangThaiThanhToan
                ] =
                    await Promise.all([

                        report.loadList(
                            API.coSo
                        ),

                        report.loadList(
                            API.nhaAn
                        ),

                        report.loadList(
                            API.caAn
                        ),

                        report.loadList(
                            API.nhanVien
                        ),

                        report.loadList(
                            API.phongBan
                        ),

                        report.loadList(
                            API.trangThaiVe
                        ),

                        report.loadList(
                            API.trangThaiThanhToan
                        )

                    ]);


                /*
                 * ======================================
                 * STATE
                 * ======================================
                 */

                state.coSo =
                    coSo;


                state.nhaAn =
                    nhaAn;


                state.caAn =
                    caAn;


                state.nhanVien =
                    nhanVien;


                state.phongBan =
                    phongBan;


                /*
                 * ======================================
                 * LOẠI THỜI GIAN
                 * ======================================
                 *
                 * Mặc định:
                 *
                 * NGAY_SU_DUNG
                 */

                report
                    .setSingleSelectOptions(
                        'loaiThoiGian',

                        LOAI_THOI_GIAN_OPTIONS,

                        'NGAY_SU_DUNG'
                    );


                /*
                 * ======================================
                 * CƠ SỞ
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'coSoIds',

                        coSo.map(
                            item => ({

                                value:
                                    item.id,

                                label:
                                    buildCoSoLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .coSoIds
                    );


                /*
                 * ======================================
                 * NHÀ ĂN
                 * ======================================
                 */

                renderNhaAn();


                /*
                 * ======================================
                 * CA ĂN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'caAnIds',

                        caAn.map(
                            item => ({

                                value:
                                    item.id,

                                label:
                                    buildCaAnLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .caAnIds
                    );


                /*
                 * ======================================
                 * PHÒNG BAN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'phongBanIds',

                        phongBan.map(
                            item => ({

                                value:
                                    item.id,

                                label:
                                    buildPhongBanLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .phongBanIds
                    );


                /*
                 * ======================================
                 * NHÂN VIÊN
                 * ======================================
                 *
                 * Phụ thuộc Phòng ban.
                 */

                renderNhanVien();


                /*
                 * ======================================
                 * TRẠNG THÁI VÉ
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'trangThaiVe',

                        trangThaiVe.map(
                            item => ({

                                value:
                                    item.value,

                                label:
                                    item.name

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .trangThaiVe
                    );


                /*
                 * ======================================
                 * TRẠNG THÁI THANH TOÁN
                 * ======================================
                 *
                 * Đây là trạng thái PHIẾU:
                 *
                 * enums.trangThaiPhieuThu
                 *
                 * Không dùng trạng thái giao dịch.
                 */

                const trangThaiThanhToanOptions =
                    trangThaiThanhToan
                        .filter(
                            item =>
                                Number(
                                    item.value
                                ) !==
                                TRANG_THAI_PHIEU_KHONG_DUNG
                        )
                        .map(
                            item => ({

                                value:
                                    item.value,

                                label:
                                    item.name

                            })
                        );


                report
                    .setMultipleSelectOptions(
                        'trangThaiThanhToan',

                        trangThaiThanhToanOptions,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .trangThaiThanhToan
                    );


                /*
                 * ======================================
                 * QUY TẮC "TẤT CẢ"
                 * ======================================
                 */

                report
                    .bindAllOptions(
                        MULTI_SELECT_DEFAULTS
                    );


                /*
                 * ======================================
                 * NGÀY MẶC ĐỊNH
                 * ======================================
                 */

                report
                    .setDefaultDateRange(
                        'tuNgay',
                        'denNgay'
                    );


                /*
                 * ======================================
                 * EVENT RIÊNG VA02
                 * ======================================
                 */

                bindVa02Events();

            } catch (
                error
            ) {

                console.error(
                    error
                );


                window.MCS
                    ?.toast
                    ?.error?.(
                        error?.message ||
                        'Không thể tải dữ liệu bộ lọc VA02.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * EVENT RIÊNG VA02
         * ==========================================
         */

        function bindVa02Events() {

            /*
             * CƠ SỞ
             *
             * => Nhà ăn
             */

            root
                .querySelector(
                    '#coSoIds'
                )
                ?.addEventListener(
                    'change',
                    () => {

                        report
                            .invalidateReport();


                        renderNhaAn();

                    }
                );


            /*
             * PHÒNG BAN
             *
             * => Nhân viên
             */

            root
                .querySelector(
                    '#phongBanIds'
                )
                ?.addEventListener(
                    'change',
                    () => {

                        report
                            .invalidateReport();


                        renderNhanVien();

                    }
                );


            /*
             * Mã vé thay đổi.
             */

            root
                .querySelector(
                    '#maVe'
                )
                ?.addEventListener(
                    'input',
                    () => {

                        report
                            .invalidateReport();

                    }
                );


            /*
             * Số phiếu thay đổi.
             */

            root
                .querySelector(
                    '#soPhieu'
                )
                ?.addEventListener(
                    'input',
                    () => {

                        report
                            .invalidateReport();

                    }
                );

        }


        /*
         * ==========================================
         * NHÀ ĂN THEO CƠ SỞ
         * ==========================================
         */

        function renderNhaAn() {

            const coSoIds =
                report
                    .getMultiValues(
                        'coSoIds'
                    );


            const selected =
                report
                    .getMultiValues(
                        'nhaAnIds'
                    );


            let records =
                state.nhaAn;


            if (
                coSoIds.length >
                0
            ) {

                const set =
                    new Set(
                        coSoIds.map(
                            String
                        )
                    );


                records =
                    state.nhaAn
                        .filter(
                            item => {

                                const coSoId =
                                    item.coSoId ??
                                    item.co_so_id ??
                                    item.coSo?.id ??
                                    null;


                                return set.has(
                                    String(
                                        coSoId ??
                                        ''
                                    )
                                );

                            }
                        );

            }


            /*
             * Giữ Nhà ăn vẫn còn hợp lệ.
             */

            const validIds =
                new Set(
                    records.map(
                        item =>
                            String(
                                item.id
                            )
                    )
                );


            const preserved =
                selected.filter(
                    value =>
                        validIds.has(
                            String(
                                value
                            )
                        )
                );


            report
                .setMultipleSelectOptions(
                    'nhaAnIds',

                    records.map(
                        item => ({

                            value:
                                item.id,

                            label:
                                buildNhaAnLabel(
                                    item
                                )

                        })
                    ),

                    preserved,

                    preserved.length ===
                        0
                        ? MULTI_SELECT_DEFAULTS
                            .nhaAnIds
                        : false
                );

        }


        /*
         * ==========================================
         * NHÂN VIÊN THEO PHÒNG BAN
         * ==========================================
         */

        function renderNhanVien() {

            const phongBanIds =
                report
                    .getMultiValues(
                        'phongBanIds'
                    );


            const selected =
                report
                    .getMultiValues(
                        'nhanVienIds'
                    );


            let records =
                state.nhanVien;


            /*
             * Không chọn phòng ban:
             *
             * => hiển thị toàn bộ nhân viên.
             */

            if (
                phongBanIds.length >
                0
            ) {

                const set =
                    new Set(
                        phongBanIds.map(
                            String
                        )
                    );


                records =
                    state.nhanVien
                        .filter(
                            item => {

                                const phongBanId =
                                    item.phongBanId ??
                                    item.phong_ban_id ??
                                    item.phongBan?.id ??
                                    null;


                                return set.has(
                                    String(
                                        phongBanId ??
                                        ''
                                    )
                                );

                            }
                        );

            }


            /*
             * Giữ các nhân viên đã chọn
             * nếu vẫn thuộc phòng ban mới.
             */

            const validIds =
                new Set(
                    records.map(
                        item =>
                            String(
                                item.id
                            )
                    )
                );


            const preserved =
                selected.filter(
                    value =>
                        validIds.has(
                            String(
                                value
                            )
                        )
                );


            report
                .setMultipleSelectOptions(
                    'nhanVienIds',

                    records.map(
                        item => ({

                            value:
                                item.id,

                            label:
                                buildNhanVienLabel(
                                    item
                                )

                        })
                    ),

                    preserved,

                    preserved.length ===
                        0
                        ? MULTI_SELECT_DEFAULTS
                            .nhanVienIds
                        : false
                );

        }


        /*
         * ==========================================
         * BUILD PAYLOAD VA02
         * ==========================================
         */

        function getFilters() {

            /*
             * ======================================
             * LOẠI THỜI GIAN
             * ======================================
             */

            const loaiThoiGian =
                String(
                    root
                        .querySelector(
                            '#loaiThoiGian'
                        )
                        ?.value ||
                    ''
                )
                    .trim();


            if (
                ![
                    'NGAY_TAO',
                    'NGAY_SU_DUNG'
                ].includes(
                    loaiThoiGian
                )
            ) {

                throw new Error(
                    'Vui lòng chọn loại thời gian hợp lệ.'
                );

            }


            /*
             * ======================================
             * NGÀY
             * ======================================
             */

            const tuNgay =
                report
                    .getDateValue(
                        'tuNgay'
                    );


            const denNgay =
                report
                    .getDateValue(
                        'denNgay'
                    );


            if (
                !tuNgay
            ) {

                throw new Error(
                    'Vui lòng chọn từ ngày.'
                );

            }


            if (
                !denNgay
            ) {

                throw new Error(
                    'Vui lòng chọn đến ngày.'
                );

            }


            /*
             * Helper VA bắt buộc:
             *
             * yyyy-MM-dd
             *
             * Không gửi ISO datetime.
             */

            const tuNgayValue =
                getDateOnly(
                    tuNgay
                );


            const denNgayValue =
                getDateOnly(
                    denNgay
                );


            if (
                !tuNgayValue ||
                !denNgayValue
            ) {

                throw new Error(
                    'Khoảng ngày không hợp lệ.'
                );

            }


            if (
                tuNgayValue >
                denNgayValue
            ) {

                throw new Error(
                    'Từ ngày không được lớn hơn đến ngày.'
                );

            }


            /*
             * ======================================
             * MÃ VÉ
             * ======================================
             */

            const maVe =
                String(
                    root
                        .querySelector(
                            '#maVe'
                        )
                        ?.value ||
                    ''
                )
                    .trim();


            /*
             * ======================================
             * SỐ PHIẾU
             * ======================================
             */

            const soPhieu =
                String(
                    root
                        .querySelector(
                            '#soPhieu'
                        )
                        ?.value ||
                    ''
                )
                    .trim();


            /*
             * ======================================
             * PAYLOAD VA02
             * ======================================
             */

            return {

                /*
                 * Loại thời gian.
                 */

                loaiThoiGian,


                /*
                 * Khoảng ngày.
                 */

                tuNgay:
                    tuNgayValue,

                denNgay:
                    denNgayValue,


                /*
                 * Tổ chức.
                 */

                coSoIds:
                    report
                        .getMultiNumbers(
                            'coSoIds'
                        ),

                nhaAnIds:
                    report
                        .getMultiNumbers(
                            'nhaAnIds'
                        ),

                caAnIds:
                    report
                        .getMultiNumbers(
                            'caAnIds'
                        ),


                /*
                 * Tìm kiếm trực tiếp.
                 */

                maVe,

                soPhieu,


                /*
                 * Nhân viên / phòng ban.
                 */

                nhanVienIds:
                    report
                        .getMultiNumbers(
                            'nhanVienIds'
                        ),

                phongBanIds:
                    report
                        .getMultiNumbers(
                            'phongBanIds'
                        ),


                /*
                 * Trạng thái vé.
                 */

                trangThaiVe:
                    report
                        .getMultiNumbers(
                            'trangThaiVe'
                        ),


                /*
                 * Trạng thái PHIẾU thanh toán.
                 */

                trangThaiThanhToan:
                    report
                        .getMultiNumbers(
                            'trangThaiThanhToan'
                        )

            };

        }


        /*
         * ==========================================
         * RESET VA02
         * ==========================================
         */

        function resetFilters() {

            /*
             * Loại thời gian mặc định:
             *
             * Ngày sử dụng.
             */

            report
                .setSingleSelectValue(
                    'loaiThoiGian',
                    'NGAY_SU_DUNG'
                );


            /*
             * ======================================
             * MÃ VÉ
             * ======================================
             */

            const maVe =
                root.querySelector(
                    '#maVe'
                );


            if (
                maVe
            ) {

                maVe.value =
                    '';

            }


            /*
             * ======================================
             * SỐ PHIẾU
             * ======================================
             */

            const soPhieu =
                root.querySelector(
                    '#soPhieu'
                );


            if (
                soPhieu
            ) {

                soPhieu.value =
                    '';

            }


            /*
             * ======================================
             * MULTI SELECT
             * ======================================
             */

            Object.entries(
                MULTI_SELECT_DEFAULTS
            )
                .forEach(
                    ([
                        id,
                        defaultAll
                    ]) => {

                        if (
                            defaultAll ===
                            true
                        ) {

                            report
                                .resetMultiSelectToAll(
                                    id
                                );


                            return;

                        }


                        report
                            .clearMultiSelect(
                                id
                            );

                    }
                );


            /*
             * ======================================
             * NGÀY
             * ======================================
             */

            report
                .setDefaultDateRange(
                    'tuNgay',
                    'denNgay'
                );


            /*
             * ======================================
             * SELECT PHỤ THUỘC
             * ======================================
             */

            renderNhaAn();


            renderNhanVien();

        }


        /*
         * ==========================================
         * DATE CONTROL → yyyy-MM-dd
         * ==========================================
         */

        function getDateOnly(
            value
        ) {

            if (
                value ===
                    null ||
                value ===
                    undefined
            ) {

                return '';

            }


            const text =
                String(
                    value
                )
                    .trim();


            /*
             * yyyy-MM-dd
             *
             * hoặc:
             *
             * yyyy-MM-dd HH:mm:ss
             * yyyy-MM-ddTHH:mm:ss
             */

            const match =
                text.match(
                    /^(\d{4}-\d{2}-\d{2})/
                );


            if (
                match
            ) {

                return match[1];

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

                return '';

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
                        '0'
                    );


            const day =
                String(
                    date.getDate()
                )
                    .padStart(
                        2,
                        '0'
                    );


            return (
                `${year}-${month}-${day}`
            );

        }


        /*
         * ==========================================
         * LABEL CƠ SỞ
         * ==========================================
         */

        function buildCoSoLabel(
            item
        ) {

            const ma =
                item.maCoSo ||
                item.ma_co_so ||
                '';


            const ten =
                item.tenCoSo ||
                item.ten_co_so ||
                item.ten ||
                '';


            if (
                ma &&
                ten
            ) {

                return (
                    `${ma} - ${ten}`
                );

            }


            return (
                ten ||
                ma ||
                `Cơ sở #${item.id}`
            );

        }


        /*
         * ==========================================
         * LABEL NHÀ ĂN
         * ==========================================
         */

        function buildNhaAnLabel(
            item
        ) {

            const ma =
                item.maNhaAn ||
                item.ma_nha_an ||
                '';


            const ten =
                item.tenNhaAn ||
                item.ten_nha_an ||
                item.ten ||
                '';


            if (
                ma &&
                ten
            ) {

                return (
                    `${ma} - ${ten}`
                );

            }


            return (
                ten ||
                ma ||
                `Nhà ăn #${item.id}`
            );

        }


        /*
         * ==========================================
         * LABEL CA ĂN
         * ==========================================
         */

        function buildCaAnLabel(
            item
        ) {

            const ma =
                item.maCaAn ||
                item.ma_ca_an ||
                '';


            const ten =
                item.tenCaAn ||
                item.ten_ca_an ||
                item.ten ||
                '';


            if (
                ma &&
                ten
            ) {

                return (
                    `${ma} - ${ten}`
                );

            }


            return (
                ten ||
                ma ||
                `Ca ăn #${item.id}`
            );

        }


        /*
         * ==========================================
         * LABEL PHÒNG BAN
         * ==========================================
         */

        function buildPhongBanLabel(
            item
        ) {

            const ma =
                item.maPhongBan ||
                item.ma_phong_ban ||
                '';


            const ten =
                item.tenPhongBan ||
                item.ten_phong_ban ||
                item.ten ||
                '';


            if (
                ma &&
                ten
            ) {

                return (
                    `${ma} - ${ten}`
                );

            }


            return (
                ten ||
                ma ||
                `Phòng ban #${item.id}`
            );

        }


        /*
         * ==========================================
         * LABEL NHÂN VIÊN
         * ==========================================
         */

        function buildNhanVienLabel(
            item
        ) {

            const ma =
                item.maNhanVien ||
                item.ma_nhan_vien ||
                '';


            const ten =
                item.hoTen ||
                item.ho_ten ||
                item.tenNhanVien ||
                '';


            if (
                ma &&
                ten
            ) {

                return (
                    `${ma} - ${ten}`
                );

            }


            return (
                ten ||
                ma ||
                `Nhân viên #${item.id}`
            );

        }

    }
);