'use strict';

const pool = require('../../../../config/database');

const {
    TRANG_THAI_DANG_XU_LY,
    taoBoLoc,
    sqlChiTietDon
} = require('../dat-mon-report.helper');

class Dh04Repository {
    async getDuLieu(filters) {
        const q = taoBoLoc(
            filters,
            'dh.thoi_gian_nhan_tu'
        );

        q.conditions.push(
            `dh.trang_thai IN (${TRANG_THAI_DANG_XU_LY.join(',')})`
        );

        const sql = `
            WITH danh_sach AS (
                ${sqlChiTietDon(
                    q.conditions.join('\nAND '),
                    { kemMon: true }
                )}
            )

            SELECT
                d.*,

                (
                    d."thoiGianNhanDen" < STATEMENT_TIMESTAMP()
                ) AS "daQuaHanNhan"

            FROM danh_sach d

            ORDER BY
                d."thoiGianNhanTu",
                d."diaDiemNhanId",
                d."donHangId"
        `;

        const { rows } = await pool.query(sql, q.values);

        return rows;
    }
}

module.exports = new Dh04Repository();