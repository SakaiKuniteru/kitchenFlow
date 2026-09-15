'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-td05-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG TD05
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/thuc-don/td05',

            dotBinhChon:
                '/api/mcs/v1/binh-chon/tong-hop',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            trangThaiDotBinhChon:
                '/api/mcs/v1/enums?name=trangThaiTaoBinhChon'

        };


        /*
         * ==========================================
         * DEFAULT MULTI SELECT TD05
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                dotBinhChonIds:
                    true,

                coSoIds:
                    true,

                /*
                 * Nhà ăn phụ thuộc Cơ sở.
                 */

                nhaAnIds:
                    false,

                trangThaiDotBinhChon:
                    true

            });


        /*
         * ==========================================
         * STATE RIÊNG TD05
         * ==========================================
         */

        const state = {

            dotBinhChon:
                [],

            coSo:
                [],

            nhaAn:
                [],

            trangThaiDotBinhChon:
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
                        'Q003010',

                    api:
                        API.baoCao,

                    fileName:
                        'td05',

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
         * INIT TD05
         * ==========================================
         */

        async function initialize() {

            try {

                report.setLoading(
                    true
                );


                const [
                    dotBinhChon,
                    coSo,
                    nhaAn,
                    trangThaiDotBinhChon
                ] =
                    await Promise.all([

                        report.loadList(
                            API.dotBinhChon
                        ),

                        report.loadList(
                            API.coSo
                        ),

                        report.loadList(
                            API.nhaAn
                        ),

                        report.loadList(
                            API.trangThaiDotBinhChon
                        )

                    ]);


                /*
                 * ======================================
                 * STATE
                 * ======================================
                 */

                state.dotBinhChon =
                    dotBinhChon;


                state.coSo =
                    coSo;


                state.nhaAn =
                    nhaAn;


                state.trangThaiDotBinhChon =
                    trangThaiDotBinhChon;


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
                 * TRẠNG THÁI ĐỢT BÌNH CHỌN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'trangThaiDotBinhChon',

                        trangThaiDotBinhChon.map(
                            item => ({

                                value:
                                    item.value,

                                label:
                                    item.name

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .trangThaiDotBinhChon
                    );


                /*
                 * ======================================
                 * ĐỢT BÌNH CHỌN
                 * ======================================
                 *
                 * Render sau khi các bộ lọc phụ
                 * đã có option.
                 */

                renderDotBinhChon();


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
                 * EVENT RIÊNG TD05
                 * ======================================
                 */

                bindTd05Events();

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
                        'Không thể tải dữ liệu bộ lọc TD05.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }

        }


        /*
         * ==========================================
         * EVENT RIÊNG TD05
         * ==========================================
         */

        function bindTd05Events() {

            /*
             * ======================================
             * CƠ SỞ THAY ĐỔI
             * ======================================
             *
             * - cập nhật Nhà ăn
             * - cập nhật Đợt bình chọn
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


                        renderDotBinhChon();

                    }
                );


            /*
             * ======================================
             * NHÀ ĂN THAY ĐỔI
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


                        renderDotBinhChon();

                    }
                );


            /*
             * ======================================
             * TRẠNG THÁI ĐỢT THAY ĐỔI
             * ======================================
             */

            root
                .querySelector(
                    '#trangThaiDotBinhChon'
                )
                ?.addEventListener(
                    'change',
                    () => {

                        report
                            .invalidateReport();


                        renderDotBinhChon();

                    }
                );


            /*
             * ======================================
             * NGÀY THAY ĐỔI
             * ======================================
             *
             * Đợt bình chọn cũng được lọc lại
             * theo ngày áp dụng để option gọn hơn.
             */

            root
                .querySelector(
                    '#tuNgay'
                )
                ?.addEventListener(
                    'change',
                    () => {

                        report
                            .invalidateReport();


                        renderDotBinhChon();

                    }
                );


            root
                .querySelector(
                    '#denNgay'
                )
                ?.addEventListener(
                    'change',
                    () => {

                        report
                            .invalidateReport();


                        renderDotBinhChon();

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
             * => toàn bộ Nhà ăn.
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
             * Giữ Nhà ăn còn hợp lệ.
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
         * ĐỢT BÌNH CHỌN THEO BỘ LỌC
         * ==========================================
         */

        function renderDotBinhChon() {

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


            const trangThai =
                report
                    .getMultiValues(
                        'trangThaiDotBinhChon'
                    );


            const selected =
                report
                    .getMultiValues(
                        'dotBinhChonIds'
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


            let records =
                state.dotBinhChon;


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
                                    getDotCoSoId(
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
                                    getDotNhaAnId(
                                        item
                                    ) ??
                                    ''
                                )
                            )
                    );

            }


            /*
             * ======================================
             * TRẠNG THÁI
             * ======================================
             */

            if (
                trangThai.length >
                0
            ) {

                const set =
                    new Set(
                        trangThai.map(
                            String
                        )
                    );


                records =
                    records.filter(
                        item =>
                            set.has(
                                String(
                                    getDotTrangThai(
                                        item
                                    ) ??
                                    ''
                                )
                            )
                    );

            }


            /*
             * ======================================
             * KHOẢNG NGÀY ÁP DỤNG
             * ======================================
             *
             * Chỉ filter option trên FE.
             *
             * BE vẫn là nơi lọc dữ liệu thật.
             */

            if (
                tuNgay
            ) {

                const from =
                    getDateOnly(
                        tuNgay
                    );


                if (
                    from
                ) {

                    records =
                        records.filter(
                            item => {

                                const ngay =
                                    getDotNgay(
                                        item
                                    );


                                return (
                                    !ngay ||
                                    ngay >=
                                        from
                                );

                            }
                        );

                }

            }


            if (
                denNgay
            ) {

                const to =
                    getDateOnly(
                        denNgay
                    );


                if (
                    to
                ) {

                    records =
                        records.filter(
                            item => {

                                const ngay =
                                    getDotNgay(
                                        item
                                    );


                                return (
                                    !ngay ||
                                    ngay <=
                                        to
                                );

                            }
                        );

                }

            }


            /*
             * ======================================
             * GIỮ ĐỢT ĐANG CHỌN CÒN HỢP LỆ
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
                    'dotBinhChonIds',

                    records.map(
                        item => ({

                            value:
                                item.id,

                            label:
                                buildDotBinhChonLabel(
                                    item
                                )

                        })
                    ),

                    preserved,

                    preserved.length ===
                        0
                        ? MULTI_SELECT_DEFAULTS
                            .dotBinhChonIds
                        : false
                );

        }


        /*
         * ==========================================
         * BUILD PAYLOAD TD05
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
                    'Vui lòng chọn từ ngày áp dụng.'
                );

            }


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
             * PAYLOAD TD05
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
                 * Đợt bình chọn.
                 */

                dotBinhChonIds:
                    report
                        .getMultiNumbers(
                            'dotBinhChonIds'
                        ),


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
                 * TD05 HBS không có Ca ăn,
                 * nhưng taoSchema() chung vẫn có.
                 *
                 * Không cần gửi caAnIds.
                 */


                /*
                 * Trạng thái đợt bình chọn.
                 */

                trangThaiDotBinhChon:
                    report
                        .getMultiNumbers(
                            'trangThaiDotBinhChon'
                        )

            };

        }


        /*
         * ==========================================
         * RESET TD05
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
             * ======================================
             * RESET NHÀ ĂN
             * ======================================
             */

            renderNhaAn();


            /*
             * ======================================
             * RESET ĐỢT BÌNH CHỌN
             * ======================================
             */

            renderDotBinhChon();

        }


        /*
         * ==========================================
         * GET CƠ SỞ CỦA ĐỢT
         * ==========================================
         */

        function getDotCoSoId(
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
         * GET NHÀ ĂN CỦA ĐỢT
         * ==========================================
         */

        function getDotNhaAnId(
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
         * GET TRẠNG THÁI ĐỢT
         * ==========================================
         */

        function getDotTrangThai(
            item
        ) {

            return (
                item.trangThai ??
                item.trang_thai ??
                null
            );

        }


        /*
         * ==========================================
         * GET NGÀY ÁP DỤNG CỦA ĐỢT
         * ==========================================
         */

        function getDotNgay(
            item
        ) {

            const value =
                item.ngay ??
                item.ngayApDung ??
                item.ngay_ap_dung ??
                null;


            return getDateOnly(
                value
            );

        }


        /*
         * ==========================================
         * GET yyyy-MM-dd
         * ==========================================
         */

        function getDateOnly(
            value
        ) {

            if (
                !value
            ) {
                return '';
            }


            const text =
                String(
                    value
                )
                    .trim();


            /*
             * Các date control/API hiện tại
             * chủ yếu trả ISO hoặc yyyy-MM-dd.
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
         * LABEL ĐỢT BÌNH CHỌN
         * ==========================================
         *
         * Module bình chọn hiện cũng sử dụng
         * dạng:
         *
         * Tên thực đơn - ngày
         */

        function buildDotBinhChonLabel(
            item
        ) {

            const tenThucDon =
                item.tenThucDon ||
                item.ten_thuc_don ||
                '';


            const ngay =
                formatNgay(
                    item.ngay ??
                    item.ngayApDung ??
                    item.ngay_ap_dung
                );


            const tenNhaAn =
                item.tenNhaAn ||
                item.ten_nha_an ||
                '';


            const tenCaAn =
                item.tenCaAn ||
                item.ten_ca_an ||
                '';


            const main =
                tenThucDon
                    ? tenThucDon
                    : `Đợt #${item.id}`;


            const detail =
                [
                    ngay,
                    tenNhaAn,
                    tenCaAn
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        ' - '
                    );


            return detail
                ? `${main} - ${detail}`
                : main;

        }


        /*
         * ==========================================
         * FORMAT NGÀY
         * ==========================================
         */

        function formatNgay(
            value
        ) {

            const dateOnly =
                getDateOnly(
                    value
                );


            if (
                !dateOnly
            ) {
                return '';
            }


            const [
                year,
                month,
                day
            ] =
                dateOnly.split(
                    '-'
                );


            return (
                `${day}/${month}/${year}`
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