import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import XLSX from "xlsx";
import cors from "cors";

const app = express();
const upload = multer();

app.use(cors());

// 🩺 Health check route
app.get("/", (_, res) => {
  res.send(`
    ✅ raziq-docx-api is running.<br>
    Use <b>POST /extract</b> for DOCX or <b>POST /extract-excel-headers</b> for Excel.
  `);
});

// 🧾 DOCX text extractor
app.post("/extract", upload.any(), async (req, res) => {
  try {
    const file = req.files?.[0];
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const result = await mammoth.extractRawText({ buffer: file.buffer });
    res.json({ text: result.value.trim() });
  } catch (err) {
    console.error("DOCX Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📊 Excel header extractor
app.post("/extract-excel-headers", express.raw({ type: "*/*", limit:"20mb"}), (req, res) => {
  try {
    const workbook = XLSX.read(req.body, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = data[0] || [];
    res.json({ headers });
  } catch (err) {
    console.error("Excel Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// 🚀 Start the server
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 raziq-docx-api running on port ${port}`));
