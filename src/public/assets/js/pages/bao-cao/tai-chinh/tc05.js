'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-tc05-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG TC05
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/tai-chinh/tc05',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            taiKhoan:
                '/api/mcs/v1/dm-tai-khoan/tong-hop?active=true'

        };


        /*
         * ==========================================
         * NGUỒN TC05
         * ==========================================
         */

        const NGUON_OPTIONS = [

            {
                value:
                    'VA',

                label:
                    'Vé ăn'
            },

            {
                value:
                    'DH',

                label:
                    'Đơn hàng'
            }

        ];


        const TAT_CA_NGUON = [
            'VA',
            'DH'
        ];


        /*
         * ==========================================
         * PHƯƠNG THỨC THANH TOÁN CHUẨN TC05
         * ==========================================
         *
         * KHÔNG gọi:
         *
         * /enums?name=phuongThucThanhToan
         *
         * vì enum đó chỉ phản ánh mã Vé ăn.
         */

        const PHUONG_THUC_THANH_TOAN_OPTIONS = [

            {
                value:
                    10,

                label:
                    'Tiền mặt'
            },

            {
                value:
                    20,

                label:
                    'Chuyển khoản'
            },

            {
                value:
                    30,

                label:
                    'QR Code'
            },

            {
                value:
                    40,

                label:
                    'Thanh toán nội bộ'
            }

        ];


        /*
         * ==========================================
         * DEFAULT TC05
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                coSoIds:
                    true,

                nhaAnIds:
                    false,

                nguoiThuIds:
                    false,

                hinhThucThanhToan:
                    true,

                nguon:
                    true

            });


        /*
         * ==========================================
         * STATE
         * ==========================================
         */

        const state = {

            nhaAn:
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
                        'Q003005',

                    api:
                        API.baoCao,

                    fileName:
                        'tc05',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        report.start(
            initialize
        );


        /*
         * ==========================================
         * INIT TC05
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
                            API.taiKhoan
                        )

                    ]);


                state.nhaAn =
                    nhaAn;


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
                                    item.tenCoSo ||
                                    item.ten ||
                                    '-'

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
                 * NGƯỜI THU TIỀN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'nguoiThuIds',

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
                            .nguoiThuIds
                    );


                /*
                 * ======================================
                 * PHƯƠNG THỨC THANH TOÁN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'hinhThucThanhToan',

                        PHUONG_THUC_THANH_TOAN_OPTIONS,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .hinhThucThanhToan
                    );


                /*
                 * ======================================
                 * NGUỒN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'nguon',

                        NGUON_OPTIONS,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nguon
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
                 * MẶC ĐỊNH HÔM NAY
                 * ======================================
                 */

                report
                    .setDefaultDateRange(
                        'tuNgay',
                        'denNgay'
                    );


                bindTc05Events();

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
                        'Không thể tải dữ liệu bộ lọc TC05.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }
        }


        /*
         * ==========================================
         * EVENTS
         * ==========================================
         */

        function bindTc05Events() {

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
        }


        /*
         * ==========================================
         * NGUỒN ĐANG CHỌN
         * ==========================================
         */

        function getSelectedNguon() {

            const values =
                report
                    .getMultiValues(
                        'nguon'
                    );


            /*
             * Engine chung dùng:
             *
             * [] = Tất cả
             *
             * Nhưng BE TC05 yêu cầu
             * nguon có ít nhất 1 phần tử.
             */
            if (
                values.length ===
                0
            ) {

                return [
                    ...TAT_CA_NGUON
                ];

            }


            return values
                .map(
                    value =>
                        String(
                            value
                        )
                            .trim()
                            .toUpperCase()
                )
                .filter(
                    value =>
                        TAT_CA_NGUON
                            .includes(
                                value
                            )
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
                            item =>
                                set.has(
                                    String(
                                        item.coSoId ??
                                        item.co_so_id ??
                                        ''
                                    )
                                )
                        );

            }


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
                                item.tenNhaAn ||
                                item.ten ||
                                '-'

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
         * BUILD PAYLOAD TC05
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


            if (!tuNgay) {

                throw new Error(
                    'Vui lòng chọn từ ngày thu.'
                );

            }


            if (!denNgay) {

                throw new Error(
                    'Vui lòng chọn đến ngày thu.'
                );

            }


            const tuNgayIso =
                report
                    .buildDateTime(
                        tuNgay,
                        false
                    );


            const denNgayIso =
                report
                    .buildDateTime(
                        denNgay,
                        true
                    );


            if (
                new Date(
                    tuNgayIso
                ).getTime() >
                new Date(
                    denNgayIso
                ).getTime()
            ) {

                throw new Error(
                    'Từ ngày không được lớn hơn đến ngày.'
                );

            }


            const nguon =
                getSelectedNguon();


            if (
                nguon.length ===
                0
            ) {

                throw new Error(
                    'Vui lòng chọn nguồn.'
                );

            }


            const nhaAnIds =
                report
                    .getMultiNumbers(
                        'nhaAnIds'
                    );


            /*
             * Đơn hàng hiện chưa có nha_an_id.
             *
             * Rule này giống validation BE.
             */
            if (
                nhaAnIds.length >
                    0 &&
                nguon.includes(
                    'DH'
                )
            ) {

                throw new Error(
                    'Khi lọc nhà ăn, chỉ được chọn nguồn Vé ăn.'
                );

            }


            return {

                tuNgay:
                    tuNgayIso,


                denNgay:
                    denNgayIso,


                coSoIds:
                    report
                        .getMultiNumbers(
                            'coSoIds'
                        ),


                nhaAnIds,


                /*
                 * ID dm_tai_khoan.
                 */
                nguoiThuIds:
                    report
                        .getMultiNumbers(
                            'nguoiThuIds'
                        ),


                /*
                 * Mã phương thức chuẩn TC05.
                 */
                hinhThucThanhToan:
                    report
                        .getMultiNumbers(
                            'hinhThucThanhToan'
                        ),


                /*
                 * STRING ARRAY:
                 *
                 * VA
                 * DH
                 */
                nguon

            };
        }


        /*
         * ==========================================
         * RESET
         * ==========================================
         */

        function resetFilters() {

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


            report
                .setDefaultDateRange(
                    'tuNgay',
                    'denNgay'
                );


            renderNhaAn();
        }


        /*
         * ==========================================
         * LABEL NGƯỜI THU TIỀN
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