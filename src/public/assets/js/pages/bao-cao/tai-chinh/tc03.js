'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-tc03-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG TC03
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/tai-chinh/tc03',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            caAn:
                '/api/mcs/v1/dm-ca-an/tong-hop?active=true',

            taiKhoan:
                '/api/mcs/v1/dm-tai-khoan/tong-hop?active=true',

            nhanVien:
                '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true',

            loaiThoiGian:
                '/api/mcs/v1/enums?name=loaiThoiGian',

            doiTuong:
                '/api/mcs/v1/enums?name=doiTuongLayVe',

            hinhThucThanhToan:
                '/api/mcs/v1/enums?name=phuongThucThanhToan',

            trangThaiPhieuThu:
                '/api/mcs/v1/enums?name=trangThaiPhieuThu',

            trangThaiSuDung:
                '/api/mcs/v1/enums?name=trangThaiVe'

        };


        /*
         * ==========================================
         * DEFAULT RIÊNG TC03
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                coSoIds:
                    true,

                nhaAnIds:
                    false,

                caAnIds:
                    true,

                doiTuong:
                    true,

                nguoiTaoIds:
                    false,

                nhanVienIds:
                    false,

                hinhThucThanhToan:
                    true,

                trangThaiPhieuThu:
                    true,

                trangThaiSuDung:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG TC03
         * ==========================================
         */

        const state = {

            nhaAn:
                []

        };


        /*
         * ==========================================
         * REPORT ENGINE CHUNG
         * ==========================================
         */

        const report =
            window.MCS
                .baoCao
                .create({

                    root,

                    permission:
                        'Q003003',

                    api:
                        API.baoCao,

                    fileName:
                        'tc03',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        /*
         * Quan trọng:
         *
         * Truyền function,
         * KHÔNG gọi initialize().
         */
        report.start(
            initialize
        );


        /*
         * ==========================================
         * INIT TC03
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
                    caAn,
                    doiTuong,
                    taiKhoan,
                    nhanVien,
                    hinhThucThanhToan,
                    trangThaiPhieuThu,
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
                            API.caAn
                        ),

                        report.loadList(
                            API.doiTuong
                        ),

                        report.loadList(
                            API.taiKhoan
                        ),

                        report.loadList(
                            API.nhanVien
                        ),

                        report.loadList(
                            API.hinhThucThanhToan
                        ),

                        report.loadList(
                            API.trangThaiPhieuThu
                        ),

                        report.loadList(
                            API.trangThaiSuDung
                        )

                    ]);


                state.nhaAn =
                    nhaAn;


                /*
                 * ======================================
                 * LOẠI THỜI GIAN
                 *
                 * TC03 chỉ cho:
                 * 10 = thời gian tạo phiếu
                 * ======================================
                 */

                report
                    .setSingleSelectOptions(
                        'loaiThoiGian',

                        loaiThoiGian
                            .filter(
                                item =>
                                    Number(
                                        item.value
                                    ) ===
                                    10
                            )
                            .map(
                                item => ({

                                    value:
                                        item.value,

                                    label:
                                        item.name

                                })
                            ),

                        10
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
                 * ======================================
                 * ĐỐI TƯỢNG
                 * ======================================
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
                 * ======================================
                 * NGƯỜI TẠO
                 *
                 * nguoiTaoIds = dm_tai_khoan.id
                 * ======================================
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


                /*
                 * ======================================
                 * NHÂN VIÊN LẤY VÉ
                 *
                 * nhanVienIds = dm_nhan_vien.id
                 * ======================================
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
                 * HÌNH THỨC THANH TOÁN
                 * ======================================
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
                 * ======================================
                 * TRẠNG THÁI PHIẾU
                 *
                 * TC03 chỉ lấy:
                 * 0, 10, 20, 30
                 *
                 * Không đưa:
                 * 40 = đã thanh toán
                 * 50 = đã hủy
                 * 60 = đã hoàn
                 * -10 = tổng hợp UI
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'trangThaiPhieuThu',

                        trangThaiPhieuThu
                            .filter(
                                item =>
                                    [
                                        0,
                                        10,
                                        20,
                                        30
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

                        [],

                        MULTI_SELECT_DEFAULTS
                            .trangThaiPhieuThu
                    );


                /*
                 * ======================================
                 * TRẠNG THÁI SỬ DỤNG VÉ
                 * ======================================
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


                bindTc03Events();

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
                        'Không thể tải dữ liệu bộ lọc TC03.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }
        }


        /*
         * ==========================================
         * EVENT RIÊNG TC03
         * ==========================================
         */

        function bindTc03Events() {

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
         * BUILD PAYLOAD TC03
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
                Number(
                    loaiThoiGian
                ) !==
                10
            ) {

                throw new Error(
                    'TC03 chỉ hỗ trợ lọc theo ngày tạo phiếu.'
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

                loaiThoiGian:
                    10,

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

                caAnIds:
                    report
                        .getMultiNumbers(
                            'caAnIds'
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

                nhanVienIds:
                    report
                        .getMultiNumbers(
                            'nhanVienIds'
                        ),

                hinhThucThanhToan:
                    report
                        .getMultiNumbers(
                            'hinhThucThanhToan'
                        ),

                trangThaiPhieuThu:
                    report
                        .getMultiNumbers(
                            'trangThaiPhieuThu'
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
         * RESET TC03
         * ==========================================
         */

        function resetFilters() {

            report
                .setSingleSelectValue(
                    'loaiThoiGian',
                    10
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
         * LABEL TÀI KHOẢN
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


        /*
         * ==========================================
         * LABEL NHÂN VIÊN
         * ==========================================
         */

        function buildNhanVienLabel(
            item
        ) {

            const maNhanVien =
                item.maNhanVien ||
                item.ma_nhan_vien ||
                '';


            const hoTen =
                item.hoTen ||
                item.ho_ten ||
                item.tenNhanVien ||
                '';


            if (
                maNhanVien &&
                hoTen
            ) {

                return (
                    `${hoTen} (${maNhanVien})`
                );

            }


            return (
                hoTen ||
                maNhanVien ||
                `Nhân viên #${item.id}`
            );
        }

    }
);