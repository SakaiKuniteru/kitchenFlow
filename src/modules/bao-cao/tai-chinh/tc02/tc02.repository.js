'use strict';

const pool = require('../../../../config/database');

class Tc02Repository {
    getTimeExpression(loaiThoiGian) {
        switch (Number(loaiThoiGian)) {
            case 10:
                return 'tt.created_at';

            case 30:
            case 40:
                return 'tt.thoi_gian_thanh_toan';

            default:
                throw new Error('Loại thời gian TC02 không hợp lệ.');
        }
    }

    mapRow(row) {
        const result = { ...row };

        const numericFields = [
            'soPhieu',
            'tongSoGiaoDich',
            'soGiaoDichThu',
            'soGiaoDichHoan',
            'soGiaoDichChoXuLy',
            'soGiaoDichDangXuLy',
            'soGiaoDichThanhCong',
            'soGiaoDichThatBai',
            'soGiaoDichDaHuy',
            'tongThu',
            'tongHoan',
            'thucThu'
        ];

        for (const field of numericFields) {
            result[field] = Number(row[field] ?? 0);
        }

        return result;
    }

    async getDuLieu(filters) {
        const conditions = [];
        const values = [];

        const addArrayCondition = (
            expression,
            rawValues,
            type = 'bigint'
        ) => {
            if (!Array.isArray(rawValues) || rawValues.length === 0) {
                return;
            }

            values.push(rawValues.map(Number));

            conditions.push(
                `${expression} = ANY($${values.length}::${type}[])`
            );
        };

        const timeExpression = this.getTimeExpression(
            filters.loaiThoiGian
        );

        values.push(filters.tuNgay);
        conditions.push(
            `${timeExpression} >= $${values.length}::timestamptz`
        );

        values.push(filters.denNgay);
        conditions.push(
            `${timeExpression} <= $${values.length}::timestamptz`
        );

        if (Number(filters.loaiThoiGian) === 40) {
            conditions.push('tt.loai_giao_dich = 20');
        }

        addArrayCondition('td.co_so_id', filters.coSoIds);
        addArrayCondition('td.nha_an_id', filters.nhaAnIds);
        addArrayCondition('td.ca_an_id', filters.caAnIds);

        addArrayCondition('p.nguoi_tao_id', filters.nguoiTaoIds);

        // Cùng định nghĩa thu ngân với TC01.
        addArrayCondition(
            'p.nguoi_thanh_toan_id',
            filters.thuNganIds
        );

        addArrayCondition(
            'p.doi_tuong_lay_ve',
            filters.doiTuong,
            'integer'
        );

        addArrayCondition(
            'tt.phuong_thuc',
            filters.hinhThucThanhToan,
            'integer'
        );

        addArrayCondition(
            'tt.loai_giao_dich',
            filters.hienThiThuChi,
            'integer'
        );

        addArrayCondition(
            'tt.trang_thai',
            filters.trangThaiThanhToan,
            'integer'
        );

        if (
            Array.isArray(filters.trangThaiSuDung) &&
            filters.trangThaiSuDung.length > 0
        ) {
            values.push(filters.trangThaiSuDung.map(Number));

            conditions.push(`
                EXISTS (
                    SELECT 1
                    FROM ct_ve_an v
                    WHERE v.phieu_lay_ve_id = p.id
                      AND v.trang_thai =
                          ANY($${values.length}::integer[])
                )
            `);
        }

        const sql = `
            WITH du_lieu AS (
                SELECT
                    tt.id AS giao_dich_id,
                    p.id AS phieu_id,

                    td.co_so_id,
                    cs.ma_co_so,
                    cs.ten_co_so,

                    td.nha_an_id,
                    na.ma_nha_an,
                    na.ten_nha_an,

                    td.ca_an_id,
                    ca.ma_ca_an,
                    ca.ten_ca_an,

                    tt.phuong_thuc,
                    tt.loai_giao_dich,
                    tt.trang_thai,
                    tt.so_tien,

                    p.nguoi_thanh_toan_id AS thu_ngan_id,
                    tk.ten_dang_nhap AS tai_khoan_thu_ngan,
                    nv.ho_ten AS ten_thu_ngan

                FROM nv_thanh_toan_ve_an tt

                INNER JOIN nv_phieu_lay_ve_an p
                    ON p.id = tt.phieu_lay_ve_id

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

                LEFT JOIN dm_tai_khoan tk
                    ON tk.id = p.nguoi_thanh_toan_id

                LEFT JOIN dm_nhan_vien nv
                    ON nv.id = tk.nhan_vien_id

                WHERE ${conditions.join('\nAND ')}
            )

            SELECT
                co_so_id AS "coSoId",
                ma_co_so AS "maCoSo",
                ten_co_so AS "tenCoSo",

                nha_an_id AS "nhaAnId",
                ma_nha_an AS "maNhaAn",
                ten_nha_an AS "tenNhaAn",

                ca_an_id AS "caAnId",
                ma_ca_an AS "maCaAn",
                ten_ca_an AS "tenCaAn",

                phuong_thuc AS "phuongThucThanhToan",

                thu_ngan_id AS "taiKhoanThuNganId",
                tai_khoan_thu_ngan AS "taiKhoanThuNgan",
                ten_thu_ngan AS "tenThuNgan",

                COUNT(DISTINCT phieu_id) AS "soPhieu",
                COUNT(*) AS "tongSoGiaoDich",

                COUNT(*) FILTER (
                    WHERE loai_giao_dich = 10
                ) AS "soGiaoDichThu",

                COUNT(*) FILTER (
                    WHERE loai_giao_dich = 20
                ) AS "soGiaoDichHoan",

                COUNT(*) FILTER (
                    WHERE trang_thai = 10
                ) AS "soGiaoDichChoXuLy",

                COUNT(*) FILTER (
                    WHERE trang_thai = 20
                ) AS "soGiaoDichDangXuLy",

                COUNT(*) FILTER (
                    WHERE trang_thai = 30
                ) AS "soGiaoDichThanhCong",

                COUNT(*) FILTER (
                    WHERE trang_thai = 40
                ) AS "soGiaoDichThatBai",

                COUNT(*) FILTER (
                    WHERE trang_thai = 50
                ) AS "soGiaoDichDaHuy",

                COALESCE(
                    SUM(so_tien) FILTER (
                        WHERE loai_giao_dich = 10
                          AND trang_thai = 30
                    ),
                    0
                ) AS "tongThu",

                COALESCE(
                    SUM(so_tien) FILTER (
                        WHERE loai_giao_dich = 20
                          AND trang_thai = 30
                    ),
                    0
                ) AS "tongHoan",

                COALESCE(
                    SUM(
                        CASE
                            WHEN trang_thai = 30
                             AND loai_giao_dich = 10
                                THEN so_tien

                            WHEN trang_thai = 30
                             AND loai_giao_dich = 20
                                THEN -so_tien

                            ELSE 0
                        END
                    ),
                    0
                ) AS "thucThu"

            FROM du_lieu

            GROUP BY
                co_so_id,
                ma_co_so,
                ten_co_so,

                nha_an_id,
                ma_nha_an,
                ten_nha_an,

                ca_an_id,
                ma_ca_an,
                ten_ca_an,

                phuong_thuc,

                thu_ngan_id,
                tai_khoan_thu_ngan,
                ten_thu_ngan

            ORDER BY
                ma_co_so,
                ma_nha_an,
                ma_ca_an,
                phuong_thuc,
                tai_khoan_thu_ngan NULLS LAST
        `;

        const { rows } = await pool.query(sql, values);

        return rows.map(row => this.mapRow(row));
    }
}

module.exports = new Tc02Repository();