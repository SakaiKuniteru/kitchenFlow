const seedHelper =
    require("../../helpers/seed.helper");

const data =
    require("../data/thiet-lap-nhom-tinh-nang.data");

async function seedThietLapNhomTinhNang() {

    console.log(
        "Seeding dm_thiet_lap_nhom_tinh_nang..."
    );

    await seedHelper({

        table:
            "dm_thiet_lap_nhom_tinh_nang",

        unique: [
            "thiet_lap_id",
            "nhom_tinh_nang_id"
        ],

        data,

        transform:
            async (
                client,
                item
            ) => {

                const thietLap =
                    await client.query(
                        `
                        SELECT
                            id
                        FROM dm_thiet_lap
                        WHERE UPPER(
                            TRIM(ma_thiet_lap)
                        ) = UPPER(
                            TRIM($1)
                        )
                        LIMIT 1
                        `,
                        [
                            item.ma_thiet_lap
                        ]
                    );

                if (
                    thietLap.rows.length === 0
                ) {

                    throw new Error(
                        `Không tìm thấy thiết lập: ${item.ma_thiet_lap}`
                    );

                }

                const nhomTinhNang =
                    await client.query(
                        `
                        SELECT
                            id
                        FROM dm_nhom_tinh_nang
                        WHERE UPPER(
                            TRIM(ma_nhom_tinh_nang)
                        ) = UPPER(
                            TRIM($1)
                        )
                        LIMIT 1
                        `,
                        [
                            item.ma_nhom_tinh_nang
                        ]
                    );

                if (
                    nhomTinhNang.rows.length === 0
                ) {

                    throw new Error(
                        `Không tìm thấy nhóm tính năng: ${item.ma_nhom_tinh_nang}`
                    );

                }

                return {

                    thiet_lap_id:
                        thietLap.rows[0].id,

                    nhom_tinh_nang_id:
                        nhomTinhNang.rows[0].id,

                    active:
                        item.active ?? true

                };

            }

    });

    console.log(
        "✓ dm_thiet_lap_nhom_tinh_nang completed"
    );

}

module.exports =
    seedThietLapNhomTinhNang;