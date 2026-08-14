"use strict";

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const root =
            document.querySelector(
                '[data-thuc-don-editor][data-form-mode="update"]'
            );


        if (!root) {
            return;
        }


        const thucDonId =
            root.dataset.thucDonId;


        if (!thucDonId) {

            showGeneralError(
                root,
                "Không tìm thấy ID thực đơn."
            );

            return;

        }


        const editor =
            window.ThucDonEditor?.init(
                root,
                {

                    mode:
                        "update",

                    id:
                        thucDonId,


                    onSave:
                        async data => {

                            await submit(
                                root,
                                editor,
                                thucDonId,
                                data,
                                10
                            );

                        },


                    onSaveApprove:
                        async data => {

                            await submit(
                                root,
                                editor,
                                thucDonId,
                                data,
                                30
                            );

                        }

                }
            );


        if (!editor) {
            return;
        }


        try {

            setLoading(
                root,
                true
            );


            const data =
                await loadThucDon(
                    thucDonId
                );


            await window
                .ThucDonFormOptions
                ?.init(
                    root,
                    data
                );


            await editor.setData(
                data
            );


            syncDateFields(
                root,
                data
            );


            bindDateBusinessRules(
                root
            );

            bindFieldErrorClear(
                root
            );


            window
                .ThucDonFormImage
                ?.init(
                    root
                );


            window
                .ThucDonContentEditor
                ?.init(
                    root,
                    editor
                );


        } catch (
            error
        ) {

            console.error(
                error
            );


            showGeneralError(
                root,
                error.message ||
                "Không thể tải thông tin thực đơn."
            );


        } finally {

            setLoading(
                root,
                false
            );

        }

    }
);

async function submit(
    root,
    editor,
    id,
    data,
    trangThai
) {

    clearAllFieldErrors(
        root
    );


    const payload =
        preparePayload(
            data,
            trangThai
        );

        if (
            Number(
                payload.loaiThucDon
            ) ===
            30
        ) {

            const year =
                root.querySelector(
                    '[name="thangApDungNam"]'
                )?.value;


            const month =
                root.querySelector(
                    '[name="thangApDungThang"]'
                )?.value;


            if (
                !year ||
                !month
            ) {

                showMonthError(
                    root,
                    "Vui lòng chọn năm và tháng áp dụng."
                );

                return;

            }

        }

    const validation =
        validatePayload(
            payload
        );


    if (!validation.valid) {

        showFieldError(
            root,
            validation.field,
            validation.message
        );

        return;

    }


    try {

        setLoading(
            root,
            true
        );


        const result =
            await updateThucDon(
                id,
                payload
            );


        const saved =
            result?.data ||
            result;


        editor.replaceInitialData?.(
            saved?.id
                ? saved
                : payload
        );


        window.MCS
            ?.toast
            ?.success(
                trangThai === 30
                    ? "Lưu và duyệt thực đơn thành công."
                    : "Lưu thực đơn thành công."
            );


        window.location.href =
            `/thuc-don/thong-tin-chi-tiet-thuc-don/${id}`;


    } catch (
        error
    ) {

        console.error(
            "[UPDATE THUC DON]",
            error
        );


        window.MCS
            ?.toast
            ?.error(
                error.message ||
                "Cập nhật thực đơn thất bại."
            );

    } finally {

        setLoading(
            root,
            false
        );

    }

}

function bindFieldErrorClear(
    root
) {

    root.addEventListener(
        "input",
        event => {

            const field =
                event.target?.name;


            if (!field) {
                return;
            }


            clearFieldError(
                root,
                field
            );

        }
    );


    root.addEventListener(
        "change",
        event => {

            const field =
                event.target?.name;


            if (!field) {
                return;
            }


            clearFieldError(
                root,
                field
            );

        }
    );

}

