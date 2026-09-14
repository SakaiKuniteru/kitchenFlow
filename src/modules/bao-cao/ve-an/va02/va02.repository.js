'use strict';

const pool = require('../../../../config/database');

const {
    taoBoLoc
} = require('../ve-an-report.helper');

class Va02Repository {
    getTimeExpression(value) {
        switch (value) {
            case 'NGAY_TAO':
                return 'v.created_at';

            case 'NGAY_SU_DUNG':
                return 'tdn.ngay';

            default:
                throw new Error('Loại thời gian VA2 không hợp lệ.');
        }
    }

    async getDuLieu(filters) {
        const timeExpression = this.getTimeExpression(
            filters.loaiThoiGian
        );

        const { where, values } = taoBoLoc(
            filters,
            timeExpression
        );

        const sql = `
            SELECT
                v.id AS "veId",
                v.ma_ve AS "maVe",
                v.so_thu_tu AS "soThuTu",

                v.phieu_lay_ve_id AS "phieuLayVeId",
                p.so_phieu AS "soPhieu",
                p.phieu_goc_id AS "phieuGocId",

                tdn.ngay::text AS "ngaySuDung",

                v.created_at
                    AT TIME ZONE 'Asia/Ho_Chi_Minh'
                    AS "thoiGianTaoVe",

                v.thoi_gian_su_dung
                    AT TIME ZONE 'Asia/Ho_Chi_Minh'
                    AS "thoiGianSuDungThucTe",

                v.trang_thai AS "trangThaiVe",
                p.trang_thai AS "trangThaiThanhToan",

                p.thoi_gian_thanh_toan
                    AT TIME ZONE 'Asia/Ho_Chi_Minh'
                    AS "thoiGianThanhToanPhieu",

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

                v.nguoi_xac_nhan_id AS "nguoiXacNhanId",
                v.nguoi_huy_id AS "nguoiHuyId",

                v.thoi_gian_huy
                    AT TIME ZONE 'Asia/Ho_Chi_Minh'
                    AS "thoiGianHuy",

                v.ly_do_huy AS "lyDoHuy"

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

            WHERE ${where}

            ORDER BY
                ${timeExpression} DESC,
                p.so_phieu,
                v.so_thu_tu,
                v.id
        `;

        const { rows } = await pool.query(sql, values);

        return rows;
    }
}

module.exports = new Va02Repository();