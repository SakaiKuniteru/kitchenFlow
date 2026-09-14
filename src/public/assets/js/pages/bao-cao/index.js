'use strict';


document.addEventListener(
    'DOMContentLoaded',
    () => {

        const root =
            document.querySelector(
                '[data-report-catalog-page]'
            );


        if (!root) {
            return;
        }


        const navigation =
            window.MCS
                ?.navigation;


        const navigationItems =
            Array.isArray(
                window.MCS
                    ?.navigationItems
            )
                ? window.MCS
                    .navigationItems
                : [];

        const PAGE_PERMISSION = 'Q000037';
        const REPORT_GROUP_PREFIX = 'Báo cáo - ';

        const elements = {

            content:
                root.querySelector(
                    '[data-report-catalog-content]'
                ),

            groupNavigation:
                root.querySelector(
                    '[data-report-group-navigation]'
                ),

            groups:
                root.querySelector(
                    '[data-report-groups]'
                ),

            search:
                root.querySelector(
                    '#reportCatalogSearch'
                ),

            searchRoot:
                root
                    .querySelector(
                        '#reportCatalogSearch'
                    )
                    ?.closest(
                        '[data-search-picker]'
                    ),

            empty:
                root.querySelector(
                    '[data-report-empty]'
                ),

            noPermission:
                root.querySelector(
                    '[data-catalog-no-permission]'
                )

        };


        /*
         * ==========================================
         * CẤU HÌNH NHÓM
         * ==========================================
         *
         * Không chứa danh sách báo cáo.
         *
         * Báo cáo thật được lấy từ navigation.js.
         *
         * prefix chỉ dùng để xác định báo cáo
         * thuộc nhóm nào.
         * ==========================================
         */

        const state = {

            reports:
                [],

            groups:
                [],

            activeGroup:
                null,

            keyword:
                ''

        };


        initialize();


        /*
         * ==========================================
         * INITIALIZE
         * ==========================================
         */

        function initialize() {

            if (
                !navigation ||
                typeof navigation
                    .canAccess !==
                    'function' ||
                typeof navigation
                    .hasPermission !==
                    'function'
            ) {

                console.error(
                    'Không tìm thấy window.MCS.navigation.'
                );

                showNoPermission();

                return;
            }


            /*
             * ======================================
             * QUYỀN MỞ TRANG BÁO CÁO
             * ======================================
             */

            const canAccessPage =
                navigation
                    .hasPermission(
                        PAGE_PERMISSION
                    );


            if (
                !canAccessPage
            ) {

                showNoPermission();

                return;
            }


            /*
             * Có Q000037
             * => được phép mở trang.
             */

            hideNoPermission();


            /*
             * ======================================
             * QUYỀN TỪNG BÁO CÁO
             * ======================================
             *
             * Mỗi báo cáo vẫn lọc theo:
             *
             * Q003001
             * Q003002
             * ...
             *
             * từ navigation.js.
             */

            state.reports =
                getAllowedReports();


            state.groups =
                buildGroups(
                    state.reports
                );


            state.activeGroup =
                state.groups[0]
                    ?.key ||
                null;


            render();


            bindEvents();

        }

        function getAllowedReports() {

            return navigationItems

                .filter(
                    item => {

                        if (!item) {
                            return false;
                        }


                        const group =
                            String(
                                item.group ||
                                ''
                            )
                                .trim();


                        const url =
                            String(
                                item.url ||
                                ''
                            )
                                .trim();

                        if (
                            !group.startsWith(
                                REPORT_GROUP_PREFIX
                            )
                        ) {

                            return false;
                        }

                        if (
                            !/^\/bao-cao\/[^/]+$/i
                                .test(
                                    url
                                )
                        ) {

                            return false;
                        }


                        /*
                         * Quyền từng báo cáo vẫn
                         * lấy trực tiếp navigation.js.
                         */

                        return navigation
                            .canAccess(
                                item
                            );

                    }
                )

                .map(
                    item =>
                        normalizeReport(
                            item
                        )
                )

                .filter(
                    Boolean
                );

        }

        /*
         * ==========================================
         * NORMALIZE REPORT
         * ==========================================
         */

        function normalizeReport(
            item
        ) {

            const url =
                String(
                    item.url ||
                    ''
                )
                    .trim();


            const rawGroup =
                String(
                    item.group ||
                    ''
                )
                    .trim();


            const rawLabel =
                String(
                    item.label ||
                    ''
                )
                    .trim();


            /*
             * Ví dụ:
             *
             * group:
             * Báo cáo - Tài chính
             *
             * =>
             *
             * groupName:
             * Tài chính
             */

            const groupName =
                rawGroup
                    .startsWith(
                        REPORT_GROUP_PREFIX
                    )
                    ? rawGroup
                        .slice(
                            REPORT_GROUP_PREFIX
                                .length
                        )
                        .trim()
                    : rawGroup;


            if (
                !groupName
            ) {

                return null;
            }


            /*
             * Lấy mã từ đầu label trước tiên.
             *
             * Ví dụ:
             *
             * TC01. Báo cáo...
             */

            const labelCodeMatch =
                rawLabel.match(
                    /^([A-Za-z0-9_-]+)\.\s*/
                );


            const urlCode =
                url
                    .split('/')
                    .filter(
                        Boolean
                    )
                    .pop()
                    ?.toUpperCase() ||
                '';


            const code =
                String(
                    labelCodeMatch
                        ? labelCodeMatch[1]
                        : urlCode
                )
                    .trim()
                    .toUpperCase();


            if (!code) {
                return null;
            }


            const name =
                rawLabel
                    .replace(
                        new RegExp(
                            `^${escapeRegExp(code)}\\.\\s*`,
                            'i'
                        ),
                        ''
                    )
                    .trim() ||
                rawLabel ||
                code;


            /*
             * groupKey không dựa vào TC / VA / DH.
             *
             * Nó được sinh trực tiếp từ tên group.
             */

            const groupKey =
                createGroupKey(
                    groupName
                );


            return {

                code,

                name,

                label:
                    rawLabel,

                url,

                permission:
                    item.permission,

                groupName,

                groupKey

            };

        }

        /*
         * ==========================================
         * BUILD GROUP
         * ==========================================
         */

        function buildGroups(
            reports
        ) {

            const groupMap =
                new Map();


            reports
                .forEach(
                    report => {

                        const key =
                            report.groupKey;


                        if (
                            !groupMap.has(
                                key
                            )
                        ) {

                            groupMap.set(
                                key,
                                {

                                    key,

                                    label:
                                        report
                                            .groupName,

                                    reports:
                                        []

                                }
                            );

                        }


                        groupMap
                            .get(
                                key
                            )
                            .reports
                            .push(
                                report
                            );

                    }
                );


            return Array
                .from(
                    groupMap.values()
                )
                .map(
                    group => {

                        group.reports
                            .sort(
                                (
                                    left,
                                    right
                                ) =>
                                    left.code
                                        .localeCompare(
                                            right.code,
                                            'vi',
                                            {
                                                numeric:
                                                    true
                                            }
                                        )
                            );


                        return group;

                    }
                );

        }

        /*
         * ==========================================
         * RENDER
         * ==========================================
         */

        function render() {

            renderGroupNavigation();

            renderGroups();

            applySearch();

        }


        /*
         * ==========================================
         * RENDER CỘT TRÁI
         * ==========================================
         */

        function renderGroupNavigation() {

            if (
                !elements
                    .groupNavigation
            ) {

                return;
            }


            elements
                .groupNavigation
                .innerHTML =
                state.groups
                    .map(
                        group =>
                            buildGroupNavigationHtml(
                                group
                            )
                    )
                    .join('');

        }

        function buildGroupNavigationHtml(
            group
        ) {

            const active =
                group.key ===
                state.activeGroup;


            return `
                <button
                    type="button"
                    class="
                        report-catalog__group-nav-item
                        ${active ? 'is-active' : ''}
                    "
                    data-report-group-nav="${escapeHtml(group.key)}"
                >

                    <span
                        class="report-catalog__group-nav-icon">

                        <i
                            class="
                                fa-regular
                                fa-folder
                            "
                            aria-hidden="true">
                        </i>

                    </span>

                    <span
                        class="report-catalog__group-nav-label">
                        ${escapeHtml(group.label)}
                    </span>

                </button>
            `;

        }

        /*
         * ==========================================
         * RENDER CÁC NHÓM BÊN PHẢI
         * ==========================================
         */

        function renderGroups() {

            if (
                !elements.groups
            ) {

                return;
            }


            elements
                .groups
                .innerHTML =
                state.groups
                    .map(
                        group =>
                            buildGroupHtml(
                                group
                            )
                    )
                    .join('');

        }

        function buildGroupHtml(
            group
        ) {

            const rows =
                group.reports
                    .map(
                        report =>
                            buildReportHtml(
                                report
                            )
                    )
                    .join('');


            return `
                <section
                    class="report-catalog__group"
                    data-report-group="${escapeHtml(group.key)}"
                >

                    <button
                        type="button"
                        class="report-catalog__group-header"
                        data-report-group-toggle="${escapeHtml(group.key)}"
                        aria-expanded="true"
                    >

                        <span
                            class="report-catalog__group-title">

                            <span
                                class="report-catalog__group-icon">

                                <i
                                    class="
                                        fa-regular
                                        fa-folder-open
                                    "
                                    aria-hidden="true">
                                </i>

                            </span>

                            <strong>
                                ${escapeHtml(group.label)}
                            </strong>

                        </span>


                        <i
                            class="
                                fa-solid
                                fa-chevron-down
                                report-catalog__group-chevron
                            "
                            aria-hidden="true">
                        </i>

                    </button>


                    <div
                        class="report-catalog__report-list"
                        data-report-group-body="${escapeHtml(group.key)}">

                        ${rows}

                    </div>

                </section>
            `;

        }

        /*
         * ==========================================
         * REPORT ROW
         * ==========================================
         */

        function buildReportHtml(
            report
        ) {

            return `
                <a
                    href="${escapeHtml(report.url)}"
                    class="report-catalog__report-row"
                    data-report-item
                    data-report-code="${escapeHtml(report.code)}"
                    data-report-name="${escapeHtml(report.name)}"
                    data-report-group-key="${escapeHtml(report.groupKey)}"
                >

                    <strong
                        class="report-catalog__report-code">
                        ${escapeHtml(report.code)}.
                    </strong>

                    <span
                        class="report-catalog__report-name">
                        ${escapeHtml(report.name)}
                    </span>

                    <i
                        class="
                            fa-solid
                            fa-chevron-right
                            report-catalog__report-arrow
                        "
                        aria-hidden="true">
                    </i>

                </a>
            `;

        }


        /*
         * ==========================================
         * EVENT
         * ==========================================
         */

        function bindEvents() {

            /*
             * ======================================
             * CLICK NHÓM BÊN TRÁI
             * ======================================
             */

            elements
                .groupNavigation
                ?.addEventListener(
                    'click',
                    event => {

                        const button =
                            event.target
                                .closest(
                                    '[data-report-group-nav]'
                                );


                        if (!button) {
                            return;
                        }


                        const key =
                            button.dataset
                                .reportGroupNav;


                        selectGroup(
                            key
                        );

                    }
                );


            /*
             * ======================================
             * COLLAPSE NHÓM
             * ======================================
             */

            elements
                .groups
                ?.addEventListener(
                    'click',
                    event => {

                        const button =
                            event.target
                                .closest(
                                    '[data-report-group-toggle]'
                                );


                        if (!button) {
                            return;
                        }


                        toggleGroup(
                            button.dataset
                                .reportGroupToggle
                        );

                    }
                );


            /*
             * ======================================
             * SEARCH
             * ======================================
             */

            elements
                .search
                ?.addEventListener(
                    'input',
                    event => {

                        state.keyword =
                            normalizeText(
                                event.target
                                    .value
                            );


                        applySearch();

                    }
                );


            /*
             * Clear của forms/search.
             */

            elements
                .searchRoot
                ?.querySelector(
                    '[data-search-picker-clear]'
                )
                ?.addEventListener(
                    'click',
                    () => {

                        if (
                            elements.search
                        ) {

                            elements
                                .search
                                .value =
                                '';

                        }


                        state.keyword =
                            '';


                        applySearch();

                    }
                );

        }


        /*
         * ==========================================
         * CHỌN NHÓM CỘT TRÁI
         * ==========================================
         *
         * Yêu cầu:
         *
         * bấm nhóm nào
         * => nhóm đó lên đầu vùng danh sách.
         * ==========================================
         */

        function selectGroup(
            key
        ) {

            const section =
                elements
                    .groups
                    ?.querySelector(
                        `[data-report-group="${cssEscape(key)}"]`
                    );


            if (!section) {
                return;
            }


            /*
             * Nếu nhóm đang đóng thì mở trước.
             */

            setGroupExpanded(
                key,
                true
            );


            state.activeGroup =
                key;


            updateActiveGroupNavigation();


            const top =
                section.offsetTop -
                elements.groups.offsetTop;


            elements
                .groups
                .scrollTo({
                    top:
                        Math.max(
                            0,
                            top
                        ),

                    behavior:
                        'smooth'
                });

        }


        function updateActiveGroupNavigation() {

            elements
                .groupNavigation
                ?.querySelectorAll(
                    '[data-report-group-nav]'
                )
                .forEach(
                    button => {

                        button
                            .classList
                            .toggle(
                                'is-active',
                                button.dataset
                                    .reportGroupNav ===
                                    state.activeGroup
                            );

                    }
                );

        }


        /*
         * ==========================================
         * COLLAPSE / EXPAND
         * ==========================================
         */

        function toggleGroup(
            key
        ) {

            const section =
                elements
                    .groups
                    ?.querySelector(
                        `[data-report-group="${cssEscape(key)}"]`
                    );


            const button =
                section
                    ?.querySelector(
                        '[data-report-group-toggle]'
                    );


            if (
                !section ||
                !button
            ) {

                return;
            }


            const expanded =
                button
                    .getAttribute(
                        'aria-expanded'
                    ) !==
                'false';


            setGroupExpanded(
                key,
                !expanded
            );

        }


        function setGroupExpanded(
            key,
            expanded
        ) {

            const section =
                elements
                    .groups
                    ?.querySelector(
                        `[data-report-group="${cssEscape(key)}"]`
                    );


            if (!section) {
                return;
            }


            const button =
                section.querySelector(
                    '[data-report-group-toggle]'
                );


            const body =
                section.querySelector(
                    '[data-report-group-body]'
                );


            if (
                !button ||
                !body
            ) {

                return;
            }


            button
                .setAttribute(
                    'aria-expanded',
                    expanded
                        ? 'true'
                        : 'false'
                );


            body.hidden =
                !expanded;


            section
                .classList
                .toggle(
                    'is-collapsed',
                    !expanded
                );

        }


        /*
         * ==========================================
         * SEARCH
         * ==========================================
         */

        function applySearch() {

            const keyword =
                state.keyword;


            const reportRows =
                Array.from(
                    elements
                        .groups
                        ?.querySelectorAll(
                            '[data-report-item]'
                        ) ||
                    []
                );


            reportRows
                .forEach(
                    row => {

                        const value =
                            normalizeText(
                                [
                                    row.dataset
                                        .reportCode,
                                    row.dataset
                                        .reportName
                                ]
                                    .filter(
                                        Boolean
                                    )
                                    .join(' ')
                            );


                        row.hidden =
                            Boolean(
                                keyword
                            ) &&
                            !value.includes(
                                keyword
                            );

                    }
                );


            let visibleGroups =
                0;


            elements
                .groups
                ?.querySelectorAll(
                    '[data-report-group]'
                )
                .forEach(
                    section => {

                        const visibleReports =
                            Array.from(
                                section
                                    .querySelectorAll(
                                        '[data-report-item]'
                                    )
                            )
                                .filter(
                                    row =>
                                        row.hidden !==
                                        true
                                );


                        const visible =
                            visibleReports
                                .length >
                            0;


                        section.hidden =
                            !visible;


                        const key =
                            section.dataset
                                .reportGroup;


                        const navButton =
                            elements
                                .groupNavigation
                                ?.querySelector(
                                    `[data-report-group-nav="${cssEscape(key)}"]`
                                );


                        if (
                            navButton
                        ) {

                            navButton.hidden =
                                !visible;

                        }


                        if (visible) {

                            visibleGroups++;

                            /*
                             * Search đang chạy thì mở
                             * group để nhìn thấy kết quả.
                             */

                            if (
                                keyword
                            ) {

                                setGroupExpanded(
                                    key,
                                    true
                                );

                            }

                        }

                    }
                );


            if (
                elements.empty
            ) {

                elements.empty.hidden =
                    visibleGroups >
                    0;

            }

        }


        /*
         * ==========================================
         * PERMISSION
         * ==========================================
         */

        function showNoPermission() {

            const pageContent =
                root.closest(
                    '.page-content'
                ) ||
                document.querySelector(
                    '.page-content'
                );


            const noPermission =
                elements.noPermission ||
                document.querySelector(
                    '[data-catalog-no-permission]'
                );


            if (
                !pageContent ||
                !noPermission
            ) {

                return;
            }


            /*
             * Nhớ parent ban đầu để khi có quyền
             * có thể đưa form về đúng vị trí.
             */

            if (
                !noPermission
                    ._mcsOriginalParent
            ) {

                noPermission
                    ._mcsOriginalParent =
                    noPermission
                        .parentElement;

            }


            /*
             * Đưa form không đủ quyền trực tiếp
             * ra page-content.
             *
             * Không để nó nằm trong layout
             * report-catalog.
             */

            if (
                noPermission.parentElement !==
                pageContent
            ) {

                pageContent
                    .appendChild(
                        noPermission
                    );

            }


            root
                .classList
                .add(
                    'is-permission-hidden'
                );


            noPermission.hidden =
                false;


            document
                .documentElement
                .classList
                .add(
                    'catalog-permission-denied'
                );


            document
                .body
                .classList
                .add(
                    'catalog-permission-denied'
                );


            root.dataset
                .permissionDenied =
                'true';

        }


        function hideNoPermission() {

            const pageContent =
                root.closest(
                    '.page-content'
                ) ||
                document.querySelector(
                    '.page-content'
                );


            const noPermission =
                pageContent
                    ?.querySelector(
                        ':scope > [data-catalog-no-permission]'
                    ) ||
                elements.noPermission ||
                document.querySelector(
                    '[data-catalog-no-permission]'
                );


            if (
                noPermission
            ) {

                noPermission.hidden =
                    true;


                const originalParent =
                    noPermission
                        ._mcsOriginalParent;


                if (
                    originalParent &&
                    originalParent
                        .isConnected
                ) {

                    originalParent
                        .appendChild(
                            noPermission
                        );

                }

            }


            root
                .classList
                .remove(
                    'is-permission-hidden'
                );


            document
                .documentElement
                .classList
                .remove(
                    'catalog-permission-denied'
                );


            document
                .body
                .classList
                .remove(
                    'catalog-permission-denied'
                );


            delete root.dataset
                .permissionDenied;

        }

        function createGroupKey(
            value
        ) {

            return normalizeText(
                value
            )
                .replace(
                    /[^a-z0-9]+/g,
                    '-'
                )
                .replace(
                    /^-+|-+$/g,
                    ''
                );

        }

        /*
         * ==========================================
         * TEXT NORMALIZE
         * ==========================================
         */

        function normalizeText(
            value
        ) {

            return String(
                value ||
                ''
            )
                .normalize(
                    'NFD'
                )
                .replace(
                    /[\u0300-\u036f]/g,
                    ''
                )
                .replace(
                    /đ/g,
                    'd'
                )
                .replace(
                    /Đ/g,
                    'D'
                )
                .toLowerCase()
                .trim();

        }


        /*
         * ==========================================
         * ESCAPE HTML
         * ==========================================
         */

        function escapeHtml(
            value
        ) {

            return String(
                value ??
                ''
            )
                .replace(
                    /&/g,
                    '&amp;'
                )
                .replace(
                    /</g,
                    '&lt;'
                )
                .replace(
                    />/g,
                    '&gt;'
                )
                .replace(
                    /"/g,
                    '&quot;'
                )
                .replace(
                    /'/g,
                    '&#039;'
                );

        }


        function escapeRegExp(
            value
        ) {

            return String(
                value ||
                ''
            )
                .replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                );

        }


        function cssEscape(
            value
        ) {

            if (
                window.CSS &&
                typeof window.CSS
                    .escape ===
                    'function'
            ) {

                return window.CSS
                    .escape(
                        String(
                            value
                        )
                    );

            }


            return String(
                value ||
                ''
            )
                .replace(
                    /"/g,
                    '\\"'
                );

        }

    }
);