import { Router } from "express";
import { presignPut, presignGet } from "./uploads.controller.js";
const r = Router();
r.post("/presign", presignPut);     // → { uploadUrl, key, publicUrl }
r.get("/sign-get", presignGet);     // → { url } (view a private file)
export default r;
