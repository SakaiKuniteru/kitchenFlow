"use strict";

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDirectory =
    path.join(
        process.cwd(),
        "src/public/uploads/nhan-vien"
    );

if (
    !fs.existsSync(
        uploadDirectory
    )
) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}

const storage =
    multer.diskStorage({

        destination(
            req,
            file,
            callback
        ) {

            callback(
                null,
                uploadDirectory
            );

        },

        filename(
            req,
            file,
            callback
        ) {

            const extension =
                path.extname(
                    file.originalname
                )
                .toLowerCase();

            const fileName =
                `${Date.now()}-${Math.round(
                    Math.random() * 1e9
                )}${extension}`;

            callback(
                null,
                fileName
            );

        }

    });

const fileFilter =
    (
        req,
        file,
        callback
    ) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (
            !allowedTypes.includes(
                file.mimetype
            )
        ) {

            return callback(
                new Error(
                    "Ảnh đại diện chỉ hỗ trợ JPG, PNG hoặc WEBP."
                )
            );

        }

        callback(
            null,
            true
        );

    };

const uploadNhanVien =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                5 * 1024 * 1024

        }

    });

module.exports =
    uploadNhanVien;