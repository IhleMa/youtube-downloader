const { app, BrowserWindow, dialog, shell } = require('electron');
const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const fs = require('fs');
const downloadsFolder = require('downloads-folder');
const { autoUpdater } = require('electron-updater');

const expressApp = express();

function createWindow () {
    const win = new BrowserWindow({
        width: 900,
        height: 500,
        icon: "icon.png",
        title: "Youtube Playlist Downloader",
        autoHideMenuBar: true,
        webPreferences: {
            enableRemoteModule: true
        }
    });

    //win.webContents.openDevTools();
  

    win.loadFile('index.html');
    autoUpdater.checkForUpdatesAndNotify();
}




autoUpdater.on('update-downloaded', () => {

    const options = {
        title: "Update",
        type: "info",
        noLink: true,
        buttons: ['Restart', 'Later'],
        defaultId: 0,
        cancelId: 1,
        message: "An Update is Available!",
        detail: "Restart to install the update."
      };
    
      dialog.showMessageBox(null, options).then((data) => {
          console.log(data);
        if(data.response == 0){
            autoUpdater.quitAndInstall();
        }
     });
});

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

        console.log(removeEmojis(videos[i].title) + " - " + videos[i].shortUrl);

        //res.header('Content-Disposition', 'attachment; filename="' + videos[i].title + '.mp3"');
        let video = ytdl(videos[i].shortUrl, {
            format: 'mp3'
            });

        video.pipe(fs.createWriteStream(dir + "/" + removeEmojis(videos[i].title) + ".mp3"));

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

function removeEmojis (string) {
    var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    return string.replace(regex, '').replace("|", "").replace("/", "-");
  }