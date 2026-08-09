"use strict";

const chucVuExport =
    require("./nhan-vien.export");

const chucVuImport =
    require("./nhan-vien.import");


module.exports = {
    exportData: chucVuExport.exportData,
    importData: chucVuImport.importData
};