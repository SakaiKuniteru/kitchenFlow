'use strict';

const {
    randomUUID
} = require(
    'crypto'
);


const repository = require(
    './tc02.repository'
);


const inBaoCaoService = require(
    '../../../../services/in-bao-cao/in-bao-cao.service'
);


const {

    nhomBaoCao:
        dsNhomBaoCao,

    trangThaiThanhToan:
        dsTrangThaiThanhToan

} = require(
    '../../../../constants/enums'
);


const MA_BAO_CAO =
    'tc_02';


const TEN_BAO_CAO =
    'Báo cáo đối soát thanh toán';


const NHOM_BAO_CAO_TAI_CHINH =
    10;


const DS_NGUON_THANH_TOAN = [

    {
        value:
            10,

        name:
            'Vé ăn'
    },

    {
        value:
            20,

        name:
            'Đơn hàng'
    }

];


const DS_PHUONG_THUC_THANH_TOAN = [

    {
        value:
            10,

        name:
            'Tiền mặt'
    },

    {
        value:
            20,

        name:
            'Chuyển khoản'
    },

    {
        value:
            30,

        name:
            'QR Code'
    },

    {
        value:
            40,

        name:
            'Thanh toán nội bộ'
    }

];


class Tc02Service {

    getEnumItem(
        danhSach,
        value
    ) {

        return (
            (
                danhSach ||
                []
            ).find(
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


    getEnumItems(
        danhSach,
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
                value =>
                    this.getEnumItem(
                        danhSach,
                        value
                    )
            )
            .filter(
                Boolean
            );
    }


    getNhomBaoCao() {

        return this.getEnumItem(
            dsNhomBaoCao,
            NHOM_BAO_CAO_TAI_CHINH
        );
    }


    getTongHop(
        rows
    ) {

        const fields = [

            'tongSoGiaoDich',

            'soGiaoDichThu',

            'soGiaoDichHoan',

            'soGiaoDichChoXuLy',

            'soGiaoDichDangXuLy',

            'soGiaoDichThanhCong',

            'soGiaoDichThatBai',

            'soGiaoDichDaHuy',

            'tongThu',

            'tongHoan',

            'thucThu'

        ];


        const result =
            Object.fromEntries(
                fields.map(
                    field => [
                        field,
                        0
                    ]
                )
            );


        for (
            const row
            of rows
        ) {

            for (
                const field
                of fields
            ) {

                result[field] +=
                    Number(
                        row[field] ??
                        0
                    );

            }

        }


        return {

            tongSoNhom:
                rows.length,

            ...result

        };
    }


    buildBoLoc(
        filters
    ) {

        return {

            tuNgay:
                filters.tuNgay,

            denNgay:
                filters.denNgay,


            coSoIds:
                filters.coSoIds ||
                [],

            nhaAnIds:
                filters.nhaAnIds ||
                [],


            nguonThanhToan:
                filters
                    .nguonThanhToan ||
                [],

            nguonThanhToanThongTin:
                this.getEnumItems(
                    DS_NGUON_THANH_TOAN,
                    filters.nguonThanhToan
                ),


            hinhThucThanhToan:
                filters
                    .hinhThucThanhToan ||
                [],

            hinhThucThanhToanThongTin:
                this.getEnumItems(
                    DS_PHUONG_THUC_THANH_TOAN,
                    filters
                        .hinhThucThanhToan
                ),


            trangThaiThanhToan:
                filters
                    .trangThaiThanhToan ||
                [],

            trangThaiThanhToanThongTin:
                this.getEnumItems(
                    dsTrangThaiThanhToan,
                    filters
                        .trangThaiThanhToan
                ),


            thuNganIds:
                filters.thuNganIds ||
                []

        };
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


        const data =
            inBaoCaoService
                .normalizeReportData({

                    maBaoCao:
                        MA_BAO_CAO,

                    tenBaoCao:
                        TEN_BAO_CAO,


                    nhomBaoCao:
                        this.getNhomBaoCao(),


                    boLoc:
                        this.buildBoLoc(
                            filters
                        ),


                    tongSoBanGhi:
                        rows.length,


                    tongHop:
                        this.getTongHop(
                            rows
                        ),


                    danhSach:
                        rows.map(
                            (
                                row,
                                index
                            ) => ({

                                stt:
                                    index + 1,

                                ...row,


                                nguonThanhToanThongTin:
                                    this.getEnumItem(
                                        DS_NGUON_THANH_TOAN,
                                        row.nguonThanhToan
                                    ),


                                phuongThucThanhToanThongTin:
                                    this.getEnumItem(
                                        DS_PHUONG_THUC_THANH_TOAN,
                                        row.phuongThucThanhToan
                                    )

                            })
                        )

                });


        return await inBaoCaoService
            .taoBaoCao({

                maBaoCao:
                    MA_BAO_CAO,

                id:
                    randomUUID(),

                soPhieu:
                    null,

                data,

                nguoiInId:
                    taiKhoanId

            });
    }

}


module.exports =
    new Tc02Service();