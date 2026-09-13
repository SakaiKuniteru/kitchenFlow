'use strict';

const {
    execFileSync
} = require(
    'child_process'
);


function git(
    args
) {
    return execFileSync(
        'git',
        args,
        {
            cwd:
                process.cwd(),

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


const status =
    git([
        'status',
        '--porcelain'
    ]);


if (
    status
) {
    throw new Error(
        [
            '',
            'Không thể duyệt DEV.',
            '',
            'Working tree đang có thay đổi chưa commit.',
            '',
            'Hãy chạy:',
            '',
            'git add .',
            'git commit -m "..."',
            '',
            'sau đó build DEV lại.'
        ].join(
            '\n'
        )
    );
}


const commit =
    git([
        'rev-parse',
        'HEAD'
    ]);


/*
 * Kiểm tra generated templates
 * trước khi duyệt DEV.
 */
execFileSync(
    'npm',
    [
        'run',
        'build:templates'
    ],
    {
        cwd:
            process.cwd(),

        stdio:
            'inherit'
    }
);


/*
 * Đánh dấu commit hiện tại
 * đã qua DEV.
 */
git([
    'update-ref',
    'refs/kitchenflow/dev',
    commit
]);


console.log('');
console.log(
    'DEV build passed.'
);

console.log(
    `DEV commit: ${commit}`
);