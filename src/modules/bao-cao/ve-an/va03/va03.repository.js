'use strict';

const pool = require('../../../../config/database');

const {
    taoBoLoc,
    chuyenSo
} = require('../ve-an-report.helper');

class Va03Repository {
    async getDuLieu(filters) {
        const { where, values } = taoBoLoc(
            filters,
            'tdn.ngay',
            { locTheoPhieu: true }
        );

        const sql = `
            WITH du_lieu AS (
                SELECT
                    p.id AS "phieuLayVeId",
                    p.so_phieu AS "soPhieu",
                    p.phieu_goc_id AS "phieuGocId",

                    p.created_at
                        AT TIME ZONE 'Asia/Ho_Chi_Minh'
                        AS "thoiGianDangKy",

                    tdn.ngay::text AS "ngaySuDung",

                    p.trang_thai AS "trangThaiPhieu",

                    td.co_so_id AS "coSoId",
                    cs.ma_co_so AS "maCoSo",
                    cs.ten_co_so AS "tenCoSo",

                    td.nha_an_id AS "nhaAnId",
                    na.ma_nha_an AS "maNhaAn",
                    na.ten_nha_an AS "tenNhaAn",

                    td.ca_an_id AS "caAnId",
                    ca.ma_ca_an AS "maCaAn",
                    ca.ten_ca_an AS "tenCaAn",

                    p.nhan_vien_id AS "nhanVienId",
                    nv.ma_nhan_vien AS "maNhanVien",
                    nv.ho_ten AS "tenNhanVien",

                    p.ho_ten_nguoi_lay_ve AS "hoTenNguoiLayVe",
                    p.don_vi_nguoi_lay_ve AS "donViNguoiLayVe",

                    nv.phong_ban_id AS "phongBanId",
                    pb.ma_phong_ban AS "maPhongBan",
                    pb.ten_phong_ban AS "tenPhongBan",

                    p.so_luong AS "soLuongTheoPhieu",

                    ve.tong_so_ve AS "soVeDaPhat",
                    ve.chua_su_dung AS "soVeChuaSuDung",
                    ve.da_su_dung AS "soVeDaSuDung",
                    ve.da_huy AS "soVeDaHuy",
                    ve.het_han AS "soVeHetHan",

                    CASE
                        WHEN p.trang_thai IN (50, 60)
                            THEN 0

                        ELSE GREATEST(
                            p.so_luong - ve.da_huy,
                            0
                        )
                    END AS "soLuongConDangKy",

                    CASE
                        WHEN p.trang_thai IN (50, 60)
                            THEN 0

                        ELSE GREATEST(
                            p.so_luong - ve.tong_so_ve,
                            0
                        )
                    END AS "soLuongChuaPhat",

                    ve.su_dung_dau
                        AT TIME ZONE 'Asia/Ho_Chi_Minh'
                        AS "thoiGianSuDungDau",

                    ve.su_dung_cuoi
                        AT TIME ZONE 'Asia/Ho_Chi_Minh'
                        AS "thoiGianSuDungCuoi"

                FROM nv_phieu_lay_ve_an p

                INNER JOIN ct_thuc_don_ngay tdn
                    ON tdn.id = p.thuc_don_ngay_id

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

                LEFT JOIN LATERAL (
                    SELECT
                        COUNT(*) AS tong_so_ve,

                        COUNT(*) FILTER (
                            WHERE v.trang_thai = 10
                        ) AS chua_su_dung,

                        COUNT(*) FILTER (
                            WHERE v.trang_thai = 20
                        ) AS da_su_dung,

                        COUNT(*) FILTER (
                            WHERE v.trang_thai = 30
                        ) AS da_huy,

                        COUNT(*) FILTER (
                            WHERE v.trang_thai = 40
                        ) AS het_han,

                        MIN(v.thoi_gian_su_dung) FILTER (
                            WHERE v.trang_thai = 20
                        ) AS su_dung_dau,

                        MAX(v.thoi_gian_su_dung) FILTER (
                            WHERE v.trang_thai = 20
                        ) AS su_dung_cuoi

                    FROM ct_ve_an v

                    WHERE v.phieu_lay_ve_id = p.id
                ) ve ON TRUE

                WHERE ${where}
            )

            SELECT *
            FROM du_lieu

            ORDER BY
                "ngaySuDung",
                "maCoSo",
                "maNhaAn",
                "maCaAn",
                "maPhongBan" NULLS LAST,
                "maNhanVien" NULLS LAST,
                "soPhieu",
                "phieuLayVeId"
        `;

        const { rows } = await pool.query(sql, values);

        return rows.map(row => chuyenSo(row, [
            'soLuongTheoPhieu',
            'soVeDaPhat',
            'soVeChuaSuDung',
            'soVeDaSuDung',
            'soVeDaHuy',
            'soVeHetHan',
            'soLuongConDangKy',
            'soLuongChuaPhat'
        ]));
    }
}

module.exports = new Va03Repository();