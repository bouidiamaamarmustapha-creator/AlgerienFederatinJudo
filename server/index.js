import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Use absolute path for assets directory
const ASSETS_DIR = path.join(process.cwd(), "src", "assets");

// Serve static assets
app.use('/assets', express.static(ASSETS_DIR));

// Ensure folder exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ASSETS_DIR),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// GET list of photos
app.get("/api/photos", (req, res) => {
  fs.readdir(ASSETS_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: "Failed to read folder" });
    // Filter out non-image files
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|svg)$/i.test(file));
    res.json(imageFiles);
  });
});

// POST upload a photo
app.post("/api/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  res.json({ success: true, filename: req.file.originalname });
});

// DELETE a photo
app.delete("/api/photos/:name", (req, res) => {
  const filePath = path.join(ASSETS_DIR, req.params.name);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found." });
  }

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: "Deleted successfully" });
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
