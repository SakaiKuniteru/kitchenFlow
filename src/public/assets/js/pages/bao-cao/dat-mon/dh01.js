'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-dh01-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG DH01
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/don-hang/dh01',

            nhanVien:
                '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true',

            phongBan:
                '/api/mcs/v1/dm-phong-ban/tong-hop?active=true',

            trangThaiDon:
                '/api/mcs/v1/enums?name=trangThaiDonHang',

            phuongThucThanhToan:
                '/api/mcs/v1/enums?name=phuongThucThanhToanDonHang',

            trangThaiThanhToan:
                '/api/mcs/v1/enums?name=trangThaiThanhToanDonHang'

        };


        /*
         * ==========================================
         * LOẠI THỜI GIAN DH01
         * ==========================================
         *
         * BE không dùng enum số.
         *
         * Chỉ nhận:
         *
         * NGAY_DAT
         * NGAY_NHAN
         * ==========================================
         */

        const LOAI_THOI_GIAN_OPTIONS = [

            {
                value:
                    'NGAY_DAT',

                label:
                    'Ngày đặt'
            },

            {
                value:
                    'NGAY_NHAN',

                label:
                    'Ngày nhận'
            }

        ];


        /*
         * ==========================================
         * TRẠNG THÁI ĐƠN NHÁP
         * ==========================================
         *
         * Đơn nháp không thuộc báo cáo.
         * BE cũng đã loại trạng thái này.
         * ==========================================
         */

        const TRANG_THAI_NHAP =
            10;


        /*
         * ==========================================
         * DEFAULT MULTI SELECT DH01
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                nguoiDatIds:
                    false,

                nguoiNhanIds:
                    false,

                phongBanIds:
                    false,

                nguoiXuLyIds:
                    false,

                trangThaiDon:
                    true,

                phuongThucThanhToan:
                    true,

                trangThaiThanhToan:
                    true

            });


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

                    permission:
                        'Q003016',

                    api:
                        API.baoCao,

                    fileName:
                        'dh01',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        /*
         * Quan trọng:
         *
         * Không viết:
         *
         * report.start(
         *     initialize()
         * );
         *
         * Phải truyền function để engine
         * kiểm tra quyền trước.
         */

        report.start(
            initialize
        );


        /*
         * ==========================================
         * INIT DH01
         * ==========================================
         */

        async function initialize() {

            try {

                report.setLoading(
                    true
                );


                const [
                    nhanVien,
                    phongBan,
                    trangThaiDon,
                    phuongThucThanhToan,
                    trangThaiThanhToan
                ] =
                    await Promise.all([

                        report.loadList(
                            API.nhanVien
                        ),

                        report.loadList(
                            API.phongBan
                        ),

                        report.loadList(
                            API.trangThaiDon
                        ),

                        report.loadList(
                            API.phuongThucThanhToan
                        ),

                        report.loadList(
                            API.trangThaiThanhToan
                        )

                    ]);


                /*
                 * ======================================
                 * LOẠI THỜI GIAN
                 * ======================================
                 */

                report
                    .setSingleSelectOptions(
                        'loaiThoiGian',

                        LOAI_THOI_GIAN_OPTIONS,

                        'NGAY_DAT'
                    );


                /*
                 * ======================================
                 * NHÂN VIÊN
                 * ======================================
                 *
                 * Một nguồn dữ liệu dùng cho:
                 *
                 * - Người đặt
                 * - Người nhận
                 * - Người xử lý
                 * ======================================
                 */

                const nhanVienOptions =
                    nhanVien.map(
                        item => ({

                            value:
                                item.id,

                            label:
                                buildNhanVienLabel(
                                    item
                                )

                        })
                    );


                report
                    .setMultipleSelectOptions(
                        'nguoiDatIds',

                        nhanVienOptions,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nguoiDatIds
                    );


                report
                    .setMultipleSelectOptions(
                        'nguoiNhanIds',

                        nhanVienOptions,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nguoiNhanIds
                    );


                report
                    .setMultipleSelectOptions(
                        'nguoiXuLyIds',

                        nhanVienOptions,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nguoiXuLyIds
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
                                    item.tenPhongBan ||
                                    item.ten ||
                                    '-'

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .phongBanIds
                    );


                /*
                 * ======================================
                 * TRẠNG THÁI ĐƠN
                 * ======================================
                 *
                 * Không đưa "Đơn nháp" vào bộ lọc.
                 *
                 * BE cũng loại đơn nháp khỏi dữ liệu.
                 * ======================================
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
                 * PHƯƠNG THỨC THANH TOÁN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'phuongThucThanhToan',

                        phuongThucThanhToan
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
                            .phuongThucThanhToan
                    );


                /*
                 * ======================================
                 * TRẠNG THÁI THANH TOÁN
                 * ======================================
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
                 * ======================================
                 * RULE "TẤT CẢ"
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
                        'Không thể tải dữ liệu bộ lọc DH01.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }
        }


        /*
         * ==========================================
         * BUILD PAYLOAD DH01
         * ==========================================
         */

        function getFilters() {

            const loaiThoiGian =
                getValue(
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


            /*
             * ======================================
             * VALIDATE THỜI GIAN
             * ======================================
             */

            if (
                !loaiThoiGian
            ) {

                throw new Error(
                    'Vui lòng chọn loại thời gian.'
                );

            }


            if (
                ![
                    'NGAY_DAT',
                    'NGAY_NHAN'
                ].includes(
                    loaiThoiGian
                )
            ) {

                throw new Error(
                    'Loại thời gian báo cáo không hợp lệ.'
                );

            }


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


            /*
             * ======================================
             * PAYLOAD
             * ======================================
             *
             * Không gửi:
             *
             * - coSoIds
             * - caAnIds
             *
             * coSoIds:
             * BE tự ép theo cơ sở của người dùng.
             *
             * caAnIds:
             * BE DH cấm field này.
             *
             * nhaAnIds:
             * phải luôn [] vì đơn hàng hiện
             * chưa lưu nhà ăn.
             * ======================================
             */

            return {

                loaiThoiGian,

                tuNgay:
                    tuNgayIso,

                denNgay:
                    denNgayIso,


                /*
                 * Đơn hàng hiện chưa có nhà ăn.
                 */
                nhaAnIds:
                    [],


                /*
                 * Người đặt
                 */
                nguoiDatIds:
                    report
                        .getMultiNumbers(
                            'nguoiDatIds'
                        ),


                /*
                 * Người nhận
                 */
                nguoiNhanIds:
                    report
                        .getMultiNumbers(
                            'nguoiNhanIds'
                        ),


                /*
                 * Phòng ban
                 */
                phongBanIds:
                    report
                        .getMultiNumbers(
                            'phongBanIds'
                        ),


                /*
                 * Người xử lý
                 */
                nguoiXuLyIds:
                    report
                        .getMultiNumbers(
                            'nguoiXuLyIds'
                        ),


                /*
                 * Trạng thái đơn hàng
                 */
                trangThaiDon:
                    report
                        .getMultiNumbers(
                            'trangThaiDon'
                        ),


                /*
                 * Phương thức thanh toán
                 */
                phuongThucThanhToan:
                    report
                        .getMultiNumbers(
                            'phuongThucThanhToan'
                        ),


                /*
                 * Trạng thái thanh toán
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
         * RESET DH01
         * ==========================================
         */

        function resetFilters() {

            /*
             * Mặc định:
             * Theo ngày đặt hàng.
             */

            report
                .setSingleSelectValue(
                    'loaiThoiGian',
                    'NGAY_DAT'
                );


            /*
             * Reset toàn bộ multi-select.
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
             * Reset ngày về mặc định.
             */

            report
                .setDefaultDateRange(
                    'tuNgay',
                    'denNgay'
                );
        }


        /*
         * ==========================================
         * GET VALUE
         * ==========================================
         */

        function getValue(
            id
        ) {

            return String(
                root
                    .querySelector(
                        `#${id}`
                    )
                    ?.value ||
                ''
            )
                .trim();
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