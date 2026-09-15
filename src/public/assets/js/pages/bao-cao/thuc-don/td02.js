'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-td02-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG TD02
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/thuc-don/td02',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            caAn:
                '/api/mcs/v1/dm-ca-an/tong-hop?active=true',

            thucDon:
                '/api/mcs/v1/thuc-don/tong-hop',

            nhomMonAn:
                '/api/mcs/v1/dm-nhom-mon-an/tong-hop?active=true',

            monAn:
                '/api/mcs/v1/dm-mon-an/tong-hop?active=true',

            trangThaiThucDon:
                '/api/mcs/v1/enums?name=trangThaiThucDon'

        };


        /*
         * ==========================================
         * DEFAULT MULTI SELECT TD02
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

                nhomMonAnIds:
                    true,

                monAnIds:
                    true,

                trangThaiThucDon:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG TD02
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

            nhomMonAn:
                [],

            monAn:
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
                        'Q003007',

                    api:
                        API.baoCao,

                    fileName:
                        'td02',

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
         * INIT TD02
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
                    nhomMonAn,
                    monAn,
                    trangThaiThucDon
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
                            API.nhomMonAn
                        ),

                        report.loadList(
                            API.monAn
                        ),

                        report.loadList(
                            API.trangThaiThucDon
                        )

                    ]);


                /*
                 * ======================================
                 * LƯU STATE
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


                state.nhomMonAn =
                    nhomMonAn;


                state.monAn =
                    monAn;


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
                 * NHÓM MÓN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'nhomMonAnIds',

                        nhomMonAn.map(
                            item => ({

                                value:
                                    item.id,

                                label:
                                    buildNhomMonAnLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nhomMonAnIds
                    );


                /*
                 * ======================================
                 * MÓN ĂN
                 * ======================================
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
                 * TRẠNG THÁI THỰC ĐƠN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'trangThaiThucDon',

                        trangThaiThucDon.map(
                            item => ({

                                value:
                                    item.value,

                                label:
                                    item.name

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .trangThaiThucDon
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
                 * EVENT RIÊNG TD02
                 * ======================================
                 */

                bindTd02Events();

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
                        'Không thể tải dữ liệu bộ lọc TD02.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * EVENT RIÊNG TD02
         * ==========================================
         */

        function bindTd02Events() {

            /*
             * Cơ sở thay đổi:
             *
             * - cập nhật Nhà ăn
             * - cập nhật Thực đơn
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
             * Nhà ăn thay đổi:
             *
             * cập nhật Thực đơn.
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
             * Ca ăn thay đổi:
             *
             * cập nhật Thực đơn.
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
             * Không chọn cơ sở
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
             * Giữ lại lựa chọn còn hợp lệ.
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
         * BUILD PAYLOAD TD02
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
                    'Vui lòng chọn từ ngày áp dụng.'
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
                    'Vui lòng chọn đến ngày áp dụng.'
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
                    'Từ ngày áp dụng không được lớn hơn đến ngày áp dụng.'
                );

            }


            /*
             * ======================================
             * PAYLOAD TD02
             * ======================================
             */

            return {

                /*
                 * Khoảng ngày áp dụng.
                 */

                tuNgay:
                    tuNgayIso,

                denNgay:
                    denNgayIso,


                /*
                 * Cơ sở.
                 */

                coSoIds:
                    report
                        .getMultiNumbers(
                            'coSoIds'
                        ),


                /*
                 * Nhà ăn.
                 */

                nhaAnIds:
                    report
                        .getMultiNumbers(
                            'nhaAnIds'
                        ),


                /*
                 * Ca ăn.
                 */

                caAnIds:
                    report
                        .getMultiNumbers(
                            'caAnIds'
                        ),


                /*
                 * Thực đơn.
                 */

                thucDonIds:
                    report
                        .getMultiNumbers(
                            'thucDonIds'
                        ),


                /*
                 * Nhóm món.
                 */

                nhomMonAnIds:
                    report
                        .getMultiNumbers(
                            'nhomMonAnIds'
                        ),


                /*
                 * Món ăn.
                 */

                monAnIds:
                    report
                        .getMultiNumbers(
                            'monAnIds'
                        ),


                /*
                 * Trạng thái thực đơn.
                 */

                trangThaiThucDon:
                    report
                        .getMultiNumbers(
                            'trangThaiThucDon'
                        )

            };

        }


        /*
         * ==========================================
         * RESET TD02
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
             * Cơ sở về Tất cả:
             *
             * => Nhà ăn về toàn bộ.
             */

            renderNhaAn();


            /*
             * Cơ sở / Nhà ăn / Ca ăn
             * về trạng thái mặc định:
             *
             * => Thực đơn về toàn bộ.
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
         * LABEL NHÓM MÓN
         * ==========================================
         */

        function buildNhomMonAnLabel(
            item
        ) {

            const ma =
                item.maNhomMonAn ||
                item.ma_nhom_mon_an ||
                '';


            const ten =
                item.tenNhomMonAn ||
                item.ten_nhom_mon_an ||
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
                `Nhóm món #${item.id}`
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

    }
);