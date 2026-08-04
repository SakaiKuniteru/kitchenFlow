const ApiError =
    require("../../../../utils/api-error");

const monAnRepository =
    require("./mon-an.repository");

class MonAnService {

    parseId(id) {

        const monAnId =
            Number(id);

        if (
            !Number.isInteger(monAnId) ||
            monAnId <= 0
        ) {

            throw new ApiError(
                400,
                "ID món ăn không hợp lệ."
            );

        }

        return monAnId;

    }

    async getTongHop(query) {

        return await monAnRepository
            .getTongHop(query);

    }

    async getChiTiet(id) {

        const monAnId =
            this.parseId(id);

        const monAn =
            await monAnRepository
                .getChiTiet(monAnId);

        if (!monAn) {

            throw new ApiError(
                404,
                "Món ăn không tồn tại."
            );

        }

        return monAn;

    }

    async chuanHoaLienKet(data) {

        const duLieu = {
            ...data
        };

        if (duLieu.maNhomMonAn) {

            const nhomMonAn =
                await monAnRepository
                    .getNhomMonAnByMa(
                        duLieu.maNhomMonAn
                    );

            if (!nhomMonAn) {

                throw new ApiError(
                    400,
                    "Mã nhóm món ăn không tồn tại."
                );

            }

            if (!nhomMonAn.active) {

                throw new ApiError(
                    400,
                    "Nhóm món ăn đã bị khóa."
                );

            }

            if (
                duLieu.nhomMonAnId !== undefined &&
                duLieu.nhomMonAnId !== null &&
                Number(duLieu.nhomMonAnId) !==
                    Number(nhomMonAn.id)
            ) {

                throw new ApiError(
                    400,
                    "ID nhóm món ăn và mã nhóm món ăn không khớp."
                );

            }

            duLieu.nhomMonAnId =
                nhomMonAn.id;

        }

        if (
            duLieu.nhomMonAnId !== undefined &&
            duLieu.nhomMonAnId !== null
        ) {

            duLieu.nhomMonAnId =
                Number(duLieu.nhomMonAnId);

        }

        delete duLieu.maNhomMonAn;

        return duLieu;

    }

    async validateLienKet(data) {

        if (!data.nhomMonAnId) {

            throw new ApiError(
                400,
                "Nhóm món ăn là bắt buộc."
            );

        }

        if (
            !Number.isInteger(
                Number(data.nhomMonAnId)
            ) ||
            Number(data.nhomMonAnId) <= 0
        ) {

            throw new ApiError(
                400,
                "ID nhóm món ăn không hợp lệ."
            );

        }

        const nhomMonAnTonTai =
            await monAnRepository
                .existsNhomMonAn(
                    data.nhomMonAnId
                );

        if (!nhomMonAnTonTai) {

            throw new ApiError(
                400,
                "Nhóm món ăn không tồn tại hoặc đã bị khóa."
            );

        }

    }

    validateGiaTien(data) {

        if (
            data.giaTien !== undefined &&
            data.giaTien !== null
        ) {

            data.giaTien =
                Number(data.giaTien);

            if (
                !Number.isFinite(
                    data.giaTien
                )
            ) {

                throw new ApiError(
                    400,
                    "Giá tiền không hợp lệ."
                );

            }

            if (data.giaTien < 0) {

                throw new ApiError(
                    400,
                    "Giá tiền không được nhỏ hơn 0."
                );

            }

        }

        if (
            data.giaDuKien !== undefined &&
            data.giaDuKien !== null
        ) {

            data.giaDuKien =
                Number(data.giaDuKien);

            if (
                !Number.isFinite(
                    data.giaDuKien
                )
            ) {

                throw new ApiError(
                    400,
                    "Giá dự kiến không hợp lệ."
                );

            }

            if (data.giaDuKien < 0) {

                throw new ApiError(
                    400,
                    "Giá dự kiến không được nhỏ hơn 0."
                );

            }

        }

        const giaTien =
            data.giaTien;

        const giaDuKien =
            data.giaDuKien ?? 0;

        if (
            giaTien === null ||
            giaTien === undefined
        ) {

            if (giaDuKien > 0) {

                throw new ApiError(
                    400,
                    "Giá tiền là bắt buộc khi giá dự kiến lớn hơn 0."
                );

            }

            return;

        }

        if (giaTien < giaDuKien) {

            throw new ApiError(
                400,
                "Giá tiền phải lớn hơn hoặc bằng giá dự kiến."
            );

        }

    }

