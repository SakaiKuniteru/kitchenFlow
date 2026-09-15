'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-dh07-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG DH07
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/don-hang/dh07',

            phongBan:
                '/api/mcs/v1/dm-phong-ban/tong-hop?active=true',

            nhanVien:
                '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true',

            trangThaiDon:
                '/api/mcs/v1/enums?name=trangThaiDonHang'

        };


        /*
         * ==========================================
         * HÌNH THỨC ĐẶT
         * ==========================================
         *
         * Phải khớp:
         *
         * HINH_THUC_DAT
         *
         * trong dh07.validation.js.
         */

        const HINH_THUC_DAT_OPTIONS = [

            {
                value:
                    10,

                label:
                    'Đặt cho mình'
            },

            {
                value:
                    20,

                label:
                    'Đặt hộ'
            }

        ];


        /*
         * ==========================================
         * TRẠNG THÁI NHÁP
         * ==========================================
         *
         * Helper BE đã loại:
         *
         * dh.trang_thai <> S.NHAP
         *
         * nên FE cũng không hiển thị
         * "Đơn nháp".
         */

        const TEN_TRANG_THAI_NHAP =
            'Đơn nháp';


        /*
         * ==========================================
         * DEFAULT MULTI SELECT
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                phongBanIds:
                    false,

                nhanVienIds:
                    false,

                hinhThucDat:
                    true,

                trangThaiDon:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG DH07
         * ==========================================
         */

        const state = {

            phongBan:
                [],

            nhanVien:
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
                        'Q003023',

                    api:
                        API.baoCao,

                    fileName:
                        'dh07',

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
         * INIT DH07
         * ==========================================
         */

        async function initialize() {

            try {

                report.setLoading(
                    true
                );


                const [
                    phongBan,
                    nhanVien,
                    trangThaiDon
                ] =
                    await Promise.all([

                        report.loadList(
                            API.phongBan
                        ),

                        report.loadList(
                            API.nhanVien
                        ),

                        report.loadList(
                            API.trangThaiDon
                        )

                    ]);


                state.phongBan =
                    phongBan;


                state.nhanVien =
                    nhanVien;


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
                                    buildPhongBanLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .phongBanIds
                    );


                /*
                 * ======================================
                 * NHÂN VIÊN
                 * ======================================
                 *
                 * Ban đầu:
                 *
                 * chưa chọn phòng ban
                 * => hiển thị toàn bộ nhân viên.
                 */

                renderNhanVien();


                /*
                 * ======================================
                 * HÌNH THỨC ĐẶT
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'hinhThucDat',

                        HINH_THUC_DAT_OPTIONS,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .hinhThucDat
                    );


                /*
                 * ======================================
                 * TRẠNG THÁI ĐƠN
                 * ======================================
                 */

                const trangThaiOptions =
                    trangThaiDon
                        .filter(
                            item =>
                                String(
                                    item.name ||
                                    ''
                                )
                                    .trim() !==
                                TEN_TRANG_THAI_NHAP
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
                 * EVENT RIÊNG DH07
                 * ======================================
                 */

                bindDh07Events();


                /*
                 * ======================================
                 * FIELD KHÔNG HỖ TRỢ
                 * ======================================
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
                        'Không thể tải dữ liệu bộ lọc DH07.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * EVENT RIÊNG DH07
         * ==========================================
         */

        function bindDh07Events() {

            /*
             * Khi thay đổi phòng ban:
             *
             * lọc lại nhân viên
             * thuộc phòng ban đang chọn.
             */

            root
                .querySelector(
                    '#phongBanIds'
                )
                ?.addEventListener(
                    'change',
                    () => {

                        report
                            .invalidateReport();


                        renderNhanVien();

                    }
                );

        }


        /*
         * ==========================================
         * NHÂN VIÊN THEO PHÒNG BAN
         * ==========================================
         */

        function renderNhanVien() {

            const phongBanIds =
                report
                    .getMultiValues(
                        'phongBanIds'
                    );


            const selected =
                report
                    .getMultiValues(
                        'nhanVienIds'
                    );


            let records =
                state.nhanVien;


            /*
             * Không chọn phòng ban:
             *
             * => hiển thị toàn bộ nhân viên.
             *
             * Nếu chọn một hoặc nhiều phòng:
             *
             * => chỉ giữ nhân viên thuộc
             * các phòng đó.
             */

            if (
                phongBanIds.length >
                0
            ) {

                const set =
                    new Set(
                        phongBanIds.map(
                            String
                        )
                    );


                records =
                    state.nhanVien
                        .filter(
                            item => {

                                const phongBanId =
                                    item.phongBanId ??
                                    item.phong_ban_id ??
                                    item.phongBan?.id ??
                                    null;


                                return set.has(
                                    String(
                                        phongBanId ??
                                        ''
                                    )
                                );

                            }
                        );

            }


            /*
             * Các nhân viên đang chọn nhưng
             * không còn thuộc phòng ban mới
             * sẽ bị bỏ.
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
                    'nhanVienIds',

                    records.map(
                        item => ({

                            value:
                                item.id,

                            label:
                                buildNhanVienLabel(
                                    item
                                )

                        })
                    ),

                    preserved,

                    preserved.length ===
                        0
                        ? MULTI_SELECT_DEFAULTS
                            .nhanVienIds
                        : false
                );

        }


        /*
         * ==========================================
         * BUILD PAYLOAD DH07
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
                    'Vui lòng chọn từ ngày đặt.'
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
                    'Vui lòng chọn đến ngày đặt.'
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
                    'Từ ngày đặt không được lớn hơn đến ngày đặt.'
                );

            }


            /*
             * ======================================
             * PAYLOAD
             * ======================================
             *
             * DH07 repository luôn lọc:
             *
             * dh.created_at
             *
             * nên không cần loaiThoiGian.
             */

            return {

                /*
                 * ==================================
                 * NGÀY ĐẶT
                 * ==================================
                 */

                tuNgay:
                    tuNgayIso,

                denNgay:
                    denNgayIso,


                /*
                 * ==================================
                 * NHÀ ĂN
                 * ==================================
                 *
                 * Đơn hàng hiện chưa lưu nha_an_id.
                 *
                 * Validation BE yêu cầu [].
                 */

                nhaAnIds:
                    [],


                /*
                 * ==================================
                 * PHÒNG BAN
                 * ==================================
                 */

                phongBanIds:
                    report
                        .getMultiNumbers(
                            'phongBanIds'
                        ),


                /*
                 * ==================================
                 * NHÂN VIÊN
                 * ==================================
                 *
                 * FE gửi:
                 *
                 * nhanVienIds
                 *
                 * Repository chuyển thành:
                 *
                 * nguoiDatIds
                 *
                 * rồi helper lọc:
                 *
                 * dh.nguoi_dat_id
                 */

                nhanVienIds:
                    report
                        .getMultiNumbers(
                            'nhanVienIds'
                        ),


                /*
                 * ==================================
                 * HÌNH THỨC ĐẶT
                 * ==================================
                 *
                 * 10 = Đặt cho mình
                 * 20 = Đặt hộ
                 *
                 * Khi chọn "Tất cả":
                 *
                 * []
                 *
                 * Repository hiểu [] =
                 * không lọc dh.dat_ho.
                 */

                hinhThucDat:
                    report
                        .getMultiNumbers(
                            'hinhThucDat'
                        ),


                /*
                 * ==================================
                 * TRẠNG THÁI ĐƠN
                 * ==================================
                 *
                 * [] = tất cả trạng thái
                 * trừ Nháp vì helper BE
                 * đã loại Nháp.
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
         * RESET DH07
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
             * Phòng ban đã reset
             * => hiển thị lại toàn bộ nhân viên.
             */

            renderNhanVien();


            /*
             * Giữ cơ sở / nhà ăn
             * ở trạng thái không hỗ trợ.
             */

            disableUnsupportedFilters();

        }


        /*
         * ==========================================
         * FIELD KHÔNG HỖ TRỢ
         * ==========================================
         */

        function disableUnsupportedFilters() {

            /*
             * coSoIds:
             *
             * dat-mon.controller tự xác định
             * cơ sở của nhân viên.
             */

            disableField(
                'coSoIds'
            );


            /*
             * nhaAnIds:
             *
             * nv_don_hang chưa lưu nha_an_id.
             */

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
         * LABEL PHÒNG BAN
         * ==========================================
         */

        function buildPhongBanLabel(
            item
        ) {

            const ma =
                item.maPhongBan ||
                item.ma_phong_ban ||
                '';


            const ten =
                item.tenPhongBan ||
                item.ten_phong_ban ||
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
                `Phòng ban #${item.id}`
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