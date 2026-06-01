const sizeOf = require("image-size").default;
const pool = require("../config/db");

exports.uploadThumbnail = async (req, res) => {
  const { image, video_id } = req.body;
  if (!image || !image.startsWith("data:image/")) {
    return res.status(400).json({ message: "No valid image data provided" });
  }

  const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
  if (!matches) return res.status(400).json({ message: "Invalid image format" });

  const buf = Buffer.from(matches[2], "base64");

  try {
    const dims = sizeOf(buf);
    if (dims.width < 300 || dims.height < 200) {
      return res.status(400).json({ message: `Image too small. Minimum 300×200px, got ${dims.width}×${dims.height}px` });
    }
  } catch {
    return res.status(400).json({ message: "Invalid image file" });
  }

  if (video_id) {
    await pool.query("UPDATE videos SET thumbnail_url = ? WHERE id = ?", [image, video_id]);
  }

  res.json({ message: "Thumbnail uploaded", url: image });
};
