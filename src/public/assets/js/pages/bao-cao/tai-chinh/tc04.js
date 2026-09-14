'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-tc04-page]'
            );


        if (!root) {
            return;
        }


        /*
         * ==========================================
         * API RIÊNG TC04
         * ==========================================
         */

        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/tai-chinh/tc04',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            chinhSach:
                '/api/mcs/v1/dm-chinh-sach/tong-hop?active=true',

            voucherVeAn:
                '/api/mcs/v1/dm-voucher/tong-hop?active=true',

            voucherDonHang:
                '/api/mcs/v1/dm-voucher-don-hang/tong-hop?active=true',

            nhanVien:
                '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true',

            phongBan:
                '/api/mcs/v1/dm-phong-ban/tong-hop?active=true'

        };


        /*
         * Voucher vé ăn hiện tại của hệ thống
         * đang dùng dm-voucher/tong-hop.
         */
        /*
         * dm-nhan-vien và dm-phong-ban cũng
         * đang theo quy tắc /tong-hop?active=true.
         */


        /*
         * ==========================================
         * NGUỒN
         * ==========================================
         */

        const NGUON_OPTIONS = [

            {
                value:
                    'VA',

                label:
                    'Vé ăn'
            },

            {
                value:
                    'DH',

                label:
                    'Đơn hàng'
            }

        ];


        const TAT_CA_NGUON = [
            'VA',
            'DH'
        ];


        /*
         * ==========================================
         * DEFAULT RIÊNG TC04
         * ==========================================
         */

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                nguon:
                    true,

                coSoIds:
                    true,

                nhaAnIds:
                    false,

                chinhSachIds:
                    false,

                voucherKeys:
                    false,

                nhanVienIds:
                    false,

                phongBanIds:
                    false

            });


        /*
         * ==========================================
         * STATE RIÊNG TC04
         * ==========================================
         */

        const state = {

            nhaAn:
                [],

            voucherVeAn:
                [],

            voucherDonHang:
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
                        'Q003004',

                    api:
                        API.baoCao,

                    fileName:
                        'tc04',

                    getPayload:
                        getFilters,

                    onReset:
                        resetFilters

                });


        /*
         * Không viết:
         *
         * report.start(initialize());
         *
         * vì như vậy initialize chạy
         * trước khi kiểm tra quyền.
         */
        report.start(
            initialize
        );


        /*
         * ==========================================
         * INIT TC04
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
                    chinhSach,
                    voucherVeAn,
                    voucherDonHang,
                    nhanVien,
                    phongBan
                ] =
                    await Promise.all([

                        report.loadList(
                            API.coSo
                        ),

                        report.loadList(
                            API.nhaAn
                        ),

                        report.loadList(
                            API.chinhSach
                        ),

                        report.loadList(
                            API.voucherVeAn
                        ),

                        report.loadList(
                            API.voucherDonHang
                        ),

                        report.loadList(
                            API.nhanVien
                        ),

                        report.loadList(
                            API.phongBan
                        )

                    ]);


                state.nhaAn =
                    nhaAn;


                state.voucherVeAn =
                    voucherVeAn;


                state.voucherDonHang =
                    voucherDonHang;


                /*
                 * ======================================
                 * NGUỒN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'nguon',

                        NGUON_OPTIONS,

                        [],

                        MULTI_SELECT_DEFAULTS
                            .nguon
                    );


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
                                    item.tenCoSo ||
                                    item.ten ||
                                    '-'

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
                 */

                renderNhaAn();


                /*
                 * ======================================
                 * CHÍNH SÁCH
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'chinhSachIds',

                        chinhSach.map(
                            item => ({

                                value:
                                    item.id,

                                label:
                                    buildChinhSachLabel(
                                        item
                                    )

                            })
                        ),

                        [],

                        MULTI_SELECT_DEFAULTS
                            .chinhSachIds
                    );


                /*
                 * ======================================
                 * VOUCHER
                 *
                 * Ghép voucher 2 nguồn thành:
                 *
                 * VA:123
                 * DH:456
                 * ======================================
                 */

                renderVoucher();


                /*
                 * ======================================
                 * NHÂN VIÊN
                 * ======================================
                 */

                report
                    .setMultipleSelectOptions(
                        'nhanVienIds',

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
                            .nhanVienIds
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
                 * QUY TẮC TẤT CẢ
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


                bindTc04Events();

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
                        'Không thể tải dữ liệu bộ lọc TC04.'
                    );

            } finally {

                report.setLoading(
                    false
                );

            }
        }


        /*
         * ==========================================
         * EVENT TC04
         * ==========================================
         */

        function bindTc04Events() {

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


            root
                .querySelector(
                    '#nguon'
                )
                ?.addEventListener(
                    'change',
                    () => {

                        report
                            .invalidateReport();


                        /*
                         * Voucher phải thay đổi
                         * theo nguồn đang chọn.
                         */
                        renderVoucher();

                    }
                );
        }


        /*
         * ==========================================
         * LẤY NGUỒN ĐANG CHỌN
         * ==========================================
         */

        function getSelectedNguon() {

            const values =
                report
                    .getMultiValues(
                        'nguon'
                    );


            /*
             * Với select chung:
             *
             * chọn "Tất cả" => []
             *
             * Nhưng BE TC04 yêu cầu:
             *
             * nguon.min(1)
             *
             * nên phải chuyển lại thành
             * ['VA', 'DH'].
             */
            if (
                values.length ===
                0
            ) {

                return [
                    ...TAT_CA_NGUON
                ];

            }


            return values
                .map(
                    value =>
                        String(
                            value
                        )
                            .trim()
                            .toUpperCase()
                )
                .filter(
                    value =>
                        TAT_CA_NGUON
                            .includes(
                                value
                            )
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
                            item =>
                                set.has(
                                    String(
                                        item.coSoId ??
                                        item.coSo?.id ??
                                        item.co_so_id ??
                                        ''
                                    )
                                )
                        );

            }


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
                                item.tenNhaAn ||
                                item.ten ||
                                '-'

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
         * VOUCHER THEO NGUỒN
         * ==========================================
         */

        function renderVoucher() {

            const selectedNguon =
                getSelectedNguon();


            const currentValues =
                report
                    .getMultiValues(
                        'voucherKeys'
                    );


            const options =
                [];


            /*
             * Voucher Vé ăn.
             */
            if (
                selectedNguon
                    .includes(
                        'VA'
                    )
            ) {

                state
                    .voucherVeAn
                    .forEach(
                        item => {

                            options.push({

                                value:
                                    `VA:${item.id}`,

                                label:
                                    buildVoucherLabel(
                                        'Vé ăn',
                                        item
                                    )

                            });

                        }
                    );

            }


            /*
             * Voucher Đơn hàng.
             */
            if (
                selectedNguon
                    .includes(
                        'DH'
                    )
            ) {

                state
                    .voucherDonHang
                    .forEach(
                        item => {

                            options.push({

                                value:
                                    `DH:${item.id}`,

                                label:
                                    buildVoucherLabel(
                                        'Đơn hàng',
                                        item
                                    )

                            });

                        }
                    );

            }


            const validValues =
                new Set(
                    options.map(
                        item =>
                            String(
                                item.value
                            )
                    )
                );


            const preserved =
                currentValues
                    .filter(
                        value =>
                            validValues.has(
                                String(
                                    value
                                )
                            )
                    );


            report
                .setMultipleSelectOptions(
                    'voucherKeys',

                    options,

                    preserved,

                    preserved.length ===
                        0
                        ? MULTI_SELECT_DEFAULTS
                            .voucherKeys
                        : false
                );
        }


        /*
         * ==========================================
         * BUILD PAYLOAD TC04
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


            if (!tuNgay) {

                throw new Error(
                    'Vui lòng chọn từ ngày.'
                );

            }


            if (!denNgay) {

                throw new Error(
                    'Vui lòng chọn đến ngày.'
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
                    'Từ ngày không được lớn hơn đến ngày.'
                );

            }


            /*
             * TC04 bắt buộc phải có nguồn.
             */
            const nguon =
                getSelectedNguon();


            if (
                nguon.length ===
                0
            ) {

                throw new Error(
                    'Vui lòng chọn nguồn báo cáo.'
                );

            }


            const nhaAnIds =
                report
                    .getMultiNumbers(
                        'nhaAnIds'
                    );


            /*
             * Rule đúng với validation BE:
             *
             * Đơn hàng chưa có nha_an_id.
             *
             * Nếu lọc nhà ăn thì chỉ được
             * chọn nguồn Vé ăn.
             */
            if (
                nhaAnIds.length >
                    0 &&
                nguon.includes(
                    'DH'
                )
            ) {

                throw new Error(
                    'Khi lọc nhà ăn, chỉ được chọn nguồn Vé ăn.'
                );

            }


            return {

                tuNgay:
                    tuNgayIso,

                denNgay:
                    denNgayIso,


                /*
                 * STRING ARRAY
                 */
                nguon,


                coSoIds:
                    report
                        .getMultiNumbers(
                            'coSoIds'
                        ),


                nhaAnIds,


                chinhSachIds:
                    report
                        .getMultiNumbers(
                            'chinhSachIds'
                        ),


                /*
                 * STRING ARRAY:
                 *
                 * VA:1
                 * DH:2
                 */
                voucherKeys:
                    report
                        .getMultiValues(
                            'voucherKeys'
                        ),


                nhanVienIds:
                    report
                        .getMultiNumbers(
                            'nhanVienIds'
                        ),


                phongBanIds:
                    report
                        .getMultiNumbers(
                            'phongBanIds'
                        )

            };
        }


        /*
         * ==========================================
         * RESET TC04
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


            report
                .setDefaultDateRange(
                    'tuNgay',
                    'denNgay'
                );


            renderNhaAn();


            renderVoucher();
        }


        /*
         * ==========================================
         * LABEL CHÍNH SÁCH
         * ==========================================
         */

        function buildChinhSachLabel(
            item
        ) {

            const ma =
                item.maChinhSach ||
                item.ma_chinh_sach ||
                '';


            const ten =
                item.tenChinhSach ||
                item.ten_chinh_sach ||
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
                `Chính sách #${item.id}`
            );
        }


        /*
         * ==========================================
         * LABEL VOUCHER
         * ==========================================
         */

        function buildVoucherLabel(
            nguonLabel,
            item
        ) {

            const ma =
                item.maVoucher ||
                item.ma_voucher ||
                '';


            const ten =
                item.tenVoucher ||
                item.ten_voucher ||
                item.ten ||
                '';


            let thongTin =
                '';


            if (
                ma &&
                ten
            ) {

                thongTin =
                    `${ma} - ${ten}`;

            } else {

                thongTin =
                    ten ||
                    ma ||
                    `Voucher #${item.id}`;

            }


            return (
                `[${nguonLabel}] ${thongTin}`
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
                    `${ten} (${ma})`
                );

            }


            return (
                ten ||
                ma ||
                `Nhân viên #${item.id}`
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

    }
);