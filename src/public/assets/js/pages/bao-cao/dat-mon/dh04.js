'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-dh04-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG DH04
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/don-hang/dh04',

            khungGioNhan:
                '/api/mcs/v1/dm-khung-gio-nhan-hang/tong-hop?active=true',

            diaDiemNhan:
                '/api/mcs/v1/dm-dia-diem-nhan-hang/tong-hop?active=true',

            nhanVien:
                '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true',

            trangThaiDon:
                '/api/mcs/v1/enums?name=trangThaiDonHang'

        };


        /*
         * ==========================================
         * TRẠNG THÁI ĐANG XỬ LÝ DH04
         * ==========================================
         *
         * Phải khớp với:
         *
         * TRANG_THAI_DANG_XU_LY
         *
         * ở dat-mon-report.helper.js:
         *
         * - Chờ xác nhận
         * - Đang chuẩn bị
         * - Sẵn sàng giao
         * - Đang giao
         *
         * Không hard-code value vì BE cũng lấy
         * value từ enum theo name.
         * ==========================================
         */

        const TEN_TRANG_THAI_DANG_XU_LY =
            new Set([
                'Chờ xác nhận',
                'Đang chuẩn bị',
                'Sẵn sàng giao',
                'Đang giao'
            ]);


        /*
         * BE cũng xác định các trạng thái này
         * từ enum theo đúng tên.
         */
        /*
         * don-hang.constants.js:
         *
         * CHO_XAC_NHAN
         * DANG_CHUAN_BI
         * SAN_SANG_GIAO
         * DANG_GIAO
         */


        /*
         * ==========================================
         * DEFAULT MULTI SELECT
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                khungGioNhanIds:
                    false,

                diaDiemNhanIds:
                    false,

                /*
                 * DH04 mặc định lấy toàn bộ
                 * trạng thái đang xử lý.
                 */
                trangThaiDon:
                    true,

                nguoiXuLyIds:
                    false

            });


        /*
         * ==========================================
         * STATE RIÊNG DH04
         * ==========================================
         */

        const state = {

            /*
             * Lưu value thật của 4 trạng thái
             * đang xử lý.
             *
             * Cần dùng khi select đang chọn
             * option __ALL__.
             */
            trangThaiDangXuLy:
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
                        'Q003019',

                    api:
                        API.baoCao,

                    fileName:
                        'dh04',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        /*
         * Truyền function.
         *
         * Không viết:
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
         * INITIALIZE
         * ==========================================
         */

        async function initialize() {

            try {

                report.setLoading(
                    true
                );


                const [
                    khungGioNhan,
                    diaDiemNhan,
                    nhanVien,
                    trangThaiDon
                ] =
                    await Promise.all([

                        report.loadList(
                            API.khungGioNhan
                        ),

                        report.loadList(
                            API.diaDiemNhan
                        ),

                        report.loadList(
                            API.nhanVien
                        ),

                        report.loadList(
                            API.trangThaiDon
                        )

                    ]);


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
                 * ĐỊA ĐIỂM NHẬN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'diaDiemNhanIds',

                        diaDiemNhan.map(
                            item => ({

                                value:
                                    item.id,

                                label:
                                    buildDiaDiemLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .diaDiemNhanIds
                    );


                /*
                 * ======================================
                 * TRẠNG THÁI ĐƠN
                 * ======================================
                 *
                 * DH04 chỉ cho phép 4 trạng thái:
                 *
                 * Chờ xác nhận
                 * Đang chuẩn bị
                 * Sẵn sàng giao
                 * Đang giao
                 */

                const trangThaiOptions =
                    trangThaiDon
                        .filter(
                            item =>
                                TEN_TRANG_THAI_DANG_XU_LY
                                    .has(
                                        String(
                                            item.name ||
                                            ''
                                        )
                                            .trim()
                                    )
                        )
                        .map(
                            item => ({

                                value:
                                    item.value,

                                label:
                                    item.name

                            })
                        );


                /*
                 * Lưu value thực tế.
                 *
                 * Không hard-code 10/20/30...
                 * để luôn đồng bộ với enum BE.
                 */

                state.trangThaiDangXuLy =
                    trangThaiOptions
                        .map(
                            item =>
                                Number(
                                    item.value
                                )
                        )
                        .filter(
                            Number.isFinite
                        );


                if (
                    state
                        .trangThaiDangXuLy
                        .length ===
                    0
                ) {

                    throw new Error(
                        'Không tìm thấy trạng thái đơn đang xử lý của DH04.'
                    );

                }


                report
                    .setMultipleSelectOptions(
                        'trangThaiDon',

                        trangThaiOptions,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .trangThaiDon
                    );


                /*
                 * ======================================
                 * NGƯỜI XỬ LÝ
                 * ======================================
                 *
                 * BE dùng:
                 *
                 * dh.nguoi_xu_ly_id
                 *
                 * nên đây là ID dm_nhan_vien.
                 */

                report
                    .setMultipleSelectOptions(
                        'nguoiXuLyIds',

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
                            .nguoiXuLyIds
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
                 * NGÀY NHẬN MẶC ĐỊNH
                 * ======================================
                 *
                 * DH04 chỉ dùng một ngày.
                 */

                setDefaultNgayNhan();


                /*
                 * ======================================
                 * FIELD KHÔNG HỖ TRỢ
                 * ======================================
                 *
                 * coSoIds:
                 *
                 * BE tự ép theo cơ sở
                 * của nhân viên đăng nhập.
                 *
                 * nhaAnIds:
                 *
                 * nv_don_hang hiện chưa lưu nha_an_id.
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
                        'Không thể tải dữ liệu bộ lọc DH04.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * NGÀY NHẬN MẶC ĐỊNH
         * ==========================================
         */

        function setDefaultNgayNhan() {

            const today =
                report
                    .getTodayDate();


            /*
             * Giữ cùng định dạng với
             * setDefaultDateRange() của form chung:
             *
             * yyyy-MM-dd HH:mm:ss
             */

            report
                .setDateValue(
                    'ngayNhan',
                    `${today} 00:00:00`
                );

        }


        /*
         * ==========================================
         * BUILD PAYLOAD DH04
         * ==========================================
         */

        function getFilters() {

            const ngayNhan =
                report
                    .getDateValue(
                        'ngayNhan'
                    );


            if (
                !ngayNhan
            ) {

                throw new Error(
                    'Vui lòng chọn ngày nhận dự kiến.'
                );

            }


            /*
             * DH04 là báo cáo theo đúng 1 ngày.
             *
             * Vì BE vẫn dùng cấu trúc dùng chung:
             *
             * tuNgay
             * denNgay
             *
             * nên FE chuyển ngayNhan thành
             * cùng một giá trị cho cả hai.
             */

            const ngayNhanIso =
                report
                    .buildDateTime(
                        ngayNhan,
                        false
                    );


            /*
             * ======================================
             * TRẠNG THÁI
             * ======================================
             *
             * Form chung:
             *
             * __ALL__ bị loại khỏi getMultiNumbers().
             *
             * Vì vậy:
             *
             * "Tất cả"
             *
             * =>
             *
             * []
             *
             * Nhưng DH04 BE dùng:
             *
             * .min(1)
             *
             * nên phải đổi [] thành đầy đủ
             * 4 trạng thái đang xử lý.
             */

            let trangThaiDon =
                report
                    .getMultiNumbers(
                        'trangThaiDon'
                    );


            if (
                trangThaiDon.length ===
                0
            ) {

                trangThaiDon =
                    [
                        ...state
                            .trangThaiDangXuLy
                    ];

            }


            if (
                trangThaiDon.length ===
                0
            ) {

                throw new Error(
                    'Vui lòng chọn ít nhất một trạng thái đơn.'
                );

            }


            /*
             * ======================================
             * PAYLOAD
             * ======================================
             *
             * Không gửi coSoIds:
             *
             * controller BE tự xác định
             * cơ sở được phép xem.
             *
             *
             * nhaAnIds:
             *
             * bắt buộc gửi [] theo helper
             * báo cáo đơn hàng hiện tại.
             */

            return {

                /*
                 * Một ngày nhận.
                 */

                tuNgay:
                    ngayNhanIso,

                denNgay:
                    ngayNhanIso,


                /*
                 * Đơn hàng chưa lưu nhà ăn.
                 */

                nhaAnIds:
                    [],


                /*
                 * Khung giờ nhận.
                 */

                khungGioNhanIds:
                    report
                        .getMultiNumbers(
                            'khungGioNhanIds'
                        ),


                /*
                 * Địa điểm nhận.
                 */

                diaDiemNhanIds:
                    report
                        .getMultiNumbers(
                            'diaDiemNhanIds'
                        ),


                /*
                 * Trạng thái đang xử lý.
                 */

                trangThaiDon,


                /*
                 * Người xử lý.
                 *
                 * ID dm_nhan_vien.
                 */

                nguoiXuLyIds:
                    report
                        .getMultiNumbers(
                            'nguoiXuLyIds'
                        )

            };

        }


        /*
         * ==========================================
         * RESET DH04
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


            /*
             * Ngày nhận về hôm nay.
             */

            setDefaultNgayNhan();


            /*
             * Cơ sở / nhà ăn
             * vẫn ở trạng thái không sử dụng.
             */

            disableUnsupportedFilters();

        }


        /*
         * ==========================================
         * FIELD KHÔNG HỖ TRỢ
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
                    '[data-smart-select]'
                );


            if (
                wrapper
            ) {

                wrapper.classList.add(
                    'is-disabled'
                );


                wrapper
                    .querySelectorAll(
                        'button, input'
                    )
                    .forEach(
                        control => {

                            control.disabled =
                                true;

                        }
                    );

            }

        }


        /*
         * ==========================================
         * LABEL KHUNG GIỜ
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


        /*
         * ==========================================
         * LABEL ĐỊA ĐIỂM NHẬN
         * ==========================================
         */

        function buildDiaDiemLabel(
            item
        ) {

            const ma =
                item.maDiaDiem ||
                item.ma_dia_diem ||
                '';


            const ten =
                item.tenDiaDiem ||
                item.ten_dia_diem ||
                item.ten ||
                '';


            const diaChi =
                item.diaChiChiTiet ||
                item.diaChi ||
                item.dia_chi_chi_tiet ||
                '';


            if (
                ma &&
                ten
            ) {

                return (
                    `${ma} - ${ten}`
                );

            }


            if (
                ten &&
                diaChi
            ) {

                return (
                    `${ten} - ${diaChi}`
                );

            }


            return (
                ten ||
                diaChi ||
                ma ||
                `Địa điểm #${item.id}`
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
                    `${maNhanVien} - ${hoTen}`
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