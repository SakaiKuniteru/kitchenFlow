"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const root =
            document.querySelector(
                "[data-thuc-don-detail]"
            );


        if (!root) {
            return;
        }


        const formRoot =
            root.querySelector(
                "[data-thuc-don-form]"
            );


        if (!formRoot) {

            console.error(
                "Không tìm thấy form thực đơn."
            );

            return;
        }


        if (
            !window.ThucDonForm
        ) {

            console.error(
                "ThucDonForm chưa được khởi tạo."
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


        const form =
            window.ThucDonForm.init(
                formRoot
            );


        try {

            setLoading(
                root,
                true
            );

        const data =
            await loadChiTietThucDon(
                thucDonId
            );


        form.setData(
            data
        );


        renderActions(
            root,
            data
        );

        initDetailActions(
            root,
            form,
            thucDonId
        );


        } catch (error) {

            console.error(
                error
            );


            showError(
                root,
                error.message
            );


        } finally {

            setLoading(
                root,
                false
            );

        }

    }
);

function initDetailActions(
    root,
    form,
    thucDonId
) {

    const approveButton =
        root.querySelector(
            "[data-detail-approve]"
        );


    const unapproveButton =
        root.querySelector(
            "[data-detail-unapprove]"
        );


    const cancelButton =
        root.querySelector(
            "[data-detail-cancel]"
        );


    const restoreButton =
        root.querySelector(
            "[data-detail-restore]"
        );


    approveButton?.addEventListener(
        "click",
        () => {

            handleApprove(
                root,
                form,
                thucDonId,
                approveButton
            );

        }
    );


    unapproveButton?.addEventListener(
        "click",
        () => {

            handleUnapprove(
                root,
                form,
                thucDonId,
                unapproveButton
            );

        }
    );


    cancelButton?.addEventListener(
        "click",
        () => {

            handleCancel(
                root,
                form,
                thucDonId,
                cancelButton
            );

        }
    );


    restoreButton?.addEventListener(
        "click",
        () => {

            handleRestore(
                root,
                form,
                thucDonId,
                restoreButton
            );

        }
    );

}

function handleApprove(
    root,
    form,
    thucDonId,
    button
) {

    if (
        button.dataset.loading ===
        "true"
    ) {
        return;
    }


    const executeApprove =
        async () => {

            try {

                setActionLoading(
                    button,
                    true,
                    "Đang duyệt..."
                );


                const response =
                    await approveThucDon(
                        thucDonId
                    );


                const data =
                    await loadChiTietThucDon(
                        thucDonId
                    );


                form.setData(
                    data
                );


                renderActions(
                    root,
                    data
                );


                window.MCS?.toast?.success(
                    response?.message ||
                    "Duyệt thực đơn thành công."
                );


            } catch (error) {

                console.error(
                    error
                );


                window.MCS?.toast?.error(
                    error?.message ||
                    "Duyệt thực đơn thất bại."
                );


            } finally {

                setActionLoading(
                    button,
                    false
                );

            }

        };


    if (
        window.MCS
            ?.confirm
            ?.show
    ) {

        window.MCS.confirm.show({

            title:
                "Xác nhận duyệt thực đơn",

            message:
                "Bạn có chắc chắn muốn duyệt thực đơn này?",

            confirmLabel:
                "Duyệt",

            type:
                "success",

            onConfirm:
                executeApprove

        });


        return;

    }


    executeApprove();

}

function handleCancel(
    root,
    form,
    thucDonId,
    button
) {

    if (
        button.dataset.loading ===
        "true"
    ) {
        return;
    }


    const executeCancel =
        async () => {

            try {

                setActionLoading(
                    button,
                    true,
                    "Đang hủy..."
                );


                const response =
                    await cancelThucDon(
                        thucDonId
                    );


                const data =
                    await loadChiTietThucDon(
                        thucDonId
                    );


                form.setData(
                    data
                );


                renderActions(
                    root,
                    data
                );


                window.MCS?.toast?.success(
                    response?.message ||
                    "Hủy thực đơn thành công."
                );


            } catch (error) {

                console.error(
                    error
                );


                window.MCS?.toast?.error(
                    error?.message ||
                    "Hủy thực đơn thất bại."
                );


            } finally {

                setActionLoading(
                    button,
                    false
                );

            }

        };


    if (
        window.MCS
            ?.confirm
            ?.show
    ) {

        window.MCS.confirm.show({

            title:
                "Xác nhận hủy thực đơn",

            message:
                "Bạn có chắc chắn muốn hủy thực đơn này?",

            confirmLabel:
                "Hủy thực đơn",

            type:
                "danger",

            onConfirm:
                executeCancel

        });


        return;

    }


    executeCancel();

}

