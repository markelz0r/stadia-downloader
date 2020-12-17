const { ipcRenderer } = require('electron')

console.log("I am here1;")

    var btn = document.getElementById('button');

    btn.onclick = () => {
        var text = document.getElementById('link').value;
        console.log("button pressed!!")
        ipcRenderer.send('buttonPressed', text);
        return true;
    };

   