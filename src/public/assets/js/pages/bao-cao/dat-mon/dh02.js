'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-dh02-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG DH02
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/don-hang/dh02',

            nhanVien:
                '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true',

            phongBan:
                '/api/mcs/v1/dm-phong-ban/tong-hop?active=true',

            trangThaiDon:
                '/api/mcs/v1/enums?name=trangThaiDonHang'

        };


        /*
         * ==========================================
         * LOẠI THỜI GIAN DH02
         * ==========================================
         *
         * BE dat-mon-report.helper.js
         * chỉ nhận:
         *
         * NGAY_DAT
         * NGAY_NHAN
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
                    'Ngày nhận dự kiến'
            }

        ];


        /*
         * ==========================================
         * TRẠNG THÁI NHÁP
         * ==========================================
         *
         * Đơn nháp không thuộc báo cáo.
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

                nguoiDatIds:
                    false,

                nguoiNhanIds:
                    false,

                phongBanIds:
                    false,

                trangThaiDon:
                    true

            });


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
                        'Q003017',

                    api:
                        API.baoCao,

                    fileName:
                        'dh02',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        /*
         * Không gọi:
         *
         * report.start(
         *     initialize()
         * );
         *
         * Phải truyền function.
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
                    nhanVien,
                    phongBan,
                    trangThaiDon
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
                 * Chung một danh mục cho:
                 *
                 * - Người đặt
                 * - Người nhận
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


                /*
                 * Người đặt
                 */

                report
                    .setMultipleSelectOptions(
                        'nguoiDatIds',

                        nhanVienOptions,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nguoiDatIds
                    );


                /*
                 * Người nhận
                 */

                report
                    .setMultipleSelectOptions(
                        'nguoiNhanIds',

                        nhanVienOptions,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nguoiNhanIds
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
                 * Không hiển thị đơn nháp.
                 *
                 * Repository cũng đã loại:
                 *
                 * dh.trang_thai <> S.NHAP
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
                        'Không thể tải dữ liệu bộ lọc DH02.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * BUILD PAYLOAD DH02
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
             * LOẠI THỜI GIAN
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


            /*
             * ======================================
             * TỪ NGÀY
             * ======================================
             */

            if (
                !tuNgay
            ) {

                throw new Error(
                    'Vui lòng chọn từ ngày.'
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


            /*
             * ======================================
             * VALIDATE KHOẢNG THỜI GIAN
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
             * MÃ ĐƠN
             * ======================================
             */

            const maDon =
                getValue(
                    'maDon'
                );


            /*
             * ======================================
             * PAYLOAD
             * ======================================
             *
             * Không gửi coSoIds.
             *
             * dat-mon.controller.js tự ép:
             *
             * coSoIds = [coSoId của user].
             *
             *
             * nhaAnIds luôn [] vì đơn hàng
             * hiện chưa lưu nhà ăn.
             */

            return {

                /*
                 * Thời gian
                 */

                loaiThoiGian,

                tuNgay:
                    tuNgayIso,

                denNgay:
                    denNgayIso,


                /*
                 * Nhà ăn
                 *
                 * BE yêu cầu phải rỗng.
                 */

                nhaAnIds:
                    [],


                /*
                 * Mã đơn
                 */

                maDon,


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
         * RESET DH02
         * ==========================================
         */

        function resetFilters() {

            /*
             * Loại thời gian mặc định:
             *
             * Ngày đặt.
             */

            report
                .setSingleSelectValue(
                    'loaiThoiGian',
                    'NGAY_DAT'
                );


            /*
             * ======================================
             * RESET MÃ ĐƠN
             * ======================================
             */

            const maDon =
                root.querySelector(
                    '#maDon'
                );


            if (
                maDon
            ) {

                maDon.value =
                    '';

            }


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


        }


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