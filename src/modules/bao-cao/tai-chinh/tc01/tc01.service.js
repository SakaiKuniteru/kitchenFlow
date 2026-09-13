'use strict';

const {
    randomUUID
} = require(
    'crypto'
);


const repository = require(
    './tc01.repository'
);


const inBaoCaoService = require(
    '../../../../services/in-bao-cao/in-bao-cao.service'
);

const {
    loaiThoiGian:
        dsLoaiThoiGian,

    nhomBaoCao:
        dsNhomBaoCao,

    doiTuongLayVe:
        dsDoiTuongLayVe,

    phuongThucThanhToan:
        dsPhuongThucThanhToan,

    thuChi:
        dsThuChi,

    trangThaiThanhToan:
        dsTrangThaiThanhToan,

    trangThaiVe:
        dsTrangThaiVe

} = require(
    '../../../../constants/enums'
);

const MA_BAO_CAO =
    'tc_01';


const TEN_BAO_CAO =
    'Báo cáo chi tiết thu chi';


const NHOM_BAO_CAO_TAI_CHINH =
    10;


class Tc01Service {

    getEnumItem(
        danhSach,
        value
    ) {
        return (
            danhSach.find(
                item =>
                    Number(
                        item.value
                    ) ===
                    Number(
                        value
                    )
            ) ||
            null
        );
    }


    getEnumItems(
        danhSach,
        values = []
    ) {
        if (
            !Array.isArray(
                values
            )
        ) {
            return [];
        }


        return values
            .map(
                value =>
                    this.getEnumItem(
                        danhSach,
                        value
                    )
            )
            .filter(
                Boolean
            );
    }


    getNhomBaoCao() {
        return this.getEnumItem(
            dsNhomBaoCao,
            NHOM_BAO_CAO_TAI_CHINH
        );
    }


    getTongHop(
        rows
    ) {
        const LOAI_THU =
            Number(
                this.getEnumItem(
                    dsThuChi,
                    10
                )?.value ||
                10
            );


        const LOAI_CHI =
            Number(
                this.getEnumItem(
                    dsThuChi,
                    20
                )?.value ||
                20
            );

        const THANH_TOAN_THANH_CONG =
            30;


        let tongThu = 0;
        let tongChi = 0;

        let soGiaoDichThu = 0;
        let soGiaoDichChi = 0;


        for (
            const row of rows
        ) {

            const loaiGiaoDich =
                Number(
                    row.loaiGiaoDich
                );


            const trangThai =
                Number(
                    row.trangThaiThanhToan
                );


            const soTien =
                Number(
                    row.soTien ||
                    0
                );


            if (
                loaiGiaoDich ===
                LOAI_THU
            ) {
                soGiaoDichThu++;
            }


            if (
                loaiGiaoDich ===
                LOAI_CHI
            ) {
                soGiaoDichChi++;
            }


            /*
             * Tổng tiền thực tế
             * chỉ tính giao dịch thành công.
             */
            if (
                trangThai !==
                THANH_TOAN_THANH_CONG
            ) {
                continue;
            }


            if (
                loaiGiaoDich ===
                LOAI_THU
            ) {
                tongThu +=
                    soTien;
            }


            if (
                loaiGiaoDich ===
                LOAI_CHI
            ) {
                tongChi +=
                    soTien;
            }
        }


        return {

            tongSoGiaoDich:
                rows.length,

            soGiaoDichThu,

            soGiaoDichChi,

            tongThu,

            tongChi,

            chenhLech:
                tongThu -
                tongChi

        };
    }

    buildBoLoc(
        filters
    ) {
        return {

            /*
            * ==========================
            * THỜI GIAN
            * ==========================
            */

            loaiThoiGian:
                filters.loaiThoiGian,

            loaiThoiGianThongTin:
                this.getEnumItem(
                    dsLoaiThoiGian,
                    filters.loaiThoiGian
                ),

            tuNgay:
                filters.tuNgay,

            denNgay:
                filters.denNgay,


            /*
            * ==========================
            * TỔ CHỨC
            * ==========================
            */

            coSoIds:
                filters.coSoIds ||
                [],

            nhaAnIds:
                filters.nhaAnIds ||
                [],

            caAnIds:
                filters.caAnIds ||
                [],


            /*
            * ==========================
            * ĐỐI TƯỢNG
            * ==========================
            */

            doiTuong:
                filters.doiTuong ||
                [],

            doiTuongThongTin:
                this.getEnumItems(
                    dsDoiTuongLayVe,
                    filters.doiTuong
                ),


            /*
            * ==========================
            * NGƯỜI TẠO / THU NGÂN
            * ==========================
            */

            nguoiTaoIds:
                filters.nguoiTaoIds ||
                [],

            thuNganIds:
                filters.thuNganIds ||
                [],


            /*
            * ==========================
            * HÌNH THỨC THANH TOÁN
            * ==========================
            */

            hinhThucThanhToan:
                filters
                    .hinhThucThanhToan ||
                [],

            hinhThucThanhToanThongTin:
                this.getEnumItems(
                    dsPhuongThucThanhToan,
                    filters.hinhThucThanhToan
                ),


            /*
            * ==========================
            * THU / CHI
            * ==========================
            */

            hienThiThuChi:
                filters.hienThiThuChi ||
                [],

            hienThiThuChiThongTin:
                this.getEnumItems(
                    dsThuChi,
                    filters.hienThiThuChi
                ),


            /*
            * ==========================
            * TRẠNG THÁI THANH TOÁN
            * ==========================
            */

            trangThaiThanhToan:
                filters
                    .trangThaiThanhToan ||
                [],

            trangThaiThanhToanThongTin:
                this.getEnumItems(
                    dsTrangThaiThanhToan,
                    filters
                        .trangThaiThanhToan
                ),


            /*
            * ==========================
            * TRẠNG THÁI SỬ DỤNG
            * ==========================
            */

            trangThaiSuDung:
                filters.trangThaiSuDung ||
                [],

            trangThaiSuDungThongTin:
                this.getEnumItems(
                    dsTrangThaiVe,
                    filters.trangThaiSuDung
                )

        };
    }

    async taoBaoCao(
        filters,
        taiKhoanId
    ) {
        const rows =
            await repository
                .getDuLieu(
                    filters
                );


        const tongHop =
            this.getTongHop(
                rows
            );


        const data =
            inBaoCaoService
                .normalizeReportData({

                    maBaoCao:
                        MA_BAO_CAO,

                    tenBaoCao:
                        TEN_BAO_CAO,

                    nhomBaoCao:
                        this.getNhomBaoCao(),

                    boLoc:
                        this.buildBoLoc(
                            filters
                        ),

                    tongSoBanGhi:
                        rows.length,

                    tongHop,

                    danhSach:
                        rows.map(
                            (
                                row,
                                index
                            ) => ({
                                stt:
                                    index + 1,

                                ...row
                            })
                        )

                });


        const lanBaoCaoId =
            randomUUID();


        return await inBaoCaoService
            .taoBaoCao({

                maBaoCao:
                    MA_BAO_CAO,

                id:
                    lanBaoCaoId,

                soPhieu:
                    null,

                data,

                nguoiInId:
                    taiKhoanId

            });
    }

}


module.exports =
    new Tc01Service();