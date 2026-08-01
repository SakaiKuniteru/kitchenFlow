"use strict";


window.MCS =
    window.MCS || {};


window.MCS.catalog =
    window.MCS.catalog || {};


class MCSDetailPanel {

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
            mobileBreakpoint:
                820,

            defaultTitle:
                "Thông tin chi tiết",

            onEdit:
                null,

            onClose:
                null,

            ...options
        };

        this.panel =
            this.root?.querySelector(
                "[data-detail-panel]"
            ) ||
            this.root;

        this.placeholder =
            this.panel?.querySelector(
                "[data-detail-placeholder]"
            );

        this.form =
            this.panel?.querySelector(
                "[data-catalog-form]"
            );

        this.title =
            this.panel?.querySelector(
                "[data-detail-title]"
            );

        this.subtitle =
            this.panel?.querySelector(
                "[data-detail-subtitle]"
            );

        this.editButton =
            this.panel?.querySelector(
                "[data-detail-edit]"
            );

        this.closeButtons =
            this.panel?.querySelectorAll(
                [
                    "[data-detail-close]",
                    "[data-detail-back]"
                ].join(",")
            );

        this.mode =
            "view";

        this.record =
            null;

        this.bindEvents();

    }


    bindEvents() {

        this.editButton
            ?.addEventListener(
                "click",
                () => {

                    this.options
                        .onEdit?.(
                            this.record,
                            this
                        );

                }
            );

        this.closeButtons
            ?.forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            this.close();

                            this.options
                                .onClose?.(
                                    this
                                );

                        }
                    );

                }
            );

    }


    showPlaceholder() {

        if (this.placeholder) {

            this.placeholder.hidden =
                false;

        }

        if (this.form) {

            this.form.hidden =
                true;

        }

        this.record =
            null;

        this.setTitle(
            this.options
                .defaultTitle
        );

        this.closeMobile();

    }


    showForm({
        mode = "view",
        record = null,
        title,
        subtitle
    } = {}) {

        this.mode =
            mode;

        this.record =
            record;

        if (this.placeholder) {

            this.placeholder.hidden =
                true;

        }

        if (this.form) {

            this.form.hidden =
                false;

        }

        if (this.panel) {

            this.panel.dataset.mode =
                mode;

        }

        this.setTitle(
            title ||
            this.getModeTitle(
                mode
            )
        );

        this.setSubtitle(
            subtitle
        );

        if (this.editButton) {

            this.editButton.hidden =
                mode !== "view" ||
                !record;

        }

        this.openMobile();

    }


    getModeTitle(mode) {

        const titles = {
            view:
                "Thông tin chi tiết",

            create:
                "Thêm mới",

            update:
                "Cập nhật"
        };

        return (
            titles[mode] ||
            this.options
                .defaultTitle
        );

    }


    setTitle(value) {

        if (this.title) {

            this.title.textContent =
                value ||
                this.options
                    .defaultTitle;

        }

    }


    setSubtitle(value) {

        if (!this.subtitle) {
            return;
        }

        this.subtitle.textContent =
            value || "";

        this.subtitle.hidden =
            !value;

    }


    openMobile() {

        if (!this.isMobile()) {
            return;
        }

        this.root?.classList.add(
            "is-open"
        );

        document.body
            .classList
            .add(
                "catalog-panel-open"
            );

    }


    closeMobile() {

        this.root?.classList.remove(
            "is-open"
        );

        document.body
            .classList
            .remove(
                "catalog-panel-open"
            );

    }


    close() {

        if (this.isMobile()) {

            this.closeMobile();

            return;

        }

        this.showPlaceholder();

    }


    isMobile() {

        return (
            window.innerWidth <=
            this.options
                .mobileBreakpoint
        );

    }

}


window.MCS.catalog.DetailPanel =
    MCSDetailPanel;