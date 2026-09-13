'use strict';

const path = require('path');

const {
    engine
} = require(
    'express-handlebars'
);

const {
    minify
} = require(
    'html-minifier-terser'
);

const {
    asset: resolveAsset
} = require(
    '../utils/asset.util'
);


const IS_PRODUCTION =
    process.env.NODE_ENV ===
    'production';


function assetHelper(
    ...args
) {
    /*
     * Handlebars luôn truyền object options
     * vào tham số cuối.
     */
    args.pop();


    const assetPath =
        args
            .filter(
                value =>
                    value !== undefined &&
                    value !== null
            )
            .map(
                value =>
                    String(value)
            )
            .join('');


    return resolveAsset(
        assetPath
    );
}


module.exports =
    function setupView(
        app
    ) {

        /*
         * Engine Handlebars gốc.
         */
        const handlebarsEngine =
            engine({
                extname:
                    'hbs',

                helpers: {
                    eq:
                        (
                            left,
                            right
                        ) =>
                            left === right,

                    gt:
                        (
                            left,
                            right
                        ) =>
                            Number(left) >
                            Number(right),

                    asset:
                        assetHelper
                },

                defaultLayout:
                    'app',

                layoutsDir:
                    path.join(
                        process.cwd(),
                        'src/views/layouts'
                    ),

                partialsDir:
                    path.join(
                        process.cwd(),
                        'src/views/partials'
                    )
            });


        /*
         * DEV:
         * giữ nguyên HTML đẹp để debug.
         *
         * PRODUCT:
         * minify toàn bộ HTML sau khi
         * Handlebars render xong.
         */
        app.engine(
            'hbs',

            (
                filePath,
                options,
                callback
            ) => {

                handlebarsEngine(
                    filePath,
                    options,

                    async (
                        error,
                        html
                    ) => {

                        if (error) {
                            return callback(
                                error
                            );
                        }


                        if (
                            !IS_PRODUCTION
                        ) {
                            return callback(
                                null,
                                html
                            );
                        }


                        try {

                            const minifiedHtml =
                                await minify(
                                    html,
                                    {
                                        collapseWhitespace:
                                            true,

                                        conservativeCollapse:
                                            false,

                                        removeComments:
                                            true,

                                        removeRedundantAttributes:
                                            true,

                                        removeEmptyAttributes:
                                            false,

                                        removeOptionalTags:
                                            false,

                                        removeAttributeQuotes:
                                            false,

                                        collapseBooleanAttributes:
                                            true,

                                        keepClosingSlash:
                                            true,

                                        /*
                                         * JS/CSS external đã
                                         * được build riêng rồi.
                                         *
                                         * Không xử lý lại ở đây.
                                         */
                                        minifyJS:
                                            false,

                                        minifyCSS:
                                            false
                                    }
                                );


                            return callback(
                                null,
                                minifiedHtml
                            );

                        } catch (
                            minifyError
                        ) {

                            return callback(
                                minifyError
                            );

                        }

                    }
                );

            }
        );


        app.set(
            'view engine',
            'hbs'
        );


        app.set(
            'views',
            path.join(
                process.cwd(),
                'src/views'
            )
        );

    };