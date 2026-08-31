import "dotenv/config";
import express from "express";
import session from "express-session";
import passport from "passport";
import initializePassport from "./config/passport.js";
import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";

const app = express();
initializePassport(passport);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";
app.use("/", indexRouter);
app.use("/", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));