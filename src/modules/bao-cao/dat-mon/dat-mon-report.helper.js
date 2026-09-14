'use strict';

const { randomUUID } = require('crypto');

const common = require('../ve-an/ve-an-report.helper');

const inBaoCaoService = require(
    '../../../services/in-bao-cao/in-bao-cao.service'
);

const {
    TRANG_THAI_DON_HANG: S,
    TRANG_THAI_CHI_TIET: CT
} = require(
    '../../nghiep-vu/dat-hang/don-hang/don-hang.constants'
);

const {
    Joi,
    enums,
    idArraySchema,
    enumArraySchema,
    enumItem,
    chuyenSo,
    congTong
} = common;

const DS_TRANG_THAI = enums.trangThaiDonHang.filter(
    item => Number(item.value) !== S.NHAP
);

const TRANG_THAI_DANG_XU_LY = [
    S.CHO_XAC_NHAN,
    S.DANG_CHUAN_BI,
    S.SAN_SANG_GIAO,
    S.DANG_GIAO
];

function taoSchema(fields = {}) {
    return common.taoSchema({
        // Bộ lọc ca ăn thuộc VA, không dùng cho đơn hàng.
        caAnIds: Joi.forbidden(),

        nhaAnIds: idArraySchema()
            .max(0)
            .messages({
                'array.max':
                    'Đơn hàng chưa lưu nhà ăn. '
                    + 'Bộ lọc nhaAnIds hiện phải để trống.'
            }),

        ...fields
    });
}

function loaiThoiGianSchema() {
    return Joi.string()
        .valid('NGAY_DAT', 'NGAY_NHAN')
        .default('NGAY_DAT');
}

function trangThaiSchema() {
    return enumArraySchema(DS_TRANG_THAI);
}

function getTimeExpression(value) {
    switch (value) {
        case 'NGAY_DAT':
            return 'dh.created_at';

        case 'NGAY_NHAN':
            return 'dh.thoi_gian_nhan_tu';

        default:
            throw new Error('Loại thời gian báo cáo đơn hàng không hợp lệ.');
    }
}

function taoBoLoc(filters, timeExpression) {
    const values = [filters.tuNgay, filters.denNgay];

    const conditions = [
        `${timeExpression} >= $1::date`,
        `${timeExpression} < ($2::date + INTERVAL '1 day')`,

        // Đơn nháp chưa phải đơn đã đặt.
        `dh.trang_thai <> ${S.NHAP}`
    ];

    function addArray(expression, items, type = 'bigint') {
        if (!Array.isArray(items) || items.length === 0) {
            return;
        }

        values.push(items);

        conditions.push(
            `${expression} = ANY($${values.length}::${type}[])`
        );
    }

    function addText(expression, value) {
        if (!value) return;

        values.push(value);

        conditions.push(`
            POSITION(
                LOWER($${values.length}::text)
                IN LOWER(COALESCE(${expression}, ''))
            ) > 0
        `);
    }

    addArray('dh.co_so_id', filters.coSoIds);
    addArray('dh.nguoi_dat_id', filters.nguoiDatIds);
    addArray('dh.nguoi_nhan_id', filters.nguoiNhanIds);
    addArray('dh.phong_ban_id', filters.phongBanIds);

    addArray('dh.khung_gio_nhan_id', filters.khungGioNhanIds);
    addArray('dh.dia_diem_nhan_id', filters.diaDiemNhanIds);
    addArray('dh.nguoi_xu_ly_id', filters.nguoiXuLyIds);

    addArray(
        'dh.trang_thai',
        filters.trangThaiDon,
        'integer'
    );

    addArray(
        'dh.phuong_thuc_thanh_toan',
        filters.phuongThucThanhToan,
        'integer'
    );

    addArray(
        'dh.trang_thai_thanh_toan',
        filters.trangThaiThanhToan,
        'integer'
    );

    addText('dh.ma_don_hang', filters.maDon);
    addText('dh.ten_nguoi_nhan', filters.tenNguoiNhan);

    return {
        values,
        conditions,
        addArray
    };
}

/*
 * Chỉ tạo SQL dùng chung, không thực thi truy vấn.
 * LATERAL gom món thành một mảng nên mỗi đơn vẫn chỉ có một dòng.
 */