function preparePayload(
    data,
    trangThai
) {

    const payload =
        JSON.parse(
            JSON.stringify(
                data ||
                {}
            )
        );


    payload.trangThai =
        trangThai;

    delete payload.thangApDungNam;
    delete payload.thangApDungThang;

    payload.loaiThucDon =
        toNumber(
            payload.loaiThucDon
        );


    payload.coSoId =
        toNumber(
            payload.coSoId
        );


    payload.nhaAnId =
        toNumber(
            payload.nhaAnId
        );


    payload.caAnId =
        toNumber(
            payload.caAnId
        );


    if (
        payload.tuNgay
    ) {

        payload.tuNgay =
            `${normalizeDate(
                payload.tuNgay
            )}T00:00:00+07:00`;

    }


    if (
        payload.denNgay
    ) {

        payload.denNgay =
            `${normalizeDate(
                payload.denNgay
            )}T23:59:59+07:00`;

    }

    payload.dsNgay =
        prepareDays(
            payload.dsNgay ||
            payload.danhSachNgay ||
            []
        );
        
    return payload;

}

function prepareDays(
    days
) {

    if (
        !Array.isArray(
            days
        )
    ) {
        return [];
    }


    return days.map(
        (
            day,
            dayIndex
        ) => {

            const ngay =
                normalizeDate(
                    day.ngay ||
                    day.ngayApDung
                );


            return {

                ...getPersistedId(
                    day.id
                ),

                ngay:
                    ngay
                        ? `${ngay}T00:00:00+07:00`
                        : null,

                ghiChu:
                    day.ghiChu ||
                    null,

                thuTuHienThi:
                    day.thuTuHienThi ??
                    dayIndex + 1,

                dsNhomMonAn:
                    prepareGroups(
                        day.dsNhomMonAn ||
                        day.danhSachNhomMonAn ||
                        []
                    )

            };

        }
    );

}

function prepareGroups(
    groups
) {

    if (
        !Array.isArray(
            groups
        )
    ) {
        return [];
    }


    return groups.map(
        (
            group,
            groupIndex
        ) => {

            return {

                ...getPersistedId(
                    group.id
                ),

                nhomMonAnId:
                    toNumber(
                        group.nhomMonAnId ??
                        group.nhomMonAn?.id
                    ),

                thuTuHienThi:
                    group.thuTuHienThi ??
                    groupIndex + 1,

                ghiChu:
                    group.ghiChu ||
                    null,

                dsMonAn:
                    prepareFoods(
                        group.dsMonAn ||
                        group.danhSachMonAn ||
                        []
                    )

            };

        }
    );

}

function prepareFoods(
    foods
) {

    if (
        !Array.isArray(
            foods
        )
    ) {
        return [];
    }


    return foods.map(
        (
            food,
            foodIndex
        ) => {

            return {

                ...getPersistedId(
                    food.id
                ),

                monAnId:
                    toNumber(
                        food.monAnId ??
                        food.monAn?.id
                    ),

                thuTuHienThi:
                    food.thuTuHienThi ??
                    foodIndex + 1,

                dinhLuong:
                    food.dinhLuong ??
                    null,

                donViTinhId:
                    toNumber(
                        food.donViTinhId ??
                        food.donViTinh?.id
                    ),

                ghiChu:
                    food.ghiChu ||
                    null

            };

        }
    );

}

function getPersistedId(
    id
) {

    if (
        id === null ||
        id === undefined ||
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
            toNumber(
                id
            )
    };

}

function validatePayload(
    data
) {

    if (
        !String(
            data.maThucDon ||
            ""
        ).trim()
    ) {

        return invalid(
            "maThucDon",
            "Mã thực đơn không được để trống."
        );

    }


    if (
        !String(
            data.tenThucDon ||
            ""
        ).trim()
    ) {

        return invalid(
            "tenThucDon",
            "Tên thực đơn không được để trống."
        );

    }


    if (
        !data.loaiThucDon
    ) {

        return invalid(
            "loaiThucDon",
            "Vui lòng chọn loại thực đơn."
        );

    }


    const tuNgay =
        dateOnly(
            data.tuNgay
        );


    const denNgay =
        dateOnly(
            data.denNgay
        );


    if (!tuNgay) {

        return invalid(
            "tuNgay",
            "Vui lòng chọn từ ngày."
        );

    }


    if (!denNgay) {

        return invalid(
            "denNgay",
            "Vui lòng chọn đến ngày."
        );

    }


    if (
        denNgay <
        tuNgay
    ) {

        return invalid(
            "denNgay",
            "Đến ngày phải lớn hơn hoặc bằng từ ngày."
        );

    }

    if (
        Number(
            data.loaiThucDon
        ) ===
        10 &&
        tuNgay !==
        denNgay
    ) {

        return invalid(
            "denNgay",
            "Thực đơn theo ngày chỉ được áp dụng trong một ngày."
        );

    }

    if (
        Number(
            data.loaiThucDon
        ) ===
        20
    ) {

        const expected =
            addDays(
                tuNgay,
                6
            );


        if (
            expected !==
            denNgay
        ) {

            return invalid(
                "denNgay",
                "Thực đơn theo tuần phải có đúng 7 ngày."
            );

        }

    }


    if (
        Number(
            data.loaiThucDon
        ) ===
        30
    ) {

        const first =
            firstDayOfMonth(
                tuNgay
            );


        const last =
            lastDayOfMonth(
                tuNgay
            );


        if (
            tuNgay !==
            first ||
            denNgay !==
            last
        ) {

            return invalid(
                "denNgay",
                "Thực đơn theo tháng phải bắt đầu từ ngày đầu tháng và kết thúc vào ngày cuối tháng."
            );

        }

    }

    return {
        valid:
            true
    };

}

