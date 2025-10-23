import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import cors from "cors";

const app = express();
const upload = multer();

app.use(cors()); // allow calls from your OutSystems app

// Health check endpoint
app.get("/", (_, res) => {
  res.send("✅ DOCX Extractor Running — POST /extract with form-data field 'file'");
});

// Main extraction endpoint
app.post("/extract", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Use field name 'file'." });
    }

    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    res.json({ text: result.value.trim() });
  } catch (err) {
    console.error("Extraction error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Render assigns PORT automatically
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 raziq-docx-api running on port ${port}`));
