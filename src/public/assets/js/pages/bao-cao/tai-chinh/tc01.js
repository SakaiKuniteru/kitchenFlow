'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-tc01-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG TC01
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/tai-chinh/tc01',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            caAn:
                '/api/mcs/v1/dm-ca-an/tong-hop?active=true',

            taiKhoan:
                '/api/mcs/v1/dm-tai-khoan/tong-hop?active=true',

            loaiThoiGian:
                '/api/mcs/v1/enums?name=loaiThoiGian',

            doiTuong:
                '/api/mcs/v1/enums?name=doiTuongLayVe',

            hinhThucThanhToan:
                '/api/mcs/v1/enums?name=phuongThucThanhToan',

            thuChi:
                '/api/mcs/v1/enums?name=thuChi',

            trangThaiThanhToan:
                '/api/mcs/v1/enums?name=trangThaiThanhToan',

            trangThaiSuDung:
                '/api/mcs/v1/enums?name=trangThaiVe'

        };


        /*
         * ==========================================
         * DEFAULT RIÊNG TC01
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                coSoIds:
                    true,

                nhaAnIds:
                    false,

                doiTuong:
                    true,

                nguoiTaoIds:
                    false,

                thuNganIds:
                    false,

                hinhThucThanhToan:
                    true,

                hienThiThuChi:
                    true,

                trangThaiThanhToan:
                    true,

                caAnIds:
                    true,

                trangThaiSuDung:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG TC01
         * ==========================================
         */

        const state = {

            coSo:
                [],

            nhaAn:
                [],

            caAn:
                [],

            taiKhoan:
                []

        };


        /*
         * ==========================================
         * KHỞI TẠO ENGINE BÁO CÁO CHUNG
         * ==========================================
         */

        const report =
            window.MCS
                .baoCao
                .create({

                    root,

                    api:
                        API.baoCao,

                    fileName:
                        'tc01',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        initialize();


        /*
         * ==========================================
         * INIT TC01
         * ==========================================
         */

        async function initialize() {

            try {

                report.setLoading(
                    true
                );


                const [
                    loaiThoiGian,
                    coSo,
                    nhaAn,
                    doiTuong,
                    taiKhoan,
                    hinhThucThanhToan,
                    thuChi,
                    trangThaiThanhToan,
                    caAn,
                    trangThaiSuDung
                ] =
                    await Promise.all([

                        report.loadList(
                            API.loaiThoiGian
                        ),

                        report.loadList(
                            API.coSo
                        ),

                        report.loadList(
                            API.nhaAn
                        ),

                        report.loadList(
                            API.doiTuong
                        ),

                        report.loadList(
                            API.taiKhoan
                        ),

                        report.loadList(
                            API.hinhThucThanhToan
                        ),

                        report.loadList(
                            API.thuChi
                        ),

                        report.loadList(
                            API.trangThaiThanhToan
                        ),

                        report.loadList(
                            API.caAn
                        ),

                        report.loadList(
                            API.trangThaiSuDung
                        )

                    ]);


                state.coSo =
                    coSo;

                state.nhaAn =
                    nhaAn;

                state.caAn =
                    caAn;

                state.taiKhoan =
                    taiKhoan;


                /*
                 * Loại thời gian TC01:
                 *
                 * 10 = tạo
                 * 30 = thanh toán
                 * 40 = hoàn
                 */
                report
                    .setSingleSelectOptions(
                        'loaiThoiGian',

                        loaiThoiGian
                            .filter(
                                item =>
                                    [
                                        10,
                                        30,
                                        40
                                    ].includes(
                                        Number(
                                            item.value
                                        )
                                    )
                            )
                            .map(
                                item => ({
                                    value:
                                        item.value,

                                    label:
                                        item.name
                                })
                            ),

                        30
                    );


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
                 * Nhà ăn phụ thuộc cơ sở.
                 */
                renderNhaAn();


                /*
                 * Đối tượng
                 */
                report
                    .setMultipleSelectOptions(
                        'doiTuong',

                        doiTuong.map(
                            item => ({
                                value:
                                    item.value,

                                label:
                                    item.name
                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .doiTuong
                    );


                /*
                 * Người tạo / Thu ngân
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
                        'nguoiTaoIds',
                        taiKhoanOptions,
                        [],
                        MULTI_SELECT_DEFAULTS
                            .nguoiTaoIds
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
                 * Hình thức thanh toán
                 */
                report
                    .setMultipleSelectOptions(
                        'hinhThucThanhToan',

                        hinhThucThanhToan.map(
                            item => ({
                                value:
                                    item.value,

                                label:
                                    item.name
                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .hinhThucThanhToan
                    );


                /*
                 * Thu / Chi
                 */
                report
                    .setMultipleSelectOptions(
                        'hienThiThuChi',

                        thuChi.map(
                            item => ({
                                value:
                                    item.value,

                                label:
                                    item.name
                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .hienThiThuChi
                    );


                /*
                 * Trạng thái thanh toán
                 */
                report
                    .setMultipleSelectOptions(
                        'trangThaiThanhToan',

                        trangThaiThanhToan.map(
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
                 * Ca ăn
                 */
                report
                    .setMultipleSelectOptions(
                        'caAnIds',

                        caAn.map(
                            item => ({
                                value:
                                    item.id,

                                label:
                                    item.tenCaAn ||
                                    item.ten ||
                                    '-'
                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .caAnIds
                    );


                /*
                 * Trạng thái sử dụng
                 */
                report
                    .setMultipleSelectOptions(
                        'trangThaiSuDung',

                        trangThaiSuDung.map(
                            item => ({
                                value:
                                    item.value,

                                label:
                                    item.name
                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .trangThaiSuDung
                    );


                /*
                 * Quy tắc Tất cả
                 * do bao-cao.js xử lý.
                 */
                report
                    .bindAllOptions(
                        MULTI_SELECT_DEFAULTS
                    );


                /*
                 * Ngày mặc định hôm nay.
                 */
                report
                    .setDefaultDateRange(
                        'tuNgay',
                        'denNgay'
                    );


                bindTc01Events();

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
                        'Không thể tải dữ liệu bộ lọc TC01.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }
        }


        /*
         * ==========================================
         * EVENT RIÊNG TC01
         * ==========================================
         */

        function bindTc01Events() {

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


            /*
             * Không chọn cơ sở
             * hoặc "Tất cả"
             * → lấy toàn bộ nhà ăn.
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
                    state.nhaAn.filter(
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
         * BUILD PAYLOAD TC01
         * ==========================================
         */

        function getFilters() {

            const loaiThoiGian =
                report
                    .getSingleNumber(
                        'loaiThoiGian'
                    );


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
                !loaiThoiGian
            ) {
                throw new Error(
                    'Vui lòng chọn loại thời gian.'
                );
            }


            if (!tuNgay) {
                throw new Error(
                    'Vui lòng chọn từ ngày.'
                );
            }


            if (!denNgay) {
                throw new Error(
                    'Vui lòng chọn đến ngày.'
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

                loaiThoiGian,

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

                doiTuong:
                    report
                        .getMultiNumbers(
                            'doiTuong'
                        ),

                nguoiTaoIds:
                    report
                        .getMultiNumbers(
                            'nguoiTaoIds'
                        ),

                thuNganIds:
                    report
                        .getMultiNumbers(
                            'thuNganIds'
                        ),

                hinhThucThanhToan:
                    report
                        .getMultiNumbers(
                            'hinhThucThanhToan'
                        ),

                hienThiThuChi:
                    report
                        .getMultiNumbers(
                            'hienThiThuChi'
                        ),

                trangThaiThanhToan:
                    report
                        .getMultiNumbers(
                            'trangThaiThanhToan'
                        ),

                caAnIds:
                    report
                        .getMultiNumbers(
                            'caAnIds'
                        ),

                trangThaiSuDung:
                    report
                        .getMultiNumbers(
                            'trangThaiSuDung'
                        )

            };
        }


        /*
         * ==========================================
         * RESET RIÊNG TC01
         * ==========================================
         */

        function resetFilters() {

            /*
             * Loại thời gian mặc định:
             * Theo thời gian thanh toán.
             */
            report
                .setSingleSelectValue(
                    'loaiThoiGian',
                    30
                );


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
         * LABEL TÀI KHOẢN TC01
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