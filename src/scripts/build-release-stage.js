'use strict';

const fs = require('fs');
const path = require('path');

const {
    execFileSync
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


const CONFIG = {
    test: {
        sourceRef:
            'refs/kitchenflow/dev',

        targetRef:
            'refs/kitchenflow/test'
    },

    stable: {
        sourceRef:
            'refs/kitchenflow/test',

        targetRef:
            'refs/kitchenflow/stable'
    },

    product1: {
        sourceRef:
            'refs/kitchenflow/stable',

        targetRef:
            'refs/kitchenflow/product1'
    },

    product2: {
        sourceRef:
            'refs/kitchenflow/stable',

        targetRef:
            'refs/kitchenflow/product2'
    }
};


const stageConfig =
    CONFIG[
        STAGE
    ];


if (
    !stageConfig
) {
    throw new Error(
        `Stage không hợp lệ: ${STAGE}`
    );
}


function git(
    args,
    cwd = ROOT
) {
    return execFileSync(
        'git',
        args,
        {
            cwd,

            encoding:
                'utf8',

            stdio: [
                'ignore',
                'pipe',
                'inherit'
            ]
        }
    ).trim();
}


function resolveRef(
    ref
) {
    try {
        return git([
            'rev-parse',
            '--verify',
            ref
        ]);
    } catch {
        return '';
    }
}


const sourceCommit =
    resolveRef(
        stageConfig.sourceRef
    );


if (
    !sourceCommit
) {
    throw new Error(
        [
            '',
            `Không thể build ${STAGE}.`,
            '',
            `Chưa có stage trước: ${stageConfig.sourceRef}`,
            ''
        ].join(
            '\n'
        )
    );
}


const releasesRoot =
    path.join(
        ROOT,
        '.releases'
    );


const stageRoot =
    path.join(
        releasesRoot,
        STAGE
    );


const releaseDirectory =
    path.join(
        stageRoot,
        sourceCommit
    );


fs.mkdirSync(
    stageRoot,
    {
        recursive:
            true
    }
);


/*
 * Nếu commit này chưa được materialize
 * thì tạo một Git worktree riêng.
 */
if (
    !fs.existsSync(
        releaseDirectory
    )
) {
    execFileSync(
        'git',
        [
            'worktree',
            'add',
            '--detach',
            releaseDirectory,
            sourceCommit
        ],
        {
            cwd:
                ROOT,

            stdio:
                'inherit'
        }
    );
}


/*
 * Env không nằm trong Git.
 *
 * Tạo symlink từ release
 * về env private của repo chính.
 */
const sourceEnv =
    path.join(
        ROOT,
        `.env.${STAGE}`
    );


const releaseEnv =
    path.join(
        releaseDirectory,
        `.env.${STAGE}`
    );


if (
    !fs.existsSync(
        sourceEnv
    )
) {
    throw new Error(
        `Không tìm thấy ${sourceEnv}`
    );
}


if (
    fs.existsSync(
        releaseEnv
    ) ||
    fs.lstatSync?.(
        releaseEnv,
        {
            throwIfNoEntry:
                false
        }
    )
) {
    try {
        fs.rmSync(
            releaseEnv,
            {
                force:
                    true
            }
        );
    } catch {
        // bỏ qua
    }
}


fs.symlinkSync(
    sourceEnv,
    releaseEnv
);


/*
 * Cài dependency theo đúng package-lock
 * của commit được promote.
 */
execFileSync(
    'npm',
    [
        'ci'
    ],
    {
        cwd:
            releaseDirectory,

        stdio:
            'inherit'
    }
);


/*
 * Sinh Handlebars client templates.
 */
execFileSync(
    'npm',
    [
        'run',
        'build:templates'
    ],
    {
        cwd:
            releaseDirectory,

        stdio:
            'inherit'
    }
);


/*
 * Build frontend production của stage.
 */
execFileSync(
    'node',
    [
        'src/scripts/build-production.js'
    ],
    {
        cwd:
            releaseDirectory,

        stdio:
            'inherit',

        env: {
            ...process.env,

            APP_ENV:
                STAGE
        }
    }
);


/*
 * Chỉ sau khi build thành công
 * mới đánh dấu stage này đã duyệt commit.
 */
git([
    'update-ref',
    stageConfig.targetRef,
    sourceCommit
]);


/*
 * current -> release commit mới nhất
 */
const currentLink =
    path.join(
        stageRoot,
        'current'
    );


try {
    fs.rmSync(
        currentLink,
        {
            force:
                true,

            recursive:
                true
        }
    );
} catch {
    // bỏ qua
}


fs.symlinkSync(
    releaseDirectory,
    currentLink,
    'dir'
);


console.log('');
console.log(
    `${STAGE.toUpperCase()} build passed.`
);

console.log(
    `Source commit: ${sourceCommit}`
);

console.log(
    `Release: ${releaseDirectory}`
);