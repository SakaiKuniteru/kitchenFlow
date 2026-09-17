'use strict';

const pool = require('../../../../config/database');
const ApiError = require('../../../../utils/api-error');
const cauHinhService = require('../../../cau-hinh/cau-hinh.service');
const { MA_THIET_LAP } = require('../../../cau-hinh/cau-hinh.constants');
const sinhMaTuDongService = require('../../../../services/sinh-ma-tu-dong/sinh-ma-tu-dong.service');
const orderRepository = require('../don-hang/don-hang.repository');
const repository = require('./thanh-toan-don-hang.repository');
const { PHUONG_THUC_THANH_TOAN, TRANG_THAI_THANH_TOAN } = require('../don-hang/don-hang.constants');
const cartService = require('../gio-hang/gio-hang.service');
const historyRepository = require('../lich-su/lich-su-don-hang.repository');
const { LOAI_GIAO_DICH, TRANG_THAI_GIAO_DICH } = require('./thanh-toan.constants');
const gateways = {
    [PHUONG_THUC_THANH_TOAN.NOI_BO]: require('./gateways/noi-bo-payment.gateway'),
    [PHUONG_THUC_THANH_TOAN.TIEN_MAT]: require('./gateways/tien-mat-payment.gateway'),
    [PHUONG_THUC_THANH_TOAN.CHUYEN_KHOAN]: require('./gateways/chuyen-khoan-payment.gateway'),
    [PHUONG_THUC_THANH_TOAN.QR]: require('./gateways/qr-payment.gateway')
};

class ThanhToanService {
        async sinhMaThanhToan(
        maThietLap,
        cot,
        client,
        cotThuTu = 'id',
        thoiDiem = new Date()
    ) {
        const dinhDang =
            await cauHinhService.getDinhDangSinhMa(
                maThietLap
            );

        return await sinhMaTuDongService.sinhMa({
            db: client,
            bang: 'nv_thanh_toan_don_hang',
            cot,
            dinhDang,
            thoiDiem,
            cotThuTu
        });
    }

    async taoMaGiaoDich(
        client,
        thoiDiem = new Date()
    ) {
        return await this.sinhMaThanhToan(
            MA_THIET_LAP.DINH_DANG_MA_GIAO_DICH_DON_HANG,
            'ma_giao_dich',
            client,
            'id',
            thoiDiem
        );
    }

    async taoMaThamChieu(
        client,
        thoiDiem = new Date()
    ) {
        return await this.sinhMaThanhToan(
            MA_THIET_LAP.DINH_DANG_MA_THAM_CHIEU_DON_HANG,
            'ma_tham_chieu',
            client,
            'thoi_gian_thanh_toan',
            thoiDiem
        );
    }

    async taoMaChuanChi(
        client,
        thoiDiem = new Date()
    ) {
        return await this.sinhMaThanhToan(
            MA_THIET_LAP.DINH_DANG_MA_CHUAN_CHI_DON_HANG,
            'ma_chuan_chi',
            client,
            'thoi_gian_thanh_toan',
            thoiDiem
        );
    }