function bindDateBusinessRules(
    root
) {

    const typeSelect =
        root.querySelector(
            '[name="loaiThucDon"]'
        );


    const fromInput =
        root.querySelector(
            '[name="tuNgay"][data-date-value]'
        );


    const toInput =
        root.querySelector(
            '[name="denNgay"][data-date-value]'
        );


    const fromField =
        root.querySelector(
            "[data-menu-from-date]"
        );


    const toField =
        root.querySelector(
            "[data-menu-to-date]"
        );

    const monthFields =
        root.querySelectorAll(
            "[data-menu-month-field]"
        );


    if (
        !typeSelect ||
        !fromInput ||
        !toInput
    ) {
        return;
    }

    let syncing =
        false;


    const syncFromDate =
        () => {

            if (syncing) {
                return;
            }


            const type =
                Number(
                    typeSelect.value
                );


            const from =
                normalizeDate(
                    fromInput.value
                );


            if (!from) {
                return;
            }


            syncing =
                true;


            try {

                if (
                    type ===
                    10
                ) {

                    setDateValue(
                        root,
                        "denNgay",
                        from
                    );

                }

                if (
                    type ===
                    20
                ) {

                    setDateValue(
                        root,
                        "denNgay",
                        addDays(
                            from,
                            6
                        )
                    );

                }

            } finally {

                syncing =
                    false;

            }

        };


    const syncToDate =
        () => {

            if (syncing) {
                return;
            }


            const type =
                Number(
                    typeSelect.value
                );


            const to =
                normalizeDate(
                    toInput.value
                );


            if (!to) {
                return;
            }


            syncing =
                true;


            try {

                if (
                    type ===
                    10
                ) {

                    setDateValue(
                        root,
                        "tuNgay",
                        to
                    );

                }

                if (
                    type ===
                    20
                ) {

                    setDateValue(
                        root,
                        "tuNgay",
                        addDays(
                            to,
                            -6
                        )
                    );

                }

            } finally {

                syncing =
                    false;

            }

        };


    const changeType =
        () => {

            const type =
                Number(
                    typeSelect.value
                );


            clearFieldError(
                root,
                "tuNgay"
            );


            clearFieldError(
                root,
                "denNgay"
            );


            if (
                type ===
                30
            ) {

                if (fromField) {
                    fromField.hidden = true;
                }


                if (toField) {
                    toField.hidden = true;
                }

                monthFields.forEach(
                    field => {

                        field.hidden =
                            false;

                    }
                );

                initializeMonthPicker(
                    root
                );


                return;

            }

            if (fromField) {
                fromField.hidden = false;
            }


            if (toField) {
                toField.hidden = false;
            }

            monthFields.forEach(
                field => {

                    field.hidden =
                        true;

                }
            );

            syncFromDate();

        };


    fromInput.addEventListener(
        "change",
        syncFromDate
    );


    toInput.addEventListener(
        "change",
        syncToDate
    );


    typeSelect.addEventListener(
        "change",
        changeType
    );


    changeType();

}

