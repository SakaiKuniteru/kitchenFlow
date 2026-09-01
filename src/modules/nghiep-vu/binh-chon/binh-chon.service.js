const ApiError =
    require(
        "../../../utils/api-error"
    );

const {
    trangThaiThongBao:
        danhSachTrangThaiThongBao
} =
    require(
        "../../../constants/enums"
    );

const binhChonRepository =
    require(
        "./binh-chon.repository"
    );


const TRANG_THAI = {
    TAO_MOI: 10,
    DA_GUI: 20,
    DA_HUY: 30
};


class BinhChonSuatAnService {

    parseId(
        id
    ) {

        const value =
            Number(id);


        if (
            !Number.isInteger(
                value
            ) ||
            value <= 0
        ) {

            throw new ApiError(
                400,
                "ID đợt bình chọn không hợp lệ."
            );

        }


        return value;

    }


    parseTaiKhoanId(
        id
    ) {

        const value =
            Number(id);


        if (
            !Number.isInteger(
                value
            ) ||
            value <= 0
        ) {

            throw new ApiError(
                401,
                "Không xác định được tài khoản đăng nhập."
            );

        }


        return value;

    }


    getThongTinTrangThai(
        value
    ) {

        const valueNumber =
            Number(value);


        const item =
            danhSachTrangThaiThongBao
                .find(
                    item =>
                        Number(
                            item.value
                        ) ===
                        valueNumber
                );


        if (!item) {

            return {

                value:
                    valueNumber,

                name:
                    "Không xác định"

            };

        }


        return {

            value:
                Number(
                    item.value
                ),

            name:
                item.name

        };

    }


    getTrangThaiThoiGian(
        dotBinhChon
    ) {

        if (
            Number(
                dotBinhChon.trangThai
            ) ===
            TRANG_THAI.DA_HUY
        ) {

            return {

                value:
                    "DA_HUY",

                name:
                    "Đã hủy"

            };

        }


        const now =
            new Date();

        const batDau =
            new Date(
                dotBinhChon
                    .batDauBinhChon
            );

        const han =
            new Date(
                dotBinhChon
                    .hanBinhChon
            );


        if (
            now <
            batDau
        ) {

            return {

                value:
                    "SAP_DIEN_RA",

                name:
                    "Sắp diễn ra"

            };

        }


        if (
            now <=
            han
        ) {

            return {

                value:
                    "DANG_DIEN_RA",

                name:
                    "Đang diễn ra"

            };

        }


        return {

            value:
                "DA_KET_THUC",

            name:
                "Đã kết thúc"

        };

    }


    mapResponse(
        dotBinhChon
    ) {

        if (
            !dotBinhChon
        ) {

            return null;

        }


        return {

            ...dotBinhChon,

            trangThai:
                this.getThongTinTrangThai(
                    dotBinhChon
                        .trangThai
                ),

            trangThaiThoiGian:
                this.getTrangThaiThoiGian(
                    dotBinhChon
                )

        };

    }


    validateKhoangThoiGian(
        batDau,
        han
    ) {

        const batDauDate =
            new Date(
                batDau
            );

        const hanDate =
            new Date(
                han
            );


        if (
            Number.isNaN(
                batDauDate.getTime()
            )
        ) {

            throw new ApiError(
                400,
                "Thời gian bắt đầu bình chọn không hợp lệ."
            );

        }


        if (
            Number.isNaN(
                hanDate.getTime()
            )
        ) {

            throw new ApiError(
                400,
                "Hạn bình chọn không hợp lệ."
            );

        }


        if (
            batDauDate >=
            hanDate
        ) {

            throw new ApiError(
                400,
                "Thời gian bắt đầu phải nhỏ hơn hạn bình chọn."
            );

        }

    }