function handleUnapprove(
    root,
    form,
    thucDonId,
    button
) {

    if (
        button.dataset.loading ===
        "true"
    ) {
        return;
    }


    const executeUnapprove =
        async () => {

            try {

                setActionLoading(
                    button,
                    true,
                    "Đang hủy duyệt..."
                );


                const response =
                    await unapproveThucDon(
                        thucDonId
                    );


                const data =
                    await loadChiTietThucDon(
                        thucDonId
                    );


                form.setData(
                    data
                );


                renderActions(
                    root,
                    data
                );


                window.MCS?.toast?.success(
                    response?.message ||
                    "Hủy duyệt thực đơn thành công."
                );


            } catch (error) {

                console.error(
                    error
                );


                window.MCS?.toast?.error(
                    error?.message ||
                    "Hủy duyệt thực đơn thất bại."
                );


            } finally {

                setActionLoading(
                    button,
                    false
                );

            }

        };


    if (
        window.MCS
            ?.confirm
            ?.show
    ) {

        window.MCS.confirm.show({

            title:
                "Xác nhận hủy duyệt",

            message:
                "Bạn có chắc chắn muốn hủy duyệt thực đơn này?",

            confirmLabel:
                "Hủy duyệt",

            type:
                "warning",

            onConfirm:
                executeUnapprove

        });


        return;

    }


    executeUnapprove();

}

function handleRestore(
    root,
    form,
    thucDonId,
    button
) {

    if (
        button.dataset.loading ===
        "true"
    ) {
        return;
    }


    const executeRestore =
        async () => {

            try {

                setActionLoading(
                    button,
                    true,
                    "Đang hoàn hủy..."
                );


                const response =
                    await restoreThucDon(
                        thucDonId
                    );


                const data =
                    await loadChiTietThucDon(
                        thucDonId
                    );


                form.setData(
                    data
                );


                renderActions(
                    root,
                    data
                );


                window.MCS?.toast?.success(
                    response?.message ||
                    "Hoàn hủy thực đơn thành công."
                );


            } catch (error) {

                console.error(
                    error
                );


                window.MCS?.toast?.error(
                    error?.message ||
                    "Hoàn hủy thực đơn thất bại."
                );


            } finally {

                setActionLoading(
                    button,
                    false
                );

            }

        };


    if (
        window.MCS
            ?.confirm
            ?.show
    ) {

        window.MCS.confirm.show({

            title:
                "Xác nhận hoàn hủy",

            message:
                "Bạn có chắc chắn muốn hoàn lại thao tác hủy thực đơn này?",

            confirmLabel:
                "Hoàn hủy",

            type:
                "warning",

            onConfirm:
                executeRestore

        });


        return;

    }


    executeRestore();

}

async function loadChiTietThucDon(
    id
) {

    const accessToken =
        getAccessToken();


    const response =
        await fetch(
            `/api/mcs/v1/thuc-don/${id}`,
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


    if (!response.ok) {

        throw new Error(
            result.message ||
            "Không thể tải thông tin thực đơn."
        );

    }


    const data =
        result.data ??
        result;


    if (!data) {

        throw new Error(
            "Không tìm thấy dữ liệu thực đơn."
        );

    }


    return data;

}

async function approveThucDon(
    id
) {

    const accessToken =
        getAccessToken();


    const response =
        await fetch(
            `/api/mcs/v1/thuc-don/duyet/${id}`,
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
                    "include"

            }
        );


    return handleApiResponse(
        response,
        "Không thể duyệt thực đơn."
    );

}

async function cancelThucDon(
    id
) {

    const accessToken =
        getAccessToken();


    const response =
        await fetch(
            `/api/mcs/v1/thuc-don/huy/${id}`,
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
                    "include"

            }
        );


    return handleApiResponse(
        response,
        "Không thể hủy thực đơn."
    );

}

async function unapproveThucDon(
    id
) {

    const accessToken =
        getAccessToken();


    const response =
        await fetch(
            `/api/mcs/v1/thuc-don/huy-duyet/${id}`,
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
                    "include"

            }
        );


    return handleApiResponse(
        response,
        "Không thể hủy duyệt thực đơn."
    );

}

async function restoreThucDon(
    id
) {

    const accessToken =
        getAccessToken();


    const response =
        await fetch(
            `/api/mcs/v1/thuc-don/hoan-huy/${id}`,
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
                    "include"

            }
        );


    return handleApiResponse(
        response,
        "Không thể hoàn hủy thực đơn."
    );

}

