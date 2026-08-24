"use strict";

window.MCS = window.MCS || {};

window.MCS.catalog = window.MCS.catalog || {};

class MCSDetailPanel {
    constructor(root, options = {}) {
        this.root = typeof root === "string"
            ? document.querySelector(root)
            : root;

        this.options = {
            mobileBreakpoint: 1100,
            defaultTitle: "Thông tin chi tiết",
            onEdit: null,
            onClose: null,
            headerAction: null,
            onHeaderAction: null,
            ...options
        };

        this.panel = this.root?.querySelector("[data-detail-panel]") || this.root;
        this.form = this.panel?.querySelector("[data-catalog-form]");
        this.title = this.panel?.querySelector("[data-detail-title]");
        this.subtitle = this.panel?.querySelector("[data-detail-subtitle]");
        this.editButton = this.panel?.querySelector("[data-detail-edit]");
        this.headerAction = this.panel?.querySelector("[data-detail-header-action]");

        this.closeButtons = this.panel?.querySelectorAll(
            [
                "[data-detail-close]",
                "[data-detail-back]"
            ].join(",")
        );

        this.mode = "view";
        this.record = null;

        this.bindEvents();
    }

    bindEvents() {
        this.editButton?.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            if (!this.record) {
                return;
            }

            this.options.onEdit?.(
                this.record,
                this
            );
        });

        this.closeButtons?.forEach(button => {
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();

                this.close();

                this.options.onClose?.(
                    this
                );
            });
        });

        this.headerAction?.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                this.options.onHeaderAction?.(
                    {
                        mode: this.mode,
                        record: this.record,
                        panel: this,
                        action: this.options.headerAction
                    }
                );

            }
        );
    }

    syncHeaderAction() {

        if (
            !this.headerAction
        ) {
            return;
        }


        const action =
            this.options.headerAction;


        if (
            !action
        ) {

            this.headerAction.hidden =
                true;

            return;

        }


        const modes =
            Array.isArray(
                action.modes
            )
                ? action.modes
                : null;


        const visible =
            !modes ||
            modes.includes(
                this.mode
            );


        this.headerAction.hidden =
            !visible;


        if (
            !visible
        ) {
            return;
        }


        this.headerAction.innerHTML = `
            ${
                action.icon
                    ? `<i class="${action.icon}" aria-hidden="true"></i>`
                    : ""
            }

            <span>
                ${action.label || ""}
            </span>
        `;


        this.headerAction.dataset.action =
            action.action ||
            "";

    }

    showDefault({
        title,
        subtitle = ""
    } = {}) {
        this.mode = "view";
        this.record = null;

        if (this.form) {
            this.form.hidden = false;
        }

        if (this.panel) {
            this.panel.dataset.mode = "view";
        }

        this.setTitle(
            title ||
            this.options.defaultTitle
        );

        this.setSubtitle(
            subtitle
        );

        if (this.editButton) {
            this.editButton.hidden = true;
        }

        this.syncHeaderAction();
        this.close();
    }

    showPlaceholder(options = {}) {
        this.showDefault(
            options
        );
    }

    showForm({
        mode = "view",
        record = null,
        title,
        subtitle = ""
    } = {}) {
        this.mode = mode;
        this.record = record;

        if (this.form) {
            this.form.hidden = false;
        }

        if (this.panel) {
            this.panel.dataset.mode = mode;
        }

        this.setTitle(
            title ||
            this.getModeTitle(mode)
        );

        this.setSubtitle(
            subtitle
        );

        if (this.editButton) {
            this.editButton.hidden = (
                mode !== "view" ||
                !record
            );
        }

        this.syncHeaderAction();
        this.open();
    }

    setMode(mode) {
        this.mode = mode;

        if (this.panel) {
            this.panel.dataset.mode = mode;
        }

        if (this.editButton) {
            this.editButton.hidden = (
                mode !== "view" ||
                !this.record
            );
        }
        this.syncHeaderAction();
    }

    getModeTitle(mode) {
        const titles = {
            view: this.options.defaultTitle,
            create: "Thêm mới",
            update: "Cập nhật"
        };

        return (
            titles[mode] ||
            this.options.defaultTitle
        );
    }

    setTitle(value) {
        if (!this.title) {
            return;
        }

        this.title.textContent =
            value ||
            this.options.defaultTitle;
    }

    setSubtitle(value) {
        if (!this.subtitle) {
            return;
        }

        this.subtitle.textContent = value || "";
        this.subtitle.hidden = !value;
    }

    openMobile() {
        if (!this.isMobile()) {
            return;
        }

        this.root?.classList.add(
            "is-open"
        );

        document.body.classList.add(
            "catalog-panel-open"
        );
    }

    closeMobile() {
        this.root?.classList.remove(
            "is-open"
        );

        document.body.classList.remove(
            "catalog-panel-open"
        );
    }

    open() {
        if (!this.root) {
            return;
        }

        this.root.hidden = false;

        this.root.classList.add(
            "is-open"
        );

        this.root.dataset.panelMode = this.mode;

        if (this.isMobile()) {
            document.body.classList.add(
                "catalog-panel-open"
            );
        }
    }

    setExpanded(expanded) {
        this.root?.classList.toggle(
            "is-expanded",
            Boolean(expanded)
        );
    }

    close() {
        if (!this.root) {
            return;
        }

        this.root.classList.remove(
            "is-expanded"
        );

        if (!this.isMobile()) {
            return;
        }

        this.root.classList.remove(
            "is-open"
        );

        this.root.hidden = true;
        this.root.dataset.panelMode = "closed";

        document.body.classList.remove(
            "catalog-panel-open"
        );
    }

    isMobile() {
        return (
            window.innerWidth <=
            this.options.mobileBreakpoint
        );
    }
}

window.MCS.catalog.DetailPanel = MCSDetailPanel;