function sqlChiTietDon(where, { kemMon = false } = {}) {
    return `
        SELECT
            dh.id AS "donHangId",
            dh.ma_don_hang AS "maDonHang",

            dh.created_at
                AT TIME ZONE 'Asia/Ho_Chi_Minh'
                AS "thoiGianDat",

            dh.thoi_gian_nhan_tu
                AT TIME ZONE 'Asia/Ho_Chi_Minh'
                AS "thoiGianNhanTu",

            dh.thoi_gian_nhan_den
                AT TIME ZONE 'Asia/Ho_Chi_Minh'
                AS "thoiGianNhanDen",

            dh.co_so_id AS "coSoId",
            cs.ten_co_so AS "tenCoSo",

            dh.nguoi_dat_id AS "nguoiDatId",
            nd.ma_nhan_vien AS "maNguoiDat",
            nd.ho_ten AS "tenNguoiDat",

            dh.nguoi_nhan_id AS "nguoiNhanId",
            dh.ten_nguoi_nhan AS "tenNguoiNhan",
            dh.so_dien_thoai_nguoi_nhan AS "soDienThoaiNguoiNhan",
            dh.dat_ho AS "datHo",

            dh.phong_ban_id AS "phongBanId",
            pb.ten_phong_ban AS "tenPhongBan",

            dh.khung_gio_nhan_id AS "khungGioNhanId",
            kg.ten_khung_gio AS "tenKhungGio",

            dh.dia_diem_nhan_id AS "diaDiemNhanId",
            dh.ten_dia_diem_nhan_snapshot AS "tenDiaDiemNhan",
            dh.dia_chi_nhan_snapshot AS "diaChiNhan",

            dh.nguoi_xu_ly_id AS "nguoiXuLyId",
            nx.ho_ten AS "tenNguoiXuLy",

            dh.trang_thai AS "trangThaiDon",
            dh.phuong_thuc_thanh_toan AS "phuongThucThanhToan",
            dh.trang_thai_thanh_toan AS "trangThaiThanhToan",

            dh.tam_tinh AS "tamTinh",
            dh.tong_mien_giam AS "tongMienGiam",
            dh.phi_dich_vu AS "phiDichVu",
            dh.tong_thanh_toan AS "tongThanhToan",

            dh.ghi_chu AS "ghiChu",
            dh.ly_do_huy AS "lyDoHuy"

            ${
                kemMon
                    ? `, COALESCE(mon.items, '[]'::jsonb) AS "dsMon"`
                    : ''
            }

        FROM nv_don_hang dh

        LEFT JOIN dm_co_so cs
            ON cs.id = dh.co_so_id

        LEFT JOIN dm_nhan_vien nd
            ON nd.id = dh.nguoi_dat_id

        LEFT JOIN dm_nhan_vien nx
            ON nx.id = dh.nguoi_xu_ly_id

        LEFT JOIN dm_phong_ban pb
            ON pb.id = dh.phong_ban_id

        LEFT JOIN dm_khung_gio_nhan_hang kg
            ON kg.id = dh.khung_gio_nhan_id

        ${
            kemMon
                ? `
                    LEFT JOIN LATERAL (
                        SELECT JSONB_AGG(
                            JSONB_BUILD_OBJECT(
                                'chiTietId', ct.id,
                                'sanPhamId', ct.san_pham_id,
                                'maSanPham', ct.ma_san_pham_snapshot,
                                'tenSanPham', ct.ten_san_pham_snapshot,
                                'tenNhom', ct.ten_nhom_snapshot,
                                'donViTinh', ct.don_vi_snapshot,
                                'soLuong', ct.so_luong,
                                'donGia', ct.don_gia,
                                'tienGiam', ct.tien_giam,
                                'thanhTien', ct.thanh_tien,
                                'ghiChu', ct.ghi_chu,
                                'trangThai', ct.trang_thai
                            )
                            ORDER BY ct.id
                        ) AS items
                        FROM ct_don_hang ct
                        WHERE ct.don_hang_id = dh.id
                    ) mon ON TRUE
                `
                : ''
        }

        WHERE ${where}
    `;
}

function mapDon(row) {
    const result = chuyenSo(row, [
        'tamTinh',
        'tongMienGiam',
        'phiDichVu',
        'tongThanhToan'
    ]);

    return {
        ...result,

        trangThaiDonThongTin: enumItem(
            enums.trangThaiDonHang,
            row.trangThaiDon
        ),

        phuongThucThanhToanThongTin: enumItem(
            enums.phuongThucThanhToanDonHang,
            row.phuongThucThanhToan
        ),

        trangThaiThanhToanThongTin: enumItem(
            enums.trangThaiThanhToanDonHang,
            row.trangThaiThanhToan
        )
    };
}

async function xuatBaoCao({
    maBaoCao,
    tenBaoCao,
    filters,
    rows,
    tongHop,
    taiKhoanId
}) {
    const boLoc = { ...filters };

    for (const [field, items] of [
        ['trangThaiDon', enums.trangThaiDonHang],
        ['phuongThucThanhToan', enums.phuongThucThanhToanDonHang],
        ['trangThaiThanhToan', enums.trangThaiThanhToanDonHang]
    ]) {
        if (Array.isArray(filters[field])) {
            boLoc[`${field}ThongTin`] = filters[field]
                .map(value => enumItem(items, value))
                .filter(Boolean);
        }
    }

    const data = inBaoCaoService.normalizeReportData({
        maBaoCao,
        tenBaoCao,

        nhomBaoCao: enumItem(enums.nhomBaoCao, 40),

        boLoc,
        tongSoBanGhi: rows.length,
        tongHop,

        danhSach: rows.map((row, index) => ({
            stt: index + 1,
            ...row
        }))
    });

    return inBaoCaoService.taoBaoCao({
        maBaoCao,
        id: randomUUID(),
        soPhieu: null,
        data,
        nguoiInId: taiKhoanId
    });
}

module.exports = {
    Joi,
    enums,
    S,
    CT,
    DS_TRANG_THAI,
    TRANG_THAI_DANG_XU_LY,
    idArraySchema,
    enumArraySchema,
    enumItem,
    chuyenSo,
    congTong,
    taoSchema,
    loaiThoiGianSchema,
    trangThaiSchema,
    getTimeExpression,
    taoBoLoc,
    sqlChiTietDon,
    mapDon,
    xuatBaoCao
};