async function createErrorFile(
    workbook,
    worksheet,
    errors,
    fileName,
    options = {}
) {

    const {
        headerRowNumber = 1
    } = options;


    const errorColumn =
        worksheet.columnCount + 1;


    worksheet
        .getRow(
            headerRowNumber
        )
        .getCell(
            errorColumn
        )
        .value =
        "baoLoi";


    for (
        const error of
        errors
    ) {

        for (
            const rowNumber of
            error.rowNumbers
        ) {

            worksheet
                .getRow(
                    rowNumber
                )
                .getCell(
                    errorColumn
                )
                .value =
                error.message;

        }

    }


    const buffer =
        await workbook.xlsx
            .writeBuffer();


    return {

        coLoi:
            true,

        fileName,

        buffer

    };

}


module.exports = {

    createErrorFile

};