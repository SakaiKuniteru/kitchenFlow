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

    async tc04(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/tai-chinh/tc04',
                {

                    title:
                        'TC04. Báo cáo miễn giảm và ưu đãi',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'TC04'
                        }
                    ],

                    maBaoCao:
                        'TC04',

                    tenBaoCao:
                        'Báo cáo miễn giảm và ưu đãi'

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

    async tc05(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/tai-chinh/tc05',
                {

                    title:
                        'TC05. Báo cáo tổng hợp tiền thu theo người thu',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'TC05'
                        }
                    ],

                    maBaoCao:
                        'TC05',

                    tenBaoCao:
                        'Báo cáo tổng hợp tiền thu theo người thu'

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

    /*
     * ==========================================
     * ĐẶT MÓN
     * ==========================================
     */

    async dh01(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/dat-mon/dh01',
                {

                    title:
                        'DH01. Báo cáo tổng hợp đơn hàng',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'DH01'
                        }
                    ],

                    maBaoCao:
                        'DH01',

                    tenBaoCao:
                        'Báo cáo tổng hợp đơn hàng'

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

    async dh02(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/dat-mon/dh02',
                {

                    title:
                        'DH02. Báo cáo chi tiết đơn hàng',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'DH02'
                        }
                    ],

                    maBaoCao:
                        'DH02',

                    tenBaoCao:
                        'Báo cáo chi tiết đơn hàng'

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

    async dh03(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/dat-mon/dh03',
                {

                    title:
                        'DH03. Báo cáo số lượng món và dịch vụ đã đặt',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'DH03'
                        }
                    ],

                    maBaoCao:
                        'DH03',

                    tenBaoCao:
                        'Báo cáo số lượng món và dịch vụ đã đặt'

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

    async dh04(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/dat-mon/dh04',
                {

                    title:
                        'DH04. Báo cáo đơn hàng cần chuẩn bị và giao',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'DH04'
                        }
                    ],

                    maBaoCao:
                        'DH04',

                    tenBaoCao:
                        'Báo cáo đơn hàng cần chuẩn bị và giao'

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

    async dh05(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/dat-mon/dh05',
                {

                    title:
                        'DH05. Báo cáo tiến độ xử lý và giao hàng',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'DH05'
                        }
                    ],

                    maBaoCao:
                        'DH05',

                    tenBaoCao:
                        'Báo cáo tiến độ xử lý và giao hàng'

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

    async dh06(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/dat-mon/dh06',
                {

                    title:
                        'DH06. Báo cáo đơn hàng hủy và từ chối',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'DH06'
                        }
                    ],

                    maBaoCao:
                        'DH06',

                    tenBaoCao:
                        'Báo cáo đơn hàng hủy và từ chối'

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

    async dh07(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/dat-mon/dh07',
                {

                    title:
                        'DH07. Báo cáo đặt hàng theo nhân viên và phòng ban',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'DH07'
                        }
                    ],

                    maBaoCao:
                        'DH07',

                    tenBaoCao:
                        'Báo cáo đặt hàng theo nhân viên và phòng ban'

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

    /*
     * ==========================================
     * VÉ ĂN
     * ==========================================
     */

    async va01(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/ve-an/va01',
                {

                    title:
                        'VA01. Báo cáo tổng hợp vé ăn',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'VA01'
                        }
                    ],

                    maBaoCao:
                        'VA01',

                    tenBaoCao:
                        'Báo cáo tổng hợp vé ăn'

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

    async va02(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/ve-an/va02',
                {

                    title:
                        'VA02. Báo cáo chi tiết vé ăn',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'VA02'
                        }
                    ],

                    maBaoCao:
                        'VA02',

                    tenBaoCao:
                        'Báo cáo chi tiết vé ăn'

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

    async va03(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/ve-an/va03',
                {

                    title:
                        'VA03. Báo cáo đăng ký và sử dụng vé ăn',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'VA03'
                        }
                    ],

                    maBaoCao:
                        'VA03',

                    tenBaoCao:
                        'Báo cáo đăng ký và sử dụng vé ăn'

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

    async va04(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/ve-an/va04',
                {

                    title:
                        'VA04. Báo cáo suất ăn theo phòng ban',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'VA04'
                        }
                    ],

                    maBaoCao:
                        'VA04',

                    tenBaoCao:
                        'Báo cáo suất ăn theo phòng ban'

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

    async va05(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/ve-an/va05',
                {

                    title:
                        'VA05. Báo cáo vé ăn hủy',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'VA05'
                        }
                    ],

                    maBaoCao:
                        'VA05',

                    tenBaoCao:
                        'Báo cáo vé ăn hủy'

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

    /*
     * ==========================================
     * THỰC ĐƠN
     * ==========================================
     */

    async td01(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/thuc-don/td01',
                {

                    title:
                        'TD01. Báo cáo thực đơn theo ngày, tuần, tháng',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'TD01'
                        }
                    ],

                    maBaoCao:
                        'TD01',

                    tenBaoCao:
                        'Báo cáo thực đơn theo ngày, tuần, tháng'

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

    async td02(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/thuc-don/td02',
                {

                    title:
                        'TD02. Báo cáo chi tiết món ăn trong thực đơn',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'TD02'
                        }
                    ],

                    maBaoCao:
                        'TD02',

                    tenBaoCao:
                        'Báo cáo chi tiết món ăn trong thực đơn'

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

    async td03(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/thuc-don/td03',
                {

                    title:
                        'TD03. Báo cáo tần suất và món ăn trùng lặp',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'TD03'
                        }
                    ],

                    maBaoCao:
                        'TD03',

                    tenBaoCao:
                        'Báo cáo tần suất và món ăn trùng lặp'

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

    async td04(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/thuc-don/td04',
                {

                    title:
                        'TD04. Báo cáo nhu cầu nguyên liệu theo thực đơn',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'TD04'
                        }
                    ],

                    maBaoCao:
                        'TD04',

                    tenBaoCao:
                        'Báo cáo nhu cầu nguyên liệu theo thực đơn'

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

    async td05(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/thuc-don/td05',
                {

                    title:
                        'TD05. Báo cáo kết quả bình chọn suất ăn',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'TD05'
                        }
                    ],

                    maBaoCao:
                        'TD05',

                    tenBaoCao:
                        'Báo cáo kết quả bình chọn suất ăn'

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

    async td06(
        req,
        res,
        next
    ) {
        try {

            return renderBaoCaoPage(
                req,
                res,
                'pages/bao-cao/thuc-don/td06',
                {

                    title:
                        'TD06. Báo cáo tình trạng lập và duyệt thực đơn',

                    breadcrumbs: [
                        {
                            label:
                                'Báo cáo'
                        },
                        {
                            label:
                                'TD06'
                        }
                    ],

                    maBaoCao:
                        'TD06',

                    tenBaoCao:
                        'Báo cáo tình trạng lập và duyệt thực đơn'

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


module.exports = new BaoCaoWebController();