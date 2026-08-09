"use strict";

const taiKhoanRepository = require("./tai-khoan.repository");

const {
    createExportFile
} = require("../../../../helpers/excel/excel-export");

const {
    sendExcel
} = require("../../../../helpers/excel/excel-response");


const MA_BAO_CAO = "dm_tai_khoan";

const HEADER_ROW = 3;

const TEMPLATE_ROW = 5;

const DATA_START_ROW = 5;


function taoDongExport(item) {

    return {

        id: item.id,

        tenDangNhap: item.tenDangNhap,

        nhanVienId: item.nhanVienId,

        maNhanVien: item.nhanVien?.maNhanVien,

        hoTen: item.nhanVien?.hoTen,

        maCoSo: item.nhanVien?.coSo?.maCoSo,

        maPhongBan: item.nhanVien?.phongBan?.maPhongBan,

        maChucVu: item.nhanVien?.chucVu?.maChucVu,

        dsVaiTroId: Array.isArray(item.dsVaiTroId)
            ? JSON.stringify(item.dsVaiTroId)
            : "[]",
        
        dsMaVaiTro: Array.isArray(item.dsMaVaiTro)
            ? JSON.stringify(item.dsMaVaiTro)
            : "[]",

        dsQuyenId: Array.isArray(item.dsQuyenId)
            ? JSON.stringify(item.dsQuyenId)
            : "[]",
        
        dsMaQuyen: Array.isArray(item.dsMaQuyen)
            ? JSON.stringify(item.dsMaQuyen)
            : "[]",

        soLanDangNhapSai: item.soLanDangNhapSai,

        khoaDen: item.khoaDen,

        lanDangNhapCuoi: item.lanDangNhapCuoi,

        doiMatKhauLanCuoi: item.doiMatKhauLanCuoi,

        doiMatKhauLanDau: item.doiMatKhauLanDau,

        active: item.active

    };

}


async function xuLyExport(query = {}) {

    const danhSach =
        await taiKhoanRepository.getTongHop(
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