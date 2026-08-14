"use strict";

window.ThucDon =
    window.ThucDon ||
    {};


window.ThucDon.contentEditor =
    (() => {

        function init(
            root,
            form
        ) {

            if (
                !root ||
                !form ||
                root.dataset.tdContentBound ===
                "true"
            ) {
                return null;
            }


            root.dataset.tdContentBound =
                "true";


            const ctx = {
                dayId:
                    null,

                groupId:
                    null
            };


            root.addEventListener(
                "click",
                event => {

                    const addDay =
                        event.target.closest(
                            "[data-add-day]"
                        );


                    if (
                        addDay
                    ) {

                        event.preventDefault();

                        openDay(
                            root
                        );

                        return;

                    }


                    const addGroup =
                        event.target.closest(
                            "[data-add-group]"
                        );


                    if (
                        addGroup
                    ) {

                        event.preventDefault();


                        const day =
                            addGroup.closest(
                                "[data-day-item]"
                            );


                        ctx.dayId =
                            day?.dataset.dayId ||
                            null;


                        openGroup(
                            root
                        );


                        return;

                    }


                    const addFood =
                        event.target.closest(
                            "[data-add-food]"
                        );


                    if (
                        addFood
                    ) {

                        event.preventDefault();


                        const day =
                            addFood.closest(
                                "[data-day-item]"
                            );


                        const group =
                            addFood.closest(
                                "[data-group-item]"
                            );


                        ctx.dayId =
                            day?.dataset.dayId ||
                            null;


                        ctx.groupId =
                            group?.dataset.groupId ||
                            null;


                        openFood(
                            root
                        );


                        return;

                    }


                    const deleteDay =
                        event.target.closest(
                            "[data-delete-day]"
                        );


                    if (
                        deleteDay
                    ) {

                        event.preventDefault();


                        removeDay(
                            root,
                            form,
                            deleteDay
                                .closest(
                                    "[data-day-item]"
                                )
                                ?.dataset
                                .dayId
                        );


                        return;

                    }


                    const deleteGroup =
                        event.target.closest(
                            "[data-delete-group]"
                        );


                    if (
                        deleteGroup
                    ) {

                        event.preventDefault();


                        const day =
                            deleteGroup.closest(
                                "[data-day-item]"
                            );


                        const group =
                            deleteGroup.closest(
                                "[data-group-item]"
                            );


                        removeGroup(
                            root,
                            form,
                            day?.dataset.dayId,
                            group?.dataset.groupId
                        );


                        return;

                    }


                    const deleteFood =
                        event.target.closest(
                            "[data-delete-food]"
                        );


                    if (
                        deleteFood
                    ) {

                        event.preventDefault();


                        const day =
                            deleteFood.closest(
                                "[data-day-item]"
                            );


                        const group =
                            deleteFood.closest(
                                "[data-group-item]"
                            );


                        const food =
                            deleteFood.closest(
                                "[data-food-item]"
                            );


                        removeFood(
                            root,
                            form,
                            day?.dataset.dayId,
                            group?.dataset.groupId,
                            food?.dataset.foodId
                        );


                        return;

                    }


                    if (
                        event.target.closest(
                            "[data-modal-close]"
                        )
                    ) {

                        closeAll(
                            root
                        );

                        return;

                    }


                    if (
                        event.target.closest(
                            "[data-save-day-modal]"
                        )
                    ) {

                        saveDay(
                            root,
                            form
                        );

                        return;

                    }


                    if (
                        event.target.closest(
                            "[data-save-group-modal]"
                        )
                    ) {

                        saveGroup(
                            root,
                            form,
                            ctx
                        );

                        return;

                    }


                    if (
                        event.target.closest(
                            "[data-save-food-modal]"
                        )
                    ) {

                        saveFood(
                            root,
                            form,
                            ctx
                        );

                        return;

                    }

                }
            );


            return {};

        }


        function openDay(
            root
        ) {

            clearModal(
                root,
                "day"
            );


            open(
                root.querySelector(
                    "[data-modal-day]"
                )
            );

        }


        function openGroup(
            root
        ) {

            clearModal(
                root,
                "group"
            );


            open(
                root.querySelector(
                    "[data-modal-group]"
                )
            );

        }


        function openFood(
            root
        ) {

            clearModal(
                root,
                "food"
            );


            open(
                root.querySelector(
                    "[data-modal-food]"
                )
            );

        }


        function open(
            modal
        ) {

            if (!modal) return;


            modal.hidden =
                false;


            document
                .documentElement
                .classList
                .add(
                    "td-modal-open"
                );

        }


        function closeAll(
            root
        ) {

            root
                .querySelectorAll(
                    ".td-modal"
                )
                .forEach(
                    m =>
                        m.hidden =
                            true
                );


            document
                .documentElement
                .classList
                .remove(
                    "td-modal-open"
                );

        }


        function clearModal(
            root,
            type
        ) {

            const names =
                type === "day"
                    ? [
                        "tdNgay",
                        "tdGhiChuNgay"
                    ]
                    : type === "group"
                        ? [
                            "tdNhomMonAnId"
                        ]
                        : [
                            "tdMonAnId",
                            "tdDinhLuong",
                            "tdDonViTinhId",
                            "tdKhauPhan",
                            "tdGhiChuMon"
                        ];


            names.forEach(
                name => {

                    const el =
                        root.querySelector(
                            `[name="${name}"]`
                        );


                    if (!el) return;


                    if (
                        el.matches(
                            "select"
                        )
                    ) {

                        el
                            .closest(
                                "[data-smart-select]"
                            )
                            ?.smartSelect
                            ?.clear
                            ?.(
                                false
                            );

                    }
                    else if (
                        el.hasAttribute(
                            "data-date-value"
                        )
                    ) {

                        el
                            .closest(
                                "[data-date-picker]"
                            )
                            ?.datePicker
                            ?.setValue
                            ?.(
                                "",
                                false
                            );

                    }
                    else {

                        el.value =
                            "";

                    }

                }
            );

        }


        function saveDay(
            root,
            form
        ) {

            const date =
                normalizeDate(
                    field(
                        root,
                        "tdNgay"
                    )
                );


            const note =
                field(
                    root,
                    "tdGhiChuNgay"
                );


            if (
                !date
            ) {

                error(
                    "Vui lòng chọn ngày áp dụng."
                );

                return;

            }


            const data =
                form.getData();


            const days =
                data.dsNgay ||
                [];


            if (
                days.some(
                    d =>
                        normalizeDate(
                            d.ngay ||
                            d.ngayApDung
                        ) ===
                        date
                )
            ) {

                error(
                    "Ngày này đã có trong thực đơn."
                );

                return;

            }


            const from =
                normalizeDate(
                    data.tuNgay
                );


            const to =
                normalizeDate(
                    data.denNgay
                );


            if (
                from &&
                date < from ||
                to &&
                date > to
            ) {

                error(
                    "Ngày áp dụng phải nằm trong thời gian của thực đơn."
                );

                return;

            }


            days.push({

                id:
                    tempId(
                        "day"
                    ),

                ngay:
                    date,

                ghiChu:
                    note,

                dsNhomMonAn:
                    []

            });


            data.dsNgay =
                days;


            form.setWorkingData(
                data
            );


            closeAll(
                root
            );


            success(
                "Đã thêm ngày."
            );

        }


        function saveGroup(
            root,
            form,
            ctx
        ) {

            if (
                !ctx.dayId
            ) {

                error(
                    "Không xác định được ngày."
                );

                return;

            }


            const id =
                Number(
                    field(
                        root,
                        "tdNhomMonAnId"
                    )
                );


            if (
                !id
            ) {

                error(
                    "Vui lòng chọn nhóm món."
                );

                return;

            }


            const data =
                form.getData();


            const day =
                (
                    data.dsNgay ||
                    []
                ).find(
                    d =>
                        String(
                            d.id
                        ) ===
                        String(
                            ctx.dayId
                        )
                );


            if (!day) return;


            day.dsNhomMonAn =
                day.dsNhomMonAn ||
                [];


            if (
                day.dsNhomMonAn.some(
                    g =>
                        Number(
                            g.nhomMonAnId ??
                            g.nhomMonAn?.id
                        ) ===
                        id
                )
            ) {

                error(
                    "Nhóm món đã tồn tại trong ngày."
                );

                return;

            }


            const selected =
                root
                    ._tdOptions
                    ?.nhomMonAn
                    ?.find(
                        x =>
                            Number(
                                x.id
                            ) ===
                            id
                    );


            day.dsNhomMonAn.push({

                id:
                    tempId(
                        "group"
                    ),

                nhomMonAnId:
                    id,

                nhomMonAn:
                    selected
                        ? {
                            ...selected
                        }
                        : null,

                tenNhomMonAn:
                    selected?.tenNhomMonAn ||
                    "-",

                dsMonAn:
                    []

            });


            form.setWorkingData(
                data
            );


            closeAll(
                root
            );


            success(
                "Đã thêm nhóm món."
            );

        }


        function saveFood(
            root,
            form,
            ctx
        ) {

            if (
                !ctx.dayId ||
                !ctx.groupId
            ) {

                error(
                    "Không xác định được nhóm món."
                );

                return;

            }


            const monAnId =
                Number(
                    field(
                        root,
                        "tdMonAnId"
                    )
                );


            const dinhLuong =
                numberOrNull(
                    field(
                        root,
                        "tdDinhLuong"
                    )
                );


            const donViTinhId =
                numberOrNull(
                    field(
                        root,
                        "tdDonViTinhId"
                    )
                );


            const khauPhan =
                numberOrNull(
                    field(
                        root,
                        "tdKhauPhan"
                    )
                );


            const ghiChu =
                field(
                    root,
                    "tdGhiChuMon"
                );


            if (
                !monAnId
            ) {

                error(
                    "Vui lòng chọn món ăn."
                );

                return;

            }


            const data =
                form.getData();


            const day =
                (
                    data.dsNgay ||
                    []
                ).find(
                    d =>
                        String(
                            d.id
                        ) ===
                        String(
                            ctx.dayId
                        )
                );


            const group =
                (
                    day?.dsNhomMonAn ||
                    []
                ).find(
                    g =>
                        String(
                            g.id
                        ) ===
                        String(
                            ctx.groupId
                        )
                );


            if (!group) return;


            group.dsMonAn =
                group.dsMonAn ||
                [];


            if (
                group.dsMonAn.some(
                    f =>
                        Number(
                            f.monAnId ??
                            f.monAn?.id
                        ) ===
                        monAnId
                )
            ) {

                error(
                    "Món ăn đã có trong nhóm."
                );

                return;

            }


            const mon =
                root
                    ._tdOptions
                    ?.monAn
                    ?.find(
                        x =>
                            Number(
                                x.id
                            ) ===
                            monAnId
                    );


            const unit =
                root
                    ._tdOptions
                    ?.donViTinh
                    ?.find(
                        x =>
                            Number(
                                x.id
                            ) ===
                            donViTinhId
                    );


            group.dsMonAn.push({

                id:
                    tempId(
                        "food"
                    ),

                monAnId,

                monAn:
                    mon
                        ? {
                            ...mon
                        }
                        : null,

                dinhLuong,

                donViTinhId,

                donViTinh:
                    unit
                        ? {
                            ...unit
                        }
                        : null,

                khauPhan,

                ghiChu

            });


            form.setWorkingData(
                data
            );


            closeAll(
                root
            );


            success(
                "Đã thêm món ăn."
            );

        }


        function removeDay(
            root,
            form,
            id
        ) {

            confirmDelete(
                "Xóa ngày",
                "Toàn bộ nhóm món và món ăn trong ngày sẽ bị xóa.",
                () => {

                    const data =
                        form.getData();


                    data.dsNgay =
                        (
                            data.dsNgay ||
                            []
                        ).filter(
                            d =>
                                String(
                                    d.id
                                ) !==
                                String(
                                    id
                                )
                        );


                    form.setWorkingData(
                        data
                    );

                }
            );

        }


        function removeGroup(
            root,
            form,
            dayId,
            groupId
        ) {

            confirmDelete(
                "Xóa nhóm món",
                "Toàn bộ món ăn trong nhóm sẽ bị xóa.",
                () => {

                    const data =
                        form.getData();


                    const day =
                        (
                            data.dsNgay ||
                            []
                        ).find(
                            d =>
                                String(
                                    d.id
                                ) ===
                                String(
                                    dayId
                                )
                        );


                    if (
                        day
                    ) {

                        day.dsNhomMonAn =
                            (
                                day.dsNhomMonAn ||
                                []
                            ).filter(
                                g =>
                                    String(
                                        g.id
                                    ) !==
                                    String(
                                        groupId
                                    )
                            );


                        form.setWorkingData(
                            data
                        );

                    }

                }
            );

        }


        function removeFood(
            root,
            form,
            dayId,
            groupId,
            foodId
        ) {

            confirmDelete(
                "Xóa món ăn",
                "Bạn có chắc chắn muốn xóa món ăn này?",
                () => {

                    const data =
                        form.getData();


                    const day =
                        (
                            data.dsNgay ||
                            []
                        ).find(
                            d =>
                                String(
                                    d.id
                                ) ===
                                String(
                                    dayId
                                )
                        );


                    const group =
                        (
                            day?.dsNhomMonAn ||
                            []
                        ).find(
                            g =>
                                String(
                                    g.id
                                ) ===
                                String(
                                    groupId
                                )
                        );


                    if (
                        group
                    ) {

                        group.dsMonAn =
                            (
                                group.dsMonAn ||
                                []
                            ).filter(
                                f =>
                                    String(
                                        f.id
                                    ) !==
                                    String(
                                        foodId
                                    )
                            );


                        form.setWorkingData(
                            data
                        );

                    }

                }
            );

        }


        function confirmDelete(
            title,
            message,
            onConfirm
        ) {

            if (
                window.MCS
                    ?.confirm
                    ?.show
            ) {

                window.MCS
                    .confirm
                    .show({
                        title,
                        message,
                        confirmLabel:
                            "Xóa",
                        type:
                            "danger",
                        onConfirm
                    });

            }
            else if (
                window.confirm(
                    message
                )
            ) {

                onConfirm();

            }

        }


        function field(
            root,
            name
        ) {

            return root
                .querySelector(
                    `[name="${name}"]`
                )
                ?.value
                ?.trim
                ?.() ||
                "";

        }


        function numberOrNull(
            v
        ) {

            return v === ""
                ? null
                : Number(
                    v
                );

        }


        function normalizeDate(
            v
        ) {

            return window.ThucDon
                .form
                .normalizeDate(
                    v
                );

        }


        function tempId(
            type
        ) {

            return `tmp-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        }


        function success(
            m
        ) {

            window.MCS
                ?.toast
                ?.success
                ?.(m);

        }


        function error(
            m
        ) {

            window.MCS
                ?.toast
                ?.error
                ?.(m);

        }


        return {
            init
        };

    })();