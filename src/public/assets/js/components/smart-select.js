"use strict";


window.MCS =
    window.MCS || {};


window.MCS.smartSelect = {

    initialize(
        root
    ) {

        if (!root) {
            return null;
        }

        if (
            root.smartSelect
        ) {
            return root.smartSelect;
        }


        const elements = {

            native:
                root.querySelector(
                    "[data-smart-select-native]"
                ),

            control:
                root.querySelector(
                    "[data-smart-select-control]"
                ),

            selection:
                root.querySelector(
                    "[data-smart-select-selection]"
                ),

            search:
                root.querySelector(
                    "[data-smart-select-search]"
                ),

            toggle:
                root.querySelector(
                    "[data-smart-select-toggle]"
                ),

            dropdown:
                root.querySelector(
                    "[data-smart-select-dropdown]"
                ),

            options:
                root.querySelector(
                    "[data-smart-select-options]"
                ),

            empty:
                root.querySelector(
                    "[data-smart-select-empty]"
                )

        };


        if (
            !elements.native ||
            !elements.control ||
            !elements.selection ||
            !elements.search ||
            !elements.dropdown ||
            !elements.options
        ) {

            console.error(
                "Smart Select thiếu phần tử bắt buộc:",
                root
            );

            return null;

        }


        const mode =
            root.dataset.selectMode ||
            "single";

        function getPlaceholder() {

            return (
                root.dataset.selectPlaceholder ||
                "Chọn dữ liệu..."
            );

        }

        const allLabel =
            root.dataset.selectAllLabel ||
            "Tất cả";


        const state = {

            opened:
                false,

            searching:
                false

        };


        bindEvents();

        renderOptions();

        renderSelection();


        function getOptions() {

            return Array.from(
                elements.native.options
            );

        }

        function getNormalOptions() {

            return getOptions()
                .filter(
                    option =>
                        option.value !==
                            "" &&
                        option.value !==
                            "__ALL__" &&
                        !option.disabled
                );

        }

        function getSelectedOptions() {

            return getOptions()
                .filter(
                    option =>
                        option.selected &&
                        option.value !== "" &&
                        option.value !== "__ALL__"
                );

        }

        function getAllOption() {

            return getOptions()
                .find(
                    option =>
                        option.value ===
                        "__ALL__"
                ) || null;

        }


        function isAllSelected() {

            return Boolean(
                getAllOption()?.selected
            );

        }


        function bindEvents() {

            elements.control.addEventListener(
                "click",
                event => {

                    const removeButton =
                        event.target.closest(
                            '[data-smart-select-remove="single"]'
                        );


                    if (
                        removeButton
                    ) {

                        event.preventDefault();

                        event.stopPropagation();


                        clear(
                            true
                        );


                        return;

                    }


                    if (
                        event.target.closest(
                            "[data-smart-select-remove]"
                        )
                    ) {

                        return;

                    }


                    if (
                        event.target.closest(
                            "[data-smart-select-toggle]"
                        )
                    ) {
                        return;
                    }


                    if (
                        elements.native.disabled
                    ) {
                        return;
                    }


                    open();


                    state.searching =
                        true;


                    root.classList.add(
                        "is-searching"
                    );


                    elements.search.focus();

                }
            );

            elements.toggle?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    toggle();

                }
            );


            elements.search.addEventListener(
                "focus",
                () => {

                    if (
                        elements.native.disabled
                    ) {
                        return;
                    }

                    state.searching =
                        true;

                    root.classList.add(
                        "is-searching"
                    );

                    open();

                }
            );


            elements.search.addEventListener(
                "input",
                () => {

                    state.searching =
                        true;

                    root.classList.add(
                        "is-searching"
                    );

                    renderOptions(
                        elements.search.value
                    );

                    open();

                }
            );


            elements.search.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Escape"
                    ) {

                        event.preventDefault();

                        close();

                        elements.search.blur();

                        return;

                    }

                    if (
                        event.key ===
                            "Backspace" &&
                        !elements.search.value &&
                        mode ===
                            "multiple"
                    ) {

                        removeLastValue();

                    }

                }
            );


            root.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                }
            );


            document.addEventListener(
                "click",
                event => {

                    if (
                        !root.contains(
                            event.target
                        )
                    ) {

                        close();

                    }

                }
            );

        }

        function open() {

            if (
                elements.native.disabled
            ) {
                return;
            }


            closeOtherPopups();


            state.opened =
                true;


            elements.dropdown.hidden =
                false;


            root.classList.add(
                "is-open"
            );


            elements.toggle?.setAttribute(
                "aria-expanded",
                "true"
            );


            elements.search.placeholder =
                placeholder;;


            renderOptions(
                elements.search.value
            );

        }

        function close() {

            state.opened =
                false;

            state.searching =
                false;

            elements.dropdown.hidden =
                true;

            root.classList.remove(
                "is-open",
                "is-searching"
            );

            elements.toggle?.setAttribute(
                "aria-expanded",
                "false"
            );

            elements.search.value =
                "";

            elements.search.placeholder =
                "";

            renderOptions();

            renderSelection();

        }

        function closeOtherPopups() {

            document
                .querySelectorAll(
                    "[data-smart-select]"
                )
                .forEach(
                    item => {

                        if (
                            item === root
                        ) {
                            return;
                        }


                        const api =
                            item.smartSelect;


                        if (
                            api &&
                            typeof api.close ===
                                "function"
                        ) {

                            api.close();

                        }

                    }
                );


            document
                .querySelectorAll(
                    "[data-date-picker]"
                )
                .forEach(
                    item => {

                        const dropdown =
                            item.querySelector(
                                "[data-date-dropdown]"
                            );

                        const toggle =
                            item.querySelector(
                                "[data-date-toggle]"
                            );


                        if (dropdown) {

                            dropdown.hidden =
                                true;

                        }


                        toggle?.setAttribute(
                            "aria-expanded",
                            "false"
                        );


                        item.classList.remove(
                            "is-open"
                        );

                    }
                );

        }

        function toggle() {

            if (
                state.opened
            ) {

                close();

                return;

            }


            open();


            state.searching =
                true;


            root.classList.add(
                "is-searching"
            );


            elements.search.focus();

        }

        function renderOptions(
            keyword = ""
        ) {

            const normalizedKeyword =
                normalizeSearchText(
                    keyword
                );

            elements.options.innerHTML =
                "";

            const visibleOptions =
                getOptions()
                    .filter(
                        option => {

                            if (
                                option.value === ""
                            ) {
                                return false;
                            }


                            const label =
                                normalizeSearchText(
                                    option.textContent
                                );


                            return (
                                !normalizedKeyword ||
                                label.includes(
                                    normalizedKeyword
                                )
                            );

                        }
                    );

            visibleOptions.forEach(
                option => {

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.className =
                        "smart-select__option";

                    button.dataset.optionValue =
                        option.value;

                    if (
                        option.value ===
                        "__ALL__"
                    ) {

                        button.dataset.optionAll =
                            "true";

                    }

                    if (
                        option.selected
                    ) {

                        button.classList.add(
                            "is-selected"
                        );

                    }

                    if (
                        option.disabled
                    ) {

                        button.disabled =
                            true;

                        button.classList.add(
                            "is-disabled"
                        );

                    }


                    const label =
                        document.createElement(
                            "span"
                        );

                    label.className =
                        "smart-select__option-label";

                    label.textContent =
                        option.textContent.trim();


                    const check =
                        document.createElement(
                            "span"
                        );

                    check.className =
                        "smart-select__check";

                    check.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                    check.textContent =
                        "✓";


                    button.appendChild(
                        label
                    );

                    button.appendChild(
                        check
                    );


                    button.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();

                            event.stopPropagation();

                            selectOption(
                                option
                            );

                        }
                    );


                    elements.options.appendChild(
                        button
                    );

                }
            );


            if (
                elements.empty
            ) {

                elements.empty.hidden =
                    visibleOptions.length > 0;

            }

        }


        function selectOption(
            option
        ) {

            if (
                option.disabled
            ) {
                return;
            }


            if (
                mode ===
                "multiple"
            ) {

                selectMultiple(
                    option
                );

                emitChange();

                renderOptions();

                renderSelection();

                elements.search.value =
                    "";

                elements.search.focus();

                return;

            }


            getOptions().forEach(
                item => {

                    item.selected =
                        false;

                }
            );


            option.selected =
                true;


            emitChange();

            renderOptions();

            renderSelection();

            close();

        }


        function selectMultiple(
            option
        ) {

            const allOption =
                getAllOption();


            if (
                option.value ===
                "__ALL__"
            ) {

                getOptions().forEach(
                    item => {

                        item.selected =
                            false;

                    }
                );

                option.selected =
                    true;

                return;

            }


            if (allOption) {

                allOption.selected =
                    false;

            }


            option.selected =
                !option.selected;


            const normalOptions =
                getNormalOptions();

            const selectedNormalOptions =
                normalOptions.filter(
                    item =>
                        item.selected
                );


            if (
                allOption &&
                normalOptions.length > 0 &&
                selectedNormalOptions.length ===
                    normalOptions.length
            ) {

                normalOptions.forEach(
                    item => {

                        item.selected =
                            false;

                    }
                );

                allOption.selected =
                    true;

            }

        }


        function renderSelection() {

            elements.selection.innerHTML =
                "";


            if (
                !root.classList.contains(
                    "is-searching"
                )
            ) {

                elements.search.value =
                    "";

                elements.search.placeholder =
                    "";

            }


            if (
                mode === "multiple" &&
                isAllSelected()
            ) {

                const allOption =
                    getAllOption();

                if (allOption) {

                    appendTag(
                        allOption
                    );

                }

                return;

            }


            const selectedOptions =
                getSelectedOptions();

            if (
                selectedOptions.length ===
                0
            ) {

                if (
                    mode !== "multiple" &&
                    elements.toggle
                ) {

                    elements.toggle.hidden =
                        false;

                }

                const placeholderElement =
                    document.createElement(
                        "span"
                    );

                placeholderElement.className =
                    "smart-select__placeholder";

                placeholderElement.textContent =
                    getPlaceholder();

                elements.selection.appendChild(
                    placeholderElement
                );

                return;

            }

            if (
                mode !==
                "multiple"
            ) {

                if (
                    elements.toggle
                ) {

                    elements.toggle.hidden =
                        true;

                }


                appendSingleValue(
                    selectedOptions[0]
                        .textContent
                        .trim()
                );


                return;

            }

            selectedOptions.forEach(
                option => {

                    appendTag(
                        option
                    );

                }
            );

        }

        function appendSingleValue(
            label
        ) {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "smart-select__single";


            const value =
                document.createElement(
                    "span"
                );

            value.className =
                "smart-select__single-value";

            value.textContent =
                label;


            const remove =
                document.createElement(
                    "button"
                );

            remove.type =
                "button";

            remove.className =
                "smart-select__single-remove";

            remove.dataset.smartSelectRemove =
                "single";

            remove.setAttribute(
                "aria-label",
                `Bỏ chọn ${label}`
            );

            remove.innerHTML =
                `
                    <i
                        class="fa-solid fa-xmark"
                        aria-hidden="true">
                    </i>
                `;


            wrapper.appendChild(
                value
            );

            wrapper.appendChild(
                remove
            );


            elements.selection.appendChild(
                wrapper
            );

        }

        function appendTag(
            option
        ) {

            const tag =
                document.createElement(
                    "span"
                );

            tag.className =
                "smart-select__tag";


            const label =
                document.createElement(
                    "span"
                );

            label.className =
                "smart-select__tag-label";

            label.textContent =
                option.textContent.trim();


            const remove =
                document.createElement(
                    "button"
                );

            remove.type =
                "button";

            remove.className =
                "smart-select__tag-remove";

            remove.dataset.smartSelectRemove =
                option.value;

            remove.setAttribute(
                "aria-label",
                `Bỏ chọn ${
                    option.textContent.trim()
                }`
            );

            remove.textContent =
                "×";


            remove.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    option.selected =
                        false;

                    emitChange();

                    renderOptions();

                    renderSelection();

                }
            );


            tag.appendChild(
                label
            );

            tag.appendChild(
                remove
            );

            elements.selection.appendChild(
                tag
            );

        }


        function removeLastValue() {

            const selectedOptions =
                getSelectedOptions();

            const lastOption =
                selectedOptions.at(-1);

            if (!lastOption) {
                return;
            }

            lastOption.selected =
                false;

            emitChange();

            renderOptions();

            renderSelection();

        }


        function emitChange() {

            elements.native.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles:
                            true
                    }
                )
            );


            root.dispatchEvent(
                new CustomEvent(
                    "smart-select:change",
                    {
                        bubbles:
                            true,

                        detail: {

                            mode,

                            all:
                                isAllSelected(),

                            value:
                                getValue(),

                            values:
                                getValues()

                        }

                    }
                )
            );

        }


        function getValue() {

            if (
                isAllSelected()
            ) {
                return "";
            }

            return (
                getSelectedOptions()[0]
                    ?.value ??
                ""
            );

        }


        function getValues() {

            if (
                isAllSelected()
            ) {
                return [];
            }

            return getSelectedOptions()
                .map(
                    option =>
                        option.value
                );

        }


        function setValue(
            value,
            emit = false
        ) {

            const normalizedValue =
                value === null ||
                value === undefined
                    ? ""
                    : String(value);


            getOptions().forEach(
                option => {

                    option.selected =
                        (
                            option.value ===
                            normalizedValue
                        );

                }
            );


            renderOptions();

            renderSelection();


            if (emit) {

                emitChange();

            }

        }


        function setValues(
            values,
            emit = false
        ) {

            const normalizedValues =
                new Set(
                    (
                        Array.isArray(values)
                            ? values
                            : []
                    )
                        .map(
                            value =>
                                String(value)
                        )
                );


            getOptions().forEach(
                option => {

                    option.selected =
                        normalizedValues.has(
                            option.value
                        );

                }
            );


            renderOptions();

            renderSelection();


            if (emit) {

                emitChange();

            }

        }


        function setAll(
            selected = true,
            emit = false
        ) {

            const allOption =
                getAllOption();


            getOptions().forEach(
                option => {

                    option.selected =
                        false;

                }
            );


            if (
                allOption &&
                selected
            ) {

                allOption.selected =
                    true;

            }


            renderOptions();

            renderSelection();


            if (emit) {

                emitChange();

            }

        }


        function clear(
            emit = false
        ) {

            getOptions().forEach(
                option => {

                    option.selected =
                        false;

                }
            );

            renderOptions();

            renderSelection();


            if (emit) {

                emitChange();

            }

        }

        function setDisabled(
            disabled = true
        ) {

            const isDisabled =
                Boolean(disabled);


            elements.native.disabled =
                isDisabled;

            elements.search.disabled =
                isDisabled;


            if (
                elements.toggle
            ) {

                elements.toggle.disabled =
                    isDisabled;

            }


            root.classList.toggle(
                "is-disabled",
                isDisabled
            );


            if (
                isDisabled
            ) {

                close();

            } else {

                renderOptions();

                renderSelection();

            }

        }

        const api = {

            open,

            close,

            getValue,

            getValues,

            setValue,

            setValues,

            setAll,

            clear,

            setDisabled,

            refresh() {

                renderOptions();

                renderSelection();

            }

        };

        root.smartSelect =
            api;


        return api;

    },


    initializeAll(
        container = document
    ) {

        container
            .querySelectorAll(
                "[data-smart-select]"
            )
            .forEach(
                root => {

                    this.initialize(
                        root
                    );

                }
            );

    }

};


document.addEventListener(
    "DOMContentLoaded",
    () => {

        window.MCS.smartSelect
            .initializeAll();

    }
);


function normalizeSearchText(
    value
) {

    return String(
        value || ""
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

}