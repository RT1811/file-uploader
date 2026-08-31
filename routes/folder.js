import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/new", (req, res) => {
    if (!req.user) {
        return res.redirect("/log-in");
    }
    res.render("folders/form");
})

router.post("/new", async (req, res, next) => {
    if (!req.user) {
        return res.redirect("/log-in");
    }

    try {
        const { name } = req.body;

        await prisma.folder.create({
            data: {
                name,
                authorId: req.user.id,
                parentFolderId: null,
            },
        });

        res.redirect("/")
    } catch(err) {
        next(err);
    }
});

export default router;