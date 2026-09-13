'use strict';

const { renderPage } = require('../utils/render-page.util');

class ChiTietWebController {
    async cuaToi(req, res, next) {
        try {
            return renderPage(req, res, 'pages/chi-tiet/thong-bao', {
                title: 'Thông báo',
            });
        } catch (error) {
            next(error);
        }
    }

    async thucDon(req, res, next) {
        try {
            const { thucDonId, thucDonNgayId } = req.params;
            return renderPage(req, res, 'pages/chi-tiet/thuc-don', {
                title: 'Chi tiết thực đơn',
                thucDonId: thucDonId,
                thucDonNgayId: thucDonNgayId
            });
        } catch (error) {
            next(error);
        }
    }

    async danhSachBinhChon(req, res, next) {
        try {
            return renderPage(req, res, 'pages/chi-tiet/danh-sach-binh-chon', {
                title: 'Danh sách bình chọn',
            });
        } catch (error) {
            next(error);
        }
    }

    async binhChon(req, res, next) {
        try {
            const thucDonId = Number(req.params.thucDonId);
            const dotBinhChonId = Number(req.params.dotBinhChonId);
            if (
                !Number.isInteger(thucDonId) ||
                thucDonId <= 0 ||
                !Number.isInteger(dotBinhChonId) ||
                dotBinhChonId <= 0
            ) {
                return res.redirect('/binh-chon/danh-sach-binh-chon');
            }

            return renderPage(req, res, 'pages/chi-tiet/binh-chon', {
                title: 'Bình chọn',
                thucDonId,
                dotBinhChonId,

                breadcrumbs: [
                    {
                        label: 'Danh sách bình chọn',
                        path: '/binh-chon/danh-sach-binh-chon'
                    },
                    {
                        label: 'Bình chọn'
                    }
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async lichSuBinhChon(req, res, next) {
        try {
            return renderPage(req, res, 'pages/chi-tiet/lich-su-binh-chon', {
                title: 'Lịch sử bình chọn',
                breadcrumbs: [
                    {
                        label: 'Bình chọn',
                        path: '/binh-chon/chi-tiet-binh-chon/:thucDonId/:dotBinhChonId'
                    },
                    {
                        label: 'Lịch sử bình chọn'
                    }
                ]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChiTietWebController();
