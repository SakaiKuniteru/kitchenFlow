'use strict';

const {
    randomUUID
} = require(
    'crypto'
);


const repository =
    require(
        './tc05.repository'
    );


const inBaoCaoService =
    require(
        '../../../../services/in-bao-cao/in-bao-cao.service'
    );


const {
    nhomBaoCao:
        dsNhomBaoCao
} = require(
    '../../../../constants/enums'
);


const MA_BAO_CAO =
    'tc_05';


const TEN_BAO_CAO =
    'Báo cáo tổng hợp tiền thu theo người thu';


const DS_NGUON = [

    {
        value:
            'VA',

        name:
            'Vé ăn'
    },

    {
        value:
            'DH',

        name:
            'Đơn hàng'
    }

];


/*
 * Phương thức chuẩn TC05.
 *
 * Không dùng trực tiếp enum của
 * Vé ăn hoặc Đơn hàng ở đây.
 */
const DS_PHUONG_THUC_THANH_TOAN = [

    {
        value:
            10,

        name:
            'Tiền mặt'
    },

    {
        value:
            20,

        name:
            'Chuyển khoản'
    },

    {
        value:
            30,

        name:
            'QR Code'
    },

    {
        value:
            40,

        name:
            'Thanh toán nội bộ'
    }

];


class Tc05Service {

    getPhuongThuc(
        value
    ) {

        return (
            DS_PHUONG_THUC_THANH_TOAN
                .find(
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


    getTheoNguoiThu(
        rows
    ) {

        const groups =
            new Map();


        for (
            const row
            of rows
        ) {

            const key =
                row.nguoiThuId ==
                null
                    ? 'CHUA_XAC_DINH'
                    : String(
                        row.nguoiThuId
                    );


            if (
                !groups.has(
                    key
                )
            ) {

                groups.set(
                    key,
                    {

                        nguoiThuId:
                            row.nguoiThuId,


                        taiKhoanNguoiThu:
                            row.taiKhoanNguoiThu,


                        tenNguoiThu:
                            row.tenNguoiThu ||
                            row.taiKhoanNguoiThu ||
                            (
                                row.nguoiThuId ==
                                null
                                    ? 'Chưa xác định người thu'
                                    : `Tài khoản #${row.nguoiThuId}`
                            ),


                        soGiaoDichThu:
                            0,


                        tienThuVeAn:
                            0,


                        tienThuDonHang:
                            0,


                        tongTienThu:
                            0

                    }
                );

            }


            const group =
                groups.get(
                    key
                );


            const amount =
                Number(
                    row.tongTienThu ??
                    0
                );


            group.soGiaoDichThu +=
                Number(
                    row.soGiaoDichThu ??
                    0
                );


            group.tongTienThu +=
                amount;


            if (
                row.nguon ===
                'VA'
            ) {

                group.tienThuVeAn +=
                    amount;

            }


            if (
                row.nguon ===
                'DH'
            ) {

                group.tienThuDonHang +=
                    amount;

            }
        }


        return [
            ...groups.values()
        ].map(
            (
                item,
                index
            ) => ({

                stt:
                    index + 1,

                ...item

            })
        );
    }


    getTongHop(
        theoNguoiThu
    ) {

        return {

            soNguoiThuDaXacDinh:
                theoNguoiThu
                    .filter(
                        item =>
                            item.nguoiThuId !=
                            null
                    )
                    .length,


            tongSoGiaoDichThu:
                theoNguoiThu
                    .reduce(
                        (
                            sum,
                            item
                        ) =>
                            sum +
                            item
                                .soGiaoDichThu,
                        0
                    ),


            tongTienThuVeAn:
                theoNguoiThu
                    .reduce(
                        (
                            sum,
                            item
                        ) =>
                            sum +
                            item
                                .tienThuVeAn,
                        0
                    ),


            tongTienThuDonHang:
                theoNguoiThu
                    .reduce(
                        (
                            sum,
                            item
                        ) =>
                            sum +
                            item
                                .tienThuDonHang,
                        0
                    ),


            tongTienThu:
                theoNguoiThu
                    .reduce(
                        (
                            sum,
                            item
                        ) =>
                            sum +
                            item
                                .tongTienThu,
                        0
                    ),


            tienChuaXacDinhNguoiThu:
                theoNguoiThu
                    .filter(
                        item =>
                            item.nguoiThuId ==
                            null
                    )
                    .reduce(
                        (
                            sum,
                            item
                        ) =>
                            sum +
                            item
                                .tongTienThu,
                        0
                    )

        };
    }


    buildBoLoc(
        filters
    ) {

        const phuongThucValues =
            filters
                .hinhThucThanhToan
                .length >
            0
                ? filters
                    .hinhThucThanhToan
                : DS_PHUONG_THUC_THANH_TOAN
                    .map(
                        item =>
                            item.value
                    );


        return {

            ...filters,


            nguonThongTin:
                DS_NGUON
                    .filter(
                        item =>
                            filters
                                .nguon
                                .includes(
                                    item.value
                                )
                    ),


            hinhThucThanhToanThongTin:
                DS_PHUONG_THUC_THANH_TOAN
                    .filter(
                        item =>
                            phuongThucValues
                                .includes(
                                    Number(
                                        item.value
                                    )
                                )
                    ),


            ghiChu:
                'Chỉ tính giao dịch thu thành công; '
                + 'không trừ giao dịch hoàn tiền.'

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


        const theoNguoiThu =
            this.getTheoNguoiThu(
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
                        dsNhomBaoCao
                            .find(
                                item =>
                                    Number(
                                        item.value
                                    ) ===
                                    10
                            ) ||
                        null,


                    boLoc:
                        this.buildBoLoc(
                            filters
                        ),


                    tongSoBanGhi:
                        rows.length,


                    tongHop:
                        this.getTongHop(
                            theoNguoiThu
                        ),


                    /*
                     * Tổng hợp chính
                     * theo người thu.
                     */
                    theoNguoiThu,


                    /*
                     * Chi tiết theo:
                     *
                     * người thu
                     * + nguồn
                     * + cơ sở
                     * + nhà ăn
                     * + phương thức
                     */
                    ds:
                        rows.map(
                            (
                                row,
                                index
                            ) => ({

                                stt:
                                    index + 1,


                                ...row,


                                tenNguon:
                                    row.nguon ===
                                    'VA'
                                        ? 'Vé ăn'
                                        : 'Đơn hàng',


                                phuongThucThanhToanThongTin:
                                    this
                                        .getPhuongThuc(
                                            row
                                                .phuongThucThanhToan
                                        ),


                                tenNguoiThuHienThi:
                                    row.tenNguoiThu ||
                                    row.taiKhoanNguoiThu ||
                                    (
                                        row.nguoiThuId ==
                                        null
                                            ? 'Chưa xác định người thu'
                                            : `Tài khoản #${row.nguoiThuId}`
                                    ),


                                tenNhaAnHienThi:
                                    row.tenNhaAn ||
                                    'Chưa xác định nhà ăn'

                            })
                        )

                });


        return inBaoCaoService
            .taoBaoCao({

                maBaoCao:
                    MA_BAO_CAO,


                id:
                    randomUUID(),


                soPhieu:
                    null,


                data,


                nguoiInId:
                    taiKhoanId

            });
    }
}


module.exports =
    new Tc05Service();