"use strict";

const chucVuExport =
    require("./tai-khoan.export");

const chucVuImport =
    require("./tai-khoan.import");


module.exports = {
    exportData: chucVuExport.exportData,
    importData: chucVuImport.importData
};