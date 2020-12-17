const { ipcRenderer } = require('electron')

    var btn = document.getElementById('button');

    var q720 =  document.getElementById('720p');
    var q1080 =  document.getElementById('1080p');
    var q1440 =  document.getElementById('1440p');
    var q2160 =  document.getElementById('2160p');

    var downloadBtn = document.getElementById('downloadButton');

    btn.onclick = () => {
        var text = document.getElementById('link').value;
        console.log("button pressed!!")
        ipcRenderer.send('buttonPressed', text);
        return true;
    };

    downloadBtn.onclick = () => {
        var selected = document.querySelector('input[name="quality"]:checked').value
        ipcRenderer.send('downloadPressed', selected);
    }

    ipcRenderer.on("available-resolutions", onVideoAvailable)

   function onVideoAvailable(event,data){
        console.log(data);

        if (data.includes("720"))
            q720.style.visibility = "visible";
            
        if (data.includes("1080"))
            q1080.style.visibility = "visible";

        if (data.includes("1440"))
            q1440.style.visibility = "visible";

        if (data.includes("2160"))
            q2160.style.visibility = "visible";  
   }
