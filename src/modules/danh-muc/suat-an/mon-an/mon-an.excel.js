"use strict";

const {
    sendExcel
} = require(
    "../../../../helpers/excel/excel-result"
);

const {
    exportMonAn
} = require(
    "./mon-an.export"
);

const {
    importMonAn
} = require(
    "./mon-an.import"
);


class MonAnExcel {

    exportData =
        async (
            req,
            res,
            next
        ) => {

            try {

                const result =
                    await exportMonAn(
                        req.query
                    );


                return sendExcel(
                    res,
                    result
                );

            } catch (error) {

                next(
                    error
                );

            }

        };


    importData =
        async (
            req,
            res,
            next
        ) => {

            try {

                const result =
                    await importMonAn(
                        req.file
                    );


                return sendExcel(
                    res,
                    result
                );

            } catch (error) {

                next(
                    error
                );

            }

        };

}


module.exports =
    new MonAnExcel();