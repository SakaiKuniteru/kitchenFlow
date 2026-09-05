const pool =
    require(
        "../../../../config/database"
    );


class ThanhToanVeAnRepository {

    mapThanhToan(
        row
    ) {

        if (
            !row
        ) {

            return null;

        }


        return {

            id:
                row.id,

            phieuLayVeId:
                row.phieu_lay_ve_id,

            soPhieu:
                row.so_phieu,

            loaiGiaoDich:
                row.loai_giao_dich,

            phuongThuc:
                row.phuong_thuc,

            soTien:
                Number(
                    row.so_tien
                ),

            maGiaoDich:
                row.ma_giao_dich,

            maThamChieu:
                row.ma_tham_chieu,

            maChuanChi:
                row.ma_chuan_chi,

            trangThai:
                row.trang_thai,

            noiDungLoi:
                row.noi_dung_loi,

            nguoiKhoiTaoId:
                row.nguoi_khoi_tao_id,

            nguoiXacNhanId:
                row.nguoi_xac_nhan_id,

            thoiGianThanhToan:
                row.thoi_gian_thanh_toan,

            createdAt:
                row.created_at,

            updatedAt:
                row.updated_at

        };

    }


    getBaseQuery() {

        return `

            SELECT

                tt.id,

                tt.phieu_lay_ve_id,

                p.so_phieu,

                tt.loai_giao_dich,

                tt.phuong_thuc,

                tt.so_tien,

                tt.ma_giao_dich,

                tt.ma_tham_chieu,

                tt.ma_chuan_chi,

                tt.trang_thai,

                tt.noi_dung_loi,

                tt.nguoi_khoi_tao_id,

                tt.nguoi_xac_nhan_id,

                tt.thoi_gian_thanh_toan,

                tt.created_at,
                tt.updated_at

            FROM nv_thanh_toan_ve_an tt

            INNER JOIN nv_phieu_lay_ve_an p
                ON p.id =
                   tt.phieu_lay_ve_id

        `;

    }


    async getTongHop(
        query = {}
    ) {

        const conditions =
            [];

        const values =
            [];


        if (
            query.phieuLayVeId
        ) {

            values.push(
                Number(
                    query.phieuLayVeId
                )
            );

            conditions.push(
                `tt.phieu_lay_ve_id = $${values.length}`
            );

        }


        if (
            query.loaiGiaoDich
        ) {

            values.push(
                Number(
                    query.loaiGiaoDich
                )
            );

            conditions.push(
                `tt.loai_giao_dich = $${values.length}`
            );

        }


        if (
            query.phuongThuc
        ) {

            values.push(
                Number(
                    query.phuongThuc
                )
            );

            conditions.push(
                `tt.phuong_thuc = $${values.length}`
            );

        }


        if (
            query.trangThai
        ) {

            values.push(
                Number(
                    query.trangThai
                )
            );

            conditions.push(
                `tt.trang_thai = $${values.length}`
            );

        }


        let sql = `
            ${this.getBaseQuery()}
        `;


        if (
            conditions.length >
            0
        ) {

            sql += `
                WHERE
                    ${conditions.join(
                        "\nAND "
                    )}
            `;

        }


        sql += `

            ORDER BY
                tt.created_at DESC,
                tt.id DESC

        `;


        const result =
            await pool.query(
                sql,
                values
            );


        return result.rows.map(
            row =>
                this.mapThanhToan(
                    row
                )
        );

    }


    async getChiTiet(
        id,
        db = pool
    ) {

        const sql = `
            ${this.getBaseQuery()}

            WHERE tt.id = $1

            LIMIT 1
        `;


        const result =
            await db.query(
                sql,
                [
                    id
                ]
            );


        if (
            result.rows.length ===
            0
        ) {

            return null;

        }


        return this.mapThanhToan(
            result.rows[0]
        );

    }


    async getByMaGiaoDich(
        maGiaoDich,
        db = pool
    ) {

        const sql = `
            ${this.getBaseQuery()}

            WHERE tt.ma_giao_dich = $1

            LIMIT 1
        `;


        const result =
            await db.query(
                sql,
                [
                    maGiaoDich
                ]
            );


        if (
            result.rows.length ===
            0
        ) {

            return null;

        }


        return this.mapThanhToan(
            result.rows[0]
        );

    }


