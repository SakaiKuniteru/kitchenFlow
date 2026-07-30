const ApiError =
    require("../../utils/api-error");

const thucPhamRepository =
    require("./thuc-pham.repository");


class ThucPhamService {

    parseId(id) {

        const thucPhamId =
            Number(id);

        if (
            !Number.isInteger(thucPhamId) ||
            thucPhamId <= 0
        ) {

            throw new ApiError(
                400,
                "ID thực phẩm không hợp lệ."
            );

        }

        return thucPhamId;

    }


    async getTongHop(query) {

        return await thucPhamRepository
            .getTongHop(query);

    }


    async getChiTiet(id) {

        const thucPhamId =
            this.parseId(id);

        const thucPham =
            await thucPhamRepository
                .getChiTiet(
                    thucPhamId
                );

        if (!thucPham) {

            throw new ApiError(
                404,
                "Thực phẩm không tồn tại."
            );

        }

        return thucPham;

    }


    async chuanHoaDonViTheoMa(
        duLieu,
        truongMa,
        truongId,
        tenLoaiDonVi
    ) {

        if (!duLieu[truongMa]) {
            return;
        }

        const donViTinh =
            await thucPhamRepository
                .getDonViTinhByMa(
                    duLieu[truongMa]
                );

        if (!donViTinh) {

            throw new ApiError(
                400,
                `Mã ${tenLoaiDonVi} không tồn tại.`
            );

        }

        if (!donViTinh.active) {

            throw new ApiError(
                400,
                `${tenLoaiDonVi} đã bị khóa.`
            );

        }

        if (
            duLieu[truongId] !== undefined &&
            duLieu[truongId] !== null &&
            Number(duLieu[truongId]) !==
                Number(donViTinh.id)
        ) {

            throw new ApiError(
                400,
                `ID và mã ${tenLoaiDonVi} không khớp.`
            );

        }

        duLieu[truongId] =
            donViTinh.id;

    }


    async chuanHoaLienKet(data) {

        const duLieu = {
            ...data
        };

        await this.chuanHoaDonViTheoMa(
            duLieu,
            "maDonViSoCap",
            "donViSoCapId",
            "đơn vị sơ cấp"
        );

        await this.chuanHoaDonViTheoMa(
            duLieu,
            "maDonViSuDung",
            "donViSuDungId",
            "đơn vị sử dụng"
        );

        if (
            duLieu.donViSoCapId !== undefined &&
            duLieu.donViSoCapId !== null
        ) {

            duLieu.donViSoCapId =
                Number(
                    duLieu.donViSoCapId
                );

        }

        if (
            duLieu.donViSuDungId !== undefined &&
            duLieu.donViSuDungId !== null
        ) {

            duLieu.donViSuDungId =
                Number(
                    duLieu.donViSuDungId
                );

        }

        delete duLieu.maDonViSoCap;
        delete duLieu.maDonViSuDung;

        return duLieu;

    }


    async validateDonVi(data) {

        if (!data.donViSoCapId) {

            throw new ApiError(
                400,
                "Đơn vị sơ cấp là bắt buộc."
            );

        }

        if (!data.donViSuDungId) {

            throw new ApiError(
                400,
                "Đơn vị sử dụng là bắt buộc."
            );

        }

        const donViSoCap =
            await thucPhamRepository
                .getDonViTinh(
                    data.donViSoCapId
                );

        if (!donViSoCap) {

            throw new ApiError(
                400,
                "Đơn vị sơ cấp không tồn tại."
            );

        }

        if (!donViSoCap.active) {

            throw new ApiError(
                400,
                "Đơn vị sơ cấp đã bị khóa."
            );

        }

        const donViSuDung =
            await thucPhamRepository
                .getDonViTinh(
                    data.donViSuDungId
                );

        if (!donViSuDung) {

            throw new ApiError(
                400,
                "Đơn vị sử dụng không tồn tại."
            );

        }

        if (!donViSuDung.active) {

            throw new ApiError(
                400,
                "Đơn vị sử dụng đã bị khóa."
            );

        }

        if (
            Number(donViSoCap.loaiDonVi) !==
            Number(donViSuDung.loaiDonVi)
        ) {

            throw new ApiError(
                400,
                "Đơn vị sơ cấp và đơn vị sử dụng phải cùng loại đơn vị."
            );

        }

        return {
            donViSoCap,
            donViSuDung
        };

    }


