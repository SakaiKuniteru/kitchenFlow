'use strict';

const ApiError =
    require(
        '../../utils/api-error'
    );

const repository =
    require(
        './sinh-ma-tu-dong.repository'
    );


class SinhMaTuDongService {

    /*
     * =========================================================
     * CHUẨN HÓA PREFIX
     * =========================================================
     */

    chuanHoaTienTo(
        value
    ) {

        return String(
            value ??
            ''
        )
            .normalize(
                'NFD'
            )
            .replace(
                /[\u0300-\u036f]/g,
                ''
            )
            .replace(
                /đ/g,
                'd'
            )
            .replace(
                /Đ/g,
                'D'
            )
            .toUpperCase()
            .replace(
                /[^A-Z0-9]/g,
                ''
            );

    }


    /*
     * =========================================================
     * PARSE FORMAT
     * =========================================================
     *
     * Hỗ trợ:
     *
     * [AA][yy][mm][dd][dayso:5]
     * [AA][yy][mm][dayso:5]
     * [AA][yy][dayso:5]
     *
     * [yy][mm][dd][dayso:5]
     * [yy][mm][dayso:5]
     * [yy][dayso:5]
     *
     * Nếu bỏ [dayso:n]
     * => mặc định dayso:5.
     */

    parseDinhDang(
        value
    ) {

        const text =
            String(
                value ??
                ''
            )
                .trim();


        if (!text) {

            throw new ApiError(
                400,
                'Định dạng sinh mã không được để trống.'
            );

        }


        const tokens =
            text.match(
                /\[[^\[\]]+\]/g
            );


        if (
            !tokens ||
            tokens.join(
                ''
            ) !==
            text
        ) {

            throw new ApiError(
                400,
                'Định dạng sinh mã không hợp lệ.'
            );

        }


        let index =
            0;


        let tienTo =
            '';


        /*
         * Prefix.
         *
         * Token đầu không phải [yy]
         * => hiểu là prefix.
         */

        const firstToken =
            String(
                tokens[index] ||
                ''
            );


        if (
            firstToken
                .toLowerCase() !==
            '[yy]'
        ) {

            const rawPrefix =
                firstToken.slice(
                    1,
                    -1
                );


            tienTo =
                this.chuanHoaTienTo(
                    rawPrefix
                );


            /*
             * Theo quy tắc hiện tại
             * prefix là đúng 2 ký tự.
             */

            if (
                !/^[A-Z0-9]{2}$/
                    .test(
                        tienTo
                    )
            ) {

                throw new ApiError(
                    400,
                    'Tiền tố mã phải gồm đúng 2 ký tự chữ hoặc số.'
                );

            }


            index +=
                1;

        }


        /*
         * [yy]
         * bắt buộc.
         */

        if (
            String(
                tokens[index] ||
                ''
            )
                .toLowerCase() !==
            '[yy]'
        ) {

            throw new ApiError(
                400,
                'Định dạng sinh mã bắt buộc phải có [yy].'
            );

        }


        index +=
            1;


        /*
         * [mm]
         */

        let coMM =
            false;


        if (
            String(
                tokens[index] ||
                ''
            )
                .toLowerCase() ===
            '[mm]'
        ) {

            coMM =
                true;


            index +=
                1;

        }


        /*
         * [dd]
         *
         * Có dd bắt buộc có mm.
         */

        let coDD =
            false;


        if (
            String(
                tokens[index] ||
                ''
            )
                .toLowerCase() ===
            '[dd]'
        ) {

            if (!coMM) {

                throw new ApiError(
                    400,
                    '[dd] chỉ được sử dụng sau [yy][mm].'
                );

            }


            coDD =
                true;


            index +=
                1;

        }


        /*
         * [dayso:n]
         *
         * Không khai báo
         * => mặc định 5.
         */

        let doRongDaySo =
            5;


        if (
            index <
            tokens.length
        ) {

            const daySoMatch =
                String(
                    tokens[index]
                )
                    .match(
                        /^\[dayso:(\d+)\]$/i
                    );


            if (!daySoMatch) {

                throw new ApiError(
                    400,
                    'Token cuối phải có dạng [dayso:n].'
                );

            }


            const doRong =
                Number(
                    daySoMatch[1]
                );


            if (
                !Number.isInteger(
                    doRong
                ) ||
                doRong <=
                    0
            ) {

                throw new ApiError(
                    400,
                    'Độ rộng dãy số phải lớn hơn 0.'
                );

            }


            doRongDaySo =
                doRong;


            index +=
                1;

        }


        /*
         * Không được còn token thừa.
         */

        if (
            index !==
            tokens.length
        ) {

            throw new ApiError(
                400,
                'Định dạng sinh mã có token không hợp lệ.'
            );

        }


        /*
         * Chuẩn hóa format.
         */

        const parts =
            [];


        if (
            tienTo
        ) {

            parts.push(
                `[${tienTo}]`
            );

        }


        parts.push(
            '[yy]'
        );


        if (
            coMM
        ) {

            parts.push(
                '[mm]'
            );

        }


        if (
            coDD
        ) {

            parts.push(
                '[dd]'
            );

        }


        parts.push(
            `[dayso:${doRongDaySo}]`
        );


        return {

            dinhDang:
                parts.join(
                    ''
                ),

            tienTo,

            coYY:
                true,

            coMM,

            coDD,

            doRongDaySo,

            resetTheo:
                coDD
                    ? 'day'
                    : coMM
                        ? 'month'
                        : 'year'

        };

    }


