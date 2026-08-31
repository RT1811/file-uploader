import { Router } from "express";
import { prisma } from "../lib/prisma.js"

const router  = Router();

router.get("/", async (req, res, next) => {
    try {
        const folders = await prisma.folder.findMany({
            where: { authorId: req.user.id, parentFolderId: null },
        });

        res.render("index", { folders });
    } catch(err) {
        next(err);
    }
});

export default router;