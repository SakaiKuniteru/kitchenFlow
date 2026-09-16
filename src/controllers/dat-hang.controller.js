'use strict';

const { renderPage } = require('../utils/render-page.util');

function renderOrderPage(req, res, view, options = {}) {
    return renderPage(req, res, view, {
        layout: 'app',
        activeMenu: 'dat-hang',
        orderFlowPage: true,
        orderScript: '/assets/js/pages/dat-hang/order-flow.js',
        ...options
    });
}

function column(
    key,
    label,
    options = {}
) {

    return {

        key,

        label,


        type:
            options.type ||
            'text',


        width:
            options.width ||
            '',


        sortable:
            options.sortable !==
            false

    };

}

function buildOrderListPage(
    management = false
) {

    const columns = [

        column(
            'maDonHang',
            'Mã đơn',
            {
                width:
                    '140px'
            }
        ),

        column(
            'thoiGianDat',
            'Thời gian đặt',
            {
                type:
                    'datetime',

                width:
                    '170px'
            }
        ),

        ...(
            management
                ? [
                    column(
                        'nguoiDat',
                        'Người đặt',
                        {
                            width:
                                '160px'
                        }
                    )
                ]
                : []
        ),

        column(
            'nguoiNhan',
            'Người nhận',
            {
                width:
                    '160px'
            }
        ),

        column(
            'soLoai',
            'Số loại',
            {
                type:
                    'number',

                width:
                    '90px'
            }
        ),

        column(
            'tongSoLuong',
            'Tổng SL',
            {
                type:
                    'number',

                width:
                    '90px'
            }
        ),

        column(
            'tongThanhToan',
            'Tổng tiền',
            {
                type:
                    'money',

                width:
                    '130px'
            }
        ),

        ...(
            management
                ? [
                    column(
                        'phuongThucThanhToan',
                        'PTTT',
                        {
                            width:
                                '130px'
                        }
                    )
                ]
                : []
        ),

        column(
            'trangThai',
            'Trạng thái',
            {
                width:
                    '150px'
            }
        )

    ];


    const filters = [

        {
            type:
                'select',

            id:
                'orderStatusFilter',

            name:
                'trangThai',

            label:
                'Trạng thái đơn',

            mode:
                'single',

            multiple:
                false,

            allowAll:
                false,

            placeholder:
                'Tất cả trạng thái'
        },

        {
            type:
                'select',

            id:
                'orderPaymentFilter',

            name:
                'trangThaiThanhToan',

            label:
                'Thanh toán',

            mode:
                'single',

            multiple:
                false,

            allowAll:
                false,

            placeholder:
                'Tất cả'
        },

        {
            type:
                'dateRange',

            label:
                'Thời gian đặt',

            from: {
                id:
                    'orderFromDate',

                name:
                    'tuNgay',

                label:
                    'Từ ngày',

                placeholder:
                    'dd/MM/yyyy HH:mm:ss',

                showTime:
                    true,

                defaultTime:
                    '00:00:00'
            },

            to: {
                id:
                    'orderToDate',

                name:
                    'denNgay',

                label:
                    'Đến ngày',

                placeholder:
                    'dd/MM/yyyy HH:mm:ss',

                showTime:
                    true,

                defaultTime:
                    '23:59:59'
            }
        }

    ];


    const normalizedFilters =
        filters.map(
            filter => ({
                ...filter,

                isDateRange:
                    filter.type ===
                    'dateRange',

                isSelect:
                    filter.type ===
                    'select',

                isInput:
                    filter.type ===
                    'input',

                isNumber:
                    filter.type ===
                    'number'
            })
        );


    return {

        moduleName:
            management
                ? 'nhan-don-hang'
                : 'don-hang-cua-toi',

        showIndex:
            true,

        showSearch:
            true,

        selectable:
            false,

        showRowActions:
            false,

        bulkActions:
            [],

        searchId:
            'orderListSearch',

        searchPlaceholder:
            management
                ? 'Tìm mã đơn, người đặt, người nhận...'
                : 'Tìm theo mã đơn hoặc người nhận...',

        columns,

        filters:
            normalizedFilters,

        colspan:
            columns.length +
            1

    };

}

class DatHangWebController {
    datMon(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/dat-hang', {
                title: 'Đặt món',
                breadcrumbs: [{ label: 'Đặt món' }],
                orderPage: 'catalog'
            });
        } catch (error) {
            next(error);
        }
    }

    thongTinNhanHang(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/thong-tin-nhan-hang', {
                title: 'Thông tin nhận hàng',
                breadcrumbs: [
                    { label: 'Đặt món', path: '/dat-hang/dat-mon' },
                    { label: 'Thông tin nhận hàng' }
                ],
                orderPage: 'delivery',
                taiKhoanId: req.params.taiKhoanId
            });
        } catch (error) {
            next(error);
        }
    }

    xacNhanDonHang(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/xac-nhan-don-hang', {
                title: 'Xác nhận đơn hàng',
                breadcrumbs: [
                    { label: 'Đặt món', path: '/dat-hang/dat-mon' },
                    { label: 'Xác nhận đơn hàng' }
                ],
                orderPage: 'confirmation',
                taiKhoanId: req.params.taiKhoanId
            });
        } catch (error) {
            next(error);
        }
    }

    hoanTatDonHang(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/hoan-tat-don-hang', {
                title: 'Hoàn tất đơn hàng',
                breadcrumbs: [
                    { label: 'Đặt món', path: '/dat-hang/dat-mon' },
                    { label: 'Hoàn tất' }
                ],
                orderPage: 'completed',
                taiKhoanId: req.params.taiKhoanId,
                orderId: req.params.donHangId
            });
        } catch (error) {
            next(error);
        }
    }

    nhanDonHang(
        req,
        res,
        next
    ) {
        try {

            return renderOrderPage(
                req,
                res,
                'pages/dat-hang/nhan-don-hang',
                {
                    title:
                        'Nhận đơn hàng',

                    breadcrumbs: [
                        {
                            label:
                                'Nhận đơn hàng'
                        }
                    ],

                    orderPage:
                        'management',

                    listPage:
                        buildOrderListPage(
                            true
                        )
                }
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }
    }

    chiTietXuLyDonHang(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/chi-tiet-xu-ly-don-hang', {
                title: 'Chi tiết xử lý đơn hàng',
                breadcrumbs: [
                    { label: 'Nhận đơn hàng', path: '/dat-hang/nhan-don-hang' },
                    { label: 'Chi tiết xử lý đơn hàng' }
                ],
                orderPage: 'management-detail',
                nguoiDatId: req.params.nguoiDatId,
                orderId: req.params.donHangId
            });
        } catch (error) {
            next(error);
        }
    }

    danhSachDonHangCuaToi(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/danh-sach-don-hang-cua-toi', {
                title: 'Đơn hàng của tôi',
                breadcrumbs: [{ label: 'Đơn hàng của tôi' }],
                orderPage: 'my-orders',
                listPage:
                    buildOrderListPage(
                        false
                    )
            });
        } catch (error) {
            next(error);
        }
    }

    chiTietDonHangCuaToi(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/chi-tiet-don-hang-cua-toi', {
                title: 'Chi tiết đơn hàng',
                breadcrumbs: [
                    { label: 'Đơn hàng của tôi', path: '/dat-hang/danh-sach-don-hang-cua-toi' },
                    { label: 'Chi tiết đơn hàng' }
                ],
                orderPage: 'my-order-detail',
                taiKhoanId: req.params.taiKhoanId,
                orderId: req.params.donHangId
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DatHangWebController();