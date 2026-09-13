'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const esbuild = require('esbuild');
const JavaScriptObfuscator = require('javascript-obfuscator');


const ROOT =
    process.cwd();

const PUBLIC_DIR =
    path.join(
        ROOT,
        'src/public'
    );

const APP_ENV =
    String(
        process.env.APP_ENV ||
        ''
    )
        .trim()
        .toLowerCase();


if (
    !APP_ENV
) {
    throw new Error(
        'Thiếu APP_ENV. Ví dụ: APP_ENV=product1 npm run build:prod'
    );
}


if (
    !/^[a-z0-9_-]+$/.test(
        APP_ENV
    )
) {
    throw new Error(
        `APP_ENV không hợp lệ: ${APP_ENV}`
    );
}

const JS_DIR =
    path.join(
        PUBLIC_DIR,
        'assets/js'
    );

const CSS_DIR =
    path.join(
        PUBLIC_DIR,
        'assets/css'
    );

const DIST_ROOT_DIR =
    path.join(
        PUBLIC_DIR,
        'assets/dist'
    );

const DIST_DIR =
    path.join(
        DIST_ROOT_DIR,
        APP_ENV
    );

const MANIFEST_PATH =
    path.join(
        DIST_DIR,
        'manifest.json'
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
            entry.isFile()
        ) {
            result.push(
                fullPath
            );
        }
    }

    return result;
}


function createHash(content) {
    return crypto
        .createHash(
            'sha256'
        )
        .update(
            content
        )
        .digest(
            'hex'
        )
        .slice(
            0,
            16
        );
}


function toPublicUrl(
    filePath
) {
    const relative =
        path
            .relative(
                PUBLIC_DIR,
                filePath
            )
            .split(
                path.sep
            )
            .join(
                '/'
            );

    return `/${relative}`;
}

function normalizeCssUrls(
    source,
    filePath
) {
    const sourceDirectory =
        path.dirname(
            filePath
        );


    return source.replace(
        /url\(\s*(["']?)([^"')]+)\1\s*\)/g,
        (
            match,
            quote,
            rawUrl
        ) => {
            const value =
                String(
                    rawUrl
                ).trim();


            /*
             * Không đụng:
             *
             * data:
             * http:
             * https:
             * //cdn
             * /absolute
             * #fragment
             */
            if (
                !value ||
                /^(?:data:|https?:|\/\/|\/|#)/i.test(
                    value
                )
            ) {
                return match;
            }


            const parts =
                value.match(
                    /^([^?#]+)(.*)$/
                );


            if (
                !parts
            ) {
                return match;
            }


            const relativePath =
                parts[1];


            const suffix =
                parts[2] ||
                '';


            const resolvedPath =
                path.resolve(
                    sourceDirectory,
                    relativePath
                );


            const relativeToPublic =
                path.relative(
                    PUBLIC_DIR,
                    resolvedPath
                );


            /*
             * Không cho resolve ra ngoài public.
             */
            if (
                relativeToPublic.startsWith(
                    '..'
                )
            ) {
                return match;
            }


            const publicUrl =
                toPublicUrl(
                    resolvedPath
                );


            return (
                `url("${publicUrl}${suffix}")`
            );
        }
    );
}

async function buildJavaScript(
    filePath,
    manifest
) {
    const source =
        fs.readFileSync(
            filePath,
            'utf8'
        );

    /*
     * Minify trước.
     *
     * KHÔNG source map.
     */
    const transformed =
        await esbuild
            .transform(
                source,
                {
                    loader:
                        'js',

                    minify:
                        true,

                    sourcemap:
                        false,

                    legalComments:
                        'none',

                    target:
                        'es2020',

                    charset:
                        'utf8'
                }
            );


    /*
     * Obfuscate ở mức vừa phải.
     *
     * Không rename global vì KitchenFlow
     * có nhiều module dùng window.MCS
     * và các global component dùng chung.
     */
    const obfuscated =
        JavaScriptObfuscator
            .obfuscate(
                transformed.code,
                {
                    compact:
                        true,

                    seed:
                        parseInt(
                            createHash(
                                transformed.code
                            ).slice(
                                0,
                                8
                            ),
                            16
                        ),

                    identifierNamesGenerator:
                        'hexadecimal',

                    renameGlobals:
                        false,

                    controlFlowFlattening:
                        false,

                    deadCodeInjection:
                        false,

                    selfDefending:
                        false,

                    debugProtection:
                        false,

                    disableConsoleOutput:
                        false,

                    stringArray:
                        true,

                    stringArrayThreshold:
                        0.55,

                    stringArrayEncoding: [
                        'base64'
                    ],

                    sourceMap:
                        false
                }
            )
            .getObfuscatedCode();


    const hash =
        createHash(
            obfuscated
        );

    const outputName =
        `${hash}.js`;

    const outputPath =
        path.join(
            DIST_DIR,
            outputName
        );


    fs.writeFileSync(
        outputPath,
        obfuscated,
        'utf8'
    );

    manifest[
        toPublicUrl(
            filePath
        )
    ] =
        `/assets/dist/${APP_ENV}/${outputName}`;
}


async function buildCss(
    filePath,
    manifest
) {
    const source =
        normalizeCssUrls(
            fs.readFileSync(
                filePath,
                'utf8'
            ),
            filePath
        );

    const transformed =
        await esbuild
            .transform(
                source,
                {
                    loader:
                        'css',

                    minify:
                        true,

                    sourcemap:
                        false,

                    legalComments:
                        'none'
                }
            );


    const css =
        transformed.code;


    const hash =
        createHash(
            css
        );

    const outputName =
        `${hash}.css`;

    const outputPath =
        path.join(
            DIST_DIR,
            outputName
        );


    fs.writeFileSync(
        outputPath,
        css,
        'utf8'
    );

    manifest[
        toPublicUrl(
            filePath
        )
    ] =
        `/assets/dist/${APP_ENV}/${outputName}`;
}


async function main() {
    /*
     * Xóa build cũ hoàn toàn.
     */
    fs.rmSync(
        DIST_DIR,
        {
            recursive: true,
            force: true
        }
    );


    fs.mkdirSync(
        DIST_DIR,
        {
            recursive: true
        }
    );


    const manifest =
        {};


    const jsFiles =
        walkDirectory(
            JS_DIR
        )
            .filter(
                file =>
                    file.endsWith(
                        '.js'
                    )
            );


    const cssFiles =
        walkDirectory(
            CSS_DIR
        )
            .filter(
                file =>
                    file.endsWith(
                        '.css'
                    )
            );


    console.log(
        `Building ${jsFiles.length} JavaScript files...`
    );


    for (
        const filePath of jsFiles
    ) {
        await buildJavaScript(
            filePath,
            manifest
        );
    }


    console.log(
        `Building ${cssFiles.length} CSS files...`
    );


    for (
        const filePath of cssFiles
    ) {
        await buildCss(
            filePath,
            manifest
        );
    }


    fs.writeFileSync(
        MANIFEST_PATH,
        JSON.stringify(
            manifest,
            null,
            2
        ),
        'utf8'
    );


    console.log('');
    console.log(
        'Production assets built successfully.'
    );
    console.log(
        `Manifest: ${MANIFEST_PATH}`
    );
    console.log(
        `Total assets: ${Object.keys(manifest).length}`
    );
}


main()
    .catch(
        error => {
            console.error(
                'Production build failed:',
                error
            );

            process.exit(
                1
            );
        }
    );