const ApiError =
    require("../../utils/api-error");

const thietLapRepository =
    require("./thiet-lap.repository");

class ThietLapService {

    parseId(id) {

        const thietLapId =
            Number(id);

        if (
            !Number.isInteger(thietLapId) ||
            thietLapId <= 0
        ) {

            throw new ApiError(
                400,
                "ID thiết lập không hợp lệ."
            );

        }

        return thietLapId;

    }

    async getTongHop(query) {

        return await thietLapRepository
            .getTongHop(query);

    }

    async getChiTiet(id) {

        const thietLapId =
            this.parseId(id);

        const thietLap =
            await thietLapRepository
                .getChiTiet(thietLapId);

        if (!thietLap) {

            throw new ApiError(
                404,
                "Thiết lập không tồn tại."
            );

        }

        return thietLap;

    }

    async getGiaTriTheoMa(maThietLap) {

        if (
            typeof maThietLap !== "string" ||
            !maThietLap.trim()
        ) {

            throw new ApiError(
                400,
                "Mã thiết lập không hợp lệ."
            );

        }

        const giaTri =
            await thietLapRepository
                .getGiaTriTheoMa(
                    maThietLap
                        .trim()
                        .toUpperCase()
                );

        if (giaTri === null) {

            throw new ApiError(
                404,
                "Thiết lập không tồn tại hoặc đã bị khóa."
            );

        }

        return giaTri;

    }

    async getGiaTriTheoId(maThietLap) {

        if (
            typeof maThietLap !== "string" ||
            !maThietLap.trim()
        ) {

            throw new ApiError(
                400,
                "Mã thiết lập không hợp lệ."
            );

        }

        const thietLap =
            await thietLapRepository
                .getGiaTriTheoId(
                    maThietLap
                        .trim()
                        .toUpperCase()
                );

        if (!thietLap) {

            throw new ApiError(
                404,
                "Thiết lập không tồn tại hoặc đã bị khóa."
            );

        }

        return thietLap;

    }

    async getByGroup(nhom) {

        if (
            typeof nhom !== "string" ||
            !nhom.trim()
        ) {

            throw new ApiError(
                400,
                "Mã nhóm tính năng không hợp lệ."
            );

        }

        return await thietLapRepository
            .getByGroup(
                nhom
                    .trim()
                    .toUpperCase()
            );

    }

    async chuanHoaLienKet(data) {

        const duLieu = {
            ...data
        };

        if (
            Array.isArray(
                duLieu.dsMaNhomTinhNang
            )
        ) {

            const danhSachMa = [
                ...new Set(
                    duLieu.dsMaNhomTinhNang
                        .map(
                            ma =>
                                String(ma)
                                    .trim()
                                    .toUpperCase()
                        )
                        .filter(Boolean)
                )
            ];

            if (danhSachMa.length === 0) {

                throw new ApiError(
                    400,
                    "Danh sách mã nhóm tính năng không được để trống."
                );

            }

            const danhSachNhom =
                await thietLapRepository
                    .getDsNhomTinhNangByMas(
                        danhSachMa
                    );

            if (
                danhSachNhom.length !==
                danhSachMa.length
            ) {

                const maTimThay =
                    danhSachNhom.map(
                        item =>
                            item.maNhomTinhNang
                                .toUpperCase()
                    );

                const maKhongTonTai =
                    danhSachMa.filter(
                        ma =>
                            !maTimThay.includes(ma)
                    );

                throw new ApiError(
                    400,
                    `Mã nhóm tính năng không tồn tại: ${maKhongTonTai.join(", ")}.`
                );

            }

            const nhomBiKhoa =
                danhSachNhom.find(
                    item => !item.active
                );

            if (nhomBiKhoa) {

                throw new ApiError(
                    400,
                    `Nhóm tính năng "${nhomBiKhoa.tenNhomTinhNang}" đã bị khóa.`
                );

            }

            const idsTheoMa =
                danhSachMa.map(
                    ma => {

                        const nhomTinhNang =
                            danhSachNhom.find(
                                item =>
                                    item.maNhomTinhNang
                                        .toUpperCase() === ma
                            );

                        return Number(
                            nhomTinhNang.id
                        );

                    }
                );

            /**
             * Nếu truyền cả ID và mã thì kiểm tra khớp nhau
             */
            if (
                Array.isArray(
                    duLieu.dsNhomTinhNangId
                )
            ) {

                const idsDaTruyen = [
                    ...new Set(
                        duLieu.dsNhomTinhNangId.map(
                            id => Number(id)
                        )
                    )
                ];

                const idsTheoMaSapXep =
                    [...idsTheoMa].sort(
                        (a, b) => a - b
                    );

                const idsDaTruyenSapXep =
                    [...idsDaTruyen].sort(
                        (a, b) => a - b
                    );

                if (
                    JSON.stringify(
                        idsTheoMaSapXep
                    ) !==
                    JSON.stringify(
                        idsDaTruyenSapXep
                    )
                ) {

                    throw new ApiError(
                        400,
                        "Danh sách ID và mã nhóm tính năng không khớp."
                    );

                }

            }

            duLieu.dsNhomTinhNangId =
                idsTheoMa;

        } else if (
            Array.isArray(
                duLieu.dsNhomTinhNangId
            )
        ) {

            duLieu.dsNhomTinhNangId = [
                ...new Set(
                    duLieu.dsNhomTinhNangId.map(
                        id => Number(id)
                    )
                )
            ];

        }

        delete duLieu.dsMaNhomTinhNang;

        return duLieu;

    }

