"use strict";

window.ThucDonFormOptions = (() => {

    async function init(root, data = null) {

        const [
            coSo,
            caAn,
            nhomMonAn,
            monAn
        ] = await Promise.all([
            getList("/api/mcs/v1/dm-co-so/tong-hop"),
            getList("/api/mcs/v1/dm-ca-an/tong-hop"),
            getList("/api/mcs/v1/dm-nhom-mon-an/tong-hop"),
            getList("/api/mcs/v1/dm-mon-an/tong-hop")
        ]);

        const coSoSelect =
            root.querySelector(
                '[name="coSoId"]'
            );

        const nhaAnSelect =
            root.querySelector(
                '[name="nhaAnId"]'
            );

        const caAnSelect =
            root.querySelector(
                '[name="caAnId"]'
            );

        fillSelect(
            coSoSelect,
            coSo,
            {
                value: "id",
                label: "tenCoSo",
                selected: data?.coSoId
            }
        );

        fillSelect(
            caAnSelect,
            caAn,
            {
                value: "id",
                label: "tenCaAn",
                selected: data?.caAnId
            }
        );

        if (data?.coSoId) {

            await loadNhaAn(
                root,
                data.coSoId,
                data.nhaAnId
            );

        } else {

            setSelectDisabled(
                nhaAnSelect,
                true
            );

        }

        let currentCoSoId =
            data?.coSoId
                ? String(
                    data.coSoId
                )
                : "";


        coSoSelect?.addEventListener(
            "change",
            async event => {

                const coSoId =
                    String(
                        event.target.value ||
                        ""
                    );

                if (
                    coSoId ===
                    currentCoSoId
                ) {

                    refreshSmartSelect(
                        coSoSelect
                    );

                    return;

                }


                currentCoSoId =
                    coSoId;


                await loadNhaAn(
                    root,
                    coSoId,
                    null
                );

            }
        );

        root._thucDonOptions = {
            coSo,
            caAn,
            nhomMonAn,
            monAn
        };

    }

    async function loadNhaAn(
        root,
        coSoId,
        selectedId = null
    ) {

        const select =
            root.querySelector(
                '[name="nhaAnId"]'
            );

        if (!select) {
            return;
        }

        if (!coSoId) {

            setSelectDisabled(
                select,
                true
            );

            refreshSmartSelect(
                select
            );

            return;
        }

        const danhSach =
            await getList(
                `/api/mcs/v1/dm-nha-an/tong-hop?coSoId=${encodeURIComponent(coSoId)}`
            );

        fillSelect(
            select,
            danhSach,
            {
                value: "id",
                label: "tenNhaAn",
                selected: selectedId
            }
        );

        setSelectDisabled(
            select,
            false
        );

    }

    function setSelectDisabled(
        select,
        disabled
    ) {

        if (!select) {
            return;
        }

        select.disabled =
            disabled;

        const wrapper =
            select.closest(
                "[data-smart-select]"
            );

        wrapper?.classList.toggle(
            "is-disabled",
            disabled
        );

        const search =
            wrapper?.querySelector(
                "[data-smart-select-search]"
            );

        const toggle =
            wrapper?.querySelector(
                "[data-smart-select-toggle]"
            );

        if (search) {
            search.disabled = disabled;
        }

        if (toggle) {
            toggle.disabled = disabled;
        }

    }

    async function getList(url) {

        const accessToken =
            localStorage.getItem(
                "accessToken"
            );

        const response =
            await fetch(
                url,
                {
                    headers: {
                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${accessToken}`
                    },

                    credentials:
                        "include"
                }
            );

        const result =
            await response.json();

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Không thể tải danh mục."
            );

        }

        const data =
            result.data ||
            result;

        let danhSach = [];

        if (Array.isArray(data)) {

            danhSach =
                data;

        } else {

            danhSach =
                data.items ||
                data.rows ||
                data.danhSach ||
                [];

        }

        return danhSach.filter(
            item =>
                item.active === true
        );

    }

    function fillSelect(
        select,
        data,
        options
    ) {

        if (!select) {
            return;
        }

        select.innerHTML = "";


        data.forEach(
            item => {

                if (
                    item.active ===
                    false
                ) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    item[
                        options.value
                    ];


                option.textContent =
                    item[
                        options.label
                    ] ||
                    item.ten ||
                    "-";


                if (
                    options.selected !==
                    null &&
                    options.selected !==
                    undefined &&
                    String(
                        option.value
                    ) ===
                    String(
                        options.selected
                    )
                ) {

                    option.selected =
                        true;

                }


                select.appendChild(
                    option
                );

            }
        );

        if (
            options.selected ===
            null ||
            options.selected ===
            undefined ||
            options.selected ===
            ""
        ) {

            select.selectedIndex =
                -1;

        }

        const wrapper =
            select.closest(
                "[data-smart-select]"
            );


        const api =
            window.MCS
                ?.smartSelect
                ?.initialize(
                    wrapper
                );


        api?.refresh();


        if (
            options.selected !==
            null &&
            options.selected !==
            undefined &&
            options.selected !==
            ""
        ) {

            api?.setValue(
                String(
                    options.selected
                ),
                false
            );

        }

    }

    function escapeHtml(
        value
    ) {

        return String(
            value ?? ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }

    return {
        init
    };

})();