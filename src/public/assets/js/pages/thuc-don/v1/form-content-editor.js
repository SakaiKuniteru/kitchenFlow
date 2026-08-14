"use strict";

window.ThucDonContentEditor = (() => {

    function init(
        root,
        editor
    ) {

        if (
            !root ||
            !editor
        ) {
            return null;
        }


        if (
            root.dataset.contentEditorBound ===
            "true"
        ) {
            return null;
        }


        root.dataset.contentEditorBound =
            "true";


        bindEvents(
            root,
            editor
        );


        return {
            refresh() {

                const data =
                    editor.getData();


                editor.setWorkingData(
                    data
                );

            }
        };

    }


    function bindEvents(
        root,
        editor
    ) {

        root.addEventListener(
            "click",
            event => {

                const addDay =
                    event.target.closest(
                        "[data-add-day]"
                    );


                if (addDay) {

                    event.preventDefault();
                    event.stopPropagation();


                    handleAddDay(
                        root,
                        editor
                    );


                    return;

                }

                const saveDay =
                    event.target.closest(
                        "[data-save-day]"
                    );


                if (saveDay) {

                    event.preventDefault();
                    event.stopPropagation();


                    window.MCS
                        ?.toast
                        ?.success(
                            "Đã lưu tạm thông tin ngày."
                        );


                    return;

                }

                const editDay =
                    event.target.closest(
                        "[data-edit-day]"
                    );


                if (editDay) {

                    event.preventDefault();
                    event.stopPropagation();


                    handleEditDay(
                        root,
                        editor,
                        editDay
                    );


                    return;

                }

                const deleteDay =
                    event.target.closest(
                        "[data-delete-day]"
                    );


                if (deleteDay) {

                    event.preventDefault();
                    event.stopPropagation();


                    handleDeleteDay(
                        root,
                        editor,
                        deleteDay
                    );


                    return;

                }

                const addGroup =
                    event.target.closest(
                        "[data-add-group]"
                    );


                if (addGroup) {

                    event.preventDefault();
                    event.stopPropagation();


                    handleAddGroup(
                        root,
                        editor
                    );


                    return;

                }

                const saveGroup =
                    event.target.closest(
                        "[data-save-group]"
                    );


                if (saveGroup) {

                    event.preventDefault();
                    event.stopPropagation();


                    window.MCS
                        ?.toast
                        ?.success(
                            "Đã lưu tạm nhóm món."
                        );


                    return;

                }

                const editGroup =
                    event.target.closest(
                        "[data-edit-group]"
                    );


                if (editGroup) {

                    event.preventDefault();
                    event.stopPropagation();


                    handleEditGroup(
                        root,
                        editor,
                        editGroup
                    );


                    return;

                }

                const deleteGroup =
                    event.target.closest(
                        "[data-delete-group]"
                    );


                if (deleteGroup) {

                    event.preventDefault();
                    event.stopPropagation();


                    handleDeleteGroup(
                        root,
                        editor,
                        deleteGroup
                    );


                    return;

                }

                const addFood =
                    event.target.closest(
                        "[data-add-food]"
                    );


                if (addFood) {

                    event.preventDefault();
                    event.stopPropagation();


                    handleAddFood(
                        root,
                        editor
                    );


                    return;

                }

                const saveFood =
                    event.target.closest(
                        "[data-save-food]"
                    );


                if (saveFood) {

                    event.preventDefault();
                    event.stopPropagation();


                    syncImageFile(
                        saveFood,
                        editor
                    );


                    window.MCS
                        ?.toast
                        ?.success(
                            "Đã lưu tạm món ăn."
                        );


                    return;

                }

                const editFood =
                    event.target.closest(
                        "[data-edit-food]"
                    );


                if (editFood) {

                    event.preventDefault();
                    event.stopPropagation();


                    handleEditFood(
                        root,
                        editor,
                        editFood
                    );


                    return;

                }

                const saveGroupSource =
                    event.target.closest(
                        "[data-group-source-save]"
                    );


                if (saveGroupSource) {

                    event.preventDefault();


                    saveGroupSourceValue(
                        root,
                        editor
                    );


                    return;

                }

                const deleteFood =
                    event.target.closest(
                        "[data-delete-food]"
                    );


                if (deleteFood) {

                    event.preventDefault();
                    event.stopPropagation();


                    handleDeleteFood(
                        root,
                        editor,
                        deleteFood
                    );

                }

            }
        );

    }

    function saveGroupSourceValue(
        root,
        editor
    ) {

        const source =
            root.querySelector(
                "[data-group-source]"
            );


        const select =
            source?.querySelector(
                '[name="nhomMonAnId"]'
            );


        const selectedId =
            select?.value;


        if (!selectedId) {

            showContentError(
                "Vui lòng chọn nhóm món."
            );

            return;

        }


        const selected =
            root._thucDonOptions
                ?.nhomMonAn
                ?.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            selectedId
                        )
                );


        if (!selected) {
            return;
        }


        const context =
            getSelectedContext(
                editor
            );


        if (!context.day) {
            return;
        }


        const groups =
            ensureGroups(
                context.day
            );


        const editingGroupId =
            source.dataset.groupId;


        if (editingGroupId) {

            const group =
                groups.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            editingGroupId
                        )
                );


            if (group) {

                group.nhomMonAnId =
                    selected.id;

                group.nhomMonAn = {
                    ...selected
                };

            }

        } else {

            groups.push({

                id:
                    temporaryId(
                        "group"
                    ),

                nhomMonAnId:
                    selected.id,

                nhomMonAn: {
                    ...selected
                },

                dsMonAn:
                    []

            });

        }


        source.hidden =
            true;

        delete source.dataset.groupId;


        editor.setWorkingData(
            context.data
        );

    }


    function handleAddDay(
        root,
        editor
    ) {

        const data =
            editor.getData();


        const days =
            ensureDays(
                data
            );


        let nextDate =
            normalizeDate(
                data.tuNgay
            );


        if (
            days.length
        ) {

            const dates =
                days
                    .map(
                        day =>
                            normalizeDate(
                                getDayDate(
                                    day
                                )
                            )
                    )
                    .filter(
                        Boolean
                    )
                    .sort();


            if (
                dates.length
            ) {

                nextDate =
                    addDays(
                        dates[
                            dates.length - 1
                        ],
                        1
                    );

            }

        }


        const maxDate =
            normalizeDate(
                data.denNgay
            );


        if (
            !nextDate
        ) {

            showContentError(
                "Vui lòng chọn từ ngày trước khi thêm ngày."
            );

            return;

        }


        if (
            maxDate &&
            nextDate >
            maxDate
        ) {

            showContentError(
                "Không thể thêm ngày ngoài thời gian áp dụng của thực đơn."
            );

            return;

        }


        days.push({

            id:
                temporaryId(
                    "day"
                ),

            ngay:
                nextDate,

            ngayApDung:
                nextDate,

            ghiChu:
                "",

            dsNhomMonAn:
                []

        });


        editor.setWorkingData(
            data
        );


        window.MCS
            ?.toast
            ?.success(
                "Đã thêm ngày vào bộ nhớ tạm."
            );

    }


    function handleEditDay(
        root,
        editor,
        button
    ) {

        const item =
            button.closest(
                "[data-day-item]"
            );


        const id =
            item?.dataset.dayId;


        if (!id) {
            return;
        }


        const data =
            editor.getData();


        const day =
            ensureDays(
                data
            ).find(
                value =>
                    String(
                        value.id
                    ) ===
                    String(
                        id
                    )
            );


        if (!day) {
            return;
        }


        /*
         * Chưa đổi ngày ngay tại đây.
         *
         * Việc thay ngày phải dùng date picker,
         * không dùng prompt xấu.
         *
         * Hiện chọn item để chuẩn bị chỉnh sửa.
         */
        item.classList.add(
            "is-editing"
        );


        window.MCS
            ?.toast
            ?.info?.(
                "Ngày đã chuyển sang chế độ chỉnh sửa."
            );

    }


    function handleDeleteDay(
        root,
        editor,
        button
    ) {

        const id =
            button
                .closest(
                    "[data-day-item]"
                )
                ?.dataset.dayId;


        if (!id) {
            return;
        }


        confirmAction({

            title:
                "Xóa ngày",

            message:
                "Toàn bộ nhóm món và món ăn trong ngày này cũng sẽ bị xóa khỏi dữ liệu tạm.",

            confirmLabel:
                "Xóa",

            type:
                "danger",

            onConfirm:
                () => {

                    const data =
                        editor.getData();


                    const days =
                        ensureDays(
                            data
                        );


                    const index =
                        days.findIndex(
                            day =>
                                String(
                                    day.id
                                ) ===
                                String(
                                    id
                                )
                        );


                    if (
                        index <
                        0
                    ) {
                        return;
                    }


                    days.splice(
                        index,
                        1
                    );


                    editor.setWorkingData(
                        data
                    );


                    window.MCS
                        ?.toast
                        ?.success(
                            "Đã xóa ngày khỏi dữ liệu tạm."
                        );

                }

        });

    }

    function handleAddGroup(
        root,
        editor
    ) {

        const context =
            getSelectedContext(
                editor
            );


        if (
            !context.day
        ) {

            showContentError(
                "Vui lòng chọn ngày trước khi thêm nhóm món."
            );

            return;

        }


        openGroupSource(
            root,
            editor,
            null
        );

    }

    function handleEditGroup(
        root,
        editor,
        button
    ) {

        const groupId =
            button
                .closest(
                    "[data-group-item]"
                )
                ?.dataset.groupId;


        const context =
            getSelectedContext(
                editor
            );


        if (
            !context.day ||
            !groupId
        ) {
            return;
        }


        const group =
            ensureGroups(
                context.day
            ).find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        groupId
                    )
            );


        if (!group) {
            return;
        }


        openGroupSource(
            root,
            editor,
            group.nhomMonAnId ??
            group.nhomMonAn?.id
        );


        const source =
            root.querySelector(
                "[data-group-source]"
            );


        if (source) {

            source.dataset.groupId =
                groupId;

        }

    }

    function handleDeleteGroup(
        root,
        editor,
        button
    ) {

        const groupId =
            button
                .closest(
                    "[data-group-item]"
                )
                ?.dataset.groupId;


        if (!groupId) {
            return;
        }


        confirmAction({

            title:
                "Xóa nhóm món",

            message:
                "Các món ăn trong nhóm này cũng sẽ bị xóa khỏi dữ liệu tạm.",

            confirmLabel:
                "Xóa",

            type:
                "danger",

            onConfirm:
                () => {

                    const context =
                        getSelectedContext(
                            editor
                        );


                    if (!context.day) {
                        return;
                    }


                    const groups =
                        ensureGroups(
                            context.day
                        );


                    const index =
                        groups.findIndex(
                            group =>
                                String(
                                    group.id
                                ) ===
                                String(
                                    groupId
                                )
                        );


                    if (
                        index <
                        0
                    ) {
                        return;
                    }


                    groups.splice(
                        index,
                        1
                    );


                    editor.setWorkingData(
                        context.data
                    );

                }

        });

    }


    function handleAddFood(
        root,
        editor
    ) {

        const context =
            getSelectedContext(
                editor
            );


        if (
            !context.group
        ) {

            showContentError(
                "Vui lòng chọn nhóm món trước khi thêm món ăn."
            );

            return;

        }


        const options =
            (
                root._thucDonOptions
                    ?.monAn ||
                []
            )
                .filter(
                    item =>
                        item.active !==
                        false
                );


        openSelectionEditor({

            root,

            title:
                "Chọn món ăn",

            options,

            valueKey:
                "id",

            labelKey:
                "tenMonAn",

            onSave:
                selected => {

                    const foods =
                        ensureFoods(
                            context.group
                        );


                    const exists =
                        foods.some(
                            food =>
                                Number(
                                    food.monAnId ??
                                    food.monAn?.id
                                ) ===
                                Number(
                                    selected.id
                                )
                        );


                    if (
                        exists
                    ) {

                        showContentError(
                            "Món ăn này đã có trong nhóm."
                        );

                        return false;

                    }


                    foods.push({

                        id:
                            temporaryId(
                                "food"
                            ),

                        monAnId:
                            selected.id,

                        monAn:
                            {
                                ...selected
                            },

                        dinhLuong:
                            selected.dinhLuong ??
                            null,

                        donViTinhId:
                            selected.donViTinhId ??
                            null,

                        donViTinh:
                            selected.donViTinh ??
                            null,

                        ghiChu:
                            "",

                        active:
                            true

                    });


                    editor.setWorkingData(
                        context.data
                    );


                    window.MCS
                        ?.toast
                        ?.success(
                            "Đã thêm món ăn vào bộ nhớ tạm."
                        );


                    return true;

                }

        });

    }


    function handleEditFood(
        root,
        editor,
        button
    ) {

        /*
         * Hiện món đã được chọn.
         * Phần ảnh vẫn chỉnh trực tiếp như hiện tại.
         */

        const card =
            button.closest(
                "[data-food-card], [data-food-row]"
            );


        card?.classList.add(
            "is-editing"
        );


        window.MCS
            ?.toast
            ?.info?.(
                "Món ăn đã chuyển sang chế độ chỉnh sửa."
            );

    }


    function handleDeleteFood(
        root,
        editor,
        button
    ) {

        const foodId =
            button
                .closest(
                    "[data-food-card], [data-food-row]"
                )
                ?.dataset.foodId;


        if (!foodId) {
            return;
        }


        confirmAction({

            title:
                "Xóa món ăn",

            message:
                "Bạn có chắc chắn muốn xóa món ăn này khỏi nhóm?",

            confirmLabel:
                "Xóa",

            type:
                "danger",

            onConfirm:
                () => {

                    const context =
                        getSelectedContext(
                            editor
                        );


                    if (!context.group) {
                        return;
                    }


                    const foods =
                        ensureFoods(
                            context.group
                        );


                    const index =
                        foods.findIndex(
                            food =>
                                String(
                                    food.id
                                ) ===
                                String(
                                    foodId
                                )
                        );


                    if (
                        index <
                        0
                    ) {
                        return;
                    }


                    foods.splice(
                        index,
                        1
                    );


                    editor.setWorkingData(
                        context.data
                    );

                }

        });

    }


    function getSelectedContext(
        editor
    ) {

        const data =
            editor.getData();


        const state =
            editor.getState();


        const days =
            ensureDays(
                data
            );


        const day =
            days.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        state.currentData
                            ? getSelectedDayId()
                            : ""
                    )
            ) ||
            days[0] ||
            null;


        /*
         * ThucDonForm giữ selection riêng,
         * nên lấy trực tiếp từ DOM.
         */
        const selectedDay =
            document.querySelector(
                "[data-day-item].is-active"
            );


        const actualDay =
            selectedDay
                ? days.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            selectedDay.dataset.dayId
                        )
                )
                : day;


        const groups =
            actualDay
                ? ensureGroups(
                    actualDay
                )
                : [];


        const selectedGroup =
            document.querySelector(
                "[data-group-item].is-active"
            );


        const group =
            selectedGroup
                ? groups.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            selectedGroup.dataset.groupId
                        )
                )
                : groups[0] ||
                null;


        return {

            data,

            day:
                actualDay,

            group

        };

    }


    function ensureDays(
        data
    ) {

        if (
            !Array.isArray(
                data.dsNgay
            )
        ) {

            data.dsNgay =
                data.danhSachNgay ||
                [];

        }


        return data.dsNgay;

    }


    function ensureGroups(
        day
    ) {

        if (
            !Array.isArray(
                day.dsNhomMonAn
            )
        ) {

            day.dsNhomMonAn =
                day.danhSachNhomMonAn ||
                [];

        }


        return day.dsNhomMonAn;

    }


    function ensureFoods(
        group
    ) {

        if (
            !Array.isArray(
                group.dsMonAn
            )
        ) {

            group.dsMonAn =
                group.danhSachMonAn ||
                [];

        }


        return group.dsMonAn;

    }

    function openGroupSource(
        root,
        editor,
        selectedId = null
    ) {

        const source =
            root.querySelector(
                "[data-group-source]"
            );


        const select =
            source?.querySelector(
                '[name="nhomMonAnId"]'
            );


        if (
            !source ||
            !select
        ) {
            return;
        }


        const options =
            root._thucDonOptions
                ?.nhomMonAn ||
            [];


        setSourceSelectOptions(
            select,
            options,
            "id",
            "tenNhomMonAn",
            selectedId
        );


        source.hidden =
            false;


        source.dataset.editingId =
            selectedId ??
            "";

    }

    function setSourceSelectOptions(
        select,
        records,
        valueKey,
        labelKey,
        selectedValue = null
    ) {

        select.innerHTML =
            "";


        records
            .filter(
                item =>
                    item.active !==
                    false
            )
            .forEach(
                item => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        String(
                            item[
                                valueKey
                            ]
                        );


                    option.textContent =
                        item[
                            labelKey
                        ] ||
                        "-";


                    select.appendChild(
                        option
                    );

                }
            );


        const wrapper =
            select.closest(
                "[data-smart-select]"
            );


        const api =
            window.MCS
                ?.smartSelect
                ?.initialize(
                    wrapper
                );


        api?.refresh();


        if (
            selectedValue !==
            null &&
            selectedValue !==
            undefined
        ) {

            api?.setValue(
                String(
                    selectedValue
                ),
                false
            );

        } else {

            api?.clear(
                false
            );

        }

    }

    function confirmAction(
        config
    ) {

        if (
            window.MCS
                ?.confirm
                ?.show
        ) {

            window.MCS.confirm.show(
                config
            );

            return;

        }


        if (
            window.confirm(
                config.message
            )
        ) {

            config.onConfirm?.();

        }

    }


    function showContentError(
        message
    ) {

        window.MCS
            ?.toast
            ?.error(
                message
            );

    }


    function syncImageFile(
        button,
        editor
    ) {

        const card =
            button.closest(
                "[data-food-card]"
            );


        if (
            !card?._imageFile
        ) {
            return;
        }


        /*
         * Chưa upload ở đây.
         * Giữ File object tại card.
         *
         * Khi nhấn nút Lưu thực sự phía trên
         * mới xử lý upload.
         */

    }


    function temporaryId(
        type
    ) {

        return (
            `tmp-${type}-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 7)}`
        );

    }


    function normalizeDate(
        value
    ) {

        return String(
            value ||
            ""
        ).substring(
            0,
            10
        );

    }


    function getDayDate(
        day
    ) {

        return (
            day.ngayApDung ||
            day.ngay ||
            day.ngayThucDon ||
            ""
        );

    }


    function addDays(
        value,
        amount
    ) {

        const [
            year,
            month,
            day
        ] =
            value
                .split(
                    "-"
                )
                .map(
                    Number
                );


        const date =
            new Date(
                year,
                month - 1,
                day
            );


        date.setDate(
            date.getDate() +
            amount
        );


        return [
            date.getFullYear(),

            String(
                date.getMonth() +
                1
            ).padStart(
                2,
                "0"
            ),

            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            )

        ].join(
            "-"
        );

    }


    function getSelectedDayId() {

        return document
            .querySelector(
                "[data-day-item].is-active"
            )
            ?.dataset.dayId ||
            null;

    }


    function escapeHtml(
        value
    ) {

        return String(
            value ??
            ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }


    return {
        init
    };

})();