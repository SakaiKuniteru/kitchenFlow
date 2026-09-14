'use strict';

const pool = require('../../../../config/database');

const {
    taoBoLoc
} = require('../ve-an-report.helper');

class Va05Repository {
    async getDuLieu(filters) {
        const base = taoBoLoc(
            filters,
            'v.thoi_gian_huy'
        );

        const values = [...base.values];

        const conditions = [
            base.where,

            // Trạng thái vé: Đã hủy.
            'v.trang_thai = 30'
        ];

        if (
            Array.isArray(filters.nguoiHuyIds) &&
            filters.nguoiHuyIds.length > 0
        ) {
            values.push(filters.nguoiHuyIds);

            conditions.push(`
                v.nguoi_huy_id =
                    ANY($${values.length}::bigint[])
            `);
        }

        if (filters.lyDoHuy) {
            values.push(filters.lyDoHuy);

            /*
             * Tìm chuỗi literal không phân biệt hoa/thường.
             * % và _ không được hiểu thành wildcard.
             */
            conditions.push(`
                POSITION(
                    LOWER($${values.length}::text)
                    IN LOWER(COALESCE(v.ly_do_huy, ''))
                ) > 0
            `);
        }

        const sql = `
            SELECT
                v.id AS "veId",
                v.ma_ve AS "maVe",
                v.so_thu_tu AS "soThuTu",

                v.trang_thai AS "trangThaiVe",

                v.phieu_lay_ve_id AS "phieuLayVeId",
                p.so_phieu AS "soPhieu",
                p.phieu_goc_id AS "phieuGocId",

                p.trang_thai AS "trangThaiPhieu",

                tdn.ngay::text AS "ngaySuDung",

                v.created_at
                    AT TIME ZONE 'Asia/Ho_Chi_Minh'
                    AS "thoiGianTaoVe",

                v.thoi_gian_huy
                    AT TIME ZONE 'Asia/Ho_Chi_Minh'
                    AS "thoiGianHuy",

                v.ly_do_huy AS "lyDoHuy",

                td.co_so_id AS "coSoId",
                cs.ma_co_so AS "maCoSo",
                cs.ten_co_so AS "tenCoSo",

                td.nha_an_id AS "nhaAnId",
                na.ma_nha_an AS "maNhaAn",
                na.ten_nha_an AS "tenNhaAn",

                td.ca_an_id AS "caAnId",
                ca.ma_ca_an AS "maCaAn",
                ca.ten_ca_an AS "tenCaAn",

                p.doi_tuong_lay_ve AS "loaiVe",

                p.nhan_vien_id AS "nhanVienId",
                nv.ma_nhan_vien AS "maNhanVien",
                nv.ho_ten AS "tenNhanVien",

                p.ho_ten_nguoi_lay_ve AS "hoTenNguoiLayVe",
                p.don_vi_nguoi_lay_ve AS "donViNguoiLayVe",

                nv.phong_ban_id AS "phongBanId",
                pb.ma_phong_ban AS "maPhongBan",
                pb.ten_phong_ban AS "tenPhongBan",

                v.nguoi_huy_id AS "taiKhoanNguoiHuyId",

                tk_huy.ten_dang_nhap AS "taiKhoanNguoiHuy",

                nv_huy.id AS "nhanVienNguoiHuyId",
                nv_huy.ma_nhan_vien AS "maNhanVienNguoiHuy",
                nv_huy.ho_ten AS "tenNguoiHuy"

            FROM ct_ve_an v

            INNER JOIN nv_phieu_lay_ve_an p
                ON p.id = v.phieu_lay_ve_id

            INNER JOIN ct_thuc_don_ngay tdn
                ON tdn.id = v.thuc_don_ngay_id

            INNER JOIN nv_thuc_don td
                ON td.id = tdn.thuc_don_id

            LEFT JOIN dm_co_so cs
                ON cs.id = td.co_so_id

            LEFT JOIN dm_nha_an na
                ON na.id = td.nha_an_id

            LEFT JOIN dm_ca_an ca
                ON ca.id = td.ca_an_id

            LEFT JOIN dm_nhan_vien nv
                ON nv.id = p.nhan_vien_id

            LEFT JOIN dm_phong_ban pb
                ON pb.id = nv.phong_ban_id

            LEFT JOIN dm_tai_khoan tk_huy
                ON tk_huy.id = v.nguoi_huy_id

            LEFT JOIN dm_nhan_vien nv_huy
                ON nv_huy.id = tk_huy.nhan_vien_id

            WHERE ${conditions.join('\nAND ')}

            ORDER BY
                v.thoi_gian_huy DESC,
                p.so_phieu,
                v.so_thu_tu,
                v.id
        `;

        const { rows } = await pool.query(sql, values);

        return rows;
    }
}

module.exports = new Va05Repository();