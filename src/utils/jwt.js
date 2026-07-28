const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRES_IN = "1h";

const REFRESH_TOKEN_EXPIRES_IN = "30d";

function generateAccessToken(payload) {

    return jwt.sign(
        payload,

        process.env.ACCESS_TOKEN_SECRET,

        {
            expiresIn:
                process.env.ACCESS_TOKEN_EXPIRES
        }
    );

}

function generateRefreshToken(payload) {

    return jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: 
                process.env.REFRESH_TOKEN_EXPIRES
        }
    );

}

function verifyAccessToken(token) {

    return jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );

}

function verifyRefreshToken(token) {

    return jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET
    );

}

module.exports = {

    generateAccessToken,

    generateRefreshToken,

    verifyAccessToken,

    verifyRefreshToken

};