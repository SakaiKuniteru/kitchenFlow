'use strict';


(function () {

    window.MCS =
        window.MCS ||
        {};


    const DEFAULT_TIME_ZONE =
        'Asia/Ho_Chi_Minh';


    const DEFAULT_OFFSET =
        '+07:00';


    function create(
        options = {}
    ) {

        const root =
            typeof options.root ===
            'string'
                ? document.querySelector(
                    options.root
                )
                : options.root;


        if (!root) {
            throw new Error(
                'Không xác định được vùng báo cáo.'
            );
        }


        if (!options.api) {
            throw new Error(
                'Chưa cấu hình API báo cáo.'
            );
        }


        if (
            typeof options.getPayload !==
            'function'
        ) {
            throw new Error(
                'Chưa cấu hình hàm lấy bộ lọc báo cáo.'
            );
        }


        const state = {

            lastReport:
                null,

            lastPayloadKey:
                null,

            loading:
                false

        };


        const elements = {

            form:
                root.querySelector(
                    '[data-report-form]'
                ),

            cancel:
                root.querySelector(
                    '[data-report-cancel]'
                ),

            download:
                root.querySelector(
                    '[data-report-download]'
                ),

            view:
                root.querySelector(
                    '[data-report-view]'
                ),

        };


        bindBaseEvents();


        /*
         * ==========================================
         * EVENTS CHUNG
         * ==========================================
         */

        function bindBaseEvents() {

            elements.cancel
                ?.addEventListener(
                    'click',
                    () => {

                        invalidateReport();


                        if (
                            typeof options.onReset ===
                            'function'
                        ) {

                            options.onReset(
                                api
                            );

                        }

                    }
                );


            elements.view
                ?.addEventListener(
                    'click',
                    xemBaoCao
                );


            elements.download
                ?.addEventListener(
                    'click',
                    taiBaoCao
                );


            elements.form
                ?.addEventListener(
                    'change',
                    invalidateReport
                );
        }


        function invalidateReport() {

            state.lastReport =
                null;

            state.lastPayloadKey =
                null;
        }


        /*
         * ==========================================
         * LOAD API
         * ==========================================
         */

        async function loadList(
            endpoint
        ) {

            const response =
                await window.MCS
                    .api
                    .request(
                        endpoint,
                        {
                            method:
                                'GET'
                        }
                    );


            return normalizeList(
                response?.data ??
                response
            );
        }


        function normalizeList(
            data
        ) {

            if (
                Array.isArray(
                    data
                )
            ) {
                return data;
            }


            return (
                data?.items ||
                data?.rows ||
                data?.data ||
                data?.danhSach ||
                []
            );
        }


        /*
         * ==========================================
         * TẠO BÁO CÁO
         * ==========================================
         */

        async function taoBaoCao(
            payload
        ) {

            const response =
                await window.MCS
                    .api
                    .request(
                        options.api,
                        {
                            method:
                                'POST',

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );


            const report =
                response?.data;


            if (!report) {
                throw new Error(
                    'API không trả về thông tin báo cáo.'
                );
            }


            if (!report.file) {
                throw new Error(
                    'Báo cáo không có thông tin file.'
                );
            }


            state.lastReport =
                report;


            state.lastPayloadKey =
                JSON.stringify(
                    payload
                );


            return report;
        }


        /*
         * ==========================================
         * XEM BÁO CÁO
         * ==========================================
         */

        async function xemBaoCao() {

            let viewerWindow =
                null;


            try {

                const payload =
                    options.getPayload();


                /*
                 * Mở trước để tránh popup blocker.
                 */
                viewerWindow =
                    window.open(
                        '',
                        '_blank'
                    );


                setLoading(
                    true
                );


                const report =
                    await taoBaoCao(
                        payload
                    );


                const pdfPath =
                    report?.file?.pdf;


                if (!pdfPath) {
                    throw new Error(
                        'Báo cáo không có file PDF.'
                    );
                }


                const file =
                    await window.MCS
                        .api
                        .requestFile(
                            buildFileUrl(
                                pdfPath
                            ),
                            {
                                method:
                                    'GET'
                            }
                        );


                if (!file?.blob) {
                    throw new Error(
                        'Không tải được file PDF báo cáo.'
                    );
                }


                const objectUrl =
                    URL.createObjectURL(
                        file.blob
                    );


                if (
                    viewerWindow
                ) {

                    viewerWindow.location.href =
                        objectUrl;

                } else {

                    window.open(
                        objectUrl,
                        '_blank'
                    );

                }


                window.setTimeout(
                    () => {

                        URL.revokeObjectURL(
                            objectUrl
                        );

                    },
                    60000
                );

            } catch (
                error
            ) {

                viewerWindow
                    ?.close?.();


                showError(
                    error,
                    'Không thể xem báo cáo.'
                );

            } finally {

                setLoading(
                    false
                );

            }
        }


        /*
         * ==========================================
         * TẢI BÁO CÁO
         * ==========================================
         */

        async function taiBaoCao() {

            try {

                const payload =
                    options.getPayload();


                const payloadKey =
                    JSON.stringify(
                        payload
                    );


                setLoading(
                    true
                );


                /*
                 * Nếu vừa xem cùng bộ lọc
                 * thì dùng luôn file đã sinh.
                 */
                let report =
                    state.lastReport;


                if (
                    !report ||
                    state.lastPayloadKey !==
                        payloadKey
                ) {

                    report =
                        await taoBaoCao(
                            payload
                        );

                }


                const filePath =
                    getDownloadFilePath(
                        report
                    );


                if (!filePath) {
                    throw new Error(
                        'Không xác định được file báo cáo để tải.'
                    );
                }


                const file =
                    await window.MCS
                        .api
                        .requestFile(
                            buildFileUrl(
                                filePath
                            ),
                            {
                                method:
                                    'GET'
                            }
                        );


                if (!file?.blob) {
                    throw new Error(
                        'Không tải được file báo cáo.'
                    );
                }


                downloadBlob(
                    file.blob,

                    getFileName(
                        filePath
                    )
                );

            } catch (
                error
            ) {

                showError(
                    error,
                    'Không thể tải báo cáo.'
                );

            } finally {

                setLoading(
                    false
                );

            }
        }


        function getDownloadFilePath(
            report
        ) {

            const file =
                report?.file ||
                {};


            /*
             * 10 = PDF
             * 20 = Word
             * 30 = Excel
             */
            switch (
                Number(
                    report?.dinhDang
                )
            ) {

                case 10:

                    return (
                        file.pdf ||
                        null
                    );


                case 20:

                    return (
                        file.docx ||
                        file.pdf ||
                        null
                    );


                case 30:

                    return (
                        file.xlsx ||
                        file.pdf ||
                        null
                    );


                default:

                    return (
                        file.xlsx ||
                        file.docx ||
                        file.pdf ||
                        null
                    );

            }
        }


        /*
         * ==========================================
         * FILE
         * ==========================================
         */

        function buildFileUrl(
            filePath
        ) {

            if (
                window.MCS
                    ?.reportPrint
                    ?.buildFileUrl
            ) {

                return window.MCS
                    .reportPrint
                    .buildFileUrl(
                        filePath
                    );

            }


            const normalized =
                String(
                    filePath ||
                    ''
                )
                    .split(
                        '/'
                    )
                    .filter(
                        Boolean
                    )
                    .map(
                        encodeURIComponent
                    )
                    .join(
                        '/'
                    );


            if (!normalized) {
                throw new Error(
                    'Đường dẫn file báo cáo không hợp lệ.'
                );
            }


            return (
                '/api/mcs/v1/files/' +
                normalized
            );
        }


        function downloadBlob(
            blob,
            fileName
        ) {

            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    'a'
                );


            link.href =
                url;


            link.download =
                fileName ||
                options.fileName ||
                'bao-cao';


            document.body
                .appendChild(
                    link
                );


            link.click();


            link.remove();


            window.setTimeout(
                () => {

                    URL.revokeObjectURL(
                        url
                    );

                },
                1000
            );
        }


        function getFileName(
            filePath
        ) {

            return (
                String(
                    filePath ||
                    ''
                )
                    .split(
                        '/'
                    )
                    .filter(
                        Boolean
                    )
                    .pop() ||
                options.fileName ||
                'bao-cao'
            );
        }


        /*
         * ==========================================
         * SINGLE SELECT
         * ==========================================
         */

        function setSingleSelectOptions(
            id,
            items,
            selectedValue = ''
        ) {

            const select =
                getSelect(
                    id
                );


            if (!select) {
                return;
            }


            select.innerHTML =
                '';


            const empty =
                document.createElement(
                    'option'
                );


            empty.value =
                '';

            empty.textContent =
                '';


            select.appendChild(
                empty
            );


            items.forEach(
                item => {

                    const option =
                        document.createElement(
                            'option'
                        );


                    option.value =
                        String(
                            item.value
                        );


                    option.textContent =
                        item.label ||
                        '-';


                    select.appendChild(
                        option
                    );

                }
            );


            refreshSmartSelect(
                select
            );


            setSingleSelectValue(
                id,
                selectedValue
            );
        }


        function setSingleSelectValue(
            id,
            value
        ) {

            const select =
                getSelect(
                    id
                );


            if (!select) {
                return;
            }


            const normalized =
                value ===
                    undefined ||
                value ===
                    null
                    ? ''
                    : String(
                        value
                    );


            select.value =
                normalized;


            const smartSelect =
                refreshSmartSelect(
                    select
                );


            smartSelect
                ?.setValue?.(
                    normalized,
                    false
                );
        }


        /*
         * ==========================================
         * MULTIPLE SELECT
         * ==========================================
         */

        function setMultipleSelectOptions(
            id,
            items,
            selectedValues = [],
            defaultAll = false
        ) {

            const select =
                getSelect(
                    id
                );


            if (!select) {
                return;
            }


            const selectedSet =
                new Set(
                    selectedValues.map(
                        value =>
                            String(
                                value
                            )
                    )
                );


            select.innerHTML =
                '';


            const allOption =
                document.createElement(
                    'option'
                );


            allOption.value =
                '__ALL__';


            allOption.textContent =
                'Tất cả';


            select.appendChild(
                allOption
            );


            items.forEach(
                item => {

                    if (
                        item.value ===
                            undefined ||
                        item.value ===
                            null
                    ) {
                        return;
                    }


                    const option =
                        document.createElement(
                            'option'
                        );


                    option.value =
                        String(
                            item.value
                        );


                    option.textContent =
                        item.label ||
                        '-';


                    option.selected =
                        selectedSet.has(
                            String(
                                item.value
                            )
                        );


                    select.appendChild(
                        option
                    );

                }
            );


            allOption.selected =
                selectedSet.size ===
                    0 &&
                defaultAll ===
                    true;


            const smartSelect =
                refreshSmartSelect(
                    select
                );


            if (
                selectedSet.size >
                0
            ) {

                smartSelect
                    ?.setValue?.(
                        Array.from(
                            selectedSet
                        ),
                        false
                    );

                return;
            }


            if (
                defaultAll ===
                true
            ) {

                smartSelect
                    ?.setValue?.(
                        [
                            '__ALL__'
                        ],
                        false
                    );

                return;
            }


            smartSelect
                ?.setValue?.(
                    [],
                    false
                );
        }


        function bindAllOptions(
            defaultMap = {}
        ) {

            Object.keys(
                defaultMap
            )
                .forEach(
                    id => {

                        bindAllOption(
                            id,
                            defaultMap[id] ===
                                true
                        );

                    }
                );
        }


        function bindAllOption(
            id,
            defaultAll = false
        ) {

            const select =
                getSelect(
                    id
                );


            if (
                !select ||
                select.dataset
                    .reportAllBound ===
                    'true'
            ) {
                return;
            }


            select.dataset
                .reportAllBound =
                'true';


            select.addEventListener(
                'change',
                () => {

                    const options =
                        Array.from(
                            select.options
                        );


                    const all =
                        options.find(
                            option =>
                                option.value ===
                                '__ALL__'
                        );


                    if (!all) {
                        return;
                    }


                    const selectedSpecific =
                        options.filter(
                            option =>
                                option.value !==
                                    '__ALL__' &&
                                option.selected
                        );


                    /*
                     * Có giá trị cụ thể
                     * thì bỏ "Tất cả".
                     */
                    if (
                        selectedSpecific.length >
                        0
                    ) {

                        all.selected =
                            false;

                    }


                    const selected =
                        options.filter(
                            option =>
                                option.selected
                        );


                    /*
                     * Không còn lựa chọn:
                     *
                     * - defaultAll=true
                     *   → quay về Tất cả
                     *
                     * - defaultAll=false
                     *   → giữ rỗng
                     */
                    if (
                        selected.length ===
                        0 &&
                        defaultAll ===
                        true
                    ) {

                        all.selected =
                            true;

                    }


                    refreshSmartSelect(
                        select
                    );


                    invalidateReport();

                }
            );
        }


        function resetMultiSelectToAll(
            id
        ) {

            const select =
                getSelect(
                    id
                );


            if (!select) {
                return;
            }


            Array
                .from(
                    select.options
                )
                .forEach(
                    option => {

                        option.selected =
                            option.value ===
                            '__ALL__';

                    }
                );


            refreshSmartSelect(
                select
            )
                ?.setValue?.(
                    [
                        '__ALL__'
                    ],
                    false
                );
        }


        function clearMultiSelect(
            id
        ) {

            const select =
                getSelect(
                    id
                );


            if (!select) {
                return;
            }


            Array
                .from(
                    select.options
                )
                .forEach(
                    option => {

                        option.selected =
                            false;

                    }
                );


            refreshSmartSelect(
                select
            )
                ?.setValue?.(
                    [],
                    false
                );
        }


        /*
         * ==========================================
         * GET SELECT VALUE
         * ==========================================
         */

        function getSelect(
            id
        ) {

            return root.querySelector(
                `#${id}`
            );
        }


        function getSingleNumber(
            id
        ) {

            const value =
                getSelect(
                    id
                )
                    ?.value;


            if (
                value ===
                    undefined ||
                value ===
                    null ||
                value ===
                    ''
            ) {
                return null;
            }


            const number =
                Number(
                    value
                );


            return Number.isFinite(
                number
            )
                ? number
                : null;
        }


        function getMultiValues(
            id
        ) {

            const select =
                getSelect(
                    id
                );


            if (!select) {
                return [];
            }


            return Array
                .from(
                    select.selectedOptions ||
                    []
                )
                .map(
                    option =>
                        option.value
                )
                .filter(
                    value =>
                        value &&
                        value !==
                            '__ALL__'
                );
        }


        function getMultiNumbers(
            id
        ) {

            return getMultiValues(
                id
            )
                .map(
                    Number
                )
                .filter(
                    Number.isFinite
                );
        }


        function refreshSmartSelect(
            select
        ) {

            if (!select) {
                return null;
            }


            const wrapper =
                select.closest(
                    '[data-smart-select]'
                );


            if (!wrapper) {
                return null;
            }


            const smartSelect =
                wrapper.smartSelect ||
                window.MCS
                    ?.smartSelect
                    ?.initialize?.(
                        wrapper
                    );


            smartSelect
                ?.refresh?.();


            return smartSelect;
        }


        /*
         * ==========================================
         * DATE
         * ==========================================
         */

        function getTodayDate() {

            const now =
                new Date();


            const parts =
                new Intl.DateTimeFormat(
                    'en-CA',
                    {
                        timeZone:
                            options.timeZone ||
                            DEFAULT_TIME_ZONE,

                        year:
                            'numeric',

                        month:
                            '2-digit',

                        day:
                            '2-digit'
                    }
                )
                    .formatToParts(
                        now
                    );


            const map =
                Object.fromEntries(
                    parts.map(
                        item => [
                            item.type,
                            item.value
                        ]
                    )
                );


            return (
                `${map.year}-${map.month}-${map.day}`
            );
        }


        function setDefaultDateRange(
            fromField = 'tuNgay',
            toField = 'denNgay'
        ) {

            const today =
                getTodayDate();


            setDateValue(
                fromField,
                `${today} 00:00:00`
            );


            setDateValue(
                toField,
                `${today} 23:59:59`
            );
        }


        function getDateValue(
            fieldName
        ) {

            const field =
                root.querySelector(
                    `[data-form-field="${fieldName}"]`
                );


            return String(
                field
                    ?.querySelector(
                        '[data-date-value]'
                    )
                    ?.value ||
                ''
            )
                .trim();
        }


        function setDateValue(
            fieldName,
            value
        ) {

            const field =
                root.querySelector(
                    `[data-form-field="${fieldName}"]`
                );


            if (!field) {
                return;
            }


            const hidden =
                field.querySelector(
                    '[data-date-value]'
                );


            const display =
                field.querySelector(
                    '[data-date-input]'
                );


            if (hidden) {

                hidden.value =
                    value;

            }


            const picker =
                field.datePicker ||
                field
                    .querySelector(
                        '[data-date-picker]'
                    )
                    ?.datePicker;


            if (
                picker
                    ?.setValue
            ) {

                picker.setValue(
                    value,
                    false
                );

                return;
            }


            /*
             * Fallback khi date picker
             * chưa expose instance.
             */
            if (display) {

                display.value =
                    value ||
                    '';

            }
        }


        function buildDateTime(
            value,
            endOfDay = false
        ) {

            const text =
                String(
                    value ||
                    ''
                )
                    .trim();


            const match =
                text.match(
                    /^(\d{4}-\d{2}-\d{2})/
                );


            if (!match) {
                throw new Error(
                    'Ngày không hợp lệ.'
                );
            }


            const date =
                match[1];


            const offset =
                options.offset ||
                DEFAULT_OFFSET;


            return (
                date +
                (
                    endOfDay
                        ? `T23:59:59${offset}`
                        : `T00:00:00${offset}`
                )
            );
        }


        /*
         * ==========================================
         * LOADING
         * ==========================================
         */

        function setLoading(
            value,
            message = null
        ) {

            state.loading =
                Boolean(
                    value
                );


            if (
                state.loading
            ) {

                window.MCS
                    ?.formLoading
                    ?.show(
                        root,
                        message ||
                        'Vui lòng chờ!'
                    );

            } else {

                window.MCS
                    ?.formLoading
                    ?.hide(
                        root
                    );

            }


            [
                elements.cancel,
                elements.download,
                elements.view
            ]
                .forEach(
                    button => {

                        if (button) {

                            button.disabled =
                                state.loading;

                        }

                    }
                );
        }

        function showError(
            error,
            fallbackMessage
        ) {

            console.error(
                error
            );


            window.MCS
                ?.toast
                ?.error?.(
                    error?.message ||
                    fallbackMessage
                );
        }


        /*
         * ==========================================
         * PUBLIC API
         * ==========================================
         */

        const api = {

            state,

            loadList,
            normalizeList,

            invalidateReport,

            setLoading,

            setSingleSelectOptions,
            setSingleSelectValue,

            setMultipleSelectOptions,
            bindAllOptions,
            bindAllOption,
            resetMultiSelectToAll,
            clearMultiSelect,

            getSingleNumber,
            getMultiValues,
            getMultiNumbers,

            getTodayDate,
            setDefaultDateRange,
            getDateValue,
            setDateValue,
            buildDateTime,

            refreshSmartSelect

        };


        return api;
    }


    window.MCS.baoCao = {
        create
    };

})();