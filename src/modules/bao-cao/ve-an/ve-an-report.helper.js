'use strict';

const Joi = require('joi');
const { randomUUID } = require('crypto');

const enums = require('../../../constants/enums');

const inBaoCaoService = require(
    '../../../services/in-bao-cao/in-bao-cao.service'
);

function idArraySchema() {
    return Joi.array()
        .items(
            Joi.number()
                .integer()
                .positive()
                .max(Number.MAX_SAFE_INTEGER)
        )
        .single()
        .unique()
        .default([]);
}

function enumArraySchema(items) {
    return Joi.array()
        .items(
            Joi.number()
                .integer()
                .valid(...items.map(item => Number(item.value)))
        )
        .single()
        .unique()
        .default([]);
}

function ngaySchema() {
    return Joi.string()
        .pattern(/^(?!0000)\d{4}-\d{2}-\d{2}$/)
        .custom((value, helpers) => {
            const date = new Date(`${value}T00:00:00Z`);

            if (
                Number.isNaN(date.getTime()) ||
                date.toISOString().slice(0, 10) !== value
            ) {
                return helpers.message({
                    custom: 'Ngày không hợp lệ.'
                });
            }

            return value;
        });
}

function taoSchema(fields = {}) {
    return Joi.object({
        tuNgay: ngaySchema().required(),
        denNgay: ngaySchema().required(),

        coSoIds: idArraySchema(),
        nhaAnIds: idArraySchema(),
        caAnIds: idArraySchema(),

        ...fields
    })
        .unknown(false)
        .custom((value, helpers) => {
            if (value.denNgay < value.tuNgay) {
                return helpers.message({
                    custom: 'Đến ngày phải lớn hơn hoặc bằng từ ngày.'
                });
            }

            return value;
        });
}

function enumItem(items, value) {
    if (value === null || value === undefined) {
        return null;
    }

    return items.find(
        item => Number(item.value) === Number(value)
    ) || null;
}

/*
 * timeExpression và chế độ lọc chỉ truyền từ code nội bộ.
 * Không truyền trực tiếp tên cột nhận từ request.
 */
function taoBoLoc(
    filters,
    timeExpression,
    { locTheoPhieu = false } = {}
) {
    const values = [filters.tuNgay, filters.denNgay];

    /*
     * Khoảng nửa mở:
     * từ đầu ngày tuNgay đến trước đầu ngày sau denNgay.
     * Không mất dữ liệu cuối ngày có phần microsecond.
     */
    const conditions = [
        `${timeExpression} >= $1::date`,
        `${timeExpression} < ($2::date + INTERVAL '1 day')`
    ];

    const addArray = (expression, items, type = 'bigint') => {
        if (!Array.isArray(items) || items.length === 0) {
            return;
        }

        values.push(items);

        conditions.push(
            `${expression} = ANY($${values.length}::${type}[])`
        );
    };

    addArray('td.co_so_id', filters.coSoIds);
    addArray('td.nha_an_id', filters.nhaAnIds);
    addArray('td.ca_an_id', filters.caAnIds);

    addArray(
        'p.doi_tuong_lay_ve',
        filters.loaiVe,
        'integer'
    );

    addArray('p.nhan_vien_id', filters.nhanVienIds);
    addArray('nv.phong_ban_id', filters.phongBanIds);

    addArray(
        'p.trang_thai',
        filters.trangThaiThanhToan,
        'integer'
    );

    if (filters.trangThaiVe?.length) {
        if (locTheoPhieu) {
            values.push(filters.trangThaiVe);

            conditions.push(`
                EXISTS (
                    SELECT 1
                    FROM ct_ve_an vf
                    WHERE vf.phieu_lay_ve_id = p.id
                      AND vf.trang_thai =
                          ANY($${values.length}::integer[])
                )
            `);
        } else {
            addArray(
                'v.trang_thai',
                filters.trangThaiVe,
                'integer'
            );
        }
    }

    /*
     * Tìm theo chuỗi literal, không coi % và _ là wildcard.
     */
    if (filters.maVe) {
        values.push(filters.maVe);

        conditions.push(`
            POSITION(
                LOWER($${values.length}::text)
                IN LOWER(COALESCE(v.ma_ve, ''))
            ) > 0
        `);
    }

    if (filters.soPhieu) {
        values.push(filters.soPhieu);

        conditions.push(`
            POSITION(
                LOWER($${values.length}::text)
                IN LOWER(COALESCE(p.so_phieu, ''))
            ) > 0
        `);
    }

    return {
        values,
        where: conditions.join('\nAND ')
    };
}

function chuyenSo(row, fields) {
    const result = { ...row };

    for (const field of fields) {
        result[field] = Number(row[field] ?? 0);
    }

    return result;
}

function congTong(rows, fields) {
    return Object.fromEntries(
        fields.map(field => [
            field,
            rows.reduce(
                (sum, row) => sum + Number(row[field] ?? 0),
                0
            )
        ])
    );
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

    const mappings = [
        ['loaiVe', enums.doiTuongLayVe],
        ['trangThaiVe', enums.trangThaiVe],
        ['trangThaiThanhToan', enums.trangThaiPhieuThu]
    ];

    for (const [field, items] of mappings) {
        if (Array.isArray(filters[field])) {
            boLoc[`${field}ThongTin`] = filters[field]
                .map(value => enumItem(items, value))
                .filter(Boolean);
        }
    }

    const data = inBaoCaoService.normalizeReportData({
        maBaoCao,
        tenBaoCao,

        nhomBaoCao: enumItem(enums.nhomBaoCao, 20),

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
    idArraySchema,
    enumArraySchema,
    taoSchema,
    enumItem,
    taoBoLoc,
    chuyenSo,
    congTong,
    xuatBaoCao
};