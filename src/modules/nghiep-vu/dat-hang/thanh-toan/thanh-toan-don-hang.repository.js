'use strict';

const pool = require('../../../../config/database');

class ThanhToanRepository {
    async create(data, client = pool) {
        const result = await client.query(
            `INSERT INTO nv_thanh_toan_don_hang (don_hang_id, loai_giao_dich, phuong_thuc, so_tien, ma_giao_dich, qr_payload, qr_het_han_luc, trang_thai, nguoi_khoi_tao_id)
                VALUES ($1,$2,$3,$4,$5,$6,$7::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh',$8,$9)
                RETURNING *, qr_het_han_luc AT TIME ZONE 'Asia/Ho_Chi_Minh' AS qr_het_han_luc`,
            [
                data.donHangId,
                data.loaiGiaoDich,
                data.phuongThuc,
                data.soTien,
                data.maGiaoDich,
                data.qrPayload || null,
                data.qrHetHanLuc || null,
                data.trangThai,
                data.nguoiKhoiTaoId
            ]
        );
        return result.rows[0];
    }

    async list(donHangId, client = pool) {
        const result = await client.query(
            `SELECT
                id,
                loai_giao_dich AS "loaiGiaoDich",
                phuong_thuc AS "phuongThuc",
                so_tien AS "soTien",
                ma_giao_dich AS "maGiaoDich",
                ma_tham_chieu AS "maThamChieu",
                ma_chuan_chi AS "maChuanChi",
                qr_payload AS "qrPayload",
                qr_het_han_luc AT TIME ZONE 'Asia/Ho_Chi_Minh' AS "qrHetHanLuc",
                trang_thai AS "trangThai",
                nguoi_thu_tien_tai_khoan_id AS "nguoiThuTienTaiKhoanId",
                thoi_gian_thanh_toan AT TIME ZONE 'Asia/Ho_Chi_Minh' AS "thoiGianThanhToan",
                created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' AS "createdAt"
                FROM nv_thanh_toan_don_hang
                WHERE don_hang_id = $1
                ORDER BY created_at DESC`,
            [donHangId]
        );
        return result.rows;
    }

    confirm(id, data, userId, client = pool) {
        return client.query(
            `UPDATE nv_thanh_toan_don_hang SET trang_thai = $2, ma_tham_chieu = $3, ma_chuan_chi = $4,
                nguoi_xac_nhan_id = $5, thoi_gian_thanh_toan = CLOCK_TIMESTAMP() AT TIME ZONE 'Asia/Ho_Chi_Minh', updated_at = NOW()
                WHERE id = $1 AND ma_giao_dich = $6 AND loai_giao_dich = 10 AND trang_thai IN (10,20)
                    AND (qr_het_han_luc IS NULL OR qr_het_han_luc AT TIME ZONE 'Asia/Ho_Chi_Minh' > CLOCK_TIMESTAMP())
                RETURNING don_hang_id`,
            [id, data.trangThai, data.maThamChieu || null, data.maChuanChi || null, userId, data.maGiaoDich]
        );
    }

    recordCollector(id, taiKhoanId, client) {
        return client.query(
            `UPDATE nv_thanh_toan_don_hang
            SET nguoi_thu_tien_tai_khoan_id = $2,
                updated_at = NOW()
            WHERE id = $1
            AND trang_thai = 30
            AND nguoi_thu_tien_tai_khoan_id IS NULL`,
            [id, taiKhoanId]
        );
    }
}

module.exports = new ThanhToanRepository();
