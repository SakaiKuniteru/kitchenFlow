'use strict';

const pool = require('../../../../config/database');

const {
    getTimeExpression,
    taoBoLoc,
    sqlChiTietDon
} = require('../dat-mon-report.helper');

class Dh02Repository {
    async getDuLieu(filters) {
        const time = getTimeExpression(filters.loaiThoiGian);
        const q = taoBoLoc(filters, time);

        const sql = `
            ${sqlChiTietDon(
                q.conditions.join('\nAND '),
                { kemMon: true }
            )}

            ORDER BY ${time} DESC, dh.id DESC
        `;

        const { rows } = await pool.query(sql, q.values);

        return rows;
    }
}

module.exports = new Dh02Repository();