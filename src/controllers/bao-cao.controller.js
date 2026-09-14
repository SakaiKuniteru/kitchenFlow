'use strict';

const { renderPage } = require('../utils/render-page.util');


function renderBaoCaoPage(
    req,
    res,
    view,
    options = {}
) {
    return renderPage(
        req,
        res,
        view,
        {
            layout: 'app',

            activeMenu:
                'bao-cao',

            ...options
        }
    );
}


class BaoCaoWebController {

    /*
     * ==========================================
     * TÀI CHÍNH
     * ==========================================
     */

    async tc01(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/tai-chinh/tc01',
                {
                    title:
                        'TC01. Báo cáo chi tiết thu chi',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'TC01'
                        }
                    ],

                    maBaoCao:
                        'TC01',

                    tenBaoCao:
                        'Báo cáo chi tiết thu chi'
                }
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }
    }

    async tc02(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/tai-chinh/tc02',
                {

                    title:
                        'TC02. Báo cáo đối soát thanh toán',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'TC02'
                        }
                    ],

                    maBaoCao:
                        'TC02',

                    tenBaoCao:
                        'Báo cáo đối soát thanh toán'

                }
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }
    }

    async tc03(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/tai-chinh/tc03',
                {

                    title:
                        'TC03. Báo cáo các khoản chưa thanh toán',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'TC03'
                        }
                    ],

                    maBaoCao:
                        'TC03',

                    tenBaoCao:
                        'Báo cáo các khoản chưa thanh toán'

                }
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }
    }
}


module.exports =
    new BaoCaoWebController();