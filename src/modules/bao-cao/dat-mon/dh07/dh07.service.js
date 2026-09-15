'use strict';

const repository = require(
    './dh07.repository'
);


const {
    xuatBaoCao
} = require(
    '../dat-mon-report.helper'
);


const {
    HINH_THUC_DAT
} = require(
    './dh07.validation'
);


class Dh07Service {

    buildHinhThucDatThongTin(
        values = []
    ) {

        if (
            !Array.isArray(
                values
            )
        ) {
            return [];
        }


        return values
            .map(
                value => {

                    switch (
                        Number(
                            value
                        )
                    ) {

                        case HINH_THUC_DAT
                            .DAT_CHO_MINH:

                            return {
                                value:
                                    HINH_THUC_DAT
                                        .DAT_CHO_MINH,

                                name:
                                    'Đặt cho mình'
                            };


                        case HINH_THUC_DAT
                            .DAT_HO:

                            return {
                                value:
                                    HINH_THUC_DAT
                                        .DAT_HO,

                                name:
                                    'Đặt hộ'
                            };


                        default:

                            return null;

                    }

                }
            )
            .filter(
                Boolean
            );

    }


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
         * TỔNG SỐ ĐƠN
         * ==========================================
         */

        const tongSoDon =
            rows.reduce(
                (
                    total,
                    row
                ) =>
                    total +
                    Number(
                        row.soDon ||
                        0
                    ),

                0
            );


        /*
         * ==========================================
         * ĐẶT CHO MÌNH
         * ==========================================
         */

        const soDonDatChoMinh =
            rows.reduce(
                (
                    total,
                    row
                ) =>
                    total +
                    Number(
                        row
                            .soDonDatChoMinh ||
                        0
                    ),

                0
            );


        /*
         * ==========================================
         * ĐẶT HỘ
         * ==========================================
         */

        const soDonDatHo =
            rows.reduce(
                (
                    total,
                    row
                ) =>
                    total +
                    Number(
                        row.soDonDatHo ||
                        0
                    ),

                0
            );


        /*
         * ==========================================
         * TỔNG TIỀN
         * ==========================================
         */

        const tamTinh =
            rows.reduce(
                (
                    total,
                    row
                ) =>
                    total +
                    Number(
                        row.tamTinh ||
                        0
                    ),

                0
            );


        const tongMienGiam =
            rows.reduce(
                (
                    total,
                    row
                ) =>
                    total +
                    Number(
                        row
                            .tongMienGiam ||
                        0
                    ),

                0
            );


        const phiDichVu =
            rows.reduce(
                (
                    total,
                    row
                ) =>
                    total +
                    Number(
                        row.phiDichVu ||
                        0
                    ),

                0
            );


        const tongThanhToan =
            rows.reduce(
                (
                    total,
                    row
                ) =>
                    total +
                    Number(
                        row
                            .tongThanhToan ||
                        0
                    ),

                0
            );


        /*
         * ==========================================
         * SỐ NHÂN VIÊN
         * ==========================================
         */

        const nhanVienIds =
            new Set(
                rows
                    .map(
                        row =>
                            row.nhanVienId
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
         * SỐ PHÒNG BAN
         * ==========================================
         */

        const phongBanIds =
            new Set(
                rows
                    .map(
                        row =>
                            row.phongBanId
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
         * XUẤT BÁO CÁO
         * ==========================================
         */

        return xuatBaoCao({

            maBaoCao:
                'dh_07',

            tenBaoCao:
                'Báo cáo đặt hàng theo nhân viên và phòng ban',


            /*
             * Thêm thông tin hiển thị
             * cho bộ lọc hình thức đặt.
             */

            filters: {

                ...filters,

                hinhThucDatThongTin:
                    this
                        .buildHinhThucDatThongTin(
                            filters
                                .hinhThucDat
                        ),

                hinhThucDatTen:
                    this
                        .buildHinhThucDatThongTin(
                            filters
                                .hinhThucDat
                        )
                        .map(
                            item =>
                                item.name
                        )
                        .join(
                            ', '
                        )

            },


            taiKhoanId,

            rows,


            tongHop: {

                /*
                 * Tổng số nhóm
                 * nhân viên + phòng ban.
                 */

                tongSoDong:
                    rows.length,


                tongSoDon,


                tongSoNhanVien:
                    nhanVienIds.size,


                tongSoPhongBan:
                    phongBanIds.size,


                soDonDatChoMinh,

                soDonDatHo,


                tyLeDatHo:
                    tongSoDon ===
                        0
                        ? 0
                        : Number(
                            (
                                soDonDatHo /
                                tongSoDon *
                                100
                            )
                                .toFixed(
                                    2
                                )
                        ),


                tamTinh,

                tongMienGiam,

                phiDichVu,

                tongThanhToan

            }

        });

    }

}


module.exports =
    new Dh07Service();