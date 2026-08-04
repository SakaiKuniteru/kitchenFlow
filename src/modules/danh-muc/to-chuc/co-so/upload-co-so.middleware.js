const fs =
    require("fs");

const path =
    require("path");

const multer =
    require("multer");

const ApiError =
    require("../../../../utils/api-error");


const uploadDirectory =
    path.join(
        process.cwd(),
        "src/public/uploads/danh-muc/co-so"
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


const IMAGE_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".ico"
];


const IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/x-icon",
    "image/vnd.microsoft.icon"
];


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

            const baseName =
                path.basename(
                    file.originalname,
                    extension
                )
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    )
                    .replace(
                        /[^a-zA-Z0-9-_]/g,
                        "-"
                    )
                    .replace(
                        /-+/g,
                        "-"
                    )
                    .replace(
                        /^-|-$/g,
                        ""
                    );

            const fileName =
                `${Date.now()}-${baseName || "co-so"}${extension}`;

            callback(
                null,
                fileName
            );

        }

    });


function fileFilter(
    req,
    file,
    callback
) {

    const extension =
        path.extname(
            file.originalname
        )
            .toLowerCase();

    const extensionHopLe =
        IMAGE_EXTENSIONS.includes(
            extension
        );

    const mimeTypeHopLe =
        IMAGE_MIME_TYPES.includes(
            file.mimetype
        );

    if (
        !extensionHopLe ||
        !mimeTypeHopLe
    ) {

        return callback(
            new ApiError(
                400,
                "File ảnh không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG, WEBP hoặc ICO."
            )
        );

    }

    return callback(
        null,
        true
    );

}


const uploadCoSo =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                5 * 1024 * 1024,

            files:
                3

        }

    });


module.exports =
    uploadCoSo;