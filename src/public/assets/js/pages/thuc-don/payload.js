"use strict";


window.ThucDon =
    window.ThucDon ||
    {};


window.ThucDon.payload =
    (() => {

        function build(
            data,
            trangThai
        ) {

            const d =
                JSON.parse(
                    JSON.stringify(
                        data ||
                        {}
                    )
                );


            d.loaiThucDon =
                num(
                    d.loaiThucDon
                );


            d.coSoId =
                num(
                    d.coSoId
                );


            d.nhaAnId =
                num(
                    d.nhaAnId
                );


            d.caAnId =
                num(
                    d.caAnId
                );


            const from =
                date(
                    d.tuNgay
                );


            const to =
                date(
                    d.denNgay
                );


            d.tuNgay =
                from
                    ? `${from}T00:00:00+07:00`
                    : null;


            d.denNgay =
                to
                    ? `${to}T23:59:59+07:00`
                    : null;

            d.trangThai =
                resolveTrangThai(
                    to,
                    trangThai
                );


            d.dsNgay =
                (
                    d.dsNgay ||
                    []
                ).map(
                    (
                        day,
                        di
                    ) => ({

                        ...persisted(
                            day.id
                        ),


                        ngay:
                            date(
                                day.ngay ||
                                day.ngayApDung
                            )
                                ? `${date(
                                    day.ngay ||
                                    day.ngayApDung
                                )}T00:00:00+07:00`
                                : null,


                        ghiChu:
                            day.ghiChu ||
                            null,


                        thuTuHienThi:
                            day.thuTuHienThi ??
                            di + 1,


                        dsNhomMonAn:
                            (
                                day.dsNhomMonAn ||
                                []
                            ).map(
                                (
                                    g,
                                    gi
                                ) => ({

                                    ...persisted(
                                        g.id
                                    ),


                                    nhomMonAnId:
                                        num(
                                            g.nhomMonAnId ??
                                            g.nhomMonAn?.id
                                        ),


                                    thuTuHienThi:
                                        g.thuTuHienThi ??
                                        gi + 1,


                                    ghiChu:
                                        g.ghiChu ||
                                        null,


                                    dsMonAn:
                                        (
                                            g.dsMonAn ||
                                            []
                                        ).map(
                                            (
                                                f,
                                                fi
                                            ) => ({

                                                ...persisted(
                                                    f.id
                                                ),


                                                monAnId:
                                                    num(
                                                        f.monAnId ??
                                                        f.monAn?.id
                                                    ),


                                                dinhLuong:
                                                    f.dinhLuong ??
                                                    null,


                                                donViTinhId:
                                                    num(
                                                        f.donViTinhId ??
                                                        f.donViTinh?.id
                                                    ),


                                                khauPhan:
                                                    f.khauPhan ??
                                                    null,


                                                ghiChu:
                                                    f.ghiChu ||
                                                    null,


                                                thuTuHienThi:
                                                    f.thuTuHienThi ??
                                                    fi + 1

                                            })
                                        )

                                })
                            )

                    })
                );


            return d;

        }


        function resolveTrangThai(
            denNgay,
            trangThai
        ) {

            if (
                denNgay &&
                isExpired(
                    denNgay
                )
            ) {

                return 60;

            }


            return Number(
                trangThai
            );

        }


        function isExpired(
            denNgay
        ) {

            const today =
                getTodayInVietnam();


            return (
                String(
                    denNgay
                ) <
                today
            );

        }


        function getTodayInVietnam() {

            const parts =
                new Intl.DateTimeFormat(
                    "en-CA",
                    {
                        timeZone:
                            "Asia/Ho_Chi_Minh",

                        year:
                            "numeric",

                        month:
                            "2-digit",

                        day:
                            "2-digit"
                    }
                )
                    .formatToParts(
                        new Date()
                    );


            const values =
                {};


            parts.forEach(
                part => {

                    values[
                        part.type
                    ] =
                        part.value;

                }
            );


            return (
                `${values.year}-` +
                `${values.month}-` +
                `${values.day}`
            );

        }


        function validate(
            d
        ) {

            if (
                !String(
                    d.maThucDon ||
                    ""
                ).trim()
            ) {

                return [
                    "maThucDon",
                    "Mã thực đơn không được để trống."
                ];

            }


            if (
                !String(
                    d.tenThucDon ||
                    ""
                ).trim()
            ) {

                return [
                    "tenThucDon",
                    "Tên thực đơn không được để trống."
                ];

            }


            if (
                !d.loaiThucDon
            ) {

                return [
                    "loaiThucDon",
                    "Vui lòng chọn loại thực đơn."
                ];

            }


            if (
                !d.coSoId
            ) {

                return [
                    "coSoId",
                    "Vui lòng chọn cơ sở."
                ];

            }


            if (
                !d.nhaAnId
            ) {

                return [
                    "nhaAnId",
                    "Vui lòng chọn nhà ăn."
                ];

            }


            if (
                !d.caAnId
            ) {

                return [
                    "caAnId",
                    "Vui lòng chọn ca ăn."
                ];

            }


            if (
                !d.tuNgay
            ) {

                return [
                    "tuNgay",
                    "Vui lòng chọn từ ngày."
                ];

            }


            if (
                !d.denNgay
            ) {

                return [
                    "denNgay",
                    "Vui lòng chọn đến ngày."
                ];

            }


            return null;

        }


        function persisted(
            id
        ) {

            if (
                id == null ||
                String(
                    id
                ).startsWith(
                    "tmp-"
                )
            ) {

                return {};

            }


            return {
                id:
                    num(
                        id
                    )
            };

        }


        function num(
            v
        ) {

            return v === "" ||
                v == null
                ? null
                : Number(
                    v
                );

        }


        function date(
            v
        ) {

            return window.ThucDon
                .form
                .normalizeDate(
                    v
                );

        }


        return {
            build,
            validate,
            resolveTrangThai
        };

    })();