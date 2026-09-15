'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-va03-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG VA03
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/ve-an/va03',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            caAn:
                '/api/mcs/v1/dm-ca-an/tong-hop?active=true',

            nhanVien:
                '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true',

            phongBan:
                '/api/mcs/v1/dm-phong-ban/tong-hop?active=true',

            trangThaiVe:
                '/api/mcs/v1/enums?name=trangThaiVe'

        };


        /*
         * ==========================================
         * DEFAULT MULTI SELECT VA03
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                coSoIds:
                    true,

                /*
                 * Nhà ăn phụ thuộc Cơ sở.
                 */

                nhaAnIds:
                    false,

                caAnIds:
                    true,

                /*
                 * Không chọn nhân viên cụ thể
                 * mặc định.
                 */

                nhanVienIds:
                    false,

                /*
                 * Không chọn phòng ban cụ thể
                 * mặc định.
                 */

                phongBanIds:
                    false,

                /*
                 * Mặc định tất cả trạng thái vé.
                 */

                trangThaiVe:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG VA03
         * ==========================================
         */

        const state = {

            coSo:
                [],

            nhaAn:
                [],

            caAn:
                [],

            nhanVien:
                [],

            phongBan:
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
                        'Q003013',

                    api:
                        API.baoCao,

                    fileName:
                        'va03',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        /*
         * Truyền function initialize,
         * không gọi initialize().
         */

        report.start(
            initialize
        );


        /*
         * ==========================================
         * INIT VA03
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
                    caAn,
                    nhanVien,
                    phongBan,
                    trangThaiVe
                ] =
                    await Promise.all([

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
                            API.nhanVien
                        ),

                        report.loadList(
                            API.phongBan
                        ),

                        report.loadList(
                            API.trangThaiVe
                        )

                    ]);


                /*
                 * ======================================
                 * STATE
                 * ======================================
                 */

                state.coSo =
                    coSo;


                state.nhaAn =
                    nhaAn;


                state.caAn =
                    caAn;


                state.nhanVien =
                    nhanVien;


                state.phongBan =
                    phongBan;


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
                                    buildCoSoLabel(
                                        item
                                    )

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
                 *
                 * Phụ thuộc Cơ sở.
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
                                    buildCaAnLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .caAnIds
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
                 * Phụ thuộc Phòng ban.
                 */

                renderNhanVien();


                /*
                 * ======================================
                 * TRẠNG THÁI VÉ
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'trangThaiVe',

                        trangThaiVe.map(
                            item => ({

                                value:
                                    item.value,

                                label:
                                    item.name

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .trangThaiVe
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
                 * EVENT RIÊNG VA03
                 * ======================================
                 */

                bindVa03Events();

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
                        'Không thể tải dữ liệu bộ lọc VA03.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * EVENT RIÊNG VA03
         * ==========================================
         */

        function bindVa03Events() {

            /*
             * ======================================
             * CƠ SỞ
             * ======================================
             *
             * Cơ sở thay đổi
             * => cập nhật Nhà ăn.
             */

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


            /*
             * ======================================
             * PHÒNG BAN
             * ======================================
             *
             * Phòng ban thay đổi
             * => cập nhật Nhân viên.
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
             * Không chọn Cơ sở
             * hoặc chọn "Tất cả":
             *
             * => hiển thị toàn bộ Nhà ăn.
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
                    state.nhaAn
                        .filter(
                            item => {

                                const coSoId =
                                    item.coSoId ??
                                    item.co_so_id ??
                                    item.coSo?.id ??
                                    null;


                                return set.has(
                                    String(
                                        coSoId ??
                                        ''
                                    )
                                );

                            }
                        );

            }


            /*
             * ======================================
             * GIỮ LỰA CHỌN CÒN HỢP LỆ
             * ======================================
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
                    'nhaAnIds',

                    records.map(
                        item => ({

                            value:
                                item.id,

                            label:
                                buildNhaAnLabel(
                                    item
                                )

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
             * Không chọn Phòng ban
             * hoặc để "Tất cả":
             *
             * => hiển thị toàn bộ Nhân viên.
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
             * Giữ nhân viên đang chọn
             * nếu vẫn thuộc phòng ban mới.
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
         * BUILD PAYLOAD VA03
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
                    'Vui lòng chọn từ ngày sử dụng.'
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
                    'Vui lòng chọn đến ngày sử dụng.'
                );

            }


            /*
             * ======================================
             * CHUẨN NGÀY NHÓM VA
             * ======================================
             *
             * ve-an-report.helper.js yêu cầu:
             *
             * yyyy-MM-dd
             *
             * Không gửi ISO datetime.
             */

            const tuNgayValue =
                getDateOnly(
                    tuNgay
                );


            const denNgayValue =
                getDateOnly(
                    denNgay
                );


            if (
                !tuNgayValue
            ) {

                throw new Error(
                    'Từ ngày sử dụng không hợp lệ.'
                );

            }


            if (
                !denNgayValue
            ) {

                throw new Error(
                    'Đến ngày sử dụng không hợp lệ.'
                );

            }


            /*
             * yyyy-MM-dd có thể so sánh
             * trực tiếp theo chuỗi.
             */

            if (
                tuNgayValue >
                denNgayValue
            ) {

                throw new Error(
                    'Từ ngày sử dụng không được lớn hơn đến ngày sử dụng.'
                );

            }


            /*
             * ======================================
             * PAYLOAD VA03
             * ======================================
             */

            return {

                /*
                 * ==================================
                 * NGÀY PHỤC VỤ
                 * ==================================
                 */

                tuNgay:
                    tuNgayValue,

                denNgay:
                    denNgayValue,


                /*
                 * ==================================
                 * CƠ SỞ
                 * ==================================
                 */

                coSoIds:
                    report
                        .getMultiNumbers(
                            'coSoIds'
                        ),


                /*
                 * ==================================
                 * NHÀ ĂN
                 * ==================================
                 */

                nhaAnIds:
                    report
                        .getMultiNumbers(
                            'nhaAnIds'
                        ),


                /*
                 * ==================================
                 * CA ĂN
                 * ==================================
                 */

                caAnIds:
                    report
                        .getMultiNumbers(
                            'caAnIds'
                        ),


                /*
                 * ==================================
                 * NHÂN VIÊN
                 * ==================================
                 */

                nhanVienIds:
                    report
                        .getMultiNumbers(
                            'nhanVienIds'
                        ),


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
                 * TRẠNG THÁI VÉ
                 * ==================================
                 *
                 * Repository VA03 sử dụng:
                 *
                 * locTheoPhieu = true
                 *
                 * nên trạng thái này dùng để chọn
                 * phiếu có ít nhất một vé phù hợp.
                 */

                trangThaiVe:
                    report
                        .getMultiNumbers(
                            'trangThaiVe'
                        )

            };

        }


        /*
         * ==========================================
         * RESET VA03
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
             * ======================================
             * RESET SELECT PHỤ THUỘC
             * ======================================
             */

            renderNhaAn();


            renderNhanVien();

        }


        /*
         * ==========================================
         * DATE CONTROL → yyyy-MM-dd
         * ==========================================
         */

        function getDateOnly(
            value
        ) {

            if (
                value ===
                    null ||
                value ===
                    undefined
            ) {

                return '';

            }


            const text =
                String(
                    value
                )
                    .trim();


            /*
             * Trường hợp phổ biến:
             *
             * yyyy-MM-dd
             * yyyy-MM-dd HH:mm:ss
             * yyyy-MM-ddTHH:mm:ss
             */

            const match =
                text.match(
                    /^(\d{4}-\d{2}-\d{2})/
                );


            if (
                match
            ) {

                return match[1];

            }


            /*
             * Fallback nếu forms/date
             * trả giá trị kiểu khác.
             */

            const date =
                new Date(
                    value
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return '';

            }


            const year =
                date.getFullYear();


            const month =
                String(
                    date.getMonth() +
                    1
                )
                    .padStart(
                        2,
                        '0'
                    );


            const day =
                String(
                    date.getDate()
                )
                    .padStart(
                        2,
                        '0'
                    );


            return (
                `${year}-${month}-${day}`
            );

        }


        /*
         * ==========================================
         * LABEL CƠ SỞ
         * ==========================================
         */

        function buildCoSoLabel(
            item
        ) {

            const ma =
                item.maCoSo ||
                item.ma_co_so ||
                '';


            const ten =
                item.tenCoSo ||
                item.ten_co_so ||
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
                `Cơ sở #${item.id}`
            );

        }


        /*
         * ==========================================
         * LABEL NHÀ ĂN
         * ==========================================
         */

        function buildNhaAnLabel(
            item
        ) {

            const ma =
                item.maNhaAn ||
                item.ma_nha_an ||
                '';


            const ten =
                item.tenNhaAn ||
                item.ten_nha_an ||
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
                `Nhà ăn #${item.id}`
            );

        }


        /*
         * ==========================================
         * LABEL CA ĂN
         * ==========================================
         */

        function buildCaAnLabel(
            item
        ) {

            const ma =
                item.maCaAn ||
                item.ma_ca_an ||
                '';


            const ten =
                item.tenCaAn ||
                item.ten_ca_an ||
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
                `Ca ăn #${item.id}`
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

            const ma =
                item.maNhanVien ||
                item.ma_nhan_vien ||
                '';


            const ten =
                item.hoTen ||
                item.ho_ten ||
                item.tenNhanVien ||
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
                `Nhân viên #${item.id}`
            );

        }

    }
);