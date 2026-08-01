"use strict";


window.MCS =
    window.MCS || {};


window.MCS.catalog =
    window.MCS.catalog || {};


class MCSTable {

    constructor(
        root,
        options = {}
    ) {

        this.root =
            typeof root === "string"
                ? document.querySelector(
                    root
                )
                : root;

        this.options = {

            columns:
                [],

            showIndex:
                true,

            showActions:
                true,

            selectable:
                false,

            rowKey:
                "id",

            statusKey:
                "active",

            emptyTitle:
                "Không có dữ liệu",

            emptyDescription:
                "Chưa có bản ghi nào để hiển thị.",

            emptyIcon:
                "inbox",

            statusLabels: {

                true:
                    "Đang hoạt động",

                false:
                    "Đã khóa"

            },

            onRowClick:
                null,

            onAction:
                null,

            ...options

        };

        this.body =
            this.root?.querySelector(
                "[data-catalog-table-body]"
            );

        this.loading =
            this.root?.querySelector(
                "[data-table-loading]"
            );

        this.data =
            [];

        this.selectedId =
            null;

        this.sort = {
            key:
                null,

            direction:
                "none"
        };

        this.bindEvents();

    }


    bindEvents() {

        if (!this.root) {
            return;
        }

        this.root.addEventListener(
            "click",
            event => {

                const actionButton =
                    event.target.closest(
                        "[data-action]"
                    );

                if (actionButton) {

                    event.stopPropagation();

                    const action =
                        actionButton.dataset
                            .action;

                    const recordId =
                        actionButton.dataset
                            .recordId;

                    this.options.onAction?.(
                        action,
                        recordId
                    );

                    this.closeActionMenus();

                    return;

                }

                const actionTrigger =
                    event.target.closest(
                        "[data-action-menu-trigger]"
                    );

                if (actionTrigger) {

                    event.stopPropagation();

                    this.toggleActionMenu(
                        actionTrigger
                    );

                    return;

                }

                const sortButton =
                    event.target.closest(
                        "[data-sort-key]"
                    );

                if (sortButton) {

                    this.toggleSort(
                        sortButton.dataset
                            .sortKey
                    );

                    return;

                }

                const row =
                    event.target.closest(
                        "tr[data-record-id]"
                    );

                if (!row) {
                    return;
                }

                const recordId =
                    row.dataset.recordId;

                this.selectRow(
                    recordId
                );

                const record =
                    this.getRecord(
                        recordId
                    );

                this.options.onRowClick?.(
                    record,
                    row
                );

            }
        );

        document.addEventListener(
            "click",
            event => {

                if (
                    !event.target.closest(
                        "[data-action-menu]"
                    )
                ) {

                    this.closeActionMenus();

                }

            }
        );

        window.addEventListener(
            "scroll",
            () => {

                this.closeActionMenus();

            },
            true
        );

        window.addEventListener(
            "resize",
            () => {

                this.closeActionMenus();

            }
        );

    }


    setData(data) {

        this.data =
            Array.isArray(data)
                ? data
                : [];

        this.render();

    }


    getData() {

        return this.data;

    }


    getRecord(id) {

        return this.data.find(
            item =>
                String(
                    item[
                        this.options.rowKey
                    ]
                ) === String(id)
        ) || null;

    }


    render() {

        if (!this.body) {
            return;
        }

        this.body.innerHTML =
            "";

        if (
            this.data.length === 0
        ) {

            this.showEmpty();

            return;

        }

        const fragment =
            document.createDocumentFragment();

        this.data.forEach(
            (
                record,
                index
            ) => {

                fragment.appendChild(
                    this.createRow(
                        record,
                        index
                    )
                );

            }
        );

        this.body.appendChild(
            fragment
        );

    }


