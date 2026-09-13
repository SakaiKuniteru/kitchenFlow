'use strict';

const pool = require('../../../../config/database');

class Tc03Repository {
    mapRow(row) {
        const result = { ...row };

        const numericFields = [
            'soLuongPhieu',
            'tienGoc',
            'tongMienGiam',
            'thanhTien',
            'tongThuThanhCong',
            'tongHoanThanhCong',
            'daThuRong',
            'conPhaiThu',
            'soGiaoDichDangCho',
            'soNgayTuKhiTao'
        ];

        for (const field of numericFields) {
            result[field] = Number(row[field] ?? 0);
        }

        return result;
    }

    async getDuLieu(filters) {
        if (Number(filters.loaiThoiGian) !== 10) {
            throw new Error('TC03 chỉ lọc theo ngày tạo phiếu.');
        }

        const conditions = [
            'p.trang_thai IN (0, 10, 20, 30)',
            'p.thanh_tien > 0'
        ];

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

        values.push(filters.tuNgay);
        conditions.push(
            `p.created_at >= $${values.length}::timestamptz`
        );

        values.push(filters.denNgay);
        conditions.push(
            `p.created_at <= $${values.length}::timestamptz`
        );

        addArrayCondition('td.co_so_id', filters.coSoIds);
        addArrayCondition('td.nha_an_id', filters.nhaAnIds);
        addArrayCondition('td.ca_an_id', filters.caAnIds);

        addArrayCondition(
            'p.nguoi_tao_id',
            filters.nguoiTaoIds
        );

        addArrayCondition(
            'p.nhan_vien_id',
            filters.nhanVienIds
        );

        addArrayCondition(
            'p.doi_tuong_lay_ve',
            filters.doiTuong,
            'integer'
        );

        addArrayCondition(
            'p.phuong_thuc_thanh_toan',
            filters.hinhThucThanhToan,
            'integer'
        );

        addArrayCondition(
            'p.trang_thai',
            filters.trangThaiPhieuThu,
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
                    p.id AS "phieuLayVeId",
                    p.so_phieu AS "soPhieu",

                    p.created_at AS "thoiGianTaoPhieu",
                    p.updated_at AS "thoiGianCapNhatPhieu",

                    p.trang_thai AS "trangThaiPhieuThu",
                    p.doi_tuong_lay_ve AS "doiTuongLayVe",

                    p.nhan_vien_id AS "nhanVienLayVeId",
                    nv.ma_nhan_vien AS "maNhanVienLayVe",
                    nv.ho_ten AS "tenNhanVienLayVe",

                    p.ho_ten_nguoi_lay_ve AS "hoTenNguoiLayVe",
                    p.so_dien_thoai_nguoi_lay_ve
                        AS "soDienThoaiNguoiLayVe",
                    p.don_vi_nguoi_lay_ve AS "donViNguoiLayVe",

                    p.nguoi_tao_id AS "taiKhoanNguoiTaoId",
                    tk.ten_dang_nhap AS "taiKhoanNguoiTao",
                    nv_tao.ho_ten AS "tenNguoiTao",

                    td.co_so_id AS "coSoId",
                    cs.ma_co_so AS "maCoSo",
                    cs.ten_co_so AS "tenCoSo",

                    td.nha_an_id AS "nhaAnId",
                    na.ma_nha_an AS "maNhaAn",
                    na.ten_nha_an AS "tenNhaAn",

                    td.ca_an_id AS "caAnId",
                    ca.ma_ca_an AS "maCaAn",
                    ca.ten_ca_an AS "tenCaAn",

                    tdn.ngay AS "ngayThucDon",

                    p.phuong_thuc_thanh_toan
                        AS "phuongThucThanhToan",

                    p.so_luong AS "soLuongPhieu",
                    p.tien_goc AS "tienGoc",
                    p.tong_mien_giam AS "tongMienGiam",
                    p.thanh_tien AS "thanhTien",
                    p.ghi_chu AS "ghiChu",

                    COALESCE(tt.tong_thu, 0)
                        AS "tongThuThanhCong",

                    COALESCE(tt.tong_hoan, 0)
                        AS "tongHoanThanhCong",

                    COALESCE(tt.tong_thu, 0)
                        - COALESCE(tt.tong_hoan, 0)
                        AS "daThuRong",

                    GREATEST(
                        p.thanh_tien
                            - COALESCE(tt.tong_thu, 0)
                            + COALESCE(tt.tong_hoan, 0),
                        0
                    ) AS "conPhaiThu",

                    COALESCE(tt.so_giao_dich_dang_cho, 0)
                        AS "soGiaoDichDangCho",

                    GREATEST(
                        (
                            NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'
                        )::date - p.created_at::date,
                        0
                    ) AS "soNgayTuKhiTao",

                    NOW() AS "thoiDiemDuLieu"

                FROM nv_phieu_lay_ve_an p

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

                LEFT JOIN dm_nhan_vien nv
                    ON nv.id = p.nhan_vien_id

                LEFT JOIN dm_tai_khoan tk
                    ON tk.id = p.nguoi_tao_id

                LEFT JOIN dm_nhan_vien nv_tao
                    ON nv_tao.id = tk.nhan_vien_id

                LEFT JOIN LATERAL (
                    SELECT
                        COALESCE(
                            SUM(t.so_tien) FILTER (
                                WHERE t.loai_giao_dich = 10
                                  AND t.trang_thai = 30
                            ),
                            0
                        ) AS tong_thu,

                        COALESCE(
                            SUM(t.so_tien) FILTER (
                                WHERE t.loai_giao_dich = 20
                                  AND t.trang_thai = 30
                            ),
                            0
                        ) AS tong_hoan,

                        COUNT(*) FILTER (
                            WHERE t.trang_thai IN (10, 20)
                        ) AS so_giao_dich_dang_cho

                    FROM nv_thanh_toan_ve_an t

                    WHERE t.phieu_lay_ve_id = p.id
                ) tt ON TRUE

                WHERE ${conditions.join('\nAND ')}
            )

            SELECT *
            FROM du_lieu

            WHERE "conPhaiThu" > 0

            ORDER BY
                "thoiGianTaoPhieu" ASC,
                "phieuLayVeId" ASC
        `;

        const { rows } = await pool.query(sql, values);

        return rows.map(row => this.mapRow(row));
    }
}

module.exports = new Tc03Repository();