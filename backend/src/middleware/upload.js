const multer = require("multer");
const path   = require("path");
const crypto = require("crypto");
const { ValidationError } = require("../errors/errors");

const storage = multer.diskStorage({
  // Save avatars to public/uploads/avatars/ — served as static files
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads/avatars"));
  },

  // Give each file a unique name so uploads never overwrite each other
  // Format: <random-hex>-<timestamp>.<ext>
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const ext      = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}-${Date.now()}${ext}`);
  },
});

//Filter: only allow image files ─
function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);  // accept
  } else {
    cb(new ValidationError("Only JPEG, PNG, and WebP images are allowed"), false);
  }
}

// ── The uploadAvatar middleware 
exports.uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
}).single("avatar");