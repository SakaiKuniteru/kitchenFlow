'use strict';

const pool = require('../../../../config/database');

const {
    S,
    taoBoLoc,
    sqlChiTietDon
} = require('../dat-mon-report.helper');

class Dh05Repository {
    async getDuLieu(filters) {
        const q = taoBoLoc(
            filters,
            'dh.thoi_gian_nhan_tu'
        );

        let whereDanhGia = '';

        if (filters.danhGia?.length) {
            q.values.push(filters.danhGia);

            whereDanhGia = `
                WHERE e."danhGia" =
                    ANY($${q.values.length}::text[])
            `;
        }

        const sql = `
            WITH don AS (
                ${sqlChiTietDon(
                    q.conditions.join('\nAND ')
                )}
            ),

            moc AS (
                SELECT
                    d.*,

                    ls.xac_nhan
                        AT TIME ZONE 'Asia/Ho_Chi_Minh'
                        AS "thoiGianXacNhan",

                    ls.san_sang
                        AT TIME ZONE 'Asia/Ho_Chi_Minh'
                        AS "thoiGianSanSangGiao",

                    ls.bat_dau_giao
                        AT TIME ZONE 'Asia/Ho_Chi_Minh'
                        AS "thoiGianBatDauGiao",

                    ls.hoan_thanh
                        AT TIME ZONE 'Asia/Ho_Chi_Minh'
                        AS "thoiGianHoanThanh",

                    STATEMENT_TIMESTAMP() AS "thoiDiemDanhGia"

                FROM don d

                LEFT JOIN LATERAL (
                    SELECT
                        MIN(h.created_at) FILTER (
                            WHERE h.trang_thai_moi = ${S.DANG_CHUAN_BI}
                        ) AS xac_nhan,

                        MIN(h.created_at) FILTER (
                            WHERE h.trang_thai_moi = ${S.SAN_SANG_GIAO}
                        ) AS san_sang,

                        MIN(h.created_at) FILTER (
                            WHERE h.trang_thai_moi = ${S.DANG_GIAO}
                        ) AS bat_dau_giao,

                        MIN(h.created_at) FILTER (
                            WHERE h.trang_thai_moi = ${S.HOAN_THANH}
                        ) AS hoan_thanh

                    FROM nv_lich_su_don_hang h

                    WHERE h.don_hang_id = d."donHangId"
                      AND h.trang_thai_cu
                          IS DISTINCT FROM h.trang_thai_moi
                ) ls ON TRUE
            ),

            danh_gia AS (
                SELECT
                    m.*,

                    CASE
                        WHEN m."trangThaiDon"
                            IN (${S.DA_HUY}, ${S.TU_CHOI})
                            THEN 'KHONG_DANH_GIA'

                        WHEN m."thoiGianNhanDen" IS NULL
                            THEN 'THIEU_DU_LIEU'

                        WHEN m."trangThaiDon"
                            IN (${S.HOAN_THANH}, ${S.DONG_DON})
                        THEN
                            CASE
                                WHEN m."thoiGianHoanThanh" IS NULL
                                    THEN 'THIEU_DU_LIEU'

                                WHEN m."thoiGianHoanThanh"
                                    <= m."thoiGianNhanDen"
                                    THEN 'DUNG_HAN'

                                ELSE 'TRE_HAN'
                            END

                        WHEN m."thoiDiemDanhGia"
                            > m."thoiGianNhanDen"
                            THEN 'DANG_TRE'

                        ELSE 'CHUA_QUA_HAN'
                    END AS "danhGia"

                FROM moc m
            )

            SELECT
                e.*,

                CASE
                    WHEN e."danhGia" = 'TRE_HAN'
                    THEN ROUND(
                        EXTRACT(EPOCH FROM (
                            e."thoiGianHoanThanh"
                            - e."thoiGianNhanDen"
                        )) / 60,
                        2
                    )

                    WHEN e."danhGia" = 'DANG_TRE'
                    THEN ROUND(
                        EXTRACT(EPOCH FROM (
                            e."thoiDiemDanhGia"
                            - e."thoiGianNhanDen"
                        )) / 60,
                        2
                    )

                    WHEN e."danhGia"
                        IN ('DUNG_HAN', 'CHUA_QUA_HAN')
                        THEN 0

                    ELSE NULL
                END AS "soPhutTre",

                CASE
                    WHEN e."thoiGianHoanThanh" >= e."thoiGianDat"
                    THEN ROUND(
                        EXTRACT(EPOCH FROM (
                            e."thoiGianHoanThanh"
                            - e."thoiGianDat"
                        )) / 60,
                        2
                    )

                    ELSE NULL
                END AS "soPhutTuDatDenHoanThanh"

            FROM danh_gia e

            ${whereDanhGia}

            ORDER BY
                e."thoiGianNhanTu",
                e."donHangId"
        `;

        const { rows } = await pool.query(sql, q.values);

        return rows.map(row => ({
            ...row,

            soPhutTre:
                row.soPhutTre == null
                    ? null
                    : Number(row.soPhutTre),

            soPhutTuDatDenHoanThanh:
                row.soPhutTuDatDenHoanThanh == null
                    ? null
                    : Number(row.soPhutTuDatDenHoanThanh)
        }));
    }
}

module.exports = new Dh05Repository();