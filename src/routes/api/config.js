const routes = [

    [
        "/enums",
        require(
            "../../modules/enums/enum.route"
        )
    ],

    [
        "/auth",
        require(
            "../../modules/xac-thuc/xac-thuc.route"
        )
    ],

    [
        "/dm-nhan-vien",
        require(
            "../../modules/nhan-vien/nhan-vien.route"
        )
    ],

    [
        "/dm-co-so",
        require(
            "../../modules/co-so/co-so.route"
        )
    ],

    [
        "/dm-phong-ban",
        require(
            "../../modules/phong-ban/phong-ban.route"
        )
    ],

    [
        "/dm-chuc-vu",
        require(
            "../../modules/chuc-vu/chuc-vu.route"
        )
    ],

    [
        "/dm-quoc-gia",
        require(
            "../../modules/quoc-gia/quoc-gia.route"
        )
    ],

    [
        "/dm-tinh-thanh",
        require(
            "../../modules/tinh-thanh/tinh-thanh.route"
        )
    ],

    [
        "/dm-xa-phuong",
        require(
            "../../modules/xa-phuong/xa-phuong.route"
        )
    ],

    [
        "/dm-nhom-tinh-nang",
        require(
            "../../modules/nhom-tinh-nang/nhom-tinh-nang.route"
        )
    ],

    [
        "/dm-quyen",
        require(
            "../../modules/quyen/quyen.route"
        )
    ],

    [
        "/dm-vai-tro",
        require(
            "../../modules/vai-tro/vai-tro.route"
        )
    ],

    [
        "/dm-thiet-lap",
        require(
            "../../modules/thiet-lap/thiet-lap.route"
        )
    ],

    [
        "/dm-tai-khoan",
        require(
            "../../modules/tai-khoan/tai-khoan.route"
        )
    ],

    [
        "/dm-voucher",
        require(
            "../../modules/voucher/voucher.route"
        )
    ],

    [
        "/dm-chinh-sach",
        require(
            "../../modules/chinh-sach/chinh-sach.route"
        )
    ],

    [
        "/dm-don-vi-tinh",
        require(
            "../../modules/don-vi-tinh/don-vi-tinh.route"
        )
    ],

    [
        "/dm-nha-an",
        require(
            "../../modules/nha-an/nha-an.route"
        )
    ],

    [
        "/dm-ca-an",
        require(
            "../../modules/ca-an/ca-an.route"
        )
    ],

    [
        "/dm-nhom-mon-an",
        require(
            "../../modules/nhom-mon-an/nhom-mon-an.route"
        )
    ],

    [
        "/dm-mon-an",
        require(
            "../../modules/mon-an/mon-an.route"
        )
    ],

    [
        "/dm-thuc-pham",
        require(
            "../../modules/thuc-pham/thuc-pham.route"
        )
    ],

];

module.exports = routes;