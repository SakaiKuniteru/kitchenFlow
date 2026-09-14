'use strict';

const pool = require('../../../../config/database');

const {
    getTimeExpression,
    taoBoLoc,
    chuyenSo
} = require('../dat-mon-report.helper');

class Dh01Repository {
    async getDuLieu(filters) {
        const time = getTimeExpression(filters.loaiThoiGian);
        const q = taoBoLoc(filters, time);

        const sql = `
            SELECT
                (${time})::date::text AS "ngay",

                dh.co_so_id AS "coSoId",
                cs.ten_co_so AS "tenCoSo",

                dh.trang_thai AS "trangThaiDon",
                dh.phuong_thuc_thanh_toan AS "phuongThucThanhToan",
                dh.trang_thai_thanh_toan AS "trangThaiThanhToan",

                COUNT(*) AS "soDon",

                COALESCE(SUM(dh.tam_tinh), 0) AS "tamTinh",
                COALESCE(SUM(dh.tong_mien_giam), 0) AS "tongMienGiam",
                COALESCE(SUM(dh.phi_dich_vu), 0) AS "phiDichVu",
                COALESCE(SUM(dh.tong_thanh_toan), 0) AS "tongThanhToan"

            FROM nv_don_hang dh

            LEFT JOIN dm_co_so cs
                ON cs.id = dh.co_so_id

            WHERE ${q.conditions.join('\nAND ')}

            GROUP BY
                (${time})::date,
                dh.co_so_id,
                cs.ten_co_so,
                dh.trang_thai,
                dh.phuong_thuc_thanh_toan,
                dh.trang_thai_thanh_toan

            ORDER BY
                (${time})::date,
                dh.co_so_id,
                dh.trang_thai,
                dh.phuong_thuc_thanh_toan,
                dh.trang_thai_thanh_toan
        `;

        const { rows } = await pool.query(sql, q.values);

        return rows.map(row => chuyenSo(row, [
            'soDon',
            'tamTinh',
            'tongMienGiam',
            'phiDichVu',
            'tongThanhToan'
        ]));
    }
}

module.exports = new Dh01Repository();