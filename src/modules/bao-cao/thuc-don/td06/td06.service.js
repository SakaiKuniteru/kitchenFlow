'use strict';


const repository = require(
    './td06.repository'
);


const {
    enums,
    enumItem,
    xuatBaoCao
} = require(
    '../thuc-don-report.helper'
);


class Td06Service {

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


                    /*
                     * ==================================
                     * LOẠI THỰC ĐƠN
                     * ==================================
                     */

                    loaiThucDonThongTin:
                        enumItem(
                            enums.loaiThucDon,
                            row.loaiThucDon
                        ),


                    /*
                     * ==================================
                     * TRẠNG THÁI
                     * ==================================
                     */

                    trangThaiThucDonThongTin:
                        enumItem(
                            enums.trangThaiThucDon,
                            row
                                .trangThaiThucDon
                        )

                })
            );


        function countStatus(
            status
        ) {

            return rows.filter(
                row =>
                    Number(
                        row.trangThaiThucDon
                    ) ===
                    Number(
                        status
                    )
            ).length;

        }


        return await xuatBaoCao({

            maBaoCao:
                'td_06',

            tenBaoCao:
                'Báo cáo tình trạng lập và duyệt thực đơn',

            filters,

            taiKhoanId,

            rows,


            tongHop: {

                tongSoThucDon:
                    rows.length,


                /*
                 * 10 = Tạo mới
                 * 20 = Chờ duyệt
                 * 30 = Đang áp dụng
                 * 40 = Chờ duyệt lại
                 * 50 = Đã hủy
                 * 60 = Đã kết thúc
                 */

                taoMoi:
                    countStatus(
                        10
                    ),

                choDuyet:
                    countStatus(
                        20
                    ),

                dangApDung:
                    countStatus(
                        30
                    ),

                choDuyetLai:
                    countStatus(
                        40
                    ),

                daHuy:
                    countStatus(
                        50
                    ),

                daKetThuc:
                    countStatus(
                        60
                    )

            }

        });

    }

}


module.exports =
    new Td06Service();