const fs = require('fs');
const request = require('request');

const download = (url, fileName, cb) => {
  const stream = fs.createWriteStream(fileName);
  request(url).pipe(stream).on('close',cb);
}

module.exports = download;
