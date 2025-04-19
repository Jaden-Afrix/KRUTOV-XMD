/**
 * KRUTOV-XMD - A WhatsApp Bot
 * Version: 1.0.0
 * Author: Jaden Afrix
 * YouTube: https://youtube.com/@jaden.afrix-z8f
 * GitHub: https://github.com/Jaden-Afrix/KRUTOV-XMD
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * 
 * Credits:
 * - Baileys Library by @adiwajshing
 * - Inspired by TechGod143, DGXEON
 */

const axios = require('axios');
const BodyForm = require('form-data');
const { fromBuffer } = require('file-type');
const fetch = require('node-fetch');
const fs = require('fs');
const cheerio = require('cheerio');

// Upload to telegra.ph
function TelegraPh(Path) {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(Path)) return reject(new Error("File not found"));
    try {
      const form = new BodyForm();
      form.append("file", fs.createReadStream(Path));
      const { data } = await axios.post("https://telegra.ph/upload", form, {
        headers: form.getHeaders()
      });
      resolve("https://telegra.ph" + data[0].src);
    } catch (err) {
      reject(new Error(String(err)));
    }
  });
}

// Upload to uguu.se
function UploadFileUgu(input) {
  return new Promise(async (resolve, reject) => {
    const form = new BodyForm();
    form.append("files[]", fs.createReadStream(input));
    try {
      const { data } = await axios.post("https://uguu.se/upload.php", form, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          ...form.getHeaders()
        }
      });
      resolve(data.files[0]);
    } catch (err) {
      reject(err);
    }
  });
}

// Convert WebP to MP4 using ezgif
function webp2mp4File(path) {
  return new Promise((resolve, reject) => {
    const form = new BodyForm();
    form.append('new-image-url', '');
    form.append('new-image', fs.createReadStream(path));
    
    axios.post('https://s6.ezgif.com/webp-to-mp4', form, {
      headers: { 'Content-Type': `multipart/form-data; boundary=${form._boundary}` }
    }).then(({ data }) => {
      const $ = cheerio.load(data);
      const file = $('input[name="file"]').attr('value');
      
      const form2 = new BodyForm();
      form2.append('file', file);
      form2.append('convert', "Convert WebP to MP4!");
      
      axios.post('https://ezgif.com/webp-to-mp4/' + file, form2, {
        headers: { 'Content-Type': `multipart/form-data; boundary=${form2._boundary}` }
      }).then(({ data }) => {
        const $ = cheerio.load(data);
        const result = 'https:' + $('div#output > p.outfile > video > source').attr('src');
        resolve({
          status: true,
          message: "Converted by KRUTOV-XMD",
          result
        });
      }).catch(reject);
    }).catch(reject);
  });
}

// Upload to Flonime
async function floNime(medianya, options = {}) {
  const { ext } = await fromBuffer(medianya) || options.ext;
  const form = new BodyForm();
  form.append('file', medianya, 'tmp.' + ext);
  
  const response = await fetch('https://flonime.my.id/upload', {
    method: 'POST',
    body: form
  });
  
  return await response.json();
}

module.exports = { TelegraPh, UploadFileUgu, webp2mp4File, floNime };