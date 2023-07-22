const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const PORT = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoutes");
const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const morgan = require("morgan");
dbConnect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan());

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Example app hello listening on port ${PORT}!`)
);
