'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-dh05-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG DH05
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/don-hang/dh05',

            nhanVien:
                '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true',

            trangThaiDon:
                '/api/mcs/v1/enums?name=trangThaiDonHang'

        };


        /*
         * ==========================================
         * TIẾN ĐỘ / ĐÁNH GIÁ DH05
         * ==========================================
         *
         * value phải khớp chính xác với
         * dh05.repository.js:
         *
         * DUNG_HAN
         * TRE_HAN
         * DANG_TRE
         * CHUA_QUA_HAN
         * KHONG_DANH_GIA
         * THIEU_DU_LIEU
         * ==========================================
         */

        const TIEN_DO_OPTIONS = [

            {
                value:
                    'DUNG_HAN',

                label:
                    'Hoàn thành đúng hạn'
            },

            {
                value:
                    'TRE_HAN',

                label:
                    'Hoàn thành trễ hạn'
            },

            {
                value:
                    'DANG_TRE',

                label:
                    'Chưa hoàn thành, đang trễ hạn'
            },

            {
                value:
                    'CHUA_QUA_HAN',

                label:
                    'Chưa hoàn thành, chưa quá hạn'
            },

            {
                value:
                    'KHONG_DANH_GIA',

                label:
                    'Không đánh giá'
            },

            {
                value:
                    'THIEU_DU_LIEU',

                label:
                    'Thiếu dữ liệu đánh giá'
            }

        ];


        /*
         * ==========================================
         * DEFAULT MULTI SELECT DH05
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                /*
                 * Tất cả trạng thái đơn
                 * trừ đơn nháp.
                 */
                trangThaiDon:
                    true,

                /*
                 * Không chọn người xử lý
                 * = không lọc người xử lý.
                 */
                nguoiXuLyIds:
                    false,

                /*
                 * Tất cả tiến độ.
                 */
                tienDo:
                    true

            });


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
                        'Q003020',

                    api:
                        API.baoCao,

                    fileName:
                        'dh05',

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
         * INIT DH05
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
                 * TRẠNG THÁI ĐƠN
                 * ======================================
                 *
                 * DH05 đánh giá cả:
                 *
                 * - đơn đang xử lý
                 * - hoàn thành
                 * - đóng đơn
                 * - đã hủy
                 * - từ chối
                 *
                 * Chỉ loại Đơn nháp.
                 */

                const trangThaiOptions =
                    trangThaiDon
                        .filter(
                            item =>
                                String(
                                    item.name ||
                                    ''
                                )
                                    .trim()
                                    .toLowerCase() !==
                                'đơn nháp'
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
                 * BE lọc:
                 *
                 * dh.nguoi_xu_ly_id
                 *
                 * nên value là dm_nhan_vien.id.
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
                 * TIẾN ĐỘ
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'tienDo',

                        TIEN_DO_OPTIONS,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .tienDo
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
                 * FIELD KHÔNG DÙNG
                 * ======================================
                 *
                 * coSoIds:
                 *
                 * Controller báo cáo đơn hàng
                 * tự ép theo cơ sở của người dùng.
                 *
                 *
                 * nhaAnIds:
                 *
                 * nv_don_hang hiện chưa lưu nhà ăn,
                 * schema BE bắt buộc array rỗng.
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
                        'Không thể tải dữ liệu bộ lọc DH05.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * BUILD PAYLOAD DH05
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


            if (
                !tuNgay
            ) {

                throw new Error(
                    'Vui lòng chọn từ ngày nhận dự kiến.'
                );

            }


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


            if (
                new Date(
                    tuNgayIso
                ).getTime() >
                new Date(
                    denNgayIso
                ).getTime()
            ) {

                throw new Error(
                    'Từ ngày nhận dự kiến không được lớn hơn đến ngày nhận dự kiến.'
                );

            }


            /*
             * ======================================
             * PAYLOAD
             * ======================================
             *
             * Repository DH05 dùng:
             *
             * taoBoLoc(
             *     filters,
             *     'dh.thoi_gian_nhan_tu'
             * );
             *
             * nên không cần gửi loaiThoiGian.
             */

            return {

                /*
                 * Khoảng ngày nhận dự kiến.
                 */

                tuNgay:
                    tuNgayIso,

                denNgay:
                    denNgayIso,


                /*
                 * Đơn hàng hiện chưa lưu nhà ăn.
                 *
                 * taoSchema() của báo cáo đơn hàng
                 * yêu cầu nhaAnIds max(0).
                 */

                nhaAnIds:
                    [],


                /*
                 * Trạng thái đơn.
                 *
                 * Khi chọn "Tất cả":
                 *
                 * report.getMultiNumbers()
                 * trả [].
                 *
                 * Với DH05 điều này đúng:
                 * [] = không thêm điều kiện lọc.
                 */

                trangThaiDon:
                    report
                        .getMultiNumbers(
                            'trangThaiDon'
                        ),


                /*
                 * Người xử lý.
                 */

                nguoiXuLyIds:
                    report
                        .getMultiNumbers(
                            'nguoiXuLyIds'
                        ),


                /*
                 * QUAN TRỌNG:
                 *
                 * Form HBS tên field:
                 *
                 * tienDo
                 *
                 * Nhưng repository đọc:
                 *
                 * filters.danhGia
                 *
                 * nên map tại đây.
                 */

                danhGia:
                    report
                        .getMultiValues(
                            'tienDo'
                        )

            };

        }


        /*
         * ==========================================
         * RESET DH05
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
             * Ngày về hôm nay.
             */

            report
                .setDefaultDateRange(
                    'tuNgay',
                    'denNgay'
                );


            /*
             * Giữ cơ sở / nhà ăn
             * ở trạng thái không sử dụng.
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

    }
);