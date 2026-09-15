'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-dh03-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG DH03
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/don-hang/dh03',

            nhomSanPham:
                '/api/mcs/v1/dm-nhom-san-pham/tong-hop?active=true',

            sanPham:
                '/api/mcs/v1/dm-san-pham/tong-hop?active=true',

            khungGioNhan:
                '/api/mcs/v1/dm-khung-gio-nhan-hang/tong-hop?active=true',

            trangThaiDon:
                '/api/mcs/v1/enums?name=trangThaiDonHang'

        };


        /*
         * ==========================================
         * TRẠNG THÁI NHÁP
         * ==========================================
         *
         * Đơn nháp chưa phải đơn đã đặt.
         *
         * BE helper cũng đã loại:
         *
         * dh.trang_thai <> S.NHAP
         */

        const TRANG_THAI_NHAP =
            10;


        /*
         * ==========================================
         * DEFAULT MULTI SELECT
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                nhomSanPhamIds:
                    false,

                sanPhamIds:
                    false,

                khungGioNhanIds:
                    false,

                trangThaiDon:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG DH03
         * ==========================================
         */

        const state = {

            nhomSanPham:
                [],

            sanPham:
                []

        };


        /*
         * ==========================================
         * ENGINE BÁO CÁO CHUNG
         * ==========================================
         */

        const report =
            window.MCS
                .baoCao
                .create({

                    root,

                    permission:
                        'Q003018',

                    api:
                        API.baoCao,

                    fileName:
                        'dh03',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        /*
         * Phải truyền initialize,
         * không gọi initialize().
         *
         * Engine sẽ kiểm tra quyền trước.
         */

        report.start(
            initialize
        );


        /*
         * ==========================================
         * INITIALIZE
         * ==========================================
         */

        async function initialize() {

            try {

                report.setLoading(
                    true
                );


                const [
                    nhomSanPham,
                    sanPham,
                    khungGioNhan,
                    trangThaiDon
                ] =
                    await Promise.all([

                        report.loadList(
                            API.nhomSanPham
                        ),

                        report.loadList(
                            API.sanPham
                        ),

                        report.loadList(
                            API.khungGioNhan
                        ),

                        report.loadList(
                            API.trangThaiDon
                        )

                    ]);


                state.nhomSanPham =
                    nhomSanPham;


                state.sanPham =
                    sanPham;


                /*
                 * ======================================
                 * NHÓM SẢN PHẨM
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'nhomSanPhamIds',

                        nhomSanPham.map(
                            item => ({

                                value:
                                    item.id,

                                label:
                                    buildNhomSanPhamLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nhomSanPhamIds
                    );


                /*
                 * ======================================
                 * SẢN PHẨM / DỊCH VỤ
                 * ======================================
                 *
                 * Phụ thuộc Nhóm sản phẩm.
                 *
                 * Ban đầu chưa chọn nhóm
                 * => hiển thị toàn bộ.
                 */

                renderSanPham();


                /*
                 * ======================================
                 * KHUNG GIỜ NHẬN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'khungGioNhanIds',

                        khungGioNhan.map(
                            item => ({

                                value:
                                    item.id,

                                label:
                                    buildKhungGioLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .khungGioNhanIds
                    );


                /*
                 * ======================================
                 * TRẠNG THÁI ĐƠN
                 * ======================================
                 *
                 * Không hiển thị đơn Nháp.
                 */

                const trangThaiDonOptions =
                    trangThaiDon
                        .filter(
                            item =>
                                Number(
                                    item.value
                                ) !==
                                TRANG_THAI_NHAP
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
                        'trangThaiDon',

                        trangThaiDonOptions,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .trangThaiDon
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
                 *
                 * DH03 luôn dùng:
                 *
                 * ngày nhận dự kiến.
                 */

                report
                    .setDefaultDateRange(
                        'tuNgay',
                        'denNgay'
                    );


                /*
                 * ======================================
                 * EVENT RIÊNG DH03
                 * ======================================
                 */

                bindDh03Events();


                /*
                 * ======================================
                 * FILTER CHƯA HỖ TRỢ
                 * ======================================
                 *
                 * coSoIds:
                 *
                 * BE tự ép theo cơ sở của user.
                 *
                 * nhaAnIds:
                 *
                 * Đơn hàng hiện chưa lưu nhà ăn.
                 */

                disableUnsupportedFilters();

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
                        'Không thể tải dữ liệu bộ lọc DH03.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * EVENT RIÊNG DH03
         * ==========================================
         */

        function bindDh03Events() {

            /*
             * Khi thay đổi nhóm sản phẩm:
             *
             * - báo cáo cũ không còn hợp lệ
             * - lọc lại danh sách sản phẩm
             */

            root
                .querySelector(
                    '#nhomSanPhamIds'
                )
                ?.addEventListener(
                    'change',
                    () => {

                        report
                            .invalidateReport();


                        renderSanPham();

                    }
                );

        }


        /*
         * ==========================================
         * SẢN PHẨM THEO NHÓM
         * ==========================================
         */

        function renderSanPham() {

            const nhomSanPhamIds =
                report
                    .getMultiValues(
                        'nhomSanPhamIds'
                    );


            const selected =
                report
                    .getMultiValues(
                        'sanPhamIds'
                    );


            let records =
                state.sanPham;


            /*
             * Không chọn nhóm
             * hoặc đang ở trạng thái "Tất cả"
             *
             * => hiển thị toàn bộ sản phẩm.
             */

            if (
                nhomSanPhamIds.length >
                0
            ) {

                const set =
                    new Set(
                        nhomSanPhamIds.map(
                            String
                        )
                    );


                records =
                    state.sanPham
                        .filter(
                            item => {

                                const nhomSanPhamId =
                                    item.nhomSanPhamId ??
                                    item.nhom_san_pham_id ??
                                    item.nhomSanPham?.id ??
                                    null;


                                return set.has(
                                    String(
                                        nhomSanPhamId ??
                                        ''
                                    )
                                );

                            }
                        );

            }


            /*
             * Chỉ giữ các sản phẩm đã chọn
             * mà vẫn thuộc nhóm hiện tại.
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
                    'sanPhamIds',

                    records.map(
                        item => ({

                            value:
                                item.id,

                            label:
                                buildSanPhamLabel(
                                    item
                                )

                        })
                    ),

                    preserved,

                    preserved.length ===
                        0
                        ? MULTI_SELECT_DEFAULTS
                            .sanPhamIds
                        : false
                );

        }


        /*
         * ==========================================
         * BUILD PAYLOAD DH03
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
             * TỪ NGÀY
             * ======================================
             */

            if (
                !tuNgay
            ) {

                throw new Error(
                    'Vui lòng chọn từ ngày nhận dự kiến.'
                );

            }


            /*
             * ======================================
             * ĐẾN NGÀY
             * ======================================
             */

            if (
                !denNgay
            ) {

                throw new Error(
                    'Vui lòng chọn đến ngày nhận dự kiến.'
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


            /*
             * ======================================
             * VALIDATE KHOẢNG NGÀY
             * ======================================
             */

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


            /*
             * ======================================
             * PAYLOAD
             * ======================================
             *
             * DH03 không có loaiThoiGian.
             *
             * Repository luôn dùng:
             *
             * dh.thoi_gian_nhan_tu
             *
             *
             * Không gửi coSoIds:
             *
             * dat-mon.controller tự ép cơ sở
             * theo user hiện tại.
             *
             *
             * nhaAnIds:
             *
             * phải luôn [] vì đơn hàng
             * hiện chưa lưu nhà ăn.
             */

            return {

                /*
                 * Ngày nhận dự kiến
                 */

                tuNgay:
                    tuNgayIso,

                denNgay:
                    denNgayIso,


                /*
                 * Nhà ăn
                 */

                nhaAnIds:
                    [],


                /*
                 * Nhóm sản phẩm
                 */

                nhomSanPhamIds:
                    report
                        .getMultiNumbers(
                            'nhomSanPhamIds'
                        ),


                /*
                 * Sản phẩm / dịch vụ
                 */

                sanPhamIds:
                    report
                        .getMultiNumbers(
                            'sanPhamIds'
                        ),


                /*
                 * Khung giờ nhận
                 */

                khungGioNhanIds:
                    report
                        .getMultiNumbers(
                            'khungGioNhanIds'
                        ),


                /*
                 * Trạng thái đơn
                 */

                trangThaiDon:
                    report
                        .getMultiNumbers(
                            'trangThaiDon'
                        )

            };

        }


        /*
         * ==========================================
         * RESET DH03
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
             * RESET NGÀY
             * ======================================
             */

            report
                .setDefaultDateRange(
                    'tuNgay',
                    'denNgay'
                );


            /*
             * Nhóm đã reset
             * => render lại toàn bộ sản phẩm.
             */

            renderSanPham();


            /*
             * Cơ sở / Nhà ăn hiện chưa dùng.
             */

            disableUnsupportedFilters();

        }


        /*
         * ==========================================
         * FILTER CHƯA HỖ TRỢ
         * ==========================================
         */

        function disableUnsupportedFilters() {

            disableField(
                'coSoIds'
            );


            disableField(
                'nhaAnIds'
            );

        }


        /*
         * ==========================================
         * DISABLE FIELD
         * ==========================================
         */

        function disableField(
            id
        ) {

            const element =
                root.querySelector(
                    `#${id}`
                );


            if (
                !element
            ) {
                return;
            }


            element.disabled =
                true;


            const wrapper =
                element.closest(
                    '.form-field, .catalog-form-field, [data-select]'
                );


            if (
                wrapper
            ) {

                wrapper.classList.add(
                    'is-disabled'
                );

            }

        }


        /*
         * ==========================================
         * LABEL NHÓM SẢN PHẨM
         * ==========================================
         */

        function buildNhomSanPhamLabel(
            item
        ) {

            const ma =
                item.maNhomSanPham ||
                item.ma_nhom_san_pham ||
                '';


            const ten =
                item.tenNhomSanPham ||
                item.ten_nhom_san_pham ||
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
                `Nhóm sản phẩm #${item.id}`
            );

        }


        /*
         * ==========================================
         * LABEL SẢN PHẨM
         * ==========================================
         */

        function buildSanPhamLabel(
            item
        ) {

            const ma =
                item.maSanPham ||
                item.ma_san_pham ||
                '';


            const ten =
                item.tenSanPham ||
                item.ten_san_pham ||
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
                `Sản phẩm #${item.id}`
            );

        }


        /*
         * ==========================================
         * LABEL KHUNG GIỜ NHẬN
         * ==========================================
         */

        function buildKhungGioLabel(
            item
        ) {

            const ma =
                item.maKhungGio ||
                item.ma_khung_gio ||
                '';


            const ten =
                item.tenKhungGio ||
                item.ten_khung_gio ||
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
                `Khung giờ #${item.id}`
            );

        }

    }
);