    async validateThucDonNgay(
        thucDonNgayId
    ) {

        const id =
            Number(
                thucDonNgayId
            );


        if (
            !Number.isInteger(
                id
            ) ||
            id <= 0
        ) {

            throw new ApiError(
                400,
                "ID ngày thực đơn không hợp lệ."
            );

        }


        const thucDonNgay =
            await binhChonRepository
                .getThucDonNgayHopLe(
                    id
                );


        if (
            !thucDonNgay
        ) {

            throw new ApiError(
                404,
                "Ngày thực đơn không tồn tại hoặc không còn hoạt động."
            );

        }


        if (
            Number(
                thucDonNgay.trang_thai
            ) !== 30
        ) {

            throw new ApiError(
                400,
                "Chỉ được tạo bình chọn cho thực đơn đã duyệt."
            );

        }


        const ngayHienTai =
            new Date();

        ngayHienTai.setHours(
            0,
            0,
            0,
            0
        );


        const ngayThucDon =
            new Date(
                thucDonNgay.ngay
            );

        ngayThucDon.setHours(
            0,
            0,
            0,
            0
        );


        if (
            ngayThucDon <
            ngayHienTai
        ) {

            throw new ApiError(
                400,
                "Ngày thực đơn đã hết hạn."
            );

        }


        return id;

    }

    async getDanhSachThucDonNgayHopLe(
        query = {}
    ) {

        let dotBinhChonId =
            null;


        if (
            query.dotBinhChonId !==
            undefined &&
            query.dotBinhChonId !==
            ""
        ) {

            dotBinhChonId =
                this.parseId(
                    query.dotBinhChonId
                );

        }


        return await binhChonRepository
            .getDanhSachThucDonNgayHopLe(
                dotBinhChonId
            );

    }

    async getTongHop(
        query = {}
    ) {

        const filters = {};


        if (
            query.trangThai !==
            undefined &&
            query.trangThai !==
            ""
        ) {

            const trangThai =
                Number(
                    query.trangThai
                );


            const hopLe =
                danhSachTrangThaiThongBao
                    .some(
                        item =>
                            Number(
                                item.value
                            ) ===
                            trangThai
                    );


            if (
                !hopLe
            ) {

                throw new ApiError(
                    400,
                    "Trạng thái bình chọn không hợp lệ."
                );

            }


            filters.trangThai =
                trangThai;

        }


        [
            "thucDonNgayId",
            "thucDonId",
            "nhaAnId",
            "caAnId"
        ].forEach(
            key => {

                if (
                    query[key] !==
                    undefined &&
                    query[key] !==
                    ""
                ) {

                    const value =
                        Number(
                            query[key]
                        );


                    if (
                        Number.isInteger(
                            value
                        ) &&
                        value > 0
                    ) {

                        filters[key] =
                            value;

                    }

                }

            }
        );


        if (
            query.tuNgay
        ) {

            filters.tuNgay =
                query.tuNgay;

        }


        if (
            query.denNgay
        ) {

            filters.denNgay =
                query.denNgay;

        }


        const danhSach =
            await binhChonRepository
                .getTongHop(
                    filters
                );


        return danhSach.map(
            item =>
                this.mapResponse(
                    item
                )
        );

    }


    async getChiTiet(
        id
    ) {

        const dotId =
            this.parseId(
                id
            );


        const dot =
            await binhChonRepository
                .getChiTiet(
                    dotId
                );


        if (
            !dot
        ) {

            throw new ApiError(
                404,
                "Đợt bình chọn không tồn tại."
            );

        }


        const [
            dsNhomMonAn,
            thongKe
        ] =
            await Promise.all([

                binhChonRepository
                    .getDanhSachMonAn(
                        dotId
                    ),

                binhChonRepository
                    .getThongKe(
                        dotId
                    )

            ]);


        return {

            ...this.mapResponse(
                dot
            ),

            dsNhomMonAn,

            thongKe

        };

    }


