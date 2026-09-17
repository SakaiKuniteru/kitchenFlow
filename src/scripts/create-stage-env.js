'use strict';

const fs = require('fs');
const path = require('path');


const STAGE =
    String(
        process.argv[2] ||
        ''
    )
        .trim()
        .toLowerCase();


const FORCE =
    process.argv.slice(3).includes(
        '--force'
    );


const STAGE_DEFAULTS = {
    dev: {
        nodeEnv: 'development',
        port: '3000'
    },

    test: {
        nodeEnv: 'production',
        port: '3103'
    },

    stable: {
        nodeEnv: 'production',
        port: '3104'
    },

    product1: {
        nodeEnv: 'production',
        port: '3101'
    },

    product2: {
        nodeEnv: 'production',
        port: '3102'
    }
};


const defaults =
    STAGE_DEFAULTS[
        STAGE
    ];


if (
    !defaults
) {
    throw new Error(
        'Stage không hợp lệ. Dùng: dev, test, stable, product1 hoặc product2.'
    );
}


const ROOT =
    process.cwd();


const outputFile =
    path.join(
        ROOT,
        `.env.${STAGE}`
    );


if (
    fs.existsSync(
        outputFile
    ) &&
    !FORCE
) {
    throw new Error(
        [
            `File đã tồn tại: ${outputFile}`,
            `Dùng "npm run env:stage -- ${STAGE} --force" để ghi đè.`
        ].join(' ')
    );
}


const prefix =
    STAGE.toUpperCase();


function getValue(
    key,
    fallback = ''
) {
    const stageSpecificValue =
        process.env[
            `${prefix}_${key}`
        ];


    if (
        stageSpecificValue !==
        undefined
    ) {
        return stageSpecificValue;
    }


    const value =
        process.env[key];


    if (
        value !==
        undefined
    ) {
        return value;
    }


    return fallback;
}


const missing =
    [];


function requireValue(
    key
) {
    const value =
        String(
            getValue(key)
        ).trim();


    if (
        !value
    ) {
        missing.push(
            `${prefix}_${key}`
        );
    }


    return value;
}


const provider =
    String(
        getValue(
            'QR_PAYMENT_PROVIDER',
            'TEST'
        )
    )
        .trim()
        .toUpperCase();


const values = {
    NODE_ENV:
        defaults.nodeEnv,

    APP_ENV:
        STAGE,

    PORT:
        String(
            getValue(
                'PORT',
                defaults.port
            )
        ).trim(),

    DB_HOST:
        requireValue(
            'DB_HOST'
        ),

    DB_PORT:
        requireValue(
            'DB_PORT'
        ),

    DB_NAME:
        requireValue(
            'DB_NAME'
        ),

    DB_USER:
        requireValue(
            'DB_USER'
        ),

    DB_PASSWORD:
        String(
            getValue(
                'DB_PASSWORD'
            )
        ),

    ACCESS_TOKEN_SECRET:
        requireValue(
            'ACCESS_TOKEN_SECRET'
        ),

    REFRESH_TOKEN_SECRET:
        requireValue(
            'REFRESH_TOKEN_SECRET'
        ),

    QR_PAYMENT_PROVIDER:
        provider,

    ACCESS_TOKEN_EXPIRES:
        String(
            getValue(
                'ACCESS_TOKEN_EXPIRES'
            )
        ).trim(),

    REFRESH_TOKEN_EXPIRES:
        String(
            getValue(
                'REFRESH_TOKEN_EXPIRES'
            )
        ).trim(),

    FILE_STORAGE_ROOT:
        String(
            getValue(
                'FILE_STORAGE_ROOT'
            )
        ).trim(),

    LIBREOFFICE_BIN:
        String(
            getValue(
                'LIBREOFFICE_BIN'
            )
        ).trim(),

    LIBREOFFICE_PORT:
        String(
            getValue(
                'LIBREOFFICE_PORT'
            )
        ).trim()
};


if (
    provider ===
    'VIETQR'
) {
    values.VIETQR_CLIENT_ID =
        requireValue(
            'VIETQR_CLIENT_ID'
        );

    values.VIETQR_API_KEY =
        requireValue(
            'VIETQR_API_KEY'
        );

    values.VIETQR_ACCOUNT_NO =
        requireValue(
            'VIETQR_ACCOUNT_NO'
        );

    values.VIETQR_ACCOUNT_NAME =
        String(
            getValue(
                'VIETQR_ACCOUNT_NAME'
            )
        ).trim();

    values.VIETQR_ACQ_ID =
        requireValue(
            'VIETQR_ACQ_ID'
        );
}


if (
    missing.length >
    0
) {
    throw new Error(
        [
            `Thiếu secret cho stage ${STAGE}:`,
            missing.join(', '),
            'Build Console có thể truyền biến chung (DB_HOST) hoặc biến theo stage (PRODUCT1_DB_HOST).'
        ].join(' ')
    );
}


const requiredKeys =
    new Set([
        'NODE_ENV',
        'APP_ENV',
        'PORT',
        'DB_HOST',
        'DB_PORT',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'ACCESS_TOKEN_SECRET',
        'REFRESH_TOKEN_SECRET',
        'QR_PAYMENT_PROVIDER'
    ]);


const lines =
    Object.entries(
        values
    )
        .filter(
            ([key, value]) =>
                requiredKeys.has(key) ||
                value
        )
        .map(
            ([key, value]) =>
                `${key}=${JSON.stringify(String(value))}`
        );


fs.writeFileSync(
    outputFile,
    `${lines.join('\n')}\n`,
    {
        encoding:
            'utf8',

        mode:
            0o600
    }
);


fs.chmodSync(
    outputFile,
    0o600
);


console.log(
    `[KitchenFlow] Đã tạo .env.${STAGE} từ biến môi trường.`
);
