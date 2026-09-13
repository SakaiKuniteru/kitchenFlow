const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const setupView = require('./config/view');
const errorMiddleware = require('./middlewares/error.middleware');
const webRoute = require('./routes/web/index');
const apiRoute = require('./routes/api/index');
const { GIOI_TINH_OPTIONS } = require('./constants/form-options');

const app = express();

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

app.use(
    cors({
        credentials: true
    })
);

app.use(morgan('dev'));
app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());

const publicDir =
    path.join(
        process.cwd(),
        'src/public'
    );


const isProduction =
    process.env.NODE_ENV ===
    'production';


if (
    isProduction
) {
    /*
     * PRODUCT:
     *
     * Cấm truy cập source frontend.
     *
     * Browser chỉ được sử dụng
     * file đã build trong /assets/dist.
     */
    app.use(
        '/assets/js',
        (
            req,
            res
        ) => {
            return res
                .status(404)
                .end();
        }
    );


    app.use(
        '/assets/css',
        (
            req,
            res
        ) => {
            return res
                .status(404)
                .end();
        }
    );
}


/*
 * Vẫn public:
 *
 * /assets/dist
 * /assets/images
 * /uploads
 * ...
 */
app.use(
    express.static(
        publicDir,
        {
            index:
                false,

            setHeaders:
                (
                    res,
                    filePath
                ) => {

                    if (
                        isProduction &&
                        filePath.includes(
                            `${path.sep}assets${path.sep}dist${path.sep}`
                        )
                    ) {
                        res.setHeader(
                            'Cache-Control',
                            'public, max-age=31536000, immutable'
                        );
                    }

                }
        }
    )
);

setupView(app);

app.use((req, res, next) => {
    res.locals.formOptions = {
        gioiTinh: GIOI_TINH_OPTIONS
    };

    next();
});

app.use('/api/mcs/v1', apiRoute);
app.use('/', webRoute);

app.get('/test', (req, res) => {
    res.send('OK');
});

app.use(errorMiddleware);

module.exports = app;
