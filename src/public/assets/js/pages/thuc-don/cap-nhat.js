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
            )}T00:00:00`;

    }


    if (
        payload.denNgay
    ) {

        payload.denNgay =
            `${normalizeDate(
                payload.denNgay
            )}T23:59:59`;

    }


    return payload;

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


    /*
     * 10 = theo ngày
     */
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


    /*
     * 20 = theo tuần
     */
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


    /*
     * 30 = theo tháng.
     * Từ ngày phải là ngày đầu tháng,
     * đến ngày phải là ngày cuối tháng.
     */
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


    /*
     * 40 = theo thời gian:
     * chỉ cần denNgay >= tuNgay.
     */


    return {
        valid:
            true
    };

}


function bindDateBusinessRules(
    root
) {

    const loai =
        root.querySelector(
            '[name="loaiThucDon"]'
        );


    const tuNgay =
        root.querySelector(
            '[name="tuNgay"][data-date-value]'
        );


    if (
        !loai ||
        !tuNgay
    ) {
        return;
    }


    const apply =
        () => {

            const type =
                Number(
                    loai.value
                );


            const from =
                normalizeDate(
                    tuNgay.value
                );


            if (!from) {
                return;
            }


            switch (
                type
            ) {

                /*
                 * Theo ngày.
                 */
                case 10:

                    setDateValue(
                        root,
                        "denNgay",
                        from
                    );

                    break;


                /*
                 * Theo tuần = 7 ngày.
                 */
                case 20:

                    setDateValue(
                        root,
                        "denNgay",
                        addDays(
                            from,
                            6
                        )
                    );

                    break;


                /*
                 * Theo tháng.
                 */
                case 30:

                    setDateValue(
                        root,
                        "tuNgay",
                        firstDayOfMonth(
                            from
                        )
                    );


                    setDateValue(
                        root,
                        "denNgay",
                        lastDayOfMonth(
                            from
                        )
                    );

                    break;


                /*
                 * Theo thời gian:
                 * user tự chọn.
                 */
                case 40:

                    break;

            }

        };


    loai.addEventListener(
        "change",
        apply
    );


    tuNgay.addEventListener(
        "change",
        apply
    );

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
        data?.tuNgay
    );


    setDateValue(
        root,
        "denNgay",
        data?.denNgay
    );

}


function setDateValue(
    root,
    name,
    value
) {

    const hidden =
        root.querySelector(
            `[name="${name}"][data-date-value]`
        );


    if (!hidden) {
        return;
    }


    const field =
        hidden.closest(
            "[data-date-picker]"
        );


    const display =
        field?.querySelector(
            "[data-date-input]"
        );


    const normalized =
        normalizeDate(
            value
        );


    hidden.value =
        normalized;


    if (display) {

        display.value =
            normalized
                ? formatDateVi(
                    normalized
                )
                : "";

    }


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


function normalizeDate(
    value
) {

    if (!value) {
        return "";
    }


    const match =
        String(
            value
        ).match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (!match) {
        return "";
    }


    return `${match[1]}-${match[2]}-${match[3]}`;

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