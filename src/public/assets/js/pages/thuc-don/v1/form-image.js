"use strict";

window.ThucDonFormImage = (() => {

    function init(root) {

        if (!root) {
            return;
        }

        root.addEventListener(
            "click",
            event => {

                const trigger =
                    event.target.closest(
                        "[data-food-image-trigger]"
                    );

                if (!trigger) {
                    return;
                }

                const wrapper =
                    trigger.closest(
                        "[data-food-image-editor]"
                    );

                const input =
                    wrapper?.querySelector(
                        "[data-food-image-input]"
                    );

                if (!input) {
                    return;
                }

                input.click();

            }
        );


        root.addEventListener(
            "change",
            event => {

                const input =
                    event.target.closest(
                        "[data-food-image-input]"
                    );

                if (!input) {
                    return;
                }

                previewImage(
                    input
                );

            }
        );

    }


    function previewImage(input) {

        const file =
            input.files?.[0];

        if (!file) {
            return;
        }

        if (
            ![
                "image/png",
                "image/jpeg",
                "image/webp"
            ].includes(
                file.type
            )
        ) {

            window.MCS?.toast?.error(
                "Chỉ chấp nhận ảnh PNG, JPG, JPEG hoặc WEBP."
            );

            input.value = "";

            return;
        }

        const wrapper =
            input.closest(
                "[data-food-image-editor]"
            );

        const image =
            wrapper?.querySelector(
                "[data-food-image-preview]"
            );

        if (!image) {
            return;
        }

        const oldUrl =
            image.dataset.previewUrl;

        if (oldUrl) {

            URL.revokeObjectURL(
                oldUrl
            );

        }

        const previewUrl =
            URL.createObjectURL(
                file
            );

        image.src =
            previewUrl;

        image.dataset.previewUrl =
            previewUrl;

        wrapper.classList.add(
            "has-preview"
        );

        const foodCard =
            wrapper.closest(
                "[data-food-card]"
            );

        if (foodCard) {

            foodCard._imageFile =
                file;

        }

    }


    function clearPreview(wrapper) {

        if (!wrapper) {
            return;
        }

        const input =
            wrapper.querySelector(
                "[data-food-image-input]"
            );

        const image =
            wrapper.querySelector(
                "[data-food-image-preview]"
            );

        if (input) {
            input.value = "";
        }

        if (image?.dataset.previewUrl) {

            URL.revokeObjectURL(
                image.dataset.previewUrl
            );

            delete image.dataset.previewUrl;

        }

        wrapper.classList.remove(
            "has-preview"
        );

    }


    return {
        init,
        clearPreview
    };

})();