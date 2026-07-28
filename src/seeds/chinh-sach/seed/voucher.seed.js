const seedHelper = require("../../helpers/seed.helper");

const data = require("../data/voucher.data");

async function seedVoucher() {

    console.log("Seeding dm_voucher...");

    await seedHelper({

        table: "dm_voucher",

        unique: "ma_voucher",

        data

    });

    console.log("✓ dm_voucher completed");

}

module.exports = seedVoucher;