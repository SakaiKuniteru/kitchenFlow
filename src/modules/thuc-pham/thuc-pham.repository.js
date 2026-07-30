const pool =
    require("../../config/database");

class ThucPhamRepository {

    mapThucPham(row) {

        if (!row) {
            return null;
        }

        const heSoQuyDoi =
            row.he_so_quy_doi !== null
                ? Number(row.he_so_quy_doi)
                : null;

        const quyCach =
            row.don_vi_so_cap_id &&
            row.don_vi_su_dung_id &&
            heSoQuyDoi !== null
                ? (
                    `1 ${row.ten_don_vi_so_cap}` +
                    ` = ${heSoQuyDoi} ` +
                    `${row.ten_don_vi_su_dung}`
                )
                : null;

        return {

            id:
                row.id,

            maThucPham:
                row.ma_thuc_pham,

            tenThucPham:
                row.ten_thuc_pham,

            donViSoCapId:
                row.don_vi_so_cap_id,

            donViSoCap:
                row.don_vi_so_cap_id
                    ? {
                        id:
                            row.don_vi_so_cap_id,

                        ma:
                            row.ma_don_vi_so_cap,

                        ten:
                            row.ten_don_vi_so_cap,

                        kyHieu:
                            row.ky_hieu_don_vi_so_cap,

                        loaiDonVi:
                            row.loai_don_vi_so_cap
                    }
                    : null,

            donViSuDungId:
                row.don_vi_su_dung_id,

            donViSuDung:
                row.don_vi_su_dung_id
                    ? {
                        id:
                            row.don_vi_su_dung_id,

                        ma:
                            row.ma_don_vi_su_dung,

                        ten:
                            row.ten_don_vi_su_dung,

                        kyHieu:
                            row.ky_hieu_don_vi_su_dung,

                        loaiDonVi:
                            row.loai_don_vi_su_dung
                    }
                    : null,

            heSoQuyDoi,

            quyCach,

            giaNhap:
                row.gia_nhap !== null
                    ? Number(row.gia_nhap)
                    : null,

            tyLeHaoHutDuKien:
                row.ty_le_hao_hut_du_kien !== null
                    ? Number(
                        row.ty_le_hao_hut_du_kien
                    )
                    : 0,

            ghiChu:
                row.ghi_chu,

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

                tp.id,
                tp.ma_thuc_pham,
                tp.ten_thuc_pham,

                tp.don_vi_so_cap_id,
                tp.don_vi_su_dung_id,
                tp.he_so_quy_doi,

                tp.gia_nhap,
                tp.ty_le_hao_hut_du_kien,
                tp.ghi_chu,

                tp.active,
                tp.created_at,
                tp.updated_at,

                dvsc.ma_don_vi_tinh
                    AS ma_don_vi_so_cap,

                dvsc.ten_don_vi_tinh
                    AS ten_don_vi_so_cap,

                dvsc.ky_hieu
                    AS ky_hieu_don_vi_so_cap,

                dvsc.loai_don_vi
                    AS loai_don_vi_so_cap,

                dvsd.ma_don_vi_tinh
                    AS ma_don_vi_su_dung,

                dvsd.ten_don_vi_tinh
                    AS ten_don_vi_su_dung,

                dvsd.ky_hieu
                    AS ky_hieu_don_vi_su_dung,

                dvsd.loai_don_vi
                    AS loai_don_vi_su_dung

            FROM dm_thuc_pham tp

            LEFT JOIN dm_don_vi_tinh dvsc
                ON dvsc.id =
                    tp.don_vi_so_cap_id

            LEFT JOIN dm_don_vi_tinh dvsd
                ON dvsd.id =
                    tp.don_vi_su_dung_id

        `;

    }

    async getTongHop() {

        const sql = `
            ${this.getBaseQuery()}

            ORDER BY
                tp.ma_thuc_pham ASC
        `;

        const result =
            await pool.query(sql);

        return result.rows.map(
            row => this.mapThucPham(row)
        );

    }

    async getChiTiet(id) {

        const sql = `
            ${this.getBaseQuery()}

            WHERE tp.id = $1

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

        return this.mapThucPham(
            result.rows[0]
        );

    }

    async getDonViTinh(id) {

        const sql = `
            SELECT

                id,
                ma_don_vi_tinh,
                ten_don_vi_tinh,
                ky_hieu,
                loai_don_vi,
                active

            FROM dm_don_vi_tinh

            WHERE id = $1

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

        const row =
            result.rows[0];

        return {

            id:
                row.id,

            maDonViTinh:
                row.ma_don_vi_tinh,

            tenDonViTinh:
                row.ten_don_vi_tinh,

            kyHieu:
                row.ky_hieu,

            loaiDonVi:
                row.loai_don_vi,

            active:
                row.active

        };

    }

    async getDonViTinhByMa(
        maDonViTinh
    ) {

        const sql = `
            SELECT

                id,
                ma_don_vi_tinh,
                ten_don_vi_tinh,
                ky_hieu,
                loai_don_vi,
                active

            FROM dm_don_vi_tinh

            WHERE UPPER(TRIM(ma_don_vi_tinh))
                = UPPER(TRIM($1))

            LIMIT 1
        `;

        const result =
            await pool.query(
                sql,
                [maDonViTinh]
            );

        if (result.rows.length === 0) {
            return null;
        }

        const row =
            result.rows[0];

        return {

            id:
                row.id,

            maDonViTinh:
                row.ma_don_vi_tinh,

            tenDonViTinh:
                row.ten_don_vi_tinh,

            kyHieu:
                row.ky_hieu,

            loaiDonVi:
                row.loai_don_vi,

            active:
                row.active

        };

    }

    async existsMaThucPham(
        maThucPham,
        excludeId = null
    ) {

        const values = [
            maThucPham
        ];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_thuc_pham
                WHERE UPPER(
                    TRIM(ma_thuc_pham)
                ) = UPPER(TRIM($1))
        `;

        if (excludeId) {

            values.push(
                excludeId
            );

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

    async existsTenThucPham(
        tenThucPham,
        excludeId = null
    ) {

        const values = [
            tenThucPham
        ];

        let sql = `
            SELECT EXISTS (
                SELECT 1
                FROM dm_thuc_pham
                WHERE LOWER(
                    TRIM(ten_thuc_pham)
                ) = LOWER(TRIM($1))
        `;

        if (excludeId) {

            values.push(
                excludeId
            );

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

    async create(data) {

        const sql = `
            INSERT INTO dm_thuc_pham (

                ma_thuc_pham,
                ten_thuc_pham,

                don_vi_so_cap_id,
                don_vi_su_dung_id,
                he_so_quy_doi,

                gia_nhap,
                ty_le_hao_hut_du_kien,
                ghi_chu,

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

            data.maThucPham,

            data.tenThucPham,

            data.donViSoCapId,

            data.donViSuDungId,

            data.heSoQuyDoi !== undefined
                ? data.heSoQuyDoi
                : 1,

            data.giaNhap !== undefined
                ? data.giaNhap
                : null,

            data.tyLeHaoHutDuKien !==
                undefined
                ? data.tyLeHaoHutDuKien
                : 0,

            data.ghiChu || null,

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
            UPDATE dm_thuc_pham
            SET

                ma_thuc_pham = $1,
                ten_thuc_pham = $2,

                don_vi_so_cap_id = $3,
                don_vi_su_dung_id = $4,
                he_so_quy_doi = $5,

                gia_nhap = $6,
                ty_le_hao_hut_du_kien = $7,
                ghi_chu = $8,

                active = $9,
                updated_at = NOW()

            WHERE id = $10

            RETURNING id
        `;

        const values = [

            data.maThucPham,

            data.tenThucPham,

            data.donViSoCapId,

            data.donViSuDungId,

            data.heSoQuyDoi,

            data.giaNhap,

            data.tyLeHaoHutDuKien,

            data.ghiChu || null,

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
    new ThucPhamRepository();