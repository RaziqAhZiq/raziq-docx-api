import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import cors from "cors";

const app = express();
const upload = multer();

app.use(cors());

app.post("/extract", upload.single("file"), asyn (req, res) => {
try {
const result = await mammoth.extractRawText({ buffer: req.file.buffer });
res.json({ text: result.value });
} catch (err) {
res.status(500).json({ error: err.message });
}
});

app.get("/", (_, res) =>
res.send(" DOCX Extractor Running - POST /extract with form-data field 'file'");
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server listening on ${port}`));
