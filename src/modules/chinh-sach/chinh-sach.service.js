const pool = require("../../config/database");

const ApiError = require("../../utils/api-error");

const { loaiChinhSach: danhSachLoaiChinhSach } = require("../../constants/enums");

const chinhSachRepository = require("./chinh-sach.repository");

class ChinhSachService {

    getThongTinLoaiChinhSach(
        giaTriLoaiChinhSach
    ) {

        const giaTriSo =
            Number(
                giaTriLoaiChinhSach
            );

        const loaiChinhSach =
            danhSachLoaiChinhSach
                .find(
                    item =>
                        Number(item.value)
                        === giaTriSo
                );

        if (!loaiChinhSach) {

            return {

                value:
                    giaTriSo,

                name:
                    "Không xác định"

            };

        }

        return {

            value:
                Number(
                    loaiChinhSach.value
                ),

            name:
                loaiChinhSach.name

        };

    }

    mapChinhSachResponse(
        chinhSach
    ) {

        if (!chinhSach) {
            return null;
        }

        return {

            ...chinhSach,

            loaiChinhSach:
                this.getThongTinLoaiChinhSach(
                    chinhSach.loaiChinhSach
                )

        };

    }

    validateLoaiChinhSach(
        giaTriLoaiChinhSach
    ) {

        const giaTriSo =
            Number(
                giaTriLoaiChinhSach
            );

        const hopLe =
            danhSachLoaiChinhSach
                .some(
                    item =>
                        Number(item.value)
                        === giaTriSo
                );

        if (!hopLe) {

            throw new ApiError(
                400,
                "Loại chính sách không hợp lệ."
            );

        }

        return giaTriSo;

    }

    validateMucDoUuTien(
        mucDoUuTien
    ) {

        const mucDoUuTienSo =
            Number(
                mucDoUuTien
            );

        if (
            !Number.isInteger(
                mucDoUuTienSo
            )
            ||
            mucDoUuTienSo < 0
        ) {

            throw new ApiError(
                400,
                "Mức độ ưu tiên phải là số nguyên lớn hơn hoặc bằng 0."
            );

        }

    }

    chuanHoaDoiTuongIds(
        doiTuongIds
    ) {

        if (
            !Array.isArray(
                doiTuongIds
            )
            ||
            doiTuongIds.length === 0
        ) {

            throw new ApiError(
                400,
                "Vui lòng chọn ít nhất một đối tượng áp dụng."
            );

        }

        const danhSachId =
            [
                ...new Set(
                    doiTuongIds.map(
                        item =>
                            Number(item)
                    )
                )
            ];

        const khongHopLe =
            danhSachId.some(
                item =>
                    !Number.isInteger(item)
                    ||
                    item <= 0
            );

        if (khongHopLe) {

            throw new ApiError(
                400,
                "Danh sách đối tượng áp dụng không hợp lệ."
            );

        }

        return danhSachId;

    }

    async validateVoucher(
        voucherId
    ) {

        const tonTai =
            await chinhSachRepository
                .existsVoucher(
                    voucherId
                );

        if (!tonTai) {

            throw new ApiError(
                400,
                "Voucher không tồn tại hoặc đã bị khóa."
            );

        }

    }

    async validateDoiTuongApDung(
        loaiChinhSach,
        doiTuongIds,
        client = pool
    ) {

        const hopLe =
            await chinhSachRepository
                .existsDoiTuongIds(
                    loaiChinhSach,
                    doiTuongIds,
                    client
                );

        if (!hopLe) {

            const thongTinLoai =
                this.getThongTinLoaiChinhSach(
                    loaiChinhSach
                );

            throw new ApiError(
                400,
                `Một hoặc nhiều ${thongTinLoai.name.toLowerCase()} không tồn tại hoặc đã bị khóa.`
            );

        }

    }

    async validateTrungDuLieu(
        data,
        excludeId = null
    ) {

        if (
            data.maChinhSach
            !== undefined
        ) {

            const trungMa =
                await chinhSachRepository
                    .existsMaChinhSach(
                        data.maChinhSach,
                        excludeId
                    );

            if (trungMa) {

                throw new ApiError(
                    409,
                    "Mã chính sách đã tồn tại."
                );

            }

        }

        if (
            data.tenChinhSach
            !== undefined
        ) {

            const trungTen =
                await chinhSachRepository
                    .existsTenChinhSach(
                        data.tenChinhSach,
                        excludeId
                    );

            if (trungTen) {

                throw new ApiError(
                    409,
                    "Tên chính sách đã tồn tại."
                );

            }

        }

    }