function initializeMonthPicker(
    root
) {

    const yearSelect =
        root.querySelector(
            'select[name="thangApDungNam"]'
        );


    const monthSelect =
        root.querySelector(
            'select[name="thangApDungThang"]'
        );


    if (
        !yearSelect ||
        !monthSelect
    ) {
        return;
    }


    const current =
        new Date();


    const currentYear =
        current.getFullYear();


    const currentMonth =
        current.getMonth() +
        1;

    const from =
        normalizeDate(
            root.querySelector(
                '[name="tuNgay"]'
            )?.value
        );


    let selectedYear =
        null;


    let selectedMonth =
        null;


    if (from) {

        const [
            year,
            month
        ] =
            from
                .split(
                    "-"
                )
                .map(
                    Number
                );


        selectedYear =
            year;


        selectedMonth =
            month;

    }

    const startYear =
        selectedYear &&
        selectedYear <
        currentYear
            ? selectedYear
            : currentYear;


    const endYear =
        Math.max(
            currentYear + 5,
            selectedYear ||
            currentYear
        );


    const years =
        [];


    for (
        let year =
            startYear;

        year <=
        endYear;

        year +=
        1
    ) {

        years.push({

            value:
                String(
                    year
                ),

            label:
                String(
                    year
                )

        });

    }


    setSmartSelectOptions(
        yearSelect,
        years,
        selectedYear
    );


    renderMonthOptions(
        root,
        selectedYear,
        selectedMonth
    );

    if (
        yearSelect.dataset.monthRuleBound !==
        "true"
    ) {

        yearSelect.dataset.monthRuleBound =
            "true";


        yearSelect.addEventListener(
            "change",
            () => {

                renderMonthOptions(
                    root,
                    Number(
                        yearSelect.value
                    ),
                    null
                );


                clearMonthError(
                    root
                );

            }
        );

    }


    if (
        monthSelect.dataset.monthRuleBound !==
        "true"
    ) {

        monthSelect.dataset.monthRuleBound =
            "true";


        monthSelect.addEventListener(
            "change",
            () => {

                applySelectedMonth(
                    root
                );


                clearMonthError(
                    root
                );

            }
        );

    }

}

function renderMonthOptions(
    root,
    selectedYear,
    selectedMonth = null
) {

    const monthSelect =
        root.querySelector(
            'select[name="thangApDungThang"]'
        );


    if (!monthSelect) {
        return;
    }


    const current =
        new Date();


    const currentYear =
        current.getFullYear();


    const currentMonth =
        current.getMonth() +
        1;


    if (!selectedYear) {

        setSmartSelectOptions(
            monthSelect,
            [],
            null
        );


        setSmartSelectDisabled(
            monthSelect,
            true
        );


        return;

    }


    let startMonth =
        Number(
            selectedYear
        ) ===
        currentYear
            ? currentMonth
            : 1;

    if (
        Number(
            selectedYear
        ) ===
        currentYear &&
        selectedMonth &&
        Number(
            selectedMonth
        ) <
        startMonth
    ) {

        startMonth =
            Number(
                selectedMonth
            );

    }


    const months =
        [];


    for (
        let month =
            startMonth;

        month <=
        12;

        month +=
        1
    ) {

        months.push({

            value:
                String(
                    month
                ),

            label:
                `Tháng ${month}`

        });

    }


    setSmartSelectDisabled(
        monthSelect,
        false
    );


    setSmartSelectOptions(
        monthSelect,
        months,
        selectedMonth
    );

}

function setSmartSelectOptions(
    select,
    options,
    selectedValue = null
) {

    if (!select) {
        return;
    }


    const wrapper =
        select.closest(
            "[data-smart-select]"
        );


    const normalizedSelected =
        selectedValue ===
            null ||
        selectedValue ===
            undefined ||
        selectedValue ===
            ""
            ? ""
            : String(
                selectedValue
            );

    select.innerHTML =
        "";


    options.forEach(
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
                item.label;


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
            -1;

    }


    if (!wrapper) {
        return;
    }

    window.MCS
        ?.smartSelect
        ?.initialize(
            wrapper
        );


    if (
        typeof wrapper
            .smartSelect
            ?.setOptions ===
        "function"
    ) {

        wrapper
            .smartSelect
            .setOptions(
                options,
                false
            );

    }


    if (
        typeof wrapper
            .smartSelect
            ?.setValue ===
        "function"
    ) {

        wrapper
            .smartSelect
            .setValue(
                normalizedSelected,
                false
            );

    }

}

