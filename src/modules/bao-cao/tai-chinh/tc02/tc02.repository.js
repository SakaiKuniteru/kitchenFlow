'use strict';

const pool = require(
    '../../../../config/database'
);


class Tc02Repository {

    mapRow(
        row
    ) {

        const result = {
            ...row
        };


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


        for (
            const field
            of numericFields
        ) {

            result[field] =
                Number(
                    row[field] ??
                    0
                );

        }


        return result;
    }


    async getDuLieu(
        filters
    ) {

        const conditions =
            [];

        const values =
            [];


        const addArrayCondition =
            (
                expression,
                rawValues,
                type = 'integer'
            ) => {

                if (
                    !Array.isArray(
                        rawValues
                    ) ||
                    rawValues.length ===
                        0
                ) {
                    return;
                }


                values.push(
                    rawValues.map(
                        Number
                    )
                );


                conditions.push(
                    `${expression} = ANY($${values.length}::${type}[])`
                );
            };


        /*
         * ==========================================
         * KHOẢNG NGÀY THANH TOÁN
         * ==========================================
         */

        values.push(
            filters.tuNgay
        );


        conditions.push(
            `thoi_gian_thanh_toan >= $${values.length}::timestamptz`
        );


        values.push(
            filters.denNgay
        );


        conditions.push(
            `thoi_gian_thanh_toan <= $${values.length}::timestamptz`
        );


        /*
         * ==========================================
         * FILTER
         * ==========================================
         */

        addArrayCondition(
            'co_so_id',
            filters.coSoIds
        );


        addArrayCondition(
            'nha_an_id',
            filters.nhaAnIds
        );


        addArrayCondition(
            'nguon_thanh_toan',
            filters.nguonThanhToan
        );


        addArrayCondition(
            'phuong_thuc',
            filters.hinhThucThanhToan
        );


        addArrayCondition(
            'trang_thai',
            filters.trangThaiThanhToan
        );


        addArrayCondition(
            'thu_ngan_id',
            filters.thuNganIds
        );


        const sql = `

            WITH du_lieu AS (

                /*
                 * ======================================
                 * NGUỒN 10 = VÉ ĂN
                 * ======================================
                 */

                SELECT

                    10::integer
                        AS nguon_thanh_toan,

                    tt.id
                        AS giao_dich_id,

                    p.id
                        AS tham_chieu_id,

                    tt.thoi_gian_thanh_toan,


                    td.co_so_id,

                    cs.ma_co_so,

                    cs.ten_co_so,


                    td.nha_an_id,

                    na.ma_nha_an,

                    na.ten_nha_an,


                    /*
                     * Vé ăn:
                     *
                     * 10 = Tiền mặt
                     * 20 = Chuyển khoản
                     * 30 = QR
                     *
                     * Đây cũng là chuẩn TC02.
                     */
                    CASE
                        WHEN tt.phuong_thuc = 10
                            THEN 10

                        WHEN tt.phuong_thuc = 20
                            THEN 20

                        WHEN tt.phuong_thuc = 30
                            THEN 30

                        ELSE NULL
                    END
                        AS phuong_thuc,


                    tt.loai_giao_dich,

                    tt.trang_thai,

                    tt.so_tien,


                    p.nguoi_thanh_toan_id
                        AS thu_ngan_id,

                    tk.ten_dang_nhap
                        AS tai_khoan_thu_ngan,

                    nv.ho_ten
                        AS ten_thu_ngan


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


                LEFT JOIN dm_co_so cs

                    ON cs.id =
                       td.co_so_id


                LEFT JOIN dm_nha_an na

                    ON na.id =
                       td.nha_an_id


                LEFT JOIN dm_tai_khoan tk

                    ON tk.id =
                       p.nguoi_thanh_toan_id


                LEFT JOIN dm_nhan_vien nv

                    ON nv.id =
                       tk.nhan_vien_id



                UNION ALL



                /*
                 * ======================================
                 * NGUỒN 20 = ĐƠN HÀNG
                 * ======================================
                 */

                SELECT

                    20::integer
                        AS nguon_thanh_toan,

                    tt.id
                        AS giao_dich_id,

                    dh.id
                        AS tham_chieu_id,

                    tt.thoi_gian_thanh_toan,


                    dh.co_so_id,

                    cs.ma_co_so,

                    cs.ten_co_so,


                    /*
                     * nv_don_hang hiện tại
                     * không có nha_an_id.
                     */
                    NULL::integer
                        AS nha_an_id,

                    NULL::varchar
                        AS ma_nha_an,

                    NULL::varchar
                        AS ten_nha_an,


                    /*
                     * Đơn hàng DB:
                     *
                     * 10 = Nội bộ
                     * 20 = Tiền mặt
                     * 30 = Chuyển khoản
                     * 40 = QR
                     *
                     * Chuẩn hóa về TC02:
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
                    END
                        AS phuong_thuc,


                    tt.loai_giao_dich,

                    tt.trang_thai,

                    tt.so_tien,


                    tt.nguoi_thu_tien_tai_khoan_id
                        AS thu_ngan_id,

                    tk.ten_dang_nhap
                        AS tai_khoan_thu_ngan,

                    nv.ho_ten
                        AS ten_thu_ngan


                FROM nv_thanh_toan_don_hang tt


                INNER JOIN nv_don_hang dh

                    ON dh.id =
                       tt.don_hang_id


                LEFT JOIN dm_co_so cs

                    ON cs.id =
                       dh.co_so_id


                LEFT JOIN dm_tai_khoan tk

                    ON tk.id =
                       tt.nguoi_thu_tien_tai_khoan_id


                LEFT JOIN dm_nhan_vien nv

                    ON nv.id =
                       tk.nhan_vien_id

            )


            SELECT

                nguon_thanh_toan
                    AS "nguonThanhToan",


                co_so_id
                    AS "coSoId",

                ma_co_so
                    AS "maCoSo",

                ten_co_so
                    AS "tenCoSo",


                nha_an_id
                    AS "nhaAnId",

                ma_nha_an
                    AS "maNhaAn",

                ten_nha_an
                    AS "tenNhaAn",


                phuong_thuc
                    AS "phuongThucThanhToan",


                thu_ngan_id
                    AS "taiKhoanThuNganId",

                tai_khoan_thu_ngan
                    AS "taiKhoanThuNgan",

                ten_thu_ngan
                    AS "tenThuNgan",


                COUNT(
                    DISTINCT tham_chieu_id
                )
                    AS "soPhieu",


                COUNT(*)
                    AS "tongSoGiaoDich",


                COUNT(*) FILTER (

                    WHERE loai_giao_dich =
                        10

                )
                    AS "soGiaoDichThu",


                COUNT(*) FILTER (

                    WHERE loai_giao_dich =
                        20

                )
                    AS "soGiaoDichHoan",


                COUNT(*) FILTER (

                    WHERE trang_thai =
                        10

                )
                    AS "soGiaoDichChoXuLy",


                COUNT(*) FILTER (

                    WHERE trang_thai =
                        20

                )
                    AS "soGiaoDichDangXuLy",


                COUNT(*) FILTER (

                    WHERE trang_thai =
                        30

                )
                    AS "soGiaoDichThanhCong",


                COUNT(*) FILTER (

                    WHERE trang_thai =
                        40

                )
                    AS "soGiaoDichThatBai",


                COUNT(*) FILTER (

                    WHERE trang_thai =
                        50

                )
                    AS "soGiaoDichDaHuy",


                COALESCE(

                    SUM(
                        so_tien
                    )
                    FILTER (

                        WHERE
                            loai_giao_dich =
                                10

                            AND trang_thai =
                                30

                    ),

                    0

                )
                    AS "tongThu",


                COALESCE(

                    SUM(
                        so_tien
                    )
                    FILTER (

                        WHERE
                            loai_giao_dich =
                                20

                            AND trang_thai =
                                30

                    ),

                    0

                )
                    AS "tongHoan",


                COALESCE(

                    SUM(

                        CASE

                            WHEN
                                trang_thai =
                                    30

                                AND
                                loai_giao_dich =
                                    10

                                THEN so_tien


                            WHEN
                                trang_thai =
                                    30

                                AND
                                loai_giao_dich =
                                    20

                                THEN -so_tien


                            ELSE 0

                        END

                    ),

                    0

                )
                    AS "thucThu"


            FROM du_lieu


            WHERE
                ${conditions.join(
                    '\nAND '
                )}


            GROUP BY

                nguon_thanh_toan,


                co_so_id,

                ma_co_so,

                ten_co_so,


                nha_an_id,

                ma_nha_an,

                ten_nha_an,


                phuong_thuc,


                thu_ngan_id,

                tai_khoan_thu_ngan,

                ten_thu_ngan


            ORDER BY

                nguon_thanh_toan,

                ma_co_so,

                ma_nha_an NULLS LAST,

                phuong_thuc,

                tai_khoan_thu_ngan
                    NULLS LAST

        `;


        const {
            rows
        } =
            await pool.query(
                sql,
                values
            );


        return rows.map(
            row =>
                this.mapRow(
                    row
                )
        );
    }

}


module.exports =
    new Tc02Repository();