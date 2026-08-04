const pool =
    require("../../../../config/database");

class MonAnRepository {

    mapMonAn(row) {

        if (!row) {
            return null;
        }

        return {

            id:
                row.id,

            maMonAn:
                row.ma_mon_an,

            tenMonAn:
                row.ten_mon_an,

            nhomMonAnId:
                row.nhom_mon_an_id,

            nhomMonAn: row.nhom_mon_an_id
                ? {
                    id:
                        row.nhom_mon_an_id,

                    ma:
                        row.ma_nhom_mon_an,

                    ten:
                        row.ten_nhom_mon_an,

                    moTa:
                        row.mo_ta_nhom_mon_an
                }
                : null,

            giaTien:
                row.gia_tien !== null
                    ? Number(row.gia_tien)
                    : null,

            giaDuKien:
                row.gia_du_kien !== null
                    ? Number(row.gia_du_kien)
                    : null,

            calories:
                row.calories,

            moTa:
                row.mo_ta,

            hinhAnh:
                row.hinh_anh,

            active:
                row.active,

            createdAt:
                row.created_at,

            updatedAt:
                row.updated_at

        };

    }

    getBaseQuery() {

        return `

            SELECT

                ma.id,
                ma.ma_mon_an,
                ma.ten_mon_an,
                ma.nhom_mon_an_id,

                ma.gia_tien,
                ma.gia_du_kien,
                ma.calories,
                ma.mo_ta,
                ma.hinh_anh,

                ma.active,
                ma.created_at,
                ma.updated_at,

                nma.ma_nhom_mon_an,
                nma.ten_nhom_mon_an,

                nma.mo_ta
                    AS mo_ta_nhom_mon_an

            FROM dm_mon_an ma

            LEFT JOIN dm_nhom_mon_an nma
                ON nma.id = ma.nhom_mon_an_id

        `;

    }

    async getTongHop() {

        const sql = `
            ${this.getBaseQuery()}

            ORDER BY ma.ma_mon_an ASC
        `;

        const result =
            await pool.query(sql);

        return result.rows.map(
            row => this.mapMonAn(row)
        );

    }

    async getChiTiet(id) {

        const sql = `
            ${this.getBaseQuery()}

            WHERE ma.id = $1

            LIMIT 1
        `;

        const result =
            await pool.query(
                sql,
                [id]
            );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapMonAn(
            result.rows[0]
        );

    }

    async getNhomMonAnByMa(
        maNhomMonAn
    ) {

        const sql = `
            SELECT
                id,
                ma_nhom_mon_an,
                ten_nhom_mon_an,
                active
            FROM dm_nhom_mon_an
            WHERE UPPER(ma_nhom_mon_an)
                = UPPER($1)
            LIMIT 1
        `;

        const result =
            await pool.query(
                sql,
                [maNhomMonAn]
            );

        if (result.rows.length === 0) {
            return null;
        }

        return {

            id:
                result.rows[0].id,

            maNhomMonAn:
                result.rows[0]
                    .ma_nhom_mon_an,

            tenNhomMonAn:
                result.rows[0]
                    .ten_nhom_mon_an,

            active:
                result.rows[0].active

        };

    }

    async existsNhomMonAn(
        nhomMonAnId
    ) {

        const sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_nhom_mon_an
                WHERE id = $1
                AND active = TRUE
            ) AS "exists"
        `;

        const result =
            await pool.query(
                sql,
                [nhomMonAnId]
            );

        return result.rows[0].exists;

    }

    async existsMaMonAn(
        maMonAn,
        excludeId = null
    ) {

        const values = [
            maMonAn
        ];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_mon_an
                WHERE UPPER(TRIM(ma_mon_an))
                    = UPPER(TRIM($1))
        `;

        if (excludeId) {

            values.push(excludeId);

            sql += `
                AND id <> $2
            `;

        }

        sql += `
            ) AS "exists"
        `;

        const result =
            await pool.query(
                sql,
                values
            );

        return result.rows[0].exists;

    }

    async existsTenMonAn(
        tenMonAn,
        nhomMonAnId,
        excludeId = null
    ) {

        const values = [
            tenMonAn,
            nhomMonAnId
        ];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_mon_an
                WHERE LOWER(TRIM(ten_mon_an))
                    = LOWER(TRIM($1))
                AND nhom_mon_an_id = $2
        `;

        if (excludeId) {

            values.push(excludeId);

            sql += `
                AND id <> $3
            `;

        }

        sql += `
            ) AS "exists"
        `;

        const result =
            await pool.query(
                sql,
                values
            );

        return result.rows[0].exists;

    }

    async create(data) {

        const sql = `
            INSERT INTO dm_mon_an (
                ma_mon_an,
                ten_mon_an,
                nhom_mon_an_id,
                gia_tien,
                gia_du_kien,
                calories,
                mo_ta,
                hinh_anh,
                active,
                created_at,
                updated_at
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                NOW(),
                NOW()
            )
            RETURNING id
        `;

        const values = [

            data.maMonAn,

            data.tenMonAn,

            data.nhomMonAnId,

            data.giaTien !== undefined
                ? data.giaTien
                : null,

            data.giaDuKien !== undefined
                ? data.giaDuKien
                : 0,

            data.calories !== undefined
                ? data.calories
                : null,

            data.moTa || null,

            data.hinhAnh || null,

            data.active !== undefined
                ? data.active
                : true

        ];

        const result =
            await pool.query(
                sql,
                values
            );

        return await this.getChiTiet(
            result.rows[0].id
        );

    }

    async update(id, data) {

        const sql = `
            UPDATE dm_mon_an
            SET
                ma_mon_an = $1,
                ten_mon_an = $2,
                nhom_mon_an_id = $3,
                gia_tien = $4,
                gia_du_kien = $5,
                calories = $6,
                mo_ta = $7,
                hinh_anh = $8,
                active = $9,
                updated_at = NOW()
            WHERE id = $10
            RETURNING id
        `;

        const values = [

            data.maMonAn,

            data.tenMonAn,

            data.nhomMonAnId,

            data.giaTien !== undefined
                ? data.giaTien
                : null,

            data.giaDuKien !== undefined
                ? data.giaDuKien
                : 0,

            data.calories !== undefined
                ? data.calories
                : null,

            data.moTa || null,

            data.hinhAnh || null,

            data.active,

            id

        ];

        const result =
            await pool.query(
                sql,
                values
            );

        if (result.rows.length === 0) {
            return null;
        }

        return await this.getChiTiet(
            result.rows[0].id
        );

    }

}

module.exports =
    new MonAnRepository();