    validateCalories(data) {

        if (
            data.calories === undefined ||
            data.calories === null
        ) {
            return;
        }

        data.calories =
            Number(data.calories);

        if (
            !Number.isInteger(
                data.calories
            ) ||
            data.calories < 0
        ) {

            throw new ApiError(
                400,
                "Calories phải là số nguyên lớn hơn hoặc bằng 0."
            );

        }

    }

    async validateTrungDuLieu(
        data,
        excludeId = null
    ) {

        const trungMa =
            await monAnRepository
                .existsMaMonAn(
                    data.maMonAn,
                    excludeId
                );

        if (trungMa) {

            throw new ApiError(
                409,
                "Mã món ăn đã tồn tại."
            );

        }

        const trungTen =
            await monAnRepository
                .existsTenMonAn(
                    data.tenMonAn,
                    data.nhomMonAnId,
                    excludeId
                );

        if (trungTen) {

            throw new ApiError(
                409,
                "Tên món ăn đã tồn tại trong nhóm món ăn này."
            );

        }

    }

    async create(data) {

        const duLieu =
            await this.chuanHoaLienKet(
                data
            );

        await this.validateLienKet(
            duLieu
        );

        this.validateGiaTien(
            duLieu
        );

        this.validateCalories(
            duLieu
        );

        await this.validateTrungDuLieu(
            duLieu
        );

        const duLieuTao = {

            ...duLieu,

            maMonAn:
                duLieu.maMonAn.trim(),

            tenMonAn:
                duLieu.tenMonAn.trim(),

            giaTien:
                duLieu.giaTien !== undefined
                    ? duLieu.giaTien
                    : null,

            giaDuKien:
                duLieu.giaDuKien !== undefined
                    ? duLieu.giaDuKien
                    : 0,

            calories:
                duLieu.calories !== undefined
                    ? duLieu.calories
                    : null,

            moTa:
                duLieu.moTa?.trim() || null,

            hinhAnh:
                duLieu.hinhAnh?.trim() || null,

            active:
                duLieu.active !== undefined
                    ? duLieu.active
                    : true

        };

        return await monAnRepository
            .create(duLieuTao);

    }

    async update(id, data) {

        const monAnId =
            this.parseId(id);

        const monAn =
            await monAnRepository
                .getChiTiet(monAnId);

        if (!monAn) {

            throw new ApiError(
                404,
                "Món ăn không tồn tại."
            );

        }

        const duLieuCapNhat = {

            maMonAn:
                data.maMonAn !== undefined
                    ? data.maMonAn.trim()
                    : monAn.maMonAn,

            tenMonAn:
                data.tenMonAn !== undefined
                    ? data.tenMonAn.trim()
                    : monAn.tenMonAn,

            nhomMonAnId:
                data.nhomMonAnId !== undefined
                    ? data.nhomMonAnId
                    : monAn.nhomMonAnId,

            maNhomMonAn:
                data.maNhomMonAn !== undefined
                    ? (
                        data.maNhomMonAn === null
                            ? null
                            : data.maNhomMonAn
                                .trim() || null
                    )
                    : undefined,

            giaTien:
                data.giaTien !== undefined
                    ? data.giaTien
                    : monAn.giaTien,

            giaDuKien:
                data.giaDuKien !== undefined
                    ? data.giaDuKien
                    : monAn.giaDuKien,

            calories:
                data.calories !== undefined
                    ? data.calories
                    : monAn.calories,

            moTa:
                data.moTa !== undefined
                    ? (
                        data.moTa === null
                            ? null
                            : data.moTa.trim() || null
                    )
                    : monAn.moTa,

            hinhAnh:
                data.hinhAnh !== undefined
                    ? (
                        data.hinhAnh === null
                            ? null
                            : data.hinhAnh.trim() || null
                    )
                    : monAn.hinhAnh,

            active:
                data.active !== undefined
                    ? data.active
                    : monAn.active

        };

        const duLieuDaChuanHoa =
            await this.chuanHoaLienKet(
                duLieuCapNhat
            );

        await this.validateLienKet(
            duLieuDaChuanHoa
        );

        this.validateGiaTien(
            duLieuDaChuanHoa
        );

        this.validateCalories(
            duLieuDaChuanHoa
        );

        await this.validateTrungDuLieu(
            duLieuDaChuanHoa,
            monAnId
        );

        const ketQua =
            await monAnRepository
                .update(
                    monAnId,
                    duLieuDaChuanHoa
                );

        if (!ketQua) {

            throw new ApiError(
                404,
                "Món ăn không tồn tại."
            );

        }

        return ketQua;

    }

}

module.exports =
    new MonAnService();