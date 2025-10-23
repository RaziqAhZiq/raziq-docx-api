# raziq-docx-api

A minimal Node + Mammoth.js service for extracting text from '.docx' files.

### Deploy on Render
1. Go to https://render.com -> **New Web Service**
2. Upload this folder or connect it via Git
3. Runtime: Node
Build Command: 
cat > README.md << 'EOF'
# raziq-docx-api

A minimal Node + Mammoth.js service for extracting text from '.docx' files.

### Deploy on Render
1. Go to https://render.com -> **New Web Service**
2. Upload this folder or connect it via Git
3. Runtime: Node
Build Command: 'npm install'

Start Command: 'npm start'
4. After deploy, your endpoint:
'https://raziq-docx-api.onrender.com/extract'

**API Usage**
- /POST /extract/
- Content-Type: 'multipart/form-data'
- Field name: 'file'
- Response:
'''json
{ "text": "Extracted text content..." }

---

### 5. Add **odc_rest_definition.json**
```bash
cat > odc_rest_definition.json <<'EOF'
{
  "name": "DocxExtractorAPI",
  "base_url": "https://raziq-docx-api.onrender.com",
  "resources": [
    {
      "name": "Extract",
      "method": "POST",
      "path": "/extract",
      "request": {
        "content_type": "multipart/form-data",
        "body_parameters": [
          { "name": "file", "type": "BinaryData" }
        ]
      },
      "response": {
        "content_type": "application/json",
        "output_parameters": [
          { "name": "text", "type": "Text" },
          { "name": "error", "type": "Text" }
        ]
      }
    }
  ]
}
EOF