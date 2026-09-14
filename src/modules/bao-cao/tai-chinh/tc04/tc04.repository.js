'use strict';

const pool = require('../../../../config/database');

class Tc04Repository {
    async getDuLieu(filters) {
        const values = [
            filters.tuNgay,
            filters.denNgay
        ];

        const conditions = [
            `d."thoiGianApDung" >= $1::timestamptz`,
            `d."thoiGianApDung" <= $2::timestamptz`
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
            'd."chinhSachId"',
            filters.chinhSachIds
        );

        addArrayCondition(
            'd."voucherKey"',
            filters.voucherKeys,
            'text'
        );

        addArrayCondition(
            'd."nhanVienId"',
            filters.nhanVienIds
        );

        addArrayCondition(
            'd."phongBanId"',
            filters.phongBanIds
        );

        const sql = `
            WITH du_lieu AS (
                SELECT
                    'VA'::text AS "nguon",

                    'VA:' || mg.id::text AS "dongKey",
                    'VA:' || p.id::text AS "chungTuKey",

                    p.id AS "chungTuId",
                    p.so_phieu AS "soChungTu",

                    mg.created_at
                        AT TIME ZONE 'Asia/Ho_Chi_Minh'
                        AS "thoiGianApDung",

                    p.trang_thai AS "trangThaiChungTu",

                    td.co_so_id AS "coSoId",
                    td.nha_an_id AS "nhaAnId",

                    p.nhan_vien_id AS "nhanVienId",
                    nv.phong_ban_id AS "phongBanId",

                    mg.chinh_sach_id AS "chinhSachId",
                    cs.ma_chinh_sach AS "maChinhSach",
                    cs.ten_chinh_sach AS "tenChinhSach",

                    CASE
                        WHEN mg.voucher_id IS NOT NULL
                        THEN 'VA:' || mg.voucher_id::text
                        ELSE NULL
                    END AS "voucherKey",

                    mg.voucher_id::bigint AS "voucherId",
                    v.ma_voucher AS "maVoucher",
                    v.ten_voucher AS "tenVoucher",

                    mg.ma_mien_giam AS "maUuDai",
                    mg.ten_mien_giam AS "tenUuDai",

                    mg.loai_mien_giam AS "loaiUuDai",
                    mg.gia_tri AS "giaTriUuDai",

                    mg.so_tien_giam AS "soTienGiam",
                    mg.thu_tu_ap_dung AS "thuTuApDung",

                    mg.ly_do_mien_giam AS "ghiChu"

                FROM ct_phieu_lay_ve_mien_giam mg

                INNER JOIN nv_phieu_lay_ve_an p
                    ON p.id = mg.phieu_lay_ve_id

                INNER JOIN ct_thuc_don_ngay tdn
                    ON tdn.id = p.thuc_don_ngay_id

                INNER JOIN nv_thuc_don td
                    ON td.id = tdn.thuc_don_id

                LEFT JOIN dm_nhan_vien nv
                    ON nv.id = p.nhan_vien_id

                LEFT JOIN dm_chinh_sach cs
                    ON cs.id = mg.chinh_sach_id

                LEFT JOIN dm_voucher v
                    ON v.id = mg.voucher_id

                WHERE p.trang_thai NOT IN (50, 60)

                UNION ALL

                SELECT
                    'DH'::text AS "nguon",

                    'DH:' || dv.id::text AS "dongKey",
                    'DH:' || dh.id::text AS "chungTuKey",

                    dh.id AS "chungTuId",
                    dh.ma_don_hang AS "soChungTu",

                    dv.created_at
                        AT TIME ZONE 'Asia/Ho_Chi_Minh'
                        AS "thoiGianApDung",

                    dh.trang_thai AS "trangThaiChungTu",

                    dh.co_so_id AS "coSoId",

                    -- Đơn hàng chưa lưu nhà ăn.
                    NULL::integer AS "nhaAnId",

                    dh.nguoi_dat_id AS "nhanVienId",
                    dh.phong_ban_id AS "phongBanId",

                    NULL::bigint AS "chinhSachId",
                    NULL::text AS "maChinhSach",
                    NULL::text AS "tenChinhSach",

                    'DH:' || dv.voucher_don_hang_id::text
                        AS "voucherKey",

                    dv.voucher_don_hang_id AS "voucherId",

                    dv.ma_voucher_snapshot AS "maVoucher",
                    dv.ten_voucher_snapshot AS "tenVoucher",

                    dv.ma_voucher_snapshot AS "maUuDai",
                    dv.ten_voucher_snapshot AS "tenUuDai",

                    dv.loai_giam_snapshot AS "loaiUuDai",
                    dv.gia_tri_snapshot AS "giaTriUuDai",

                    dv.so_tien_giam AS "soTienGiam",
                    dv.thu_tu_ap_dung AS "thuTuApDung",

                    NULL::text AS "ghiChu"

                FROM ct_don_hang_voucher dv

                INNER JOIN nv_don_hang dh
                    ON dh.id = dv.don_hang_id

                -- Loại đơn nháp, bị hủy và bị từ chối.
                WHERE dh.trang_thai > 0
            )

            SELECT
                d.*,

                co.ma_co_so AS "maCoSo",
                co.ten_co_so AS "tenCoSo",

                na.ma_nha_an AS "maNhaAn",
                na.ten_nha_an AS "tenNhaAn",

                nv.ma_nhan_vien AS "maNhanVien",
                nv.ho_ten AS "tenNhanVien",

                pb.ma_phong_ban AS "maPhongBan",
                pb.ten_phong_ban AS "tenPhongBan"

            FROM du_lieu d

            LEFT JOIN dm_co_so co
                ON co.id = d."coSoId"

            LEFT JOIN dm_nha_an na
                ON na.id = d."nhaAnId"

            LEFT JOIN dm_nhan_vien nv
                ON nv.id = d."nhanVienId"

            LEFT JOIN dm_phong_ban pb
                ON pb.id = d."phongBanId"

            WHERE ${conditions.join('\nAND ')}

            ORDER BY
                d."thoiGianApDung" DESC,
                d."nguon",
                d."chungTuId",
                d."thuTuApDung",
                d."dongKey"
        `;

        const { rows } = await pool.query(sql, values);

        return rows.map(row => ({
            ...row,
            giaTriUuDai: Number(row.giaTriUuDai ?? 0),
            soTienGiam: Number(row.soTienGiam ?? 0),
            thuTuApDung: Number(row.thuTuApDung ?? 0)
        }));
    }
}

module.exports = new Tc04Repository();