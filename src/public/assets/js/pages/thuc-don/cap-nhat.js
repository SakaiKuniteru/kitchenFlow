"use strict";

document.addEventListener(
    "DOMContentLoaded",
    async () => {

    const editorRoot =
        document.querySelector(
            '[data-thuc-don-editor][data-form-mode="update"]'
        );


    const formRoot =
        document.querySelector(
            '[data-thuc-don-form][data-form-mode="update"]'
        );


    const root =
        editorRoot ||
        formRoot?.closest(
            "[data-thuc-don-editor]"
        );


    if (!root) {

        console.error(
            "[CAP NHAT] Không tìm thấy root editor.",
            {
                editorRoot,
                formRoot
            }
        );

        return;

    }

        const thucDonId =
            root.dataset.thucDonId;


        if (!thucDonId) {

            console.error(
                "Không tìm thấy ID thực đơn."
            );

            return;

        }

        console.log(
            "[CAP NHAT] ID:",
            thucDonId
        );


        if (!window.ThucDonEditor) {

            console.error(
                "ThucDonEditor chưa được load."
            );

            return;

        }

        const editor =
            window.ThucDonEditor.init(
                root,
                {

                    mode:
                        "update",

                    id:
                        thucDonId,


                    onSave:
                        async data => {

                            console.log(
                                "SAVE UPDATE",
                                data
                            );

                        },


                    onSaveApprove:
                        async data => {

                            console.log(
                                "SAVE + APPROVE UPDATE",
                                data
                            );

                        }

                }
            );


        if (!editor) {

            console.error(
                "Không khởi tạo được ThucDonEditor."
            );

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


            console.log(
                "[CAP NHAT] DATA API:",
                data
            );


            if (!data) {

                throw new Error(
                    "API không trả về dữ liệu thực đơn."
                );

            }

            if (
                window.ThucDonFormOptions
            ) {

                await window
                    .ThucDonFormOptions
                    .init(
                        root,
                        data
                    );

            }

            await editor.setData(
                data
            );

            syncDateFields(
                root,
                data
            );

            window
                .ThucDonFormImage
                ?.init(
                    root
                );


            console.log(
                "[CAP NHAT] Khởi tạo hoàn tất."
            );


        } catch (error) {

            console.error(
                "[CAP NHAT ERROR]",
                error
            );


            window
                .MCS
                ?.toast
                ?.error(
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

                method:
                    "GET",

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


    let result;


    try {

        result =
            await response.json();

    } catch {

        throw new Error(
            "Dữ liệu API trả về không hợp lệ."
        );

    }


    console.log(
        "[CAP NHAT] RAW RESPONSE:",
        result
    );


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
        data &&
        data.data &&
        !data.maThucDon
    ) {

        data =
            data.data;

    }


    return data;

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
        normalized || "";


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


    const text =
        String(
            value
        );


    const match =
        text.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (!match) {
        return "";
    }


    return (
        `${match[1]}-${match[2]}-${match[3]}`
    );

}

function formatDateVi(
    value
) {

    const [
        year,
        month,
        day
    ] =
        value.split(
            "-"
        );


    return (
        `${day}/${month}/${year}`
    );

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