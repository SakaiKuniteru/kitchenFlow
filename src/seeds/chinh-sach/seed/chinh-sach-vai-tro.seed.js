const seedHelper =
    require("../../helpers/seed.helper");

const data =
    require("../data/chinh-sach-vai-tro.data");

async function seedChinhSachVaiTro() {

    console.log(
        "Seeding ct_chinh_sach_vai_tro..."
    );

    await seedHelper({

        table:
            "ct_chinh_sach_vai_tro",

        unique:
            "chinh_sach_id,vai_tro_id",

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

                const vaiTro =
                    await client.query(
                        `
                        SELECT id
                        FROM dm_vai_tro
                        WHERE ma_vai_tro = $1
                        LIMIT 1
                        `,
                        [
                            item.ma_vai_tro
                        ]
                    );

                if (
                    vaiTro.rows.length === 0
                ) {

                    throw new Error(
                        `Không tồn tại vai trò: ${item.ma_vai_tro}`
                    );

                }

                return {

                    chinh_sach_id:
                        chinhSach.rows[0].id,

                    vai_tro_id:
                        vaiTro.rows[0].id,

                    active:
                        item.active ?? true

                };

            }

    });

    console.log(
        "✓ ct_chinh_sach_vai_tro completed"
    );

}

module.exports =
    seedChinhSachVaiTro;