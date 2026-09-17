'use strict';

const {
    spawnSync
} = require('child_process');


const VERSION =
    String(
        process.argv[2] ||
        ''
    )
        .trim();


if (
    !VERSION
) {
    throw new Error(
        'Thiếu version. Ví dụ: npm run build:release -- 1.0.11'
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
                    process.cwd(),

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


runNpm([
    'run',
    'build:dev'
]);


for (
    const stage of [
        'test',
        'stable',
        'product1',
        'product2'
    ]
) {
    runNpm([
        'run',
        `build:${stage}`,
        '--',
        VERSION
    ]);
}


console.log('');
console.log(
    `KitchenFlow release ${VERSION} completed.`
);
