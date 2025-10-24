import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import cors from "cors";

const app = express();
const upload = multer();

app.use(cors());

app.get("/", (_, res) => {
  res.send("✅ raziq-docx-api is running.<br>Use POST /extract for DOCX or POST /extract-excel-headers for Excel.");
});

// Excel header extractor
app.post("/extract-excel-headers", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Read workbook from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert to array of arrays
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Get first row (headers)
    const headers = data[0] || [];

    res.json({ headers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Keep your old /extract DOCX route
// ...

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server running on port ${port}`));
