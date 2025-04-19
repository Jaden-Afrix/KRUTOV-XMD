// === KRUTOV-XMD Sticker Engine ===
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { fileTypeFromBuffer } = require('file-type');
const webp = require('node-webpmux');
const fetch = require('node-fetch');
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
const { promisify } = require('util');
const execCmd = promisify(exec);
const { writeExifImg } = require('./exif');

const tempDir = path.join(__dirname, '../tmp');

// === Simple Image to Sticker Converter ===
function convertImageToSticker(imageBuffer, sourceUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      if (sourceUrl) {
        const res = await fetch(sourceUrl);
        if (!res.ok) throw await res.text();
        imageBuffer = await res.buffer();
      }
      
      const inputPath = path.join(tempDir, `${Date.now()}.jpeg`);
      await fs.promises.writeFile(inputPath, imageBuffer);
      
      const processFfmpeg = spawn('ffmpeg', [
        '-y', '-i', inputPath,
        '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
        '-f', 'png', '-'
      ]);
      
      processFfmpeg.on('error', reject);
      processFfmpeg.on('close', async () => await fs.promises.unlink(inputPath));
      
      const chunks = [];
      const [converter, ...args] = [...(module.exports.support.gm ? ['gm'] : module.exports.magick ? ['magick'] : []), 'convert', 'png:-', 'webp:-'];
      const convertProc = spawn(converter, args);
      
      convertProc.on('error', err => console.error(err));
      convertProc.stdout.on('data', data => chunks.push(data));
      processFfmpeg.stdout.pipe(convertProc.stdin);
      
      convertProc.on('exit', () => resolve(Buffer.concat(chunks)));
    } catch (err) {
      reject(err);
    }
  });
}

// === External API Sticker Generator ===
async function generateStickerUsingAPI(media, link, pack, author) {
  const finalUrl = link ? link : await uploadFile(media);
  const apiURL = 'https://api.xteam.xyz/sticker/wm?' + new URLSearchParams({
    url: finalUrl,
    packname: pack,
    author: author
  });
  const res = await fetch(apiURL);
  return await res.buffer();
}

// === Basic FFmpeg Resize Converter ===
async function simpleResizeToWebP(image, url) {
  if (url) {
    const res = await fetch(url);
    if (!res.ok) throw await res.text();
    image = await res.buffer();
  }
  
  return ffmpeg(image, [
    '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1'
  ], 'jpeg', 'webp');
}

// === Sticker Formatter with Metadata ===
async function advancedStickerFormatter(media, source, pack, author, tags = [''], extras = {}) {
  const { Sticker } = await import('wa-sticker-formatter');
  const metadata = {
    type: 'default',
    pack: pack,
    author: author,
    categories: tags,
    ...extras
  };
  return new Sticker(media || source, metadata).toBuffer();
}

// === Manual FFmpeg to WebP Converter ===
function convertWithFfmpeg(imageBuffer, remoteUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      if (remoteUrl) {
        const response = await fetch(remoteUrl);
        if (!response.ok) throw await response.text();
        imageBuffer = await response.buffer();
      }
      
      const type = await fileTypeFromBuffer(imageBuffer) || { mime: 'application/octet-stream', ext: 'bin' };
      if (type.ext === 'bin') return reject(imageBuffer);
      
      const input = path.join(__dirname, `../tmp/${Date.now()}.${type.ext}`);
      const output = `${input}.webp`;
      await fs.promises.writeFile(input, imageBuffer);
      
      let ffproc = ffmpeg(input)
        .inputFormat(type.ext)
        .on('error', err => {
          console.error(err);
          fs.promises.unlink(input);
          reject(imageBuffer);
        })
        .on('end', async () => {
          await fs.promises.unlink(input);
          resolve(await fs.promises.readFile(output));
        })
        .addOutputOptions([
          `-vcodec`, `libwebp`,
          `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse`
        ])
        .toFormat('webp')
        .save(output);
    } catch (err) {
      reject(err);
    }
  });
}

// === Embed EXIF Metadata ===
async function embedStickerExif(webpData, pack, creator, tags = [''], additional = {}) {
  const sticker = new webp.Image();
  const packId = crypto.randomBytes(32).toString('hex');
  const json = {
    'sticker-pack-id': packId,
    'sticker-pack-name': pack,
    'sticker-pack-publisher': creator,
    'emojis': tags,
    ...additional
  };
  
  const header = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  const exifData = Buffer.concat([header, jsonBuffer]);
  exifData.writeUIntLE(jsonBuffer.length, 14, 4);
  
  await sticker.load(webpData);
  sticker.exif = exifData;
  return await sticker.save(null);
}

// === Full Sticker Builder ===
async function createSticker(imgOnly, sourceURL, packName, authorName) {
  try {
    const res = await fetch(sourceURL);
    const buf = await res.buffer();
    
    const finalSticker = await writeExifImg(buf, {
      packname: packName || 'KRUTOV-XMD',
      author: authorName || 'Jaden Afrix'
    });
    
    return finalSticker;
  } catch (err) {
    console.error('Sticker Generation Error:', err);
    return null;
  }
}

// === Support Flags for Sticker System ===
const support = {
  ffmpeg: true,
  ffprobe: true,
  ffmpegWebp: true,
  convert: true,
  magick: false,
  gm: false,
  find: false
};

// === Exported Module Functions ===
module.exports = {
  createSticker,
  convertImageToSticker,
  generateStickerUsingAPI,
  simpleResizeToWebP,
  convertWithFfmpeg,
  embedStickerExif,
  support
};