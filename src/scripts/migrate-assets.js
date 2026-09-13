'use strict';

const fs = require('fs');
const path = require('path');


const ROOT =
    process.cwd();


const VIEWS_DIR =
    path.join(
        ROOT,
        'src/views'
    );


function walkDirectory(directory) {
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
            entry.name.endsWith('.hbs')
        ) {
            result.push(
                fullPath
            );
        }
    }


    return result;
}


function migrateContent(
    content
) {
    let changed =
        0;


    /*
     * =====================================================
     * CSS
     * =====================================================
     *
     * href="/assets/css/..."
     * href='/assets/css/...'
     *
     * =>
     *
     * href="{{asset "/assets/css/..."}}"
     */
    content =
        content.replace(
            /\bhref\s*=\s*(["'])(\/assets\/css\/[^"']+)\1/g,
            (
                match,
                quote,
                assetPath
            ) => {
                changed +=
                    1;


                return `href="{{asset "${assetPath}"}}"`;
            }
        );


    /*
     * =====================================================
     * JAVASCRIPT
     * =====================================================
     *
     * src="/assets/js/..."
     * src='/assets/js/...'
     *
     * =>
     *
     * src="{{asset "/assets/js/..."}}"
     */
    content =
        content.replace(
            /\bsrc\s*=\s*(["'])(\/assets\/js\/[^"']+)\1/g,
            (
                match,
                quote,
                assetPath
            ) => {
                changed +=
                    1;


                return `src="{{asset "${assetPath}"}}"`;
            }
        );


    return {
        content,
        changed
    };
}


function main() {
    const files =
        walkDirectory(
            VIEWS_DIR
        );


    let changedFiles =
        0;


    let changedReferences =
        0;


    console.log(
        `Scanning ${files.length} Handlebars files...`
    );


    for (
        const filePath of files
    ) {
        const original =
            fs.readFileSync(
                filePath,
                'utf8'
            );


        const result =
            migrateContent(
                original
            );


        if (
            result.changed ===
            0
        ) {
            continue;
        }


        fs.writeFileSync(
            filePath,
            result.content,
            'utf8'
        );


        changedFiles +=
            1;


        changedReferences +=
            result.changed;


        console.log(
            `UPDATED  ${path.relative(ROOT, filePath)} (${result.changed})`
        );
    }


    console.log('');
    console.log(
        `Changed files: ${changedFiles}`
    );

    console.log(
        `Changed references: ${changedReferences}`
    );
}


main();