import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//  TEMP FOLDER PATH
const tempDir = path.join(process.cwd(), "public/temp");

// ENSURE FOLDER EXISTS
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// MULTER CONFIG (INLINE - NO CONFLICT)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname
      .replace(/\s+/g, "")
      .replace(/[()]/g, "")
      .replace(/:/g, "-");

    cb(null, Date.now() + "-" + cleanName);
  }
});

const upload = multer({ storage });

//  REGISTER ROUTE
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
);

//  LOGIN ROUTE
router.route("/login").post(loginUser);

//  SECURED ROUTE 
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken)

export default router;