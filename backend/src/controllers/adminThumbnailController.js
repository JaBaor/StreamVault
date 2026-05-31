const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const sizeOf = require("image-size").default;
const pool = require("../config/db");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads/thumbnails"));
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}-${Date.now()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG images are allowed"));
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }).single("thumbnail");

exports.uploadThumbnail = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large. Maximum 2MB." });
      }
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    try {
      const buf = fs.readFileSync(req.file.path);
      const dims = sizeOf(buf);
      if (dims.width < 300 || dims.height < 200) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: `Image too small. Minimum 300×200px, got ${dims.width}×${dims.height}px` });
      }

      const baseUrl = process.env.API_URL ? process.env.API_URL.replace(/\/api\/v1\/?$/, "") : `http://localhost:${process.env.PORT || 5000}`;
      const url = `${baseUrl}/uploads/thumbnails/${req.file.filename}`;
      const videoId = req.body.video_id;
      if (videoId) {
        await pool.query("UPDATE videos SET thumbnail_url = ? WHERE id = ?", [url, videoId]);
      }
      res.json({ message: "Thumbnail uploaded", url });
    } catch (e) {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ message: "Invalid image file" });
    }
  });
};