    createRow(
        record,
        index
    ) {

        const row =
            document.createElement(
                "tr"
            );

        const recordId =
            record[
                this.options.rowKey
            ];

        row.dataset.recordId =
            recordId;

        if (
            String(recordId) ===
            String(this.selectedId)
        ) {

            row.classList.add(
                "is-selected"
            );

        }

        if (
            record.active === false
        ) {

            row.classList.add(
                "is-disabled"
            );

        }

        if (
            this.options.selectable
        ) {

            const cell =
                document.createElement(
                    "td"
                );

            cell.className =
                "catalog-table__cell " +
                "catalog-table__cell--checkbox";

            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.dataset
                .rowCheckbox =
                recordId;

            checkbox.addEventListener(
                "click",
                event =>
                    event.stopPropagation()
            );

            cell.appendChild(
                checkbox
            );

            row.appendChild(
                cell
            );

        }

        if (
            this.options.showIndex
        ) {

            const indexCell =
                document.createElement(
                    "td"
                );

            indexCell.className =
                "catalog-table__cell " +
                "catalog-table__cell--index";

            indexCell.textContent =
                this.getDisplayIndex(
                    index
                );

            row.appendChild(
                indexCell
            );

        }

        this.options.columns.forEach(
            column => {

                const cell =
                    document.createElement(
                        "td"
                    );

                cell.className =
                    [
                        "catalog-table__cell",
                        column.className || ""
                    ]
                        .filter(Boolean)
                        .join(" ");

                const value =
                    this.resolveValue(
                        record,
                        column.key
                    );

                if (
                    typeof column.render ===
                    "function"
                ) {

                    const rendered =
                        column.render(
                            value,
                            record,
                            index
                        );

                    this.appendRenderedValue(
                        cell,
                        rendered
                    );

                } else {

                    cell.textContent =
                        this.formatValue(
                            value,
                            column
                        );

                }

                if (
                    column.title !== false
                ) {

                    cell.title =
                        this.getPlainText(
                            cell
                        );

                }

                row.appendChild(
                    cell
                );

            }
        );

        if (
            this.options.showActions !==
            false
        ) {

            row.appendChild(
                this.createActionCell(
                    record
                )
            );

        }

        return row;

    }


    createActionCell(record) {

        const cell =
            document.createElement(
                "td"
            );

        cell.className =
            "catalog-table__cell " +
            "catalog-table__cell--actions";

        const menu =
            document.createElement(
                "div"
            );

        menu.className =
            "table-action-menu";

        menu.dataset.actionMenu =
            "";

        const trigger =
            document.createElement(
                "button"
            );

        trigger.type =
            "button";

        trigger.className =
            "table-action-menu__trigger";

        trigger.dataset
            .actionMenuTrigger =
            "";

        trigger.setAttribute(
            "aria-label",
            "Mở danh sách thao tác"
        );

        trigger.setAttribute(
            "aria-expanded",
            "false"
        );

        trigger.innerHTML =
            "<span aria-hidden=\"true\">⋮</span>";

        const dropdown =
            document.createElement(
                "div"
            );

        dropdown.className =
            "table-action-menu__dropdown";

        dropdown.dataset
            .actionMenuDropdown =
            "";

        dropdown.hidden =
            true;

        const actions =
            this.getActions(record);

        actions.forEach(
            action => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    [
                        "table-action-menu__item",
                        action.className || ""
                    ]
                        .filter(Boolean)
                        .join(" ");

                button.dataset.action =
                    action.key;

                button.dataset.recordId =
                    record[
                        this.options.rowKey
                    ];

                button.innerHTML = `
                    <span
                        class="table-action-menu__icon"
                        aria-hidden="true">
                        ${action.icon || ""}
                    </span>

                    <span>
                        ${window.MCS.escapeHtml(
                            action.label
                        )}
                    </span>
                `;

                dropdown.appendChild(
                    button
                );

            }
        );

        menu.append(
            trigger,
            dropdown
        );

        cell.appendChild(
            menu
        );