function setSmartSelectDisabled(
    select,
    disabled
) {

    if (!select) {
        return;
    }


    select.disabled =
        disabled;


    const wrapper =
        select.closest(
            "[data-smart-select]"
        );


    if (!wrapper) {
        return;
    }


    wrapper.classList.toggle(
        "is-disabled",
        disabled
    );


    const search =
        wrapper.querySelector(
            "[data-smart-select-search]"
        );


    const toggle =
        wrapper.querySelector(
            "[data-smart-select-toggle]"
        );


    if (search) {

        search.disabled =
            disabled;

    }


    if (toggle) {

        toggle.disabled =
            disabled;

    }

}

function applySelectedMonth(
    root
) {

    const year =
        Number(
            root.querySelector(
                '[name="thangApDungNam"]'
            )?.value
        );


    const month =
        Number(
            root.querySelector(
                '[name="thangApDungThang"]'
            )?.value
        );


    if (
        !year ||
        !month
    ) {
        return;
    }


    const monthText =
        String(
            month
        ).padStart(
            2,
            "0"
        );


    const from =
        `${year}-${monthText}-01`;


    const last =
        new Date(
            year,
            month,
            0
        );


    const to =
        toIsoDate(
            last
        );

    setDateValue(
        root,
        "tuNgay",
        from,
        false
    );


    setDateValue(
        root,
        "denNgay",
        to,
        false
    );

}

function showMonthError(
    root,
    message
) {

    const field =
        root.querySelector(
            "[data-menu-month-field]"
        );


    const error =
        root.querySelector(
            "[data-month-error]"
        );


    field?.classList.add(
        "has-error"
    );


    if (error) {

        error.textContent =
            message;

        error.hidden =
            false;

    }

}

function clearMonthError(
    root
) {

    const field =
        root.querySelector(
            "[data-menu-month-field]"
        );


    const error =
        root.querySelector(
            "[data-month-error]"
        );


    field?.classList.remove(
        "has-error"
    );


    if (error) {

        error.textContent =
            "";

        error.hidden =
            true;

    }

}

