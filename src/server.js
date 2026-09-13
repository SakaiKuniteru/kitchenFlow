'use strict';

const path = require('path');
const dotenv = require('dotenv');


const APP_ENV =
    String(
        process.env.APP_ENV ||
        'dev'
    )
        .trim()
        .toLowerCase();


if (
    !/^[a-z0-9_-]+$/.test(
        APP_ENV
    )
) {
    throw new Error(
        `APP_ENV không hợp lệ: ${APP_ENV}`
    );
}


const envFile =
    path.join(
        process.cwd(),
        `.env.${APP_ENV}`
    );


const result =
    dotenv.config({
        path:
            envFile
    });


if (
    result.error
) {
    throw new Error(
        `Không thể tải file môi trường: ${envFile}`
    );
}


/*
 * Đảm bảo APP_ENV luôn tồn tại
 * sau khi load env.
 */
process.env.APP_ENV =
    APP_ENV;


console.log(
    `[KitchenFlow] Environment: ${APP_ENV}`
);

console.log(
    `[KitchenFlow] Env file: .env.${APP_ENV}`
);


const app =
    require('./app');

const env =
    require('./config/env');

const libreOffice =
    require(
        './services/in-bao-cao/in-bao-cao.libreoffice'
    );

async function startServer() {
    try {
        const start = performance.now();

        await libreOffice.start();

        const duration = performance.now() - start;

        console.log(`LibreOffice report worker ready in ${duration.toFixed(0)} ms`);
    } catch (error) {
        console.error('Không thể warm LibreOffice:', error);
    }

    app.listen(env.port, () => {
        console.log(`KitchenFlow running at port ${env.port}`);
    });
}

startServer();
