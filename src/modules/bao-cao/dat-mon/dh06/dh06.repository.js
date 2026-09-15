'use strict';

const pool = require(
    '../../../../config/database'
);


const {
    S,
    taoBoLoc,
    sqlChiTietDon
} = require(
    '../dat-mon-report.helper'
);


class Dh06Repository {

    async getDuLieu(
        filters
    ) {

        /*
         * ==========================================
         * THỜI GIAN
         * ==========================================
         *
         * DH06 lọc theo ngày hủy / từ chối.
         *
         * Cả hai nghiệp vụ đều lưu:
         *
         * nv_don_hang.thoi_gian_huy
         */

        const q =
            taoBoLoc(
                filters,
                'dh.thoi_gian_huy'
            );


        /*
         * ==========================================
         * CHỈ LẤY ĐƠN ĐÃ HỦY / TỪ CHỐI
         * ==========================================
         */

        q.conditions.push(
            `
                dh.trang_thai
                IN (
                    ${S.DA_HUY},
                    ${S.TU_CHOI}
                )
            `
        );


        /*
         * ==========================================
         * NGƯỜI THỰC HIỆN
         * ==========================================
         *
         * Khi đơn hủy hoặc từ chối,
         * hệ thống lưu người thực hiện vào:
         *
         * nv_don_hang.nguoi_huy_id
         */

        q.addArray(
            'dh.nguoi_huy_id',
            filters.nguoiThucHienIds
        );


        /*
         * ==========================================
         * LOẠI XỬ LÝ
         * ==========================================
         *
         * S.DA_HUY
         * S.TU_CHOI
         */

        q.addArray(
            'dh.trang_thai',
            filters.loaiXuLy,
            'integer'
        );


        /*
         * ==========================================
         * LÝ DO
         * ==========================================
         */

        q.addText(
            'dh.ly_do_huy',
            filters.lyDo
        );


        /*
         * nguoiDatIds đã được helper chung xử lý:
         *
         * dh.nguoi_dat_id
         *
         * coSoIds cũng đã được xử lý:
         *
         * dh.co_so_id
         */


        const sql = `

            SELECT
                d.*

            FROM (
                ${sqlChiTietDon(
                    q.conditions.join(
                        '\nAND '
                    )
                )}
            ) d

            ORDER BY

                d."thoiGianHuy"
                    DESC NULLS LAST,

                d."donHangId"
                    DESC

        `;


        const {
            rows
        } =
            await pool.query(
                sql,
                q.values
            );


        return rows;

    }

}


module.exports =
    new Dh06Repository();