"use strict";

const { trangThaiThucDon, loaiThucDon } = require("../../constants/enums");


class ThucDonWebController {

    async danhSach(
        req,
        res,
        next
    ) {

        try {

            return res.render(
                "pages/thuc-don/danh-sach",
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
                            key: "loaiThucDon",
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
                            key: "trangThai",
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


    async themMoi(
        req,
        res,
        next
    ) {

        try {

            return res.render(
                "pages/thuc-don/them-moi",
                {

                    layout:
                        "app",

                    title:
                        "Thêm mới thực đơn",

                    pageTitle:
                        "Thêm mới thực đơn",

                    activeMenu:
                        "thuc-don",

                    formMode:
                        "create",

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

                    }

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
                "pages/thuc-don/chi-tiet",
                {

                    layout:
                        "app",

                    title:
                        "Chi tiết thực đơn",

                    pageTitle:
                        "Chi tiết thực đơn",

                    thucDonId:
                        req.params.id,

                    formMode:
                        "detail",

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

                    }

                }
            );

        } catch (error) {

            next(error);

        }

    }

    async capNhat(
        req,
        res,
        next
    ) {

        try {

            return res.render(
                "pages/thuc-don/cap-nhat",
                {

                    layout:
                        "app",

                    title:
                        "Cập nhật thực đơn",

                    pageTitle:
                        "Cập nhật thực đơn",

                    thucDonId:
                        req.params.id,

                    formMode:
                        "update",

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

                    }

                }
            );

        } catch (error) {

            next(error);

        }

    }

}


module.exports =
    new ThucDonWebController();