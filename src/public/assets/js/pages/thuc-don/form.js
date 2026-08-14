"use strict";

window.ThucDon =
    window.ThucDon ||
    {};


window.ThucDon.form =
    (() => {

        const STATUS =
            Object.freeze({

                TAO_MOI:
                    0,

                TAO_MOI_CHO_DUYET:
                    10,

                CHO_DUYET:
                    20,

                DANG_AP_DUNG:
                    30,

                CHO_DUYET_LAI:
                    40,

                DA_HUY:
                    50,

                DA_KET_THUC:
                    60

            });


        const STATUS_LABEL =
            Object.freeze({

                0:
                    "Tạo mới",

                10:
                    "Tạo mới/ Chờ duyệt",

                20:
                    "Chờ duyệt",

                30:
                    "Đang áp dụng",

                40:
                    "Chờ duyệt lại",

                50:
                    "Đã hủy",

                60:
                    "Đã kết thúc"

            });


        const STATUS_CLASS =
            Object.freeze({

                0:
                    "is-new",

                10:
                    "is-new",

                20:
                    "is-pending",

                30:
                    "is-active",

                40:
                    "is-review",

                50:
                    "is-cancelled",

                60:
                    "is-ended"

            });


        const TYPE_LABEL =
            Object.freeze({

                10:
                    "Theo ngày",

                20:
                    "Theo tuần",

                30:
                    "Theo tháng",

                40:
                    "Theo thời gian"

            });


        const PLACEHOLDER_IMAGE =
            "/uploads/danh-muc/mon-an/mon-an.png";


        function init(
            root,
            {
                mode = "detail"
            } = {}
        ) {

            if (!root) return null;


            const state = {

                mode,

                data:
                    null,

                selectedDayId:
                    null,

                selectedGroupId:
                    null

            };


            root.dataset.formMode =
                mode;


            applyMode(
                root,
                mode
            );


            bindToggleEvents(
                root,
                state
            );


            return {

                setData(
                    data
                ) {

                    state.data =
                        normalizeData(
                            clone(
                                data ||
                                {}
                            )
                        );


                    renderGeneral(
                        root,
                        state
                    );


                    renderContent(
                        root,
                        state
                    );

                },


                getData() {

                    if (
                        mode !==
                        "detail"
                    ) {

                        syncGeneral(
                            root,
                            state
                        );

                    }


                    return clone(
                        state.data
                    );

                },


                getState() {

                    return state;

                },


                setWorkingData(
                    data
                ) {

                    state.data =
                        normalizeData(
                            clone(
                                data ||
                                {}
                            )
                        );


                    renderGeneral(
                        root,
                        state
                    );


                    renderContent(
                        root,
                        state
                    );

                },


                render() {

                    renderGeneral(
                        root,
                        state
                    );


                    renderContent(
                        root,
                        state
                    );

                },


                selectDay(
                    id
                ) {

                    state.selectedDayId =
                        id == null
                            ? null
                            : String(
                                id
                            );

                },


                selectGroup(
                    id
                ) {

                    state.selectedGroupId =
                        id == null
                            ? null
                            : String(
                                id
                            );

                }

            };

        }


        function applyMode(
            root,
            mode
        ) {

            root
                .querySelectorAll(
                    "[data-editor-only]"
                )
                .forEach(
                    el => {

                        el.hidden =
                            mode ===
                            "detail";

                    }
                );


            const editFields =
                root.querySelector(
                    "[data-general-edit-fields]"
                );


            const detailFields =
                root.querySelector(
                    "[data-general-detail-fields]"
                );


            if (
                editFields
            ) {

                editFields.hidden =
                    mode ===
                    "detail";

            }


            if (
                detailFields
            ) {

                detailFields.hidden =
                    mode !==
                    "detail";

            }

        }


        function normalizeData(
            data
        ) {

            data.dsNgay =
                Array.isArray(
                    data.dsNgay
                )
                    ? data.dsNgay
                    : (
                        data.danhSachNgay ||
                        []
                    );


            data.dsNgay.forEach(
                (
                    day,
                    di
                ) => {

                    if (
                        day.id ==
                        null
                    ) {

                        day.id =
                            tempId(
                                "day",
                                di
                            );

                    }


                    day.ngay =
                        normalizeDate(
                            day.ngay ||
                            day.ngayApDung ||
                            day.ngayThucDon
                        );


                    day.dsNhomMonAn =
                        Array.isArray(
                            day.dsNhomMonAn
                        )
                            ? day.dsNhomMonAn
                            : (
                                day.danhSachNhomMonAn ||
                                []
                            );


                    day.dsNhomMonAn.forEach(
                        (
                            group,
                            gi
                        ) => {

                            if (
                                group.id ==
                                null
                            ) {

                                group.id =
                                    tempId(
                                        "group",
                                        gi
                                    );

                            }


                            group.dsMonAn =
                                Array.isArray(
                                    group.dsMonAn
                                )
                                    ? group.dsMonAn
                                    : (
                                        group.danhSachMonAn ||
                                        []
                                    );


                            group.dsMonAn.forEach(
                                (
                                    food,
                                    fi
                                ) => {

                                    if (
                                        food.id ==
                                        null
                                    ) {

                                        food.id =
                                            tempId(
                                                "food",
                                                fi
                                            );

                                    }

                                }
                            );

                        }
                    );

                }
            );


            return data;

        }


        function renderGeneral(
            root,
            state
        ) {

            const d =
                state.data;


            if (!d) return;


            if (
                state.mode ===
                "detail"
            ) {

                setText(
                    root,
                    "[data-detail-ma]",
                    d.maThucDon
                );


                setText(
                    root,
                    "[data-detail-ten]",
                    d.tenThucDon
                );


                setText(
                    root,
                    "[data-detail-loai]",
                    d.loaiThucDonText ||
                    TYPE_LABEL[
                        Number(
                            d.loaiThucDon
                        )
                    ] ||
                    "-"
                );


                setText(
                    root,
                    "[data-detail-co-so]",
                    d.tenCoSo ||
                    d.coSo?.tenCoSo ||
                    "-"
                );


                setText(
                    root,
                    "[data-detail-nha-an]",
                    d.tenNhaAn ||
                    d.nhaAn?.tenNhaAn ||
                    "-"
                );


                setText(
                    root,
                    "[data-detail-ca-an]",
                    d.tenCaAn ||
                    d.caAn?.tenCaAn ||
                    "-"
                );


                setText(
                    root,
                    "[data-detail-thoi-gian]",
                    `${formatDate(d.tuNgay)} - ${formatDate(d.denNgay)}`
                );


                setText(
                    root,
                    "[data-detail-mo-ta]",
                    d.moTa ||
                    "-"
                );


                renderStatus(
                    root.querySelector(
                        "[data-detail-trang-thai]"
                    ),
                    d.trangThai
                );


                return;

            }


            setField(
                root,
                "maThucDon",
                d.maThucDon
            );


            setField(
                root,
                "tenThucDon",
                d.tenThucDon
            );


            setSelect(
                root,
                "loaiThucDon",
                d.loaiThucDon
            );


            setSelect(
                root,
                "coSoId",
                d.coSoId
            );


            setSelect(
                root,
                "nhaAnId",
                d.nhaAnId
            );


            setSelect(
                root,
                "caAnId",
                d.caAnId
            );


            setDate(
                root,
                "tuNgay",
                d.tuNgay
            );


            setDate(
                root,
                "denNgay",
                d.denNgay
            );


            setField(
                root,
                "moTa",
                d.moTa
            );


            renderStatus(
                root.querySelector(
                    "[data-editor-status]"
                ),
                d.trangThai
            );

        }


        function syncGeneral(
            root,
            state
        ) {

            const d =
                state.data;


            if (!d) return;


            d.maThucDon =
                value(
                    root,
                    "maThucDon"
                );


            d.tenThucDon =
                value(
                    root,
                    "tenThucDon"
                );


            d.loaiThucDon =
                numberValue(
                    root,
                    "loaiThucDon"
                );


            d.coSoId =
                numberValue(
                    root,
                    "coSoId"
                );


            d.nhaAnId =
                numberValue(
                    root,
                    "nhaAnId"
                );


            d.caAnId =
                numberValue(
                    root,
                    "caAnId"
                );


            d.tuNgay =
                normalizeDate(
                    value(
                        root,
                        "tuNgay"
                    )
                );


            d.denNgay =
                normalizeDate(
                    value(
                        root,
                        "denNgay"
                    )
                );


            d.moTa =
                value(
                    root,
                    "moTa"
                );

        }


        function renderContent(
            root,
            state
        ) {

            const list =
                root.querySelector(
                    "[data-days-list]"
                );


            const tpl =
                document.getElementById(
                    "td-template-day"
                );


            if (
                !list ||
                !tpl
            ) {
                return;
            }


            list.innerHTML =
                "";


            const days =
                state.data?.dsNgay ||
                [];


            const empty =
                root.querySelector(
                    "[data-empty-day]"
                );


            if (
                empty
            ) {

                empty.hidden =
                    days.length >
                    0;

            }


            days.forEach(
                (
                    day,
                    index
                ) => {

                    const fragment =
                        tpl.content.cloneNode(
                            true
                        );


                    const item =
                        fragment.querySelector(
                            "[data-day-item]"
                        );


                    item.dataset.dayId =
                        String(
                            day.id
                        );


                    setFragmentText(
                        fragment,
                        "[data-day-index]",
                        String(
                            index + 1
                        ).padStart(
                            2,
                            "0"
                        )
                    );


                    setFragmentText(
                        fragment,
                        "[data-day-weekday]",
                        weekday(
                            day.ngay
                        )
                    );


                    setFragmentText(
                        fragment,
                        "[data-day-date]",
                        formatDate(
                            day.ngay
                        )
                    );


                    setFragmentText(
                        fragment,
                        "[data-day-group-count]",
                        `${day.dsNhomMonAn.length} nhóm`
                    );


                    setFragmentText(
                        fragment,
                        "[data-day-food-count]",
                        `${countFoods(day)} món`
                    );


                    const noteWrap =
                        fragment.querySelector(
                            "[data-day-note-wrap]"
                        );


                    if (
                        day.ghiChu &&
                        noteWrap
                    ) {

                        noteWrap.hidden =
                            false;


                        setFragmentText(
                            fragment,
                            "[data-day-note]",
                            day.ghiChu
                        );

                    }


                    const groupsList =
                        fragment.querySelector(
                            "[data-groups-list]"
                        );


                    renderGroups(
                        groupsList,
                        day,
                        state.mode
                    );


                    list.appendChild(
                        fragment
                    );

                }
            );


            applyMode(
                root,
                state.mode
            );

        }


        function renderGroups(
            container,
            day,
            mode
        ) {

            const tpl =
                document.getElementById(
                    "td-template-group"
                );


            if (
                !container ||
                !tpl
            ) {
                return;
            }


            container.innerHTML =
                "";


            day.dsNhomMonAn.forEach(
                group => {

                    const fragment =
                        tpl.content.cloneNode(
                            true
                        );


                    const item =
                        fragment.querySelector(
                            "[data-group-item]"
                        );


                    item.dataset.groupId =
                        String(
                            group.id
                        );


                    item.dataset.dayId =
                        String(
                            day.id
                        );


                    setFragmentText(
                        fragment,
                        "[data-group-name]",
                        group.tenNhomMonAn ||
                        group.nhomMonAn?.tenNhomMonAn ||
                        "-"
                    );


                    setFragmentText(
                        fragment,
                        "[data-group-food-count]",
                        `${group.dsMonAn.length} món`
                    );


                    const foodsList =
                        fragment.querySelector(
                            "[data-food-list]"
                        );


                    renderFoods(
                        foodsList,
                        group,
                        day,
                        mode
                    );


                    container.appendChild(
                        fragment
                    );

                }
            );

        }


        function renderFoods(
            container,
            group,
            day,
            mode
        ) {

            const tpl =
                document.getElementById(
                    "td-template-food"
                );


            if (
                !container ||
                !tpl
            ) {
                return;
            }


            container.innerHTML =
                "";


            group.dsMonAn.forEach(
                food => {

                    const fragment =
                        tpl.content.cloneNode(
                            true
                        );


                    const item =
                        fragment.querySelector(
                            "[data-food-item]"
                        );


                    item.dataset.foodId =
                        String(
                            food.id
                        );


                    item.dataset.groupId =
                        String(
                            group.id
                        );


                    item.dataset.dayId =
                        String(
                            day.id
                        );


                    const mon =
                        food.monAn ||
                        food;


                    setFragmentText(
                        fragment,
                        "[data-food-name]",
                        mon.tenMonAn ||
                        food.tenMonAn ||
                        "-"
                    );


                    setFragmentText(
                        fragment,
                        "[data-food-code]",
                        mon.maMonAn ||
                        food.maMonAn ||
                        "-"
                    );


                    setFragmentText(
                        fragment,
                        "[data-food-quantity]",
                        food.dinhLuong ??
                        "-"
                    );


                    setFragmentText(
                        fragment,
                        "[data-food-unit]",
                        food.donViTinh?.tenDonViTinh ||
                        mon.donViTinh?.tenDonViTinh ||
                        food.tenDonViTinh ||
                        "-"
                    );


                    setFragmentText(
                        fragment,
                        "[data-food-portion]",
                        food.khauPhan ??
                        mon.khauPhan ??
                        "-"
                    );


                    setFragmentText(
                        fragment,
                        "[data-food-note]",
                        food.ghiChu ||
                        "-"
                    );


                    const img =
                        fragment.querySelector(
                            "[data-food-image]"
                        );


                    if (
                        img
                    ) {

                        img.src =
                            normalizeImage(
                                mon.hinhAnh ||
                                food.hinhAnh
                            );


                        img.onerror =
                            () => {

                                img.onerror =
                                    null;


                                img.src =
                                    PLACEHOLDER_IMAGE;

                            };

                    }


                    container.appendChild(
                        fragment
                    );

                }
            );

        }


        function bindToggleEvents(
            root
        ) {

            root.addEventListener(
                "click",
                event => {

                    const dayToggle =
                        event.target.closest(
                            "[data-toggle-day]"
                        );


                    if (
                        dayToggle
                    ) {

                        const item =
                            dayToggle.closest(
                                "[data-day-item]"
                            );


                        toggleBody(
                            item?.querySelector(
                                "[data-day-body]"
                            ),
                            dayToggle
                        );


                        return;

                    }


                    const groupToggle =
                        event.target.closest(
                            "[data-toggle-group]"
                        );


                    if (
                        groupToggle
                    ) {

                        const item =
                            groupToggle.closest(
                                "[data-group-item]"
                            );


                        toggleBody(
                            item?.querySelector(
                                "[data-group-body]"
                            ),
                            groupToggle
                        );

                    }

                }
            );

        }


        function toggleBody(
            body,
            button
        ) {

            if (!body) return;


            body.hidden =
                !body.hidden;


            button
                ?.closest(
                    "article"
                )
                ?.classList
                .toggle(
                    "is-open",
                    !body.hidden
                );

        }

        function renderStatus(
            el,
            status
        ) {

            if (!el) {
                return;
            }


            const value =
                status === null ||
                status === undefined ||
                status === ""
                    ? 10
                    : Number(
                        status
                    );


            el.textContent =
                STATUS_LABEL[
                    value
                ] ||
                "-";


            el.className =
                `td-status ${
                    STATUS_CLASS[
                        value
                    ] ||
                    "is-default"
                }`;

        }
        
        function setField(
            root,
            name,
            val
        ) {

            const el =
                root.querySelector(
                    `[name="${name}"]`
                );


            if (
                el
            ) {

                el.value =
                    val ??
                    "";

            }

        }


        function setSelect(
            root,
            name,
            val
        ) {

            const el =
                root.querySelector(
                    `select[name="${name}"]`
                );


            if (!el) return;


            const normalized =
                val == null
                    ? ""
                    : String(
                        val
                    );


            el.value =
                normalized;


            const api =
                el
                    .closest(
                        "[data-smart-select]"
                    )
                    ?.smartSelect;


            api?.setValue?.(
                normalized,
                false
            );

        }


        function setDate(
            root,
            name,
            val
        ) {

            const el =
                root.querySelector(
                    `[name="${name}"][data-date-value]`
                );


            if (!el) return;


            const normalized =
                normalizeDate(
                    val
                );


            el.value =
                normalized;


            el
                .closest(
                    "[data-date-picker]"
                )
                ?.datePicker
                ?.setValue
                ?.(
                    normalized,
                    false
                );

        }


        function value(
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


        function numberValue(
            root,
            name
        ) {

            const v =
                value(
                    root,
                    name
                );


            return v === ""
                ? null
                : Number(
                    v
                );

        }


        function setText(
            root,
            selector,
            val
        ) {

            const el =
                root.querySelector(
                    selector
                );


            if (
                el
            ) {

                el.textContent =
                    val ??
                    "-";

            }

        }


        function setFragmentText(
            root,
            selector,
            val
        ) {

            const el =
                root.querySelector(
                    selector
                );


            if (
                el
            ) {

                el.textContent =
                    val ??
                    "-";

            }

        }


        function countFoods(
            day
        ) {

            return (
                day.dsNhomMonAn ||
                []
            ).reduce(
                (
                    n,
                    g
                ) =>
                    n +
                    (
                        g.dsMonAn ||
                        []
                    ).length,
                0
            );

        }


        function normalizeDate(
            v
        ) {

            if (
                !v
            ) {

                return "";

            }


            const s =
                String(
                    v
                ).trim();


            if (
                /^\d{4}-\d{2}-\d{2}$/.test(
                    s
                )
            ) {

                return s;

            }


            const d =
                new Date(
                    s
                );


            if (
                !Number.isNaN(
                    d.getTime()
                )
            ) {

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
                            d
                        );


                const m =
                    Object.fromEntries(
                        parts.map(
                            p => [
                                p.type,
                                p.value
                            ]
                        )
                    );


                return `${m.year}-${m.month}-${m.day}`;

            }


            return s.substring(
                0,
                10
            );

        }


        function formatDate(
            v
        ) {

            const d =
                normalizeDate(
                    v
                );


            if (!d) return "-";


            const [
                y,
                m,
                day
            ] =
                d.split(
                    "-"
                );


            return `${day}/${m}/${y}`;

        }


        function weekday(
            v
        ) {

            const d =
                normalizeDate(
                    v
                );


            if (!d) return "-";


            const [
                y,
                m,
                day
            ] =
                d
                    .split(
                        "-"
                    )
                    .map(
                        Number
                    );


            return [
                "Chủ nhật",
                "Thứ hai",
                "Thứ ba",
                "Thứ tư",
                "Thứ năm",
                "Thứ sáu",
                "Thứ bảy"
            ][
                new Date(
                    y,
                    m - 1,
                    day
                ).getDay()
            ];

        }


        function normalizeImage(
            v
        ) {

            if (
                !v
            ) {

                return PLACEHOLDER_IMAGE;

            }


            const s =
                String(
                    v
                );


            return /^(https?:|blob:|data:|\/)/.test(
                s
            )
                ? s
                : `/${s}`;

        }


        function tempId(
            type,
            i = 0
        ) {

            return `tmp-${type}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;

        }


        function clone(
            v
        ) {

            return JSON.parse(
                JSON.stringify(
                    v
                )
            );

        }


        return {
            init,
            STATUS,
            STATUS_LABEL,
            normalizeDate,
            formatDate
        };

    })();