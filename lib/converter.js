/**
 * KRUTOV-XMD - A WhatsApp Bot
 * Version: 1.0.0
 * 
 * Developed by: Jaden Afrix
 * GitHub: https://github.com/Jaden-Afrix/KRUTOV-XMD
 * YouTube: https://youtube.com/@jaden.afrix-z8f
 * All rights reserved © 2025 by Jaden-Afrix
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * 
 * Credits:
 * - Baileys Library by @adiwajshing
 * - Pair Code implementation inspired by TechGod143 & DGXEON
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      let tmp = path.join(__dirname, '../database', +new Date + '.' + ext);
      let out = tmp + '.' + ext2;
      await fs.promises.writeFile(tmp, buffer);
      spawn('ffmpeg', ['-y', '-i', tmp, ...args, out])
        .on('error', reject)
        .on('close', async (code) => {
          try {
            await fs.promises.unlink(tmp);
            if (code !== 0) return reject(code);
            resolve(await fs.promises.readFile(out));
            await fs.promises.unlink(out);
          } catch (e) {
            reject(e);
          }
        });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Convert Audio to WhatsApp Playable Audio (MP3)
 */
function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-ac', '2',
    '-b:a', '128k',
    '-ar', '44100',
    '-f', 'mp3'
  ], ext, 'mp3');
}

/**
 * Convert Audio to WhatsApp PTT (Opus)
 */
function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus');
}

/**
 * Convert Video to WhatsApp Playable Video (MP4)
 */
function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ar', '44100',
    '-crf', '32',
    '-preset', 'slow'
  ], ext, 'mp4');
}

module.exports = {
  toAudio,
  toPTT,
  toVideo,
  ffmpeg,
};