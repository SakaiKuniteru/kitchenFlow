const {
    loaiKho:
        dsLoaiKho
} = require(
    "../../../../constants/enums"
);

const ApiError =
    require("../../../../utils/api-error");

const khoRepository =
    require("./kho.repository");


class KhoService {

    parseId(id) {

        const khoId =
            Number(id);

        if (
            !Number.isInteger(khoId) ||
            khoId <= 0
        ) {

            throw new ApiError(
                400,
                "ID kho không hợp lệ."
            );

        }

        return khoId;

    }


    async getTongHop(query) {

        return await khoRepository
            .getTongHop(query);

    }


    async getChiTiet(id) {

        const khoId =
            this.parseId(id);

        const kho =
            await khoRepository
                .getChiTiet(
                    khoId
                );

        if (!kho) {

            throw new ApiError(
                404,
                "Kho không tồn tại."
            );

        }

        return kho;

    }


    async chuanHoaLienKet(data) {

        const duLieu = {
            ...data
        };

        if (duLieu.maNhaAn) {

            const nhaAn =
                await khoRepository
                    .getNhaAnByMa(
                        duLieu.maNhaAn
                    );

            if (!nhaAn) {

                throw new ApiError(
                    400,
                    "Mã nhà ăn không tồn tại."
                );

            }

            if (!nhaAn.active) {

                throw new ApiError(
                    400,
                    "Nhà ăn đã bị khóa."
                );

            }

            if (
                duLieu.nhaAnId !== undefined &&
                duLieu.nhaAnId !== null &&
                Number(duLieu.nhaAnId) !==
                    Number(nhaAn.id)
            ) {

                throw new ApiError(
                    400,
                    "ID nhà ăn và mã nhà ăn không khớp."
                );

            }

            duLieu.nhaAnId =
                nhaAn.id;

        }

        if (
            duLieu.nhaAnId !== undefined &&
            duLieu.nhaAnId !== null
        ) {

            duLieu.nhaAnId =
                Number(
                    duLieu.nhaAnId
                );

        }

        delete duLieu.maNhaAn;

        return duLieu;

    }


    async validateLienKet(data) {

        if (!data.nhaAnId) {

            throw new ApiError(
                400,
                "Nhà ăn là bắt buộc."
            );

        }

        if (
            !Number.isInteger(
                Number(data.nhaAnId)
            ) ||
            Number(data.nhaAnId) <= 0
        ) {

            throw new ApiError(
                400,
                "ID nhà ăn không hợp lệ."
            );

        }

        const nhaAnTonTai =
            await khoRepository
                .existsNhaAn(
                    data.nhaAnId
                );

        if (!nhaAnTonTai) {

            throw new ApiError(
                400,
                "Nhà ăn không tồn tại hoặc đã bị khóa."
            );

        }

    }


    validateLoaiKho(
        loaiKho
    ) {

        const giaTriSo =
            Number(
                loaiKho
            );

        const hopLe =
            dsLoaiKho.some(
                item =>
                    Number(item.value) ===
                    giaTriSo
            );

        if (!hopLe) {

            throw new ApiError(
                400,
                "Loại kho không hợp lệ."
            );

        }

        return giaTriSo;

    }


    validateNhietDo(
        nhietDoToiThieu,
        nhietDoToiDa
    ) {

        if (
            nhietDoToiThieu === undefined ||
            nhietDoToiThieu === null ||
            nhietDoToiDa === undefined ||
            nhietDoToiDa === null
        ) {
            return;
        }

        const nhietDoMin =
            Number(
                nhietDoToiThieu
            );

        const nhietDoMax =
            Number(
                nhietDoToiDa
            );

        if (
            !Number.isFinite(nhietDoMin) ||
            !Number.isFinite(nhietDoMax)
        ) {

            throw new ApiError(
                400,
                "Nhiệt độ kho không hợp lệ."
            );

        }

        if (
            nhietDoMin >= nhietDoMax
        ) {

            throw new ApiError(
                400,
                "Nhiệt độ tối thiểu phải nhỏ hơn nhiệt độ tối đa."
            );

        }

    }


