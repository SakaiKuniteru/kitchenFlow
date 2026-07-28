const seedHelper =
    require("../../helpers/seed.helper");

const data =
    require("../data/chinh-sach-tai-khoan.data");

async function seedChinhSachTaiKhoan() {

    console.log(
        "Seeding ct_chinh_sach_tai_khoan..."
    );

    await seedHelper({

        table:
            "ct_chinh_sach_tai_khoan",

        unique:
            "chinh_sach_id,tai_khoan_id",

        data,

        transform:
            async (
                client,
                item
            ) => {

                const chinhSach =
                    await client.query(
                        `
                        SELECT id
                        FROM dm_chinh_sach
                        WHERE ma_chinh_sach = $1
                        LIMIT 1
                        `,
                        [
                            item.ma_chinh_sach
                        ]
                    );

                if (
                    chinhSach.rows.length === 0
                ) {

                    throw new Error(
                        `Không tồn tại chính sách: ${item.ma_chinh_sach}`
                    );

                }

                const taiKhoan =
                    await client.query(
                        `
                        SELECT id
                        FROM dm_tai_khoan
                        WHERE ten_dang_nhap = $1
                        LIMIT 1
                        `,
                        [
                            item.ten_dang_nhap
                        ]
                    );

                if (
                    taiKhoan.rows.length === 0
                ) {

                    throw new Error(
                        `Không tồn tại tài khoản: ${item.ten_dang_nhap}`
                    );

                }

                return {

                    chinh_sach_id:
                        chinhSach.rows[0].id,

                    tai_khoan_id:
                        taiKhoan.rows[0].id,

                    active:
                        item.active ?? true

                };

            }

    });

    console.log(
        "✓ ct_chinh_sach_tai_khoan completed"
    );

}

module.exports =
    seedChinhSachTaiKhoan;