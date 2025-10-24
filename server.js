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
    Use <b>POST /extract</b> for DOCX, <b>POST /extract-excel-headers</b> for Excel headers, or <b>POST /compare-excel</b> to detect Excel file type.
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
app.post("/extract-excel-headers", express.raw({ type: "*/*", limit: "20mb" }), (req, res) => {
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

// 🧮 Excel file comparator (binary body upload)
app.post("/compare-excel", express.raw({ type: "*/*", limit: "20mb" }), (req, res) => {
  try {
    if (!req.body || !req.body.length) {
      return res.status(400).send("No file uploaded or invalid request body");
    }

    // Step 1: Read uploaded Excel buffer
    const workbook = XLSX.read(req.body, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const fileHeaders = (data[0] || []).map((h) => h?.toString().trim().toLowerCase());

    // Step 2: Define known header templates
    const headerSets = {
      PAE_Excel: [
        "identity no","identity type","employee id","personal name","hire date","previous service year","probation period","confirmation due date",
        "confirmation date","cessation date","cessation code","retirement age","retirement due date","retirement date","supervisor name",
        "is supervisor","employment act deduction cap","branch desc","department desc","section desc","position desc","category desc",
        "currentbasicratetype","currentsalarytype","basic rate","mvc","nwc","current accum. mvc %","total wage","is shift worker","key shift team",
        "calendar","salary grade id","classification code","anniversary date","contract start date","conversion date","additional payment",
        "bank 1 bank payment group","bank 1 bank id","bank 1 bank branch id","bank 1 bank account no","bank 1 value","bank 1 beneficiary name",
        "bank 1 payment type","bank 2 bank payment group","bank 2 bank id","bank 2 bank branch id","bank 2 bank account no","bank 2 value",
        "bank 2 beneficiary name","bank 2 payment type","vessel indicator (fr, sr, sri)","vessel name","vessel registration","sdf option",
        "title","alias","other id","nationality","date of birth","country of birth","gender","marital status","race","religion","blood group",
        "height","weight","age","passport country issue","current residence status","residence status career code","residence status effective date",
        "address contact location","address line 1","address line 2","address line 3","address state","address city","address country","address postal code",
        "eportal email","office email","eportal contact","eportal ext","home contact","home ext","office contact","office ext","work contact","work ext",
        "education level","education record","start date","end date","institution","result","family member name","family member identity no",
        "family member identity type","family member date of birth","family member occupation","family member company","family member gender","relationship",
        "family member contact 1","family member contact 2","family member email","family member address","family member country","family member state",
        "family member city","family member postal code","family member marital status","family member passport country ","branch id","department id",
        "section id","position id","category id","salary grade desc","classification desc"
      ],

      Basic_Rate_Progression_Excel: [
        "employee id","employee name","department","category","position","pay group","salary type","current accumulated mvc %","mvc capping %",
        "progression date","effective date","next increment date","exchange rate id","foreign currency","progression code","career code","remarks",
        "is current","previous rate total","increment amount total","percentage total","new rate total"
      ],

      Career_Progression_Excel: [
        "effective date","employee id","employee name","cessation date","career code","remarks","attachment id","is current","branch name","department",
        "category","position","section","supervisor id","salary grade","classification","leave group","key shift team"
      ],

      Contract_Progression_Report: [
        "effective date","employee id","employee name","cessation date","career code","remarks","attachment id","is current","branch name","department",
        "category","position","section","supervisor id","salary grade","classification","leave group","key shift team"
      ]
    };

    // Step 3: Compare headers
    const scores = {};
    for (const [name, knownHeaders] of Object.entries(headerSets)) {
      const normalizedKnown = knownHeaders.map((h) => h.toLowerCase());
      const matches = normalizedKnown.filter((h) => fileHeaders.includes(h));
      const score = (matches.length / normalizedKnown.length) * 100;
      scores[name] = score;
    }

    // Step 4: Pick best match
    const bestMatch = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

    // Step 5: Return only file name as plain text
    res.type("text/plain").send(bestMatch);
  } catch (err) {
    console.error("Compare Excel Error:", err);
    res.status(500).send("Error comparing Excel file: " + err.message);
  }
});

// 🚀 Start the server
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 raziq-docx-api running on port ${port}`));
