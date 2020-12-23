const ipcMain = global.ipcMain
const { Path } = require('path');
const rp = require('request-promise');
const request = require('request');
const $ = require('cheerio');
const os = require('os');
const fs = require('fs');
var parser = require('fast-xml-parser');
var Promise = require("bluebird");

var ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static').replace(
  'app.asar',
  'app.asar.unpacked'
);
ffmpeg.setFfmpegPath(ffmpegPath);

var availableResolutions = [];
var audioLink = null;
var videoRepresentations = null;

ipcMain.on('buttonPressed', (event, data) => {
  availableResolutions = [];
  audioLink = null;
  videoRepresentations = null;

  rp(data)
    .then(scrapMpdLink)
    .then(rp)
    .then(getAvailableQuality)
    .then(() => {event.sender.send('available-resolutions', availableResolutions)})
    .catch(displayErrors);
});

ipcMain.on('downloadPressed', (event, data) => {
  var links = getLinksForQuality(data)

  downloadAudioVideo(links)
    .then(encodeFinalVideo)
    .then((path) => {
      event.sender.send('clip-created', path)
    })
})

function displayErrors(err) {
  console.log(err)
}

function scrapMpdLink(html) {
  var link = $('meta[property="og:image"]', html).attr('content').split("=")[0];
  var mpdLink = link + "=mm,dash";

  return mpdLink;
}

function encodeFinalVideo(paths) {

  var tempDir = os.tmpdir();
  var path = tempDir + '/outputfile.mp4';

  return new Promise(function (resolve, reject) {
    ffmpeg()
      .addInput(paths.video)
      .addInput(paths.audio)
      .videoCodec('copy')
      .on('error', function (err) {
        reject(err)
      })
      .on('end', function () {
        resolve(path)
      })
      .save(path);
  });
}

function downloadAudioVideo(links) {
  var tempDir = os.tmpdir();
  console.log(tempDir);

  var videoLocation = tempDir + "/video.mp4";
  var audioLocation = tempDir + "/audio.mp3"

  /// Download video
  var videoLoaded = new Promise(function (resolve, reject) {
    download(links.video, videoLocation, resolve)
  });

  return videoLoaded
    .then(function (err) {
      return new Promise(function (resolve, reject) {
        download(links.audio, audioLocation, resolve);
      });
    })
    .then(function () {
      var paths = {
        video: videoLocation,
        audio: audioLocation
      }

      return paths;
    })
}

function getAvailableQuality(html) {
  var defaultOptions = {
    ignoreAttributes: false
  }

  var jsonObj = parser.parse(html, defaultOptions);
  var adaptationSets = jsonObj["MPD"]["Period"];

  var set0 = adaptationSets.AdaptationSet[0]
  var set1 = adaptationSets.AdaptationSet[1]

  if (set0['@_mimeType'] == 'audio/mp4') {
    audioLink = set0.Representation.BaseURL
    videoRepresentations = set1.Representation
  } else {
    audioLink = set1.Representation.BaseURL
    videoRepresentations = set0.Representation
  }

  videoRepresentations.forEach(representation => {
    availableResolutions.push(representation['@_height'])
  });

  return availableResolutions;
}

function getLinksForQuality(quality) {
  var videoLink = null;

  videoRepresentations.forEach(representation => {
    if (representation["@_height"] == quality)
      videoLink = representation.BaseURL
  });

  console.log("Video link: " + videoLink);
  console.log("Audio link: " + audioLink);

  var links = {
    video: videoLink,
    audio: audioLink
  }

  return links;
}


const download = (url, dest, cb) => {
  const file = fs.createWriteStream(dest);
  const sendReq = request.get(url);

  // verify response code
  sendReq.on('response', (response) => {
    if (response.statusCode !== 200) {
      return cb('Response status was ' + response.statusCode);
    }

    sendReq.pipe(file);
  });

  // close() is async, call cb after close completes
  file.on('finish', () => file.close(cb));

  // check for request errors
  sendReq.on('error', (err) => {
    fs.unlink(dest);
    return cb(err.message);
  });

  file.on('error', (err) => { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    return cb(err.message);
  });

};

// Expose methods for unit testing
module.exports = {
  scrapMpdLink,
  getAvailableQuality
};