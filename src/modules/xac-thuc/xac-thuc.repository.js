const pool = require("../../config/database");

class XacThucRepository {

    async findByUsername(username) {

        const sql = `
            SELECT
                tk.id,
                tk.nhan_vien_id,
                tk.ten_dang_nhap,
                tk.mat_khau_hash,
                tk.active,
                tk.doi_mat_khau_lan_dau,
                tk.so_lan_dang_nhap_sai,
                tk.khoa_den,
                tk.lan_dang_nhap_cuoi,

                nv.ma_nhan_vien,
                nv.ho_ten,

                ARRAY_REMOVE(
                    ARRAY_AGG(DISTINCT vt.ma_vai_tro),
                    NULL
                ) AS vai_tros

            FROM dm_tai_khoan tk

            INNER JOIN dm_nhan_vien nv
                ON nv.id = tk.nhan_vien_id

            LEFT JOIN dm_nhan_vien_vai_tro nvt
                ON nvt.nhan_vien_id = nv.id
                AND nvt.active = TRUE

            LEFT JOIN dm_vai_tro vt
                ON vt.id = nvt.vai_tro_id
                AND vt.active = TRUE

            WHERE tk.ten_dang_nhap = $1

            GROUP BY
                tk.id,
                nv.id
        `;

        const result = await pool.query(
            sql,
            [username]
        );

        if (result.rows.length === 0) {

            return null;

        }

        return result.rows[0];

    }

    async increaseFailedLogin(taiKhoanId) {

        const sql = `
            UPDATE dm_tai_khoan

            SET
                so_lan_dang_nhap_sai = so_lan_dang_nhap_sai + 1,
                updated_at = NOW()

            WHERE id = $1
        `;

        await pool.query(
            sql,
            [taiKhoanId]
        );

    }

    async getFailedLoginCount(taiKhoanId) {

        const sql = `
            SELECT
                so_lan_dang_nhap_sai

            FROM dm_tai_khoan

            WHERE id = $1
        `;

        const result = await pool.query(
            sql,
            [taiKhoanId]
        );

        if (result.rows.length === 0) {

            return 0;

        }

        return result.rows[0].so_lan_dang_nhap_sai;

    }

    async resetFailedLogin(taiKhoanId) {

        const sql = `
            UPDATE dm_tai_khoan

            SET
                so_lan_dang_nhap_sai = 0,
                khoa_den = NULL,
                updated_at = NOW()

            WHERE id = $1
        `;

        await pool.query(
            sql,
            [taiKhoanId]
        );

    }

    async lockAccount(taiKhoanId, lockUntil) {

        const sql = `
            UPDATE dm_tai_khoan

            SET
                khoa_den = $1,
                updated_at = NOW()

            WHERE id = $2
        `;

        await pool.query(
            sql,
            [
                lockUntil,
                taiKhoanId
            ]
        );

    }

    async updateLastLogin(taiKhoanId) {

        const sql = `
            UPDATE dm_tai_khoan

            SET
                lan_dang_nhap_cuoi = NOW(),
                updated_at = NOW()

            WHERE id = $1
        `;

        await pool.query(
            sql,
            [taiKhoanId]
        );

    }

    async saveRefreshToken(
        taiKhoanId,
        refreshToken,
        expiresAt
    ) {

        const sql = `
            INSERT INTO nv_refresh_token
            (
                tai_khoan_id,
                token,
                expires_at,
                revoked
            )

            VALUES

            (
                $1,
                $2,
                $3,
                FALSE
            )
        `;

        await pool.query(
            sql,
            [
                taiKhoanId,
                refreshToken,
                expiresAt
            ]
        );

    }

    async findRefreshToken(refreshToken) {

        const sql = `
            SELECT *

            FROM nv_refresh_token

            WHERE
                token = $1
                AND revoked = FALSE
        `;

        const result = await pool.query(
            sql,
            [refreshToken]
        );

        return result.rows[0];

    }

    async deleteRefreshToken(refreshToken) {

        const sql = `
            UPDATE nv_refresh_token

            SET
                revoked = TRUE,
                updated_at = NOW()

            WHERE token = $1
        `;

        await pool.query(
            sql,
            [refreshToken]
        );

    }

    async changePassword(
        taiKhoanId,
        passwordHash
    ) {

        const sql = `
            UPDATE dm_tai_khoan

            SET
                mat_khau_hash = $1,
                doi_mat_khau_lan_dau = FALSE,
                updated_at = NOW()

            WHERE id = $2
        `;

        await pool.query(
            sql,
            [
                passwordHash,
                taiKhoanId
            ]
        );

    }

    async updatePasswordChangedAt(taiKhoanId) {

        const sql = `
            UPDATE dm_tai_khoan

            SET
                doi_mat_khau_lan_cuoi = NOW(),
                updated_at = NOW()

            WHERE id = $1
        `;

        await pool.query(
            sql,
            [taiKhoanId]
        );

    }

    async revokeRefreshToken(token) {

        const sql = `
            UPDATE nv_refresh_token

            SET
                revoked = TRUE,
                updated_at = NOW()

            WHERE token = $1
        `;

        await pool.query(
            sql,
            [token]
        );

    }

    async revokeAllRefreshToken(taiKhoanId) {

        const sql = `
            UPDATE nv_refresh_token

            SET
                revoked = TRUE,
                updated_at = NOW()

            WHERE
                tai_khoan_id = $1
                AND revoked = FALSE
        `;

        await pool.query(
            sql,
            [taiKhoanId]
        );

    }

    async findById(taiKhoanId) {

        const sql = `
            SELECT
                tk.id,
                tk.nhan_vien_id,
                tk.ten_dang_nhap,
                tk.active,
                tk.doi_mat_khau_lan_dau,

                nv.ma_nhan_vien,
                nv.ho_ten,

                ARRAY_REMOVE(
                    ARRAY_AGG(DISTINCT vt.ma_vai_tro),
                    NULL
                ) AS vai_tros

            FROM dm_tai_khoan tk

            INNER JOIN dm_nhan_vien nv
                ON nv.id = tk.nhan_vien_id

            LEFT JOIN dm_nhan_vien_vai_tro nvt
                ON nvt.nhan_vien_id = nv.id
                AND nvt.active = TRUE

            LEFT JOIN dm_vai_tro vt
                ON vt.id = nvt.vai_tro_id
                AND vt.active = TRUE

            WHERE tk.id = $1

            GROUP BY
                tk.id,
                nv.id
        `;

        const result = await pool.query(
            sql,
            [taiKhoanId]
        );

        return result.rows[0];

    }

    async getPasswordHash(taiKhoanId) {

        const sql = `
            SELECT
                mat_khau_hash

            FROM dm_tai_khoan

            WHERE id = $1
        `;

        const result = await pool.query(
            sql,
            [taiKhoanId]
        );

        return result.rows[0];

    }

}

module.exports = new XacThucRepository();