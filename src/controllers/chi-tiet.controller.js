"use strict";

const { renderPage } = require("../utils/render-page.util");

class ChiTietWebController {

    async cuaToi(
        req,
        res,
        next
    ) {
        try {
            return renderPage(
                req,
                res,
                "pages/chi-tiet/thong-bao",
                {
                    title: "Thông báo",
                    pageDescription: "Danh sách thông báo của tài khoản.",
                }
            );

        } catch (error) {
            next(error);
        }
    }

    async thucDon(
        req,
        res,
        next
    ) {

        try {

            const {id1, id2 } = req.params;
            return renderPage(
                req,
                res,
                "pages/chi-tiet/thuc-don",
                {
                    title: "Chi tiết thực đơn",
                    pageDescription: "Thông tin chi tiết thực đơn.",
                    thucDonId: id1,
                    thucDonNgayId: id2,
                }
            );

        }
        catch (error) {
            next(error);

        }

    }

}

module.exports =
    new ChiTietWebController();