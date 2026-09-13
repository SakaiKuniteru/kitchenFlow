'use strict';

const { trangThaiThucDon, loaiThucDon } = require('../constants/enums');
const { renderPage } = require('../utils/render-page.util');

function getFormOptions() {
    return {
        loaiThucDon: loaiThucDon.map((item) => ({
            value: String(item.value),
            label: item.label
        })),

        trangThai: trangThaiThucDon.map((item) => ({
            value: String(item.value),
            label: item.label
        }))
    };
}

class ThucDonWebController {
    async danhSach(
        req,
        res,
        next
    ) {
        try {

            const columns = [
                {
                    key:
                        'maThucDon',

                    label:
                        'Mã thực đơn',

                    type:
                        'text',

                    width:
                        '150px',

                    sortable: true
                },

                {
                    key:
                        'tenThucDon',

                    label:
                        'Tên thực đơn',

                    type:
                        'text',

                    width:
                        '220px',

                    sortable: true
                },

                {
                    key:
                        'loaiThucDon',

                    label:
                        'Loại thực đơn',

                    type:
                        'text',

                    width:
                        '150px',

                    sortable: true
                },

                {
                    key:
                        'tenCoSo',

                    label:
                        'Cơ sở',

                    type:
                        'text',

                    width:
                        '170px',

                    sortable: true
                },

                {
                    key:
                        'tenNhaAn',

                    label:
                        'Nhà ăn',

                    type:
                        'text',

                    width:
                        '170px',

                    sortable: true
                },

                {
                    key:
                        'tenCaAn',

                    label:
                        'Ca ăn',

                    type:
                        'text',

                    width:
                        '150px',

                    sortable: true
                },

                {
                    key:
                        'trangThai',

                    label:
                        'Trạng thái',

                    type:
                        'text',

                    width:
                        '160px',

                    sortable: true
                }
            ];


            const filters = [
                {
                    type:
                        'select',

                    id:
                        'loaiThucDon',

                    name:
                        'loaiThucDon',

                    label:
                        'Loại thực đơn',

                    placeholder:
                        'Chọn loại thực đơn',

                    mode:
                        'multiple',

                    multiple:
                        true,

                    allowAll:
                        true,

                    source:
                        '/api/mcs/v1/enums?name=loaiThucDon',

                    valueKey:
                        'value',

                    labelKey:
                        'name'
                },

                {
                    type:
                        'select',

                    id:
                        'coSoId',

                    name:
                        'coSoId',

                    label:
                        'Cơ sở',

                    placeholder:
                        'Chọn cơ sở',

                    mode:
                        'multiple',

                    multiple:
                        true,

                    allowAll:
                        true,

                    source:
                        '/api/mcs/v1/dm-co-so/tong-hop?active=true',

                    valueKey:
                        'id',

                    labelKey:
                        'tenCoSo'
                },

                {
                    type:
                        'select',

                    id:
                        'nhaAnId',

                    name:
                        'nhaAnId',

                    label:
                        'Nhà ăn',

                    placeholder:
                        'Chọn nhà ăn',

                    mode:
                        'multiple',

                    multiple:
                        true,

                    allowAll:
                        true,

                    source:
                        '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

                    valueKey:
                        'id',

                    labelKey:
                        'tenNhaAn'
                },

                {
                    type:
                        'select',

                    id:
                        'caAnId',

                    name:
                        'caAnId',

                    label:
                        'Ca ăn',

                    placeholder:
                        'Chọn ca ăn',

                    mode:
                        'multiple',

                    multiple:
                        true,

                    allowAll:
                        true,

                    source:
                        '/api/mcs/v1/dm-ca-an/tong-hop?active=true',

                    valueKey:
                        'id',

                    labelKey:
                        'tenCaAn'
                },

                {
                    type:
                        'select',

                    id:
                        'trangThai',

                    name:
                        'trangThai',

                    label:
                        'Trạng thái',

                    placeholder:
                        'Chọn trạng thái',

                    mode:
                        'multiple',

                    multiple:
                        true,

                    allowAll:
                        true,

                    source:
                        '/api/mcs/v1/enums?name=trangThaiThucDon',

                    valueKey:
                        'value',

                    labelKey:
                        'name'
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


            const listPage = {
                moduleName:
                    'thuc-don',

                title:
                    'Danh sách thực đơn',

                listEndpoint:
                    '/api/mcs/v1/thuc-don/tong-hop',

                showIndex:
                    true,

                showSearch:
                    true,

                selectable:
                    false,

                showRowActions:
                    true,

                searchId:
                    'thucDonListSearch',

                searchPlaceholder:
                    'Tìm theo mã hoặc tên thực đơn...',

                paginationId:
                    'thucDonPagination',

                filterPanelClassName:
                    'data-list-filter--thuc-don',

                filterBodyClassName:
                    'thuc-don-list-filter',

                actions: [
                    {
                        action:
                            'create',

                        label:
                            'Thêm mới',

                        icon:
                            'fa-solid fa-plus',

                        className:
                            'data-list-btn--primary',

                        url:
                            '/thuc-don/them-moi-thuc-don'
                    },

                    {
                        action:
                            'filter',

                        label:
                            'Bộ lọc',

                        icon:
                            'fa-solid fa-filter',

                        className:
                            'data-list-btn--outline'
                    }
                ],

                bulkActions: [],

                summaryCards: [],

                columns,

                filters:
                    normalizedFilters,

                /*
                * 7 cột dữ liệu
                * + 1 cột thao tác.
                */
                colspan:
                    columns.length +
                    2
            };


            return renderPage(
                req,
                res,
                'pages/thuc-don/danh-sach',
                {
                    title:
                        'Danh sách thực đơn',

                    activeMenu:
                        'thuc-don',

                    listPage,

                    formOptions:
                        getFormOptions()
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

    async themMoi(req, res, next) {
        try {
            return renderPage(req, res, 'pages/thuc-don/them-moi', {
                title: 'Thêm mới thực đơn',
                activeMenu: 'thuc-don',
                formMode: 'create',
                formOptions: getFormOptions(),

                breadcrumbs: [
                    {
                        label: 'Danh sách thực đơn',
                        path: '/thuc-don/danh-sach-thuc-don'
                    },
                    {
                        label: 'Thêm mới'
                    }
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async chiTiet(req, res, next) {
        try {
            const { id } = req.params;

            return renderPage(req, res, 'pages/thuc-don/chi-tiet', {
                title: 'Chi tiết thực đơn',
                thucDonId: id,
                formMode: 'detail',
                activeMenu: 'thuc-don',
                formOptions: getFormOptions(),

                breadcrumbs: [
                    {
                        label: 'Danh sách thực đơn',
                        path: '/thuc-don/danh-sach-thuc-don'
                    },
                    {
                        label: 'Chi tiết'
                    }
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async capNhat(req, res, next) {
        try {
            const { id } = req.params;

            return renderPage(req, res, 'pages/thuc-don/cap-nhat', {
                title: 'Cập nhật thực đơn',
                thucDonId: id,
                formMode: 'update',
                activeMenu: 'thuc-don',
                formOptions: getFormOptions(),

                breadcrumbs: [
                    {
                        label: 'Danh sách thực đơn',
                        path: '/thuc-don/danh-sach-thuc-don'
                    },
                    {
                        label: 'Chi tiết',
                        path: `/thuc-don/thong-tin-chi-tiet-thuc-don/${id}`
                    },
                    {
                        label: 'Cập nhật'
                    }
                ]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ThucDonWebController();
