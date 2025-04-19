const fetch = require('node-fetch');
const FormData = require('form-data');
const FileType = require('file-type');
const fs = require('fs');
const path = require('path');

/**
 * Upload an image buffer to qu.ax (with telegra.ph fallback).
 * Supports JPEG, JPG, PNG formats.
 * 
 * @param {Buffer} buffer - Image buffer.
 * @returns {Promise<string>} - URL of uploaded image.
 */
async function uploadImage(buffer) {
  const tempDir = path.join(__dirname, 'tmp');
  
  try {
    // Ensure tmp directory exists
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    // Detect MIME type
    const fileType = await FileType.fromBuffer(buffer);
    const { ext = 'png', mime = 'image/png' } = fileType || {};
    
    const tempFile = path.join(tempDir, `upload_${Date.now()}.${ext}`);
    fs.writeFileSync(tempFile, buffer);
    
    // Prepare form data for qu.ax
    const form = new FormData();
    form.append('files[]', fs.createReadStream(tempFile));
    
    const response = await fetch('https://qu.ax/upload.php', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    // Clean up
    fs.unlinkSync(tempFile);
    
    const result = await response.json();
    
    if (result?.success) {
      return result.files[0].url;
    } else {
      // Fallback: Upload to Telegraph
      return await fallbackToTelegraph(buffer, ext, mime);
    }
    
  } catch (err) {
    console.error('Image Upload Failed:', err.message);
    throw new Error('Image upload failed.');
  }
}

/**
 * Upload image buffer to telegra.ph
 * @param {Buffer} buffer 
 * @param {string} ext 
 * @param {string} mime 
 * @returns {Promise<string>}
 */
async function fallbackToTelegraph(buffer, ext, mime) {
  try {
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
  } catch (err) {
    throw new Error(`Fallback failed: ${err.message}`);
  }
}

module.exports = { uploadImage };