    async getTongHop(
        query = {}
    ) {

        const boLoc = {

            ...query

        };

        if (
            boLoc.loaiChinhSach
            !== undefined
            &&
            boLoc.loaiChinhSach
            !== ""
        ) {

            boLoc.loaiChinhSach =
                this.validateLoaiChinhSach(
                    boLoc.loaiChinhSach
                );

        }

        if (
            boLoc.voucherId
            !== undefined
            &&
            boLoc.voucherId
            !== ""
        ) {

            boLoc.voucherId =
                Number(
                    boLoc.voucherId
                );

        }

        if (
            boLoc.active
            !== undefined
            &&
            boLoc.active
            !== ""
        ) {

            boLoc.active =
                String(
                    boLoc.active
                ).toLowerCase()
                === "true";

        }

        const danhSach =
            await chinhSachRepository
                .getTongHop(
                    boLoc
                );

        return danhSach.map(
            item =>
                this.mapChinhSachResponse(
                    item
                )
        );

    }

    async getChiTiet(
        id
    ) {

        const chinhSach =
            await chinhSachRepository
                .getChiTiet(id);

        if (!chinhSach) {

            throw new ApiError(
                404,
                "Chính sách không tồn tại."
            );

        }

        return this.mapChinhSachResponse(
            chinhSach
        );

    }

    async getTongHopDoiTuong(
        query = {}
    ) {

        const {
            loaiChinhSach
        } = query;

        if (
            loaiChinhSach
            === undefined
            ||
            loaiChinhSach
            === null
            ||
            loaiChinhSach
            === ""
        ) {

            throw new ApiError(
                400,
                "Loại chính sách không được để trống."
            );

        }

        const giaTriLoai =
            this.validateLoaiChinhSach(
                loaiChinhSach
            );

        const doiTuongApDung =
            await chinhSachRepository
                .getTongHopDoiTuong(
                    giaTriLoai
                );

        return {

            loaiChinhSach:
                this.getThongTinLoaiChinhSach(
                    giaTriLoai
                ),

            doiTuongApDung

        };

    }

    async getTongHopVoucher() {

        return await chinhSachRepository
            .getTongHopVoucher();

    }

    getLoaiChinhSach() {

        return danhSachLoaiChinhSach
            .map(
                item => ({

                    value:
                        Number(
                            item.value
                        ),

                    name:
                        item.name

                })
            );

    }

    async getDoiTuongTheoChinhSach(
        id
    ) {

        const chinhSach =
            await chinhSachRepository
                .getChiTiet(id);

        if (!chinhSach) {

            throw new ApiError(
                404,
                "Chính sách không tồn tại."
            );

        }

        const giaTriLoai =
            this.validateLoaiChinhSach(
                chinhSach.loaiChinhSach
            );

        const doiTuongApDung =
            await chinhSachRepository
                .getDoiTuongTheoChinhSach(
                    id,
                    giaTriLoai
                );

        return {

            chinhSach: {

                id:
                    chinhSach.id,

                maChinhSach:
                    chinhSach.maChinhSach,

                tenChinhSach:
                    chinhSach.tenChinhSach

            },

            loaiChinhSach:
                this.getThongTinLoaiChinhSach(
                    giaTriLoai
                ),

            doiTuongApDung

        };

    }

    async create(
        data
    ) {

        const duLieu = {
            ...data
        };

        const loaiChinhSach =
            this.validateLoaiChinhSach(
                duLieu.loaiChinhSach
            );

        this.validateMucDoUuTien(
            duLieu.mucDoUuTien
        );

        const doiTuongIds =
            this.chuanHoaDoiTuongIds(
                duLieu.doiTuongIds
            );

        await this.validateVoucher(
            duLieu.voucherId
        );

        await this.validateTrungDuLieu(
            duLieu
        );

        const duLieuTao = {

            maChinhSach:
                duLieu.maChinhSach
                    .trim(),

            tenChinhSach:
                duLieu.tenChinhSach
                    .trim(),

            loaiChinhSach,

            voucherId:
                Number(
                    duLieu.voucherId
                ),

            moTa:
                duLieu.moTa
                    ?.trim()
                    || null,

            mucDoUuTien:
                Number(
                    duLieu.mucDoUuTien
                ),

            active:
                duLieu.active
                    !== undefined
                    ? duLieu.active
                    : true

        };

        const client =
            await pool.connect();

        try {

            await client.query(
                "BEGIN"
            );

            await this.validateDoiTuongApDung(
                loaiChinhSach,
                doiTuongIds,
                client
            );

            const chinhSach =
                await chinhSachRepository
                    .create(
                        duLieuTao,
                        client
                    );

            await chinhSachRepository
                .saveDoiTuongApDung(
                    chinhSach.id,
                    loaiChinhSach,
                    doiTuongIds,
                    client
                );

            await client.query(
                "COMMIT"
            );

            return await this.getChiTiet(
                chinhSach.id
            );

        } catch (error) {

            await client.query(
                "ROLLBACK"
            );

            throw error;

        } finally {

            client.release();

        }

    }

