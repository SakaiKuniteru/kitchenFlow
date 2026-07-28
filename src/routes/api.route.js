const express = require("express");

const router = express.Router();

const enumRoute = require("../modules/enums/enum.route");

const xacThucRoute = require("../modules/xac-thuc/xac-thuc.route");

const nhanVienRoute = require("../modules/nhan-vien/nhan-vien.route");

const coSoRoute = require("../modules/co-so/co-so.route");

const phongBanRoute = require("../modules/phong-ban/phong-ban.route");

const chucVuRoute = require("../modules/chuc-vu/chuc-vu.route");

const quocGiaRoute = require("../modules/quoc-gia/quoc-gia.route");

const tinhThanhRoute = require("../modules/tinh-thanh/tinh-thanh.route");

const xaPhuongRoute = require("../modules/xa-phuong/xa-phuong.route");

const vaiTroRoute = require("../modules/vai-tro/vai-tro.route");

const quyenRoute = require("../modules/quyen/quyen.route");

const nhomTinhNangRoute = require("../modules/nhom-tinh-nang/nhom-tinh-nang.route");

const thietLapRoute = require("../modules/thiet-lap/thiet-lap.route");

const taiKhoanRoute = require("../modules/tai-khoan/tai-khoan.route");

const voucherRoute = require("../modules/voucher/voucher.route");

const chinhSachRoute = require("../modules/chinh-sach/chinh-sach.route");

//-------------//

router.use("/enums", enumRoute);

router.use("/auth", xacThucRoute);

router.use("/dm-nhan-vien", nhanVienRoute);

router.use("/dm-co-so", coSoRoute);

router.use("/dm-phong-ban", phongBanRoute);

router.use("/dm-chuc-vu", chucVuRoute);

router.use("/dm-quoc-gia", quocGiaRoute);

router.use("/dm-tinh-thanh", tinhThanhRoute);

router.use("/dm-xa-phuong", xaPhuongRoute);

router.use("/dm-nhom-tinh-nang", nhomTinhNangRoute);

router.use("/dm-quyen", quyenRoute);

router.use("/dm-vai-tro", vaiTroRoute);

router.use("/dm-thiet-lap", thietLapRoute);

router.use("/dm-tai-khoan", taiKhoanRoute);

router.use("/dm-voucher", voucherRoute);

router.use("/dm-chinh-sach", chinhSachRoute);

module.exports = router;