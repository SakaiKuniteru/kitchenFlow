'use strict';

const fs = require('fs');
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


if (
    fs.existsSync(
        envFile
    )
) {

    const result =
        dotenv.config({
            path:
                envFile,

            quiet:
                true
        });


    if (
        result.error
    ) {
        throw new Error(
            `Không thể tải file môi trường: ${envFile}`
        );
    }

}


/*
 * Đảm bảo APP_ENV luôn tồn tại
 * sau khi load env.
 */
process.env.APP_ENV = APP_ENV;


const requiredEnvironmentVariables = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET'
];


const missingEnvironmentVariables =
    requiredEnvironmentVariables.filter(
        key =>
            !String(
                process.env[key] ||
                ''
            ).trim()
    );


if (
    missingEnvironmentVariables.length >
    0
) {
    throw new Error(
        [
            'Thiếu cấu hình môi trường:',
            missingEnvironmentVariables.join(', '),
            `Tạo ${envFile} hoặc inject các biến này từ Build Console.`
        ].join(' ')
    );
}

/*
 * ==========================================
 * RELEASE VERSION
 * ==========================================
 *
 * Khi chạy trong:
 *
 * .releases/test/current
 * .releases/stable/current
 * .releases/product1/current
 * .releases/product2/current
 *
 * file release.json sẽ tồn tại.
 *
 * DEV bình thường không có file này.
 * ==========================================
 */

const releaseFile =
    path.join(
        process.cwd(),
        'release.json'
    );


if (
    fs.existsSync(
        releaseFile
    )
) {

    try {

        const releaseInfo =
            JSON.parse(
                fs.readFileSync(
                    releaseFile,
                    'utf8'
                )
            );


        if (
            releaseInfo
                ?.version
        ) {

            process.env
                .APP_VERSION =
                String(
                    releaseInfo
                        .version
                );

        }


        if (
            releaseInfo
                ?.commit
        ) {

            process.env
                .RELEASE_COMMIT =
                String(
                    releaseInfo
                        .commit
                );

        }


        if (
            releaseInfo
                ?.stage
        ) {

            process.env
                .RELEASE_STAGE =
                String(
                    releaseInfo
                        .stage
                );

        }

    } catch (
        error
    ) {

        throw new Error(
            `Không thể đọc release.json: ${error.message}`
        );

    }

}


// console.log(`[KitchenFlow] Environment: ${APP_ENV}`);

// console.log(`[KitchenFlow] Env file: .env.${APP_ENV}`);

console.log(`[KitchenFlow] Version: ${process.env.APP_VERSION || 'DEV'}`);

const app = require('./app');

const env = require('./config/env');

const libreOffice = require('./services/in-bao-cao/in-bao-cao.libreoffice');

async function startServer() {
    try {
        const start = performance.now();

        await libreOffice.start();

        const duration = performance.now() - start;

        // console.log(`LibreOffice report worker ready in ${duration.toFixed(0)} ms`);
    } catch (error) {
        // console.error('Không thể warm LibreOffice:', error);
    }

    app.listen(env.port, () => {
        // console.log(`KitchenFlow running at port ${env.port}`);
    });
}

startServer();
