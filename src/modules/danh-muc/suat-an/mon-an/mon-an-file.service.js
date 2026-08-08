const fs =
    require("fs");

const path =
    require("path");


class MonAnFileService {


    getRootDirectory() {

        return path.join(
            process.cwd(),
            "src/public/uploads/danh-muc/mon-an"
        );

    }


    normalizeText(
        value
    ) {

        return String(
            value || ""
        )
            .trim()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /đ/g,
                "d"
            )
            .replace(
                /Đ/g,
                "D"
            )
            .replace(
                /[^a-zA-Z0-9]+/g,
                "-"
            )
            .replace(
                /-+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            )
            .toLowerCase();

    }


    normalizeMaMonAn(
        maMonAn
    ) {

        return String(
            maMonAn
        )
            .trim()
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
            )
            .toUpperCase();

    }


    getMonAnDirectory(
        maMonAn
    ) {

        return path.join(
            this.getRootDirectory(),
            this.normalizeMaMonAn(
                maMonAn
            )
        );

    }


    ensureDirectory(
        maMonAn
    ) {

        const directory =
            this.getMonAnDirectory(
                maMonAn
            );


        if (
            !fs.existsSync(
                directory
            )
        ) {

            fs.mkdirSync(
                directory,
                {
                    recursive: true
                }
            );

        }


        return directory;

    }


    getDanhSachAnh(
        maMonAn
    ) {

        const directory =
            this.ensureDirectory(
                maMonAn
            );


        return fs
            .readdirSync(
                directory
            )
            .map(
                fileName => {

                    const fullPath =
                        path.join(
                            directory,
                            fileName
                        );


                    const stat =
                        fs.statSync(
                            fullPath
                        );


                    const match =
                        fileName.match(
                            /-(\d)\.(jpg|jpeg|png|webp)$/i
                        );


                    if (!match) {
                        return null;
                    }


                    return {

                        fileName,

                        version:
                            Number(
                                match[1]
                            ),

                        fullPath,

                        modifiedTime:
                            stat.mtimeMs

                    };

                }
            )
            .filter(
                Boolean
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.modifiedTime -
                    b.modifiedTime
            );

    }


    getNextVersion(
        maMonAn
    ) {

        const danhSach =
            this.getDanhSachAnh(
                maMonAn
            );


        if (
            danhSach.length === 0
        ) {

            return 1;

        }


        const fileMoiNhat =
            danhSach[
                danhSach.length - 1
            ];


        return fileMoiNhat.version >= 9
            ? 1
            : fileMoiNhat.version + 1;

    }


    async saveFile(
        maMonAn,
        tenMonAn,
        file
    ) {

        if (!file) {
            return null;
        }


        const directory =
            this.ensureDirectory(
                maMonAn
            );


        const version =
            this.getNextVersion(
                maMonAn
            );


        const extension =
            path.extname(
                file.originalname
            )
                .toLowerCase();


        const tenMonAnFile =
            this.normalizeText(
                tenMonAn
            ) || "mon-an";


        const maMonAnFile =
            this.normalizeText(
                maMonAn
            ) || "ma";


        const fileName =
            `${tenMonAnFile}-${maMonAnFile}-${version}${extension}`;


        const destination =
            path.join(
                directory,
                fileName
            );


        /*
         * Khi quay 9 -> 1,
         * nếu file đích tồn tại thì xóa trước.
         */
        if (
            fs.existsSync(
                destination
            )
        ) {

            await fs.promises.unlink(
                destination
            );

        }


        await fs.promises.rename(
            file.path,
            destination
        );


        return {

            version,

            fileName,

            fullPath:
                destination,

            relativePath:
                path.posix.join(
                    "uploads",
                    "danh-muc",
                    "mon-an",
                    this.normalizeMaMonAn(
                        maMonAn
                    ),
                    fileName
                )

        };

    }


    async cleanupOldFiles(
        maMonAn,
        maxFiles = 3
    ) {

        const danhSach =
            this.getDanhSachAnh(
                maMonAn
            );


        if (
            danhSach.length <=
            maxFiles
        ) {

            return;

        }


        const danhSachCanXoa =
            danhSach.slice(
                0,
                danhSach.length -
                maxFiles
            );


        for (
            const file of
            danhSachCanXoa
        ) {

            try {

                await fs.promises.unlink(
                    file.fullPath
                );

            } catch (error) {

                if (
                    error.code !==
                    "ENOENT"
                ) {

                    throw error;

                }

            }

        }

    }


    async deletePhysicalFile(
        fullPath
    ) {

        if (!fullPath) {
            return;
        }


        try {

            await fs.promises.unlink(
                fullPath
            );

        } catch (error) {

            if (
                error.code !==
                "ENOENT"
            ) {

                throw error;

            }

        }

    }


    async deleteTempFile(
        file
    ) {

        if (
            !file?.path
        ) {
            return;
        }


        await this.deletePhysicalFile(
            file.path
        );

    }


    async renameMonAnDirectory(
        maMonAnCu,
        maMonAnMoi
    ) {

        const maCu =
            this.normalizeMaMonAn(
                maMonAnCu
            );


        const maMoi =
            this.normalizeMaMonAn(
                maMonAnMoi
            );


        if (
            maCu === maMoi
        ) {
            return;
        }


        const oldDirectory =
            path.join(
                this.getRootDirectory(),
                maCu
            );


        const newDirectory =
            path.join(
                this.getRootDirectory(),
                maMoi
            );


        if (
            !fs.existsSync(
                oldDirectory
            )
        ) {
            return;
        }


        if (
            fs.existsSync(
                newDirectory
            )
        ) {

            throw new Error(
                `Thư mục ảnh món ăn "${maMoi}" đã tồn tại.`
            );

        }


        await fs.promises.rename(
            oldDirectory,
            newDirectory
        );

    }


    replaceMaMonAnInPath(
        filePath,
        maMonAnCu,
        maMonAnMoi
    ) {

        if (!filePath) {
            return filePath;
        }


        const maCu =
            this.normalizeMaMonAn(
                maMonAnCu
            );


        const maMoi =
            this.normalizeMaMonAn(
                maMonAnMoi
            );


        return String(
            filePath
        ).replace(
            `/mon-an/${maCu}/`,
            `/mon-an/${maMoi}/`
        );

    }

}


module.exports =
    new MonAnFileService();