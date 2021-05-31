const { app, BrowserWindow, dialog, shell } = require('electron');
const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const fs = require('fs');
const downloadsFolder = require('downloads-folder');

const expressApp = express();

function createWindow () {
    const win = new BrowserWindow({
        width: 900,
        height: 500,
        icon: "icon.png",
        title: "Youtube Playlist Downloader by the one and only Marvin Mc Big Cock",
        autoHideMenuBar: true,
        webPreferences: {
            enableRemoteModule: true
        }
    });

    //win.webContents.openDevTools();
  
    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    
});



expressApp.use(cors());
expressApp.listen(4000, () => {
    console.log('Server started at port 4000');
});

expressApp.get('/download', async (req,res) => {

    const playlist = await ytpl(req.query.URL);
    let videos = []
    
    for(var i in playlist.items) {
        videos.push(playlist.items[i]);
    }

    var dir = downloadsFolder() + "/" + playlist.title + " Youtube Playlist";

    const options = {
        title: "Download",
        type: "info",
        buttons: ['Ok'],
        defaultId: 0,
        message: "Download started!"
      };
    
      dialog.showMessageBox(null, options, (response, checkboxChecked) => {

      });

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, {recursive: true});
    }

    let videoAmount = videos.length;

    for(var i in videos) {

        console.log(videos[i].title + " - " + videos[i].shortUrl);

        //res.header('Content-Disposition', 'attachment; filename="' + videos[i].title + '.mp3"');
        let video = ytdl(videos[i].shortUrl, {
            format: 'mp3'
            });

        video.pipe(fs.createWriteStream(dir + "/" + videos[i].title + ".mp3"));

        video.on('end', () => {
            console.log('Done!');
            videoAmount --;
            if(videoAmount <= 0){
                const options = {
                    title: "Download",
                    type: "info",
                    noLink: true,
                    buttons: ['Open Folder', 'Close'],
                    defaultId: 0,
                    cancelId: 1,
                    message: "Download complete!"
                  };
                
                  dialog.showMessageBox(null, options).then((data) => {
                      console.log(data);
                    if(data.response == 0){
                        console.log("Open Folder!");
                        shell.openPath(dir);
                    }
                 });
            }
        });
    }

});