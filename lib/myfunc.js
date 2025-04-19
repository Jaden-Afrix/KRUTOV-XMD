/**
 * KRUTOV-XMD Utilities Module
 * © 2025 Jaden Afrix
 * 
 * Utilities for KRUTOV-XMD bot powered by Baileys
 * Inspired by several sources, customized for originality.
 */

const {
  proto,
  delay,
  getContentType
} = require('@whiskeysockets/baileys')
const chalk = require('chalk')
const fs = require('fs')
const crypto = require('crypto')
const axios = require('axios')
const moment = require('moment-timezone')
const { sizeFormatter } = require('human-readable')
const util = require('util')
const Jimp = require('jimp')
const { tmpdir } = require('os')
const path = require('path')

// Timestamp in seconds
exports.nowSeconds = () => Math.floor(Date.now() / 1000)

// Tag generator
exports.createTag = (epoch) => {
  let base = exports.nowSeconds().toString()
  return epoch ? `${base}.--${epoch}` : base
}

// Calculate duration
exports.calculateDuration = (past, present) => moment.duration(present - moment(past * 1000)).asSeconds()

// Random file name with extension
exports.randomName = (ext) => `${Math.floor(Math.random() * 99999)}${ext}`

// Download file as buffer
exports.fetchBuffer = async (url, options = {}) => {
  try {
    const res = await axios.get(url, {
      headers: {
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

// Download image as buffer (same logic)
exports.fetchImage = exports.fetchBuffer

// Fetch JSON from a URL
exports.requestJson = async (url, options = {}) => {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      ...options
    })
    return res.data
  } catch (err) {
    return err
  }
}

// Convert runtime to human-readable
exports.humanTime = (secs) => {
  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${d ? d + 'd, ' : ''}${h ? h + 'h, ' : ''}${m ? m + 'm, ' : ''}${s}s`
}

// Format milliseconds to clock
exports.toClock = (ms) => {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

// Sleep/delay
exports.pause = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// URL validation
exports.isValidUrl = (str) => /^https?:\/\//i.test(str)

// Format time
exports.getTime = (format = 'HH:mm:ss', date) => {
  const zone = 'Asia/Jakarta'
  return moment(date || undefined).tz(zone).locale('id').format(format)
}

// Format full date
exports.formatFullDate = (input, locale = 'id') => {
  const date = new Date(input)
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })
}

// Timestamp to readable Indonesian date
exports.customDate = (input) => {
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']
  const date = new Date(input)
  return `${days[date.getDay()]}, ${date.getDate()} - ${months[date.getMonth()]} - ${date.getFullYear()}`
}

// Format file size
exports.prettySize = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (value, unit) => `${value} ${unit}B`
})

// Stringify JSON
exports.toJSON = (val) => JSON.stringify(val, null, 2)

// Utility formatter
exports.fmt = (...args) => util.format(...args)

// Logical switch
exports.matchCase = (check, inputs, outputs) => {
  if (inputs.length !== outputs.length) throw new Error('Mismatched logic inputs/outputs')
  for (let i in inputs) {
    if (util.isDeepStrictEqual(check, inputs[i])) return outputs[i]
  }
  return null
}

// Create profile picture preview
exports.resizeImage = async (buffer) => {
  const image = await Jimp.read(buffer)
  const resized = image.crop(0, 0, image.getWidth(), image.getHeight()).scaleToFit(720, 720)
  const jpg = await resized.getBufferAsync(Jimp.MIME_JPEG)
  return { img: jpg, preview: jpg }
}

// Convert bytes to size
exports.convertSize = (bytes, precision = 2) => {
  if (!bytes) return '0 Bytes'
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(precision))} ${sizes[i]}`
}

// Get file size
exports.measureSize = async (input) => {
  if (/^http/.test(input)) {
    const res = await axios.head(input)
    return exports.convertSize(parseInt(res.headers['content-length'] || 0))
  } else if (Buffer.isBuffer(input)) {
    return exports.convertSize(Buffer.byteLength(input))
  }
  throw new Error('Unsupported type')
}

// Parse mentions
exports.extractMentions = (text = '') => {
  return [...text.matchAll(/@(\d{5,16}|0)/g)].map(match => match[1] + '@s.whatsapp.net')
}

// Identify group admins
exports.findAdmins = (members) => {
  return members.filter(p => ['admin', 'superadmin'].includes(p.admin)).map(p => p.id)
}