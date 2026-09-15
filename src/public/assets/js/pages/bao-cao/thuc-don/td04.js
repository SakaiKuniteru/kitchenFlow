'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-td04-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG TD04
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/thuc-don/td04',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            caAn:
                '/api/mcs/v1/dm-ca-an/tong-hop?active=true',

            thucDon:
                '/api/mcs/v1/thuc-don/tong-hop',

            monAn:
                '/api/mcs/v1/dm-mon-an/tong-hop?active=true',

            thucPham:
                '/api/mcs/v1/dm-thuc-pham/tong-hop?active=true'

        };


        /*
         * ==========================================
         * NGUỒN SỐ SUẤT
         * ==========================================
         *
         * Phải khớp với:
         *
         * td04.validation.js
         *
         * 10 = Dự kiến
         * 20 = Đăng ký
         */

        const NGUON_SO_SUAT =
            Object.freeze({

                DU_KIEN:
                    10,

                DANG_KY:
                    20

            });


        const NGUON_SO_SUAT_OPTIONS = [

            {
                value:
                    NGUON_SO_SUAT
                        .DU_KIEN,

                label:
                    'Dự kiến'
            },

            {
                value:
                    NGUON_SO_SUAT
                        .DANG_KY,

                label:
                    'Đăng ký'
            }

        ];


        /*
         * ==========================================
         * DEFAULT MULTI SELECT TD04
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

                thucDonIds:
                    true,

                monAnIds:
                    true,

                thucPhamIds:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG TD04
         * ==========================================
         */

        const state = {

            coSo:
                [],

            nhaAn:
                [],

            caAn:
                [],

            thucDon:
                [],

            monAn:
                [],

            thucPham:
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
                        'Q003009',

                    api:
                        API.baoCao,

                    fileName:
                        'td04',

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
         * INIT TD04
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
                    thucDon,
                    monAn,
                    thucPham
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
                            API.thucDon
                        ),

                        report.loadList(
                            API.monAn
                        ),

                        report.loadList(
                            API.thucPham
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


                state.thucDon =
                    thucDon;


                state.monAn =
                    monAn;


                state.thucPham =
                    thucPham;


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
                 * THỰC ĐƠN
                 * ======================================
                 *
                 * Phụ thuộc:
                 *
                 * - Cơ sở
                 * - Nhà ăn
                 * - Ca ăn
                 */

                renderThucDon();


                /*
                 * ======================================
                 * MÓN ĂN
                 * ======================================
                 *
                 * Không lọc client theo Thực đơn.
                 *
                 * Quan hệ món thuộc thực đơn được
                 * xác định tại:
                 *
                 * ct_thuc_don_mon_an
                 */

                report
                    .setMultipleSelectOptions(
                        'monAnIds',

                        monAn.map(
                            item => ({

                                value:
                                    item.id,

                                label:
                                    buildMonAnLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .monAnIds
                    );


                /*
                 * ======================================
                 * THỰC PHẨM
                 * ======================================
                 *
                 * Không lọc client theo Món ăn.
                 *
                 * Quan hệ công thức nằm tại:
                 *
                 * ct_mon_an_thuc_pham
                 *
                 * Repository TD04 sẽ quyết định
                 * chính xác thực phẩm nào thuộc món.
                 */

                report
                    .setMultipleSelectOptions(
                        'thucPhamIds',

                        thucPham.map(
                            item => ({

                                value:
                                    item.id,

                                label:
                                    buildThucPhamLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .thucPhamIds
                    );


                /*
                 * ======================================
                 * NGUỒN SỐ SUẤT
                 * ======================================
                 *
                 * HBS:
                 *
                 * mode="single"
                 *
                 * Mặc định:
                 *
                 * Dự kiến.
                 */

                report
                    .setSingleSelectOptions(
                        'nguonSoSuat',

                        NGUON_SO_SUAT_OPTIONS,

                        NGUON_SO_SUAT
                            .DU_KIEN
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
                 * EVENT RIÊNG TD04
                 * ======================================
                 */

                bindTd04Events();

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
                        'Không thể tải dữ liệu bộ lọc TD04.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * EVENT RIÊNG TD04
         * ==========================================
         */

        function bindTd04Events() {

            /*
             * ======================================
             * CƠ SỞ
             * ======================================
             *
             * Cơ sở thay đổi:
             *
             * - render Nhà ăn
             * - render Thực đơn
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


                        renderThucDon();

                    }
                );


            /*
             * ======================================
             * NHÀ ĂN
             * ======================================
             */

            root
                .querySelector(
                    '#nhaAnIds'
                )
                ?.addEventListener(
                    'change',
                    () => {

                        report
                            .invalidateReport();


                        renderThucDon();

                    }
                );


            /*
             * ======================================
             * CA ĂN
             * ======================================
             */

            root
                .querySelector(
                    '#caAnIds'
                )
                ?.addEventListener(
                    'change',
                    () => {

                        report
                            .invalidateReport();


                        renderThucDon();

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
             * hoặc đang chọn "Tất cả":
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
             * Giữ các Nhà ăn đang chọn
             * nếu vẫn thuộc Cơ sở mới.
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
         * THỰC ĐƠN THEO TỔ CHỨC
         * ==========================================
         */

        function renderThucDon() {

            const coSoIds =
                report
                    .getMultiValues(
                        'coSoIds'
                    );


            const nhaAnIds =
                report
                    .getMultiValues(
                        'nhaAnIds'
                    );


            const caAnIds =
                report
                    .getMultiValues(
                        'caAnIds'
                    );


            const selected =
                report
                    .getMultiValues(
                        'thucDonIds'
                    );


            let records =
                state.thucDon;


            /*
             * ======================================
             * CƠ SỞ
             * ======================================
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
                    records.filter(
                        item =>
                            set.has(
                                String(
                                    getThucDonCoSoId(
                                        item
                                    ) ??
                                    ''
                                )
                            )
                    );

            }


            /*
             * ======================================
             * NHÀ ĂN
             * ======================================
             */

            if (
                nhaAnIds.length >
                0
            ) {

                const set =
                    new Set(
                        nhaAnIds.map(
                            String
                        )
                    );


                records =
                    records.filter(
                        item =>
                            set.has(
                                String(
                                    getThucDonNhaAnId(
                                        item
                                    ) ??
                                    ''
                                )
                            )
                    );

            }


            /*
             * ======================================
             * CA ĂN
             * ======================================
             */

            if (
                caAnIds.length >
                0
            ) {

                const set =
                    new Set(
                        caAnIds.map(
                            String
                        )
                    );


                records =
                    records.filter(
                        item =>
                            set.has(
                                String(
                                    getThucDonCaAnId(
                                        item
                                    ) ??
                                    ''
                                )
                            )
                    );

            }


            /*
             * ======================================
             * GIỮ THỰC ĐƠN CÒN HỢP LỆ
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
                    'thucDonIds',

                    records.map(
                        item => ({

                            value:
                                item.id,

                            label:
                                buildThucDonLabel(
                                    item
                                )

                        })
                    ),

                    preserved,

                    preserved.length ===
                        0
                        ? MULTI_SELECT_DEFAULTS
                            .thucDonIds
                        : false
                );

        }


        /*
         * ==========================================
         * BUILD PAYLOAD TD04
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
                    'Vui lòng chọn từ ngày phục vụ.'
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
                    'Vui lòng chọn đến ngày phục vụ.'
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
                    'Từ ngày phục vụ không được lớn hơn đến ngày phục vụ.'
                );

            }


            /*
             * ======================================
             * NGUỒN SỐ SUẤT
             * ======================================
             */

            const nguonSoSuat =
                report
                    .getSingleNumber(
                        'nguonSoSuat'
                    );


            if (
                !nguonSoSuat
            ) {

                throw new Error(
                    'Vui lòng chọn nguồn số suất.'
                );

            }


            if (
                ![
                    NGUON_SO_SUAT
                        .DU_KIEN,

                    NGUON_SO_SUAT
                        .DANG_KY

                ].includes(
                    nguonSoSuat
                )
            ) {

                throw new Error(
                    'Nguồn số suất không hợp lệ.'
                );

            }


            /*
             * ======================================
             * PAYLOAD TD04
             * ======================================
             */

            return {

                /*
                 * ==================================
                 * NGÀY PHỤC VỤ
                 * ==================================
                 */

                tuNgay:
                    tuNgayIso,

                denNgay:
                    denNgayIso,


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
                 * THỰC ĐƠN
                 * ==================================
                 */

                thucDonIds:
                    report
                        .getMultiNumbers(
                            'thucDonIds'
                        ),


                /*
                 * ==================================
                 * MÓN ĂN
                 * ==================================
                 */

                monAnIds:
                    report
                        .getMultiNumbers(
                            'monAnIds'
                        ),


                /*
                 * ==================================
                 * THỰC PHẨM
                 * ==================================
                 */

                thucPhamIds:
                    report
                        .getMultiNumbers(
                            'thucPhamIds'
                        ),


                /*
                 * ==================================
                 * NGUỒN SỐ SUẤT
                 * ==================================
                 *
                 * HBS là single select.
                 *
                 * Nhưng validation/repository BE
                 * đang xử lý array.
                 *
                 * Vì vậy gửi array 1 phần tử.
                 */

                nguonSoSuat:
                    [
                        nguonSoSuat
                    ]

            };

        }


        /*
         * ==========================================
         * RESET TD04
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
             * NGUỒN SỐ SUẤT
             * ======================================
             *
             * Mặc định Dự kiến.
             */

            report
                .setSingleSelectValue(
                    'nguonSoSuat',

                    NGUON_SO_SUAT
                        .DU_KIEN
                );


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
             * NHÀ ĂN
             * ======================================
             */

            renderNhaAn();


            /*
             * ======================================
             * THỰC ĐƠN
             * ======================================
             */

            renderThucDon();

        }


        /*
         * ==========================================
         * GET CƠ SỞ CỦA THỰC ĐƠN
         * ==========================================
         */

        function getThucDonCoSoId(
            item
        ) {

            return (
                item.coSoId ??
                item.co_so_id ??
                item.coSo?.id ??
                null
            );

        }


        /*
         * ==========================================
         * GET NHÀ ĂN CỦA THỰC ĐƠN
         * ==========================================
         */

        function getThucDonNhaAnId(
            item
        ) {

            return (
                item.nhaAnId ??
                item.nha_an_id ??
                item.nhaAn?.id ??
                null
            );

        }


        /*
         * ==========================================
         * GET CA ĂN CỦA THỰC ĐƠN
         * ==========================================
         */

        function getThucDonCaAnId(
            item
        ) {

            return (
                item.caAnId ??
                item.ca_an_id ??
                item.caAn?.id ??
                null
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
         * LABEL THỰC ĐƠN
         * ==========================================
         */

        function buildThucDonLabel(
            item
        ) {

            const ma =
                item.maThucDon ||
                item.ma_thuc_don ||
                '';


            const ten =
                item.tenThucDon ||
                item.ten_thuc_don ||
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
                `Thực đơn #${item.id}`
            );

        }


        /*
         * ==========================================
         * LABEL MÓN ĂN
         * ==========================================
         */

        function buildMonAnLabel(
            item
        ) {

            const ma =
                item.maMonAn ||
                item.ma_mon_an ||
                '';


            const ten =
                item.tenMonAn ||
                item.ten_mon_an ||
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
                `Món ăn #${item.id}`
            );

        }


        /*
         * ==========================================
         * LABEL THỰC PHẨM
         * ==========================================
         */

        function buildThucPhamLabel(
            item
        ) {

            const ma =
                item.maThucPham ||
                item.ma_thuc_pham ||
                '';


            const ten =
                item.tenThucPham ||
                item.ten_thuc_pham ||
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
                `Thực phẩm #${item.id}`
            );

        }

    }
);