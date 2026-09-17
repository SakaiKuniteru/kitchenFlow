'use strict';

const fs = require('fs');
const path = require('path');
const {
    spawnSync
} = require('child_process');


const ROOT =
    process.cwd();


function run(
    command,
    args,
    env = process.env
) {
    const result =
        spawnSync(
            command,
            args,
            {
                cwd:
                    ROOT,

                stdio:
                    'inherit',

                env
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


run(
    'npm',
    [
        'run',
        'build:templates'
    ]
);


for (
    const stage of [
        'product1',
        'product2'
    ]
) {
    run(
        process.execPath,
        [
            'src/scripts/build-production.js'
        ],
        {
            ...process.env,

            APP_ENV:
                stage,

            APP_VERSION:
                'CI'
        }
    );

    const manifestPath =
        path.join(
            ROOT,
            'src/public/assets/dist',
            stage,
            'manifest.json'
        );


    if (
        !fs.existsSync(
            manifestPath
        )
    ) {
        throw new Error(
            `Không tạo được manifest: ${manifestPath}`
        );
    }
}


console.log('KitchenFlow production build verification passed.');