    async getPhieuById(
        id,
        db = pool
    ) {

        const sql = `

            SELECT

                id,
                so_phieu,

                thuc_don_ngay_id,

                so_luong,

                thanh_tien,

                phuong_thuc_thanh_toan,

                trang_thai,

                nguoi_tao_id,

                nguoi_thanh_toan_id,
                thoi_gian_thanh_toan

            FROM nv_phieu_lay_ve_an

            WHERE id = $1

            LIMIT 1

        `;


        const result =
            await db.query(
                sql,
                [
                    id
                ]
            );


        return result.rows[0] ||
            null;

    }


    async existsThanhToanThanhCong(
        phieuLayVeId,
        db = pool
    ) {

        const sql = `

            SELECT EXISTS (

                SELECT 1

                FROM nv_thanh_toan_ve_an

                WHERE
                    phieu_lay_ve_id = $1

                    AND loai_giao_dich = 10

                    AND trang_thai = 30

            ) AS "exists"

        `;


        const result =
            await db.query(
                sql,
                [
                    phieuLayVeId
                ]
            );


        return result.rows[0].exists;

    }


    async getTongDaHoan(
        phieuLayVeId,
        db = pool
    ) {

        const sql = `

            SELECT

                COALESCE(
                    SUM(
                        so_tien
                    ),
                    0
                ) AS tong_da_hoan

            FROM nv_thanh_toan_ve_an

            WHERE
                phieu_lay_ve_id = $1

                AND loai_giao_dich = 20

                AND trang_thai = 30

        `;


        const result =
            await db.query(
                sql,
                [
                    phieuLayVeId
                ]
            );


        return Number(
            result.rows[0]
                .tong_da_hoan
        );

    }


    async create(
        data,
        db = pool
    ) {

        const sql = `

            INSERT INTO nv_thanh_toan_ve_an (

                phieu_lay_ve_id,

                loai_giao_dich,

                phuong_thuc,

                so_tien,

                ma_giao_dich,

                ma_tham_chieu,

                ma_chuan_chi,

                trang_thai,

                noi_dung_loi,

                nguoi_khoi_tao_id,

                nguoi_xac_nhan_id,

                thoi_gian_thanh_toan,

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
                $10,
                $11,
                $12,

                NOW(),
                NOW()

            )

            RETURNING id

        `;


        const result =
            await db.query(
                sql,
                [

                    data.phieuLayVeId,

                    data.loaiGiaoDich,

                    data.phuongThuc,

                    data.soTien,

                    data.maGiaoDich,

                    data.maThamChieu,

                    data.maChuanChi,

                    data.trangThai,

                    data.noiDungLoi,

                    data.nguoiKhoiTaoId,

                    data.nguoiXacNhanId,

                    data.thoiGianThanhToan

                ]
            );


        return result.rows[0].id;

    }


    async updateTrangThai(
        id,
        data,
        db = pool
    ) {

        const sql = `

            UPDATE nv_thanh_toan_ve_an

            SET

                trang_thai = $2,

                ma_tham_chieu =
                    COALESCE(
                        $3,
                        ma_tham_chieu
                    ),

                ma_chuan_chi =
                    COALESCE(
                        $4,
                        ma_chuan_chi
                    ),

                noi_dung_loi = $5,

                nguoi_xac_nhan_id =
                    COALESCE(
                        $6,
                        nguoi_xac_nhan_id
                    ),

                thoi_gian_thanh_toan =
                    CASE
                        WHEN $2 = 30
                        THEN NOW()
                        ELSE thoi_gian_thanh_toan
                    END,

                updated_at = NOW()

            WHERE id = $1

            RETURNING id

        `;


        const result =
            await db.query(
                sql,
                [

                    id,

                    data.trangThai,

                    data.maThamChieu,

                    data.maChuanChi,

                    data.noiDungLoi,

                    data.nguoiXacNhanId

                ]
            );


        return result.rows[0] ||
            null;

    }