    /*
     * =========================================================
     * TẠO NGỮ CẢNH
     * =========================================================
     */

    taoNguCanh(
        dinhDang,
        thoiDiem =
            new Date()
    ) {

        const cauHinh =
            typeof dinhDang ===
                'string'
                ? this.parseDinhDang(
                    dinhDang
                )
                : dinhDang;


        if (
            !cauHinh ||
            !cauHinh.dinhDang
        ) {

            throw new ApiError(
                400,
                'Cấu hình sinh mã không hợp lệ.'
            );

        }


        const date =
            thoiDiem instanceof Date
                ? new Date(
                    thoiDiem
                        .getTime()
                )
                : new Date(
                    thoiDiem
                );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            throw new ApiError(
                400,
                'Thời điểm sinh mã không hợp lệ.'
            );

        }


        const yyyy =
            String(
                date.getFullYear()
            );


        const yy =
            yyyy.slice(
                -2
            );


        const mm =
            String(
                date.getMonth() +
                1
            )
                .padStart(
                    2,
                    '0'
                );


        const dd =
            String(
                date.getDate()
            )
                .padStart(
                    2,
                    '0'
                );


        let prefix =
            cauHinh.tienTo ||
            '';


        prefix +=
            yy;


        if (
            cauHinh.coMM
        ) {

            prefix +=
                mm;

        }


        if (
            cauHinh.coDD
        ) {

            prefix +=
                dd;

        }


        return {

            ...cauHinh,

            prefix,

            khoa:
                [
                    cauHinh.dinhDang,
                    prefix
                ]
                    .join(
                        ':'
                    )

        };

    }


    /*
     * =========================================================
     * TÍNH DÃY SỐ TIẾP
     * =========================================================
     *
     * Ví dụ dayso:2:
     *
     * 01
     * 02
     * ...
     * 98
     * 99
     *
     * hết:
     *
     * 001
     * 002
     * ...
     *
     * KHÔNG:
     *
     * 99 -> 100
     */

    taoDaySoTiepTheo(
        lastSuffix,
        doRongToiThieu
    ) {

        if (
            !lastSuffix ||
            !/^\d+$/
                .test(
                    lastSuffix
                )
        ) {

            return '1'
                .padStart(
                    doRongToiThieu,
                    '0'
                );

        }


        const currentWidth =
            Math.max(
                doRongToiThieu,
                lastSuffix.length
            );


        const currentValue =
            BigInt(
                lastSuffix
            );


        const maxValue =
            (
                10n **
                BigInt(
                    currentWidth
                )
            ) -
            1n;


        /*
         * Hết độ rộng hiện tại:
         *
         * 99 -> 001
         * 999 -> 0001
         */

        if (
            currentValue >=
            maxValue
        ) {

            return '1'
                .padStart(
                    currentWidth +
                    1,
                    '0'
                );

        }


        return (
            currentValue +
            1n
        )
            .toString()
            .padStart(
                currentWidth,
                '0'
            );

    }


    /*
     * =========================================================
     * SINH MÃ
     * =========================================================
     */

    async sinhMa({
        db,

        bang,

        cot,

        dinhDang,

        thoiDiem =
            new Date(),

        schema =
            'public',

        cotThuTu =
            'id'
    }) {

        if (
            !db ||
            typeof db.query !==
                'function'
        ) {

            throw new ApiError(
                500,
                'Sinh mã tự động yêu cầu database transaction client.'
            );

        }


        const nguCanh =
            this.taoNguCanh(
                dinhDang,
                thoiDiem
            );


        /*
         * Lock tách riêng cho:
         *
         * table
         * column
         * format
         * kỳ hiện tại
         */

        const lockKey =
            [
                'SINH_MA',

                schema,

                bang,

                cot,

                nguCanh.khoa
            ]
                .join(
                    ':'
                );


        await repository
            .khoaSinhMa(
                db,
                lockKey
            );


        const lastCode =
            await repository
                .getMaCuoi({
                    db,

                    schema,

                    bang,

                    cot,

                    cotThuTu,

                    prefix:
                        nguCanh
                            .prefix,

                    doRongDaySo:
                        nguCanh
                            .doRongDaySo
                });


        const lastSuffix =
            lastCode
                ? String(
                    lastCode
                )
                    .slice(
                        nguCanh
                            .prefix
                            .length
                    )
                : null;


        const suffix =
            this.taoDaySoTiepTheo(
                lastSuffix,

                nguCanh
                    .doRongDaySo
            );


        return (
            nguCanh.prefix +
            suffix
        );

    }

}


module.exports =
    new SinhMaTuDongService();