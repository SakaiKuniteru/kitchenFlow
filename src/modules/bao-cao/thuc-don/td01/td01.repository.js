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


class Td01Repository {

    async getDuLieu(
        filters
    ) {

        const q =
            taoBoLoc(
                filters
            );


        const sql = `

            SELECT

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

                td.loai_thuc_don
                    AS "loaiThucDon",

                td.tu_ngay::date::text
                    AS "tuNgayThucDon",

                td.den_ngay::date::text
                    AS "denNgayThucDon",


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
                 * TRẠNG THÁI
                 * ==================================
                 */

                td.trang_thai
                    AS "trangThaiThucDon",


                /*
                 * ==================================
                 * NỘI DUNG NGÀY
                 * ==================================
                 */

                tdn.ghi_chu
                    AS "ghiChuNgay",


                /*
                 * ==================================
                 * THỐNG KÊ NHÓM / MÓN
                 * ==================================
                 */

                COUNT(
                    DISTINCT tdnma.id
                )::integer
                    AS "soNhomMon",


                COUNT(
                    DISTINCT tdma.id
                )::integer
                    AS "soMonAn"


            FROM ct_thuc_don_ngay tdn


            INNER JOIN nv_thuc_don td

                ON td.id =
                    tdn.thuc_don_id


            LEFT JOIN dm_co_so cs

                ON cs.id =
                    td.co_so_id


            LEFT JOIN dm_nha_an na

                ON na.id =
                    td.nha_an_id


            LEFT JOIN dm_ca_an ca

                ON ca.id =
                    td.ca_an_id


            /*
             * Chỉ đếm nhóm món còn hoạt động.
             */

            LEFT JOIN
                ct_thuc_don_nhom_mon_an
                tdnma

                ON tdnma
                    .thuc_don_ngay_id =
                    tdn.id

                AND tdnma.active =
                    TRUE


            /*
             * Chỉ đếm món còn hoạt động.
             */

            LEFT JOIN
                ct_thuc_don_mon_an
                tdma

                ON tdma
                    .thuc_don_nhom_mon_an_id =
                    tdnma.id

                AND tdma.active =
                    TRUE


            WHERE

                ${q.conditions.join(
                    '\nAND '
                )}


            GROUP BY

                tdn.id,

                tdn.ngay,

                tdn.ghi_chu,

                td.id,

                td.ma_thuc_don,

                td.ten_thuc_don,

                td.loai_thuc_don,

                td.tu_ngay,

                td.den_ngay,

                td.co_so_id,

                cs.ma_co_so,

                cs.ten_co_so,

                td.nha_an_id,

                na.ma_nha_an,

                na.ten_nha_an,

                td.ca_an_id,

                ca.ma_ca_an,

                ca.ten_ca_an,

                td.trang_thai


            ORDER BY

                tdn.ngay ASC,

                cs.ten_co_so ASC
                    NULLS LAST,

                na.ten_nha_an ASC
                    NULLS LAST,

                ca.ten_ca_an ASC
                    NULLS LAST,

                td.ma_thuc_don ASC,

                td.id ASC

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
                        'soNhomMon',
                        'soMonAn'
                    ]
                )
        );

    }

}


module.exports =
    new Td01Repository();