const ExcelJS =
    require(
        "exceljs"
    );

const ApiError =
    require(
        "../../utils/api-error"
    );

const {
    getCellValue
} = require(
    "./excel-value"
);


async function readExcel(
    file,
    options = {}
) {

    const {
        headerRowNumber = 1
    } = options;


    if (
        !file ||
        !file.buffer
    ) {

        throw new ApiError(
            400,
            "Vui lòng chọn file Excel để import."
        );

    }


    const workbook =
        new ExcelJS.Workbook();


    try {

        await workbook.xlsx.load(
            file.buffer
        );

    } catch (error) {

        throw new ApiError(
            400,
            "Không thể đọc file Excel."
        );

    }


    const worksheet =
        workbook.worksheets[0];


    if (!worksheet) {

        throw new ApiError(
            400,
            "File Excel không có sheet dữ liệu."
        );

    }


    const headerMap =
        new Map();


    worksheet
        .getRow(
            headerRowNumber
        )
        .eachCell(
            (
                cell,
                columnNumber
            ) => {

                const header =
                    String(
                        getCellValue(
                            cell.value
                        ) || ""
                    )
                        .trim();


                if (header) {

                    headerMap.set(
                        header,
                        columnNumber
                    );

                }

            }
        );


    function getValue(
        row,
        field
    ) {

        const column =
            headerMap.get(
                field
            );


        if (!column) {

            return null;

        }


        return getCellValue(
            row
                .getCell(
                    column
                )
                .value
        );

    }


    return {

        workbook,

        worksheet,

        headerMap,

        getValue

    };

}


module.exports = {

    readExcel

};