    async updatePhieuThanhToan(
        phieuLayVeId,
        phuongThuc,
        nguoiThanhToanId,
        db = pool
    ) {

        const sql = `

            UPDATE nv_phieu_lay_ve_an

            SET

                phuong_thuc_thanh_toan = $2,

                trang_thai = 40,

                nguoi_thanh_toan_id = $3,

                thoi_gian_thanh_toan = NOW(),

                updated_at = NOW()

            WHERE id = $1

        `;


        await db.query(
            sql,
            [
                phieuLayVeId,
                phuongThuc,
                nguoiThanhToanId
            ]
        );

    }


    async updateTrangThaiPhieu(
        phieuLayVeId,
        trangThai,
        db = pool
    ) {

        const sql = `

            UPDATE nv_phieu_lay_ve_an

            SET

                trang_thai = $2,

                updated_at = NOW()

            WHERE id = $1

        `;


        await db.query(
            sql,
            [
                phieuLayVeId,
                trangThai
            ]
        );

    }


    async tangVoucherDaSuDung(
        phieuLayVeId,
        db = pool
    ) {

        const sql = `

            UPDATE dm_voucher v

            SET

                da_su_dung =
                    v.da_su_dung + 1,

                updated_at = NOW()

            FROM (

                SELECT DISTINCT
                    voucher_id

                FROM ct_phieu_lay_ve_mien_giam

                WHERE
                    phieu_lay_ve_id = $1

                    AND voucher_id IS NOT NULL

            ) mg

            WHERE
                v.id =
                mg.voucher_id

        `;


        await db.query(
            sql,
            [
                phieuLayVeId
            ]
        );

    }


    async giamVoucherDaSuDung(
        phieuLayVeId,
        db = pool
    ) {

        const sql = `

            UPDATE dm_voucher v

            SET

                da_su_dung =
                    GREATEST(
                        v.da_su_dung - 1,
                        0
                    ),

                updated_at = NOW()

            FROM (

                SELECT DISTINCT
                    voucher_id

                FROM ct_phieu_lay_ve_mien_giam

                WHERE
                    phieu_lay_ve_id = $1

                    AND voucher_id IS NOT NULL

            ) mg

            WHERE
                v.id =
                mg.voucher_id

        `;


        await db.query(
            sql,
            [
                phieuLayVeId
            ]
        );

    }


    async existsVeTheoPhieu(
        phieuLayVeId,
        db = pool
    ) {

        const sql = `

            SELECT EXISTS (

                SELECT 1

                FROM ct_ve_an

                WHERE
                    phieu_lay_ve_id = $1

            ) AS "exists"

        `;


        const result =
            await db.query(
                sql,
                [
                    phieuLayVeId
                ]
            );


        return result.rows[0].exists;

    }


    async createVe(
        data,
        db = pool
    ) {

        const sql = `

            INSERT INTO ct_ve_an (

                phieu_lay_ve_id,

                thuc_don_ngay_id,

                so_thu_tu,

                ma_ve,

                qr_token,

                trang_thai,

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

                NOW(),
                NOW()

            )

            RETURNING id

        `;


        const result =
            await db.query(
                sql,
                [

                    data.phieuLayVeId,

                    data.thucDonNgayId,

                    data.soThuTu,

                    data.maVe,

                    data.qrToken,

                    data.trangThai

                ]
            );


        return result.rows[0].id;

    }


    async huyVeTheoPhieu(
        phieuLayVeId,
        nguoiHuyId,
        lyDoHuy,
        db = pool
    ) {

        const sql = `

            UPDATE ct_ve_an

            SET

                trang_thai = 30,

                nguoi_huy_id = $2,

                thoi_gian_huy = NOW(),

                ly_do_huy = $3,

                updated_at = NOW()

            WHERE

                phieu_lay_ve_id = $1

                AND trang_thai = 10

        `;


        await db.query(
            sql,
            [
                phieuLayVeId,
                nguoiHuyId,
                lyDoHuy
            ]
        );

    }

}


module.exports =
    new ThanhToanVeAnRepository();