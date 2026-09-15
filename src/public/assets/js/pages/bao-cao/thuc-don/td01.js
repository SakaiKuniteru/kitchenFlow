'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-td01-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG TD01
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/thuc-don/td01',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            caAn:
                '/api/mcs/v1/dm-ca-an/tong-hop?active=true',

            trangThaiThucDon:
                '/api/mcs/v1/enums?name=trangThaiThucDon'

        };


        /*
         * ==========================================
         * DEFAULT MULTI SELECT TD01
         * ==========================================
         *
         * true:
         * hiển thị "Tất cả" mặc định.
         *
         * false:
         * để trống mặc định.
         *
         * Nhà ăn để false vì danh sách phụ thuộc
         * vào Cơ sở đang chọn.
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                coSoIds:
                    true,

                nhaAnIds:
                    false,

                caAnIds:
                    true,

                trangThaiThucDon:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG TD01
         * ==========================================
         */

        const state = {

            coSo:
                [],

            nhaAn:
                [],

            caAn:
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
                        'Q003006',

                    api:
                        API.baoCao,

                    fileName:
                        'td01',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        /*
         * Truyền function initialize.
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
         * INIT TD01
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
                 * Nhà ăn phụ thuộc Cơ sở.
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
                 * EVENT RIÊNG TD01
                 * ======================================
                 */

                bindTd01Events();

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
                        'Không thể tải dữ liệu bộ lọc TD01.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * EVENT RIÊNG TD01
         * ==========================================
         */

        function bindTd01Events() {

            /*
             * Cơ sở thay đổi:
             *
             * - report hiện tại không còn hợp lệ
             * - render lại Nhà ăn
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
             * hoặc đang chọn "Tất cả"
             *
             * getMultiValues() sẽ trả [].
             *
             * Khi đó hiển thị toàn bộ Nhà ăn.
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
             * Giữ lại Nhà ăn đang chọn
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
         * BUILD PAYLOAD TD01
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
             * PAYLOAD
             * ======================================
             *
             * Khớp trực tiếp với:
             *
             * thuc-don-report.helper.js
             *
             * coSoIds
             * nhaAnIds
             * caAnIds
             * trangThaiThucDon
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
         * RESET TD01
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
             * Cơ sở đã reset về Tất cả
             *
             * => Nhà ăn hiển thị lại toàn bộ.
             */

            renderNhaAn();

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

    }
);