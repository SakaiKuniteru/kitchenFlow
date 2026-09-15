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


const {
    NGUON_SO_SUAT
} = require(
    './td04.validation'
);


class Td04Repository {

    async getDuLieu(
        filters
    ) {

        const q =
            taoBoLoc(
                filters
            );


        /*
         * ==========================================
         * THỰC ĐƠN
         * ==========================================
         */

        q.addArray(
            'td.id',
            filters.thucDonIds
        );


        /*
         * ==========================================
         * MÓN ĂN
         * ==========================================
         */

        q.addArray(
            'tdma.mon_an_id',
            filters.monAnIds
        );


        /*
         * ==========================================
         * THỰC PHẨM
         * ==========================================
         */

        q.addArray(
            'matp.thuc_pham_id',
            filters.thucPhamIds
        );


        /*
         * ==========================================
         * NGUỒN SỐ SUẤT
         * ==========================================
         */

        q.addArray(
            'ss.nguon_so_suat',
            filters.nguonSoSuat,
            'integer'
        );


        const sql = `

            /*
             * ======================================
             * SỐ SUẤT THEO NGÀY THỰC ĐƠN
             * ======================================
             */

            WITH so_suat AS (

                /*
                 * ==================================
                 * 10 - DỰ KIẾN
                 * ==================================
                 *
                 * Lấy số người bình chọn Có.
                 */

                SELECT

                    tdn_source.id
                        AS thuc_don_ngay_id,

                    ${NGUON_SO_SUAT.DU_KIEN}::integer
                        AS nguon_so_suat,

                    COUNT(
                        DISTINCT bc.tai_khoan_id
                    )::numeric
                        AS so_suat


                FROM ct_thuc_don_ngay
                    tdn_source


                LEFT JOIN nv_dot_binh_chon dbc

                    ON dbc.thuc_don_ngay_id =
                        tdn_source.id

                    /*
                     * Không lấy đợt đã hủy.
                     */

                    AND dbc.trang_thai <>
                        30


                LEFT JOIN
                    ct_binh_chon_suat_an
                    bc

                    ON bc.dot_binh_chon_id =
                        dbc.id

                    AND bc.lua_chon =
                        TRUE


                GROUP BY

                    tdn_source.id


                UNION ALL


                /*
                 * ==================================
                 * 20 - ĐĂNG KÝ
                 * ==================================
                 *
                 * Tổng số lượng phiếu lấy vé.
                 *
                 * 50 = Đã hủy
                 * 60 = Đã hoàn
                 */

                SELECT

                    tdn_source.id
                        AS thuc_don_ngay_id,

                    ${NGUON_SO_SUAT.DANG_KY}::integer
                        AS nguon_so_suat,

                    COALESCE(
                        SUM(
                            p.so_luong
                        )
                        FILTER (
                            WHERE
                                p.trang_thai
                                NOT IN (
                                    50,
                                    60
                                )
                        ),
                        0
                    )::numeric
                        AS so_suat


                FROM ct_thuc_don_ngay
                    tdn_source


                LEFT JOIN
                    nv_phieu_lay_ve_an p

                    ON p.thuc_don_ngay_id =
                        tdn_source.id


                GROUP BY

                    tdn_source.id

            )


            SELECT

                /*
                 * ==================================
                 * NGÀY PHỤC VỤ
                 * ==================================
                 */

                tdn.id
                    AS "thucDonNgayId",

                tdn.ngay::text
                    AS "ngayPhucVu",


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
                 * THỰC PHẨM
                 * ==================================
                 */

                matp.thuc_pham_id
                    AS "thucPhamId",

                tp.ma_thuc_pham
                    AS "maThucPham",

                tp.ten_thuc_pham
                    AS "tenThucPham",


                /*
                 * ==================================
                 * ĐƠN VỊ SỬ DỤNG
                 * ==================================
                 */

                tp.don_vi_su_dung_id
                    AS "donViSuDungId",

                dvt.ma_don_vi_tinh
                    AS "maDonViSuDung",

                dvt.ten_don_vi_tinh
                    AS "tenDonViSuDung",

                dvt.ky_hieu
                    AS "kyHieuDonViSuDung",


                /*
                 * ==================================
                 * NGUỒN SỐ SUẤT
                 * ==================================
                 */

                ss.nguon_so_suat
                    AS "nguonSoSuat",

                ss.so_suat
                    AS "soSuat",


                /*
                 * ==================================
                 * ĐỊNH LƯỢNG
                 * ==================================
                 *
                 * ct_mon_an_thuc_pham.dinh_luong
                 * được hiểu là lượng nguyên liệu
                 * cho một suất món.
                 */

                matp.dinh_luong
                    AS "dinhLuongMotSuat",


                /*
                 * ==================================
                 * HAO HỤT DỰ KIẾN
                 * ==================================
                 */

                COALESCE(
                    tp.ty_le_hao_hut_du_kien,
                    0
                )
                    AS "tyLeHaoHutDuKien",


                /*
                 * ==================================
                 * NHU CẦU CƠ BẢN
                 * ==================================
                 */

                (
                    matp.dinh_luong *
                    ss.so_suat
                )
                    AS "nhuCauCoBan",


                /*
                 * ==================================
                 * NHU CẦU SAU HAO HỤT
                 * ==================================
                 *
                 * Công thức:
                 *
                 * nhuCauCoBan
                 * ×
                 * (1 + haoHut / 100)
                 */

                (
                    matp.dinh_luong *
                    ss.so_suat *
                    (
                        1 +
                        COALESCE(
                            tp
                                .ty_le_hao_hut_du_kien,
                            0
                        ) /
                        100
                    )
                )
                    AS "nhuCauSauHaoHut"


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
             * CÔNG THỨC MÓN ĂN
             * ======================================
             */

            INNER JOIN
                ct_mon_an_thuc_pham
                matp

                ON matp.mon_an_id =
                    tdma.mon_an_id

                AND matp.active =
                    TRUE


            /*
             * ======================================
             * SỐ SUẤT
             * ======================================
             */

            INNER JOIN so_suat ss

                ON ss.thuc_don_ngay_id =
                    tdn.id


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


            LEFT JOIN dm_mon_an ma

                ON ma.id =
                    tdma.mon_an_id


            LEFT JOIN dm_thuc_pham tp

                ON tp.id =
                    matp.thuc_pham_id


            LEFT JOIN dm_don_vi_tinh dvt

                ON dvt.id =
                    tp.don_vi_su_dung_id


            WHERE

                ${q.conditions.join(
                    '\nAND '
                )}


            ORDER BY

                tdn.ngay ASC,

                cs.ten_co_so
                    NULLS LAST,

                na.ten_nha_an
                    NULLS LAST,

                ca.ten_ca_an
                    NULLS LAST,

                td.ma_thuc_don,

                ma.ten_mon_an
                    NULLS LAST,

                tp.ten_thuc_pham
                    NULLS LAST,

                ss.nguon_so_suat

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
                        'nguonSoSuat',
                        'soSuat',
                        'dinhLuongMotSuat',
                        'tyLeHaoHutDuKien',
                        'nhuCauCoBan',
                        'nhuCauSauHaoHut'
                    ]
                )
        );

    }

}


module.exports =
    new Td04Repository();