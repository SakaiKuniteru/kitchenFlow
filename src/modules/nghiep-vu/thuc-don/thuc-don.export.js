"use strict";

const thucDonRepository = require("./thuc-don.repository");

const { createExportFile } = require("../../../helpers/excel/excel-export");

const { sendExcel } = require("../../../helpers/excel/excel-response");


const MA_BAO_CAO = "thuc_don";

const HEADER_ROW = 3;

const TEMPLATE_ROW = 5;

const DATA_START_ROW = 5;


function taoDongExport(item) {

    return {

        id: item.id,

        maThucDon: item.maThucDon,

        tenThucDon: item.tenThucDon,

        loaiThucDon: item.loaiThucDon,

        tuNgay: item.tuNgay,

        denNgay: item.denNgay,

        coSoId: item.coSoId,

        maCoSo: item.coSo?.maCoSo,

        nhaAnId: item.nhaAnId,

        maNhaAn: item.nhaAn?.maNhaAn,

        caAnId: item.caAnId,

        maCaAn: item.caAn?.maCaAn,

        trangThai: item.trangThai,

        moTa: item.moTa,

        active: item.active

    };

}


async function xuLyExport(query = {}) {

    const danhSach =
        await thucDonRepository.getTongHop(
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