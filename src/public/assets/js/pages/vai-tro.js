"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "vai-tro",

                detailTitle:
                    "Thông tin vai trò",

                columns: [
                    {
                        key: "maVaiTro",
                        label: "Mã vai trò",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenVaiTro",
                        label: "Tên vai trò",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "moTa",
                        label: "Mô tả",
                        filterable: true
                    },
                    {
                        key: "dsQuyenId",
                        label: "Số quyền",
                        render:
                            value =>
                                Array.isArray(value)
                                    ? value.length
                                    : 0
                    },
                    {
                        key: "active",
                        label: "Trạng thái",
                        render: createStatusBadge
                    }
                ],

                transformPayload:
                    data => ({

                        ...data,

                        dsQuyenId:
                            normalizeNumberArray(
                                data.dsQuyenId
                            )

                    }),

                getRecordSubtitle:
                    record =>
                        record.maVaiTro

            });

    }
);