    async create(
        donHangId,
        user,
        manager = false,
        transactionClient = null
    ) {
        const ownsTransaction =
            !transactionClient;

        const client =
            transactionClient ||
            await pool.connect();

        try {
            if (ownsTransaction) {
                await client.query('BEGIN');
            }

            const order =
                await orderRepository.getById(
                    donHangId,
                    client,
                    true
                );

            const profile =
                manager
                    ? await cartService.getNhanVien(
                        user.nhanVienId,
                        client
                    )
                    : null;

            if (
                !order ||
                (
                    manager
                        ? Number(order.co_so_id) !==
                            Number(profile.coSoId)
                        : Number(order.nguoi_dat_id) !==
                            Number(user.nhanVienId)
                )
            ) {
                throw new ApiError(
                    404,
                    'Đơn hàng không tồn tại.'
                );
            }

            if (
                order.trang_thai < 0 ||
                [
                    TRANG_THAI_THANH_TOAN.DA_THANH_TOAN,
                    TRANG_THAI_THANH_TOAN.DA_HOAN_TIEN
                ].includes(
                    order.trang_thai_thanh_toan
                )
            ) {
                throw new ApiError(
                    409,
                    'Đơn hàng không còn cho phép thanh toán.'
                );
            }

            const transactions =
                await repository.list(
                    donHangId,
                    client
                );

            const pending =
                transactions.find(
                    (row) =>
                        Number(row.loaiGiaoDich) ===
                            LOAI_GIAO_DICH.THANH_TOAN &&
                        Number(row.phuongThuc) ===
                            Number(order.phuong_thuc_thanh_toan) &&
                        [
                            TRANG_THAI_GIAO_DICH.KHOI_TAO,
                            TRANG_THAI_GIAO_DICH.CHO_XU_LY
                        ].includes(
                            Number(row.trangThai)
                        ) &&
                        (
                            !row.qrHetHanLuc ||
                            new Date(row.qrHetHanLuc) >
                                new Date()
                        )
                );

            if (pending) {
                if (ownsTransaction) {
                    await client.query('COMMIT');
                }

                return pending;
            }

            const maGiaoDich =
                await this.taoMaGiaoDich(
                    client
                );

            const gateway =
                gateways[
                    order.phuong_thuc_thanh_toan
                ];

            if (!gateway) {
                throw new ApiError(
                    400,
                    'Phương thức thanh toán không hợp lệ.'
                );
            }

            const gatewayData =
                await gateway.create(
                    order,
                    {
                        maGiaoDich
                    }
                );

            const transaction =
                await repository.create(
                    {
                        donHangId,

                        loaiGiaoDich:
                            LOAI_GIAO_DICH.THANH_TOAN,

                        phuongThuc:
                            order.phuong_thuc_thanh_toan,

                        soTien:
                            order.tong_thanh_toan,

                        trangThai:
                            gatewayData.choXuLy
                                ? TRANG_THAI_GIAO_DICH.CHO_XU_LY
                                : TRANG_THAI_GIAO_DICH.KHOI_TAO,

                        nguoiKhoiTaoId:
                            user.nhanVienId,

                        ...gatewayData,

                        maGiaoDich
                    },
                    client
                );

            if (ownsTransaction) {
                await client.query('COMMIT');
            }

            return transaction;
        } catch (error) {
            if (ownsTransaction) {
                await client.query('ROLLBACK');
            }

            throw error;
        } finally {
            if (ownsTransaction) {
                client.release();
            }
        }
    }

    async list(donHangId, user) {
        const order = await orderRepository.getById(donHangId);
        if (!order || Number(order.nguoi_dat_id) !== Number(user.nhanVienId)) {
            throw new ApiError(404, 'Đơn hàng không tồn tại.');
        }
        return repository.list(donHangId);
    }

