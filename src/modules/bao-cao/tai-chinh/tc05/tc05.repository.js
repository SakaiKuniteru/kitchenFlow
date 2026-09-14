'use strict';

const pool = require('../../../../config/database');


class Tc05Repository {

    async getDuLieu(
        filters
    ) {

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

            if (
                !Array.isArray(
                    items
                ) ||
                items.length ===
                    0
            ) {

                return;

            }


            values.push(
                items
            );


            conditions.push(
                `${expression} = ANY($${values.length}::${type}[])`
            );
        };


        /*
         * ==========================================
         * NGUỒN
         * ==========================================
         */

        addArrayCondition(
            'd."nguon"',
            filters.nguon,
            'text'
        );


        /*
         * ==========================================
         * CƠ SỞ
         * ==========================================
         */

        addArrayCondition(
            'd."coSoId"',
            filters.coSoIds
        );


        /*
         * ==========================================
         * NHÀ ĂN
         * ==========================================
         */

        addArrayCondition(
            'd."nhaAnId"',
            filters.nhaAnIds
        );


        /*
         * ==========================================
         * NGƯỜI THU
         *
         * ID dm_tai_khoan.
         * ==========================================
         */

        addArrayCondition(
            'd."nguoiThuId"',
            filters.nguoiThuIds
        );


        /*
         * ==========================================
         * PHƯƠNG THỨC THANH TOÁN
         *
         * Đây là mã ĐÃ CHUẨN HÓA của TC05:
         *
         * 10 = Tiền mặt
         * 20 = Chuyển khoản
         * 30 = QR Code
         * 40 = Thanh toán nội bộ
         * ==========================================
         */

        addArrayCondition(
            'd."phuongThucThanhToan"',
            filters.hinhThucThanhToan,
            'integer'
        );


