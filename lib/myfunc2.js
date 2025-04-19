/**
 * KRUTOV-XMD Utilities (C) 2025 Jaden Afrix
 * Custom-built helper functions for WhatsApp bot integrations
 * Powered by Baileys, Axios, Cheerio, FFMPEG & more
 */

const axios = require("axios")
const cheerio = require("cheerio")
const { resolve } = require("path")
const util = require("util")
const FormData = require("form-data")
const { fromBuffer } = require("file-type")
const fs = require("fs")
const { unlink } = require("fs").promises
const ffmpeg = require("fluent-ffmpeg")
const exec = require("child_process").exec

// Delay
exports.pause = async (ms) => new Promise(res => setTimeout(res, ms))

// Fetch JSON from URL
exports.getJson = async (url, options = {}) => {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 Chrome/95.0.4638.69'
      },
      ...options
    })
    return res.data
  } catch (err) {
    return err
  }
}

// Download buffer from a URL
exports.downloadBuffer = async (url, options = {}) => {
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 Chrome/78.0.3904.70",
        'DNT': 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    })
    return res.data
  } catch (err) {
    return err
  }
}

// Convert WebP to MP4 using Ezgif API
exports.convertWebpToMp4 = async (path) => {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('new-image-url', '')
    form.append('new-image', fs.createReadStream(path))
    
    axios.post('https://s6.ezgif.com/webp-to-mp4', form, {
      headers: form.getHeaders()
    }).then(({ data }) => {
      const $ = cheerio.load(data)
      const file = $('input[name="file"]').attr('value')
      
      const convertForm = new FormData()
      convertForm.append('file', file)
      convertForm.append('convert', 'Convert WebP to MP4!')
      
      return axios.post(`https://ezgif.com/webp-to-mp4/${file}`, convertForm, {
        headers: convertForm.getHeaders()
      }).then(({ data }) => {
        const $ = cheerio.load(data)
        const videoUrl = 'https:' + $('div#output > p.outfile > video > source').attr('src')
        resolve({
          status: true,
          message: "Converted by KRUTOV-XMD",
          result: videoUrl
        })
      })
    }).catch(reject)
  })
}

// Shortcut for fetching HTML content
exports.grabHtml = async (url, options = {}) => {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 Chrome/95.0.4638.69'
      },
      ...options
    })
    return res.data
  } catch (err) {
    return err
  }
}

// Get WhatsApp web version
exports.getWAVersion = async () => {
  const data = await exports.grabHtml("https://web.whatsapp.com/check-update?version=1&platform=web")
  return [data.currentVersion.replace(/[.]/g, ", ")]
}

// Generate random string with extension
exports.randomFile = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`

// Validate URL
exports.isValidHttpUrl = (url) => {
  return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi.test(url)
}

// Check if string is a number
exports.isNumeric = (num) => !isNaN(parseInt(num)) && isFinite(num)

// Upload media to Telegra.ph
exports.uploadToTelegraph = async (filePath) => {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(filePath)) return reject(new Error("File does not exist"))
    try {
      const form = new FormData()
      form.append("file", fs.createReadStream(filePath))
      
      const { data } = await axios.post("https://telegra.ph/upload", form, {
        headers: form.getHeaders()
      })
      
      resolve("https://telegra.ph" + data[0].src)
    } catch (err) {
      reject(err)
    }
  })
}

// Convert GIF buffer to MP4 buffer using ffmpeg
exports.gifToMp4Buffer = async (gifBuffer) => {
  const fileID = Math.random().toString(36).slice(2)
  const gifPath = `./XeonMedia/trash/${fileID}.gif`
  const mp4Path = `./XeonMedia/trash/${fileID}.mp4`
  
  fs.writeFileSync(gifPath, gifBuffer)
  
  exec(`ffmpeg -i ${gifPath} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${mp4Path}`)
  
  await exports.pause(4000)
  
  const mp4Buffer = fs.readFileSync(mp4Path)
  
  Promise.all([
    unlink(mp4Path).catch(() => {}),
    unlink(gifPath).catch(() => {})
  ])
  
  return mp4Buffer
}