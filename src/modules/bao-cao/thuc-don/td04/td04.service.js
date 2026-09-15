'use strict';


const repository = require(
    './td04.repository'
);


const {
    xuatBaoCao
} = require(
    '../thuc-don-report.helper'
);


const {
    NGUON_SO_SUAT
} = require(
    './td04.validation'
);


const DS_NGUON_SO_SUAT = [

    {
        value:
            NGUON_SO_SUAT
                .DU_KIEN,

        name:
            'Dự kiến'
    },

    {
        value:
            NGUON_SO_SUAT
                .DANG_KY,

        name:
            'Đăng ký'
    }

];


class Td04Service {

    getNguonSoSuat(
        value
    ) {

        return (
            DS_NGUON_SO_SUAT
                .find(
                    item =>
                        Number(
                            item.value
                        ) ===
                        Number(
                            value
                        )
                ) ||
            null
        );

    }


    async taoBaoCao(
        filters,
        taiKhoanId
    ) {

        const rawRows =
            await repository
                .getDuLieu(
                    filters
                );


        /*
         * ==========================================
         * MAP NGUỒN SỐ SUẤT
         * ==========================================
         */

        const rows =
            rawRows.map(
                row => ({

                    ...row,

                    nguonSoSuatThongTin:
                        this
                            .getNguonSoSuat(
                                row
                                    .nguonSoSuat
                            ),

                    tenNguonSoSuat:
                        this
                            .getNguonSoSuat(
                                row
                                    .nguonSoSuat
                            )
                            ?.name ||
                        ''

                })
            );


        /*
         * ==========================================
         * THỰC PHẨM KHÁC NHAU
         * ==========================================
         */

        const thucPhamIds =
            new Set(
                rows
                    .map(
                        row =>
                            row.thucPhamId
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
         * TỔNG SỐ SUẤT
         * ==========================================
         *
         * Không cộng chung 2 nguồn vì nếu user
         * chọn cả Dự kiến + Đăng ký thì sẽ bị
         * double-count.
         */

        const tongSoSuatDuKien =
            rows
                .filter(
                    row =>
                        Number(
                            row.nguonSoSuat
                        ) ===
                        NGUON_SO_SUAT
                            .DU_KIEN
                )
                .reduce(
                    (
                        total,
                        row
                    ) =>
                        total +
                        Number(
                            row.soSuat ||
                            0
                        ),

                    0
                );


        const tongSoSuatDangKy =
            rows
                .filter(
                    row =>
                        Number(
                            row.nguonSoSuat
                        ) ===
                        NGUON_SO_SUAT
                            .DANG_KY
                )
                .reduce(
                    (
                        total,
                        row
                    ) =>
                        total +
                        Number(
                            row.soSuat ||
                            0
                        ),

                    0
                );


        /*
         * ==========================================
         * BỘ LỌC HIỂN THỊ
         * ==========================================
         */

        const nguonSoSuatThongTin =
            (
                filters
                    .nguonSoSuat ||
                []
            )
                .map(
                    value =>
                        this
                            .getNguonSoSuat(
                                value
                            )
                )
                .filter(
                    Boolean
                );


        return await xuatBaoCao({

            maBaoCao:
                'td_04',

            tenBaoCao:
                'Báo cáo nhu cầu nguyên liệu theo thực đơn',


            filters: {

                ...filters,

                nguonSoSuatThongTin,

                nguonSoSuatTen:
                    nguonSoSuatThongTin
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

                tongSoDong:
                    rows.length,

                tongSoMonAn:
                    monAnIds.size,

                tongSoThucPham:
                    thucPhamIds.size,

                tongSoSuatDuKien,

                tongSoSuatDangKy

            }

        });

    }

}


module.exports =
    new Td04Service();