const express = require("express");
const path = require("path");


const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");


const setupView = require("./config/view");
const errorMiddleware = require("./middlewares/error.middleware");
// const responseMiddleware = require( "./middlewares/response.middleware");

const webRoute = require("./routes/web.route");

const apiRoute = require("./routes/api.route");

const app = express();


// middleware

app.use(
    helmet({
        contentSecurityPolicy:false
    })
);


app.use(
    cors({
        credentials:true
    })
);


app.use(
    morgan("dev")
);


app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended:true
    })
);


app.use(
    cookieParser()
);


// static

app.use(
    express.static(
        path.join(
            process.cwd(),
            "src/public"
        )
    )
);


// handlebars

setupView(app);

app.use("/", webRoute);

app.use("/api/mcs/v1", apiRoute);

app.get("/test", (req,res)=>{
        res.send("OK");
    }
);

app.use(errorMiddleware);
// app.use(
//     responseMiddleware
// );

module.exports = app;