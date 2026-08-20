"use strict";

window.MCS = window.MCS || {};

window.MCS.imagePicker = {
    initialize(root) {
        if (!root) {
            return null;
        }

        if (root.imagePicker) {
            return root.imagePicker;
        }

        const input = root.querySelector("[data-image-picker-input]");
        const image = root.querySelector("[data-image-picker-image]");
        const placeholder = root.querySelector("[data-image-picker-placeholder]");
        const removeButton = root.querySelector("[data-image-picker-remove]");

        if (!input || !image || !placeholder) {
            return null;
        }

        const state = {
            objectUrl: "",
            existingUrl: "",
            selectedFile: null
        };

        input.addEventListener("change", () => {
            const file = input.files?.[0] || null;

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {
                clearInput();
                return;
            }

            state.selectedFile = file;

            revokeObjectUrl();

            state.objectUrl = URL.createObjectURL(file);

            showImage(state.objectUrl);
        });

        removeButton?.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            clear();
        });

        function showImage(url) {
            const value = String(url || "").trim();

            if (!value) {
                image.removeAttribute("src");

                image.hidden = true;

                placeholder.hidden = false;

                if (removeButton) {
                    removeButton.hidden = true;
                }

                root.classList.remove("has-image");

                return;
            }

            image.src = value;

            image.hidden = false;

            placeholder.hidden = true;

            if (removeButton) {
                removeButton.hidden = false;
            }

            root.classList.add("has-image");
        }

        function setExistingImage(url) {
            clearInput();

            revokeObjectUrl();

            state.selectedFile = null;

            state.existingUrl = String(url || "").trim();

            showImage(state.existingUrl);
        }

        function clearInput() {
            input.value = "";
        }

        function clear() {
            clearInput();

            revokeObjectUrl();

            state.selectedFile = null;

            state.existingUrl = "";

            showImage("");

            input.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles: true
                    }
                )
            );
        }

        function revokeObjectUrl() {
            if (state.objectUrl) {
                URL.revokeObjectURL(state.objectUrl);

                state.objectUrl = "";
            }
        }

        function setDisabled(disabled = true) {
            const value = Boolean(disabled);

            input.disabled = value;

            root.classList.toggle(
                "is-disabled",
                value
            );
        }

        const api = {
            clear,
            setExistingImage,
            setDisabled,

            getFile() {
                return (
                    state.selectedFile ||
                    input.files?.[0] ||
                    null
                );
            },

            getExistingUrl() {
                return state.existingUrl;
            },

            hasImage() {
                return Boolean(
                    state.selectedFile ||
                    state.existingUrl
                );
            },

            getInput() {
                return input;
            }
        };

        root.imagePicker = api;

        return api;
    },

    initializeAll(container = document) {
        container
            .querySelectorAll("[data-image-picker]")
            .forEach(root => {
                this.initialize(root);
            });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.MCS.imagePicker.initializeAll();
});