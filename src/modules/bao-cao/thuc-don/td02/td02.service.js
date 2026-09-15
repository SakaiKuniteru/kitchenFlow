'use strict';


const repository = require(
    './td02.repository'
);


const {
    mapThucDon,
    xuatBaoCao
} = require(
    '../thuc-don-report.helper'
);


class Td02Service {

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
         * NGÀY THỰC ĐƠN KHÁC NHAU
         * ==========================================
         */

        const thucDonNgayIds =
            new Set(
                rows
                    .map(
                        row =>
                            row.thucDonNgayId
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
         * NHÓM MÓN KHÁC NHAU
         * ==========================================
         */

        const nhomMonAnIds =
            new Set(
                rows
                    .map(
                        row =>
                            row.nhomMonAnId
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
         * MÓN KHÁC NHAU
         * ==========================================
         */

        const monAnIds =
            new Set(
                rows
                    .map(
                        row =>
                            row.monAnId
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


        return await xuatBaoCao({

            maBaoCao:
                'td_02',

            tenBaoCao:
                'Báo cáo chi tiết món ăn trong thực đơn',

            filters,

            taiKhoanId,

            rows,


            tongHop: {

                /*
                 * Mỗi row =
                 * 1 lượt món xuất hiện trong thực đơn.
                 */

                tongSoDong:
                    rows.length,


                tongSoThucDon:
                    thucDonIds.size,


                tongSoNgayApDung:
                    thucDonNgayIds.size,


                tongSoNhomMon:
                    nhomMonAnIds.size,


                tongSoMonAn:
                    monAnIds.size

            }

        });

    }

}


module.exports =
    new Td02Service();