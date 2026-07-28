const seedHelper =
    require("../../helpers/seed.helper");

const data =
    require("../data/chinh-sach.data");

async function seedChinhSach() {

    console.log(
        "Seeding dm_chinh_sach..."
    );

    await seedHelper({

        table:
            "dm_chinh_sach",

        unique:
            "ma_chinh_sach",

        data,

        transform:
            async (
                client,
                item
            ) => {

                const voucherResult =
                    await client.query(
                        `
                        SELECT id
                        FROM dm_voucher
                        WHERE ma_voucher = $1
                        LIMIT 1
                        `,
                        [
                            item.ma_voucher
                        ]
                    );

                if (
                    voucherResult.rows.length === 0
                ) {

                    throw new Error(
                        `Không tồn tại voucher: ${item.ma_voucher}`
                    );

                }

                const duLieu = {
                    ...item,

                    voucher_id:
                        voucherResult.rows[0].id
                };

                delete duLieu.ma_voucher;

                return duLieu;

            }

    });

    console.log(
        "✓ dm_chinh_sach completed"
    );

}

module.exports =
    seedChinhSach;