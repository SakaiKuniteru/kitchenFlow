"use strict";

window.ThucDonForm = (() => {

    const PLACEHOLDER_IMAGE =
        "/uploads/danh-muc/mon-an/mon-an.png";

    const TRANG_THAI_THUC_DON = Object.freeze({

        TAO_MOI_CHO_DUYET: 10,

        CHO_DUYET: 20,

        DANG_AP_DUNG: 30,

        CHO_DUYET_LAI: 40,

        DA_HUY: 50,

        DA_KET_THUC: 60

    });

    const TRANG_THAI_THUC_DON_LABEL = Object.freeze({

        10: "Tạo mới/Chờ duyệt",

        20: "Chờ duyệt",

        30: "Đang áp dụng",

        40: "Chờ duyệt lại",

        50: "Đã hủy",

        60: "Đã kết thúc"

    });

    function init(root) {

        if (!root) {
            return null;
        }


        const state = {

            data:
                null,

            selectedDayId:
                null,

            selectedGroupId:
                null,

            selectedFoodId:
                null

        };


        bindEvents(
            root,
            state
        );


        return {

            setData(
                data
            ) {

                state.data =
                    data;


                selectDefault(
                    state
                );


                renderAll(
                    root,
                    state
                );

            },


            getData() {

                syncGeneralForm(
                    root,
                    state
                );


                return state.data;

            },


            getState() {

                return state;

            },


            render() {

                renderAll(
                    root,
                    state
                );

            }

        };

    }

    function syncGeneralForm(
        root,
        state
    ) {

        if (!state.data) {
            return;
        }


        state.data.maThucDon =
            getFieldValue(
                root,
                "maThucDon"
            );


        state.data.tenThucDon =
            getFieldValue(
                root,
                "tenThucDon"
            );


        state.data.loaiThucDon =
            getNumberFieldValue(
                root,
                "loaiThucDon"
            );


        state.data.coSoId =
            getNumberFieldValue(
                root,
                "coSoId"
            );


        state.data.nhaAnId =
            getNumberFieldValue(
                root,
                "nhaAnId"
            );


        state.data.caAnId =
            getNumberFieldValue(
                root,
                "caAnId"
            );


        state.data.tuNgay =
            getFieldValue(
                root,
                "tuNgay"
            );


        state.data.denNgay =
            getFieldValue(
                root,
                "denNgay"
            );


        state.data.moTa =
            getFieldValue(
                root,
                "moTa"
            );

    }

    function getFieldValue(
        root,
        name
    ) {

        return (
            root.querySelector(
                `[name="${name}"]`
            )
                ?.value
                ?.trim() ||
            ""
        );

    }

    function getNumberFieldValue(
        root,
        name
    ) {

        const value =
            root.querySelector(
                `[name="${name}"]`
            )
                ?.value;


        if (
            value === "" ||
            value === null ||
            value === undefined
        ) {
            return null;
        }


        return Number(
            value
        );

    }

    function normalizeImageUrl(
        value
    ) {

        if (!value) {
            return PLACEHOLDER_IMAGE;
        }


        const url =
            String(
                value
            ).trim();


        if (!url) {
            return PLACEHOLDER_IMAGE;
        }


        if (
            url.startsWith(
                "http://"
            ) ||
            url.startsWith(
                "https://"
            ) ||
            url.startsWith(
                "blob:"
            ) ||
            url.startsWith(
                "data:"
            ) ||
            url.startsWith(
                "/"
            )
        ) {

            return url;

        }


        return `/${url}`;

    }

    function selectDefault(state) {

        const days =
            getDays(
                state
            );


        state.selectedDayId =
            days.length
                ? String(
                    days[0].id
                )
                : null;


        const groups =
            getGroups(
                state
            );


        state.selectedGroupId =
            groups.length
                ? String(
                    groups[0].id
                )
                : null;


        const foods =
            getFoods(
                state
            );


        state.selectedFoodId =
            foods.length
                ? String(
                    foods[0].id
                )
                : null;

    }

    function renderAll(
        root,
        state
    ) {

        renderGeneral(
            root,
            state
        );

        renderDays(
            root,
            state
        );

        renderGroups(
            root,
            state
        );

        renderFoods(
            root,
            state
        );

    }

    function renderGeneral(
        root,
        state
    ) {

        const data =
            state.data;


        if (!data) {
            return;
        }


        setText(
            root,
            "[data-general-ma]",
            data.maThucDon
        );


        setText(
            root,
            "[data-general-ten]",
            data.tenThucDon
        );


        setText(
            root,
            "[data-general-loai]",
            data.loaiThucDonText ||
            data.tenLoaiThucDon ||
            getOptionLabel(
                root,
                "[data-loai-thuc-don-option]",
                data.loaiThucDon
            )
        );


        setText(
            root,
            "[data-general-co-so]",
            getName(
                data.coSo,
                "tenCoSo"
            )
        );


        setText(
            root,
            "[data-general-nha-an]",
            getName(
                data.nhaAn,
                "tenNhaAn"
            )
        );


        setText(
            root,
            "[data-general-ca-an]",
            getName(
                data.caAn,
                "tenCaAn"
            )
        );


        setText(
            root,
            "[data-general-thoi-gian]",
            buildDateRange(
                data.tuNgay,
                data.denNgay
            )
        );


        const status =
            root.querySelector(
                "[data-general-trang-thai]"
            );

        if (status) {

            const trangThai =
                Number(
                    data.trangThai
                );

            const trangThaiText =
                getTrangThaiText(
                    trangThai
                );

            status.textContent =
                trangThaiText;

            status.classList.remove(
                "is-new",
                "is-pending",
                "is-active",
                "is-review",
                "is-cancelled",
                "is-ended",
                "is-default"
            );

            status.classList.add(
                getStatusClass(
                    trangThai
                )
            );

        }

    }

    function renderDays(
        root,
        state
    ) {

        const list =
            root.querySelector(
                "[data-days-list]"
            );


        const template =
            document.getElementById(
                "template-thuc-don-day"
            );


        if (
            !list ||
            !template
        ) {
            return;
        }


        list.innerHTML =
            "";


        const days =
            getDays(
                state
            );


        days.forEach(
            day => {

                const fragment =
                    template.content
                        .cloneNode(
                            true
                        );


                const item =
                    fragment.querySelector(
                        "[data-day-item]"
                    );


                item.dataset.dayId =
                    day.id;


                item.classList.toggle(
                    "is-active",
                    String(day.id) ===
                    String(
                        state.selectedDayId
                    )
                );


                setFragmentText(
                    fragment,
                    "[data-day-date]",
                    formatDate(
                        getDayDate(
                            day
                        )
                    )
                );


                setFragmentText(
                    fragment,
                    "[data-day-weekday]",
                    day.thu ||
                    getWeekday(
                        getDayDate(
                            day
                        )
                    )
                );


                setFragmentText(
                    fragment,
                    "[data-day-count]",
                    `${countFoods(day)} món`
                );


                list.appendChild(
                    fragment
                );

            }
        );

    }

    function renderGroups(
        root,
        state
    ) {

        const list =
            root.querySelector(
                "[data-groups-list]"
            );


        const template =
            document.getElementById(
                "template-thuc-don-group"
            );


        if (
            !list ||
            !template
        ) {
            return;
        }


        list.innerHTML =
            "";


        const groups =
            getGroups(
                state
            );


        groups.forEach(
            group => {

                const fragment =
                    template.content
                        .cloneNode(
                            true
                        );


                const item =
                    fragment.querySelector(
                        "[data-group-item]"
                    );


                item.dataset.groupId =
                    group.id;


                item.classList.toggle(
                    "is-active",
                    String(group.id) ===
                    String(
                        state.selectedGroupId
                    )
                );


                setFragmentText(
                    fragment,
                    "[data-group-name]",
                    getGroupName(
                        group
                    )
                );


                setFragmentText(
                    fragment,
                    "[data-group-count]",
                    `${
                        getGroupFoods(
                            group
                        ).length
                    } món`
                );


                list.appendChild(
                    fragment
                );

            }
        );

    }

    function renderFoods(
        root,
        state
    ) {

        const day =
            getSelectedDay(
                state
            );


        const group =
            getSelectedGroup(
                state
            );


        setText(
            root,
            "[data-food-applied-date]",
            day
                ? buildAppliedDate(
                    day
                )
                : "-"
        );


        setText(
            root,
            "[data-food-group-name]",
            group
                ? getGroupName(
                    group
                )
                : "Chưa chọn nhóm món"
        );


        const foods =
            getFoods(
                state
            );

        setText(
            root,
            "[data-food-group-count]",
            `${foods.length} món`
        );


        const list =
            root.querySelector(
                "[data-food-list]"
            );


        if (!list) {
            return;
        }


        list.innerHTML =
            "";


        if (!foods.length) {

            renderEmptyFood(
                list
            );

            return;
        }


        let selected =
            foods.find(
                food =>
                    String(food.id) ===
                    String(
                        state.selectedFoodId
                    )
            );


        if (!selected) {

            selected =
                foods[0];


            state.selectedFoodId =
                String(
                    selected.id
                );

        }


        renderFoodDetail(
            list,
            selected
        );


        foods
            .filter(
                food =>
                    String(food.id) !==
                    String(selected.id)
            )
            .forEach(
                food => {

                    renderFoodRow(
                        list,
                        food
                    );

                }
            );

    }

    function renderFoodDetail(
        list,
        food
    ) {

        const template =
            document.getElementById(
                "template-thuc-don-food-detail"
            );


        if (!template) {
            return;
        }


        const fragment =
            template.content
                .cloneNode(
                    true
                );


        const card =
            fragment.querySelector(
                "[data-food-card]"
            );


        card.dataset.foodId =
            food.id;


        fillFood(
            fragment,
            food
        );


        list.appendChild(
            fragment
        );

    }

    function renderFoodRow(
        list,
        food
    ) {

        const template =
            document.getElementById(
                "template-thuc-don-food-row"
            );


        if (!template) {
            return;
        }


        const fragment =
            template.content
                .cloneNode(
                    true
                );


        const row =
            fragment.querySelector(
                "[data-food-row]"
            );


        row.dataset.foodId =
            food.id;


        fillFood(
            fragment,
            food
        );


        list.appendChild(
            fragment
        );

    }

    function fillFood(
        root,
        food
    ) {

        setFragmentText(
            root,
            "[data-food-name]",
            food.tenMonAn
        );


        setFragmentText(
            root,
            "[data-food-code]",
            food.maMonAn
        );


        setFragmentText(
            root,
            "[data-food-status]",
            food.active === false
                ? "Ngừng sử dụng"
                : "Đang sử dụng"
        );


        setFragmentText(
            root,
            "[data-food-quantity]",
            buildQuantity(
                food
            )
        );


        setFragmentText(
            root,
            "[data-food-unit]",
            getUnitName(
                food
            )
        );


        setFragmentText(
            root,
            "[data-food-portion]",
            food.khauPhan ||
            food.tenKhauPhan ||
            "-"
        );


        setFragmentText(
            root,
            "[data-food-description]",
            food.moTa ||
            "-"
        );


        setFragmentText(
            root,
            "[data-food-preparation]",
            food.cachCheBien ||
            "-"
        );


        setFragmentText(
            root,
            "[data-food-note]",
            food.ghiChu ||
            "-"
        );


        const image =
            root.querySelector(
                "[data-food-image]"
            );


        if (image) {

            image.src =
                normalizeImageUrl(
                    food.hinhAnh ||
                    food.anh ||
                    food.duongDanAnh
                );


            image.alt =
                food.tenMonAn ||
                "Món ăn";


            image.onerror =
                () => {

                    image.onerror =
                        null;


                    image.src =
                        PLACEHOLDER_IMAGE;

                };

        }

    }

    function renderEmptyFood(list) {

        list.innerHTML = `
            <div class="thuc-don-food-empty">

                <i class="fa-solid fa-utensils"></i>

                <strong>
                    Chưa có món ăn
                </strong>

                <span>
                    Nhóm món này chưa có món ăn.
                </span>

            </div>
        `;

    }

    function bindEvents(
        root,
        state
    ) {

        root.addEventListener(
            "click",
            event => {

                const dayButton =
                    event.target.closest(
                        "[data-select-day]"
                    );


                if (dayButton) {

                    selectDay(
                        root,
                        state,
                        dayButton
                    );

                    return;
                }


                const groupButton =
                    event.target.closest(
                        "[data-select-group]"
                    );


                if (groupButton) {

                    selectGroup(
                        root,
                        state,
                        groupButton
                    );

                    return;
                }


                const foodButton =
                    event.target.closest(
                        "[data-select-food]"
                    );


                if (foodButton) {

                    selectFood(
                        root,
                        state,
                        foodButton
                    );

                    return;
                }


                const collapse =
                    event.target.closest(
                        "[data-food-group-collapse]"
                    );


                if (collapse) {

                    toggleFoodGroup(
                        root,
                        collapse
                    );

                }

            }
        );

    }

    function selectDay(
        root,
        state,
        button
    ) {

        const item =
            button.closest(
                "[data-day-item]"
            );


        if (!item) {
            return;
        }


        state.selectedDayId =
            item.dataset.dayId;


        const groups =
            getGroups(
                state
            );


        state.selectedGroupId =
            groups.length
                ? String(
                    groups[0].id
                )
                : null;


        const foods =
            getFoods(
                state
            );


        state.selectedFoodId =
            foods.length
                ? String(
                    foods[0].id
                )
                : null;


        renderDays(
            root,
            state
        );


        renderGroups(
            root,
            state
        );


        renderFoods(
            root,
            state
        );

    }

    function selectGroup(
        root,
        state,
        button
    ) {

        const item =
            button.closest(
                "[data-group-item]"
            );


        if (!item) {
            return;
        }


        state.selectedGroupId =
            item.dataset.groupId;


        const foods =
            getFoods(
                state
            );


        state.selectedFoodId =
            foods.length
                ? String(
                    foods[0].id
                )
                : null;


        renderGroups(
            root,
            state
        );


        renderFoods(
            root,
            state
        );

    }

    function selectFood(
        root,
        state,
        button
    ) {

        const row =
            button.closest(
                "[data-food-row]"
            );


        if (!row) {
            return;
        }


        state.selectedFoodId =
            row.dataset.foodId;


        renderFoods(
            root,
            state
        );

    }

    function toggleFoodGroup(
        root,
        button
    ) {

        const body =
            root.querySelector(
                "[data-food-group-body]"
            );


        if (!body) {
            return;
        }


        body.hidden =
            !body.hidden;


        button.innerHTML =
            body.hidden
                ? `
                    <i class="fa-solid fa-chevron-down"></i>
                `
                : `
                    <i class="fa-solid fa-chevron-up"></i>
                `;

    }

    function getDays(state) {

        const data =
            state.data;


        if (!data) {
            return [];
        }


        return (
            data.dsNgay ||
            data.danhSachNgay ||
            data.ngay ||
            []
        );

    }

    function getSelectedDay(state) {

        return getDays(
            state
        ).find(
            day =>
                String(day.id) ===
                String(
                    state.selectedDayId
                )
        );

    }

    function getGroups(state) {

        const day =
            getSelectedDay(
                state
            );


        if (!day) {
            return [];
        }


        return (
            day.dsNhomMonAn ||
            day.danhSachNhomMonAn ||
            day.danhSachNhomMon ||
            day.dsNhomMon ||
            []
        );

    }

    function getSelectedGroup(state) {

        return getGroups(
            state
        ).find(
            group =>
                String(group.id) ===
                String(
                    state.selectedGroupId
                )
        );

    }

    function getGroupFoods(group) {

        if (!group) {
            return [];
        }


        return (
            group.dsMonAn ||
            group.danhSachMonAn ||
            group.monAn ||
            []
        );

    }

    function getFoods(state) {

        return getGroupFoods(
            getSelectedGroup(
                state
            )
        ).map(
            normalizeFood
        );

    }

    function normalizeFood(item) {

        if (!item) {
            return {};
        }


        const monAn =
            item.monAn ||
            item;


        return {

            id:
                item.id ??
                monAn.id,

            monAnId:
                item.monAnId ??
                monAn.id,

            maMonAn:
                monAn.maMonAn,

            tenMonAn:
                monAn.tenMonAn,

            hinhAnh:
                monAn.hinhAnh,

            moTa:
                monAn.moTa,

            active:
                item.active ??
                monAn.active,

            giaTien:
                monAn.giaTien,

            giaDuKien:
                monAn.giaDuKien,

            calories:
                monAn.calories,

            dinhLuong:
                item.dinhLuong,

            donViTinhId:
                item.donViTinhId,

            donViTinh:
                item.donViTinh,

            ghiChu:
                item.ghiChu,

            thuTuHienThi:
                item.thuTuHienThi

        };

    }

    function countFoods(day) {

        if (!day) {
            return 0;
        }


        const groups =
            day.dsNhomMonAn ||
            day.danhSachNhomMonAn ||
            day.danhSachNhomMon ||
            day.dsNhomMon ||
            [];


        return groups.reduce(
            (
                total,
                group
            ) => {

                return (
                    total +
                    getGroupFoods(
                        group
                    ).length
                );

            },
            0
        );

    }

    function getDayDate(day) {

        return (
            day.ngayApDung ||
            day.ngay ||
            day.ngayThucDon
        );

    }

    function getGroupName(group) {

        return (
            group.tenNhomMonAn ||
            group.tenNhomMon ||
            group.nhomMonAn?.tenNhomMonAn ||
            "-"
        );

    }

    function getOptionLabel(
        root,
        selector,
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {
            return "-";
        }


        const options =
            root.querySelectorAll(
                selector
            );


        const targetValue =
            String(
                value
            );


        for (
            const option
            of options
        ) {

            if (
                String(
                    option.dataset.value
                ) ===
                targetValue
            ) {

                return (
                    option.dataset.label ||
                    "-"
                );

            }

        }


        return "-";

    }

    function getName(
        object,
        key
    ) {

        if (!object) {
            return "-";
        }


        if (
            typeof object ===
            "string"
        ) {
            return object;
        }


        return (
            object[key] ||
            object.ten ||
            "-"
        );

    }

    function getUnitName(food) {

        if (
            typeof food.donViTinh ===
            "string"
        ) {
            return food.donViTinh;
        }


        return (
            food.donViTinh?.tenDonViTinh ||
            food.tenDonViTinh ||
            "-"
        );

    }

    function buildQuantity(food) {

        const quantity =
            food.dinhLuong;


        if (
            quantity === null ||
            quantity === undefined ||
            quantity === ""
        ) {
            return "-";
        }


        const unit =
            getUnitName(
                food
            );


        if (
            !unit ||
            unit === "-"
        ) {
            return String(
                quantity
            );
        }


        return `${quantity} ${unit}`;

    }

    function setText(
        root,
        selector,
        value
    ) {

        const element =
            root.querySelector(
                selector
            );


        if (!element) {
            return;
        }


        element.textContent =
            value ??
            "-";

    }

    function setFragmentText(
        root,
        selector,
        value
    ) {

        const element =
            root.querySelector(
                selector
            );


        if (!element) {
            return;
        }


        element.textContent =
            value ??
            "-";

    }

    function formatDate(value) {

        if (!value) {
            return "-";
        }


        const date =
            String(value)
                .substring(
                    0,
                    10
                );


        const parts =
            date.split(
                "-"
            );


        if (
            parts.length !== 3
        ) {
            return value;
        }


        return `${parts[2]}/${parts[1]}/${parts[0]}`;

    }

    function buildDateRange(
        from,
        to
    ) {

        if (
            !from &&
            !to
        ) {
            return "-";
        }


        if (!from) {

            return formatDate(
                to
            );

        }


        if (!to) {

            return formatDate(
                from
            );

        }


        return `${formatDate(from)} - ${formatDate(to)}`;

    }

    function getWeekday(value) {

        if (!value) {
            return "-";
        }


        const date =
            new Date(
                `${String(value).substring(
                    0,
                    10
                )}T00:00:00`
            );


        const days = [

            "Chủ nhật",
            "Thứ hai",
            "Thứ ba",
            "Thứ tư",
            "Thứ năm",
            "Thứ sáu",
            "Thứ bảy"

        ];


        return days[
            date.getDay()
        ];

    }

    function buildAppliedDate(day) {

        const value =
            getDayDate(
                day
            );


        return `${formatDate(
            value
        )} (${day.thu || getWeekday(
            value
        )})`;

    }

    function getTrangThaiText(
        trangThai
    ) {

        return (
            TRANG_THAI_THUC_DON_LABEL[
                Number(
                    trangThai
                )
            ] ||
            "-"
        );

    }

    function getStatusClass(
        trangThai
    ) {

        switch (
            Number(
                trangThai
            )
        ) {

            case TRANG_THAI_THUC_DON.TAO_MOI_CHO_DUYET:

                return "is-new";


            case TRANG_THAI_THUC_DON.CHO_DUYET:

                return "is-pending";


            case TRANG_THAI_THUC_DON.DANG_AP_DUNG:

                return "is-active";


            case TRANG_THAI_THUC_DON.CHO_DUYET_LAI:

                return "is-review";


            case TRANG_THAI_THUC_DON.DA_HUY:

                return "is-cancelled";


            case TRANG_THAI_THUC_DON.DA_KET_THUC:

                return "is-ended";


            default:

                return "is-default";

        }

    }

    return {
        init
    };

})();