    async validateLienKet(data) {

        if (
            !Array.isArray(
                data.dsNhomTinhNangId
            ) ||
            data.dsNhomTinhNangId.length === 0
        ) {

            throw new ApiError(
                400,
                "Phải chọn ít nhất một nhóm tính năng."
            );

        }

        const danhSachId = [
            ...new Set(
                data.dsNhomTinhNangId.map(
                    id => Number(id)
                )
            )
        ];

        const idKhongHopLe =
            danhSachId.some(
                id =>
                    !Number.isInteger(id) ||
                    id <= 0
            );

        if (idKhongHopLe) {

            throw new ApiError(
                400,
                "Danh sách nhóm tính năng không hợp lệ."
            );

        }

        const danhSachNhom =
            await thietLapRepository
                .getDsNhomTinhNangByIds(
                    danhSachId
                );

        if (
            danhSachNhom.length !==
            danhSachId.length
        ) {

            const idsTimThay =
                danhSachNhom.map(
                    item => Number(item.id)
                );

            const idsKhongTonTai =
                danhSachId.filter(
                    id =>
                        !idsTimThay.includes(id)
                );

            throw new ApiError(
                400,
                `Nhóm tính năng không tồn tại: ${idsKhongTonTai.join(", ")}.`
            );

        }

        const nhomBiKhoa =
            danhSachNhom.find(
                item => !item.active
            );

        if (nhomBiKhoa) {

            throw new ApiError(
                400,
                `Nhóm tính năng "${nhomBiKhoa.tenNhomTinhNang}" đã bị khóa.`
            );

        }

        data.dsNhomTinhNangId =
            danhSachId;

    }

    validateCoSoId(data) {

        if (
            data.coSoId === undefined ||
            data.coSoId === null ||
            data.coSoId === ""
        ) {

            data.coSoId = null;

            return;

        }

        const coSoId =
            Number(data.coSoId);

        if (
            !Number.isInteger(coSoId) ||
            coSoId <= 0
        ) {

            throw new ApiError(
                400,
                "ID cơ sở không hợp lệ."
            );

        }

        data.coSoId =
            coSoId;

    }

    async validateTrungDuLieu(
        data,
        excludeId = null
    ) {

        const trungMa =
            await thietLapRepository
                .existsMaThietLap(
                    data.maThietLap,
                    excludeId
                );

        if (trungMa) {

            throw new ApiError(
                409,
                "Mã thiết lập đã tồn tại."
            );

        }

        const trungTen =
            await thietLapRepository
                .existsTenThietLap(
                    data.tenThietLap,
                    data.coSoId,
                    excludeId
                );

        if (trungTen) {

            throw new ApiError(
                409,
                "Tên thiết lập đã tồn tại trong cơ sở này."
            );

        }

    }

    async create(data) {

        const duLieuTao = {

            ...data,

            maThietLap:
                data.maThietLap
                    .trim()
                    .toUpperCase(),

            tenThietLap:
                data.tenThietLap.trim(),

            giaTri:
                data.giaTri !== undefined &&
                data.giaTri !== null
                    ? String(data.giaTri)
                    : null,

            moTa:
                data.moTa?.trim() || null,

            active:
                data.active !== undefined
                    ? data.active
                    : true

        };

        this.validateCoSoId(
            duLieuTao
        );

        const duLieuDaChuanHoa =
            await this.chuanHoaLienKet(
                duLieuTao
            );

        await this.validateLienKet(
            duLieuDaChuanHoa
        );

        await this.validateTrungDuLieu(
            duLieuDaChuanHoa
        );

        return await thietLapRepository
            .create(
                duLieuDaChuanHoa
            );

    }

    async update(id, data) {

        const thietLapId =
            this.parseId(id);

        const thietLap =
            await thietLapRepository
                .getChiTiet(
                    thietLapId
                );

        if (!thietLap) {

            throw new ApiError(
                404,
                "Thiết lập không tồn tại."
            );

        }

        const duLieuCapNhat = {

            maThietLap:
                data.maThietLap !== undefined
                    ? data.maThietLap
                        .trim()
                        .toUpperCase()
                    : thietLap.maThietLap,

            tenThietLap:
                data.tenThietLap !== undefined
                    ? data.tenThietLap.trim()
                    : thietLap.tenThietLap,

            giaTri:
                data.giaTri !== undefined
                    ? (
                        data.giaTri === null
                            ? null
                            : String(data.giaTri)
                    )
                    : thietLap.giaTri,

            moTa:
                data.moTa !== undefined
                    ? (
                        data.moTa === null
                            ? null
                            : data.moTa.trim() || null
                    )
                    : thietLap.moTa,

            coSoId:
                data.coSoId !== undefined
                    ? data.coSoId
                    : thietLap.coSoId,

            dsNhomTinhNangId:
                data.dsNhomTinhNangId !== undefined
                    ? data.dsNhomTinhNangId
                    : (
                        data.dsMaNhomTinhNang !== undefined
                            ? undefined
                            : thietLap.dsNhomTinhNangId
                    ),

            dsMaNhomTinhNang:
                data.dsMaNhomTinhNang !== undefined
                    ? data.dsMaNhomTinhNang
                    : undefined,

            active:
                data.active !== undefined
                    ? data.active
                    : thietLap.active

        };

        this.validateCoSoId(
            duLieuCapNhat
        );

        const duLieuDaChuanHoa =
            await this.chuanHoaLienKet(
                duLieuCapNhat
            );

        await this.validateLienKet(
            duLieuDaChuanHoa
        );

        await this.validateTrungDuLieu(
            duLieuDaChuanHoa,
            thietLapId
        );

        const ketQua =
            await thietLapRepository
                .update(
                    thietLapId,
                    duLieuDaChuanHoa
                );

        if (!ketQua) {

            throw new ApiError(
                404,
                "Thiết lập không tồn tại."
            );

        }

        return ketQua;

    }

}

module.exports =
    new ThietLapService();