async function updateThucDon(
    id,
    payload
) {

    const accessToken =
        localStorage.getItem(
            "accessToken"
        );


    if (!accessToken) {

        throw new Error(
            "Không tìm thấy access token."
        );

    }


    const response =
        await fetch(
            `/api/mcs/v1/thuc-don/cap-nhat/${encodeURIComponent(
                id
            )}`,
            {

                method:
                    "PATCH",

                headers: {

                    Accept:
                        "application/json",

                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${accessToken}`

                },

                credentials:
                    "include",

                body:
                    JSON.stringify(
                        payload
                    )

            }
        );


    let result;


    try {

        result =
            await response.json();

    } catch {

        throw new Error(
            "Dữ liệu API trả về không hợp lệ."
        );

    }


    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Không thể cập nhật thực đơn."
        );

    }


    return result;

}

async function loadThucDon(
    id
) {

    const accessToken =
        localStorage.getItem(
            "accessToken"
        );


    if (!accessToken) {

        throw new Error(
            "Không tìm thấy access token."
        );

    }


    const response =
        await fetch(
            `/api/mcs/v1/thuc-don/${encodeURIComponent(
                id
            )}`,
            {

                headers: {

                    Accept:
                        "application/json",

                    Authorization:
                        `Bearer ${accessToken}`

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
            "Không thể tải thực đơn."
        );

    }


    let data =
        result?.data ??
        result;


    if (
        data?.data &&
        !data.maThucDon
    ) {

        data =
            data.data;

    }


    return data;

}

function showFieldError(
    root,
    field,
    message
) {

    if (
        !root ||
        !field
    ) {
        return;
    }


    const input =
        root.querySelector(
            `[name="${field}"]`
        );


    const formField =
        input?.closest(
            "[data-form-field]"
        ) ||
        input?.closest(
            ".form-field"
        );


    const error =
        root.querySelector(
            `[data-field-error="${field}"]`
        );


    formField?.classList.add(
        "has-error"
    );


    if (error) {

        error.textContent =
            message;

        error.hidden =
            false;

    }


    const focusTarget =
        (
            field === "tuNgay" ||
            field === "denNgay"
        )
            ? formField?.querySelector(
                "[data-date-input]"
            )
            : formField?.querySelector(
                "[data-smart-select-search]"
            ) ||
            input;


    focusTarget?.focus?.();

}

function clearFieldError(
    root,
    field
) {

    const input =
        root.querySelector(
            `[name="${field}"]`
        );


    const formField =
        input?.closest(
            "[data-form-field]"
        ) ||
        input?.closest(
            ".form-field"
        );


    formField?.classList.remove(
        "has-error"
    );


    const error =
        root.querySelector(
            `[data-field-error="${field}"]`
        );


    if (error) {

        error.textContent =
            "";

        error.hidden =
            true;

    }

}

function clearAllFieldErrors(
    root
) {

    root.querySelectorAll(
        "[data-field-error]"
    )
        .forEach(
            error => {

                error.textContent =
                    "";

                error.hidden =
                    true;

            }
        );


    root.querySelectorAll(
        ".form-field.has-error"
    )
        .forEach(
            field => {

                field.classList.remove(
                    "has-error"
                );

            }
        );

}

function syncDateFields(
    root,
    data
) {

    setDateValue(
        root,
        "tuNgay",
        data?.tuNgay,
        false
    );


    setDateValue(
        root,
        "denNgay",
        data?.denNgay,
        false
    );

}

function setDateValue(
    root,
    name,
    value,
    dispatchChange = true
) {

    const hidden =
        root.querySelector(
            `[name="${name}"][data-date-value]`
        );


    if (!hidden) {
        return;
    }


    const fieldContainer =
        hidden.closest(
            "[data-form-field]"
        );


    const datePicker =
        hidden.closest(
            "[data-date-picker]"
        );


    const display =
        datePicker?.querySelector(
            "[data-date-input]"
        );


    const normalized =
        normalizeDate(
            value
        );

    hidden.value =
        normalized || "";

    if (display) {

        display.value =
            normalized
                ? formatDateVi(
                    normalized
                )
                : "";

    }

    const datePickerApi =
        fieldContainer?.datePicker ||
        datePicker?.datePicker;


    if (
        datePickerApi &&
        typeof datePickerApi.setValue ===
        "function"
    ) {

        datePickerApi.setValue(
            normalized,
            false
        );

    }

    if (dispatchChange) {

        hidden.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles:
                        true
                }
            )
        );

    }

}

function normalizeDate(
    value
) {

    if (!value) {
        return "";
    }


    const text =
        String(
            value
        ).trim();

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            text
        )
    ) {

        return text;

    }

    const date =
        new Date(
            text
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        const match =
            text.match(
                /^(\d{4})-(\d{2})-(\d{2})/
            );


        return match
            ? `${match[1]}-${match[2]}-${match[3]}`
            : "";

    }


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
                date
            );


    const map = {};


    parts.forEach(
        part => {

            map[
                part.type
            ] =
                part.value;

        }
    );


    return (
        `${map.year}-` +
        `${map.month}-` +
        `${map.day}`
    );

}

function dateOnly(
    value
) {

    return normalizeDate(
        value
    );

}

function formatDateVi(
    value
) {

    if (!value) {
        return "";
    }


    const [
        year,
        month,
        day
    ] =
        value.split(
            "-"
        );


    return `${day}/${month}/${year}`;

}

function addDays(
    value,
    count
) {

    const date =
        createLocalDate(
            value
        );


    date.setDate(
        date.getDate() +
        count
    );


    return toIsoDate(
        date
    );

}

function firstDayOfMonth(
    value
) {

    const date =
        createLocalDate(
            value
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
        "01"
    ].join(
        "-"
    );

}

function lastDayOfMonth(
    value
) {

    const date =
        createLocalDate(
            value
        );


    const last =
        new Date(
            date.getFullYear(),
            date.getMonth() +
            1,
            0
        );


    return toIsoDate(
        last
    );

}

function createLocalDate(
    value
) {

    const [
        year,
        month,
        day
    ] =
        normalizeDate(
            value
        )
            .split(
                "-"
            )
            .map(
                Number
            );


    return new Date(
        year,
        month - 1,
        day
    );

}

function toIsoDate(
    date
) {

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

function toNumber(
    value
) {

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

function invalid(
    field,
    message
) {

    return {
        valid:
            false,

        field,

        message
    };

}

function setLoading(
    root,
    loading
) {

    root.classList.toggle(
        "is-loading",
        loading
    );

}