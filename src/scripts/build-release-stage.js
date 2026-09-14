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


/*
 * ==========================================
 * STAGE
 * ==========================================
 */

const STAGE =
    String(
        process.argv[2] ||
        ''
    )
        .trim()
        .toLowerCase();


/*
 * ==========================================
 * VERSION
 * ==========================================
 *
 * Hỗ trợ:
 *
 * 1.1.1
 * MCS_1.1.1
 *
 * Luôn chuẩn hóa thành:
 *
 * MCS_1.1.1
 * ==========================================
 */

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
                `npm run build:${STAGE} -- MCS_1.1.1`,
                '',
                'hoặc:',
                '',
                `npm run build:${STAGE} -- 1.1.1`,
                ''
            ].join(
                '\n'
            )
        );

    }


    const match =
        text.match(
            /^(?:MCS_)?(\d+)\.(\d+)\.(\d+)$/i
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
                '1.1.1',
                'MCS_1.1.1',
                ''
            ].join(
                '\n'
            )
        );

    }


    return (
        `MCS_${match[1]}.${match[2]}.${match[3]}`
    );
}


const VERSION =
    normalizeVersion(
        process.argv[3]
    );


/*
 * ==========================================
 * CẤU HÌNH LUỒNG PROMOTE
 * ==========================================
 *
 * DEV
 *   ↓
 * TEST
 *   ↓
 * STABLE
 *   ↓
 * PRODUCT1 / PRODUCT2
 * ==========================================
 */

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


/*
 * ==========================================
 * GIT
 * ==========================================
 */

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


/*
 * ==========================================
 * REF
 * ==========================================
 *
 * Ví dụ:
 *
 * refs/kitchenflow/test/MCS_1.1.1
 * refs/kitchenflow/stable/MCS_1.1.1
 * refs/kitchenflow/product1/MCS_1.1.1
 * ==========================================
 */

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


/*
 * ==========================================
 * TEST
 * ==========================================
 *
 * TEST là nơi VERSION được tạo lần đầu.
 *
 * Nếu version chưa tồn tại:
 *
 * DEV hiện tại
 *     ↓
 * TEST/version
 *
 *
 * Nếu version đã tồn tại:
 *
 * TEST/version cũ
 *     ↓
 * rebuild đúng commit cũ
 *
 * KHÔNG lấy DEV mới.
 * ==========================================
 */

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

    /*
     * ======================================
     * STABLE / PRODUCT
     * ======================================
     *
     * Phải lấy đúng cùng VERSION
     * của stage trước.
     * ======================================
     */

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


/*
 * ==========================================
 * KIỂM TRA SOURCE VERSION
 * ==========================================
 */

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


/*
 * ==========================================
 * VERSION BẤT BIẾN
 * ==========================================
 *
 * Một version không được đổi commit.
 *
 * Ví dụ:
 *
 * MCS_1.1.1 = commit A
 *
 * thì sau này không được biến
 * MCS_1.1.1 thành commit B.
 * ==========================================
 */

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


/*
 * ==========================================
 * RELEASE DIRECTORY
 * ==========================================
 *
 * .releases/
 *
 * test/
 *   MCS_1.1.1/
 *     <commit>/
 *
 * stable/
 *   MCS_1.1.1/
 *     <commit>/
 *
 * product1/
 *   MCS_1.1.1/
 *     <commit>/
 * ==========================================
 */

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


/*
 * ==========================================
 * MATERIALIZE COMMIT
 * ==========================================
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
 * ==========================================
 * ENV
 * ==========================================
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


/*
 * ==========================================
 * DEPENDENCY
 * ==========================================
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
 * ==========================================
 * CLIENT TEMPLATES
 * ==========================================
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
 * ==========================================
 * PRODUCTION ASSETS
 * ==========================================
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
                STAGE,

            APP_VERSION:
                VERSION
        }
    }
);


/*
 * ==========================================
 * RELEASE METADATA
 * ==========================================
 *
 * File này KHÔNG nằm trong Git.
 *
 * Mỗi release tự biết:
 *
 * - stage
 * - version
 * - commit
 * - source
 * - thời gian build
 * ==========================================
 */

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


/*
 * ==========================================
 * VERSION REF
 * ==========================================
 *
 * Chỉ update sau khi build thành công.
 * ==========================================
 */

git([
    'update-ref',
    targetVersionRef,
    sourceCommit
]);


/*
 * ==========================================
 * CURRENT STAGE REF
 * ==========================================
 *
 * Không dùng:
 *
 * refs/kitchenflow/test
 *
 * vì sẽ xung đột với:
 *
 * refs/kitchenflow/test/MCS_1.0.1
 *
 * Current stage được lưu riêng:
 *
 * refs/kitchenflow/current/test
 * refs/kitchenflow/current/stable
 * refs/kitchenflow/current/product1
 * refs/kitchenflow/current/product2
 * ==========================================
 */

git([
    'update-ref',
    `refs/kitchenflow/current/${STAGE}`,
    sourceCommit
]);


/*
 * ==========================================
 * CURRENT SYMLINK
 * ==========================================
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


/*
 * ==========================================
 * RESULT
 * ==========================================
 */

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