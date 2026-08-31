import { Router } from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma.js" 

const router = Router();

const signUpValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }

    return true;
  }),
];

router.get("/sign-up", (req, res) => {
    res.render("sign-up-form", { errors: [] });
});

router.post("/sign-up", signUpValidation, async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).render("sign-up-form", {
            errors: errors.array(),
        });
    }

    const {
        username,
        password,
    } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            }
        });

        res.redirect("/log-in");
    } catch(err) {
        next(err);
    }
});

router.get("/log-in", (req, res) => {
    res.render("log-in-form");
});

router.post(
    "/log-in",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/log-in",
    })
);

router.post("/log-out", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
});

export default router;