    async create(
        data,
        nguoiTaoId
    ) {

        const taiKhoanId =
            this.parseTaiKhoanId(
                nguoiTaoId
            );


        const thucDonNgayId =
            await this
                .validateThucDonNgay(
                    data.thucDonNgayId
                );


        this.validateKhoangThoiGian(
            data.batDauBinhChon,
            data.hanBinhChon
        );


        const daTonTai =
            await binhChonRepository
                .existsDotHieuLucTheoThucDonNgay(
                    thucDonNgayId
                );


        if (
            daTonTai
        ) {

            throw new ApiError(
                409,
                "Ngày thực đơn đã có đợt bình chọn chưa bị hủy."
            );

        }


        const duLieuTao = {

            thucDonNgayId,

            batDauBinhChon:
                data.batDauBinhChon,

            hanBinhChon:
                data.hanBinhChon,

            choPhepThayDoi:
                data.choPhepThayDoi !==
                undefined
                    ? data.choPhepThayDoi
                    : true,

            nguoiTaoId:
                taiKhoanId

        };


        const result =
            await binhChonRepository
                .create(
                    duLieuTao
                );


        return await this
            .getChiTiet(
                result.id
            );

    }


    async update(
        id,
        data
    ) {

        const dotId =
            this.parseId(
                id
            );


        const dot =
            await binhChonRepository
                .getChiTiet(
                    dotId
                );


        if (
            !dot
        ) {

            throw new ApiError(
                404,
                "Đợt bình chọn không tồn tại."
            );

        }


        if (
            Number(
                dot.trangThai
            ) !==
            TRANG_THAI.TAO_MOI
        ) {

            throw new ApiError(
                400,
                "Chỉ được cập nhật đợt bình chọn ở trạng thái Tạo mới."
            );

        }


        const duLieu = {

            thucDonNgayId:
                data.thucDonNgayId !==
                undefined
                    ? Number(
                        data.thucDonNgayId
                    )
                    : dot.thucDonNgayId,

            batDauBinhChon:
                data.batDauBinhChon !==
                undefined
                    ? data.batDauBinhChon
                    : dot.batDauBinhChon,

            hanBinhChon:
                data.hanBinhChon !==
                undefined
                    ? data.hanBinhChon
                    : dot.hanBinhChon,

            choPhepThayDoi:
                data.choPhepThayDoi !==
                undefined
                    ? data.choPhepThayDoi
                    : dot.choPhepThayDoi

        };


        await this
            .validateThucDonNgay(
                duLieu.thucDonNgayId
            );


        this.validateKhoangThoiGian(
            duLieu.batDauBinhChon,
            duLieu.hanBinhChon
        );


        const daTonTai =
            await binhChonRepository
                .existsDotHieuLucTheoThucDonNgay(
                    duLieu.thucDonNgayId,
                    dotId
                );


        if (
            daTonTai
        ) {

            throw new ApiError(
                409,
                "Ngày thực đơn đã có đợt bình chọn khác chưa bị hủy."
            );

        }


        await binhChonRepository
            .update(
                dotId,
                duLieu
            );


        return await this
            .getChiTiet(
                dotId
            );

    }


    async gui(
        id,
        nguoiGuiId
    ) {

        const dotId =
            this.parseId(
                id
            );

        const taiKhoanId =
            this.parseTaiKhoanId(
                nguoiGuiId
            );


        const dot =
            await binhChonRepository
                .getChiTiet(
                    dotId
                );


        if (
            !dot
        ) {

            throw new ApiError(
                404,
                "Đợt bình chọn không tồn tại."
            );

        }


        if (
            Number(
                dot.trangThai
            ) !==
            TRANG_THAI.TAO_MOI
        ) {

            throw new ApiError(
                400,
                "Chỉ được gửi đợt bình chọn ở trạng thái Tạo mới."
            );

        }


        if (
            new Date(
                dot.hanBinhChon
            ) <=
            new Date()
        ) {

            throw new ApiError(
                400,
                "Không thể gửi đợt bình chọn đã quá hạn."
            );

        }


        const coMonAn =
            await binhChonRepository
                .existsMonAnTheoThucDonNgay(
                    dot.thucDonNgayId
                );


        if (
            !coMonAn
        ) {

            throw new ApiError(
                400,
                "Thực đơn chưa có món ăn nên chưa thể gửi bình chọn."
            );

        }


        const result =
            await binhChonRepository
                .gui(
                    dotId,
                    taiKhoanId
                );


        if (
            !result
        ) {

            throw new ApiError(
                400,
                "Không thể gửi đợt bình chọn."
            );

        }


        return await this
            .getChiTiet(
                dotId
            );

    }


