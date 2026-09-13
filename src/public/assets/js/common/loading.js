'use strict';


(function () {

    window.MCS =
        window.MCS ||
        {};


    /*
     * File này có thể được load bởi
     * nhiều forms/loading trên cùng trang.
     *
     * Nếu đã khởi tạo rồi thì không tạo lại.
     */
    if (
        window.MCS.formLoading
    ) {
        return;
    }


    function resolve(
        target
    ) {

        if (!target) {
            return null;
        }


        /*
         * Truyền trực tiếp HTMLElement.
         */
        if (
            target instanceof
            HTMLElement
        ) {

            if (
                target.matches(
                    '[data-form-loading]'
                )
            ) {
                return target;
            }


            return target
                .querySelector(
                    '[data-form-loading]'
                );
        }


        /*
         * Truyền id:
         *
         * "report"
         *
         * → data-form-loading-id="report"
         */
        const id =
            String(
                target
            )
                .trim();


        if (!id) {
            return null;
        }


        return document
            .querySelector(
                `[data-form-loading-id="${CSS.escape(
                    id
                )}"]`
            );
    }


    function show(
        target,
        message
    ) {

        const element =
            resolve(
                target
            );


        if (!element) {
            return;
        }


        if (
            message !==
                undefined &&
            message !==
                null
        ) {

            setMessage(
                element,
                message
            );

        }


        element.hidden =
            false;


        element.setAttribute(
            'aria-busy',
            'true'
        );
    }


    function hide(
        target
    ) {

        const element =
            resolve(
                target
            );


        if (!element) {
            return;
        }


        element.hidden =
            true;


        element.setAttribute(
            'aria-busy',
            'false'
        );
    }


    function setMessage(
        target,
        message
    ) {

        const element =
            resolve(
                target
            );


        if (!element) {
            return;
        }


        const messageElement =
            element.querySelector(
                '[data-form-loading-message]'
            );


        if (!messageElement) {
            return;
        }


        messageElement.textContent =
            String(
                message ||
                'Đang xử lý. Vui lòng chờ!'
            );
    }


    function isVisible(
        target
    ) {

        const element =
            resolve(
                target
            );


        return Boolean(
            element &&
            !element.hidden
        );
    }


    window.MCS.formLoading = {

        resolve,

        show,

        hide,

        setMessage,

        isVisible

    };

})();