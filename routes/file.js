import { Router } from "express";
import upload from "../config/multer.js";
import { prisma } from "../lib/prisma.js";
import fs from "fs/promises";

const router = Router();

router.post("/folders/:id/files", upload.single("file"), async (req, res, next) => {
    if (!req.user) {
        return res.redirect("/log-in");
    }

    try {
        const folder = await prisma.folder.findFirst({
            where: {
                id: Number(req.params.id),
                authorId: req.user.id,
            },
        });

        if (!folder) {
            return res.status(404).send("Folder not found");
        }

        await prisma.file.create({
            data: {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                folderId: folder.id,
            },
        });

        res.redirect(`/folders/${folder.id}`);
    } catch (err) {
        next(err);
    }
});

router.get("/files/:id", async (req, res, next) => {
    if (!req.user) {
        return res.redirect("/log-in");
    }

    try {
        const file = await prisma.file.findFirst({
            where: {
                id: Number(req.params.id),
                folder: {
                    authorId: req.user.id,
                },
            },
        });

        if (!file) {
            return res.status(404).send("File not found");
        }

        res.render("files/show", { file });
    } catch (err) {
        next(err);
    }
});

router.post("files/:id/download", async (req, res, next) => {
    if (!req.user) {
        return res.redirect("/log-in");
    }

    try {
        const file = await prisma.file.findFirst({
            where: {
                id: Number(req.params.id),
                folder: {
                    authorId: req.user.id,
                },
            },
        });

        if (!file) {
            return res.status(404).send("File not found");
        }

        res.download(file.path, file.name);
    } catch(err) {
        next(err);
    }
});

export default router;