    validateHeSoQuyDoi(data) {

        const heSoQuyDoi =
            Number(data.heSoQuyDoi);

        if (
            !Number.isFinite(heSoQuyDoi) ||
            heSoQuyDoi <= 0
        ) {

            throw new ApiError(
                400,
                "Hệ số quy đổi phải là số lớn hơn 0."
            );

        }

        if (
            Number(data.donViSoCapId) ===
                Number(data.donViSuDungId) &&
            heSoQuyDoi !== 1
        ) {

            throw new ApiError(
                400,
                "Khi đơn vị sơ cấp và đơn vị sử dụng giống nhau, hệ số quy đổi phải bằng 1."
            );

        }

        data.heSoQuyDoi =
            heSoQuyDoi;

    }


    validateGiaNhap(data) {

        if (
            data.giaNhap === undefined ||
            data.giaNhap === null
        ) {
            return;
        }

        const giaNhap =
            Number(data.giaNhap);

        if (
            !Number.isFinite(giaNhap) ||
            giaNhap < 0
        ) {

            throw new ApiError(
                400,
                "Giá nhập phải là số lớn hơn hoặc bằng 0."
            );

        }

        data.giaNhap =
            giaNhap;

    }


    validateTyLeHaoHut(data) {

        if (
            data.tyLeHaoHutDuKien ===
                undefined ||
            data.tyLeHaoHutDuKien === null
        ) {
            return;
        }

        const tyLeHaoHut =
            Number(
                data.tyLeHaoHutDuKien
            );

        if (
            !Number.isFinite(tyLeHaoHut) ||
            tyLeHaoHut < 0 ||
            tyLeHaoHut > 100
        ) {

            throw new ApiError(
                400,
                "Tỷ lệ hao hụt dự kiến phải nằm trong khoảng từ 0 đến 100."
            );

        }

        data.tyLeHaoHutDuKien =
            tyLeHaoHut;

    }


    taoQuyCachMacDinh(
        data,
        donViSoCap,
        donViSuDung
    ) {

        if (
            data.quyCach !== undefined &&
            data.quyCach !== null &&
            String(data.quyCach).trim()
        ) {

            return String(
                data.quyCach
            ).trim();

        }

        const tenDonViSoCap =
            donViSoCap.kyHieu ||
            donViSoCap.tenDonViTinh;

        const tenDonViSuDung =
            donViSuDung.kyHieu ||
            donViSuDung.tenDonViTinh;

        return (
            `1 ${tenDonViSoCap}` +
            ` = ${data.heSoQuyDoi}` +
            ` ${tenDonViSuDung}`
        );

    }


    async validateTrungDuLieu(
        data,
        excludeId = null
    ) {

        const trungMa =
            await thucPhamRepository
                .existsMaThucPham(
                    data.maThucPham,
                    excludeId
                );

        if (trungMa) {

            throw new ApiError(
                409,
                "Mã thực phẩm đã tồn tại."
            );

        }

        const trungTen =
            await thucPhamRepository
                .existsTenThucPham(
                    data.tenThucPham,
                    excludeId
                );

        if (trungTen) {

            throw new ApiError(
                409,
                "Tên thực phẩm đã tồn tại."
            );

        }

    }


    async create(data) {

        const duLieu =
            await this.chuanHoaLienKet(
                data
            );

        duLieu.heSoQuyDoi =
            duLieu.heSoQuyDoi !== undefined
                ? duLieu.heSoQuyDoi
                : 1;

        const {
            donViSoCap,
            donViSuDung
        } = await this.validateDonVi(
            duLieu
        );

        this.validateHeSoQuyDoi(
            duLieu
        );

        this.validateGiaNhap(
            duLieu
        );

        this.validateTyLeHaoHut(
            duLieu
        );

        await this.validateTrungDuLieu(
            duLieu
        );

        const duLieuTao = {

            ...duLieu,

            maThucPham:
                duLieu.maThucPham.trim(),

            tenThucPham:
                duLieu.tenThucPham.trim(),

            heSoQuyDoi:
                duLieu.heSoQuyDoi,

            quyCach:
                this.taoQuyCachMacDinh(
                    duLieu,
                    donViSoCap,
                    donViSuDung
                ),

            giaNhap:
                duLieu.giaNhap !== undefined
                    ? duLieu.giaNhap
                    : null,

            tyLeHaoHutDuKien:
                duLieu.tyLeHaoHutDuKien !==
                    undefined
                    ? duLieu
                        .tyLeHaoHutDuKien
                    : 0,

            ghiChu:
                duLieu.ghiChu?.trim() ||
                null,

            active:
                duLieu.active !== undefined
                    ? duLieu.active
                    : true

        };

        return await thucPhamRepository
            .create(
                duLieuTao
            );

    }