    async confirm(
        id,
        data,
        user,
        transactionClient = null
    ) {
        const ownsTransaction =
            !transactionClient;

        const client =
            transactionClient ||
            await pool.connect();

        try {
            if (ownsTransaction) {
                await client.query('BEGIN');
            }

            const transaction =
                await client.query(
                    `
                        SELECT
                            don_hang_id

                        FROM nv_thanh_toan_don_hang

                        WHERE id = $1
                    `,
                    [
                        id
                    ]
                );

            if (!transaction.rows.length) {
                throw new ApiError(
                    404,
                    'Giao dịch không tồn tại.'
                );
            }

            const order =
                await orderRepository.getById(
                    transaction.rows[0].don_hang_id,
                    client,
                    true
                );

            const profile =
                await cartService.getNhanVien(
                    user.nhanVienId,
                    client
                );

            if (
                Number(order.co_so_id) !==
                Number(profile.coSoId)
            ) {
                throw new ApiError(
                    403,
                    'Không thể xác nhận thanh toán của cơ sở khác.'
                );
            }

            if (
                order.trang_thai < 0 ||
                [
                    TRANG_THAI_THANH_TOAN.DA_THANH_TOAN,
                    TRANG_THAI_THANH_TOAN.DA_HOAN_TIEN
                ].includes(
                    order.trang_thai_thanh_toan
                )
            ) {
                throw new ApiError(
                    409,
                    'Đơn đã hủy, đã thanh toán hoặc đã hoàn tiền.'
                );
            }

            const thoiDiemSinhMa =
                new Date();

            const maThamChieu =
                await this.taoMaThamChieu(
                    client,
                    thoiDiemSinhMa
                );

            const maChuanChi =
                await this.taoMaChuanChi(
                    client,
                    thoiDiemSinhMa
                );

            const result =
                await repository.confirm(
                    id,
                    {
                        maGiaoDich:
                            data.maGiaoDich,

                        maThamChieu,

                        maChuanChi,

                        trangThai:
                            TRANG_THAI_GIAO_DICH.THANH_CONG
                    },
                    user.nhanVienId,
                    client
                );

            if (!result.rowCount) {
                throw new ApiError(
                    409,
                    'Giao dịch đã xử lý, đã hết hạn hoặc mã giao dịch không đúng.'
                );
            }

            if (
                Number(order.phuong_thuc_thanh_toan) !==
                PHUONG_THUC_THANH_TOAN.QR
            ) {
                await repository.recordCollector(
                    id,
                    user.taiKhoanId,
                    client
                );
            }

            await client.query(
                `
                    UPDATE nv_don_hang

                    SET
                        trang_thai_thanh_toan = $2,
                        version = version + 1,
                        updated_at = NOW()

                    WHERE id = $1
                `,
                [
                    result.rows[0].don_hang_id,
                    TRANG_THAI_THANH_TOAN.DA_THANH_TOAN
                ]
            );

            await historyRepository.create(
                {
                    donHangId:
                        order.id,

                    trangThaiCu:
                        order.trang_thai,

                    trangThaiMoi:
                        order.trang_thai,

                    hanhDong:
                        'XAC_NHAN_THANH_TOAN',

                    noiDung:
                        `Đã xác nhận nhận thanh toán · ${data.maGiaoDich}`,

                    nguoiThucHienId:
                        user.nhanVienId
                },
                client
            );

            const payments =
                await repository.list(
                    result.rows[0].don_hang_id,
                    client
                );

            if (ownsTransaction) {
                await client.query('COMMIT');
            }

            return payments;
        } catch (error) {
            if (ownsTransaction) {
                await client.query('ROLLBACK');
            }

            throw error;
        } finally {
            if (ownsTransaction) {
                client.release();
            }
        }
    }

    async settleOnDelivery(order, user, client) {
        const method = Number(order.phuong_thuc_thanh_toan);
        const status = Number(order.trang_thai_thanh_toan);

        // Đã thanh toán thì không thu lại, không đổi người thu cũ.
        if (status === TRANG_THAI_THANH_TOAN.DA_THANH_TOAN) {
            return;
        }

        if (method === PHUONG_THUC_THANH_TOAN.QR) {
            throw new ApiError(
                409,
                'Đơn QR phải thanh toán trước khi hoàn thành.'
            );
        }

        const methods = [
            PHUONG_THUC_THANH_TOAN.NOI_BO,
            PHUONG_THUC_THANH_TOAN.TIEN_MAT,
            PHUONG_THUC_THANH_TOAN.CHUYEN_KHOAN
        ];

        if (!methods.includes(method)) {
            throw new ApiError(400, 'Phương thức thanh toán không hợp lệ.');
        }

        if (status === TRANG_THAI_THANH_TOAN.DA_HOAN_TIEN) {
            throw new ApiError(
                409,
                'Không tự thu tiền cho đơn đã hoàn tiền.'
            );
        }

        const transaction = await this.create(
            order.id,
            user,
            true,
            client
        );

        await this.confirm(
            transaction.id,
            {
                maGiaoDich:
                    transaction.maGiaoDich || transaction.ma_giao_dich
            },
            user,
            client
        );
    }
}

module.exports = new ThanhToanService();
