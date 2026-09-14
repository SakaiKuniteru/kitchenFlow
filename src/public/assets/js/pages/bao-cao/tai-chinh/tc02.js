'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-tc02-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG TC02
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/tai-chinh/tc02',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            taiKhoan:
                '/api/mcs/v1/dm-tai-khoan/tong-hop?active=true',

            trangThaiThanhToan:
                '/api/mcs/v1/enums?name=trangThaiThanhToan'

        };


        /*
         * ==========================================
         * NGUỒN TC02
         * ==========================================
         */

        const NGUON_THANH_TOAN_OPTIONS = [

            {
                value:
                    10,

                label:
                    'Vé ăn'
            },

            {
                value:
                    20,

                label:
                    'Đơn hàng'
            }

        ];


        /*
         * ==========================================
         * PHƯƠNG THỨC ĐÃ CHUẨN HÓA CHO TC02
         * ==========================================
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
         * DEFAULT RIÊNG TC02
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                coSoIds:
                    true,

                nhaAnIds:
                    false,

                nguonThanhToan:
                    true,

                hinhThucThanhToan:
                    true,

                trangThaiThanhToan:
                    true,

                thuNganIds:
                    false

            });


        /*
         * ==========================================
         * STATE RIÊNG TC02
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
                    permission: 'Q003001',
                    api:
                        API.baoCao,

                    fileName:
                        'tc02',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        report.start(initialize());


        /*
         * ==========================================
         * INIT TC02
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
                    taiKhoan,
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
                            API.taiKhoan
                        ),

                        report.loadList(
                            API.trangThaiThanhToan
                        )

                    ]);


                state.nhaAn =
                    nhaAn;


                /*
                 * Cơ sở
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
                 * Nhà ăn
                 */
                renderNhaAn();


                /*
                 * Nguồn
                 */
                report
                    .setMultipleSelectOptions(
                        'nguonThanhToan',

                        NGUON_THANH_TOAN_OPTIONS,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nguonThanhToan
                    );


                /*
                 * Phương thức thanh toán
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
                 * Trạng thái thanh toán
                 */
                report
                    .setMultipleSelectOptions(
                        'trangThaiThanhToan',

                        trangThaiThanhToan
                            .map(
                                item => ({

                                    value:
                                        item.value,

                                    label:
                                        item.name

                                })
                            ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .trangThaiThanhToan
                    );


                /*
                 * Người thu tiền
                 */
                const taiKhoanOptions =
                    taiKhoan.map(
                        item => ({

                            value:
                                item.id,

                            label:
                                buildTaiKhoanLabel(
                                    item
                                )

                        })
                    );


                report
                    .setMultipleSelectOptions(
                        'thuNganIds',

                        taiKhoanOptions,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .thuNganIds
                    );


                /*
                 * Quy tắc "Tất cả"
                 * nằm trong bao-cao.js.
                 */
                report
                    .bindAllOptions(
                        MULTI_SELECT_DEFAULTS
                    );


                /*
                 * Mặc định hôm nay.
                 */
                report
                    .setDefaultDateRange(
                        'tuNgay',
                        'denNgay'
                    );


                bindTc02Events();

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
                        'Không thể tải dữ liệu bộ lọc TC02.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }
        }


        /*
         * ==========================================
         * EVENT RIÊNG TC02
         * ==========================================
         */

        function bindTc02Events() {

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
         * BUILD PAYLOAD TC02
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
                    'Vui lòng chọn từ ngày thanh toán.'
                );

            }


            if (!denNgay) {

                throw new Error(
                    'Vui lòng chọn đến ngày thanh toán.'
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


                nhaAnIds:
                    report
                        .getMultiNumbers(
                            'nhaAnIds'
                        ),


                nguonThanhToan:
                    report
                        .getMultiNumbers(
                            'nguonThanhToan'
                        ),


                hinhThucThanhToan:
                    report
                        .getMultiNumbers(
                            'hinhThucThanhToan'
                        ),


                trangThaiThanhToan:
                    report
                        .getMultiNumbers(
                            'trangThaiThanhToan'
                        ),


                thuNganIds:
                    report
                        .getMultiNumbers(
                            'thuNganIds'
                        )

            };
        }


        /*
         * ==========================================
         * RESET TC02
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