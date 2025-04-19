/**
 * KRUTOV-XMD - WhatsApp Bot
 * Copyright (c) 2025 Jaden Afrix
 * 
 * Licensed under the MIT License.
 * 
 * Developed with:
 * - Baileys by @adiwajshing
 * - Core concepts inspired but uniquely implemented
 */
require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  proto,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
  delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

const store = makeInMemoryStore({
  logger: pino().child({ level: 'silent', stream: 'store' })
})

let phoneNumber = "911234567890"
let owner = JSON.parse(fs.readFileSync('./data/owner.json'))

global.botname = "KRUTOV-XMD"
global.themeemoji = "•"

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function startKrutovBot() {
  let { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState(`./session`)
  const msgRetryCounterCache = new NodeCache()
  
  const krutov = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !pairingCode,
    browser: ["KRUTOV-XMD", "Chrome", "1.0.0"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      let jid = jidNormalizedUser(key.remoteJid)
      let msg = await store.loadMessage(jid, key.id)
      return msg?.message || ""
    },
    msgRetryCounterCache
  })
  
  store.bind(krutov.ev)
  
  krutov.ev.on('messages.upsert', async chatUpdate => {
    try {
      const mek = chatUpdate.messages[0]
      if (!mek.message) return
      mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
      if (mek.key && mek.key.remoteJid === 'status@broadcast') {
        await handleStatus(krutov, chatUpdate);
        return;
      }
      if (!krutov.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
      if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
      
      await handleMessages(krutov, chatUpdate, true)
    } catch (err) {
      console.error("Message Handler Error:", err)
    }
  })
  
  krutov.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return decode.user && decode.server && decode.user + '@' + decode.server || jid
    } else return jid
  }
  
  krutov.ev.on('contacts.update', update => {
    for (let contact of update) {
      let id = krutov.decodeJid(contact.id)
      if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
    }
  })
  
  krutov.getName = (jid, withoutContact = false) => {
    id = krutov.decodeJid(jid)
    withoutContact = krutov.withoutContact || withoutContact
    let v
    if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
      v = store.contacts[id] || {}
      if (!(v.name || v.subject)) v = krutov.groupMetadata(id) || {}
      resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
    })
    else v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } : id === krutov.decodeJid(krutov.user.id) ? krutov.user : (store.contacts[id] || {})
    return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
  }
  
  krutov.public = true
  krutov.serializeM = (m) => smsg(krutov, m, store)
  
  // Pairing code support
  if (pairingCode && !krutov.authState.creds.registered) {
    if (useMobile) throw new Error('Mobile API not supported with pairing')
    
    let phoneNumberInput = global.phoneNumber || await question(chalk.bgBlack(chalk.greenBright(`Enter your WhatsApp number (e.g., +263...): `)))
    phoneNumberInput = phoneNumberInput.replace(/[^0-9]/g, '')
    
    setTimeout(async () => {
      let code = await krutov.requestPairingCode(phoneNumberInput)
      code = code?.match(/.{1,4}/g)?.join("-") || code
      console.log(chalk.black(chalk.bgGreen(`Pairing Code: `)), chalk.white(code))
    }, 3000)
  }
  
  krutov.ev.on('connection.update', async (s) => {
    const { connection, lastDisconnect } = s
    if (connection == "open") {
      console.log(chalk.green(`\nKRUTOV-XMD connected as ${krutov.user.id}`))
      const botNumber = krutov.user.id.split(':')[0] + '@s.whatsapp.net';
      await krutov.sendMessage(botNumber, {
        text: `KRUTOV-XMD is online.\nTime: ${new Date().toLocaleString()}\nBot by Jaden Afrix\nYouTube: https://youtube.com/@jaden.afrix-z8f`,
      })
    }
    if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
      startKrutovBot()
    }
  })
  
  krutov.ev.on('creds.update', saveCreds)
  krutov.ev.on('group-participants.update', async (update) => {
    await handleGroupParticipantUpdate(krutov, update);
  })
  
  krutov.ev.on('status.update', async (status) => {
    await handleStatus(krutov, status);
  })
  
  krutov.ev.on('messages.reaction', async (status) => {
    await handleStatus(krutov, status);
  })
  
  return krutov
}

startKrutovBot().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
})

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright(`Reloading ${__filename}`))
  delete require.cache[file]
  require(file)
})