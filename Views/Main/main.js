const { ipcRenderer } = require('electron')
const r = require('electron').remote
const { dialog } = r
const app = r.app

var fs = require('fs');
var path = require('path');

var btn = document.getElementById('button');
var q720 = document.getElementById('720p');
var q1080 = document.getElementById('1080p');
var q1440 = document.getElementById('1440p');
var q2160 = document.getElementById('2160p');
var downloadBtn = document.getElementById('downloadButton');
var spinner = document.getElementById('spinner');

// Set APP version
var appVersion = document.getElementById('app-version');
appVersion.innerHTML = app.getVersion();

//Create subscriptions
btn.onclick = () => {
    var text = document.getElementById('link').value;
    console.log("button pressed!!")
    ipcRenderer.send('buttonPressed', text);
    return true;
};

downloadBtn.onclick = () => {
    var selected = document.querySelector('input[name="quality"]:checked').value
    ipcRenderer.send('downloadPressed', selected);
    spinner.style.visibility = "visible";
}

ipcRenderer.on("available-resolutions", onVideoAvailable)

ipcRenderer.on("clip-created", onClipCreated)

// Debug functionality
document.addEventListener("keydown", function (e) {
    if (e.key === "F7") {
        r.getCurrentWindow().toggleDevTools();
    } else if (e.key === "F5") {
        location.reload();
    }
});

async function onClipCreated(event, data) {
    var toLocalPath = path.resolve(app.getPath("downloads"), path.basename(data))

    var userSelection = await dialog.showSaveDialog({ defaultPath: toLocalPath })
    console.log(userSelection.filePath);
    move(data, userSelection.filePath, onSaveError)
}

function onVideoAvailable(event, data) {
    if (data.includes("720"))
        q720.style.visibility = "visible";

    if (data.includes("1080"))
        q1080.style.visibility = "visible";

    if (data.includes("1440"))
        q1440.style.visibility = "visible";

    if (data.includes("2160"))
        q2160.style.visibility = "visible";
}

function onSaveError(err) {
    spinner.style.visibility = "hidden";
    console.log(err)
}

function move(oldPath, newPath, callback) {

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });

    function copy() {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}