    async huy(
        id,
        data,
        nguoiHuyId
    ) {

        const dotId =
            this.parseId(
                id
            );

        const taiKhoanId =
            this.parseTaiKhoanId(
                nguoiHuyId
            );


        const dot =
            await binhChonRepository
                .getChiTiet(
                    dotId
                );


        if (
            !dot
        ) {

            throw new ApiError(
                404,
                "Đợt bình chọn không tồn tại."
            );

        }


        if (
            ![
                TRANG_THAI.TAO_MOI,
                TRANG_THAI.DA_GUI
            ].includes(
                Number(
                    dot.trangThai
                )
            )
        ) {

            throw new ApiError(
                400,
                "Trạng thái hiện tại không cho phép hủy đợt bình chọn."
            );

        }


        const lyDoHuy =
            data.lyDoHuy
                ?.trim();


        const result =
            await binhChonRepository
                .huy(
                    dotId,
                    taiKhoanId,
                    lyDoHuy
                );


        if (
            !result
        ) {

            throw new ApiError(
                400,
                "Không thể hủy đợt bình chọn."
            );

        }


        return await this
            .getChiTiet(
                dotId
            );

    }


    async getHienTaiCuaToi(
        taiKhoanId
    ) {

        const accountId =
            this.parseTaiKhoanId(
                taiKhoanId
            );


        const danhSach =
            await binhChonRepository
                .getHienTaiCuaToi(
                    accountId
                );


        const data = [];


        for (
            const dot of
            danhSach
        ) {

            const [
                luaChon,
                dsNhomMonAn,
                thongKe
            ] =
                await Promise.all([

                    binhChonRepository
                        .getLuaChonCuaTaiKhoan(
                            dot.id,
                            accountId
                        ),

                    binhChonRepository
                        .getDanhSachMonAn(
                            dot.id
                        ),

                    binhChonRepository
                        .getThongKe(
                            dot.id
                        )

                ]);


            data.push({

                ...this.mapResponse(
                    dot
                ),

                luaChonCuaToi:
                    luaChon
                        ? luaChon.luaChon
                        : null,

                thoiGianBinhChon:
                    luaChon
                        ? luaChon
                            .thoiGianBinhChon
                        : null,

                dsNhomMonAn,

                thongKe

            });

        }


        return data;

    }


    async getSapToiCuaToi(
        taiKhoanId
    ) {

        const accountId =
            this.parseTaiKhoanId(
                taiKhoanId
            );


        const danhSach =
            await binhChonRepository
                .getSapToiCuaToi(
                    accountId
                );


        const data = [];


        for (
            const dot of
            danhSach
        ) {

            const dsNhomMonAn =
                await binhChonRepository
                    .getDanhSachMonAn(
                        dot.id
                    );


            data.push({

                ...this.mapResponse(
                    dot
                ),

                dsNhomMonAn

            });

        }


        return data;

    }