function getAccessToken() {

    const accessToken =
        localStorage.getItem(
            "accessToken"
        );


    if (!accessToken) {

        throw new Error(
            "Không tìm thấy access token."
        );

    }


    return accessToken;

}

async function handleApiResponse(
    response,
    defaultMessage
) {

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
            result.message ||
            defaultMessage
        );

    }


    return result;

}

function setActionLoading(
    button,
    loading,
    loadingText = ""
) {

    if (!button) {
        return;
    }


    if (loading) {

        button.dataset.loading =
            "true";


        button.dataset.originalHtml =
            button.innerHTML;


        button.disabled =
            true;


        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                ${loadingText}
            </span>
        `;


        return;

    }


    button.dataset.loading =
        "false";


    button.disabled =
        false;


    if (
        button.dataset.originalHtml
    ) {

        button.innerHTML =
            button.dataset.originalHtml;

    }

}

function renderActions(
    root,
    data
) {

    const editButton =
        root.querySelector(
            "[data-detail-edit]"
        );


    const approveButton =
        root.querySelector(
            "[data-detail-approve]"
        );


    const unapproveButton =
        root.querySelector(
            "[data-detail-unapprove]"
        );


    const cancelButton =
        root.querySelector(
            "[data-detail-cancel]"
        );


    const restoreButton =
        root.querySelector(
            "[data-detail-restore]"
        );


    const buttons = [
        editButton,
        approveButton,
        unapproveButton,
        cancelButton,
        restoreButton
    ];


    buttons.forEach(
        button => {

            if (button) {
                button.hidden = true;
            }

        }
    );


    const trangThaiText =
        getTrangThaiLabel(
            root,
            data.trangThai
        );


    const status =
        String(
            trangThaiText ||
            ""
        )
            .trim()
            .toLowerCase();

    if (
        status === "hủy" ||
        status === "đã hủy"
    ) {

        if (restoreButton) {
            restoreButton.hidden = false;
        }


        return;

    }

    if (
        status.includes(
            "đang áp dụng"
        ) ||
        status === "đã duyệt"
    ) {

        if (editButton) {
            editButton.hidden = false;
        }


        if (unapproveButton) {
            unapproveButton.hidden = false;
        }


        if (cancelButton) {
            cancelButton.hidden = false;
        }


        return;

    }

    if (
        status.includes(
            "hủy duyệt"
        ) ||
        status.includes(
            "chờ duyệt lại"
        )
    ) {

        if (editButton) {
            editButton.hidden = false;
        }


        if (approveButton) {
            approveButton.hidden = false;
        }


        if (cancelButton) {
            cancelButton.hidden = false;
        }


        return;

    }

    if (editButton) {
        editButton.hidden = false;
    }


    if (approveButton) {
        approveButton.hidden = false;
    }


    if (cancelButton) {
        cancelButton.hidden = false;
    }

}

function showSuccessMessage(
    message
) {

    if (
        window.MCS?.toast
    ) {

        window.MCS.toast.success(
            message
        );

        return;

    }


    console.log(
        message
    );

}

function showErrorMessage(
    message
) {

    if (
        window.MCS?.toast
    ) {

        window.MCS.toast.error(
            message
        );

        return;

    }


    console.error(
        message
    );

}

function getTrangThaiLabel(
    root,
    value
) {

    const options =
        root.querySelectorAll(
            "[data-trang-thai-option]"
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
                ""
            );

        }

    }


    return "";

}

function setLoading(
    root,
    loading
) {

    root.classList.toggle(
        "is-loading",
        loading
    );


    const form =
        root.querySelector(
            "[data-thuc-don-form]"
        );


    if (!form) {
        return;
    }


    form.setAttribute(
        "aria-busy",
        loading
            ? "true"
            : "false"
    );

}

function showError(
    root,
    message
) {

    const form =
        root.querySelector(
            "[data-thuc-don-form]"
        );


    if (!form) {
        return;
    }


    form.innerHTML = `
        <div class="thuc-don-detail-error">

            <div class="thuc-don-detail-error__icon">

                <i class="fa-solid fa-circle-exclamation"></i>

            </div>

            <strong>
                Không thể tải thông tin thực đơn
            </strong>

            <p>
                ${escapeHtml(
                    message ||
                    "Đã xảy ra lỗi."
                )}
            </p>

            <button
                type="button"
                onclick="window.location.reload()">

                <i class="fa-solid fa-rotate-right"></i>

                Thử lại

            </button>

        </div>
    `;

}

function escapeHtml(value) {

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
            "\"",
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}