    async update(
        id,
        data
    ) {

        const chinhSach =
            await chinhSachRepository
                .getChiTiet(id);

        if (!chinhSach) {

            throw new ApiError(
                404,
                "Chính sách không tồn tại."
            );

        }

        const giaTriLoaiHienTai =
            typeof chinhSach.loaiChinhSach
            === "object"
                ? chinhSach
                    .loaiChinhSach
                    .value
                : chinhSach
                    .loaiChinhSach;

        const loaiChinhSach =
            data.loaiChinhSach
            !== undefined
                ? this.validateLoaiChinhSach(
                    data.loaiChinhSach
                )
                : this.validateLoaiChinhSach(
                    giaTriLoaiHienTai
                );

        const mucDoUuTien =
            data.mucDoUuTien
            !== undefined
                ? Number(
                    data.mucDoUuTien
                )
                : Number(
                    chinhSach.mucDoUuTien
                );

        this.validateMucDoUuTien(
            mucDoUuTien
        );

        const voucherId =
            data.voucherId
            !== undefined
                ? Number(
                    data.voucherId
                )
                : Number(
                    chinhSach.voucher.id
                );

        if (
            data.voucherId
            !== undefined
        ) {

            await this.validateVoucher(
                voucherId
            );

        }

        const duLieuCapNhat = {

            maChinhSach:
                data.maChinhSach
                !== undefined
                    ? data.maChinhSach
                        .trim()
                    : chinhSach
                        .maChinhSach,

            tenChinhSach:
                data.tenChinhSach
                !== undefined
                    ? data.tenChinhSach
                        .trim()
                    : chinhSach
                        .tenChinhSach,

            loaiChinhSach,

            voucherId,

            moTa:
                data.moTa
                !== undefined
                    ? (
                        data.moTa
                        === null
                            ? null
                            : data.moTa
                                .trim()
                                || null
                    )
                    : chinhSach
                        .moTa,

            mucDoUuTien,

            active:
                data.active
                !== undefined
                    ? data.active
                    : chinhSach
                        .active

        };

        await this.validateTrungDuLieu(
            duLieuCapNhat,
            id
        );

        let doiTuongIds = null;

        if (
            data.doiTuongIds
            !== undefined
        ) {

            doiTuongIds =
                this.chuanHoaDoiTuongIds(
                    data.doiTuongIds
                );

        } else if (
            Number(loaiChinhSach)
            !== Number(
                giaTriLoaiHienTai
            )
        ) {

            throw new ApiError(
                400,
                "Vui lòng chọn đối tượng áp dụng khi thay đổi loại chính sách."
            );

        }

        const client =
            await pool.connect();

        try {

            await client.query(
                "BEGIN"
            );

            if (doiTuongIds) {

                await this.validateDoiTuongApDung(
                    loaiChinhSach,
                    doiTuongIds,
                    client
                );

            }

            const ketQua =
                await chinhSachRepository
                    .update(
                        id,
                        duLieuCapNhat,
                        client
                    );

            if (!ketQua) {

                throw new ApiError(
                    404,
                    "Chính sách không tồn tại."
                );

            }

            if (doiTuongIds) {

                await chinhSachRepository
                    .disableAllDoiTuong(
                        id,
                        client
                    );

                await chinhSachRepository
                    .saveDoiTuongApDung(
                        id,
                        loaiChinhSach,
                        doiTuongIds,
                        client
                    );

            }

            await client.query(
                "COMMIT"
            );

            return await this.getChiTiet(
                id
            );

        } catch (error) {

            await client.query(
                "ROLLBACK"
            );

            throw error;

        } finally {

            client.release();

        }

    }

}

module.exports =
    new ChinhSachService();