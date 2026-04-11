import multer from "multer";
import path from "path";

const tempPath = path.join(process.cwd(), "public/temp"); // 🔥 FIX

// MULTER CONFIGURATION
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempPath);
  },
  // FIX: Clean the filename to remove spaces and special characters
  filename: function (req, file, cb) {
    const cleanName = file.originalname
      .replace(/\s+/g, "")
      .replace(/[()]/g, "")
      .replace(/:/g, "-");
     
    cb(null, Date.now() + "-" + cleanName);
  }
});

export const upload = multer({ storage });