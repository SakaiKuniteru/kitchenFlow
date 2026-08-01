"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "co-so",

                detailTitle:
                    "Thông tin cơ sở",

                createTitle:
                    "Thêm cơ sở",

                updateTitle:
                    "Cập nhật cơ sở",

                columns: [
                    {
                        key: "maCoSo",
                        label: "Mã cơ sở",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenCoSo",
                        label: "Tên cơ sở",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "diaChi",
                        label: "Địa chỉ",
                        filterable: true
                    },
                    {
                        key: "active",
                        label: "Trạng thái",
                        sortable: true,
                        filterable: true,
                        render: renderTrangThai
                    }
                ],

                getRecordSubtitle:
                    record =>
                        record.maCoSo,

                transformPayload:
                    data => ({

                        ...data,

                        quocGiaId:
                            data.quocGiaId || null,

                        tinhThanhId:
                            data.tinhThanhId || null,

                        xaPhuongId:
                            data.xaPhuongId || null

                    })

            });

    }
);


function renderTrangThai(
    value
) {

    const badge =
        document.createElement(
            "span"
        );

    badge.className =
        value
            ? "status-badge status-badge--success"
            : "status-badge status-badge--danger";

    badge.innerHTML = `
        <span
            class="status-badge__dot">
        </span>

        <span>
            ${
                value
                    ? "Đang hoạt động"
                    : "Đã khóa"
            }
        </span>
    `;

    return badge;

}