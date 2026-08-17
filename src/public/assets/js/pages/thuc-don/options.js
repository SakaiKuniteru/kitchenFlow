"use strict";


window.ThucDon =
    window.ThucDon ||
    {};


window.ThucDon.options =
    (() => {

        async function init(
            root,
            data = null
        ) {

            const [
                enumsResponse,
                coSo,
                nhaAn,
                caAn,
                nhomMonAn,
                monAn,
                donViTinh
            ] =
                await Promise.all([

                    window.ThucDon
                        .api
                        .enums(),

                    getList(
                        "/api/mcs/v1/dm-co-so/tong-hop?active=true"
                    ),

                    getList(
                        "/api/mcs/v1/dm-nha-an/tong-hop?active=true"
                    ),

                    getList(
                        "/api/mcs/v1/dm-ca-an/tong-hop?active=true"
                    ),

                    getList(
                        "/api/mcs/v1/dm-nhom-mon-an/tong-hop?active=true"
                    ),

                    getList(
                        "/api/mcs/v1/dm-mon-an/tong-hop?active=true"
                    ),

                    getList(
                        "/api/mcs/v1/dm-don-vi-tinh/tong-hop?active=true"
                    )
                        .catch(
                            () => []
                        )

                ]);


            const enums =
                enumsResponse?.data ??
                enumsResponse ??
                {};


            const loaiThucDon =
                Array.isArray(
                    enums.loaiThucDon
                )
                    ? enums.loaiThucDon
                    : [];


            root._tdOptions = {
                loaiThucDon,
                coSo,
                nhaAn,
                caAn,
                nhomMonAn,
                monAn,
                donViTinh
            };


            fillEnum(
                root.querySelector(
                    '[name="loaiThucDon"]'
                ),
                loaiThucDon,
                data?.loaiThucDon
            );


            fill(
                root.querySelector(
                    '[name="coSoId"]'
                ),
                coSo,
                "id",
                "tenCoSo",
                data?.coSoId
            );


            fill(
                root.querySelector(
                    '[name="caAnId"]'
                ),
                caAn,
                "id",
                "tenCaAn",
                data?.caAnId
            );


            refreshNhaAn(
                root,
                data?.coSoId,
                data?.nhaAnId
            );


            fill(
                root.querySelector(
                    '[name="tdDonViTinhId"]'
                ),
                donViTinh,
                "id",
                "tenDonViTinh",
                null
            );


            bindDependencies(
                root
            );

        }

        function bindDependencies(
            root
        ) {

            const coSoSelect =
                root.querySelector(
                    '[name="coSoId"]'
                );


            if (
                coSoSelect &&
                !coSoSelect.dataset.tdBound
            ) {

                coSoSelect.dataset.tdBound =
                    "true";


                coSoSelect.addEventListener(
                    "change",
                    () => {

                        refreshNhaAn(
                            root,
                            coSoSelect.value,
                            null
                        );

                    }
                );

            }

        }

        function refreshNhaAn(
            root,
            coSoId,
            selectedId = null
        ) {

            const select =
                root.querySelector(
                    '[name="nhaAnId"]'
                );


            if (!select) {
                return;
            }


            const wrapper =
                select.closest(
                    "[data-smart-select]"
                );


            if (!coSoId) {

                fill(
                    select,
                    [],
                    "id",
                    "tenNhaAn",
                    null
                );


                if (wrapper) {

                    wrapper.dataset.selectPlaceholder =
                        "Chọn cơ sở trước";

                }


                disable(
                    select,
                    true
                );


                wrapper
                    ?.smartSelect
                    ?.refresh
                    ?.();


                return;

            }


            const targetId =
                String(
                    coSoId
                );


            const list =
                (
                    root._tdOptions
                        ?.nhaAn ||
                    []
                )
                    .filter(
                        item => {

                            const itemCoSoId =
                                item.coSoId ??
                                item.coSo?.id;


                            return (
                                String(
                                    itemCoSoId
                                ) ===
                                targetId
                            );

                        }
                    );


            if (wrapper) {

                wrapper.dataset.selectPlaceholder =
                    list.length
                        ? "Chọn nhà ăn"
                        : "Cơ sở chưa có nhà ăn";

            }


            fill(
                select,
                list,
                "id",
                "tenNhaAn",
                selectedId
            );


            disable(
                select,
                list.length === 0
            );


            wrapper
                ?.smartSelect
                ?.refresh
                ?.();

        }

        function refreshDayOptions(
            root,
            tuNgay,
            denNgay,
            selectedDays = []
        ) {

            const container =
                root.querySelector(
                    "[data-day-checkbox-list]"
                );


            if (!container) {
                return;
            }


            const from =
                window.ThucDon
                    .form
                    .normalizeDate(
                        tuNgay
                    );


            const to =
                window.ThucDon
                    .form
                    .normalizeDate(
                        denNgay
                    );


            if (
                !from ||
                !to
            ) {

                container.innerHTML =
                    `
                        <div class="td-checkbox-list__empty">
                            Vui lòng chọn từ ngày và đến ngày trước.
                        </div>
                    `;


                return;

            }


            if (
                from >
                to
            ) {

                container.innerHTML =
                    `
                        <div class="td-checkbox-list__empty">
                            Từ ngày không được lớn hơn đến ngày.
                        </div>
                    `;


                return;

            }


            const selectedDateSet =
                new Set(
                    selectedDays.map(
                        day =>
                            window.ThucDon
                                .form
                                .normalizeDate(
                                    day.ngay ||
                                    day.ngayApDung
                                )
                    )
                );


            const days =
                buildDateRange(
                    from,
                    to
                );


            window.MCS
                ?.checkboxList
                ?.render(
                    container,
                    days,
                    {
                        name:
                            "tdNgay",

                        selectAll:
                            true,

                        selectAllLabel:
                            "Chọn tất cả ngày",

                        getValue:
                            item =>
                                item.value,

                        getTitle:
                            item =>
                                `${item.weekday} - ${item.label}`,

                        isChecked:
                            item =>
                                selectedDateSet.has(
                                    item.value
                                )
                    }
                );

        }

        function refreshGroupOptions(
            root,
            selectedGroups = []
        ) {

            const container =
                root.querySelector(
                    "[data-group-checkbox-list]"
                );


            if (!container) {
                return;
            }


            const selectedIds =
                new Set(
                    selectedGroups.map(
                        group =>
                            String(
                                group.nhomMonAnId ??
                                group.nhomMonAn?.id
                            )
                    )
                );


            const list =
                root._tdOptions
                    ?.nhomMonAn ||
                [];


            window.MCS
                ?.checkboxList
                ?.render(
                    container,
                    list,
                    {
                        name:
                            "tdNhomMonAnId",

                        selectAll:
                            true,

                        selectAllLabel:
                            "Chọn tất cả nhóm món",

                        getValue:
                            item =>
                                item.id,

                        getTitle:
                            item =>
                                `${item.maNhomMonAn || "-"} - ${item.tenNhomMonAn || "-"}`,

                        isChecked:
                            item =>
                                selectedIds.has(
                                    String(
                                        item.id
                                    )
                                )
                    }
                );

        }

        function refreshFoodOptions(
            root,
            nhomMonAnId,
            selectedFoods = []
        ) {

            const container =
                root.querySelector(
                    "[data-food-checkbox-list]"
                );


            if (!container) {
                return;
            }


            const groupId =
                Number(
                    nhomMonAnId
                );


            const selectedIds =
                new Set(
                    selectedFoods.map(
                        food =>
                            String(
                                food.monAnId ??
                                food.monAn?.id
                            )
                    )
                );


            const list =
                (
                    root._tdOptions
                        ?.monAn ||
                    []
                )
                    .filter(
                        item => {

                            const itemGroupId =
                                Number(
                                    item.nhomMonAnId ??
                                    item.nhomMonAn?.id
                                );


                            return (
                                itemGroupId ===
                                groupId
                            );

                        }
                    );


            window.MCS
                ?.checkboxList
                ?.render(
                    container,
                    list,
                    {
                        name:
                            "tdMonAnId",

                        selectAll:
                            true,

                        selectAllLabel:
                            "Chọn tất cả món ăn",

                        getValue:
                            item =>
                                item.id,

                        getTitle:
                            item =>
                                `${item.maMonAn || "-"} - ${item.tenMonAn || "-"}`,

                        getDescription:
                            item =>
                                formatMoney(
                                    item.giaTien
                                ),

                        isChecked:
                            item =>
                                selectedIds.has(
                                    String(
                                        item.id
                                    )
                                )
                    }
                );

        }

        function buildDateRange(
            from,
            to
        ) {

            const result =
                [];


            const [
                fromYear,
                fromMonth,
                fromDay
            ] =
                from
                    .split("-")
                    .map(Number);


            const [
                toYear,
                toMonth,
                toDay
            ] =
                to
                    .split("-")
                    .map(Number);


            const current =
                new Date(
                    fromYear,
                    fromMonth - 1,
                    fromDay
                );


            const end =
                new Date(
                    toYear,
                    toMonth - 1,
                    toDay
                );


            while (
                current <=
                end
            ) {

                const year =
                    current.getFullYear();


                const month =
                    String(
                        current.getMonth() + 1
                    )
                        .padStart(
                            2,
                            "0"
                        );


                const day =
                    String(
                        current.getDate()
                    )
                        .padStart(
                            2,
                            "0"
                        );


                const value =
                    `${year}-${month}-${day}`;


                result.push({

                    value,

                    label:
                        `${day}/${month}/${year}`,

                    weekday:
                        [
                            "Chủ nhật",
                            "Thứ hai",
                            "Thứ ba",
                            "Thứ tư",
                            "Thứ năm",
                            "Thứ sáu",
                            "Thứ bảy"
                        ][
                            current.getDay()
                        ]

                });


                current.setDate(
                    current.getDate() + 1
                );

            }

            return result;

        }

        function formatMoney(
            value
        ) {

            const number =
                Number(
                    value
                );


            if (
                !Number.isFinite(
                    number
                )
            ) {

                return "Chưa có giá";

            }


            return (
                number.toLocaleString(
                    "vi-VN"
                ) +
                " đ"
            );

        }

        async function getEnums() {

            const token =
                localStorage.getItem(
                    "accessToken"
                );


            const response =
                await fetch(
                    "/api/mcs/v1/enums",
                    {
                        method:
                            "GET",

                        headers: {

                            Accept:
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        credentials:
                            "include"

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result?.message ||
                    "Không thể tải enums."
                );

            }


            return (
                result?.data ||
                result ||
                {}
            );

        }

        async function getList(
            url
        ) {

            const token =
                localStorage.getItem(
                    "accessToken"
                );


            const response =
                await fetch(
                    url,
                    {
                        headers: {

                            Accept:
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        credentials:
                            "include"

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result?.message ||
                    "Không thể tải danh mục."
                );

            }


            const data =
                result?.data ??
                result;


            const list =
                Array.isArray(
                    data
                )
                    ? data
                    : (
                        data?.items ||
                        data?.rows ||
                        data?.danhSach ||
                        []
                    );


            return list.filter(
                item =>
                    item?.active !==
                    false
            );

        }

        function fill(
            select,
            list,
            valueKey,
            labelKey,
            selected = null
        ) {

            if (!select) {
                return;
            }


            const normalizedSelected =
                selected === null ||
                selected === undefined ||
                selected === ""
                    ? ""
                    : String(
                        selected
                    );


            select.innerHTML =
                "";

            const emptyOption =
                document.createElement(
                    "option"
                );


            emptyOption.value =
                "";

            emptyOption.textContent =
                "";


            select.appendChild(
                emptyOption
            );


            (
                Array.isArray(
                    list
                )
                    ? list
                    : []
            ).forEach(
                item => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        String(
                            item[valueKey]
                        );


                    option.textContent =
                        item[labelKey] ||
                        item.ten ||
                        "-";


                    option.selected =
                        String(
                            item[valueKey]
                        ) ===
                        normalizedSelected;


                    select.appendChild(
                        option
                    );

                }
            );


            select.value =
                normalizedSelected;


            if (
                !normalizedSelected
            ) {

                select.selectedIndex =
                    0;

            }


            const wrapper =
                select.closest(
                    "[data-smart-select]"
                );


            if (!wrapper) {
                return;
            }


            const api =
                wrapper.smartSelect ||
                window.MCS
                    ?.smartSelect
                    ?.initialize(
                        wrapper
                    );


            api?.refresh?.();


            api?.setValue?.(
                normalizedSelected,
                false
            );

        }

        function fillEnum(
            select,
            list,
            selected = null
        ) {

            if (!select) {
                return;
            }


            const normalizedSelected =
                selected === null ||
                selected === undefined ||
                selected === ""
                    ? ""
                    : String(
                        selected
                    );


            select.innerHTML =
                "";

            const emptyOption =
                document.createElement(
                    "option"
                );


            emptyOption.value =
                "";

            emptyOption.textContent =
                "";


            select.appendChild(
                emptyOption
            );


            (
                Array.isArray(
                    list
                )
                    ? list
                    : []
            ).forEach(
                item => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        String(
                            item.value
                        );


                    option.textContent =
                        item.label ||
                        item.name ||
                        "-";


                    option.selected =
                        String(
                            item.value
                        ) ===
                        normalizedSelected;


                    select.appendChild(
                        option
                    );

                }
            );


            select.value =
                normalizedSelected;


            if (
                !normalizedSelected
            ) {

                select.selectedIndex =
                    0;

            }


            const wrapper =
                select.closest(
                    "[data-smart-select]"
                );


            if (!wrapper) {
                return;
            }


            const api =
                wrapper.smartSelect ||
                window.MCS
                    ?.smartSelect
                    ?.initialize(
                        wrapper
                    );


            api?.refresh?.();


            api?.setValue?.(
                normalizedSelected,
                false
            );

        }

        function disable(
            select,
            disabled
        ) {

            if (!select) {
                return;
            }


            select.disabled =
                !!disabled;


            const wrapper =
                select.closest(
                    "[data-smart-select]"
                );


            wrapper
                ?.smartSelect
                ?.setDisabled
                ?.(
                    !!disabled
                );

        }

        return {

            init,

            fill,

            refreshNhaAn,

            refreshDayOptions,

            refreshGroupOptions,

            refreshFoodOptions

        };

    })();