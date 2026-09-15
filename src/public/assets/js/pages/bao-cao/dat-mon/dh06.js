'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-dh06-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG DH06
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/don-hang/dh06',

            nhanVien:
                '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true',

            trangThaiDon:
                '/api/mcs/v1/enums?name=trangThaiDonHang'

        };


        /*
         * ==========================================
         * TÊN TRẠNG THÁI HỦY / TỪ CHỐI
         * ==========================================
         *
         * BE không hard-code value.
         *
         * S.DA_HUY và S.TU_CHOI được lấy
         * từ enum trạng thái đơn hàng.
         *
         * FE cũng lọc theo name để luôn
         * đồng bộ với enum hệ thống.
         * ==========================================
         */

        const TEN_LOAI_XU_LY =
            new Set([
                'Đã huỷ',
                'Đã từ chối'
            ]);


        /*
         * ==========================================
         * DEFAULT MULTI SELECT
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                /*
                 * Không chọn người đặt
                 * => không lọc.
                 */

                nguoiDatIds:
                    false,


                /*
                 * Không chọn người thực hiện
                 * => không lọc.
                 */

                nguoiThucHienIds:
                    false,


                /*
                 * Mặc định:
                 *
                 * Hủy + Từ chối.
                 */

                loaiXuLy:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG DH06
         * ==========================================
         */

        const state = {

            /*
             * Lưu value thật:
             *
             * S.DA_HUY
             * S.TU_CHOI
             *
             * để xử lý trường hợp select đang
             * ở trạng thái __ALL__.
             */

            loaiXuLy:
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
                        'Q003022',

                    api:
                        API.baoCao,

                    fileName:
                        'dh06',

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
         * INIT DH06
         * ==========================================
         */

        async function initialize() {

            try {

                report.setLoading(
                    true
                );


                const [
                    nhanVien,
                    trangThaiDon
                ] =
                    await Promise.all([

                        report.loadList(
                            API.nhanVien
                        ),

                        report.loadList(
                            API.trangThaiDon
                        )

                    ]);


                /*
                 * ======================================
                 * NHÂN VIÊN
                 * ======================================
                 *
                 * Dùng chung cho:
                 *
                 * - Người đặt
                 * - Người thực hiện hủy / từ chối
                 *
                 * Cả hai đều là dm_nhan_vien.id.
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
                 * Người đặt.
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
                 * Người thực hiện.
                 *
                 * BE:
                 *
                 * filters.nguoiThucHienIds
                 *
                 * =>
                 *
                 * dh.nguoi_huy_id
                 */

                report
                    .setMultipleSelectOptions(
                        'nguoiThucHienIds',

                        nhanVienOptions,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nguoiThucHienIds
                    );


                /*
                 * ======================================
                 * HÌNH THỨC XỬ LÝ
                 * ======================================
                 *
                 * Form:
                 *
                 * loaiXuLy
                 *
                 * Giá trị:
                 *
                 * S.DA_HUY
                 * S.TU_CHOI
                 */

                const loaiXuLyOptions =
                    trangThaiDon
                        .filter(
                            item =>
                                TEN_LOAI_XU_LY
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

                                /*
                                 * Không hiển thị
                                 * "Đã huỷ", "Đã từ chối"
                                 * dài dòng trên filter.
                                 */

                                label:
                                    getLoaiXuLyLabel(
                                        item.name
                                    )

                            })
                        );


                state.loaiXuLy =
                    loaiXuLyOptions
                        .map(
                            item =>
                                Number(
                                    item.value
                                )
                        )
                        .filter(
                            Number.isFinite
                        );


                /*
                 * DH06 bắt buộc phải có đủ enum
                 * Hủy / Từ chối.
                 */

                if (
                    state.loaiXuLy.length !==
                    2
                ) {

                    throw new Error(
                        'Không xác định được trạng thái Hủy / Từ chối của đơn hàng.'
                    );

                }


                report
                    .setMultipleSelectOptions(
                        'loaiXuLy',

                        loaiXuLyOptions,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .loaiXuLy
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
                 * FILTER KHÔNG HỖ TRỢ
                 * ======================================
                 *
                 * coSoIds:
                 *
                 * controller đơn hàng tự ép về
                 * cơ sở của user.
                 *
                 * nhaAnIds:
                 *
                 * đơn hàng chưa lưu nhà ăn,
                 * validation yêu cầu [].
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
                        'Không thể tải dữ liệu bộ lọc DH06.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * BUILD PAYLOAD DH06
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
                    'Vui lòng chọn từ ngày hủy / từ chối.'
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
                    'Vui lòng chọn đến ngày hủy / từ chối.'
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
             * HÌNH THỨC XỬ LÝ
             * ======================================
             *
             * Form chung khi chọn "Tất cả":
             *
             * getMultiNumbers()
             *
             * =>
             *
             * []
             *
             * Nhưng validation DH06:
             *
             * loaiXuLy.min(1)
             *
             * nên phải chuyển [] thành:
             *
             * [
             *     S.DA_HUY,
             *     S.TU_CHOI
             * ]
             */

            let loaiXuLy =
                report
                    .getMultiNumbers(
                        'loaiXuLy'
                    );


            if (
                loaiXuLy.length ===
                0
            ) {

                loaiXuLy =
                    [
                        ...state
                            .loaiXuLy
                    ];

            }


            if (
                loaiXuLy.length ===
                0
            ) {

                throw new Error(
                    'Vui lòng chọn ít nhất một hình thức xử lý.'
                );

            }


            /*
             * ======================================
             * LÝ DO
             * ======================================
             */

            const lyDo =
                String(
                    root
                        .querySelector(
                            '#lyDo'
                        )
                        ?.value ||
                    ''
                )
                    .trim();


            /*
             * ======================================
             * PAYLOAD
             * ======================================
             *
             * DH06 repository dùng:
             *
             * thoi_gian_huy
             *
             * cho cả:
             *
             * - hủy
             * - từ chối
             */

            return {

                /*
                 * Khoảng ngày hủy / từ chối.
                 */

                tuNgay:
                    tuNgayIso,

                denNgay:
                    denNgayIso,


                /*
                 * Đơn hàng hiện chưa lưu nhà ăn.
                 */

                nhaAnIds:
                    [],


                /*
                 * Người đặt.
                 */

                nguoiDatIds:
                    report
                        .getMultiNumbers(
                            'nguoiDatIds'
                        ),


                /*
                 * Người thực hiện.
                 *
                 * Repository:
                 *
                 * dh.nguoi_huy_id
                 */

                nguoiThucHienIds:
                    report
                        .getMultiNumbers(
                            'nguoiThucHienIds'
                        ),


                /*
                 * Hủy / Từ chối.
                 */

                loaiXuLy,


                /*
                 * Tìm gần đúng trong:
                 *
                 * dh.ly_do_huy
                 */

                lyDo

            };

        }


        /*
         * ==========================================
         * RESET DH06
         * ==========================================
         */

        function resetFilters() {

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
             * LÝ DO
             * ======================================
             */

            const lyDo =
                root.querySelector(
                    '#lyDo'
                );


            if (
                lyDo
            ) {

                lyDo.value =
                    '';

            }


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
             * CƠ SỞ / NHÀ ĂN
             * ======================================
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

            const select =
                root.querySelector(
                    `#${id}`
                );


            if (
                !select
            ) {
                return;
            }


            select.disabled =
                true;


            /*
             * Smart select của form chung.
             */

            const wrapper =
                select.closest(
                    '[data-smart-select]'
                );


            if (
                !wrapper
            ) {
                return;
            }


            wrapper.classList.add(
                'is-disabled'
            );


            wrapper
                .querySelectorAll(
                    'button, input'
                )
                .forEach(
                    element => {

                        element.disabled =
                            true;

                    }
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


        /*
         * ==========================================
         * LABEL HÌNH THỨC XỬ LÝ
         * ==========================================
         */

        function getLoaiXuLyLabel(
            name
        ) {

            const value =
                String(
                    name ||
                    ''
                )
                    .trim();


            if (
                value ===
                'Đã huỷ'
            ) {

                return 'Hủy';

            }


            if (
                value ===
                'Đã từ chối'
            ) {

                return 'Từ chối';

            }


            return value;

        }

    }
);