'use strict';

const pool = require(
    '../../../../config/database'
);


class Tc01Repository {

    getTimeExpression(
        loaiThoiGian
    ) {
        switch (
            Number(
                loaiThoiGian
            )
        ) {

            case 10:
                return 'tt.created_at';

            case 30:
                return 'tt.thoi_gian_thanh_toan';

            case 40:
                return 'tt.thoi_gian_thanh_toan';

            default:
                throw new Error(
                    'Loại thời gian TC01 không hợp lệ.'
                );
        }
    }


    mapRow(
        row
    ) {
        if (!row) {
            return null;
        }


        const toNumber =
            (
                value,
                defaultValue = 0
            ) => {

                if (
                    value === null ||
                    value === undefined
                ) {
                    return defaultValue;
                }

                const number =
                    Number(value);

                return Number.isFinite(number)
                    ? number
                    : defaultValue;
            };


        return {
            ...row,

            soTien:
                toNumber(
                    row.soTien
                ),

            soLuongGiaoDich:
                toNumber(
                    row.soLuongGiaoDich
                ),

            donGia:
                toNumber(
                    row.donGia
                ),

            tienGoc:
                toNumber(
                    row.tienGoc
                ),

            tongMienGiam:
                toNumber(
                    row.tongMienGiam
                ),

            thanhTien:
                toNumber(
                    row.thanhTien
                ),

            soLuongPhieu:
                toNumber(
                    row.soLuongPhieu
                ),

            tongSoVe:
                toNumber(
                    row.tongSoVe
                ),

            soVeChuaSuDung:
                toNumber(
                    row.soVeChuaSuDung
                ),

            soVeDaSuDung:
                toNumber(
                    row.soVeDaSuDung
                ),

            soVeDaHuy:
                toNumber(
                    row.soVeDaHuy
                ),

            soVeHetHan:
                toNumber(
                    row.soVeHetHan
                )
        };
    }


