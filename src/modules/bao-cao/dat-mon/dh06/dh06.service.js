'use strict';

const repository = require(
    './dh06.repository'
);


const {
    S,
    mapDon,
    xuatBaoCao
} = require(
    '../dat-mon-report.helper'
);


class Dh06Service {

    async taoBaoCao(
        filters,
        taiKhoanId
    ) {

        const rowsRaw =
            await repository
                .getDuLieu(
                    filters
                );


        const rows =
            rowsRaw.map(
                row => {

                    const don =
                        mapDon(
                            row
                        );


                    const trangThai =
                        Number(
                            row.trangThaiDon
                        );


                    /*
                     * ==================================
                     * LOẠI XỬ LÝ
                     * ==================================
                     */

                    let loaiXuLy =
                        null;


                    let tenLoaiXuLy =
                        null;


                    if (
                        trangThai ===
                        Number(
                            S.DA_HUY
                        )
                    ) {

                        loaiXuLy =
                            S.DA_HUY;

                        tenLoaiXuLy =
                            'Hủy';

                    }


                    if (
                        trangThai ===
                        Number(
                            S.TU_CHOI
                        )
                    ) {

                        loaiXuLy =
                            S.TU_CHOI;

                        tenLoaiXuLy =
                            'Từ chối';

                    }


                    return {

                        ...don,


                        /*
                         * Người thực hiện được lấy từ
                         * nguoi_huy_id.
                         */

                        nguoiThucHienId:
                            row.nguoiHuyId,

                        maNguoiThucHien:
                            row.maNguoiHuy,

                        tenNguoiThucHien:
                            row.tenNguoiHuy,


                        /*
                         * Ngày hủy / từ chối
                         */

                        thoiGianXuLy:
                            row.thoiGianHuy,


                        /*
                         * Hủy / từ chối
                         */

                        loaiXuLy,

                        tenLoaiXuLy

                    };

                }
            );


        const count =
            status =>
                rows.filter(
                    row =>
                        Number(
                            row.trangThaiDon
                        ) ===
                        Number(
                            status
                        )
                )
                    .length;


        return xuatBaoCao({

            maBaoCao:
                'dh_06',

            tenBaoCao:
                'Báo cáo đơn hàng hủy và từ chối',

            filters,

            taiKhoanId,

            rows,


            /*
             * ======================================
             * TỔNG HỢP
             * ======================================
             */

            tongHop: {

                tongSoDon:
                    rows.length,

                soDonHuy:
                    count(
                        S.DA_HUY
                    ),

                soDonTuChoi:
                    count(
                        S.TU_CHOI
                    )

            }

        });

    }

}


module.exports =
    new Dh06Service();