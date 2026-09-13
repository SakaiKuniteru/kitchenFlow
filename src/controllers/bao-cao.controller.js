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

}


module.exports =
    new BaoCaoWebController();