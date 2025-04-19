const ytdl = require('@distube/ytdl-core');
const yts = require('youtube-yts');
const readline = require('readline');
const ffmpeg = require('fluent-ffmpeg');
const NodeID3 = require('node-id3');
const fs = require('fs');
const { fetchBuffer } = require('./myfunc2');
const ytMusicAPI = require('node-youtube-music');
const { randomBytes } = require('crypto');
const path = require('path');

const ytLinkRegex = /(?:youtube\.com\/\S*(?:\/(?:embed)\/|watch\?(?:\S*?&?v=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/;

class MediaHandler {
  constructor() {
    this.storage = path.join(process.cwd(), 'media-temp');
    if (!fs.existsSync(this.storage)) {
      fs.mkdirSync(this.storage, { recursive: true });
    }
  }
  
  static isYouTube(url) {
    return ytLinkRegex.test(url);
  }
  
  static extractID(url) {
    if (!this.isYouTube(url)) throw new Error('Invalid YouTube link');
    return ytLinkRegex.exec(url)[1];
  }
  
  static async tagAudio(file, info) {
    const buffer = (await fetchBuffer(info.Image)).buffer;
    NodeID3.write({
      title: info.Title,
      artist: info.Artist,
      originalArtist: info.Artist,
      album: info.Album,
      year: info.Year || '',
      image: {
        mime: 'jpeg',
        type: { id: 3, name: 'cover' },
        imageBuffer: buffer,
        description: `Cover: ${info.Title}`
      }
    }, file);
  }
  
  static async searchVideos(text, region = {}) {
    const result = await yts.search({ query: text, hl: 'id', gl: 'ID', ...region });
    return result.videos;
  }
  
  static async musicSearch(term) {
    const raw = await ytMusicAPI.searchMusics(term);
    return raw.map(track => ({
      isYTMusic: true,
      title: `${track.title} - ${track.artists.map(a => a.name).join(', ')}`,
      artist: track.artists.map(a => a.name).join(', '),
      id: track.youtubeId,
      url: `https://youtu.be/${track.youtubeId}`,
      album: track.album,
      duration: {
        seconds: track.duration.totalSeconds,
        label: track.duration.label
      },
      image: track.thumbnailUrl.replace('w120-h120', 'w600-h600')
    }));
  }
  
  static async fetchMP3Data(query) {
    const trackList = Array.isArray(query) ? query : await this.musicSearch(query);
    const track = trackList[0];
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${track.id}`, { lang: 'id' });
    
    const filePath = `./XeonMedia/audio/${randomBytes(3).toString('hex')}.mp3`;
    const stream = ytdl(track.id, { filter: 'audioonly', quality: 140 });
    
    return new Promise((resolve) => {
      ffmpeg(stream)
        .audioCodec('libmp3lame')
        .audioBitrate(128)
        .audioFrequency(44100)
        .audioChannels(2)
        .toFormat('mp3')
        .save(filePath)
        .on('end', async () => {
          await this.tagAudio(filePath, {
            Title: track.title,
            Artist: track.artist,
            Album: track.album,
            Year: info.videoDetails.publishDate.split('-')[0],
            Image: track.image
          });
          resolve({
            meta: track,
            path: filePath,
            size: fs.statSync(filePath).size
          });
        });
    });
  }
  
  static async fetchVideoDetails(input, desiredQuality = 134) {
    const videoID = this.isYouTube(input) ? this.extractID(input) : input;
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoID}`, { lang: 'id' });
    
    const selected = ytdl.chooseFormat(info.formats, {
      filter: 'videoandaudio',
      format: desiredQuality
    });
    
    return {
      title: info.videoDetails.title,
      thumb: info.videoDetails.thumbnails.at(-1),
      date: info.videoDetails.publishDate,
      duration: info.videoDetails.lengthSeconds,
      channel: info.videoDetails.ownerChannelName,
      quality: selected.qualityLabel,
      contentLength: selected.contentLength,
      description: info.videoDetails.description,
      videoUrl: selected.url
    };
  }
  
  static async convertToMP3(url, meta = {}, useYTMeta = false) {
    const videoURL = this.isYouTube(url) ? `https://www.youtube.com/watch?v=${this.extractID(url)}` : url;
    const { videoDetails } = await ytdl.getInfo(videoURL, { lang: 'id' });
    
    const audioPath = `./XeonMedia/audio/${randomBytes(3).toString('hex')}.mp3`;
    const audioStream = ytdl(videoURL, { filter: 'audioonly', quality: 140 });
    
    const file = await new Promise((resolve) => {
      ffmpeg(audioStream)
        .audioBitrate(128)
        .toFormat('mp3')
        .save(audioPath)
        .on('end', () => resolve(audioPath));
    });
    
    if (Object.keys(meta).length > 0) {
      await this.tagAudio(file, meta);
    } else if (useYTMeta) {
      await this.tagAudio(file, {
        Title: videoDetails.title,
        Album: videoDetails.author.name,
        Year: videoDetails.publishDate.split('-')[0],
        Image: videoDetails.thumbnails.at(-1).url
      });
    }
    
    return {
      meta: {
        title: videoDetails.title,
        channel: videoDetails.author.name,
        seconds: videoDetails.lengthSeconds,
        image: videoDetails.thumbnails.at(-1).url
      },
      path: file,
      size: fs.statSync(audioPath).size
    };
  }
  
  async downloadAudio(url) {
    const videoInfo = await ytdl.getInfo(url);
    const audioOnly = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
    
    const outputFile = path.join(this.storage, `${Date.now()}.mp3`);
    return new Promise((resolve, reject) => {
      const stream = ytdl(url, { quality: 'highestaudio', filter: 'audioonly' });
      
      ffmpeg(stream)
        .audioBitrate(128)
        .toFormat('mp3')
        .save(outputFile)
        .on('end', () => {
          resolve({
            path: outputFile,
            meta: {
              title: videoInfo.videoDetails.title,
              thumbnail: videoInfo.videoDetails.thumbnails[0].url
            }
          });
        })
        .on('error', reject);
    });
  }
}

module.exports = new MediaHandler();