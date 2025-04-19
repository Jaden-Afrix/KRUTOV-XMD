const fetch = require('node-fetch');
const FormData = require('form-data');
const FileType = require('file-type');
const fs = require('fs');
const path = require('path');

async function uploadImage(buffer) {
  const tempDir = path.join(__dirname, 'tmp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  
  const fileType = await FileType.fromBuffer(buffer);
  const { ext = 'png', mime = 'image/png' } = fileType || {};
  const tempFile = path.join(tempDir, `upload_${Date.now()}.${ext}`);
  fs.writeFileSync(tempFile, buffer);
  
  const form = new FormData();
  form.append('files[]', fs.createReadStream(tempFile));
  
  try {
    const response = await fetch('https://qu.ax/upload.php', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    fs.unlinkSync(tempFile);
    const result = await response.json();
    
    if (result?.success) {
      return result.files[0].url;
    } else {
      return await fallbackToTelegraph(buffer, ext, mime);
    }
  } catch (err) {
    fs.unlinkSync(tempFile);
    return await fallbackToTelegraph(buffer, ext, mime);
  }
}

async function fallbackToTelegraph(buffer, ext, mime) {
  const form = new FormData();
  form.append('file', buffer, {
    filename: `upload.${ext}`,
    contentType: mime
  });
  
  const res = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: form
  });
  
  const data = await res.json();
  if (data[0]?.src) {
    return 'https://telegra.ph' + data[0].src;
  } else {
    throw new Error('Telegraph upload failed');
  }
}

module.exports = { uploadImage };