    async validateTrungDuLieu(
        data,
        excludeId = null
    ) {

        const trungMa =
            await khoRepository
                .existsMaKho(
                    data.maKho,
                    excludeId
                );

        if (trungMa) {

            throw new ApiError(
                409,
                "Mã kho đã tồn tại."
            );

        }

        const trungTen =
            await khoRepository
                .existsTenKho(
                    data.tenKho,
                    excludeId
                );

        if (trungTen) {

            throw new ApiError(
                409,
                "Tên kho đã tồn tại."
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

        const loaiKho =
            this.validateLoaiKho(
                duLieu.loaiKho
            );

        this.validateNhietDo(
            duLieu.nhietDoToiThieu,
            duLieu.nhietDoToiDa
        );

        await this.validateTrungDuLieu(
            duLieu
        );

        const duLieuTao = {

            ...duLieu,

            maKho:
                duLieu.maKho.trim(),

            tenKho:
                duLieu.tenKho.trim(),

            loaiKho,

            diaDiem:
                duLieu.diaDiem
                    ?.trim() ||
                null,

            nhietDoToiThieu:
                duLieu.nhietDoToiThieu !==
                    undefined
                    ? Number(
                        duLieu
                            .nhietDoToiThieu
                    )
                    : null,

            nhietDoToiDa:
                duLieu.nhietDoToiDa !==
                    undefined
                    ? Number(
                        duLieu
                            .nhietDoToiDa
                    )
                    : null,

            moTa:
                duLieu.moTa
                    ?.trim() ||
                null,

            active:
                duLieu.active !== undefined
                    ? duLieu.active
                    : true

        };

        return await khoRepository
            .create(
                duLieuTao
            );

    }


    async update(
        id,
        data
    ) {

        const khoId =
            this.parseId(id);

        const kho =
            await khoRepository
                .getChiTiet(
                    khoId
                );

        if (!kho) {

            throw new ApiError(
                404,
                "Kho không tồn tại."
            );

        }

        const duLieuCapNhat = {

            maKho:
                data.maKho !== undefined
                    ? data.maKho.trim()
                    : kho.maKho,

            tenKho:
                data.tenKho !== undefined
                    ? data.tenKho.trim()
                    : kho.tenKho,

            nhaAnId:
                data.nhaAnId !== undefined
                    ? data.nhaAnId
                    : kho.nhaAnId,

            maNhaAn:
                data.maNhaAn !== undefined
                    ? (
                        data.maNhaAn === null
                            ? null
                            : data.maNhaAn
                                .trim() ||
                                null
                    )
                    : undefined,

            loaiKho:
                data.loaiKho !== undefined
                    ? data.loaiKho
                    : kho.loaiKho,

            diaDiem:
                data.diaDiem !== undefined
                    ? (
                        data.diaDiem === null
                            ? null
                            : data.diaDiem
                                .trim() ||
                                null
                    )
                    : kho.diaDiem,

            nhietDoToiThieu:
                data.nhietDoToiThieu !==
                    undefined
                    ? data.nhietDoToiThieu
                    : kho.nhietDoToiThieu,

            nhietDoToiDa:
                data.nhietDoToiDa !==
                    undefined
                    ? data.nhietDoToiDa
                    : kho.nhietDoToiDa,

            moTa:
                data.moTa !== undefined
                    ? (
                        data.moTa === null
                            ? null
                            : data.moTa
                                .trim() ||
                                null
                    )
                    : kho.moTa,

            active:
                data.active !== undefined
                    ? data.active
                    : kho.active

        };

        const duLieuDaChuanHoa =
            await this.chuanHoaLienKet(
                duLieuCapNhat
            );

        await this.validateLienKet(
            duLieuDaChuanHoa
        );

        duLieuDaChuanHoa.loaiKho =
            this.validateLoaiKho(
                duLieuDaChuanHoa
                    .loaiKho
            );

        this.validateNhietDo(
            duLieuDaChuanHoa
                .nhietDoToiThieu,
            duLieuDaChuanHoa
                .nhietDoToiDa
        );

        if (
            duLieuDaChuanHoa
                .nhietDoToiThieu !== null
        ) {

            duLieuDaChuanHoa
                .nhietDoToiThieu =
                Number(
                    duLieuDaChuanHoa
                        .nhietDoToiThieu
                );

        }

        if (
            duLieuDaChuanHoa
                .nhietDoToiDa !== null
        ) {

            duLieuDaChuanHoa
                .nhietDoToiDa =
                Number(
                    duLieuDaChuanHoa
                        .nhietDoToiDa
                );

        }

        await this.validateTrungDuLieu(
            duLieuDaChuanHoa,
            khoId
        );

        const ketQua =
            await khoRepository
                .update(
                    khoId,
                    duLieuDaChuanHoa
                );

        if (!ketQua) {

            throw new ApiError(
                404,
                "Kho không tồn tại."
            );

        }

        return ketQua;

    }

}


module.exports =
    new KhoService();