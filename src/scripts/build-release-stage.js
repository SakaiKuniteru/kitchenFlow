'use strict';

const fs = require(
    'fs'
);

const path = require(
    'path'
);

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

function normalizeVersion(
    value
) {

    const text =
        String(
            value ||
            ''
        )
            .trim();


    if (
        !text
    ) {

        throw new Error(
            [
                '',
                `Thiếu version khi build ${STAGE}.`,
                '',
                'Ví dụ:',
                '',
                `npm run build:${STAGE} -- 1.0`,
                `npm run build:${STAGE} -- 1.0.10`,
                `npm run build:${STAGE} -- 10.10.10.10`,
                `npm run build:${STAGE} -- 10.1.10.0.11`,
                ''
            ].join(
                '\n'
            )
        );

    }

    const match =
        text.match(
            /^(?:MCS_)?(\d+(?:\.\d+){1,4})$/i
        );


    if (
        !match
    ) {

        throw new Error(
            [
                '',
                `Version không hợp lệ: ${text}`,
                '',
                'Định dạng hợp lệ:',
                '',
                '1.0',
                '1.0.10',
                '10.10.10.10',
                '10.1.10.0.11',
                '',
                'Có thể thêm prefix:',
                '',
                'MCS_1.0',
                'MCS_1.0.10',
                'MCS_10.10.10.10',
                'MCS_10.1.10.0.11',
                ''
            ].join(
                '\n'
            )
        );

    }

    const version =
        match[1]
            .split(
                '.'
            )
            .map(
                segment =>
                    segment.replace(
                        /^0+(?=\d)/,
                        ''
                    )
            )
            .join(
                '.'
            );


    return (
        `MCS_${version}`
    );

}

const VERSION =
    normalizeVersion(
        process.argv[3]
    );

const CONFIG = {

    test: {
        sourceStage:
            'dev'
    },

    stable: {
        sourceStage:
            'test'
    },

    product1: {
        sourceStage:
            'stable'
    },

    product2: {
        sourceStage:
            'stable'
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


function buildVersionRef(
    stage,
    version
) {

    return (
        `refs/kitchenflow/${stage}/${version}`
    );
}


const targetVersionRef =
    buildVersionRef(
        STAGE,
        VERSION
    );


const existingTargetCommit =
    resolveRef(
        targetVersionRef
    );


let sourceRef =
    '';

let sourceCommit =
    '';


if (
    STAGE ===
    'test'
) {

    if (
        existingTargetCommit
    ) {

        sourceRef =
            targetVersionRef;


        sourceCommit =
            existingTargetCommit;

    } else {

        sourceRef =
            'refs/kitchenflow/dev';


        sourceCommit =
            resolveRef(
                sourceRef
            );

    }

} else {

    sourceRef =
        buildVersionRef(
            stageConfig.sourceStage,
            VERSION
        );


    sourceCommit =
        resolveRef(
            sourceRef
        );

}

if (
    !sourceCommit
) {

    throw new Error(
        [
            '',
            `Không thể build ${STAGE}.`,
            '',
            `Version: ${VERSION}`,
            '',
            'Chưa có phiên bản ở stage trước:',
            '',
            sourceRef,
            ''
        ].join(
            '\n'
        )
    );

}

if (
    existingTargetCommit &&
    existingTargetCommit !==
        sourceCommit
) {

    throw new Error(
        [
            '',
            `Không thể build ${STAGE}.`,
            '',
            `Version ${VERSION} đã tồn tại.`,
            '',
            `Commit hiện tại của version:`,
            existingTargetCommit,
            '',
            'Commit source mới:',
            sourceCommit,
            '',
            'Một version không được thay đổi commit.',
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


const versionRoot =
    path.join(
        stageRoot,
        VERSION
    );


const releaseDirectory =
    path.join(
        versionRoot,
        sourceCommit
    );


fs.mkdirSync(
    versionRoot,
    {
        recursive:
            true
    }
);

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


fs.symlinkSync(
    sourceEnv,
    releaseEnv
);

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
                STAGE,

            APP_VERSION:
                VERSION
        }
    }
);

const releaseMetadata = {

    stage:
        STAGE,

    version:
        VERSION,

    commit:
        sourceCommit,

    sourceRef,

    builtAt:
        new Date()
            .toISOString()

};


fs.writeFileSync(
    path.join(
        releaseDirectory,
        'release.json'
    ),

    JSON.stringify(
        releaseMetadata,
        null,
        2
    ),

    'utf8'
);

git([
    'update-ref',
    targetVersionRef,
    sourceCommit
]);

git([
    'update-ref',
    `refs/kitchenflow/current/${STAGE}`,
    sourceCommit
]);

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
    `Version: ${VERSION}`
);

console.log(
    `Source: ${sourceRef}`
);

console.log(
    `Commit: ${sourceCommit}`
);

console.log(
    `Release: ${releaseDirectory}`
);

console.log(
    `Ref: ${targetVersionRef}`
);