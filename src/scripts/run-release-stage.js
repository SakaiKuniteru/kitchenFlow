'use strict';

const fs = require(
    'fs'
);

const path = require(
    'path'
);

const {
    spawnSync
} = require(
    'child_process'
);


const ROOT =
    process.cwd();


const STAGE =
    String(
        process.argv[2] ||
        ''
    )
        .trim()
        .toLowerCase();


const VERSION =
    String(
        process.argv[3] ||
        ''
    )
        .trim();


const ALLOWED_STAGES =
    new Set([
        'test',
        'stable',
        'product1',
        'product2'
    ]);


if (
    !ALLOWED_STAGES.has(
        STAGE
    )
) {

    throw new Error(
        `Stage không hợp lệ: ${STAGE}`
    );

}


function runNpm(
    args
) {

    const result =
        spawnSync(
            'npm',
            args,
            {
                cwd:
                    ROOT,

                stdio:
                    'inherit',

                env:
                    process.env
            }
        );


    if (
        result.error
    ) {

        throw result.error;

    }


    if (
        result.status !==
        0
    ) {

        process.exit(
            result.status ||
            1
        );

    }

}


/*
 * ==========================================
 * CÓ VERSION
 * ==========================================
 *
 * Build đúng version trước,
 * sau đó start stage.
 * ==========================================
 */

if (
    VERSION
) {

    runNpm([
        'run',
        `build:${STAGE}`,
        '--',
        VERSION
    ]);

}


/*
 * ==========================================
 * KHÔNG CÓ VERSION
 * ==========================================
 *
 * Không build.
 *
 * Chỉ chạy release "current"
 * đã build gần nhất.
 * ==========================================
 */

if (
    !VERSION
) {

    const currentRelease =
        path.join(
            ROOT,
            '.releases',
            STAGE,
            'current'
        );


    if (
        !fs.existsSync(
            currentRelease
        )
    ) {

        throw new Error(
            [
                '',
                `Chưa có ${STAGE.toUpperCase()} release để chạy.`,
                '',
                'Hãy build một version trước.',
                '',
                `Ví dụ:`,
                '',
                `npm run ${STAGE} -- MCS_1.0.1`,
                ''
            ].join(
                '\n'
            )
        );

    }

}


/*
 * ==========================================
 * START STAGE
 * ==========================================
 */

runNpm([
    'run',
    `start:${STAGE}`
]);