        const sql = `
            WITH du_lieu AS (

                /*
                 * =====================================
                 * VÉ ĂN
                 * =====================================
                 */

                SELECT
                    'VA'::text
                        AS "nguon",

                    p.id
                        AS "chungTuId",

                    td.co_so_id
                        AS "coSoId",

                    td.nha_an_id
                        AS "nhaAnId",


                    /*
                     * Khi hoàn tất thanh toán vé ăn,
                     * hệ thống lưu tài khoản xác nhận
                     * vào nguoi_thanh_toan_id.
                     */
                    p.nguoi_thanh_toan_id
                        AS "nguoiThuId",


                    /*
                     * Vé ăn:
                     *
                     * 10 = Tiền mặt
                     * 20 = Chuyển khoản
                     * 30 = QR
                     *
                     * Trùng luôn mã chuẩn TC05.
                     */
                    CASE
                        WHEN tt.phuong_thuc = 10
                            THEN 10

                        WHEN tt.phuong_thuc = 20
                            THEN 20

                        WHEN tt.phuong_thuc = 30
                            THEN 30

                        ELSE NULL
                    END::integer
                        AS "phuongThucThanhToan",


                    tt.so_tien
                        AS "soTien",


                    tt.thoi_gian_thanh_toan
                        AT TIME ZONE
                        'Asia/Ho_Chi_Minh'
                        AS "thoiGianThu"


                FROM nv_thanh_toan_ve_an tt


                INNER JOIN nv_phieu_lay_ve_an p
                    ON p.id =
                        tt.phieu_lay_ve_id


                INNER JOIN ct_thuc_don_ngay tdn
                    ON tdn.id =
                        p.thuc_don_ngay_id


                INNER JOIN nv_thuc_don td
                    ON td.id =
                        tdn.thuc_don_id


                /*
                 * Chỉ lấy:
                 *
                 * - giao dịch thu
                 * - thành công
                 */
                WHERE
                    tt.loai_giao_dich = 10

                    AND tt.trang_thai = 30


                UNION ALL


                /*
                 * =====================================
                 * ĐƠN HÀNG
                 * =====================================
                 */

                SELECT
                    'DH'::text
                        AS "nguon",

                    dh.id
                        AS "chungTuId",

                    dh.co_so_id
                        AS "coSoId",


                    /*
                     * Đơn hàng hiện chưa lưu nhà ăn.
                     */
                    NULL::integer
                        AS "nhaAnId",


                    tt.nguoi_thu_tien_tai_khoan_id
                        AS "nguoiThuId",


                    /*
                     * Đơn hàng:
                     *
                     * raw 10 = Nội bộ
                     * raw 20 = Tiền mặt
                     * raw 30 = Chuyển khoản
                     * raw 40 = QR
                     *
                     * Chuyển về mã chung TC05:
                     *
                     * 10 = Tiền mặt
                     * 20 = Chuyển khoản
                     * 30 = QR
                     * 40 = Nội bộ
                     */
                    CASE
                        WHEN tt.phuong_thuc = 10
                            THEN 40

                        WHEN tt.phuong_thuc = 20
                            THEN 10

                        WHEN tt.phuong_thuc = 30
                            THEN 20

                        WHEN tt.phuong_thuc = 40
                            THEN 30

                        ELSE NULL
                    END::integer
                        AS "phuongThucThanhToan",


                    tt.so_tien
                        AS "soTien",


                    tt.thoi_gian_thanh_toan
                        AT TIME ZONE
                        'Asia/Ho_Chi_Minh'
                        AS "thoiGianThu"


                FROM nv_thanh_toan_don_hang tt


                INNER JOIN nv_don_hang dh
                    ON dh.id =
                        tt.don_hang_id


                WHERE
                    tt.loai_giao_dich = 10

                    AND tt.trang_thai = 30

            ),


            /*
             * =========================================
             * TỔNG HỢP
             * =========================================
             */

            tong_hop AS (

                SELECT
                    d."nguon",

                    d."coSoId",

                    d."nhaAnId",

                    d."nguoiThuId",

                    d."phuongThucThanhToan",


                    COUNT(*)
                        AS "soGiaoDichThu",


                    COUNT(
                        DISTINCT
                        d."chungTuId"
                    )
                        AS "soChungTuTrongNhom",


                    COALESCE(
                        SUM(
                            d."soTien"
                        ),
                        0
                    )
                        AS "tongTienThu",


                    MIN(
                        d."thoiGianThu"
                    )
                        AS "thoiGianThuDau",


                    MAX(
                        d."thoiGianThu"
                    )
                        AS "thoiGianThuCuoi"


                FROM du_lieu d


                WHERE
                    ${conditions.join(
                        '\nAND '
                    )}


                GROUP BY
                    d."nguon",

                    d."coSoId",

                    d."nhaAnId",

                    d."nguoiThuId",

                    d."phuongThucThanhToan"

            )


            SELECT
                t.*,

                cs.ma_co_so
                    AS "maCoSo",

                cs.ten_co_so
                    AS "tenCoSo",


                na.ma_nha_an
                    AS "maNhaAn",

                na.ten_nha_an
                    AS "tenNhaAn",


                tk.ten_dang_nhap
                    AS "taiKhoanNguoiThu",


                nv.id
                    AS "nhanVienNguoiThuId",

                nv.ma_nhan_vien
                    AS "maNhanVienNguoiThu",

                nv.ho_ten
                    AS "tenNguoiThu"


            FROM tong_hop t


            LEFT JOIN dm_co_so cs
                ON cs.id =
                    t."coSoId"


            LEFT JOIN dm_nha_an na
                ON na.id =
                    t."nhaAnId"


            LEFT JOIN dm_tai_khoan tk
                ON tk.id =
                    t."nguoiThuId"


            LEFT JOIN dm_nhan_vien nv
                ON nv.id =
                    tk.nhan_vien_id


            ORDER BY
                tk.ten_dang_nhap
                    NULLS LAST,

                t."nguoiThuId"
                    NULLS LAST,

                t."nguon",

                cs.ma_co_so,

                na.ma_nha_an,

                t."phuongThucThanhToan"
        `;


        const {
            rows
        } =
            await pool.query(
                sql,
                values
            );


        return rows.map(
            row => ({

                ...row,


                soGiaoDichThu:
                    Number(
                        row.soGiaoDichThu ??
                        0
                    ),


                soChungTuTrongNhom:
                    Number(
                        row.soChungTuTrongNhom ??
                        0
                    ),


                tongTienThu:
                    Number(
                        row.tongTienThu ??
                        0
                    )

            })
        );
    }
}


module.exports =
    new Tc05Repository();