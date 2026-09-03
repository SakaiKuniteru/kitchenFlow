const ApiError =
    require(
        "../../../utils/api-error"
    );

const {
    trangThaiTaoBinhChon: danhSachTrangThaiTaoBinhChon,
    loaiDoiTuong: danhSachLoaiDoiTuong
} = require("../../../constants/enums");

const binhChonRepository =
    require(
        "./binh-chon.repository"
    );

const thongBaoService =
    require(
        "../thong-bao/thong-bao.service"
    );

const THONG_BAO_BINH_CHON = {

    GUI:
        "BINH_CHON_SUAT_AN_GUI",

    HUY:
        "BINH_CHON_SUAT_AN_HUY",

    LOAI_THAM_CHIEU:
        "DOT_BINH_CHON_SUAT_AN"

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

    formatNgay(
        value
    ) {

        if (
            !value
        ) {

            return "-";

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "-";

        }


        return new Intl.DateTimeFormat(
            "vi-VN",
            {
                timeZone:
                    "Asia/Ho_Chi_Minh",

                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric"
            }
        ).format(
            date
        );

    }

    formatNgayGio(
        value
    ) {

        if (
            !value
        ) {

            return "-";

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "-";

        }


        return new Intl.DateTimeFormat(
            "vi-VN",
            {
                timeZone:
                    "Asia/Ho_Chi_Minh",

                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                hour12:
                    false
            }
        ).format(
            date
        );

    }

    getTenBinhChon(
        dot
    ) {

        const tenThucDon =
            String(
                dot?.tenThucDon ||
                ""
            ).trim() ||
            `#${dot?.id}`;


        const ngay =
            this.formatNgay(
                dot?.ngay
            );


        return ngay !==
            "-"
            ? `${tenThucDon} - ${ngay}`
            : tenThucDon;

    }

    buildNoiDungThongBaoGui(
        dot
    ) {

        return [
            "Bạn có một đợt bình chọn suất ăn mới.",
            "",
            `Thực đơn: ${dot?.tenThucDon || "-"}`,
            `Ngày áp dụng: ${this.formatNgay(dot?.ngay)}`,
            `Nhà ăn: ${dot?.tenNhaAn || "-"}`,
            `Ca ăn: ${dot?.tenCaAn || "-"}`,
            `Bắt đầu bình chọn: ${this.formatNgayGio(dot?.batDauBinhChon)}`,
            `Hạn bình chọn: ${this.formatNgayGio(dot?.hanBinhChon)}`
        ].join(
            "\n"
        );

    }

    buildDuongDanBinhChon(
        dot
    ) {

        const thucDonId =
            Number(
                dot?.thucDonId
            );


        const dotBinhChonId =
            Number(
                dot?.id
            );


        if (
            !Number.isInteger(
                thucDonId
            ) ||
            thucDonId <= 0 ||
            !Number.isInteger(
                dotBinhChonId
            ) ||
            dotBinhChonId <= 0
        ) {

            throw new ApiError(
                500,
                "Không thể xác định đường dẫn chi tiết bình chọn."
            );

        }


        return (
            "/binh-chon/chi-tiet-binh-chon/" +
            thucDonId +
            "/" +
            dotBinhChonId
        );

    }

    buildNoiDungThongBaoHuy(
        dot
    ) {

        return [
            "Đợt bình chọn suất ăn đã bị hủy.",
            "",
            `Thực đơn: ${dot?.tenThucDon || "-"}`,
            `Ngày áp dụng: ${this.formatNgay(dot?.ngay)}`,
            `Nhà ăn: ${dot?.tenNhaAn || "-"}`,
            `Ca ăn: ${dot?.tenCaAn || "-"}`,
            `Lý do hủy: ${dot?.lyDoHuy || "-"}`
        ].join(
            "\n"
        );

    }

    buildDoiTuongThongBao(
        taiKhoanIds
    ) {

        return (
            taiKhoanIds ||
            []
        ).map(
            taiKhoanId => ({

                loaiDoiTuong:
                    30,

                doiTuongId:
                    Number(
                        taiKhoanId
                    )

            })
        );

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
            danhSachTrangThaiTaoBinhChon
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
            ) === 30
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
                danhSachTrangThaiTaoBinhChon
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


        const trangThai =
            Number(
                dot.trangThai
            );


        if (
            ![
                10, 30
            ].includes(
                trangThai
            )
        ) {

            throw new ApiError(
                400,
                "Chỉ được cập nhật đợt bình chọn ở trạng thái Tạo mới hoặc Đã hủy."
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


        const trangThai =
            Number(
                dot.trangThai
            );


        if (
            ![
                10, 30
            ].includes(
                trangThai
            )
        ) {

            throw new ApiError(
                400,
                "Chỉ được gửi đợt bình chọn ở trạng thái Tạo mới hoặc Đã hủy."
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


        const daTonTai =
            await binhChonRepository
                .existsDotHieuLucTheoThucDonNgay(
                    dot.thucDonNgayId,
                    dotId
                );


        if (
            daTonTai
        ) {

            throw new ApiError(
                409,
                "Ngày thực đơn đã có đợt bình chọn khác đang hiệu lực."
            );

        }


        const taiKhoanNhanIds =
            await binhChonRepository
                .getTaiKhoanNhanThongBao(
                    dotId
                );


        if (
            taiKhoanNhanIds.length ===
            0
        ) {

            throw new ApiError(
                400,
                "Không xác định được người dùng nhận đợt bình chọn."
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


        const dotDaGui =
            await binhChonRepository
                .getChiTiet(
                    dotId
                );
        
        const duongDan =
            this.buildDuongDanBinhChon(
                dotDaGui
            );

        const hoTenNguoiGui =
            dotDaGui
                ?.nguoiGui
                ?.hoTen ||
            "Người dùng";


        const tenBinhChon =
            this.getTenBinhChon(
                dotDaGui
            );

        await thongBaoService
            .send({

                tieuDe:
                    `${hoTenNguoiGui} đã tạo bình chọn ${tenBinhChon}`,

                noiDung:
                    this.buildNoiDungThongBaoGui(
                        dotDaGui
                    ),

                guiTatCa:
                    false,

                doiTuong:
                    this.buildDoiTuongThongBao(
                        taiKhoanNhanIds
                    ),

                maSuKien:
                    THONG_BAO_BINH_CHON
                        .GUI,

                loaiThamChieu:
                    THONG_BAO_BINH_CHON
                        .LOAI_THAM_CHIEU,

                thamChieuId:
                    dotId,

                duongDan:
                    duongDan,

                nguoiTaoId:
                    taiKhoanId

            });

        return await this
            .getChiTiet(
                dotId
            );

    }

    async remove(
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


        const trangThai =
            Number(
                dot.trangThai
            );


        if (
            trangThai === 20
        ) {

            throw new ApiError(
                400,
                "Không thể xóa đợt bình chọn ở trạng thái Đã gửi. Vui lòng hủy gửi trước."
            );

        }


        if (
            ![
                10, 30
            ].includes(
                trangThai
            )
        ) {

            throw new ApiError(
                400,
                "Chỉ được xóa đợt bình chọn ở trạng thái Tạo mới hoặc Đã hủy."
            );

        }


        const result =
            await binhChonRepository
                .remove(
                    dotId
                );


        if (
            !result
        ) {

            throw new ApiError(
                400,
                "Không thể xóa đợt bình chọn."
            );

        }


        return {
            id:
                dotId
        };

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
            Number(
                dot.trangThai
            ) !== 20
        ) {

            throw new ApiError(
                400,
                "Chỉ được hủy đợt bình chọn ở trạng thái Đã gửi."
            );

        }


        const lyDoHuy =
            data.lyDoHuy
                ?.trim();


        /*
        * Lấy đối tượng nhận trước khi thay đổi trạng thái.
        */
        const taiKhoanNhanIds =
            await binhChonRepository
                .getTaiKhoanNhanThongBao(
                    dotId
                );


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


        const dotDaHuy =
            await binhChonRepository
                .getChiTiet(
                    dotId
                );


        await thongBaoService
            .thuHoiDuongDanTheoThamChieu(

                THONG_BAO_BINH_CHON
                    .LOAI_THAM_CHIEU,

                dotId,

                THONG_BAO_BINH_CHON
                    .GUI

            );


        /*
        * Nếu vẫn còn người nhận hợp lệ,
        * gửi thông báo hủy cho họ.
        */
        if (
            taiKhoanNhanIds.length >
            0
        ) {

            const hoTenNguoiHuy =
                dotDaHuy
                    ?.nguoiHuy
                    ?.hoTen ||
                "Người dùng";


            const tenBinhChon =
                this.getTenBinhChon(
                    dotDaHuy
                );


            await thongBaoService
                .send({

                    tieuDe:
                        `${hoTenNguoiHuy} hủy bình chọn ${tenBinhChon}`,

                    noiDung:
                        this.buildNoiDungThongBaoHuy(
                            dotDaHuy
                        ),

                    guiTatCa:
                        false,

                    doiTuong:
                        this.buildDoiTuongThongBao(
                            taiKhoanNhanIds
                        ),

                    maSuKien:
                        THONG_BAO_BINH_CHON
                            .HUY,

                    loaiThamChieu:
                        THONG_BAO_BINH_CHON
                            .LOAI_THAM_CHIEU,

                    thamChieuId:
                        dotId,

                    /*
                    * QUAN TRỌNG:
                    * thông báo hủy tuyệt đối
                    * không có đường dẫn.
                    */
                    duongDan:
                        null,

                    nguoiTaoId:
                        taiKhoanId

                });

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
            ) !== 20
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


        const danhSach =
            await binhChonRepository
                .getLichSuCuaToi(
                    accountId,
                    this.chuanHoaFilterLichSu(
                        query
                    )
                );


        const data = [];


        for (
            const dot of
            danhSach
        ) {
            const [
                dsNhomMonAn,
                thongKe
            ] =
                await Promise.all([
                    binhChonRepository
                        .getDanhSachMonAn(
                            dot.id
                        ),

                    binhChonRepository
                        .getThongKe(
                            dot.id
                        )
                ]);


            const luaChon =
                dot.luaChonCuaToi ??
                dot.luaChon ??
                null;


            data.push({
                ...this.mapResponse(
                    dot
                ),

                dotBinhChonId:
                    dot.id,

                luaChonCuaToi:
                    luaChon,

                luaChon:
                    luaChon,

                thoiGianBinhChon:
                    dot.thoiGianBinhChon ??
                    null,

                dsNhomMonAn,

                thongKe
            });
        }


        return data;
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