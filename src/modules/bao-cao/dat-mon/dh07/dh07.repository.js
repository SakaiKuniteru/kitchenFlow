'use strict';

const pool = require(
    '../../../../config/database'
);


const {
    taoBoLoc,
    chuyenSo
} = require(
    '../dat-mon-report.helper'
);


const {
    HINH_THUC_DAT
} = require(
    './dh07.validation'
);


class Dh07Repository {

    async getDuLieu(
        filters
    ) {

        /*
         * ==========================================
         * BỘ LỌC CHUNG
         * ==========================================
         *
         * DH07 luôn lọc theo ngày đặt:
         *
         * nv_don_hang.created_at
         */

        const q =
            taoBoLoc(
                {
                    ...filters,

                    /*
                     * Helper chung sử dụng
                     * nguoiDatIds.
                     *
                     * FE DH07 sử dụng
                     * nhanVienIds.
                     */

                    nguoiDatIds:
                        filters.nhanVienIds ||
                        []
                },

                'dh.created_at'
            );


        /*
         * ==========================================
         * ĐẶT CHO MÌNH / ĐẶT HỘ
         * ==========================================
         */

        const hinhThucDat =
            Array.isArray(
                filters.hinhThucDat
            )
                ? filters.hinhThucDat
                : [];


        if (
            hinhThucDat.length >
            0
        ) {

            const datHoValues =
                hinhThucDat
                    .map(
                        value => {

                            const number =
                                Number(
                                    value
                                );


                            if (
                                number ===
                                HINH_THUC_DAT
                                    .DAT_CHO_MINH
                            ) {
                                return false;
                            }


                            if (
                                number ===
                                HINH_THUC_DAT
                                    .DAT_HO
                            ) {
                                return true;
                            }


                            return null;

                        }
                    )
                    .filter(
                        value =>
                            value !==
                            null
                    );


            if (
                datHoValues.length >
                0
            ) {

                q.values.push(
                    datHoValues
                );


                q.conditions.push(
                    `
                        dh.dat_ho
                        =
                        ANY(
                            $${q.values.length}::boolean[]
                        )
                    `
                );

            }

        }


        /*
         * ==========================================
         * TỔNG HỢP THEO
         *
         * CƠ SỞ
         * PHÒNG BAN
         * NHÂN VIÊN
         * ==========================================
         */

        const sql = `

            SELECT

                /*
                 * ==============================
                 * CƠ SỞ
                 * ==============================
                 */

                dh.co_so_id
                    AS "coSoId",

                cs.ten_co_so
                    AS "tenCoSo",


                /*
                 * ==============================
                 * PHÒNG BAN
                 * ==============================
                 */

                dh.phong_ban_id
                    AS "phongBanId",

                pb.ten_phong_ban
                    AS "tenPhongBan",


                /*
                 * ==============================
                 * NHÂN VIÊN ĐẶT HÀNG
                 * ==============================
                 */

                dh.nguoi_dat_id
                    AS "nhanVienId",

                nv.ma_nhan_vien
                    AS "maNhanVien",

                nv.ho_ten
                    AS "tenNhanVien",


                /*
                 * ==============================
                 * SỐ ĐƠN
                 * ==============================
                 */

                COUNT(*)::integer
                    AS "soDon",


                /*
                 * Đặt cho mình
                 */

                COUNT(*) FILTER (

                    WHERE

                        COALESCE(
                            dh.dat_ho,
                            FALSE
                        ) =
                        FALSE

                )::integer
                    AS "soDonDatChoMinh",


                /*
                 * Đặt hộ
                 */

                COUNT(*) FILTER (

                    WHERE

                        dh.dat_ho =
                        TRUE

                )::integer
                    AS "soDonDatHo",


                /*
                 * ==============================
                 * GIÁ TRỊ
                 * ==============================
                 */

                COALESCE(
                    SUM(
                        dh.tam_tinh
                    ),
                    0
                )
                    AS "tamTinh",


                COALESCE(
                    SUM(
                        dh.tong_mien_giam
                    ),
                    0
                )
                    AS "tongMienGiam",


                COALESCE(
                    SUM(
                        dh.phi_dich_vu
                    ),
                    0
                )
                    AS "phiDichVu",


                COALESCE(
                    SUM(
                        dh.tong_thanh_toan
                    ),
                    0
                )
                    AS "tongThanhToan"


            FROM nv_don_hang dh


            LEFT JOIN dm_co_so cs

                ON cs.id =
                    dh.co_so_id


            LEFT JOIN dm_phong_ban pb

                ON pb.id =
                    dh.phong_ban_id


            LEFT JOIN dm_nhan_vien nv

                ON nv.id =
                    dh.nguoi_dat_id


            WHERE

                ${q.conditions.join(
                    '\nAND '
                )}


            GROUP BY

                dh.co_so_id,

                cs.ten_co_so,

                dh.phong_ban_id,

                pb.ten_phong_ban,

                dh.nguoi_dat_id,

                nv.ma_nhan_vien,

                nv.ho_ten


            ORDER BY

                cs.ten_co_so
                    NULLS LAST,

                pb.ten_phong_ban
                    NULLS LAST,

                nv.ho_ten
                    NULLS LAST,

                dh.nguoi_dat_id

        `;


        const {
            rows
        } =
            await pool.query(
                sql,
                q.values
            );


        return rows.map(
            row =>
                chuyenSo(
                    row,
                    [
                        'soDon',
                        'soDonDatChoMinh',
                        'soDonDatHo',

                        'tamTinh',
                        'tongMienGiam',
                        'phiDichVu',
                        'tongThanhToan'
                    ]
                )
        );

    }

}


module.exports =
    new Dh07Repository();