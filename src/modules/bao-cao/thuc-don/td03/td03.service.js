'use strict';


const repository = require(
    './td03.repository'
);


const {
    xuatBaoCao
} = require(
    '../thuc-don-report.helper'
);


class Td03Service {

    async taoBaoCao(
        filters,
        taiKhoanId
    ) {

        const rows =
            await repository
                .getDuLieu(
                    filters
                );


        /*
         * ==========================================
         * MÓN ĂN KHÁC NHAU
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


        /*
         * ==========================================
         * TỔNG LƯỢT XUẤT HIỆN
         * ==========================================
         */

        const tongSoLanXuatHien =
            rows.reduce(
                (
                    total,
                    row
                ) =>
                    total +
                    Number(
                        row
                            .soLanXuatHien ||
                        0
                    ),

                0
            );


        /*
         * ==========================================
         * TẦN SUẤT CAO NHẤT
         * ==========================================
         */

        const tanSuatCaoNhat =
            rows.reduce(
                (
                    max,
                    row
                ) =>
                    Math.max(
                        max,
                        Number(
                            row
                                .soLanXuatHien ||
                            0
                        )
                    ),

                0
            );


        /*
         * ==========================================
         * SỐ DÒNG CÓ LẶP
         * ==========================================
         */

        const soMonBiLap =
            rows.filter(
                row =>
                    Number(
                        row
                            .soLanXuatHien ||
                        0
                    ) >
                    1
            )
                .length;


        return await xuatBaoCao({

            maBaoCao:
                'td_03',

            tenBaoCao:
                'Báo cáo tần suất và món ăn trùng lặp',

            filters,

            taiKhoanId,

            rows,


            tongHop: {

                tongSoDong:
                    rows.length,

                tongSoMonAn:
                    monAnIds.size,

                tongSoLanXuatHien,

                soMonBiLap,

                tanSuatCaoNhat,

                soLanXuatHienToiThieu:
                    Number(
                        filters
                            .soLanXuatHienToiThieu ||
                        2
                    )

            }

        });

    }

}


module.exports =
    new Td03Service();