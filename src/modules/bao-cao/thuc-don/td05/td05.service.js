'use strict';


const repository = require(
    './td05.repository'
);


const {
    enums,
    enumItem,
    xuatBaoCao
} = require(
    '../thuc-don-report.helper'
);


class Td05Service {

    async taoBaoCao(
        filters,
        taiKhoanId
    ) {

        const rawRows =
            await repository
                .getDuLieu(
                    filters
                );


        const rows =
            rawRows.map(
                row => ({

                    ...row,

                    trangThaiDotBinhChonThongTin:
                        enumItem(
                            enums
                                .trangThaiTaoBinhChon,
                            row
                                .trangThaiDotBinhChon
                        )

                })
            );


        const tongSoLuotBinhChon =
            rows.reduce(
                (
                    tong,
                    row
                ) =>
                    tong +
                    Number(
                        row
                            .tongSoLuotBinhChon ||
                        0
                    ),
                0
            );


        const tongSoLuotCo =
            rows.reduce(
                (
                    tong,
                    row
                ) =>
                    tong +
                    Number(
                        row.soLuotCo ||
                        0
                    ),
                0
            );


        const tongSoLuotKhong =
            rows.reduce(
                (
                    tong,
                    row
                ) =>
                    tong +
                    Number(
                        row.soLuotKhong ||
                        0
                    ),
                0
            );


        const tyLeCo =
            tongSoLuotBinhChon >
                0
                ? (
                    tongSoLuotCo *
                    100 /
                    tongSoLuotBinhChon
                )
                : 0;


        const tyLeKhong =
            tongSoLuotBinhChon >
                0
                ? (
                    tongSoLuotKhong *
                    100 /
                    tongSoLuotBinhChon
                )
                : 0;


        return await xuatBaoCao({

            maBaoCao:
                'td_05',

            tenBaoCao:
                'Báo cáo kết quả bình chọn suất ăn',

            filters,

            taiKhoanId,

            rows,


            tongHop: {

                tongSoDot:
                    rows.length,

                tongSoLuotBinhChon,

                tongSoLuotCo,

                tongSoLuotKhong,

                tyLeCo,

                tyLeKhong

            }

        });

    }

}


module.exports =
    new Td05Service();