        return cell;

    }


    getActions(record) {

        if (
            typeof this.options.actions ===
            "function"
        ) {

            return (
                this.options.actions(
                    record
                ) || []
            );

        }

        const actions = [
            {
                key:
                    "view",

                label:
                    "Xem chi tiết",

                icon:
                    "◉"
            },
            {
                key:
                    "edit",

                label:
                    "Cập nhật",

                icon:
                    "✎"
            }
        ];

        if (
            record.active === false
        ) {

            actions.push({
                key:
                    "unlock",

                label:
                    "Mở khóa",

                icon:
                    "🔓",

                className:
                    "table-action-menu__item--success"
            });

        } else {

            actions.push({
                key:
                    "lock",

                label:
                    "Khóa",

                icon:
                    "🔒",

                className:
                    "table-action-menu__item--warning"
            });

        }

        return actions;

    }


    resolveValue(
        object,
        path
    ) {

        if (!path) {
            return undefined;
        }

        return String(path)
            .split(".")
            .reduce(
                (
                    value,
                    key
                ) => {

                    return value
                        ?. [key];

                },
                object
            );

    }


    formatValue(
        value,
        column
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return (
                column.emptyText ||
                "—"
            );

        }

        switch (
            column.type
        ) {

            case "number":

                return new Intl
                    .NumberFormat(
                        "vi-VN"
                    )
                    .format(
                        Number(value)
                    );

            case "currency":

                return new Intl
                    .NumberFormat(
                        "vi-VN",
                        {
                            style:
                                "currency",

                            currency:
                                column.currency ||
                                "VND",

                            maximumFractionDigits:
                                column.maximumFractionDigits ??
                                0
                        }
                    )
                    .format(
                        Number(value)
                    );

            case "date":

                return this.formatDate(
                    value,
                    false
                );

            case "datetime":

                return this.formatDate(
                    value,
                    true
                );

            case "boolean":

                return value
                    ? (
                        column.trueLabel ||
                        "Có"
                    )
                    : (
                        column.falseLabel ||
                        "Không"
                    );

            default:

                return String(value);

        }

    }


    formatDate(
        value,
        includeTime
    ) {

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);

        }

        return new Intl
            .DateTimeFormat(
                "vi-VN",
                includeTime
                    ? {
                        day:
                            "2-digit",

                        month:
                            "2-digit",

                        year:
                            "numeric",

                        hour:
                            "2-digit",

                        minute:
                            "2-digit"
                    }
                    : {
                        day:
                            "2-digit",

                        month:
                            "2-digit",

                        year:
                            "numeric"
                    }
            )
            .format(date);

    }


    appendRenderedValue(
        cell,
        rendered
    ) {

        if (
            rendered instanceof
            Node
        ) {

            cell.appendChild(
                rendered
            );

            return;

        }

        if (
            rendered &&
            typeof rendered === "object" &&
            rendered.html !== undefined
        ) {

            cell.innerHTML =
                rendered.html;

            return;

        }

        cell.textContent =
            rendered ?? "—";

    }


    getPlainText(cell) {

        return (
            cell.textContent ||
            ""
        )
            .trim();

    }


    getDisplayIndex(index) {

        const offset =
            Number(
                this.options.offset ||
                0
            );

        return (
            offset +
            index +
            1
        );

    }


    selectRow(id) {

        this.selectedId =
            id;

        this.body
            ?.querySelectorAll(
                "tr[data-record-id]"
            )
            .forEach(
                row => {

                    row.classList.toggle(
                        "is-selected",
                        String(
                            row.dataset.recordId
                        ) === String(id)
                    );

                }
            );

    }


    clearSelection() {

        this.selectedId =
            null;

        this.body
            ?.querySelectorAll(
                ".is-selected"
            )
            .forEach(
                row =>
                    row.classList.remove(
                        "is-selected"
                    )
            );

    }


    showLoading() {

        this.hideEmpty();

        if (this.loading) {

            this.loading.hidden =
                false;

        }

    }

    hideLoading() {

        if (this.loading) {

            this.loading.hidden =
                true;

        }

    }


    showEmpty() {

        if (!this.body) {
            return;
        }

        this.body.innerHTML =
            "";

        const row =
            document.createElement(
                "tr"
            );

        row.className =
            "catalog-table__empty-row";

        row.dataset.emptyRow =
            "";


        const cell =
            document.createElement(
                "td"
            );

        cell.className =
            "catalog-table__empty-cell";

        cell.colSpan =
            this.getColumnCount();


        const emptyState =
            document.createElement(
                "div"
            );

        emptyState.className =
            "catalog-table-empty-state";


        const icon =
            document.createElement(
                "div"
            );

        icon.className =
            "catalog-table-empty-state__icon";

        icon.setAttribute(
            "aria-hidden",
            "true"
        );

        icon.innerHTML = `
            <svg
                viewBox="0 0 64 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <path
                    d="M14 17.5L21 7H43L50 17.5V37C50 39.7614 47.7614 42 45 42H19C16.2386 42 14 39.7614 14 37V17.5Z"
                    stroke="currentColor"
                    stroke-width="2">
                </path>

                <path
                    d="M14 18H24L27.5 23H36.5L40 18H50"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round">
                </path>

                <ellipse
                    cx="32"
                    cy="43"
                    rx="24"
                    ry="3"
                    fill="currentColor"
                    opacity="0.08">
                </ellipse>

            </svg>
        `;


        const title =
            document.createElement(
                "strong"
            );

        title.className =
            "catalog-table-empty-state__title";

        title.textContent =
            this.options.emptyTitle;


        const description =
            document.createElement(
                "p"
            );

        description.className =
            "catalog-table-empty-state__description";

        description.textContent =
            this.options.emptyDescription;


        emptyState.append(
            icon,
            title,
            description
        );

        cell.appendChild(
            emptyState
        );

        row.appendChild(
            cell
        );

        this.body.appendChild(
            row
        );

    }

    getColumnCount() {

        let count =
            this.options.columns.length;

        if (
            this.options.selectable
        ) {

            count +=
                1;

        }

        if (
            this.options.showIndex
        ) {

            count +=
                1;

        }

        if (
            this.options.showActions !==
            false
        ) {

            count +=
                1;

        }

        return Math.max(
            count,
            1
        );

    }

    hideEmpty() {

        this.body
            ?.querySelector(
                "[data-empty-row]"
            )
            ?.remove();

    }

    toggleSort(key) {

        if (
            this.sort.key !== key
        ) {

            this.sort = {
                key,
                direction:
                    "asc"
            };

        } else {

            const next = {
                none:
                    "asc",

                asc:
                    "desc",

                desc:
                    "none"
            };

            this.sort.direction =
                next[
                    this.sort.direction
                ];

            if (
                this.sort.direction ===
                "none"
            ) {

                this.sort.key =
                    null;

            }

        }

        this.updateSortIcons();

        this.options.onSort?.(
            {
                ...this.sort
            }
        );

    }


    updateSortIcons() {

        this.root
            ?.querySelectorAll(
                "[data-sort-icon]"
            )
            .forEach(
                icon => {

                    const button =
                        icon.closest(
                            "[data-sort-key]"
                        );

                    const key =
                        button?.dataset
                            .sortKey;

                    icon.dataset
                        .sortDirection =
                        key === this.sort.key
                            ? this.sort.direction
                            : "none";

                }
            );

    }


    toggleActionMenu(trigger) {

        const menu =
            trigger.closest(
                "[data-action-menu]"
            );

        const dropdown =
            menu?.querySelector(
                "[data-action-menu-dropdown]"
            );

        if (!dropdown) {
            return;
        }

        const willOpen =
            dropdown.hidden;

        this.closeActionMenus();

        if (!willOpen) {
            return;
        }

        dropdown.hidden =
            false;

        trigger.setAttribute(
            "aria-expanded",
            "true"
        );

        const rectangle =
            trigger.getBoundingClientRect();

        dropdown.style.top =
            `${rectangle.bottom + 5}px`;

        dropdown.style.left =
            `${
                Math.max(
                    8,
                    rectangle.right -
                    185
                )
            }px`;

    }


    closeActionMenus() {

        document
            .querySelectorAll(
                "[data-action-menu-dropdown]"
            )
            .forEach(
                dropdown => {

                    dropdown.hidden =
                        true;

                }
            );

        document
            .querySelectorAll(
                "[data-action-menu-trigger]"
            )
            .forEach(
                trigger => {

                    trigger.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

    }

}


window.MCS.catalog.Table =
    MCSTable;