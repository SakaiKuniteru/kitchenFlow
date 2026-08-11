"use strict";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const API_BASE =
            "/api/mcs/v1/thuc-don";

        const TRANG_THAI = {

            10: {
                label:
                    "Tạo mới",

                className:
                    "is-new"
            },

            20: {
                label:
                    "Đang áp dụng",

                className:
                    "is-active"
            },

            30: {
                label:
                    "Kết thúc",

                className:
                    "is-ended"
            },

            40: {
                label:
                    "Đã hủy",

                className:
                    "is-cancelled"
            }

        };

        const LOAI_THUC_DON = {

            10:
                "Theo ngày",

            20:
                "Theo tuần",

            30:
                "Theo tháng",

            40:
                "Từ ngày đến ngày"

        };

        const root =
            document.querySelector(
                "[data-thuc-don-detail]"
            );

        if (!root) {
            return;
        }

        const id =
            Number(
                root.dataset
                    .thucDonId
            );

        if (!id) {

            console.error(
                "Không xác định được ID thực đơn."
            );

            return;

        }

        let currentData = null;

        const lookupData = {

            coSo: [],

            nhaAn: [],

            caAn: [],

            nhomMonAn: [],

            monAn: []

        };

        const editState = {

            dsNgay: [],

            imageFiles: new Map()

        };

        const elements = {

            code:
                root.querySelector(
                    "[data-detail-code]"
                ),

            name:
                root.querySelector(
                    "[data-detail-name]"
                ),

            status:
                root.querySelector(
                    "[data-detail-status]"
                ),

            ma:
                root.querySelector(
                    "[data-detail-ma]"
                ),

            ten:
                root.querySelector(
                    "[data-detail-ten]"
                ),

            loai:
                root.querySelector(
                    "[data-detail-loai]"
                ),

            trangThai:
                root.querySelector(
                    "[data-detail-trang-thai]"
                ),

            tuNgay:
                root.querySelector(
                    "[data-detail-tu-ngay]"
                ),

            denNgay:
                root.querySelector(
                    "[data-detail-den-ngay]"
                ),

            coSo:
                root.querySelector(
                    "[data-detail-co-so]"
                ),

            nhaAn:
                root.querySelector(
                    "[data-detail-nha-an]"
                ),

            caAn:
                root.querySelector(
                    "[data-detail-ca-an]"
                ),

            active:
                root.querySelector(
                    "[data-detail-active]"
                ),

            moTa:
                root.querySelector(
                    "[data-detail-mo-ta]"
                ),

            days:
                root.querySelector(
                    "[data-detail-days]"
                ),

            empty:
                root.querySelector(
                    "[data-detail-empty]"
                ),

            edit:
                root.querySelector(
                    "[data-detail-edit]"
                ),

            approve:
                root.querySelector(
                    "[data-detail-approve]"
                ),

            cancel:
                root.querySelector(
                    "[data-detail-cancel]"
                ),

            print:
                root.querySelector(
                    "[data-detail-print]"
                ),

            delete:
                root.querySelector(
                    "[data-detail-delete]"
                ),

            detailView:
                root.querySelector(
                    "[data-detail-view]"
                ),

            editForm:
                root.querySelector(
                    "[data-detail-edit-form]"
                ),

            editCancel:
                root.querySelector(
                    "[data-edit-cancel]"
                ),

            editSave:
                root.querySelector(
                    "[data-edit-save]"
                ),

            viewActions:
                root.querySelector(
                    "[data-detail-view-actions]"
                ),

            editingActions:
                root.querySelector(
                    "[data-detail-editing-actions]"
                ),

            contentView:
                root.querySelector(
                    "[data-detail-content-view]"
                ),

            contentEdit:
                root.querySelector(
                    "[data-detail-content-edit]"
                ),

            editDays:
                root.querySelector(
                    "[data-edit-days]"
                )

        };

        initialize();

        async function initialize() {

            bindEvents();

            await Promise.all([
                loadCoSoOptions(),
                loadNhaAnOptions(),
                loadCaAnOptions(),
                loadNhomMonAnOptions(),
                loadMonAnOptions()
            ]);

            await loadDetail();

        }

        function bindEvents() {

            elements.print
                ?.addEventListener(
                    "click",
                    () => {

                        /*
                         * Tạm thời chưa làm chức năng in.
                         */

                    }
                );


            elements.delete
                ?.addEventListener(
                    "click",
                    deleteRecord
                );


            elements.edit
                ?.addEventListener(
                    "click",
                    () => {

                        openEditMode();

                    }
                );

            elements.editCancel
                ?.addEventListener(
                    "click",
                    closeEditMode
                );


            elements.editSave
                ?.addEventListener(
                    "click",
                    saveChanges
                );


            elements.approve
                ?.addEventListener(
                    "click",
                    approveRecord
                );


            elements.cancel
                ?.addEventListener(
                    "click",
                    cancelRecord
                );

            const editCoSo =
                document.getElementById(
                    "editCoSoId"
                );


            editCoSo
                ?.addEventListener(
                    "change",
                    () => {

                        const coSoId =
                            getNumberValue(
                                "editCoSoId"
                            );


                        refreshNhaAnOptions(
                            coSoId
                        );


                        refreshCaAnOptions(
                            null
                        );

                    }
                );

                const editNhaAn =
                    document.getElementById(
                        "editNhaAnId"
                    );

                editNhaAn
                    ?.addEventListener(
                        "change",
                        () => {

                            const nhaAnId =
                                getNumberValue(
                                    "editNhaAnId"
                                );


                            refreshCaAnOptions(
                                nhaAnId
                            );

                        }
                    );

        }

        async function loadCoSoOptions() {

            const response =
                await window.MCS.api.request(
                    "/api/mcs/v1/dm-co-so/tong-hop"
                );

            lookupData.coSo =
                normalizeActiveRecords(
                    response?.data
                );

        }

        async function loadNhaAnOptions() {

            const response =
                await window.MCS.api.request(
                    "/api/mcs/v1/dm-nha-an/tong-hop"
                );

            lookupData.nhaAn =
                normalizeActiveRecords(
                    response?.data
                );

        }

        async function loadCaAnOptions() {

            const response =
                await window.MCS.api.request(
                    "/api/mcs/v1/dm-ca-an/tong-hop"
                );

            lookupData.caAn =
                normalizeActiveRecords(
                    response?.data
                );

        }

        async function loadNhomMonAnOptions() {

            const response =
                await window.MCS.api.request(
                    "/api/mcs/v1/dm-nhom-mon-an/tong-hop"
                );

            lookupData.nhomMonAn =
                normalizeActiveRecords(
                    response?.data
                );

        }

        async function loadMonAnOptions() {

            const response =
                await window.MCS.api.request(
                    "/api/mcs/v1/dm-mon-an/tong-hop"
                );

            lookupData.monAn =
                normalizeActiveRecords(
                    response?.data
                );

        }

        function normalizeActiveRecords(
            data
        ) {

            const records =
                Array.isArray(data)
                    ? data
                    : (
                        data?.items ||
                        data?.rows ||
                        data?.danhSach ||
                        []
                    );


            return records.filter(
                item =>
                    item?.active === true
            );

        }

        function refreshSelectOptions(
            id,
            records,
            getValue,
            getLabel,
            selectedValue = null
        ) {

            const select =
                document.getElementById(
                    id
                );


            if (!select) {
                return;
            }


            select.innerHTML =
                "";


            records.forEach(
                record => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        String(
                            getValue(
                                record
                            )
                        );


                    option.textContent =
                        getLabel(
                            record
                        );


                    select.appendChild(
                        option
                    );

                }
            );


            if (
                selectedValue !== null &&
                selectedValue !== undefined
            ) {

                select.value =
                    String(
                        selectedValue
                    );

            } else {

                select.selectedIndex =
                    -1;

            }


            const smartSelectRoot =
                select.closest(
                    "[data-smart-select]"
                );


            smartSelectRoot
                ?.smartSelect
                ?.refresh();


        }

        function prepareGeneralEditOptions() {

            refreshSelectOptions(
                "editCoSoId",
                lookupData.coSo,
                item =>
                    item.id,
                item =>
                    item.tenCoSo,
                currentData?.coSo?.id
            );


            refreshNhaAnOptions(
                currentData?.coSo?.id,
                currentData?.nhaAn?.id
            );


            refreshCaAnOptions(
                currentData?.caAn?.id
            );

        }

        function refreshNhaAnOptions(
            coSoId,
            selectedNhaAnId = null
        ) {

            const normalizedCoSoId =
                Number(
                    coSoId
                );


            const records =
                lookupData.nhaAn
                    .filter(
                        item => {

                            const itemCoSoId =
                                Number(
                                    item.coSoId ??
                                    item.coSo?.id
                                );


                            return (
                                item.active === true &&
                                itemCoSoId ===
                                    normalizedCoSoId
                            );

                        }
                    );


            refreshSelectOptions(
                "editNhaAnId",
                records,
                item =>
                    item.id,
                item =>
                    item.tenNhaAn,
                selectedNhaAnId
            );


            setSmartSelectDisabled(
                "editNhaAnId",
                !normalizedCoSoId
            );

        }

        function refreshCaAnOptions(
            selectedCaAnId = null
        ) {

            const records =
                lookupData.caAn.filter(
                    item =>
                        item.active === true
                );


            refreshSelectOptions(
                "editCaAnId",
                records,
                item =>
                    item.id,
                item =>
                    item.tenCaAn,
                selectedCaAnId
            );


            setSmartSelectDisabled(
                "editCaAnId",
                false
            );

        }

        function setSmartSelectDisabled(
            id,
            disabled
        ) {

            const select =
                document.getElementById(
                    id
                );


            if (!select) {
                return;
            }


            const root =
                select.closest(
                    "[data-smart-select]"
                );


            if (
                root?.smartSelect
            ) {

                root.smartSelect
                    .setDisabled(
                        disabled
                    );

                return;

            }


            select.disabled =
                disabled;

        }

        async function loadDetail() {

            try {

                setLoading(
                    true
                );


                const response =
                    await window.MCS.api.request(
                        `${API_BASE}/${id}`
                    );


                currentData =
                    response?.data ||
                    null;


                if (!currentData) {

                    throw new Error(
                        "Không tìm thấy thông tin thực đơn."
                    );

                }


                renderDetail(
                    currentData
                );

            } catch (
                error
            ) {

                console.error(
                    error
                );


                showError(
                    error?.message ||
                    "Không thể tải thông tin thực đơn."
                );

            } finally {

                setLoading(
                    false
                );

            }

        }

        function renderDetail(
            data
        ) {

            renderGeneralInformation(
                data
            );


            renderWorkflowActions(
                data
            );


            renderDays(
                data.dsNgay ||
                []
            );

        }

        function renderGeneralInformation(
            data
        ) {

            setText(
                elements.code,
                data.maThucDon
            );


            setText(
                elements.name,
                data.tenThucDon
            );


            setText(
                elements.ma,
                data.maThucDon
            );


            setText(
                elements.ten,
                data.tenThucDon
            );


            setText(
                elements.loai,
                LOAI_THUC_DON[
                    Number(
                        data.loaiThucDon
                    )
                ] ||
                "—"
            );


            const status =
                TRANG_THAI[
                    Number(
                        data.trangThai
                    )
                ];


            setText(
                elements.trangThai,
                status?.label ||
                "—"
            );


            renderStatusBadge(
                status
            );


            setText(
                elements.tuNgay,
                formatDate(
                    data.tuNgay
                )
            );


            setText(
                elements.denNgay,
                formatDate(
                    data.denNgay
                )
            );


            setText(
                elements.coSo,
                data.coSo?.tenCoSo ||
                "—"
            );


            setText(
                elements.nhaAn,
                data.nhaAn?.tenNhaAn ||
                "—"
            );


            setText(
                elements.caAn,
                data.caAn?.tenCaAn ||
                "—"
            );


            setText(
                elements.active,
                data.active
                    ? "Đang sử dụng"
                    : "Ngừng sử dụng"
            );


            setText(
                elements.moTa,
                data.moTa ||
                "Không có mô tả."
            );

        }

        function renderStatusBadge(
            status
        ) {

            if (
                !elements.status
            ) {
                return;
            }


            elements.status
                .className =
                    "thuc-don-detail__status";


            if (
                status?.className
            ) {

                elements.status
                    .classList
                    .add(
                        status.className
                    );

            }


            elements.status.textContent =
                status?.label ||
                "Không xác định";

        }

        function renderWorkflowActions(
            data
        ) {

            const trangThai =
                Number(
                    data.trangThai
                );


            hide(
                elements.edit
            );

            hide(
                elements.approve
            );

            hide(
                elements.cancel
            );

            if (
                trangThai ===
                10
            ) {

                show(
                    elements.edit
                );

                show(
                    elements.approve
                );

                show(
                    elements.cancel
                );

                return;

            }

            if (
                trangThai ===
                20
            ) {

                show(
                    elements.edit
                );

                show(
                    elements.cancel
                );

            }

        }

        function renderDays(
            dsNgay
        ) {

            if (
                !elements.days
            ) {
                return;
            }


            elements.days.innerHTML =
                "";


            if (
                !Array.isArray(
                    dsNgay
                ) ||
                dsNgay.length ===
                    0
            ) {

                if (
                    elements.empty
                ) {

                    elements.empty.hidden =
                        false;

                }

                return;

            }


            if (
                elements.empty
            ) {

                elements.empty.hidden =
                    true;

            }


            dsNgay.forEach(
                (
                    ngay,
                    index
                ) => {

                    const section =
                        document.createElement(
                            "article"
                        );


                    section.className =
                        "thuc-don-detail__day";


                    section.innerHTML =
                        `
                            <header
                                class="
                                    thuc-don-detail__day-header
                                ">

                                <div
                                    class="
                                        thuc-don-detail__day-number
                                    ">
                                    ${
                                        index +
                                        1
                                    }
                                </div>

                                <div>

                                    <h3>
                                        ${escapeHtml(
                                            formatDate(
                                                ngay.ngay
                                            )
                                        )}
                                    </h3>

                                    ${
                                        ngay.ghiChu
                                            ? `
                                                <p>
                                                    ${escapeHtml(
                                                        ngay.ghiChu
                                                    )}
                                                </p>
                                            `
                                            : ""
                                    }

                                </div>

                            </header>

                            <div
                                class="
                                    thuc-don-detail__groups
                                ">

                                ${renderGroups(
                                    ngay.dsNhomMonAn ||
                                    []
                                )}

                            </div>
                        `;


                    elements.days
                        .appendChild(
                            section
                        );

                }
            );

        }

        function renderGroups(
            dsNhom
        ) {

            if (
                !Array.isArray(
                    dsNhom
                ) ||
                dsNhom.length ===
                    0
            ) {

                return `
                    <div
                        class="
                            thuc-don-detail__group-empty
                        ">
                        Chưa có nhóm món ăn.
                    </div>
                `;

            }


            return dsNhom
                .map(
                    nhom => {

                        const tenNhom =
                            nhom
                                .nhomMonAn
                                ?.tenNhomMonAn ||
                            "Nhóm món ăn";


                        return `
                            <section
                                class="
                                    thuc-don-detail__group
                                ">

                                <header
                                    class="
                                        thuc-don-detail__group-header
                                    ">

                                    <div>

                                        <strong>
                                            ${escapeHtml(
                                                tenNhom
                                            )}
                                        </strong>

                                        ${
                                            nhom
                                                .nhomMonAn
                                                ?.maNhomMonAn
                                                ? `
                                                    <small>
                                                        ${escapeHtml(
                                                            nhom
                                                                .nhomMonAn
                                                                .maNhomMonAn
                                                        )}
                                                    </small>
                                                `
                                                : ""
                                        }

                                    </div>

                                    <span>
                                        ${
                                            (
                                                nhom
                                                    .dsMonAn ||
                                                []
                                            ).length
                                        }
                                        món
                                    </span>

                                </header>


                                <div
                                    class="
                                        thuc-don-detail__foods
                                    ">

                                    ${renderFoods(
                                        nhom.dsMonAn ||
                                        []
                                    )}

                                </div>

                            </section>
                        `;

                    }
                )
                .join(
                    ""
                );

        }

        function renderFoods(
            dsMon
        ) {

            if (
                !Array.isArray(
                    dsMon
                ) ||
                dsMon.length ===
                    0
            ) {

                return `
                    <div
                        class="
                            thuc-don-detail__food-empty
                        ">
                        Chưa có món ăn.
                    </div>
                `;

            }


            return dsMon
                .map(
                    (
                        item,
                        index
                    ) => {

                        const mon =
                            item.monAn ||
                            {};


                        const donVi =
                            item.donViTinh
                                ?.kyHieu ||
                            item.donViTinh
                                ?.tenDonViTinh ||
                            "";


                        const dinhLuong =
                            item.dinhLuong !==
                                null &&
                            item.dinhLuong !==
                                undefined
                                ? `${
                                    formatNumber(
                                        item.dinhLuong
                                    )
                                } ${
                                    escapeHtml(
                                        donVi
                                    )
                                }`
                                : "—";


                        return `
                            <div
                                class="
                                    thuc-don-detail__food
                                ">

                                <span
                                    class="
                                        thuc-don-detail__food-index
                                    ">
                                    ${
                                        index +
                                        1
                                    }
                                </span>

                                <div
                                    class="
                                        thuc-don-detail__food-information
                                    ">

                                    <strong>
                                        ${escapeHtml(
                                            mon.tenMonAn ||
                                            "Món ăn"
                                        )}
                                    </strong>

                                    <small>
                                        ${escapeHtml(
                                            mon.maMonAn ||
                                            ""
                                        )}
                                    </small>

                                </div>

                                <div
                                    class="
                                        thuc-don-detail__food-quantity
                                    ">

                                    <span>
                                        Định lượng
                                    </span>

                                    <strong>
                                        ${dinhLuong}
                                    </strong>

                                </div>

                                <div
                                    class="
                                        thuc-don-detail__food-note
                                    ">

                                    ${
                                        item.ghiChu
                                            ? escapeHtml(
                                                item.ghiChu
                                            )
                                            : "—"
                                    }

                                </div>

                            </div>
                        `;

                    }
                )
                .join(
                    ""
                );

        }

        async function approveRecord() {

            if (
                !currentData
            ) {
                return;
            }


            if (
                !window.MCS
                    ?.confirm
                    ?.show
            ) {
                return;
            }


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
                    async () => {

                        try {

                            setLoading(
                                true
                            );


                            const response =
                                await window.MCS.api.request(
                                    `${API_BASE}/duyet/${id}`,
                                    {
                                        method:
                                            "PATCH"
                                    }
                                );


                            showSuccess(
                                response?.message ||
                                "Duyệt thực đơn thành công."
                            );


                            await loadDetail();

                        } catch (
                            error
                        ) {

                            showError(
                                error?.message ||
                                "Duyệt thực đơn thất bại."
                            );

                        } finally {

                            setLoading(
                                false
                            );

                        }

                    }

            });

        }

        async function cancelRecord() {

            if (
                !window.MCS
                    ?.confirm
                    ?.show
            ) {
                return;
            }


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
                    async () => {

                        try {

                            setLoading(
                                true
                            );


                            const response =
                                await window.MCS.api.request(
                                    `${API_BASE}/huy/${id}`,
                                    {
                                        method:
                                            "PATCH"
                                    }
                                );


                            showSuccess(
                                response?.message ||
                                "Hủy thực đơn thành công."
                            );


                            await loadDetail();

                        } catch (
                            error
                        ) {

                            showError(
                                error?.message ||
                                "Hủy thực đơn thất bại."
                            );

                        } finally {

                            setLoading(
                                false
                            );

                        }

                    }

            });

        }

        function deleteRecord() {

            if (
                !window.MCS
                    ?.confirm
                    ?.show
            ) {
                return;
            }


            window.MCS.confirm.show({

                title:
                    "Xác nhận xóa",

                message:
                    "Bạn có chắc chắn muốn xóa thực đơn này không?",

                confirmLabel:
                    "Xóa",

                type:
                    "danger",

                onConfirm:
                    async () => {

                        try {

                            setLoading(
                                true
                            );


                            const response =
                                await window.MCS.api.request(
                                    `${API_BASE}/xoa/${id}`,
                                    {
                                        method:
                                            "DELETE"
                                    }
                                );


                            showSuccess(
                                response?.message ||
                                "Xóa thực đơn thành công."
                            );


                            window.location.href =
                                "/thuc-don/danh-sach-thuc-don";

                        } catch (
                            error
                        ) {

                            showError(
                                error?.message ||
                                "Xóa thực đơn thất bại."
                            );

                        } finally {

                            setLoading(
                                false
                            );

                        }

                    }

            });

        }

        function openEditMode() {

            if (!currentData) {
                return;
            }


            editState.dsNgay =
                structuredClone(
                    currentData.dsNgay ||
                    []
                );

            root.classList.add(
                "is-editing"
            );


            elements.detailView.hidden =
                true;

            elements.editForm.hidden =
                false;


            elements.contentView.hidden =
                true;

            elements.contentEdit.hidden =
                false;


            elements.viewActions.hidden =
                true;

            elements.editingActions.hidden =
                false;


            hide(
                elements.edit
            );

            hide(
                elements.approve
            );

            hide(
                elements.cancel
            );


            /*
            * Sau khi form đã hiện
            * mới đổ dữ liệu.
            */
            fillEditFormBasic(
                currentData
            );


            prepareGeneralEditOptions();


            renderEditDays();

        }

        function closeEditMode() {

            root.classList.remove(
                "is-editing"
            );


            elements.detailView.hidden =
                false;

            elements.editForm.hidden =
                true;


            elements.contentView.hidden =
                false;

            elements.contentEdit.hidden =
                true;


            elements.viewActions.hidden =
                false;

            elements.editingActions.hidden =
                true;


            editState.dsNgay =
                [];

            clearImagePreviews();


            renderWorkflowActions(
                currentData
            );

        }

        function renderEditDays() {

            if (!elements.editDays) {
                return;
            }


            elements.editDays.innerHTML =
                "";


            editState.dsNgay.forEach(
                (
                    ngay,
                    ngayIndex
                ) => {

                    const day =
                        document.createElement(
                            "article"
                        );


                    day.className =
                        "thuc-don-edit-day";


                    day.innerHTML =
                        `
                            <header
                                class="
                                    thuc-don-edit-day__header
                                ">

                                <div>

                                    <strong>
                                        ${escapeHtml(
                                            formatDate(
                                                ngay.ngay
                                            )
                                        )}
                                    </strong>

                                    <small>
                                        ${
                                            escapeHtml(
                                                ngay.ghiChu ||
                                                ""
                                            )
                                        }
                                    </small>

                                </div>

                            </header>

                            <div
                                class="
                                    thuc-don-edit-day__groups
                                "
                                data-edit-day-groups="${ngayIndex}">
                            </div>
                        `;


                    elements.editDays
                        .appendChild(
                            day
                        );


                    renderEditGroups(
                        day.querySelector(
                            "[data-edit-day-groups]"
                        ),
                        ngay,
                        ngayIndex
                    );

                }
            );

        }

        function renderEditGroups(
            container,
            ngay,
            ngayIndex
        ) {

            const groups =
                ngay.dsNhomMonAn ||
                [];


            container.innerHTML =
                "";


            groups.forEach(
                (
                    group,
                    groupIndex
                ) => {

                    const element =
                        document.createElement(
                            "section"
                        );


                    element.className =
                        "thuc-don-edit-group";


                    element.innerHTML =
                        `
                            <div
                                class="
                                    thuc-don-edit-group__header
                                ">

                                <strong>
                                    ${
                                        escapeHtml(
                                            group
                                                .nhomMonAn
                                                ?.tenNhomMonAn ||
                                            "Nhóm món ăn"
                                        )
                                    }
                                </strong>

                                <button
                                    type="button"
                                    class="
                                        thuc-don-edit-group__add
                                    "
                                    data-add-food>

                                    <i
                                        class="
                                            fa-solid
                                            fa-plus
                                        ">
                                    </i>

                                    Thêm món

                                </button>

                            </div>

                            <div
                                data-edit-foods>
                            </div>
                        `;


                    container.appendChild(
                        element
                    );


                    renderEditFoods(
                        element.querySelector(
                            "[data-edit-foods]"
                        ),
                        group,
                        ngayIndex,
                        groupIndex
                    );


                    element.querySelector(
                        "[data-add-food]"
                    )
                        ?.addEventListener(
                            "click",
                            () => {

                                addFood(
                                    ngayIndex,
                                    groupIndex
                                );

                            }
                        );

                }
            );

        }

        function renderEditFoods(
            container,
            group,
            ngayIndex,
            groupIndex
        ) {

            const foods =
                group.dsMonAn ||
                [];


            container.innerHTML =
                "";


            foods.forEach(
                (
                    item,
                    foodIndex
                ) => {

                    const mon =
                        item.monAn ||
                        {};


                    const imageUrl =
                        getMonAnImageUrl(
                            mon
                        );


                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "thuc-don-edit-food";
                    
                    const monAnOptions =
                        buildMonAnOptions(
                            mon.id ||
                            item.monAnId
                        );

                    row.innerHTML =
                        `
                            <div
                                class="
                                    thuc-don-edit-food__content
                                ">

                                <div
                                    class="
                                        thuc-don-edit-food__main
                                    ">

                                    <select
                                        class="
                                            thuc-don-edit-food__select
                                        "
                                        data-food-select>

                                        <option value="">
                                            Chọn món ăn...
                                        </option>

                                        ${monAnOptions}

                                    </select>

                                </div>


                                <div
                                    class="
                                        thuc-don-edit-food__fields
                                    ">

                                    <div
                                        class="
                                            thuc-don-edit-food__field
                                        ">

                                        <span>
                                            Định lượng
                                        </span>

                                        <input
                                            type="number"
                                            class="
                                                thuc-don-edit-food__quantity
                                            "
                                            value="${
                                                item.dinhLuong ??
                                                ""
                                            }"
                                            min="0"
                                            step="0.001"
                                            data-food-quantity>

                                    </div>


                                    <div
                                        class="
                                            thuc-don-edit-food__field
                                            is-note
                                        ">

                                        <span>
                                            Ghi chú
                                        </span>

                                        <input
                                            type="text"
                                            class="
                                                thuc-don-edit-food__note
                                            "
                                            value="${escapeHtml(
                                                item.ghiChu ||
                                                ""
                                            )}"
                                            placeholder="Ghi chú..."
                                            data-food-note>

                                    </div>


                                    <button
                                        type="button"
                                        class="
                                            thuc-don-edit-food__delete
                                        "
                                        data-food-delete
                                        title="Xóa món">

                                        <i
                                            class="
                                                fa-regular
                                                fa-trash-can
                                            ">
                                        </i>

                                    </button>

                                </div>

                            </div>


                            <label
                                class="
                                    thuc-don-edit-food__image
                                "
                                title="Nhấn để thay ảnh">

                                <img
                                    src="${escapeHtml(
                                        imageUrl
                                    )}"
                                    alt="${escapeHtml(
                                        mon.tenMonAn ||
                                        "Món ăn"
                                    )}"
                                    data-food-preview>

                                <span
                                    class="
                                        thuc-don-edit-food__image-overlay
                                    ">

                                    <i
                                        class="
                                            fa-solid
                                            fa-camera
                                        ">
                                    </i>

                                    <small>
                                        Đổi ảnh
                                    </small>

                                </span>

                                <input
                                    type="file"
                                    accept="
                                        image/png,
                                        image/jpeg,
                                        image/webp
                                    "
                                    data-food-image
                                    hidden>

                            </label>
                        `;


                    container.appendChild(
                        row
                    );


                    bindFoodEditor(
                        row,
                        item,
                        ngayIndex,
                        groupIndex,
                        foodIndex
                    );

                }
            );

        }

        function buildMonAnOptions(
            selectedId
        ) {

            return lookupData.monAn
                .map(
                    mon => {

                        const selected =
                            Number(
                                mon.id
                            ) ===
                            Number(
                                selectedId
                            );


                        return `
                            <option
                                value="${mon.id}"
                                ${
                                    selected
                                        ? "selected"
                                        : ""
                                }>

                                ${escapeHtml(
                                    mon.tenMonAn
                                )}

                                ${
                                    mon.maMonAn
                                        ? ` - ${escapeHtml(
                                            mon.maMonAn
                                        )}`
                                        : ""
                                }

                            </option>
                        `;

                    }
                )
                .join(
                    ""
                );

        }

        function bindFoodEditor(
            row,
            item,
            ngayIndex,
            groupIndex,
            foodIndex
        ) {

            const foodSelect =
                row.querySelector(
                    "[data-food-select]"
                );


            foodSelect
                ?.addEventListener(
                    "change",
                    event => {

                        const monAnId =
                            Number(
                                event.target.value
                            );


                        const monAn =
                            lookupData.monAn
                                .find(
                                    mon =>
                                        Number(
                                            mon.id
                                        ) ===
                                        monAnId
                                );


                        if (!monAn) {

                            item.monAnId =
                                null;

                            item.monAn =
                                null;

                            return;

                        }


                        item.monAnId =
                            monAn.id;


                        item.monAn =
                            {
                                ...monAn
                            };

                        if (
                            monAn.donViTinh
                        ) {

                            item.donViTinh =
                                monAn.donViTinh;

                        }

                    }
                );

            const imageInput =
                row.querySelector(
                    "[data-food-image]"
                );

            const preview =
                row.querySelector(
                    "[data-food-preview]"
                );


            imageInput
                ?.addEventListener(
                    "change",
                    event => {

                        const file =
                            event.target
                                .files?.[0];


                        if (!file) {
                            return;
                        }


                        const key =
                            `${ngayIndex}-${groupIndex}-${foodIndex}`;


                        const old =
                            editState.imageFiles
                                .get(
                                    key
                                );


                        if (
                            old?.previewUrl
                        ) {

                            URL.revokeObjectURL(
                                old.previewUrl
                            );

                        }


                        const previewUrl =
                            URL.createObjectURL(
                                file
                            );


                        preview.src =
                            previewUrl;


                        editState.imageFiles
                            .set(
                                key,
                                {
                                    file,
                                    previewUrl,
                                    item
                                }
                            );

                    }
                );


            row.querySelector(
                "[data-food-quantity]"
            )
                ?.addEventListener(
                    "input",
                    event => {

                        item.dinhLuong =
                            event.target.value;

                    }
                );


            row.querySelector(
                "[data-food-note]"
            )
                ?.addEventListener(
                    "input",
                    event => {

                        item.ghiChu =
                            event.target.value;

                    }
                );


            row.querySelector(
                "[data-food-delete]"
            )
                ?.addEventListener(
                    "click",
                    () => {

                        editState
                            .dsNgay[
                                ngayIndex
                            ]
                            .dsNhomMonAn[
                                groupIndex
                            ]
                            .dsMonAn
                            .splice(
                                foodIndex,
                                1
                            );


                        renderEditDays();

                    }
                );

        }

        function clearImagePreviews() {

            editState.imageFiles
                .forEach(
                    item => {

                        if (
                            item.previewUrl
                        ) {

                            URL.revokeObjectURL(
                                item.previewUrl
                            );

                        }

                    }
                );


            editState.imageFiles
                .clear();

        }

        function addFood(
            ngayIndex,
            groupIndex
        ) {

            const activeFoods =
                lookupData.monAn;


            if (
                activeFoods.length ===
                0
            ) {

                showError(
                    "Không có món ăn đang hoạt động."
                );

                return;

            }


            const group =
                editState
                    .dsNgay[
                        ngayIndex
                    ]
                    ?.dsNhomMonAn[
                        groupIndex
                    ];


            if (!group) {
                return;
            }


            if (
                !Array.isArray(
                    group.dsMonAn
                )
            ) {

                group.dsMonAn =
                    [];

            }


            group.dsMonAn.push({

                monAn:
                    null,

                monAnId:
                    null,

                dinhLuong:
                    null,

                donViTinh:
                    null,

                ghiChu:
                    ""

            });


            renderEditDays();

        }

        function fillEditFormBasic(
            data
        ) {

            setInputValue(
                "editMaThucDon",
                data.maThucDon
            );


            setInputValue(
                "editTenThucDon",
                data.tenThucDon
            );


            setSelectValue(
                "editLoaiThucDon",
                data.loaiThucDon
            );


            setDateValue(
                "editTuNgay",
                data.tuNgay
            );


            setDateValue(
                "editDenNgay",
                data.denNgay
            );


            setInputValue(
                "editMoTa",
                data.moTa
            );

        }

        function validateCurrentRelations() {

            const currentCoSoId =
                Number(
                    currentData?.coSo?.id
                );


            const currentNhaAnId =
                Number(
                    currentData?.nhaAn?.id
                );


            const validCoSo =
                lookupData.coSo.some(
                    item =>
                        Number(item.id) ===
                            currentCoSoId &&
                        item.active === true
                );


            const validNhaAn =
                lookupData.nhaAn.some(
                    item =>
                        Number(item.id) ===
                            currentNhaAnId &&
                        item.active === true &&
                        Number(
                            item.coSoId ??
                            item.coSo?.id
                        ) ===
                            currentCoSoId
                );


            return {
                validCoSo,
                validNhaAn
            };

        }

        function setInputValue(
            id,
            value
        ) {

            const input =
                document.getElementById(
                    id
                );


            if (!input) {
                return;
            }


            input.value =
                value ??
                "";


            input.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles:
                            true
                    }
                )
            );

        }

        function setDateValue(
            id,
            value
        ) {

            const valueInput =
                document.getElementById(
                    id
                );


            const displayInput =
                document.getElementById(
                    `${id}Display`
                );


            if (!valueInput) {
                return;
            }


            if (!value) {

                valueInput.value =
                    "";


                if (displayInput) {

                    displayInput.value =
                        "";

                }


                valueInput.dispatchEvent(
                    new Event(
                        "change",
                        {
                            bubbles:
                                true
                        }
                    )
                );


                return;

            }


            const rawValue =
                String(
                    value
                );


            const isoDate =
                rawValue.substring(
                    0,
                    10
                );


            const parts =
                isoDate.split(
                    "-"
                );


            if (
                parts.length !==
                3
            ) {

                return;

            }


            const [
                year,
                month,
                day
            ] =
                parts;


            /*
            * Giá trị gửi BE.
            */
            valueInput.value =
                `${year}-${month}-${day}`;


            /*
            * Giá trị người dùng nhìn thấy.
            */
            if (displayInput) {

                displayInput.value =
                    `${day}/${month}/${year}`;

            }


            valueInput.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles:
                            true
                    }
                )
            );


            valueInput.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles:
                            true
                    }
                )
            );

        }

        async function saveChanges() {

            try {

                const payload =
                    collectEditData();


                setLoading(
                    true
                );


                const response =
                    await window.MCS.api.request(
                        `${API_BASE}/cap-nhat/${id}`,
                        {
                            method:
                                "PATCH",

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );


                showSuccess(
                    response?.message ||
                    "Cập nhật thực đơn thành công."
                );


                closeEditMode();

                await loadDetail();

            } catch (
                error
            ) {

                showError(
                    error?.message ||
                    "Cập nhật thực đơn thất bại."
                );

            } finally {

                setLoading(
                    false
                );

            }

        }

        function collectEditData() {

            return {

                maThucDon:
                    getInputValue(
                        "editMaThucDon"
                    ),

                tenThucDon:
                    getInputValue(
                        "editTenThucDon"
                    ),

                loaiThucDon:
                    getNumberValue(
                        "editLoaiThucDon"
                    ),

                tuNgay:
                    getInputValue(
                        "editTuNgay"
                    ),

                denNgay:
                    getInputValue(
                        "editDenNgay"
                    ),

                coSoId:
                    getNumberValue(
                        "editCoSoId"
                    ),

                nhaAnId:
                    getNumberValue(
                        "editNhaAnId"
                    ),

                caAnId:
                    getNumberValue(
                        "editCaAnId"
                    ),

                moTa:
                    getInputValue(
                        "editMoTa"
                    ),

                dsNgay:
                    editState.dsNgay

            };

        }

        function getInputValue(
            id
        ) {

            return document
                .getElementById(
                    id
                )
                ?.value
                ?.trim() ||
                "";

        }

        function getNumberValue(
            id
        ) {

            const value =
                document
                    .getElementById(
                        id
                    )
                    ?.value;


            if (
                value ===
                "" ||
                value ===
                undefined
            ) {
                return null;
            }


            return Number(
                value
            );

        }

        function setSelectValue(
            id,
            value
        ) {

            const select =
                document.getElementById(
                    id
                );


            if (!select) {
                return;
            }


            select.value =
                value ===
                    null ||
                value ===
                    undefined
                    ? ""
                    : String(
                        value
                    );


            select.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles:
                            true
                    }
                )
            );

        }

        function getMonAnImageUrl(
            mon
        ) {

            const rawUrl =
                mon?.hinhAnh ||
                mon?.anhMonAn ||
                mon?.hinh_anh ||
                "";


            if (!rawUrl) {

                return "/assets/images/food/default-food.png";

            }


            if (
                rawUrl.startsWith(
                    "http://"
                ) ||
                rawUrl.startsWith(
                    "https://"
                ) ||
                rawUrl.startsWith(
                    "/"
                )
            ) {

                return rawUrl;

            }


            return `/${rawUrl}`;

        }

        function setText(
            element,
            value
        ) {

            if (!element) {
                return;
            }


            element.textContent =
                value ??
                "—";

        }

        function show(
            element
        ) {

            if (element) {
                element.hidden =
                    false;
            }

        }

        function hide(
            element
        ) {

            if (element) {
                element.hidden =
                    true;
            }

        }

        function formatDate(
            value
        ) {

            if (!value) {
                return "—";
            }


            const date =
                new Date(
                    value
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return String(
                    value
                );
            }


            return new Intl
                .DateTimeFormat(
                    "vi-VN",
                    {
                        day:
                            "2-digit",

                        month:
                            "2-digit",

                        year:
                            "numeric"
                    }
                )
                .format(
                    date
                );

        }

        function formatNumber(
            value
        ) {

            return new Intl
                .NumberFormat(
                    "vi-VN",
                    {
                        maximumFractionDigits:
                            3
                    }
                )
                .format(
                    Number(
                        value
                    )
                );

        }

        function escapeHtml(
            value
        ) {

            return String(
                value ??
                ""
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }

        function showSuccess(
            message
        ) {

            window.MCS
                ?.toast
                ?.success
                ?.(
                    message
                );

        }

        function showError(
            message
        ) {

            window.MCS
                ?.toast
                ?.error
                ?.(
                    message
                );

        }

        function setLoading(
            loading
        ) {

            if (
                loading
            ) {

                window.MCS
                    ?.loading
                    ?.show
                    ?.();

                return;

            }


            window.MCS
                ?.loading
                ?.hide
                ?.();

        }

    }
);