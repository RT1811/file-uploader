import { Router } from "express";
import upload from "../config/multer.js";

const router = Router();

router.post("/:id/files", upload.single("file"), (req, res) => {
    if (!req.user) {
        return res.redirect("/log-in");
    }

    console.log(req.file);

    res.redirect(`/folders/${req.params.id}`);
});

export default router;