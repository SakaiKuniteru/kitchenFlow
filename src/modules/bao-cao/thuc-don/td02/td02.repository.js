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


class Td02Repository {

    async getDuLieu(
        filters
    ) {

        const q =
            taoBoLoc(
                filters
            );


        /*
         * ==========================================
         * FILTER RIÊNG TD02
         * ==========================================
         */

        q.addArray(
            'td.id',
            filters.thucDonIds
        );


        q.addArray(
            'tdnma.nhom_mon_an_id',
            filters.nhomMonAnIds
        );


        q.addArray(
            'tdma.mon_an_id',
            filters.monAnIds
        );


        const sql = `

            SELECT

                /*
                 * ==================================
                 * NGÀY
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

                td.trang_thai
                    AS "trangThaiThucDon",


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

                tdnma.id
                    AS "thucDonNhomMonAnId",

                tdnma.nhom_mon_an_id
                    AS "nhomMonAnId",

                nma.ma_nhom_mon_an
                    AS "maNhomMonAn",

                nma.ten_nhom_mon_an
                    AS "tenNhomMonAn",

                tdnma.thu_tu_hien_thi
                    AS "thuTuNhomMon",

                tdnma.ghi_chu
                    AS "ghiChuNhomMon",


                /*
                 * ==================================
                 * MÓN ĂN
                 * ==================================
                 */

                tdma.id
                    AS "thucDonMonAnId",

                tdma.mon_an_id
                    AS "monAnId",

                ma.ma_mon_an
                    AS "maMonAn",

                ma.ten_mon_an
                    AS "tenMonAn",

                tdma.thu_tu_hien_thi
                    AS "thuTuMonAn",

                tdma.dinh_luong
                    AS "dinhLuong",


                /*
                 * ==================================
                 * ĐƠN VỊ TÍNH
                 * ==================================
                 */

                tdma.don_vi_tinh_id
                    AS "donViTinhId",

                dvt.ma_don_vi_tinh
                    AS "maDonViTinh",

                dvt.ten_don_vi_tinh
                    AS "tenDonViTinh",

                dvt.ky_hieu
                    AS "kyHieuDonViTinh",


                /*
                 * ==================================
                 * THÔNG TIN MÓN
                 * ==================================
                 */

                ma.gia_tien
                    AS "giaTien",

                ma.gia_du_kien
                    AS "giaDuKien",

                ma.calories
                    AS "calories",

                tdma.ghi_chu
                    AS "ghiChuMonAn"


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


            /*
             * ======================================
             * DANH MỤC
             * ======================================
             */

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


            LEFT JOIN dm_don_vi_tinh dvt

                ON dvt.id =
                    tdma.don_vi_tinh_id


            WHERE

                ${q.conditions.join(
                    '\nAND '
                )}


            ORDER BY

                tdn.ngay ASC,

                cs.ten_co_so ASC
                    NULLS LAST,

                na.ten_nha_an ASC
                    NULLS LAST,

                ca.ten_ca_an ASC
                    NULLS LAST,

                td.ma_thuc_don ASC,

                tdnma.thu_tu_hien_thi ASC,

                tdnma.id ASC,

                tdma.thu_tu_hien_thi ASC,

                tdma.id ASC

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
                        'thuTuNhomMon',
                        'thuTuMonAn',
                        'dinhLuong',
                        'giaTien',
                        'giaDuKien',
                        'calories'
                    ]
                )
        );

    }

}


module.exports =
    new Td02Repository();