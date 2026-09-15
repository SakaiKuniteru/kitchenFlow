'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-va01-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG VA01
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/ve-an/va01',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            caAn:
                '/api/mcs/v1/dm-ca-an/tong-hop?active=true',

            loaiVe:
                '/api/mcs/v1/enums?name=doiTuongLayVe',

            trangThaiVe:
                '/api/mcs/v1/enums?name=trangThaiVe'

        };


        /*
         * ==========================================
         * DEFAULT MULTI SELECT VA01
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

                loaiVe:
                    true,

                trangThaiVe:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG VA01
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
                        'Q003011',

                    api:
                        API.baoCao,

                    fileName:
                        'va01',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        /*
         * Truyền function.
         *
         * Không:
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
         * INIT VA01
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
                    loaiVe,
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
                            API.loaiVe
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
                 * LOẠI VÉ
                 * ======================================
                 *
                 * Backend:
                 *
                 * p.doi_tuong_lay_ve
                 *
                 * Enum:
                 *
                 * doiTuongLayVe
                 */

                report
                    .setMultipleSelectOptions(
                        'loaiVe',

                        loaiVe.map(
                            item => ({

                                value:
                                    item.value,

                                label:
                                    item.name

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .loaiVe
                    );


                /*
                 * ======================================
                 * TRẠNG THÁI VÉ
                 * ======================================
                 *
                 * Backend:
                 *
                 * v.trang_thai
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
                 * EVENT RIÊNG VA01
                 * ======================================
                 */

                bindVa01Events();

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
                        'Không thể tải dữ liệu bộ lọc VA01.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * EVENT RIÊNG VA01
         * ==========================================
         */

        function bindVa01Events() {

            /*
             * Cơ sở thay đổi:
             *
             * - invalidate báo cáo hiện tại
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
             * hoặc chọn "Tất cả":
             *
             * getMultiValues() trả [].
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
         * BUILD PAYLOAD VA01
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
             * VA KHÁC DH / TD
             * ======================================
             *
             * ve-an-report.helper.js đang validate:
             *
             * yyyy-MM-dd
             *
             * nên KHÔNG gửi ISO datetime.
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
             * yyyy-MM-dd có thể so sánh trực tiếp
             * theo thứ tự từ điển.
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
             * PAYLOAD VA01
             * ======================================
             */

            return {

                /*
                 * ==================================
                 * NGÀY SỬ DỤNG
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
                 * LOẠI VÉ
                 * ==================================
                 *
                 * Repository:
                 *
                 * p.doi_tuong_lay_ve
                 */

                loaiVe:
                    report
                        .getMultiNumbers(
                            'loaiVe'
                        ),


                /*
                 * ==================================
                 * TRẠNG THÁI VÉ
                 * ==================================
                 *
                 * Repository:
                 *
                 * v.trang_thai
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
         * RESET VA01
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
             * RESET NHÀ ĂN
             * ======================================
             *
             * Cơ sở trở về "Tất cả"
             * => Nhà ăn hiển thị lại toàn bộ.
             */

            renderNhaAn();

        }


        /*
         * ==========================================
         * CHUYỂN DATE CONTROL → yyyy-MM-dd
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
             * Trường hợp thường gặp:
             *
             * yyyy-MM-dd
             *
             * yyyy-MM-dd HH:mm:ss
             *
             * yyyy-MM-ddTHH:mm:ss...
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
             * Fallback:
             *
             * dùng Date nếu date control
             * trả format khác.
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

    }
);