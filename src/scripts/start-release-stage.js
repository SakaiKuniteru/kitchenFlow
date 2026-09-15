'use strict';

const fs = require(
    'fs'
);

const path = require(
    'path'
);

const {
    spawn
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


const STAGE_ROOT =
    path.join(
        ROOT,
        '.releases',
        STAGE
    );


const CURRENT_LINK =
    path.join(
        STAGE_ROOT,
        'current'
    );


let child =
    null;


let currentRelease =
    null;


let shuttingDown =
    false;


let restarting =
    false;


/*
 * ==========================================
 * LẤY RELEASE HIỆN TẠI
 * ==========================================
 */

function getCurrentRelease() {

    try {

        if (
            !fs.existsSync(
                CURRENT_LINK
            )
        ) {
            return null;
        }


        const stat =
            fs.lstatSync(
                CURRENT_LINK
            );


        const directory =
            fs.realpathSync(
                CURRENT_LINK
            );


        /*
         * signature gồm:
         *
         * - release thật
         * - thời điểm symlink current được tạo
         *
         * Nhờ vậy kể cả build lại cùng version
         * và current vẫn trỏ cùng thư mục,
         * supervisor vẫn nhận biết current
         * vừa được cập nhật.
         */

        return {

            directory,

            signature:
                [
                    directory,
                    stat.mtimeMs
                ].join(
                    ':'
                )

        };

    } catch {

        /*
         * Trong lúc build:
         *
         * current có thể vừa bị xóa
         * và chưa tạo lại.
         *
         * Không coi đây là lỗi.
         */

        return null;

    }

}


/*
 * ==========================================
 * START SERVER CON
 * ==========================================
 */

function startChild(
    release
) {

    console.log('');

    console.log(
        `[KitchenFlow] Starting ${STAGE.toUpperCase()}`
    );

    console.log(
        `[KitchenFlow] Release: ${release.directory}`
    );


    child =
        spawn(
            process.execPath,
            [
                'src/server.js'
            ],
            {
                cwd:
                    release.directory,

                stdio:
                    'inherit',

                env: {
                    ...process.env,

                    APP_ENV:
                        STAGE
                }
            }
        );


    child.once(
        'exit',
        (
            code,
            signal
        ) => {

            child =
                null;


            if (
                shuttingDown ||
                restarting
            ) {
                return;
            }


            console.log('');

            console.log(
                [
                    `[KitchenFlow] ${STAGE.toUpperCase()} server stopped.`,
                    `code=${code}`,
                    `signal=${signal || '-'}`
                ].join(
                    ' '
                )
            );

        }
    );

}


/*
 * ==========================================
 * STOP SERVER CON
 * ==========================================
 */

function stopChild() {

    return new Promise(
        resolve => {

            if (
                !child
            ) {

                resolve();

                return;

            }


            const processToStop =
                child;


            if (
                processToStop.exitCode !==
                null
            ) {

                resolve();

                return;

            }


            let settled =
                false;


            const finish =
                () => {

                    if (
                        settled
                    ) {
                        return;
                    }


                    settled =
                        true;


                    resolve();

                };


            processToStop.once(
                'exit',
                finish
            );


            /*
             * Cho Express dừng trước.
             */

            processToStop.kill(
                'SIGTERM'
            );


            /*
             * Nếu sau 5 giây vẫn chưa dừng
             * thì force.
             */

            const timer =
                setTimeout(
                    () => {

                        if (
                            processToStop.exitCode ===
                            null
                        ) {

                            processToStop.kill(
                                'SIGKILL'
                            );

                        }


                        finish();

                    },
                    5000
                );


            timer.unref();

        }
    );

}


/*
 * ==========================================
 * RESTART
 * ==========================================
 */

async function restart(
    release
) {

    if (
        restarting ||
        shuttingDown
    ) {
        return;
    }


    restarting =
        true;


    try {

        if (
            child
        ) {

            console.log('');

            console.log(
                `[KitchenFlow] ${STAGE.toUpperCase()} release changed. Restarting...`
            );


            await stopChild();

        }


        currentRelease =
            release;


        startChild(
            release
        );

    } finally {

        restarting =
            false;

    }

}


/*
 * ==========================================
 * KIỂM TRA CURRENT
 * ==========================================
 */

async function checkCurrentRelease() {

    if (
        shuttingDown ||
        restarting
    ) {
        return;
    }


    const release =
        getCurrentRelease();


    /*
     * Build đang ở giữa lúc đổi symlink.
     * Giữ server cũ chạy.
     */

    if (
        !release
    ) {
        return;
    }


    /*
     * Server chưa chạy.
     */

    if (
        !child
    ) {

        await restart(
            release
        );

        return;

    }


    /*
     * current đã đổi.
     */

    if (
        !currentRelease ||
        release.signature !==
            currentRelease.signature
    ) {

        await restart(
            release
        );

    }

}


/*
 * ==========================================
 * SHUTDOWN SUPERVISOR
 * ==========================================
 */

async function shutdown() {

    if (
        shuttingDown
    ) {
        return;
    }


    shuttingDown =
        true;


    console.log('');

    console.log(
        `[KitchenFlow] Stopping ${STAGE.toUpperCase()}...`
    );


    await stopChild();


    process.exit(
        0
    );

}


process.on(
    'SIGINT',
    shutdown
);


process.on(
    'SIGTERM',
    shutdown
);


/*
 * ==========================================
 * START
 * ==========================================
 */

const firstRelease =
    getCurrentRelease();


if (
    !firstRelease
) {

    throw new Error(
        [
            '',
            `Chưa có ${STAGE.toUpperCase()} release.`,
            '',
            'Hãy build một version trước.',
            '',
            `Ví dụ:`,
            '',
            `npm run build:${STAGE} -- 1.0.0`,
            ''
        ].join(
            '\n'
        )
    );

}


restart(
    firstRelease
);


/*
 * ==========================================
 * WATCH CURRENT
 * ==========================================
 *
 * Không dùng fs.watch trực tiếp vì build
 * đang xóa rồi tạo lại symlink current.
 *
 * Poll nhẹ mỗi 750ms ổn định hơn.
 */

setInterval(
    checkCurrentRelease,
    750
);