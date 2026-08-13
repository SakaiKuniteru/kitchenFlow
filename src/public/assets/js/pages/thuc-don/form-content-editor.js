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

                /*
                 * THÊM NGÀY
                 */
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


                /*
                 * LƯU TẠM NGÀY
                 */
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


                /*
                 * SỬA NGÀY
                 */
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


                /*
                 * XÓA NGÀY
                 */
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


                /*
                 * THÊM NHÓM
                 */
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


                /*
                 * LƯU NHÓM
                 */
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


                /*
                 * SỬA NHÓM
                 */
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


                /*
                 * XÓA NHÓM
                 */
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


                /*
                 * THÊM MÓN
                 */
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


                /*
                 * LƯU TẠM MÓN
                 */
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


                /*
                 * SỬA MÓN
                 */
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


                /*
                 * XÓA MÓN
                 */
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


        const options =
            (
                root._thucDonOptions
                    ?.nhomMonAn ||
                []
            )
                .filter(
                    item =>
                        item.active !==
                        false
                );


        if (
            !options.length
        ) {

            showContentError(
                "Không có nhóm món đang hoạt động."
            );

            return;

        }


        openSelectionEditor({

            root,

            title:
                "Chọn nhóm món",

            options,

            valueKey:
                "id",

            labelKey:
                "tenNhomMonAn",

            onSave:
                selected => {

                    const groups =
                        ensureGroups(
                            context.day
                        );


                    const exists =
                        groups.some(
                            group =>
                                Number(
                                    group.nhomMonAnId ??
                                    group.nhomMonAn?.id
                                ) ===
                                Number(
                                    selected.id
                                )
                        );


                    if (
                        exists
                    ) {

                        showContentError(
                            "Nhóm món này đã có trong ngày."
                        );

                        return false;

                    }


                    groups.push({

                        id:
                            temporaryId(
                                "group"
                            ),

                        nhomMonAnId:
                            selected.id,

                        nhomMonAn:
                            {
                                ...selected
                            },

                        tenNhomMonAn:
                            selected.tenNhomMonAn,

                        dsMonAn:
                            []

                    });


                    editor.setWorkingData(
                        context.data
                    );


                    window.MCS
                        ?.toast
                        ?.success(
                            "Đã thêm nhóm món vào bộ nhớ tạm."
                        );


                    return true;

                }

        });

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


        const groups =
            ensureGroups(
                context.day
            );


        const group =
            groups.find(
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


        const options =
            root._thucDonOptions
                ?.nhomMonAn ||
            [];


        openSelectionEditor({

            root,

            title:
                "Đổi nhóm món",

            options,

            selectedId:
                group.nhomMonAnId ??
                group.nhomMonAn?.id,

            valueKey:
                "id",

            labelKey:
                "tenNhomMonAn",

            onSave:
                selected => {

                    group.nhomMonAnId =
                        selected.id;


                    group.nhomMonAn = {
                        ...selected
                    };


                    group.tenNhomMonAn =
                        selected.tenNhomMonAn;


                    editor.setWorkingData(
                        context.data
                    );


                    return true;

                }

        });

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


    function openSelectionEditor(
        config
    ) {

        const old =
            document.querySelector(
                "[data-content-selection-editor]"
            );


        old?.remove();


        const overlay =
            document.createElement(
                "div"
            );


        overlay.className =
            "thuc-don-content-selection";


        overlay.dataset.contentSelectionEditor =
            "true";


        const options =
            config.options
                .filter(
                    item =>
                        item.active !==
                        false
                )
                .map(
                    item => {

                        const value =
                            item[
                                config.valueKey
                            ];


                        const label =
                            item[
                                config.labelKey
                            ];


                        const selected =
                            String(
                                value
                            ) ===
                            String(
                                config.selectedId
                            );


                        return `
                            <option
                                value="${escapeHtml(
                                    value
                                )}"
                                ${
                                    selected
                                        ? "selected"
                                        : ""
                                }>
                                ${escapeHtml(
                                    label
                                )}
                            </option>
                        `;

                    }
                )
                .join(
                    ""
                );


        overlay.innerHTML = `
            <div class="thuc-don-content-selection__box">

                <strong class="thuc-don-content-selection__title">
                    ${escapeHtml(
                        config.title
                    )}
                </strong>

                <select
                    class="thuc-don-content-selection__select"
                    data-content-selection>

                    <option value="">
                        -- Chọn --
                    </option>

                    ${options}

                </select>

                <div class="thuc-don-content-selection__actions">

                    <button
                        type="button"
                        class="is-cancel"
                        data-content-selection-cancel>
                        Hủy
                    </button>

                    <button
                        type="button"
                        class="is-save"
                        data-content-selection-save>
                        Lưu tạm
                    </button>

                </div>

            </div>
        `;


        document.body.appendChild(
            overlay
        );


        overlay
            .querySelector(
                "[data-content-selection-cancel]"
            )
            ?.addEventListener(
                "click",
                () => {

                    overlay.remove();

                }
            );


        overlay
            .querySelector(
                "[data-content-selection-save]"
            )
            ?.addEventListener(
                "click",
                () => {

                    const value =
                        overlay.querySelector(
                            "[data-content-selection]"
                        )?.value;


                    const selected =
                        config.options.find(
                            item =>
                                String(
                                    item[
                                        config.valueKey
                                    ]
                                ) ===
                                String(
                                    value
                                )
                        );


                    if (!selected) {

                        showContentError(
                            "Vui lòng chọn dữ liệu."
                        );

                        return;

                    }


                    const close =
                        config.onSave(
                            selected
                        );


                    if (
                        close !== false
                    ) {

                        overlay.remove();

                    }

                }
            );

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