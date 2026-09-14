'use strict';

const pool = require('../../../../config/database');

const {
    taoBoLoc,
    chuyenSo
} = require('../ve-an-report.helper');

class Va04Repository {
    async getDuLieu(filters) {
        const { where, values } = taoBoLoc(
            filters,
            'tdn.ngay'
        );

        const sql = `
            SELECT
                tdn.ngay::text AS "ngaySuDung",

                td.co_so_id AS "coSoId",
                cs.ma_co_so AS "maCoSo",
                cs.ten_co_so AS "tenCoSo",

                td.nha_an_id AS "nhaAnId",
                na.ma_nha_an AS "maNhaAn",
                na.ten_nha_an AS "tenNhaAn",

                td.ca_an_id AS "caAnId",
                ca.ma_ca_an AS "maCaAn",
                ca.ten_ca_an AS "tenCaAn",

                nv.phong_ban_id AS "phongBanId",
                pb.ma_phong_ban AS "maPhongBan",
                pb.ten_phong_ban AS "tenPhongBan",

                p.doi_tuong_lay_ve AS "loaiVe",

                COUNT(DISTINCT p.id)
                    AS "soPhieuTrongNhom",

                COUNT(DISTINCT p.nhan_vien_id)
                    AS "soNhanVienTrongNhom",

                COUNT(*) AS "soVeDaPhat",

                COUNT(*) FILTER (
                    WHERE v.trang_thai = 10
                ) AS "soVeChuaSuDung",

                COUNT(*) FILTER (
                    WHERE v.trang_thai = 20
                ) AS "soSuatDaSuDung",

                COUNT(*) FILTER (
                    WHERE v.trang_thai = 30
                ) AS "soVeDaHuy",

                COUNT(*) FILTER (
                    WHERE v.trang_thai = 40
                ) AS "soVeHetHan"

            FROM ct_ve_an v

            INNER JOIN nv_phieu_lay_ve_an p
                ON p.id = v.phieu_lay_ve_id

            INNER JOIN ct_thuc_don_ngay tdn
                ON tdn.id = v.thuc_don_ngay_id

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

            LEFT JOIN dm_phong_ban pb
                ON pb.id = nv.phong_ban_id

            WHERE ${where}

            GROUP BY
                tdn.ngay,

                td.co_so_id,
                cs.ma_co_so,
                cs.ten_co_so,

                td.nha_an_id,
                na.ma_nha_an,
                na.ten_nha_an,

                td.ca_an_id,
                ca.ma_ca_an,
                ca.ten_ca_an,

                nv.phong_ban_id,
                pb.ma_phong_ban,
                pb.ten_phong_ban,

                p.doi_tuong_lay_ve

            ORDER BY
                tdn.ngay,
                cs.ma_co_so,
                na.ma_nha_an,
                ca.ma_ca_an,
                pb.ma_phong_ban NULLS LAST,
                p.doi_tuong_lay_ve
        `;

        const { rows } = await pool.query(sql, values);

        return rows.map(row => chuyenSo(row, [
            'loaiVe',
            'soPhieuTrongNhom',
            'soNhanVienTrongNhom',
            'soVeDaPhat',
            'soVeChuaSuDung',
            'soSuatDaSuDung',
            'soVeDaHuy',
            'soVeHetHan'
        ]));
    }
}

module.exports = new Va04Repository();