    async getDuLieu(
        filters
    ) {
        const conditions = [];
        const values = [];


        const addArrayCondition =
            (
                expression,
                rawValues,
                type = 'bigint'
            ) => {

                if (
                    !Array.isArray(
                        rawValues
                    ) ||
                    rawValues.length === 0
                ) {
                    return;
                }


                values.push(
                    rawValues.map(
                        value =>
                            Number(value)
                    )
                );


                conditions.push(`
                    ${expression}
                    =
                    ANY(
                        $${values.length}::${type}[]
                    )
                `);
            };


        const timeExpression =
            this.getTimeExpression(
                filters.loaiThoiGian
            );


        /*
         * ==============================
         * LOẠI THỜI GIAN
         * ==============================
         */

        values.push(
            filters.tuNgay
        );

        conditions.push(`
            ${timeExpression}
            >=
            $${values.length}::timestamptz
        `);


        values.push(
            filters.denNgay
        );

        conditions.push(`
            ${timeExpression}
            <=
            $${values.length}::timestamptz
        `);


        /*
         * Thời gian hoàn chỉ có ý nghĩa
         * với giao dịch hoàn tiền.
         */
        if (
            Number(
                filters.loaiThoiGian
            ) === 40
        ) {
            conditions.push(`
                tt.loai_giao_dich = 20
            `);
        }

        /*
        * ==============================
        * NGƯỜI TẠO PHIẾU
        * ==============================
        *
        * Giá trị filter:
        * dm_tai_khoan.id
        */
        addArrayCondition(
            'p.nguoi_tao_id',
            filters.nguoiTaoIds
        );


        /*
        * ==============================
        * THU NGÂN
        * ==============================
        *
        * Thu ngân chính là tài khoản
        * thanh toán phiếu.
        *
        * Giá trị filter:
        * dm_tai_khoan.id
        */
        addArrayCondition(
            'p.nguoi_thanh_toan_id',
            filters.thuNganIds
        );
        /*
         * ==============================
         * TỔ CHỨC
         * ==============================
         */

        addArrayCondition(
            'td.co_so_id',
            filters.coSoIds
        );

        addArrayCondition(
            'td.nha_an_id',
            filters.nhaAnIds
        );

        addArrayCondition(
            'td.ca_an_id',
            filters.caAnIds
        );

        /*
         * ==============================
         * ENUM
         * ==============================
         */

        /*
        * ==============================
        * ĐỐI TƯỢNG
        * ==============================
        */
        addArrayCondition(
            'p.doi_tuong_lay_ve',
            filters.doiTuong,
            'integer'
        );


        /*
        * ==============================
        * HÌNH THỨC THANH TOÁN
        * ==============================
        */
        addArrayCondition(
            'tt.phuong_thuc',
            filters.hinhThucThanhToan,
            'integer'
        );


        /*
        * ==============================
        * HIỂN THỊ THU / CHI
        * ==============================
        *
        * THU 10
        * → giao dịch thanh toán 10
        *
        * CHI 20
        * → giao dịch hoàn tiền 20
        */
        addArrayCondition(
            'tt.loai_giao_dich',
            filters.hienThiThuChi,
            'integer'
        );


        /*
        * ==============================
        * TRẠNG THÁI THANH TOÁN
        * ==============================
        */
        addArrayCondition(
            'tt.trang_thai',
            filters.trangThaiThanhToan,
            'integer'
        );

        /*
         * ==============================
         * TRẠNG THÁI SỬ DỤNG VÉ
         * ==============================
         */

        if (
            Array.isArray(
                filters.trangThaiSuDung
            ) &&
            filters.trangThaiSuDung.length >
                0
        ) {

            values.push(
                filters.trangThaiSuDung.map(
                    value =>
                        Number(value)
                )
            );


            conditions.push(`
                EXISTS (
                    SELECT 1

                    FROM ct_ve_an v_filter

                    WHERE
                        v_filter.phieu_lay_ve_id =
                            p.id

                        AND v_filter.trang_thai
                            =
                            ANY(
                                $${values.length}::integer[]
                            )
                )
            `);
        }

        const sql = `

            SELECT

                /*
                 * ==========================
                 * GIAO DỊCH THU / CHI
                 * ==========================
                 */

                tt.id
                    AS "giaoDichId",

                tt.phieu_lay_ve_id
                    AS "phieuLayVeId",

                tt.loai_giao_dich
                    AS "loaiGiaoDich",

                CASE
                    WHEN tt.loai_giao_dich = 10
                        THEN 'THU'

                    WHEN tt.loai_giao_dich = 20
                        THEN 'CHI'

                    ELSE 'KHAC'
                END
                    AS "huongTien",

                tt.phuong_thuc
                    AS "phuongThucThanhToan",

                tt.so_tien
                    AS "soTien",

                tt.so_luong
                    AS "soLuongGiaoDich",

                tt.ma_giao_dich
                    AS "maGiaoDich",

                tt.ma_tham_chieu
                    AS "maThamChieu",

                tt.ma_chuan_chi
                    AS "maChuanChi",

                tt.trang_thai
                    AS "trangThaiThanhToan",

                tt.noi_dung_loi
                    AS "noiDungLoi",

                CASE
                    WHEN tt.loai_giao_dich = 20
                        THEN tt.noi_dung_loi
                    ELSE NULL
                END
                    AS "lyDoHoan",

                tt.thanh_toan_goc_id
                    AS "thanhToanGocId",

                tt_goc.ma_giao_dich
                    AS "maGiaoDichGoc",

                tt_goc.so_tien
                    AS "soTienGiaoDichGoc",

                tt.phieu_moi_id
                    AS "phieuMoiId",

                p_moi.so_phieu
                    AS "soPhieuMoi",

                tt.thoi_gian_thanh_toan
                    AS "thoiGianThanhToan",

                tt.created_at
                    AS "thoiGianTaoGiaoDich",

                tt.updated_at
                    AS "thoiGianCapNhatGiaoDich",

                CASE
                    WHEN tt.loai_giao_dich = 20
                    THEN COALESCE(
                        tt.thoi_gian_thanh_toan,
                        tt.created_at
                    )
                    ELSE NULL
                END
                    AS "thoiGianHoan",


                /*
                 * ==========================
                 * TÀI KHOẢN KHỞI TẠO
                 * ==========================
                 */

                tt.nguoi_khoi_tao_id
                    AS "taiKhoanKhoiTaoId",

                tk_kt.ten_dang_nhap
                    AS "taiKhoanKhoiTao",

                nv_kt.id
                    AS "nhanVienKhoiTaoId",

                nv_kt.ma_nhan_vien
                    AS "maNhanVienKhoiTao",

                nv_kt.ho_ten
                    AS "tenNguoiKhoiTao",


                /*
                 * ==========================
                 * TÀI KHOẢN XÁC NHẬN
                 * ==========================
                 */

                tt.nguoi_xac_nhan_id
                    AS "taiKhoanXacNhanId",

                tk_xn.ten_dang_nhap
                    AS "taiKhoanXacNhan",

                nv_xn.id
                    AS "nhanVienXacNhanId",

                nv_xn.ma_nhan_vien
                    AS "maNhanVienXacNhan",

                nv_xn.ho_ten
                    AS "tenNguoiXacNhan",

                /*
                * ==========================
                * NGƯỜI TẠO PHIẾU
                * ==========================
                */

                p.nguoi_tao_id
                    AS "taiKhoanNguoiTaoId",

                tk_tao.ten_dang_nhap
                    AS "taiKhoanNguoiTao",

                nv_tao.id
                    AS "nhanVienNguoiTaoId",

                nv_tao.ma_nhan_vien
                    AS "maNguoiTao",

                nv_tao.ho_ten
                    AS "tenNguoiTao",
                    
                /*
                * ==========================
                * THU NGÂN
                * ==========================
                */

                p.nguoi_thanh_toan_id
                    AS "taiKhoanThuNganId",

                tk_ptt.ten_dang_nhap
                    AS "taiKhoanThuNgan",

                nv_ptt.id
                    AS "nhanVienThuNganId",

                nv_ptt.ma_nhan_vien
                    AS "maThuNgan",

                nv_ptt.ho_ten
                    AS "tenThuNgan",

                CASE
                    WHEN tt.loai_giao_dich = 20
                    THEN COALESCE(
                        tt.nguoi_xac_nhan_id,
                        tt.nguoi_khoi_tao_id
                    )
                    ELSE NULL
                END
                    AS "taiKhoanHoanId",

                CASE
                    WHEN tt.loai_giao_dich = 20
                    THEN COALESCE(
                        tk_xn.ten_dang_nhap,
                        tk_kt.ten_dang_nhap
                    )
                    ELSE NULL
                END
                    AS "taiKhoanHoan",

                CASE
                    WHEN tt.loai_giao_dich = 20
                    THEN COALESCE(
                        nv_xn.id,
                        nv_kt.id
                    )
                    ELSE NULL
                END
                    AS "nguoiHoanId",

                CASE
                    WHEN tt.loai_giao_dich = 20
                    THEN COALESCE(
                        nv_xn.ho_ten,
                        nv_kt.ho_ten
                    )
                    ELSE NULL
                END
                    AS "tenNguoiHoan",


                /*
                 * ==========================
                 * PHIẾU LẤY VÉ
                 * ==========================
                 */

                p.so_phieu
                    AS "soPhieu",

                p.phieu_goc_id
                    AS "phieuGocId",

                p.doi_tuong_lay_ve
                    AS "doiTuongLayVe",

                p.nhan_vien_id
                    AS "nhanVienLayVeId",

                nv_lay.ma_nhan_vien
                    AS "maNhanVienLayVe",

                nv_lay.ho_ten
                    AS "tenNhanVienLayVe",

                p.ho_ten_nguoi_lay_ve
                    AS "hoTenNguoiLayVe",

                p.ngay_sinh_nguoi_lay_ve
                    AS "ngaySinhNguoiLayVe",

                p.gioi_tinh_nguoi_lay_ve
                    AS "gioiTinhNguoiLayVe",

                p.so_dien_thoai_nguoi_lay_ve
                    AS "soDienThoaiNguoiLayVe",

                p.dia_chi_nguoi_lay_ve
                    AS "diaChiNguoiLayVe",

                p.don_vi_nguoi_lay_ve
                    AS "donViNguoiLayVe",

                p.so_luong
                    AS "soLuongPhieu",

                p.don_gia
                    AS "donGia",

                p.tien_goc
                    AS "tienGoc",

                p.tong_mien_giam
                    AS "tongMienGiam",

                p.thanh_tien
                    AS "thanhTien",

                p.ghi_chu
                    AS "ghiChu",

                p.phuong_thuc_thanh_toan
                    AS "phuongThucThanhToanPhieu",

                p.trang_thai
                    AS "trangThaiPhieuThu",

                p.created_at
                    AS "thoiGianTaoPhieu",

                p.updated_at
                    AS "thoiGianCapNhatPhieu",

                p.thoi_gian_thanh_toan
                    AS "thoiGianThanhToanPhieu",

                p.nguoi_huy_id
                    AS "taiKhoanHuyPhieuId",

                p.thoi_gian_huy
                    AS "thoiGianHuyPhieu",

                p.ly_do_huy
                    AS "lyDoHuyPhieu",


                /*
                 * ==========================
                 * THỰC ĐƠN
                 * ==========================
                 */

                p.thuc_don_ngay_id
                    AS "thucDonNgayId",

                tdn.ngay
                    AS "ngayThucDon",

                td.id
                    AS "thucDonId",

                td.ma_thuc_don
                    AS "maThucDon",

                td.ten_thuc_don
                    AS "tenThucDon",


                /*
                 * ==========================
                 * CƠ SỞ / NHÀ ĂN / CA ĂN
                 * ==========================
                 */

                td.co_so_id
                    AS "coSoId",

                cs.ma_co_so
                    AS "maCoSo",

                cs.ten_co_so
                    AS "tenCoSo",

                td.nha_an_id
                    AS "nhaAnId",

                na.ma_nha_an
                    AS "maNhaAn",

                na.ten_nha_an
                    AS "tenNhaAn",

                td.ca_an_id
                    AS "caAnId",

                ca.ma_ca_an
                    AS "maCaAn",

                ca.ten_ca_an
                    AS "tenCaAn",

                ca.thoi_gian_bat_dau
                    AS "thoiGianBatDauCa",

                ca.thoi_gian_ket_thuc
                    AS "thoiGianKetThucCa",


                /*
                 * ==========================
                 * TRẠNG THÁI SỬ DỤNG VÉ
                 * ==========================
                 */

                COALESCE(
                    ve.tong_so_ve,
                    0
                )
                    AS "tongSoVe",

                COALESCE(
                    ve.trang_thai_su_dung,
                    ARRAY[]::INTEGER[]
                )
                    AS "trangThaiSuDung",

                COALESCE(
                    ve.so_ve_chua_su_dung,
                    0
                )
                    AS "soVeChuaSuDung",

                COALESCE(
                    ve.so_ve_da_su_dung,
                    0
                )
                    AS "soVeDaSuDung",

                COALESCE(
                    ve.so_ve_da_huy,
                    0
                )
                    AS "soVeDaHuy",

                COALESCE(
                    ve.so_ve_het_han,
                    0
                )
                    AS "soVeHetHan",

                ve.thoi_gian_su_dung_dau
                    AS "thoiGianSuDungDau",

                ve.thoi_gian_su_dung_cuoi
                    AS "thoiGianSuDungCuoi"


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


            LEFT JOIN dm_ca_an ca
                ON ca.id =
                   td.ca_an_id


            LEFT JOIN dm_nhan_vien nv_lay
                ON nv_lay.id =
                   p.nhan_vien_id

            LEFT JOIN dm_tai_khoan tk_tao
                ON tk_tao.id =
                p.nguoi_tao_id


            LEFT JOIN dm_nhan_vien nv_tao
                ON nv_tao.id =
                tk_tao.nhan_vien_id
                
            LEFT JOIN dm_tai_khoan tk_ptt
                ON tk_ptt.id =
                   p.nguoi_thanh_toan_id


            LEFT JOIN dm_nhan_vien nv_ptt
                ON nv_ptt.id =
                   tk_ptt.nhan_vien_id


            LEFT JOIN dm_tai_khoan tk_kt
                ON tk_kt.id =
                   tt.nguoi_khoi_tao_id


            LEFT JOIN dm_nhan_vien nv_kt
                ON nv_kt.id =
                   tk_kt.nhan_vien_id


            LEFT JOIN dm_tai_khoan tk_xn
                ON tk_xn.id =
                   tt.nguoi_xac_nhan_id


            LEFT JOIN dm_nhan_vien nv_xn
                ON nv_xn.id =
                   tk_xn.nhan_vien_id


            LEFT JOIN nv_thanh_toan_ve_an tt_goc
                ON tt_goc.id =
                   tt.thanh_toan_goc_id


            LEFT JOIN nv_phieu_lay_ve_an p_moi
                ON p_moi.id =
                   tt.phieu_moi_id


            LEFT JOIN LATERAL (

                SELECT

                    COUNT(*)::INTEGER
                        AS tong_so_ve,

                    COALESCE(
                        ARRAY_REMOVE(
                            ARRAY_AGG(
                                DISTINCT v.trang_thai
                            ),
                            NULL
                        ),
                        ARRAY[]::INTEGER[]
                    )
                        AS trang_thai_su_dung,

                    COUNT(*) FILTER (
                        WHERE v.trang_thai = 10
                    )::INTEGER
                        AS so_ve_chua_su_dung,

                    COUNT(*) FILTER (
                        WHERE v.trang_thai = 20
                    )::INTEGER
                        AS so_ve_da_su_dung,

                    COUNT(*) FILTER (
                        WHERE v.trang_thai = 30
                    )::INTEGER
                        AS so_ve_da_huy,

                    COUNT(*) FILTER (
                        WHERE v.trang_thai = 40
                    )::INTEGER
                        AS so_ve_het_han,

                    MIN(
                        v.thoi_gian_su_dung
                    )
                        AS thoi_gian_su_dung_dau,

                    MAX(
                        v.thoi_gian_su_dung
                    )
                        AS thoi_gian_su_dung_cuoi

                FROM ct_ve_an v

                WHERE
                    v.phieu_lay_ve_id =
                        p.id

            ) ve
                ON TRUE


            ${
                conditions.length > 0
                    ? `
                        WHERE
                            ${conditions.join(
                                '\nAND '
                            )}
                    `
                    : ''
            }


            ORDER BY

                ${timeExpression}
                    DESC NULLS LAST,

                tt.id DESC

        `;


        const result =
            await pool.query(
                sql,
                values
            );


        return result.rows.map(
            row =>
                this.mapRow(
                    row
                )
        );
    }

}


module.exports =
    new Tc01Repository();