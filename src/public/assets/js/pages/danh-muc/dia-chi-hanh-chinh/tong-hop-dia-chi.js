"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const catalog =
            await window.MCS.pages
                .createCatalogPage({

                    moduleName:
                        "tong-hop-dia-chi",

                    detailTitle:
                        "Thông tin địa chỉ hành chính",

                    columns: [
                        {
                            key:
                                "loaiDiaChi",

                            label:
                                "Loại",

                            sortable:
                                true,

                            filterable:
                                true
                        },
                        {
                            key:
                                "maDiaChi",

                            label:
                                "Mã",

                            sortable:
                                true,

                            filterable:
                                true
                        },
                        {
                            key:
                                "tenDiaChi",

                            label:
                                "Tên địa chỉ",

                            sortable:
                                true,

                            filterable:
                                true
                        },
                        {
                            key:
                                "tenTinhThanh",

                            label:
                                "Tỉnh/Thành phố",

                            sortable:
                                true,

                            filterable:
                                true
                        },
                        {
                            key:
                                "tenQuocGia",

                            label:
                                "Quốc gia",

                            sortable:
                                true,

                            filterable:
                                true
                        },
                        {
                            key:
                                "active",

                            label:
                                "Hiệu lực",

                            sortable:
                                true,

                            filterable:
                                true,

                            render:
                                createStatusBadge
                        }
                    ],

                    mapListResponse:
                        response => {

                            const records =
                                Array.isArray(
                                    response?.data
                                )
                                    ? response.data
                                    : [];

                            return records.map(
                                record =>
                                    mapAddressRecord(
                                        record
                                    )
                            );

                        },

                    mapDetailResponse:
                        response => {

                            const record =
                                response?.data ||
                                null;

                            return record
                                ? mapAddressRecord(
                                    record
                                )
                                : null;

                        },

                    mapRecordToForm:
                        record =>
                            mapAddressRecordToForm(
                                record
                            ),

                    getRecordSubtitle:
                        record =>
                            record.maDiaChi ||
                            "",

                    actions:
                        () => [
                            {
                                key:
                                    "view",

                                label:
                                    "Xem chi tiết",

                                icon:
                                    "◉"
                            }
                        ]

                });


        const createButton =
            document.querySelector(
                "[data-catalog-create]"
            );

        if (createButton) {

            createButton.hidden =
                true;

        }

        return catalog;

    }
);


function mapAddressRecord(
    record
) {

    if (
        !record ||
        typeof record !==
        "object"
    ) {

        return {};

    }

    return {

        ...record,

        loaiDiaChi:
            getAddressType(
                record
            ),

        maDiaChi:
            record.maDiaChi ||
            record.xaPhuong?.ma ||
            record.tinhThanh?.ma ||
            record.quocGia?.ma ||
            "—",

        tenDiaChi:
            record.tenDiaChi ||
            record.xaPhuong?.ten ||
            record.tinhThanh?.ten ||
            record.quocGia?.ten ||
            "—",

        tenTinhThanh:
            record.tinhThanh?.ten ||
            "—",

        tenQuocGia:
            record.quocGia?.ten ||
            "—",

        active:
            record.active !==
            false

    };

}


function getAddressType(
    record
) {

    if (
        record.xaPhuongId ||
        record.xaPhuong
    ) {

        const name =
            String(
                record.xaPhuong?.ten ||
                record.tenDiaChi ||
                ""
            )
                .trim()
                .toLowerCase();

        if (
            name.startsWith(
                "phường"
            )
        ) {

            return "Phường";

        }

        if (
            name.startsWith(
                "xã"
            )
        ) {

            return "Xã";

        }

        if (
            name.startsWith(
                "thị trấn"
            )
        ) {

            return "Thị trấn";

        }

        return "Xã/Phường";

    }


    if (
        record.tinhThanhId ||
        record.tinhThanh
    ) {

        const name =
            String(
                record.tinhThanh?.ten ||
                record.tenDiaChi ||
                ""
            )
                .trim()
                .toLowerCase();

        if (
            name.startsWith(
                "thành phố"
            )
        ) {

            return "Thành phố";

        }

        return "Tỉnh/Thành phố";

    }


    if (
        record.quocGiaId ||
        record.quocGia
    ) {

        return "Quốc gia";

    }


    return "Không xác định";

}

function mapAddressRecordToForm(
    record
) {

    if (
        !record ||
        typeof record !==
            "object"
    ) {

        return {};

    }


    const quocGia =
        record.quocGia ||
        {};


    const tinhThanh =
        record.tinhThanh ||
        {};


    const xaPhuong =
        record.xaPhuong ||
        {};


    return {

        /*
         * ID
         */
        id:
            record.id ||
            null,

        quocGiaId:
            record.quocGiaId ||
            quocGia.id ||
            null,

        tinhThanhId:
            record.tinhThanhId ||
            tinhThanh.id ||
            null,

        xaPhuongId:
            record.xaPhuongId ||
            xaPhuong.id ||
            null,


        /*
         * Quốc gia
         */
        maQuocGia:
            quocGia.ma ||
            quocGia.maQuocGia ||
            "",

        tenQuocGia:
            quocGia.ten ||
            quocGia.tenQuocGia ||
            "",

        tenTiengAnh:
            quocGia.tenTiengAnh ||
            "",

        tenVietTatQuocGia:
            quocGia.tenVietTat ||
            "",

        maIso2:
            quocGia.maIso2 ||
            "",

        maIso3:
            quocGia.maIso3 ||
            "",

        maDienThoai:
            quocGia.maDienThoai ||
            "",


        /*
         * Tỉnh thành
         */
        maTinhThanh:
            tinhThanh.ma ||
            tinhThanh.maTinhThanh ||
            "",

        tenTinhThanh:
            tinhThanh.ten ||
            tinhThanh.tenTinhThanh ||
            "",

        tenVietTatTinhThanh:
            tinhThanh.tenVietTat ||
            "",


        /*
         * Xã phường
         */
        maXaPhuong:
            xaPhuong.ma ||
            xaPhuong.maXaPhuong ||
            "",

        tenXaPhuong:
            xaPhuong.ten ||
            xaPhuong.tenXaPhuong ||
            "",

        tenVietTatXaPhuong:
            xaPhuong.tenVietTat ||
            "",


        /*
         * Địa chỉ tổng hợp
         */
        maDiaChi:
            record.maDiaChi ||
            "",

        diaChiDayDu:
            record.tenDiaChi ||
            record.diaChiDayDu ||
            "",


        /*
         * Trạng thái
         */
        quocGiaActive:
            quocGia.active !==
            false,

        tinhThanhActive:
            tinhThanh.active !==
            false,

        xaPhuongActive:
            xaPhuong.active !==
            false,

        active:
            record.active !==
            false

    };

}