    async update(id, data) {

        const thucPhamId =
            this.parseId(id);

        const thucPham =
            await thucPhamRepository
                .getChiTiet(
                    thucPhamId
                );

        if (!thucPham) {

            throw new ApiError(
                404,
                "Thực phẩm không tồn tại."
            );

        }

        const duLieuCapNhat = {

            maThucPham:
                data.maThucPham !== undefined
                    ? data.maThucPham.trim()
                    : thucPham.maThucPham,

            tenThucPham:
                data.tenThucPham !== undefined
                    ? data.tenThucPham.trim()
                    : thucPham.tenThucPham,

            donViSoCapId:
                data.donViSoCapId !== undefined
                    ? data.donViSoCapId
                    : thucPham.donViSoCapId,

            maDonViSoCap:
                data.maDonViSoCap !== undefined
                    ? (
                        data.maDonViSoCap === null
                            ? null
                            : data.maDonViSoCap
                                .trim() || null
                    )
                    : undefined,

            donViSuDungId:
                data.donViSuDungId !== undefined
                    ? data.donViSuDungId
                    : thucPham.donViSuDungId,

            maDonViSuDung:
                data.maDonViSuDung !== undefined
                    ? (
                        data.maDonViSuDung === null
                            ? null
                            : data.maDonViSuDung
                                .trim() || null
                    )
                    : undefined,

            heSoQuyDoi:
                data.heSoQuyDoi !== undefined
                    ? data.heSoQuyDoi
                    : thucPham.heSoQuyDoi,

            quyCach:
                data.quyCach !== undefined
                    ? (
                        data.quyCach === null
                            ? null
                            : data.quyCach
                                .trim() || null
                    )
                    : thucPham.quyCach,

            giaNhap:
                data.giaNhap !== undefined
                    ? data.giaNhap
                    : thucPham.giaNhap,

            tyLeHaoHutDuKien:
                data.tyLeHaoHutDuKien !==
                    undefined
                    ? data
                        .tyLeHaoHutDuKien
                    : thucPham
                        .tyLeHaoHutDuKien,

            ghiChu:
                data.ghiChu !== undefined
                    ? (
                        data.ghiChu === null
                            ? null
                            : data.ghiChu
                                .trim() || null
                    )
                    : thucPham.ghiChu,

            active:
                data.active !== undefined
                    ? data.active
                    : thucPham.active

        };

        const duLieuDaChuanHoa =
            await this.chuanHoaLienKet(
                duLieuCapNhat
            );

        const {
            donViSoCap,
            donViSuDung
        } = await this.validateDonVi(
            duLieuDaChuanHoa
        );

        this.validateHeSoQuyDoi(
            duLieuDaChuanHoa
        );

        this.validateGiaNhap(
            duLieuDaChuanHoa
        );

        this.validateTyLeHaoHut(
            duLieuDaChuanHoa
        );

        const thayDoiQuyDoi =
            data.donViSoCapId !== undefined ||
            data.maDonViSoCap !== undefined ||
            data.donViSuDungId !== undefined ||
            data.maDonViSuDung !== undefined ||
            data.heSoQuyDoi !== undefined;

        if (
            data.quyCach === undefined &&
            !thayDoiQuyDoi
        ) {

            duLieuDaChuanHoa.quyCach =
                thucPham.quyCach;

        } else {

            duLieuDaChuanHoa.quyCach =
                this.taoQuyCachMacDinh(
                    {
                        ...duLieuDaChuanHoa,
                        quyCach:
                            data.quyCach
                    },
                    donViSoCap,
                    donViSuDung
                );

        }

        await this.validateTrungDuLieu(
            duLieuDaChuanHoa,
            thucPhamId
        );

        const ketQua =
            await thucPhamRepository
                .update(
                    thucPhamId,
                    duLieuDaChuanHoa
                );

        if (!ketQua) {

            throw new ApiError(
                404,
                "Thực phẩm không tồn tại."
            );

        }

        return ketQua;

    }

}


module.exports =
    new ThucPhamService();