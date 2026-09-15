'use strict';


const pool = require(
    '../../../../config/database'
);


const {
    taoBoLoc
} = require(
    '../thuc-don-report.helper'
);


class Td06Repository {

    async getDuLieu(
        filters
    ) {

        const q =
            taoBoLoc(
                filters
            );


        /*
         * ==========================================
         * LOẠI THỰC ĐƠN
         * ==========================================
         */

        q.addArray(
            'td.loai_thuc_don',
            filters.loaiThucDon,
            'integer'
        );


        /*
         * ==========================================
         * TRẠNG THÁI
         * ==========================================
         */

        q.addArray(
            'td.trang_thai',
            filters.trangThaiThucDon,
            'integer'
        );


        /*
         * ==========================================
         * NGƯỜI LẬP / NGƯỜI DUYỆT
         * ==========================================
         *
         * CHƯA FILTER ở đây.
         *
         * Lý do:
         * nv_thuc_don hiện không có
         * nguoi_lap_id / nguoi_duyet_id.
         */


        const sql = `

            SELECT

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

                td.trang_thai
                    AS "trangThaiThucDon",


                /*
                 * ==================================
                 * KHOẢNG ÁP DỤNG
                 * ==================================
                 */

                td.tu_ngay
                    AS "tuNgay",

                td.den_ngay
                    AS "denNgay",


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
                 * NGƯỜI LẬP / DUYỆT
                 * ==================================
                 *
                 * DB chưa lưu.
                 */

                NULL::bigint
                    AS "nguoiLapId",

                NULL::text
                    AS "maNguoiLap",

                NULL::text
                    AS "tenNguoiLap",

                NULL::bigint
                    AS "nguoiDuyetId",

                NULL::text
                    AS "maNguoiDuyet",

                NULL::text
                    AS "tenNguoiDuyet",


                /*
                 * ==================================
                 * THỜI GIAN HỆ THỐNG
                 * ==================================
                 */

                td.created_at
                    AS "thoiGianLap",

                td.updated_at
                    AS "thoiGianCapNhat",


                /*
                 * ==================================
                 * TRẠNG THÁI TRƯỚC ĐẶC BIỆT
                 * ==================================
                 */

                td.trang_thai_truoc_huy
                    AS "trangThaiTruocHuy",

                td.trang_thai_truoc_ket_thuc
                    AS "trangThaiTruocKetThuc"


            FROM nv_thuc_don td


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


            ORDER BY

                td.tu_ngay
                    DESC,

                td.id
                    DESC

        `;


        const {
            rows
        } =
            await pool.query(
                sql,
                q.values
            );


        return rows;

    }

}


module.exports =
    new Td06Repository();