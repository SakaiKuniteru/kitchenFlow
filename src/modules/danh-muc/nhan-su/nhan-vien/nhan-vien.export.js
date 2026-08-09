"use strict";

const nhanVienRepository = require("./nhan-vien.repository");

const {
    createExportFile
} = require("../../../../helpers/excel/excel-export");

const {
    sendExcel
} = require("../../../../helpers/excel/excel-response");

const MA_BAO_CAO = "dm_nhan_vien";

const HEADER_ROW = 3;
const TEMPLATE_ROW = 5;
const DATA_START_ROW = 5;


function taoDongExport(item) {

    return {
        id: item.id,
        maNhanVien: item.maNhanVien,
        hoTen: item.hoTen,

        ngaySinh: item.ngaySinh,
        gioiTinh: item.gioiTinh,
        soDienThoai: item.soDienThoai,
        email: item.email,
        diaChi: item.diaChi,

        quocGiaId: item.quocGiaId,
        maQuocGia: item.quocGia?.ma,

        tinhThanhId: item.tinhThanhId,
        maTinhThanh: item.tinhThanh?.ma,

        xaPhuongId: item.xaPhuongId,
        maXaPhuong: item.xaPhuong?.ma,

        coSoId: item.coSoId,
        maCoSo: item.coSo?.ma,

        phongBanId: item.phongBanId,
        maPhongBan: item.phongBan?.ma,

        chucVuId: item.chucVuId,
        maChucVu: item.chucVu?.ma,

        ghiChu: item.ghiChu,
        maThe: item.maThe,
        maQr: item.maQr,
        maBarcode: item.maBarcode,

        active: item.active
    };

}


async function xuLyExport(query = {}) {

    const danhSach =
        await nhanVienRepository.getTongHop(
            query
        );

    const data =
        danhSach.map(
            item => taoDongExport(item)
        );

    return await createExportFile({
        maBaoCao: MA_BAO_CAO,
        headerRowNumber: HEADER_ROW,
        templateRowNumber: TEMPLATE_ROW,
        dataStartRowNumber: DATA_START_ROW,
        data
    });

}


async function exportData(
    req,
    res,
    next
) {

    try {

        const result =
            await xuLyExport(
                req.query
            );

        return sendExcel(
            res,
            result
        );

    } catch (error) {

        next(error);

    }

}


module.exports = {
    exportData,
    xuLyExport,
    taoDongExport
};