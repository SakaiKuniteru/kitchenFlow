'use strict';

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');


const ROOT =
    process.cwd();


const PARTIALS_DIR =
    path.join(
        ROOT,
        'src/views/partials'
    );


const OUTPUT_FILE =
    path.join(
        ROOT,
        'src/public/assets/js/pages/dat-hang/templates.js'
    );


const HANDLEBARS_PACKAGE =
    require.resolve(
        'handlebars/package.json'
    );


const HANDLEBARS_RUNTIME =
    path.join(
        path.dirname(
            HANDLEBARS_PACKAGE
        ),
        'dist/handlebars.runtime.min.js'
    );


function walkDirectory(
    directory
) {
    if (
        !fs.existsSync(
            directory
        )
    ) {
        return [];
    }


    const result =
        [];


    for (
        const entry of fs.readdirSync(
            directory,
            {
                withFileTypes: true
            }
        )
    ) {
        const fullPath =
            path.join(
                directory,
                entry.name
            );


        if (
            entry.isDirectory()
        ) {
            result.push(
                ...walkDirectory(
                    fullPath
                )
            );

            continue;
        }


        if (
            entry.isFile() &&
            entry.name.endsWith(
                '.hbs'
            )
        ) {
            result.push(
                fullPath
            );
        }
    }


    return result;
}


function getPartialName(
    filePath
) {
    return path
        .relative(
            PARTIALS_DIR,
            filePath
        )
        .split(
            path.sep
        )
        .join(
            '/'
        )
        .replace(
            /\.hbs$/i,
            ''
        );
}


function shouldBuildPartial(
    partialName
) {
    /*
     * Module Đặt hàng sử dụng:
     *
     * dat-hang/*
     * forms/*
     *
     * forms được compile cùng vì các partial
     * đặt hàng có gọi forms/input,
     * forms/textarea, forms/search...
     */
    return (
        partialName.startsWith(
            'dat-hang/'
        ) ||
        partialName.startsWith(
            'forms/'
        ) || partialName === 'catalog/pagination'
    );
}


function buildTemplates() {
    if (
        !fs.existsSync(
            HANDLEBARS_RUNTIME
        )
    ) {
        throw new Error(
            `Không tìm thấy Handlebars runtime: ${HANDLEBARS_RUNTIME}`
        );
    }


    const files =
        walkDirectory(
            PARTIALS_DIR
        )
            .filter(
                filePath =>
                    shouldBuildPartial(
                        getPartialName(
                            filePath
                        )
                    )
            )
            .sort();


    if (
        files.length ===
        0
    ) {
        throw new Error(
            'Không tìm thấy partial nào để build client templates.'
        );
    }


    let runtime =
        fs.readFileSync(
            HANDLEBARS_RUNTIME,
            'utf8'
        );


    /*
     * Không để browser tìm source map
     * của Handlebars runtime.
     */
    runtime =
        runtime.replace(
            /\/\/# sourceMappingURL=.*$/gm,
            ''
        );


    const registrations =
        [];


    for (
        const filePath of files
    ) {
        const partialName =
            getPartialName(
                filePath
            );


        const source =
            fs.readFileSync(
                filePath,
                'utf8'
            );


        const compiled =
            Handlebars.precompile(
                source
            );


        registrations.push(
            [
                'Handlebars.registerPartial(',
                JSON.stringify(
                    partialName
                ),
                ', Handlebars.template(',
                compiled,
                '));'
            ].join('')
        );
    }


    const output = [
        "'use strict';",
        '',
        runtime,
        '',
        ';(() => {',
        '',
        "    if (typeof Handlebars === 'undefined') {",
        "        throw new Error('Handlebars runtime chưa được khởi tạo.');",
        '    }',
        '',
        ...registrations,
        '',
        '})();',
        ''
    ].join(
        '\n'
    );


    fs.mkdirSync(
        path.dirname(
            OUTPUT_FILE
        ),
        {
            recursive: true
        }
    );


    fs.writeFileSync(
        OUTPUT_FILE,
        output,
        'utf8'
    );


    console.log(
        `Client templates built: ${files.length} partials`
    );


    console.log(
        `Output: ${OUTPUT_FILE}`
    );
}


buildTemplates();