    async binhChon(
        id,
        data,
        taiKhoanId
    ) {

        const dotId =
            this.parseId(
                id
            );

        const accountId =
            this.parseTaiKhoanId(
                taiKhoanId
            );


        const dot =
            await binhChonRepository
                .getChiTiet(
                    dotId
                );


        if (
            !dot
        ) {

            throw new ApiError(
                404,
                "Đợt bình chọn không tồn tại."
            );

        }


        if (
            Number(
                dot.trangThai
            ) !==
            TRANG_THAI.DA_GUI
        ) {

            throw new ApiError(
                400,
                "Đợt bình chọn chưa được gửi hoặc đã bị hủy."
            );

        }


        const now =
            new Date();


        if (
            now <
            new Date(
                dot.batDauBinhChon
            )
        ) {

            throw new ApiError(
                400,
                "Đợt bình chọn chưa bắt đầu."
            );

        }


        if (
            now >
            new Date(
                dot.hanBinhChon
            )
        ) {

            throw new ApiError(
                400,
                "Đợt bình chọn đã kết thúc."
            );

        }


        const duocBinhChon =
            await binhChonRepository
                .kiemTraDuocBinhChon(
                    dotId,
                    accountId
                );


        if (
            !duocBinhChon
        ) {

            throw new ApiError(
                403,
                "Bạn không thuộc phạm vi tham gia đợt bình chọn này."
            );

        }


        const luaChonCu =
            await binhChonRepository
                .getLuaChonCuaTaiKhoan(
                    dotId,
                    accountId
                );


        if (
            luaChonCu &&
            dot.choPhepThayDoi ===
            false
        ) {

            throw new ApiError(
                400,
                "Đợt bình chọn không cho phép thay đổi lựa chọn."
            );

        }


        return await binhChonRepository
            .upsertBinhChon(
                dotId,
                accountId,
                data.luaChon
            );

    }


    chuanHoaFilterLichSu(
        query = {}
    ) {

        const filters = {};


        if (
            query.dotBinhChonId
        ) {

            filters.dotBinhChonId =
                this.parseId(
                    query.dotBinhChonId
                );

        }


        if (
            query.luaChon !==
            undefined &&
            query.luaChon !==
            ""
        ) {

            const value =
                String(
                    query.luaChon
                )
                    .toLowerCase();


            if (
                value !== "true" &&
                value !== "false"
            ) {

                throw new ApiError(
                    400,
                    "Lựa chọn bình chọn không hợp lệ."
                );

            }


            filters.luaChon =
                value === "true";

        }


        if (
            query.tuNgay
        ) {

            filters.tuNgay =
                query.tuNgay;

        }


        if (
            query.denNgay
        ) {

            filters.denNgay =
                query.denNgay;

        }


        return filters;

    }


    async getLichSuTong(
        query = {}
    ) {

        return await binhChonRepository
            .getLichSuTong(
                this.chuanHoaFilterLichSu(
                    query
                )
            );

    }


    async getLichSuCuaToi(
        taiKhoanId,
        query = {}
    ) {

        const accountId =
            this.parseTaiKhoanId(
                taiKhoanId
            );


        return await binhChonRepository
            .getLichSuCuaToi(
                accountId,
                this.chuanHoaFilterLichSu(
                    query
                )
            );

    }


    async getThongKe(
        id
    ) {

        const dotId =
            this.parseId(
                id
            );


        const dot =
            await binhChonRepository
                .getChiTiet(
                    dotId
                );


        if (
            !dot
        ) {

            throw new ApiError(
                404,
                "Đợt bình chọn không tồn tại."
            );

        }


        return await binhChonRepository
            .getThongKe(
                dotId
            );

    }


    async getNguoiBinhChon(
        id,
        query = {}
    ) {

        const dotId =
            this.parseId(
                id
            );


        const dot =
            await binhChonRepository
                .getChiTiet(
                    dotId
                );


        if (
            !dot
        ) {

            throw new ApiError(
                404,
                "Đợt bình chọn không tồn tại."
            );

        }


        const filters = {};


        if (
            query.luaChon !==
            undefined &&
            query.luaChon !==
            ""
        ) {

            const value =
                String(
                    query.luaChon
                )
                    .toLowerCase();


            if (
                value !== "true" &&
                value !== "false"
            ) {

                throw new ApiError(
                    400,
                    "Lựa chọn bình chọn không hợp lệ."
                );

            }


            filters.luaChon =
                value === "true";

        }


        if (
            query.tuKhoa
        ) {

            filters.tuKhoa =
                String(
                    query.tuKhoa
                )
                    .trim();

        }


        return await binhChonRepository
            .getNguoiBinhChon(
                dotId,
                filters
            );

    }

}


module.exports =
    new BinhChonSuatAnService();