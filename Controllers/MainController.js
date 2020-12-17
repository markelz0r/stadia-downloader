const { ipcMain } = require('electron');
const { Path } = require('path');
const rp = require('request-promise');
const request = require('request');
const $ = require('cheerio');
const os = require('os'); 
const fs = require('fs');
var parser = require('fast-xml-parser');
var Promise = require("bluebird");

var ffmpeg = require('fluent-ffmpeg');
var command = ffmpeg();


ipcMain.on('buttonPressed', (event,data) => {
    console.log('Text was: ', data)
    rp(data)
    .then(function(html){
      var link = $('meta[property="og:image"]', html).attr('content').split("=")[0];
      var mpdLink = link+"=mm,dash";
      
      return mpdLink;
    })
    .then(function(mpdLink){
      console.log("MPDLink")

      return rp(mpdLink)
      .then(function(html){
          //onsole.log(html)
          var defaultOptions = {
            ignoreAttributes : false
          }

          var jsonObj = parser.parse(html, defaultOptions);
          var adaptationSets = jsonObj["MPD"]["Period"];

          ///
          var audioLink = null
          var videos = null

          var set0 = adaptationSets.AdaptationSet[0]
          var set1 = adaptationSets.AdaptationSet[1]

          if (set0['@_mimeType'] == 'audio/mp4'){
            audioLink = set0.Representation.BaseURL
            videos = set1.Representation
          } else
          {
            audioLink = set1.Representation.BaseURL
            videos = set0.Representation
          }
          
          ///

          ///
          var selectedQuality = 266; 
          ///console.log(adaptationSets)
          var videoLink = null;

          videos.forEach(representation => {
              if (representation["@_id"] == selectedQuality)
              videoLink=representation.BaseURL
          });
        
          console.log("Video link: "+videoLink);
          console.log("Audio link: "+audioLink);

          var links ={
            video : videoLink,
            audio : audioLink
          }

          return links;
      })
    })
    .then(function(links){
      //console.log("LIIINKS "+links.video);
      var tempDir = os.tmpdir();
      console.log(tempDir);
      
      var videoLocation = tempDir+"/video.mp4";
      var audioLocation = tempDir+"/audio.mp3"

      /// download video
      var videoLoaded = new Promise(function(resolve, reject) {
        download(links.video, videoLocation, resolve)
      });

      //download audio
      var audioLoaded = new Promise(function(resolve, reject) {
        download(links.audio, audioLocation, resolve);
      });

      
      return videoLoaded
      .then(function(err){
        console.log("We should have video")
        return new Promise(function(resolve, reject) {
          download(links.audio, audioLocation, resolve);
        });
      })
      .then(function(){
        console.log("We should have audio")
        var paths = {
          video: videoLocation,
          audio: audioLocation
        }
        
        return paths;
      })
    })
    .then(function(paths){
      console.log(paths.video);
      console.log(paths.audio);

      var tempDir = os.tmpdir();
      var path = tempDir+'/outputfile.mp4';

      ffmpeg()
        .addInput(paths.video)
        .addInput(paths.audio)
        .videoCodec('copy')
        .on('error', function(err) {
          console.log('An error occurred: ' + err.message);
        })
        .on('end', function() {
          console.log('Processing finished !');
        })
        .save(path);
          
    })
    .catch(function(err){
      console.log(err)
    });

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

});