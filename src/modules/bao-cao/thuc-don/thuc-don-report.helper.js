'use strict';

const {
    randomUUID
} = require(
    'crypto'
);


const common = require(
    '../ve-an/ve-an-report.helper'
);


const inBaoCaoService = require(
    '../../../services/in-bao-cao/in-bao-cao.service'
);


const {
    Joi,
    enums,
    idArraySchema,
    enumArraySchema,
    enumItem,
    chuyenSo
} = common;


/*
 * ==========================================
 * VALIDATION CHUNG BÁO CÁO THỰC ĐƠN
 * ==========================================
 */

function taoSchema(
    fields = {}
) {

    return Joi
        .object({

            /*
             * Khoảng ngày áp dụng.
             */

            tuNgay:
                Joi
                    .date()
                    .iso()
                    .required(),


            denNgay:
                Joi
                    .date()
                    .iso()
                    .min(
                        Joi.ref(
                            'tuNgay'
                        )
                    )
                    .required(),


            /*
             * Tổ chức.
             */

            coSoIds:
                idArraySchema(),


            nhaAnIds:
                idArraySchema(),


            caAnIds:
                idArraySchema(),


            /*
             * Trạng thái thực đơn.
             */

            trangThaiThucDon:
                enumArraySchema(
                    enums
                        .trangThaiThucDon
                ),


            /*
             * Filter riêng từng báo cáo.
             */

            ...fields

        })
        .unknown(
            false
        );

}


/*
 * ==========================================
 * TẠO BỘ LỌC SQL CHUNG
 * ==========================================
 */

function taoBoLoc(
    filters
) {

    const values = [
        filters.tuNgay,
        filters.denNgay
    ];


    /*
     * Báo cáo thực đơn lọc theo
     * ngày thực tế trong ct_thuc_don_ngay.
     */

    const conditions = [

        `
            tdn.ngay >=
            $1::date
        `,

        `
            tdn.ngay <=
            $2::date
        `,

        /*
         * Không lấy dữ liệu đã soft-delete.
         *
         * Trạng thái thực đơn như:
         * đã hủy / đã kết thúc
         * vẫn lấy bình thường nếu active = TRUE.
         */

        `
            td.active = TRUE
        `,

        `
            tdn.active = TRUE
        `

    ];


    function addArray(
        expression,
        items,
        type = 'bigint'
    ) {

        if (
            !Array.isArray(
                items
            ) ||
            items.length ===
                0
        ) {
            return;
        }


        values.push(
            items
        );


        conditions.push(
            `
                ${expression}
                =
                ANY(
                    $${values.length}::${type}[]
                )
            `
        );

    }


    /*
     * ======================================
     * TỔ CHỨC
     * ======================================
     */

    addArray(
        'td.co_so_id',
        filters.coSoIds
    );


    addArray(
        'td.nha_an_id',
        filters.nhaAnIds
    );


    addArray(
        'td.ca_an_id',
        filters.caAnIds
    );


    /*
     * ======================================
     * TRẠNG THÁI THỰC ĐƠN
     * ======================================
     */

    addArray(
        'td.trang_thai',
        filters.trangThaiThucDon,
        'integer'
    );


    return {
        values,
        conditions,
        addArray
    };

}


/*
 * ==========================================
 * MAP THÔNG TIN ENUM
 * ==========================================
 */

function mapThucDon(
    row
) {

    return {

        ...row,


        loaiThucDonThongTin:
            enumItem(
                enums.loaiThucDon,
                row.loaiThucDon
            ),


        trangThaiThucDonThongTin:
            enumItem(
                enums.trangThaiThucDon,
                row.trangThaiThucDon
            )

    };

}


/*
 * ==========================================
 * XUẤT BÁO CÁO CHUNG
 * ==========================================
 */

async function xuatBaoCao(
    {
        maBaoCao,
        tenBaoCao,
        filters,
        rows,
        tongHop,
        taiKhoanId
    }
) {

    const boLoc = {
        ...filters
    };


    /*
     * ======================================
     * TRẠNG THÁI HIỂN THỊ TRONG FILE
     * ======================================
     */

    if (
        Array.isArray(
            filters
                .trangThaiThucDon
        )
    ) {

        boLoc
            .trangThaiThucDonThongTin =
            filters
                .trangThaiThucDon
                .map(
                    value =>
                        enumItem(
                            enums
                                .trangThaiThucDon,
                            value
                        )
                )
                .filter(
                    Boolean
                );


        boLoc
            .trangThaiThucDonTen =
            boLoc
                .trangThaiThucDonThongTin
                .length >
            0
                ? boLoc
                    .trangThaiThucDonThongTin
                    .map(
                        item =>
                            item.name
                    )
                    .join(
                        ', '
                    )
                : 'Tất cả';

    }


    /*
     * ======================================
     * DỮ LIỆU CHUNG BÁO CÁO
     * ======================================
     */

    const data =
        inBaoCaoService
            .normalizeReportData({

                maBaoCao,

                tenBaoCao,

                nhomBaoCao:
                    enumItem(
                        enums.nhomBaoCao,
                        30
                    ),

                boLoc,

                tongSoBanGhi:
                    rows.length,

                tongHop,

                ds:
                    rows.map(
                        (
                            row,
                            index
                        ) => ({

                            stt:
                                index + 1,

                            ...row

                        })
                    )

            });

    /*
     * ======================================
     * TẠO FILE
     * ======================================
     */

    return await inBaoCaoService
        .taoBaoCao({

            maBaoCao,

            id:
                randomUUID(),

            soPhieu:
                null,

            data,

            nguoiInId:
                taiKhoanId

        });

}


module.exports = {

    Joi,

    enums,

    idArraySchema,

    enumArraySchema,

    enumItem,

    chuyenSo,

    taoSchema,

    taoBoLoc,

    mapThucDon,

    xuatBaoCao

};