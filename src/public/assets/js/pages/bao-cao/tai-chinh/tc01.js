'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-tc01-page]'
            );


        if (!root) {
            return;
        }


        const API = {

            baoCao:
                '/api/mcs/v1/bao-cao/tai-chinh/tc01',

            coSo:
                '/api/mcs/v1/dm-co-so/tong-hop?active=true',

            nhaAn:
                '/api/mcs/v1/dm-nha-an/tong-hop?active=true',

            caAn:
                '/api/mcs/v1/dm-ca-an/tong-hop?active=true',

            taiKhoan:
                '/api/mcs/v1/dm-tai-khoan/tong-hop?active=true',

            loaiThoiGian:
                '/api/mcs/v1/enums?name=loaiThoiGian',

            doiTuong:
                '/api/mcs/v1/enums?name=doiTuongLayVe',

            hinhThucThanhToan:
                '/api/mcs/v1/enums?name=phuongThucThanhToan',

            thuChi:
                '/api/mcs/v1/enums?name=thuChi',

            trangThaiThanhToan:
                '/api/mcs/v1/enums?name=trangThaiThanhToan',

            trangThaiSuDung:
                '/api/mcs/v1/enums?name=trangThaiVe'

        };

        const MULTI_SELECT_DEFAULTS =
            Object.freeze({

                coSoIds:
                    true,

                nhaAnIds:
                    false,

                doiTuong:
                    true,

                /*
                * Người tạo / Thu ngân
                * để trống để người dùng tự chọn.
                */
                nguoiTaoIds:
                    false,

                thuNganIds:
                    false,

                hinhThucThanhToan:
                    true,

                hienThiThuChi:
                    true,

                trangThaiThanhToan:
                    true,

                caAnIds:
                    true,

                trangThaiSuDung:
                    true

            });


        const state = {

            coSo:
                [],

            nhaAn:
                [],

            caAn:
                [],

            taiKhoan:
                [],


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

            loading:
                root.querySelector(
                    '[data-report-loading]'
                )

        };


        initialize();


        /*
         * ==========================================
         * INIT
         * ==========================================
         */

        async function initialize() {

            bindEvents();


            try {

                setLoading(
                    true
                );


                const [
                    loaiThoiGian,
                    coSo,
                    nhaAn,
                    doiTuong,
                    taiKhoan,
                    hinhThucThanhToan,
                    thuChi,
                    trangThaiThanhToan,
                    caAn,
                    trangThaiSuDung
                ] =
                    await Promise.all([

                        loadList(
                            API.loaiThoiGian
                        ),

                        loadList(
                            API.coSo
                        ),

                        loadList(
                            API.nhaAn
                        ),

                        loadList(
                            API.doiTuong
                        ),

                        loadList(
                            API.taiKhoan
                        ),

                        loadList(
                            API.hinhThucThanhToan
                        ),

                        loadList(
                            API.thuChi
                        ),

                        loadList(
                            API.trangThaiThanhToan
                        ),

                        loadList(
                            API.caAn
                        ),

                        loadList(
                            API.trangThaiSuDung
                        )

                    ]);


                state.coSo =
                    coSo;

                state.nhaAn =
                    nhaAn;

                state.caAn =
                    caAn;

                state.taiKhoan =
                    taiKhoan;


                /*
                 * Loại thời gian TC01
                 * chỉ lấy:
                 *
                 * 10 = thời gian tạo
                 * 30 = thời gian thanh toán
                 * 40 = thời gian hoàn
                 */
                setSingleSelectOptions(
                    'loaiThoiGian',

                    loaiThoiGian
                        .filter(
                            item =>
                                [
                                    10,
                                    30,
                                    40
                                ].includes(
                                    Number(
                                        item.value
                                    )
                                )
                        )
                        .map(
                            item => ({
                                value:
                                    item.value,

                                label:
                                    item.name
                            })
                        ),

                    30
                );

                setMultipleSelectOptions(
                    'coSoIds',

                    coSo.map(
                        item => ({
                            value:
                                item.id,

                            label:
                                item.tenCoSo ||
                                item.ten ||
                                '-'
                        })
                    ),

                    [],

                    MULTI_SELECT_DEFAULTS
                        .coSoIds
                );

                renderNhaAn();

                setMultipleSelectOptions(
                    'doiTuong',

                    doiTuong.map(
                        item => ({
                            value:
                                item.value,

                            label:
                                item.name
                        })
                    ),

                    [],

                    MULTI_SELECT_DEFAULTS
                        .doiTuong
                );


                const taiKhoanOptions =
                    taiKhoan.map(
                        item => ({
                            value:
                                item.id,

                            label:
                                buildTaiKhoanLabel(
                                    item
                                )
                        })
                    );


                setMultipleSelectOptions(
                    'nguoiTaoIds',
                    taiKhoanOptions,
                    [],
                    MULTI_SELECT_DEFAULTS
                        .nguoiTaoIds
                );


                setMultipleSelectOptions(
                    'thuNganIds',
                    taiKhoanOptions,
                    [],
                    MULTI_SELECT_DEFAULTS
                        .thuNganIds
                );


                setMultipleSelectOptions(
                    'hinhThucThanhToan',

                    hinhThucThanhToan.map(
                        item => ({
                            value:
                                item.value,

                            label:
                                item.name
                        })
                    ),

                    [],

                    MULTI_SELECT_DEFAULTS
                        .hinhThucThanhToan
                );


                setMultipleSelectOptions(
                    'hienThiThuChi',

                    thuChi.map(
                        item => ({
                            value:
                                item.value,

                            label:
                                item.name
                        })
                    ),

                    [],

                    MULTI_SELECT_DEFAULTS
                        .hienThiThuChi
                );


                setMultipleSelectOptions(
                    'trangThaiThanhToan',

                    trangThaiThanhToan.map(
                        item => ({
                            value:
                                item.value,

                            label:
                                item.name
                        })
                    ),

                    [],

                    MULTI_SELECT_DEFAULTS
                        .trangThaiThanhToan
                );


                setMultipleSelectOptions(
                    'caAnIds',

                    caAn.map(
                        item => ({
                            value:
                                item.id,

                            label:
                                item.tenCaAn ||
                                item.ten ||
                                '-'
                        })
                    ),

                    [],

                    MULTI_SELECT_DEFAULTS
                        .caAnIds
                );


                setMultipleSelectOptions(
                    'trangThaiSuDung',

                    trangThaiSuDung.map(
                        item => ({
                            value:
                                item.value,

                            label:
                                item.name
                        })
                    ),

                    [],

                    MULTI_SELECT_DEFAULTS
                        .trangThaiSuDung
                );

                bindAllOptions();
                setDefaultDates();

            } catch (
                error
            ) {

                console.error(
                    error
                );


                window.MCS
                    ?.toast
                    ?.error?.(
                        error?.message ||
                        'Không thể tải dữ liệu bộ lọc báo cáo.'
                    );

            } finally {

                setLoading(
                    false
                );

            }
        }


        /*
         * ==========================================
         * EVENTS
         * ==========================================
         */

        function bindEvents() {

            elements.cancel
                ?.addEventListener(
                    'click',
                    reset
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


            root
                .querySelector(
                    '#coSoIds'
                )
                ?.addEventListener(
                    'change',
                    () => {

                        state.lastReport =
                            null;

                        state.lastPayloadKey =
                            null;

                        renderNhaAn();

                    }
                );


            elements.form
                ?.addEventListener(
                    'change',
                    () => {

                        state.lastReport =
                            null;

                        state.lastPayloadKey =
                            null;

                    }
                );
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
         * NHÀ ĂN THEO CƠ SỞ
         * ==========================================
         */

        function renderNhaAn() {

            const coSoIds =
                getMultiValues(
                    'coSoIds'
                );


            const selected =
                getMultiValues(
                    'nhaAnIds'
                );


            let records =
                state.nhaAn;


            /*
             * Không chọn cơ sở
             * => hiển thị toàn bộ nhà ăn.
             */
            if (
                coSoIds.length >
                0
            ) {

                const set =
                    new Set(
                        coSoIds.map(
                            String
                        )
                    );


                records =
                    state.nhaAn.filter(
                        item =>
                            set.has(
                                String(
                                    item.coSoId ??
                                    item.co_so_id ??
                                    ''
                                )
                            )
                    );

            }


            const validIds =
                new Set(
                    records.map(
                        item =>
                            String(
                                item.id
                            )
                    )
                );


            const preserved =
                selected.filter(
                    value =>
                        validIds.has(
                            String(
                                value
                            )
                        )
                );

                setMultipleSelectOptions(
                    'nhaAnIds',

                    records.map(
                        item => ({
                            value:
                                item.id,

                            label:
                                item.tenNhaAn ||
                                item.ten ||
                                '-'
                        })
                    ),

                    preserved,

                    preserved.length === 0
                        ? MULTI_SELECT_DEFAULTS
                            .nhaAnIds
                        : false
                );
        }


        /*
         * ==========================================
         * BUILD FILTER
         * ==========================================
         */

        function getFilters() {

            const loaiThoiGian =
                getSingleNumber(
                    'loaiThoiGian'
                );


            const tuNgay =
                getDateValue(
                    'tuNgay'
                );


            const denNgay =
                getDateValue(
                    'denNgay'
                );


            if (
                !loaiThoiGian
            ) {
                throw new Error(
                    'Vui lòng chọn loại thời gian.'
                );
            }


            if (
                !tuNgay
            ) {
                throw new Error(
                    'Vui lòng chọn từ ngày.'
                );
            }


            if (
                !denNgay
            ) {
                throw new Error(
                    'Vui lòng chọn đến ngày.'
                );
            }

            const tuNgayIso =
                buildDateTime(
                    tuNgay,
                    false
                );


            const denNgayIso =
                buildDateTime(
                    denNgay,
                    true
                );


            if (
                new Date(
                    tuNgayIso
                ).getTime() >
                new Date(
                    denNgayIso
                ).getTime()
            ) {
                throw new Error(
                    'Từ ngày không được lớn hơn đến ngày.'
                );
            }

            return {

                loaiThoiGian,

                tuNgay:
                    tuNgayIso,

                denNgay:
                    denNgayIso,

                coSoIds:
                    getMultiNumbers(
                        'coSoIds'
                    ),

                nhaAnIds:
                    getMultiNumbers(
                        'nhaAnIds'
                    ),

                doiTuong:
                    getMultiNumbers(
                        'doiTuong'
                    ),

                nguoiTaoIds:
                    getMultiNumbers(
                        'nguoiTaoIds'
                    ),

                thuNganIds:
                    getMultiNumbers(
                        'thuNganIds'
                    ),

                hinhThucThanhToan:
                    getMultiNumbers(
                        'hinhThucThanhToan'
                    ),

                hienThiThuChi:
                    getMultiNumbers(
                        'hienThiThuChi'
                    ),

                trangThaiThanhToan:
                    getMultiNumbers(
                        'trangThaiThanhToan'
                    ),

                caAnIds:
                    getMultiNumbers(
                        'caAnIds'
                    ),

                trangThaiSuDung:
                    getMultiNumbers(
                        'trangThaiSuDung'
                    )

            };
        }

        function buildDateTime(
            value,
            endOfDay
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


            return (
                date +
                (
                    endOfDay
                        ? 'T23:59:59+07:00'
                        : 'T00:00:00+07:00'
                )
            );
        }

        /*
         * ==========================================
         * CALL TC01
         * ==========================================
         */

        async function taoBaoCao(
            payload
        ) {

            const response =
                await window.MCS
                    .api
                    .request(
                        API.baoCao,
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


            if (
                !report
            ) {
                throw new Error(
                    'API không trả về thông tin báo cáo.'
                );
            }


            if (
                !report.file
            ) {
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
                    getFilters();


                /*
                 * Mở tab ngay từ click
                 * để tránh popup blocker.
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


                if (
                    !report.file
                        ?.pdf
                ) {
                    throw new Error(
                        'Báo cáo không có file PDF.'
                    );
                }


                const file =
                    await window.MCS
                        .api
                        .requestFile(
                            buildFileUrl(
                                report.file.pdf
                            ),
                            {
                                method:
                                    'GET'
                            }
                        );


                if (
                    !file?.blob
                ) {
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


                window.MCS
                    ?.toast
                    ?.error?.(
                        error?.message ||
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
                    getFilters();


                const payloadKey =
                    JSON.stringify(
                        payload
                    );


                setLoading(
                    true
                );


                /*
                 * Nếu vừa Xem cùng bộ lọc
                 * thì dùng luôn file đã sinh.
                 *
                 * Không gọi API lần thứ 2.
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


                if (
                    !filePath
                ) {
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


                if (
                    !file?.blob
                ) {
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

                window.MCS
                    ?.toast
                    ?.error?.(
                        error?.message ||
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
             * Theo định dạng cấu hình:
             *
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


            if (
                !normalized
            ) {
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
                'tc01';


            document.body.appendChild(
                link
            );


            link.click();

            link.remove();


            window.setTimeout(
                () =>
                    URL.revokeObjectURL(
                        url
                    ),
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
                'tc01'
            );
        }


        /*
         * ==========================================
         * RESET / HỦY
         * ==========================================
         */

        function reset() {

            state.lastReport =
                null;

            state.lastPayloadKey =
                null;


            /*
            * Loại thời gian mặc định:
            * 30 = Theo thời gian thanh toán.
            */
            setSingleSelectValue(
                'loaiThoiGian',
                30
            );


            /*
            * Những field mặc định Tất cả.
            */
            Object.entries(
                MULTI_SELECT_DEFAULTS
            )
                .forEach(
                    ([
                        id,
                        defaultAll
                    ]) => {

                        if (
                            defaultAll ===
                            true
                        ) {

                            resetMultiSelectToAll(
                                id
                            );

                            return;
                        }


                        clearMultiSelect(
                            id
                        );

                    }
                );


            /*
            * Ngày hiện tại.
            */
            setDefaultDates();


            /*
            * Cơ sở thay đổi có thể
            * ảnh hưởng danh sách Nhà ăn.
            */
            renderNhaAn();
        }

        /*
         * ==========================================
         * SELECT HELPERS
         * ==========================================
         */

        function setSingleSelectOptions(
            id,
            options,
            selectedValue = ''
        ) {

            const select =
                root.querySelector(
                    `#${id}`
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


            options.forEach(
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

        function setMultipleSelectOptions(
            id,
            options,
            selectedValues = [],
            defaultAll = false
        ) {

            const select =
                root.querySelector(
                    `#${id}`
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


            /*
            * Luôn có lựa chọn "Tất cả".
            *
            * defaultAll chỉ quyết định
            * có chọn nó mặc định hay không.
            */
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


            options.forEach(
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


            /*
            * Chỉ chọn "Tất cả"
            * khi field được cấu hình defaultAll.
            */
            if (
                selectedSet.size ===
                    0 &&
                defaultAll ===
                    true
            ) {

                allOption.selected =
                    true;

            } else {

                allOption.selected =
                    false;

            }


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


            /*
            * Không mặc định Tất cả.
            * Smart select sẽ hiển thị placeholder.
            */
            smartSelect
                ?.setValue?.(
                    [],
                    false
                );
        }

        function bindAllOptions() {

            [
                'coSoIds',
                'nhaAnIds',
                'doiTuong',
                'nguoiTaoIds',
                'thuNganIds',
                'hinhThucThanhToan',
                'hienThiThuChi',
                'trangThaiThanhToan',
                'caAnIds',
                'trangThaiSuDung'
            ]
                .forEach(
                    bindAllOption
                );
        }


        function bindAllOption(
            id
        ) {

            const select =
                root.querySelector(
                    `#${id}`
                );


            if (
                !select ||
                select.dataset
                    .allOptionBound ===
                    'true'
            ) {
                return;
            }


            select.dataset
                .allOptionBound =
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


                    if (
                        selected.length ===
                        0
                    ) {

                        all.selected =
                            true;

                    }


                    if (
                        all.selected &&
                        selected.length >
                            1
                    ) {

                        options.forEach(
                            option => {

                                option.selected =
                                    option.value ===
                                    '__ALL__';

                            }
                        );

                    }


                    refreshSmartSelect(
                        select
                    );
                }
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


        function setSingleSelectValue(
            id,
            value
        ) {

            const select =
                root.querySelector(
                    `#${id}`
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


        function resetMultiSelectToAll(
            id
        ) {

            const select =
                root.querySelector(
                    `#${id}`
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


            const smartSelect =
                refreshSmartSelect(
                    select
                );


            smartSelect
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
                root.querySelector(
                    `#${id}`
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


            const smartSelect =
                refreshSmartSelect(
                    select
                );


            smartSelect
                ?.setValue?.(
                    [],
                    false
                );
        }

        function getSingleNumber(
            id
        ) {

            const value =
                root.querySelector(
                    `#${id}`
                )
                    ?.value;


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
                root.querySelector(
                    `#${id}`
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

        function getTodayDate() {

            const now =
                new Date();


            const parts =
                new Intl.DateTimeFormat(
                    'en-CA',
                    {
                        timeZone:
                            'Asia/Ho_Chi_Minh',

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

        function setDefaultDates() {

            const today =
                getTodayDate();


            setDateValue(
                'tuNgay',
                `${today} 00:00:00`
            );


            setDateValue(
                'denNgay',
                `${today} 23:59:59`
            );
        }

        /*
         * ==========================================
         * DATE
         * ==========================================
         */

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


            if (
                display &&
                !value
            ) {
                display.value =
                    '';
            }


            const picker =
                field.datePicker ||
                field
                    .querySelector(
                        '[data-date-picker]'
                    )
                    ?.datePicker;


            picker
                ?.setValue?.(
                    value,
                    false
                );
        }


        /*
         * ==========================================
         * LABEL
         * ==========================================
         */

        function buildTaiKhoanLabel(
            item
        ) {

            const hoTen =
                item.hoTenNhanVien ||
                item.hoTen ||
                item.tenNhanVien ||
                '';


            const tenDangNhap =
                item.tenDangNhap ||
                item.ten_dang_nhap ||
                '';


            if (
                hoTen &&
                tenDangNhap
            ) {

                return (
                    `${hoTen} (${tenDangNhap})`
                );

            }


            return (
                hoTen ||
                tenDangNhap ||
                `Tài khoản #${item.id}`
            );
        }


        /*
         * ==========================================
         * LOADING
         * ==========================================
         */

        function setLoading(
            value
        ) {

            state.loading =
                Boolean(
                    value
                );


            if (
                elements.loading
            ) {

                elements.loading.hidden =
                    !state.loading;

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

    }
);