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


class Td03Repository {

    async getDuLieu(
        filters
    ) {

        const q =
            taoBoLoc(
                filters
            );


        /*
         * ==========================================
         * FILTER NHÓM MÓN
         * ==========================================
         */

        q.addArray(
            'tdnma.nhom_mon_an_id',
            filters.nhomMonAnIds
        );


        /*
         * ==========================================
         * FILTER MÓN ĂN
         * ==========================================
         */

        q.addArray(
            'tdma.mon_an_id',
            filters.monAnIds
        );


        /*
         * ==========================================
         * SỐ LẦN XUẤT HIỆN TỐI THIỂU
         * ==========================================
         */

        q.values.push(
            filters
                .soLanXuatHienToiThieu
        );


        const minPlaceholder =
            `$${q.values.length}`;


        const sql = `

            SELECT

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
                 * NHÓM MÓN
                 * ==================================
                 */

                tdnma.nhom_mon_an_id
                    AS "nhomMonAnId",

                nma.ma_nhom_mon_an
                    AS "maNhomMonAn",

                nma.ten_nhom_mon_an
                    AS "tenNhomMonAn",


                /*
                 * ==================================
                 * MÓN ĂN
                 * ==================================
                 */

                tdma.mon_an_id
                    AS "monAnId",

                ma.ma_mon_an
                    AS "maMonAn",

                ma.ten_mon_an
                    AS "tenMonAn",


                /*
                 * ==================================
                 * TẦN SUẤT
                 * ==================================
                 */

                COUNT(
                    DISTINCT tdn.id
                )::integer
                    AS "soLanXuatHien",


                COUNT(
                    DISTINCT td.id
                )::integer
                    AS "soThucDon",


                MIN(
                    tdn.ngay
                )::text
                    AS "ngayXuatHienDau",


                MAX(
                    tdn.ngay
                )::text
                    AS "ngayXuatHienCuoi",


                STRING_AGG(
                    DISTINCT
                    TO_CHAR(
                        tdn.ngay,
                        'DD/MM/YYYY'
                    ),
                    ', '
                    ORDER BY
                    TO_CHAR(
                        tdn.ngay,
                        'DD/MM/YYYY'
                    )
                )
                    AS "danhSachNgayXuatHien"


            FROM ct_thuc_don_ngay tdn


            INNER JOIN nv_thuc_don td

                ON td.id =
                    tdn.thuc_don_id


            INNER JOIN
                ct_thuc_don_nhom_mon_an
                tdnma

                ON tdnma
                    .thuc_don_ngay_id =
                    tdn.id

                AND tdnma.active =
                    TRUE


            INNER JOIN
                ct_thuc_don_mon_an
                tdma

                ON tdma
                    .thuc_don_nhom_mon_an_id =
                    tdnma.id

                AND tdma.active =
                    TRUE


            LEFT JOIN dm_co_so cs

                ON cs.id =
                    td.co_so_id


            LEFT JOIN dm_nha_an na

                ON na.id =
                    td.nha_an_id


            LEFT JOIN dm_ca_an ca

                ON ca.id =
                    td.ca_an_id


            LEFT JOIN dm_nhom_mon_an nma

                ON nma.id =
                    tdnma.nhom_mon_an_id


            LEFT JOIN dm_mon_an ma

                ON ma.id =
                    tdma.mon_an_id


            WHERE

                ${q.conditions.join(
                    '\nAND '
                )}


            GROUP BY

                td.co_so_id,
                cs.ma_co_so,
                cs.ten_co_so,

                td.nha_an_id,
                na.ma_nha_an,
                na.ten_nha_an,

                td.ca_an_id,
                ca.ma_ca_an,
                ca.ten_ca_an,

                tdnma.nhom_mon_an_id,
                nma.ma_nhom_mon_an,
                nma.ten_nhom_mon_an,

                tdma.mon_an_id,
                ma.ma_mon_an,
                ma.ten_mon_an


            HAVING

                COUNT(
                    DISTINCT tdn.id
                ) >=
                ${minPlaceholder}::integer


            ORDER BY

                COUNT(
                    DISTINCT tdn.id
                )
                    DESC,

                cs.ten_co_so
                    NULLS LAST,

                na.ten_nha_an
                    NULLS LAST,

                ca.ten_ca_an
                    NULLS LAST,

                nma.ten_nhom_mon_an
                    NULLS LAST,

                ma.ten_mon_an
                    NULLS LAST

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
                        'soLanXuatHien',
                        'soThucDon'
                    ]
                )
        );

    }

}


module.exports =
    new Td03Repository();