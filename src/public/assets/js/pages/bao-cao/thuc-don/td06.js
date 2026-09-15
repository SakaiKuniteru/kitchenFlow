'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-td06-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG TD06
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/thuc-don/td06',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            loaiThucDon:
                '/api/mcs/v1/enums?name=loaiThucDon',

            trangThaiThucDon:
                '/api/mcs/v1/enums?name=trangThaiThucDon'

        };


        /*
         * ==========================================
         * DEFAULT MULTI SELECT TD06
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

                loaiThucDon:
                    true,

                trangThaiThucDon:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG TD06
         * ==========================================
         */

        const state = {

            coSo:
                [],

            nhaAn:
                [],

            loaiThucDon:
                [],

            trangThaiThucDon:
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
                        'Q003021',

                    api:
                        API.baoCao,

                    fileName:
                        'td06',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        /*
         * Phải truyền function.
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
         * INIT TD06
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
                    loaiThucDon,
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
                            API.loaiThucDon
                        ),

                        report.loadList(
                            API.trangThaiThucDon
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


                state.loaiThucDon =
                    loaiThucDon;


                state.trangThaiThucDon =
                    trangThaiThucDon;


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
                 * LOẠI THỰC ĐƠN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'loaiThucDon',

                        loaiThucDon.map(
                            item => ({

                                value:
                                    item.value,

                                label:
                                    item.name

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .loaiThucDon
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
                 * NGƯỜI LẬP / NGƯỜI DUYỆT
                 * ======================================
                 *
                 * nv_thuc_don hiện chưa có:
                 *
                 * nguoi_lap_id
                 * nguoi_duyet_id
                 *
                 * Repository TD06 cũng chưa filter
                 * hai trường này.
                 *
                 * Vì vậy khóa field để tránh user
                 * hiểu nhầm bộ lọc đang hoạt động.
                 */

                disableUnsupportedUserFilters();


                /*
                 * ======================================
                 * EVENT RIÊNG TD06
                 * ======================================
                 */

                bindTd06Events();

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
                        'Không thể tải dữ liệu bộ lọc TD06.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * EVENT RIÊNG TD06
         * ==========================================
         */

        function bindTd06Events() {

            /*
             * Cơ sở thay đổi:
             *
             * - report cũ không còn hợp lệ
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
             * hoặc đang chọn "Tất cả":
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
         * BUILD PAYLOAD TD06
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
             * PAYLOAD TD06
             * ======================================
             */

            return {

                /*
                 * ==================================
                 * KHOẢNG NGÀY ÁP DỤNG
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
                 * LOẠI THỰC ĐƠN
                 * ==================================
                 */

                loaiThucDon:
                    report
                        .getMultiNumbers(
                            'loaiThucDon'
                        ),


                /*
                 * ==================================
                 * TRẠNG THÁI
                 * ==================================
                 */

                trangThaiThucDon:
                    report
                        .getMultiNumbers(
                            'trangThaiThucDon'
                        ),


                /*
                 * ==================================
                 * NGƯỜI LẬP
                 * ==================================
                 *
                 * Schema BE vẫn giữ field
                 * để API ổn định.
                 *
                 * Nhưng DB chưa hỗ trợ filter.
                 */

                nguoiLapIds:
                    [],


                /*
                 * ==================================
                 * NGƯỜI DUYỆT
                 * ==================================
                 */

                nguoiDuyetIds:
                    []

            };

        }


        /*
         * ==========================================
         * RESET TD06
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
             * Cơ sở trở về Tất cả
             * => hiển thị toàn bộ Nhà ăn.
             */

            renderNhaAn();


            /*
             * ======================================
             * FIELD CHƯA HỖ TRỢ
             * ======================================
             */

            disableUnsupportedUserFilters();

        }


        /*
         * ==========================================
         * NGƯỜI LẬP / NGƯỜI DUYỆT CHƯA HỖ TRỢ
         * ==========================================
         */

        function disableUnsupportedUserFilters() {

            disableField(
                'nguoiLapIds'
            );


            disableField(
                'nguoiDuyetIds'
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
             * Smart select của forms/select.
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
                    'button, input, select'
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

    }
);