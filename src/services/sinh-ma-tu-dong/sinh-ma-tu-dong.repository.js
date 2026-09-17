'use strict';


class SinhMaTuDongRepository {

    validateIdentifier(
        value,
        label
    ) {

        const text =
            String(
                value ||
                ''
            )
                .trim();


        if (
            !/^[a-z_][a-z0-9_]*$/i
                .test(
                    text
                )
        ) {

            throw new Error(
                `${label} không hợp lệ.`
            );

        }


        return text;

    }


    quoteIdentifier(
        value
    ) {

        return `"${value}"`;

    }


    async khoaSinhMa(
        db,
        lockKey
    ) {

        await db.query(
            `
                SELECT
                    pg_advisory_xact_lock(
                        hashtextextended(
                            $1,
                            0
                        )
                    )
            `,
            [
                lockKey
            ]
        );

    }


    async getMaCuoi({
        db,

        schema =
            'public',

        bang,

        cot,

        cotThuTu =
            'id',

        prefix,

        doRongDaySo
    }) {

        const tenSchema =
            this.validateIdentifier(
                schema,
                'Schema'
            );


        const tenBang =
            this.validateIdentifier(
                bang,
                'Tên bảng'
            );


        const tenCot =
            this.validateIdentifier(
                cot,
                'Tên cột'
            );


        const tenCotThuTu =
            this.validateIdentifier(
                cotThuTu,
                'Tên cột thứ tự'
            );


        const schemaSql =
            this.quoteIdentifier(
                tenSchema
            );


        const bangSql =
            this.quoteIdentifier(
                tenBang
            );


        const cotSql =
            this.quoteIdentifier(
                tenCot
            );


        const cotThuTuSql =
            this.quoteIdentifier(
                tenCotThuTu
            );


        const result =
            await db.query(
                `
                    SELECT
                        ${cotSql} AS ma

                    FROM
                        ${schemaSql}.${bangSql}

                    WHERE
                        ${cotSql}
                        IS NOT NULL

                        AND LEFT(
                            ${cotSql},
                            CHAR_LENGTH(
                                $1::text
                            )
                        ) =
                        $1::text

                        AND SUBSTRING(
                            ${cotSql}
                            FROM
                            CHAR_LENGTH(
                                $1::text
                            ) +
                            1
                        ) ~ '^[0-9]+$'

                        AND CHAR_LENGTH(
                            SUBSTRING(
                                ${cotSql}
                                FROM
                                CHAR_LENGTH(
                                    $1::text
                                ) +
                                1
                            )
                        ) >=
                        $2

                    ORDER BY
                        ${cotThuTuSql}
                        DESC

                    LIMIT 1
                `,
                [
                    prefix,
                    doRongDaySo
                ]
            );


        return result.rows[0]
            ?.ma ||
            null;

    }

}


module.exports =
    new SinhMaTuDongRepository();