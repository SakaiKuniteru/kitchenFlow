'use strict';

const pool = require('../../../../config/database');

class Tc05Repository {
    async getDuLieu(filters) {
        const values = [
            filters.tuNgay,
            filters.denNgay
        ];

        const conditions = [
            `d."thoiGianThu" >= $1::timestamptz`,
            `d."thoiGianThu" <= $2::timestamptz`
        ];

        const addArrayCondition = (
            expression,
            items,
            type = 'bigint'
        ) => {
            if (!Array.isArray(items) || items.length === 0) {
                return;
            }

            values.push(items);

            conditions.push(
                `${expression} = ANY($${values.length}::${type}[])`
            );
        };

        addArrayCondition(
            'd."nguon"',
            filters.nguon,
            'text'
        );

        addArrayCondition(
            'd."coSoId"',
            filters.coSoIds
        );

        addArrayCondition(
            'd."nhaAnId"',
            filters.nhaAnIds
        );

        addArrayCondition(
            'd."nguoiThuId"',
            filters.nguoiThuIds
        );

        addArrayCondition(
            'd."phuongThucThanhToan"',
            filters.hinhThucThanhToan,
            'integer'
        );

        const sql = `
            WITH du_lieu AS (
                SELECT
                    'VA'::text AS "nguon",

                    p.id AS "chungTuId",

                    td.co_so_id AS "coSoId",
                    td.nha_an_id AS "nhaAnId",

                    p.nguoi_thanh_toan_id AS "nguoiThuId",

                    tt.phuong_thuc AS "phuongThucThanhToan",

                    tt.so_tien AS "soTien",

                    tt.thoi_gian_thanh_toan
                        AT TIME ZONE 'Asia/Ho_Chi_Minh'
                        AS "thoiGianThu"

                FROM nv_thanh_toan_ve_an tt

                INNER JOIN nv_phieu_lay_ve_an p
                    ON p.id = tt.phieu_lay_ve_id

                INNER JOIN ct_thuc_don_ngay tdn
                    ON tdn.id = p.thuc_don_ngay_id

                INNER JOIN nv_thuc_don td
                    ON td.id = tdn.thuc_don_id

                WHERE tt.loai_giao_dich = 10
                  AND tt.trang_thai = 30

                UNION ALL

                SELECT
                    'DH'::text AS "nguon",

                    dh.id AS "chungTuId",

                    dh.co_so_id AS "coSoId",

                    NULL::integer AS "nhaAnId",

                    tt.nguoi_thu_tien_tai_khoan_id
                        AS "nguoiThuId",

                    tt.phuong_thuc AS "phuongThucThanhToan",

                    tt.so_tien AS "soTien",

                    tt.thoi_gian_thanh_toan
                        AT TIME ZONE 'Asia/Ho_Chi_Minh'
                        AS "thoiGianThu"

                FROM nv_thanh_toan_don_hang tt

                INNER JOIN nv_don_hang dh
                    ON dh.id = tt.don_hang_id

                WHERE tt.loai_giao_dich = 10
                  AND tt.trang_thai = 30
            ),

            tong_hop AS (
                SELECT
                    d."nguon",
                    d."coSoId",
                    d."nhaAnId",
                    d."nguoiThuId",
                    d."phuongThucThanhToan",

                    COUNT(*) AS "soGiaoDichThu",

                    COUNT(DISTINCT d."chungTuId")
                        AS "soChungTuTrongNhom",

                    SUM(d."soTien") AS "tongTienThu",

                    MIN(d."thoiGianThu") AS "thoiGianThuDau",
                    MAX(d."thoiGianThu") AS "thoiGianThuCuoi"

                FROM du_lieu d

                WHERE ${conditions.join('\nAND ')}

                GROUP BY
                    d."nguon",
                    d."coSoId",
                    d."nhaAnId",
                    d."nguoiThuId",
                    d."phuongThucThanhToan"
            )

            SELECT
                t.*,

                cs.ma_co_so AS "maCoSo",
                cs.ten_co_so AS "tenCoSo",

                na.ma_nha_an AS "maNhaAn",
                na.ten_nha_an AS "tenNhaAn",

                tk.ten_dang_nhap AS "taiKhoanNguoiThu",

                nv.id AS "nhanVienNguoiThuId",
                nv.ma_nhan_vien AS "maNhanVienNguoiThu",
                nv.ho_ten AS "tenNguoiThu"

            FROM tong_hop t

            LEFT JOIN dm_co_so cs
                ON cs.id = t."coSoId"

            LEFT JOIN dm_nha_an na
                ON na.id = t."nhaAnId"

            LEFT JOIN dm_tai_khoan tk
                ON tk.id = t."nguoiThuId"

            LEFT JOIN dm_nhan_vien nv
                ON nv.id = tk.nhan_vien_id

            ORDER BY
                tk.ten_dang_nhap NULLS LAST,
                t."nguoiThuId" NULLS LAST,
                t."nguon",
                cs.ma_co_so,
                na.ma_nha_an,
                t."phuongThucThanhToan"
        `;

        const { rows } = await pool.query(sql, values);

        return rows.map(row => ({
            ...row,

            soGiaoDichThu:
                Number(row.soGiaoDichThu ?? 0),

            soChungTuTrongNhom:
                Number(row.soChungTuTrongNhom ?? 0),

            tongTienThu:
                Number(row.tongTienThu ?? 0)
        }));
    }
}

module.exports = new Tc05Repository();