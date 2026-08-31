import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/new", (req, res) => {
    if (!req.user) {
        return res.redirect("/log-in");
    }
    res.render("folders/form", { parentFolderId: null, });
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

router.get("/:id", async (req, res, next) => {
    if(!req.user) {
        return res.redirect("/log-in");
    }

    try{
        const folder = await prisma.folder.findFirst({
            where: {
                id: Number(req.params.id),
                authorId: req.user.id,
            },
            include: {
                childFolders: true,
                files: true,
            },
        });

        if (!folder) {
            return res.status(404).send("Folder not found");
        }

        res.render("folders/show", { folder });
    } catch(err) {
        next(err);
    }
});

router.get("/:id/new", (req, res) => {
    if (!req.user) {
        return res.redirect("/log-in");
    }

    res.render("folders/form", {
        parentFolderId: req.params.id,
    });
});

router.post("/:id/new", async (req, res, next) => {
    if (!req.user) {
        return res.redirect("/log-in");
    }

    try {
        const { name } = req.body;

        const parentFolder = await prisma.folder.findFirst({
            where: {
                id: Number(req.params.id),
                authorId: req.user.id,
            },
        });

        if(!parentFolder) {
             return res.status(404).send("Folder not found");
        }

        await prisma.folder.create({
            data: {
                name: req.body.name,
                authorId: req.user.id,
                parentFolderId: parentFolder.id,
            },
        });

        res.redirect(`/folders/${parentFolder.id}`);
    } catch(err) {
        next(err);
    }
});

export default router;