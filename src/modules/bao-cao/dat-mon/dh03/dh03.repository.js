'use strict';

const pool = require('../../../../config/database');

const {
    CT,
    taoBoLoc,
    chuyenSo
} = require('../dat-mon-report.helper');

class Dh03Repository {
    async getDuLieu(filters) {
        const q = taoBoLoc(
            filters,
            'dh.thoi_gian_nhan_tu'
        );

        q.addArray(
            'sp.nhom_san_pham_id',
            filters.nhomSanPhamIds
        );

        q.addArray(
            'ct.san_pham_id',
            filters.sanPhamIds
        );

        q.conditions.push(
            `ct.trang_thai <> ${CT.DA_HUY}`
        );

        const sql = `
            SELECT
                dh.thoi_gian_nhan_tu::date::text
                    AS "ngayNhan",

                dh.co_so_id AS "coSoId",
                cs.ten_co_so AS "tenCoSo",

                dh.khung_gio_nhan_id AS "khungGioNhanId",
                kg.ten_khung_gio AS "tenKhungGio",

                sp.nhom_san_pham_id AS "nhomSanPhamIdHienTai",

                ct.san_pham_id AS "sanPhamId",
                ct.ma_san_pham_snapshot AS "maSanPham",
                ct.ten_san_pham_snapshot AS "tenSanPham",
                ct.ten_nhom_snapshot AS "tenNhom",
                ct.don_vi_snapshot AS "donViTinh",

                COUNT(DISTINCT dh.id) AS "soDonTrongNhom",
                COUNT(*) AS "soDongChiTiet",

                SUM(ct.so_luong) AS "tongSoLuong",

                SUM(ct.thanh_tien) AS "tienTheoDong"

            FROM ct_don_hang ct

            INNER JOIN nv_don_hang dh
                ON dh.id = ct.don_hang_id

            LEFT JOIN dm_san_pham sp
                ON sp.id = ct.san_pham_id

            LEFT JOIN dm_co_so cs
                ON cs.id = dh.co_so_id

            LEFT JOIN dm_khung_gio_nhan_hang kg
                ON kg.id = dh.khung_gio_nhan_id

            WHERE ${q.conditions.join('\nAND ')}

            GROUP BY
                dh.thoi_gian_nhan_tu::date,
                dh.co_so_id,
                cs.ten_co_so,
                dh.khung_gio_nhan_id,
                kg.ten_khung_gio,
                sp.nhom_san_pham_id,
                ct.san_pham_id,
                ct.ma_san_pham_snapshot,
                ct.ten_san_pham_snapshot,
                ct.ten_nhom_snapshot,
                ct.don_vi_snapshot

            ORDER BY
                dh.thoi_gian_nhan_tu::date,
                dh.co_so_id,
                dh.khung_gio_nhan_id,
                ct.ten_nhom_snapshot,
                ct.ma_san_pham_snapshot,
                ct.don_vi_snapshot
        `;

        const { rows } = await pool.query(sql, q.values);

        return rows.map(row => chuyenSo(row, [
            'soDonTrongNhom',
            'soDongChiTiet',
            'tongSoLuong',
            'tienTheoDong'
        ]));
    }
}

module.exports = new Dh03Repository();