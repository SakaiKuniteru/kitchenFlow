'use strict';


const repository = require(
    './td01.repository'
);


const {
    mapThucDon,
    xuatBaoCao
} = require(
    '../thuc-don-report.helper'
);


class Td01Service {

    async taoBaoCao(
        filters,
        taiKhoanId
    ) {

        const rows =
            (
                await repository
                    .getDuLieu(
                        filters
                    )
            )
                .map(
                    mapThucDon
                );


        /*
         * ==========================================
         * THỰC ĐƠN KHÁC NHAU
         * ==========================================
         */

        const thucDonIds =
            new Set(
                rows
                    .map(
                        row =>
                            row.thucDonId
                    )
                    .filter(
                        value =>
                            value !==
                                null &&
                            value !==
                                undefined
                    )
                    .map(
                        String
                    )
            );


        /*
         * ==========================================
         * TỔNG NHÓM MÓN
         * ==========================================
         */

        const tongSoNhomMon =
            rows.reduce(
                (
                    total,
                    row
                ) =>
                    total +
                    Number(
                        row.soNhomMon ||
                        0
                    ),

                0
            );


        /*
         * ==========================================
         * TỔNG MÓN
         * ==========================================
         */

        const tongSoMonAn =
            rows.reduce(
                (
                    total,
                    row
                ) =>
                    total +
                    Number(
                        row.soMonAn ||
                        0
                    ),

                0
            );


        return await xuatBaoCao({

            maBaoCao:
                'td_01',

            tenBaoCao:
                'Báo cáo thực đơn theo ngày, tuần, tháng',

            filters,

            taiKhoanId,

            rows,


            tongHop: {

                tongSoThucDon:
                    thucDonIds.size,

                /*
                 * Vì 1 row = 1 ngày áp dụng.
                 */

                tongSoNgayApDung:
                    rows.length,

                tongSoNhomMon,

                tongSoMonAn

            }

        });

    }

}


module.exports =
    new Td01Service();