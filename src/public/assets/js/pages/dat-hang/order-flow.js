'use strict';

(() => {
    const assetRoot =
        document.querySelector(
            '[data-order-flow-assets]'
        );


    if (!assetRoot) {
        throw new Error(
            'Không tìm thấy cấu hình asset cho luồng đặt hàng.'
        );
    }


    const pageScripts = {
        catalog:
            assetRoot.dataset
                .pageCatalog,

        delivery:
            assetRoot.dataset
                .pageDelivery,

        confirmation:
            assetRoot.dataset
                .pageConfirmation,

        completed:
            assetRoot.dataset
                .pageCompleted,

        'my-orders':
            assetRoot.dataset
                .pageMyOrders,

        'my-order-detail':
            assetRoot.dataset
                .pageMyOrderDetail,

        management:
            assetRoot.dataset
                .pageManagement,

        'management-detail':
            assetRoot.dataset
                .pageManagementDetail
    };


    const commonScripts = {
        core: assetRoot.dataset.commonCore,
        checkout:
            assetRoot.dataset
                .commonCheckout,

        detail:
            assetRoot.dataset
                .commonDetail,

        list:
            assetRoot.dataset
                .commonList,

        pagination:
            assetRoot.dataset
                .commonPagination
    };


    const loading = new Map();

    function loadScript(src) {
        if (loading.has(src)) {
            return loading.get(src);
        }

        const existing =
            [...document.scripts]
                .find((script) => {
                    if (!script.src) {
                        return false;
                    }

                    const currentPath =
                        new URL(
                            script.src,
                            location.origin
                        ).pathname;


                    const targetPath =
                        new URL(
                            src,
                            location.origin
                        ).pathname;


                    return (
                        currentPath ===
                        targetPath
                    );
                });

        if (existing) {
            return Promise.resolve();
        }

        const promise =
            new Promise(
                (
                    resolve,
                    reject
                ) => {
                    const script =
                        document.createElement(
                            'script'
                        );

                    script.src = src;
                    script.defer = true;

                    script.onload =
                        resolve;

                    script.onerror =
                        () => {
                            loading.delete(
                                src
                            );

                            reject(
                                new Error(
                                    `Không tải được ${src}.`
                                )
                            );
                        };

                    document.head
                        .appendChild(
                            script
                        );
                }
            );

        loading.set(
            src,
            promise
        );

        return promise;
    }

    async function loadDependencies(
        page
    ) {
        if (
            !window.MCS?.orders
                ?.initialize
        ) {
            await loadScript(
                commonScripts.core
            );
        }

        if (
            [
                'catalog',
                'my-orders',
                'management'
            ].includes(page) &&
            !window.MCS
                ?.catalog
                ?.Pagination
        ) {
            await loadScript(
                commonScripts.pagination
            );
        }

        if (
            [
                'delivery',
                'confirmation'
            ].includes(page)
        ) {
            await loadScript(
                commonScripts.checkout
            );
        }

        if (
            [
                'completed',
                'my-order-detail',
                'management',
                'management-detail'
            ].includes(page)
        ) {
            await loadScript(
                commonScripts.detail
            );
        }

        if (
            [
                'my-orders',
                'management'
            ].includes(page)
        ) {
            if (
                !window.MCS.orders
                    .createOrderDetailController
            ) {
                await loadScript(
                    commonScripts.detail
                );
            }

            await loadScript(
                commonScripts.list
            );
        }
    }

    async function bootstrap() {
        const root =
            document.querySelector(
                '[data-order-page]'
            );

        if (
            !root ||
            !MCS.storage
                .getAccessToken()
        ) {
            return;
        }

        const page =
            root.dataset.orderPage;

        const PAGE_PERMISSIONS = {

            catalog:
                'Q002021',

            delivery:
                'Q002021',

            confirmation:
                'Q002021',

            completed:
                'Q002021',

            'my-orders':
                'Q002021',

            'my-order-detail':
                'Q002021',

            management:
                'Q002041',

            'management-detail':
                'Q002041'

        };

        try {
            await loadDependencies(
                page
            );

            const pageScript =
                pageScripts[page];

            if (!pageScript) {
                throw new Error(
                    `Chưa cấu hình JavaScript cho trang "${page}".`
                );
            }

            await loadScript(
                pageScript
            );

            await MCS.orders
                .initialize();

            const pagePermission =
                PAGE_PERMISSIONS[
                    page
                ];


            if (
                pagePermission &&
                !MCS.orders
                    .requirePermission(
                        pagePermission,
                        root
                    )
            ) {

                return;

            }


            MCS.orders
                .hideNoPermission(
                    root
                );

            const initializePage =
                MCS.orders
                    .pages?.[page];

            if (
                typeof initializePage !==
                'function'
            ) {
                throw new Error(
                    `Không tìm thấy hàm khởi tạo trang "${page}".`
                );
            }

            await initializePage({
                root
            });
        } catch (error) {
            console.error(
                `Không thể khởi tạo trang đặt hàng "${page}".`,
                error
            );

            if (
                window.MCS
                    ?.orders
                    ?.mount
            ) {
                MCS.orders.mount(
                    root,
                    'dung-chung',
                    {
                        type: 'empty',

                        title:
                            'Không thể tải trang đặt hàng',

                        description:
                            error.message,

                        retry: true
                    }
                );

                root.querySelector(
                    '[data-retry]'
                )?.addEventListener(
                    'click',
                    () =>
                        location.reload()
                );
            } else {
                MCS.toast?.error?.(
                    error.message
                );
            }
        }
    }

    if (
        document.readyState ===
        'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            bootstrap,
            {
                once: true
            }
        );
    } else {
        void bootstrap();
    }
})();
