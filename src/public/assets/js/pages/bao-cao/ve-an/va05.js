'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-va05-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG VA05
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/ve-an/va05',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            caAn:
                '/api/mcs/v1/dm-ca-an/tong-hop?active=true',

            /*
             * Nhân viên lấy vé.
             *
             * BE:
             *
             * p.nhan_vien_id
             */

            nhanVien:
                '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true',

            /*
             * Người hủy KHÔNG phải ID nhân viên.
             *
             * BE:
             *
             * v.nguoi_huy_id
             *
             * JOIN:
             *
             * dm_tai_khoan tk_huy
             */

            taiKhoan:
                '/api/mcs/v1/dm-tai-khoan/tong-hop?active=true'

        };


        /*
         * ==========================================
         * DEFAULT MULTI SELECT VA05
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
                 * Người cụ thể để trống mặc định.
                 *
                 * [] vẫn mang nghĩa không lọc.
                 */

                nhanVienIds:
                    false,

                nguoiHuyIds:
                    false

            });


        /*
         * ==========================================
         * STATE RIÊNG VA05
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

            taiKhoan:
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
                        'Q003015',

                    api:
                        API.baoCao,

                    fileName:
                        'va05',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        /*
         * Truyền function.
         *
         * Không:
         *
         * report.start(
         *     initialize()
         * );
         */

        report.start(
            initialize
        );


        /*
         * ==========================================
         * INIT VA05
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
                    taiKhoan
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
                            API.taiKhoan
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


                state.taiKhoan =
                    taiKhoan;


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
                 *
                 * Phụ thuộc Cơ sở.
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
                 * NHÂN VIÊN
                 * ======================================
                 *
                 * Đây là nhân viên lấy vé:
                 *
                 * p.nhan_vien_id
                 */

                report
                    .setMultipleSelectOptions(
                        'nhanVienIds',

                        nhanVien.map(
                            item => ({

                                value:
                                    item.id,

                                label:
                                    buildNhanVienLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nhanVienIds
                    );


                /*
                 * ======================================
                 * NGƯỜI HỦY
                 * ======================================
                 *
                 * Rất quan trọng:
                 *
                 * nguoiHuyIds là ID dm_tai_khoan,
                 * KHÔNG phải dm_nhan_vien.
                 *
                 * Repository:
                 *
                 * v.nguoi_huy_id
                 *
                 * LEFT JOIN dm_tai_khoan tk_huy
                 *     ON tk_huy.id = v.nguoi_huy_id
                 */

                report
                    .setMultipleSelectOptions(
                        'nguoiHuyIds',

                        taiKhoan.map(
                            item => ({

                                value:
                                    item.id,

                                label:
                                    buildTaiKhoanLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nguoiHuyIds
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
                 * EVENT RIÊNG VA05
                 * ======================================
                 */

                bindVa05Events();

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
                        'Không thể tải dữ liệu bộ lọc VA05.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * EVENT RIÊNG VA05
         * ==========================================
         */

        function bindVa05Events() {

            /*
             * ======================================
             * CƠ SỞ
             * ======================================
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
             * ======================================
             * LÝ DO HỦY
             * ======================================
             */

            root
                .querySelector(
                    '#lyDoHuy'
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


            /*
             * Không chọn Cơ sở
             * hoặc chọn "Tất cả":
             *
             * getMultiValues() trả [].
             *
             * => toàn bộ Nhà ăn.
             */

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
             * ======================================
             * GIỮ NHÀ ĂN CÒN HỢP LỆ
             * ======================================
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
         * BUILD PAYLOAD VA05
         * ==========================================
         */

        function getFilters() {

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


            /*
             * ======================================
             * TỪ NGÀY HỦY
             * ======================================
             */

            if (
                !tuNgay
            ) {

                throw new Error(
                    'Vui lòng chọn từ ngày hủy.'
                );

            }


            /*
             * ======================================
             * ĐẾN NGÀY HỦY
             * ======================================
             */

            if (
                !denNgay
            ) {

                throw new Error(
                    'Vui lòng chọn đến ngày hủy.'
                );

            }


            /*
             * ======================================
             * CHUẨN NGÀY NHÓM VA
             * ======================================
             *
             * ve-an-report.helper.js yêu cầu:
             *
             * yyyy-MM-dd
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
                !tuNgayValue
            ) {

                throw new Error(
                    'Từ ngày hủy không hợp lệ.'
                );

            }


            if (
                !denNgayValue
            ) {

                throw new Error(
                    'Đến ngày hủy không hợp lệ.'
                );

            }


            /*
             * yyyy-MM-dd so sánh chuỗi được.
             */

            if (
                tuNgayValue >
                denNgayValue
            ) {

                throw new Error(
                    'Từ ngày hủy không được lớn hơn đến ngày hủy.'
                );

            }


            /*
             * ======================================
             * LÝ DO HỦY
             * ======================================
             */

            const lyDoHuy =
                String(
                    root
                        .querySelector(
                            '#lyDoHuy'
                        )
                        ?.value ||
                    ''
                )
                    .trim();


            if (
                lyDoHuy.length >
                500
            ) {

                throw new Error(
                    'Lý do hủy không được vượt quá 500 ký tự.'
                );

            }


            /*
             * ======================================
             * PAYLOAD VA05
             * ======================================
             */

            return {

                /*
                 * ==================================
                 * NGÀY HỦY
                 * ==================================
                 *
                 * Repository:
                 *
                 * v.thoi_gian_huy
                 */

                tuNgay:
                    tuNgayValue,

                denNgay:
                    denNgayValue,


                /*
                 * ==================================
                 * CƠ SỞ
                 * ==================================
                 */

                coSoIds:
                    report
                        .getMultiNumbers(
                            'coSoIds'
                        ),


                /*
                 * ==================================
                 * NHÀ ĂN
                 * ==================================
                 */

                nhaAnIds:
                    report
                        .getMultiNumbers(
                            'nhaAnIds'
                        ),


                /*
                 * ==================================
                 * CA ĂN
                 * ==================================
                 */

                caAnIds:
                    report
                        .getMultiNumbers(
                            'caAnIds'
                        ),


                /*
                 * ==================================
                 * NHÂN VIÊN LẤY VÉ
                 * ==================================
                 *
                 * Helper:
                 *
                 * p.nhan_vien_id
                 */

                nhanVienIds:
                    report
                        .getMultiNumbers(
                            'nhanVienIds'
                        ),


                /*
                 * ==================================
                 * NGƯỜI HỦY
                 * ==================================
                 *
                 * ID dm_tai_khoan.
                 *
                 * Repository:
                 *
                 * v.nguoi_huy_id
                 */

                nguoiHuyIds:
                    report
                        .getMultiNumbers(
                            'nguoiHuyIds'
                        ),


                /*
                 * ==================================
                 * LÝ DO HỦY
                 * ==================================
                 */

                lyDoHuy

            };

        }


        /*
         * ==========================================
         * RESET VA05
         * ==========================================
         */

        function resetFilters() {

            /*
             * ======================================
             * RESET MULTI SELECT
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
             * RESET LÝ DO HỦY
             * ======================================
             */

            const lyDoHuy =
                root.querySelector(
                    '#lyDoHuy'
                );


            if (
                lyDoHuy
            ) {

                lyDoHuy.value =
                    '';

            }


            /*
             * ======================================
             * RESET NGÀY
             * ======================================
             */

            report
                .setDefaultDateRange(
                    'tuNgay',
                    'denNgay'
                );


            /*
             * ======================================
             * RESET NHÀ ĂN
             * ======================================
             */

            renderNhaAn();

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
             * Các dạng thường gặp:
             *
             * yyyy-MM-dd
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


        /*
         * ==========================================
         * LABEL TÀI KHOẢN NGƯỜI HỦY
         * ==========================================
         */

        function buildTaiKhoanLabel(
            item
        ) {

            const hoTen =
                item.hoTenNhanVien ||
                item.hoTen ||
                item.tenNhanVien ||
                '';


            const tenDangNhap =
                item.tenDangNhap ||
                item.ten_dang_nhap ||
                '';


            if (
                hoTen &&
                tenDangNhap
            ) {

                return (
                    `${hoTen} (${tenDangNhap})`
                );

            }


            return (
                hoTen ||
                tenDangNhap ||
                `Tài khoản #${item.id}`
            );

        }

    }
);