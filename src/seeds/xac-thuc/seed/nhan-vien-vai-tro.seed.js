const seedHelper = require("../../helpers/seed.helper");

const data = require("../data/nhan-vien-vai-tro.data");

async function seedNhanVienVaiTro() {

    console.log("Seeding dm_nhan_vien_vai_tro...");

    await seedHelper({

        table: "dm_nhan_vien_vai_tro",

        unique: "nhan_vien_id,vai_tro_id",

        data,

        transform: async (client, item) => {

            const nhanVien = await client.query(
                `
                SELECT id
                FROM dm_nhan_vien
                WHERE ma_nhan_vien = $1
                `,
                [item.ma_nhan_vien]
            );

            if (nhanVien.rows.length === 0) {
                throw new Error(`Không tìm thấy nhân viên: ${item.ma_nhan_vien}`);
            }

            const vaiTro = await client.query(
                `
                SELECT id
                FROM dm_vai_tro
                WHERE ma_vai_tro = $1
                `,
                [item.ma_vai_tro]
            );

            if (vaiTro.rows.length === 0) {
                throw new Error(`Không tìm thấy vai trò: ${item.ma_vai_tro}`);
            }

            return {

                nhan_vien_id: nhanVien.rows[0].id,

                vai_tro_id: vaiTro.rows[0].id,

                active: item.active

            };

        }

    });

    console.log("✓ dm_nhan_vien_vai_tro completed");

}

module.exports = seedNhanVienVaiTro;