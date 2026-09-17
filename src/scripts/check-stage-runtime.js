'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const {
    Client
} = require('pg');


const STAGE =
    String(
        process.argv[2] ||
        ''
    )
        .trim()
        .toLowerCase();


if (
    ![
        'dev',
        'test',
        'stable',
        'product1',
        'product2'
    ].includes(STAGE)) {
    throw new Error(
        'Stage không hợp lệ. Ví dụ: npm run check:stage -- product1'
    );
}


const envFile =
    path.join(
        process.cwd(),
        `.env.${STAGE}`
    );


let fileValues =
    {};


if (
    fs.existsSync(
        envFile
    )
) {
    fileValues =
        dotenv.parse(
            fs.readFileSync(
                envFile,
                'utf8'
            )
        );
}


const values = {
    ...fileValues,
    ...process.env
};


const requiredKeys = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER'
];


const missingKeys =
    requiredKeys.filter(
        key =>
            !String(
                values[key] ||
                ''
            ).trim()
    );


if (
    missingKeys.length >
    0
) {
    throw new Error(
        `Thiếu cấu hình database cho ${STAGE}: ${missingKeys.join(', ')}`
    );
}


const client =
    new Client({
        host:
            values.DB_HOST,

        port:
            values.DB_PORT,

        database:
            values.DB_NAME,

        user:
            values.DB_USER,

        password:
            values.DB_PASSWORD,

        connectionTimeoutMillis:
            5000
    });


async function main() {
    await client.connect();

    const result =
        await client.query(
            'SELECT current_database() AS database, current_user AS user'
        );


    const row =
        result.rows[0];


    console.log(
        `[KitchenFlow] ${STAGE} database connected: ${row.database} (${row.user})`
    );
}


function formatDatabaseError(
    error
) {
    const details =
        [];


    if (
        error &&
        error.message
    ) {
        details.push(
            error.message
        );
    }


    if (
        error &&
        error.code
    ) {
        details.push(
            `code=${error.code}`
        );
    }


    if (
        error &&
        error.errno &&
        error.errno !==
        error.code
    ) {
        details.push(
            `errno=${error.errno}`
        );
    }


    return details.join(
        '; '
    ) ||
        (error && error.name) ||
        'unknown error';
}


main()
    .catch(
        error => {
            console.error(
                `[KitchenFlow] ${STAGE} database check failed: ${formatDatabaseError(error)}`
            );

            process.exitCode =
                1;
        }
    )
    .finally(
        async () => {
            await client.end().catch(
                () => {}
            );
        }
    );
