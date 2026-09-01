import { Router } from "express";
import upload from "../config/multer.js";
import { prisma } from "../lib/prisma.js";
import fs from "fs/promises";
import cloudinary from "../config/cloudinary.js";

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

        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto",
        });

        console.log(result);

        await prisma.file.create({
            data: {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
                url: result.secure_url,
                publicId: result.public_id,
                folderId: folder.id,
            },
        });

        await fs.unlink(req.file.path);

        res.redirect(`/folders/${folder.id}`);
    } catch (err) {
        console.error(err);
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

router.get("/files/:id/download", async (req, res, next) => {
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

        res.redirect(file.url);
    } catch (err) {
        next(err);
    }
});

router.post("/files/:id/delete", async (req, res, next) => {
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

        await fs.unlink(file.path);

        await prisma.file.delete({
            where: {
                id: file.id,
            },
        });

        res.redirect(`/folders/${file.folderId}`);
    } catch (err) {
        next(err);
    }
});

export default router;