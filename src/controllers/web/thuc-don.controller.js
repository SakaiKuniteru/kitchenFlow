"use strict";

const {
    trangThaiThucDon,
    loaiThucDon
} = require("../../constants/enums");


class ThucDonWebController {

    async danhSach(
        req,
        res,
        next
    ) {

        try {

            return res.render(
                "pages/thuc-don/danh-sach/index",
                {

                    layout:
                        "app",

                    title:
                        "Danh sách thực đơn",

                    pageTitle:
                        "Danh sách thực đơn",

                    pageDescription:
                        "Quản lý danh sách thực đơn.",

                    isModuleListPage:
                        true,

                    activeMenu:
                        "thuc-don",

                    columns: [

                        {
                            key: "maThucDon",
                            label: "Mã thực đơn"
                        },

                        {
                            key: "tenThucDon",
                            label: "Tên thực đơn"
                        },

                        {
                            key: "loaiThucDonText",
                            label: "Loại thực đơn"
                        },

                        {
                            key: "coSo",
                            label: "Cơ sở"
                        },

                        {
                            key: "nhaAn",
                            label: "Nhà ăn"
                        },

                        {
                            key: "caAn",
                            label: "Ca ăn"
                        },

                        {
                            key: "trangThaiText",
                            label: "Trạng thái"
                        }

                    ],

                    formOptions: {

                        loaiThucDon:
                            loaiThucDon.map(
                                item => ({
                                    value:
                                        String(
                                            item.value
                                        ),

                                    label:
                                        item.label
                                })
                            ),

                        trangThai:
                            trangThaiThucDon.map(
                                item => ({
                                    value:
                                        String(
                                            item.value
                                        ),

                                    label:
                                        item.label
                                })
                            )

                    },

                    breadcrumbs: [
                        {
                            label:
                                "Trang chủ",

                            href:
                                "/"
                        },
                        {
                            label:
                                "Danh sách thực đơn"
                        }
                    ]

                }
            );

        } catch (error) {

            next(error);

        }

    }


    async taoMoi(
        req,
        res,
        next
    ) {

        try {

            return res.render(
                "pages/thuc-don/tao-moi/index",
                {

                    layout:
                        "app",

                    title:
                        "Thêm mới thực đơn",

                    pageTitle:
                        "Thêm mới thực đơn",

                    activeMenu:
                        "thuc-don",

                    formOptions: {

                        loaiThucDon:
                            loaiThucDon.map(
                                item => ({
                                    value:
                                        String(
                                            item.value
                                        ),

                                    label:
                                        item.label
                                })
                            ),

                        trangThai:
                            trangThaiThucDon.map(
                                item => ({
                                    value:
                                        String(
                                            item.value
                                        ),

                                    label:
                                        item.label
                                })
                            )

                    },

                    breadcrumbs: [
                        {
                            label:
                                "Trang chủ",

                            href:
                                "/"
                        },
                        {
                            label:
                                "Danh sách thực đơn",

                            href:
                                "/thuc-don/danh-sach-thuc-don"
                        },
                        {
                            label:
                                "Thêm mới thực đơn"
                        }
                    ]

                }
            );

        } catch (error) {

            next(error);

        }

    }


    async chiTiet(
        req,
        res,
        next
    ) {

        try {

            return res.render(
                "pages/thuc-don/chi-tiet/index",
                {

                    layout:
                        "app",

                    title:
                        "Chi tiết thực đơn",

                    pageTitle:
                        "Chi tiết thực đơn",

                    thucDonId:
                        req.params.id,

                    activeMenu:
                        "thuc-don",

                    formOptions: {

                        loaiThucDon:
                            loaiThucDon.map(
                                item => ({
                                    value:
                                        String(
                                            item.value
                                        ),

                                    label:
                                        item.label
                                })
                            ),

                        trangThai:
                            trangThaiThucDon.map(
                                item => ({
                                    value:
                                        String(
                                            item.value
                                        ),

                                    label:
                                        item.label
                                })
                            )

                    },

                    breadcrumbs: [
                        {
                            label:
                                "Trang chủ",

                            href:
                                "/"
                        },
                        {
                            label:
                                "Danh sách thực đơn",

                            href:
                                "/thuc-don/danh-sach-thuc-don"
                        },
                        {
                            label:
                                "Chi tiết thực đơn"
                        }
                    ]

                }
            );

        } catch (error) {

            next(error);

        }

    }

}


module.exports =
    new ThucDonWebController();