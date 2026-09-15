'use strict';


const pool = require(
    '../../../../config/database'
);


const {
    taoBoLoc,
    chuyenSo
} = require(
    '../thuc-don-report.helper'
);


class Td05Repository {

    async getDuLieu(
        filters
    ) {

        const q =
            taoBoLoc(
                filters
            );


        /*
         * ==========================================
         * ĐỢT BÌNH CHỌN
         * ==========================================
         */

        q.addArray(
            'dbc.id',
            filters.dotBinhChonIds
        );


        /*
         * ==========================================
         * TRẠNG THÁI ĐỢT
         * ==========================================
         */

        q.addArray(
            'dbc.trang_thai',
            filters.trangThaiDotBinhChon,
            'integer'
        );


        const sql = `

            SELECT

                /*
                 * ==================================
                 * ĐỢT BÌNH CHỌN
                 * ==================================
                 */

                dbc.id
                    AS "dotBinhChonId",

                dbc.bat_dau_binh_chon
                    AS "batDauBinhChon",

                dbc.han_binh_chon
                    AS "hanBinhChon",

                dbc.trang_thai
                    AS "trangThaiDotBinhChon",

                dbc.cho_phep_thay_doi
                    AS "choPhepThayDoi",

                dbc.created_at
                    AS "thoiGianTaoDot",

                dbc.thoi_gian_gui
                    AS "thoiGianGui",

                dbc.thoi_gian_huy
                    AS "thoiGianHuy",

                dbc.ly_do_huy
                    AS "lyDoHuy",


                /*
                 * ==================================
                 * NGÀY ÁP DỤNG
                 * ==================================
                 */

                tdn.id
                    AS "thucDonNgayId",

                tdn.ngay::text
                    AS "ngayApDung",


                /*
                 * ==================================
                 * THỰC ĐƠN
                 * ==================================
                 */

                td.id
                    AS "thucDonId",

                td.ma_thuc_don
                    AS "maThucDon",

                td.ten_thuc_don
                    AS "tenThucDon",


                /*
                 * ==================================
                 * CƠ SỞ
                 * ==================================
                 */

                td.co_so_id
                    AS "coSoId",

                cs.ma_co_so
                    AS "maCoSo",

                cs.ten_co_so
                    AS "tenCoSo",


                /*
                 * ==================================
                 * NHÀ ĂN
                 * ==================================
                 */

                td.nha_an_id
                    AS "nhaAnId",

                na.ma_nha_an
                    AS "maNhaAn",

                na.ten_nha_an
                    AS "tenNhaAn",


                /*
                 * ==================================
                 * CA ĂN
                 * ==================================
                 */

                td.ca_an_id
                    AS "caAnId",

                ca.ma_ca_an
                    AS "maCaAn",

                ca.ten_ca_an
                    AS "tenCaAn",


                /*
                 * ==================================
                 * KẾT QUẢ
                 * ==================================
                 */

                COUNT(
                    bc.id
                )::integer
                    AS "tongSoLuotBinhChon",


                COUNT(
                    bc.id
                )
                FILTER (
                    WHERE
                        bc.lua_chon =
                        TRUE
                )::integer
                    AS "soLuotCo",


                COUNT(
                    bc.id
                )
                FILTER (
                    WHERE
                        bc.lua_chon =
                        FALSE
                )::integer
                    AS "soLuotKhong",


                CASE

                    WHEN
                        COUNT(
                            bc.id
                        ) =
                        0

                    THEN
                        0

                    ELSE
                        ROUND(
                            (
                                COUNT(
                                    bc.id
                                )
                                FILTER (
                                    WHERE
                                        bc.lua_chon =
                                        TRUE
                                )
                            )::numeric
                            *
                            100
                            /
                            COUNT(
                                bc.id
                            )::numeric,
                            2
                        )

                END
                    AS "tyLeCo",


                CASE

                    WHEN
                        COUNT(
                            bc.id
                        ) =
                        0

                    THEN
                        0

                    ELSE
                        ROUND(
                            (
                                COUNT(
                                    bc.id
                                )
                                FILTER (
                                    WHERE
                                        bc.lua_chon =
                                        FALSE
                                )
                            )::numeric
                            *
                            100
                            /
                            COUNT(
                                bc.id
                            )::numeric,
                            2
                        )

                END
                    AS "tyLeKhong"


            FROM nv_dot_binh_chon dbc


            INNER JOIN ct_thuc_don_ngay tdn

                ON tdn.id =
                    dbc.thuc_don_ngay_id


            INNER JOIN nv_thuc_don td

                ON td.id =
                    tdn.thuc_don_id


            LEFT JOIN ct_binh_chon_suat_an bc

                ON bc.dot_binh_chon_id =
                    dbc.id


            LEFT JOIN dm_co_so cs

                ON cs.id =
                    td.co_so_id


            LEFT JOIN dm_nha_an na

                ON na.id =
                    td.nha_an_id


            LEFT JOIN dm_ca_an ca

                ON ca.id =
                    td.ca_an_id


            WHERE

                ${q.conditions.join(
                    '\nAND '
                )}


            GROUP BY

                dbc.id,
                dbc.bat_dau_binh_chon,
                dbc.han_binh_chon,
                dbc.trang_thai,
                dbc.cho_phep_thay_doi,
                dbc.created_at,
                dbc.thoi_gian_gui,
                dbc.thoi_gian_huy,
                dbc.ly_do_huy,

                tdn.id,
                tdn.ngay,

                td.id,
                td.ma_thuc_don,
                td.ten_thuc_don,

                td.co_so_id,
                cs.ma_co_so,
                cs.ten_co_so,

                td.nha_an_id,
                na.ma_nha_an,
                na.ten_nha_an,

                td.ca_an_id,
                ca.ma_ca_an,
                ca.ten_ca_an


            ORDER BY

                tdn.ngay
                    DESC,

                dbc.id
                    DESC

        `;


        const {
            rows
        } =
            await pool.query(
                sql,
                q.values
            );


        return rows.map(
            row =>
                chuyenSo(
                    row,
                    [
                        'tongSoLuotBinhChon',
                        'soLuotCo',
                        'soLuotKhong',
                        'tyLeCo',
                        'tyLeKhong'
                    ]
                )
        );

    }

}


module.exports =
    new Td05Repository();