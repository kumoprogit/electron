const packager = require('electron-packager');
const config = require('./package.json');
const HttpsProxyAgent = require('https-proxy-agent');

const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
if (httpsProxy) {
  const download = {
    downloadOptions: {
      agent: new HttpsProxyAgent(httpsProxy)
    }
  };
}

packager({
  download: download,
}, function done (err, appPath) {
  if (err) {
    throw new Error(err);
  }
  console.log("Done: " + appPath);
});
