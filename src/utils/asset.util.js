'use strict';

const fs = require('fs');
const path = require('path');


const IS_PRODUCTION =
    process.env.NODE_ENV ===
    'production';

const APP_ENV =
    String(
        process.env.APP_ENV ||
        'dev'
    )
        .trim()
        .toLowerCase();

const MANIFEST_PATH =
    path.join(
        process.cwd(),
        'src/public/assets/dist',
        APP_ENV,
        'manifest.json'
    );

let manifest =
    null;


function loadManifest() {
    if (
        !IS_PRODUCTION
    ) {
        return {};
    }


    if (
        manifest
    ) {
        return manifest;
    }


    if (
        !fs.existsSync(
            MANIFEST_PATH
        )
    ) {
        throw new Error(
            [
                'Không tìm thấy production asset manifest.',
                `File: ${MANIFEST_PATH}`,
                'Hãy chạy npm run build:prod trước.'
            ].join(
                ' '
            )
        );
    }


    manifest =
        JSON.parse(
            fs.readFileSync(
                MANIFEST_PATH,
                'utf8'
            )
        );


    return manifest;
}


function asset(
    sourcePath
) {
    if (
        sourcePath ===
            undefined ||
        sourcePath ===
            null
    ) {
        return '';
    }


    const value =
        String(
            sourcePath
        ).trim();


    if (
        !value
    ) {
        return '';
    }


    /*
     * Development giữ nguyên URL.
     */
    if (
        !IS_PRODUCTION
    ) {
        return value;
    }


    /*
     * URL bên ngoài.
     */
    if (
        /^https?:\/\//i.test(
            value
        )
    ) {
        return value;
    }


    /*
     * Không phải source JS/CSS
     * thì không map.
     */
    if (
        !value.startsWith(
            '/assets/js/'
        ) &&
        !value.startsWith(
            '/assets/css/'
        )
    ) {
        return value;
    }


    const questionIndex =
        value.indexOf(
            '?'
        );


    let pathname =
        value;


    let queryString =
        '';


    if (
        questionIndex !==
        -1
    ) {
        pathname =
            value.slice(
                0,
                questionIndex
            );


        queryString =
            value.slice(
                questionIndex
            );
    }


    const assets =
        loadManifest();


    const builtPath =
        assets[
            pathname
        ];


    if (
        !builtPath
    ) {
        throw new Error(
            `Asset production chưa được build: ${pathname}`
        );
    }


    return (
        builtPath +
        queryString
    );
}


module.exports = {
    asset,
    loadManifest,
    IS_PRODUCTION
};