const appVersion = require("electron").remote.app.getVersion();

window.addEventListener('DOMContentLoaded', () => {

    const element = document.getElementById(version)
    element.innerText = appVersion;
    console.log(appVersion);
  })