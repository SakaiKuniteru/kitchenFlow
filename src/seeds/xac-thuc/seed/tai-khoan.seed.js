const md5 = require("../../../utils/md5");

const seedHelper = require("../../helpers/seed.helper");
const data = require("../data/tai-khoan.data");


async function seedTaiKhoan() {

    console.log("Seeding dm_tai_khoan...");

    await seedHelper({

        table: "dm_tai_khoan",

        unique: "ten_dang_nhap",

        data,

        transform: async (client, item) => {

            const result = await client.query(
                `
                SELECT id
                FROM dm_nhan_vien
                WHERE ma_nhan_vien = $1
                `,
                [
                    item.ma_nhan_vien
                ]
            );

            if (result.rows.length === 0) {

                throw new Error(
                    `Không tìm thấy nhân viên: ${item.ma_nhan_vien}`
                );

            }

            const passwordHash = md5.hash(item.mat_khau);

            return {

                nhan_vien_id: result.rows[0].id,

                ten_dang_nhap: item.ten_dang_nhap,

                mat_khau_hash: passwordHash,

                active: item.active

            };

        }

    });

    console.log("✓ dm_tai_khoan completed");

}

module.exports = seedTaiKhoan;