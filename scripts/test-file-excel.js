const ExcelJS =
    require("exceljs");


async function test() {

    const workbook =
        new ExcelJS.Workbook();

    await workbook.xlsx.readFile(
        "templates/dm_don_vi_tinh.xlsx"
    );

    console.log(
        workbook.worksheets.map(
            worksheet => ({
                id:
                    worksheet.id,

                name:
                    worksheet.name,

                rowCount:
                    worksheet.rowCount,

                columnCount:
                    worksheet.columnCount
            })
        )
    );

}


test()
    .catch(console.error);