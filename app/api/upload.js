import nextConnect from "next-connect";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { v4 as uuid } from "uuid";

const uploadDir = path.join(process.cwd(), "public/uploads");

// Ensure uploads directory exists
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const validTypes = [".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!validTypes.includes(ext)) {
      return cb(new Error("Only JPG, JPEG, PNG allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(400).json({ error: error.message });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post((req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing for multipart
  },
};

export default apiRoute;