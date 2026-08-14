"use strict";

window.ThucDon =
    window.ThucDon ||
    {};


window.ThucDon.options =
    (() => {

        async function init(
            root,
            data = null
        ) {

            const [
                coSo,
                caAn,
                nhomMonAn,
                monAn,
                donViTinh
            ] =
                await Promise.all([

                    getList(
                        "/api/mcs/v1/dm-co-so/tong-hop"
                    ),

                    getList(
                        "/api/mcs/v1/dm-ca-an/tong-hop"
                    ),

                    getList(
                        "/api/mcs/v1/dm-nhom-mon-an/tong-hop"
                    ),

                    getList(
                        "/api/mcs/v1/dm-mon-an/tong-hop"
                    ),

                    getList(
                        "/api/mcs/v1/dm-don-vi-tinh/tong-hop"
                    )
                        .catch(
                            () => []
                        )

                ]);


            fill(
                root.querySelector(
                    '[name="coSoId"]'
                ),
                coSo,
                "id",
                "tenCoSo",
                data?.coSoId
            );


            fill(
                root.querySelector(
                    '[name="caAnId"]'
                ),
                caAn,
                "id",
                "tenCaAn",
                data?.caAnId
            );


            if (
                data?.coSoId
            ) {

                await loadNhaAn(
                    root,
                    data.coSoId,
                    data.nhaAnId
                );

            }
            else {

                disable(
                    root.querySelector(
                        '[name="nhaAnId"]'
                    ),
                    true
                );

            }


            fill(
                root.querySelector(
                    '[name=" tdNhomMonAnId"]'
                ),
                nhomMonAn,
                "id",
                "tenNhomMonAn",
                null
            );


            fill(
                root.querySelector(
                    '[name=" tdMonAnId"]'
                ),
                monAn,
                "id",
                "tenMonAn",
                null
            );


            fill(
                root.querySelector(
                    '[name="tdDonViTinhId"]'
                ),
                donViTinh,
                "id",
                "tenDonViTinh",
                null
            );


            root._tdOptions = {
                coSo,
                caAn,
                nhomMonAn,
                monAn,
                donViTinh
            };


            const coSoSelect =
                root.querySelector(
                    '[name="coSoId"]'
                );


            if (
                coSoSelect &&
                !coSoSelect.dataset.tdBound
            ) {

                coSoSelect.dataset.tdBound =
                    "true";


                coSoSelect.addEventListener(
                    "change",
                    () =>
                        loadNhaAn(
                            root,
                            coSoSelect.value,
                            null
                        )
                );

            }

        }


        async function loadNhaAn(
            root,
            coSoId,
            selectedId
        ) {

            const select =
                root.querySelector(
                    '[name="nhaAnId"]'
                );


            if (!select) return;


            if (
                !coSoId
            ) {

                disable(
                    select,
                    true
                );


                fill(
                    select,
                    [],
                    "id",
                    "tenNhaAn",
                    null
                );


                return;

            }


            const list =
                await getList(
                    `/api/mcs/v1/dm-nha-an/tong-hop?coSoId=${encodeURIComponent(coSoId)}`
                );


            fill(
                select,
                list,
                "id",
                "tenNhaAn",
                selectedId
            );


            disable(
                select,
                false
            );

        }


        async function getList(
            url
        ) {

            const token =
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
                                `Bearer ${token}`
                        },

                        credentials:
                            "include"
                    }
                );


            const result =
                await response.json();


            if (
                !response.ok
            ) {

                throw new Error(
                    result?.message ||
                    "Không thể tải danh mục."
                );

            }


            const data =
                result?.data ??
                result;


            const list =
                Array.isArray(
                    data
                )
                    ? data
                    : (
                        data?.items ||
                        data?.rows ||
                        data?.danhSach ||
                        []
                    );


            return list.filter(
                item =>
                    item?.active !==
                    false
            );

        }


        function fill(
            select,
            list,
            valueKey,
            labelKey,
            selected
        ) {

            if (!select) return;


            select.innerHTML =
                "";


            list.forEach(
                item => {

                    const o =
                        document.createElement(
                            "option"
                        );


                    o.value =
                        String(
                            item[valueKey]
                        );


                    o.textContent =
                        item[labelKey] ||
                        item.ten ||
                        "-";


                    select.appendChild(
                        o
                    );

                }
            );


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


            api?.refresh?.();


            if (
                selected !== null &&
                selected !== undefined &&
                selected !== ""
            ) {

                api?.setValue?.(
                    String(
                        selected
                    ),
                    false
                );

            }
            else {

                api?.clear?.(
                    false
                );

            }

        }


        function disable(
            select,
            disabled
        ) {

            if (!select) return;


            select.disabled =
                !!disabled;


            select
                .closest(
                    "[data-smart-select]"
                )
                ?.smartSelect
                ?.setDisabled
                ?.(
                    !!disabled
                );

        }


        return {
            init,
            fill
        };

    })();