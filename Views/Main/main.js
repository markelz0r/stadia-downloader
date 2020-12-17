const { ipcRenderer } = require('electron')

    var btn = document.getElementById('button');

    btn.onclick = () => {
        var text = document.getElementById('link').value;
        console.log("button pressed!!")
        ipcRenderer.send('buttonPressed', text);
        return true;
    };

    ipcRenderer.on("videoAvailable", onVideoAvailable)

   function onVideoAvailable(event,data){

   }