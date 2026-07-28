const seedHelper =
    require("../../helpers/seed.helper");

const data =
    require("../data/chinh-sach-chuc-vu.data");

async function seedChinhSachChucVu() {

    console.log(
        "Seeding ct_chinh_sach_chuc_vu..."
    );

    await seedHelper({

        table:
            "ct_chinh_sach_chuc_vu",

        unique:
            "chinh_sach_id,chuc_vu_id",

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

                const chucVu =
                    await client.query(
                        `
                        SELECT id
                        FROM dm_chuc_vu
                        WHERE ma_chuc_vu = $1
                        LIMIT 1
                        `,
                        [
                            item.ma_chuc_vu
                        ]
                    );

                if (
                    chucVu.rows.length === 0
                ) {

                    throw new Error(
                        `Không tồn tại chức vụ: ${item.ma_chuc_vu}`
                    );

                }

                return {

                    chinh_sach_id:
                        chinhSach.rows[0].id,

                    chuc_vu_id:
                        chucVu.rows[0].id,

                    active:
                        item.active ?? true

                };

            }

    });

    console.log(
        "✓ ct_chinh_sach_chuc_vu completed"
    );

}

module.exports =
    seedChinhSachChucVu;