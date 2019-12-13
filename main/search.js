fs=require("fs");
let mimeTypes = {
  "html": "text/html",
  "png": "image/png",
  "jpg": "image/png",
  "css":"text/css",
  "js":"text/javascript",
  "rar": "application/x-rar-compressed",
  "zip": "application/zip"
}

/*(function loadData() {

  let data_artists=[];
  let data_songs=[];

  try {
    artists_read = fs.readdirSync("./main/artists");
    songs_read = fs.readdirSync("./main/songs");
    console.log(artists_read, songs_read);
  } catch(err) {
    console.log('Вынь голову из жопы, у тебя ошибка!');
  }

  for (let value of artists_read) {
    let artists_values = JSON.parse(fs.readFileSync(`./main/artists/${value}`));
    data_artists.push(artists_values);
  }

  for (let value of songs_read) {
    let songs_values = JSON.parse(fs.readFileSync(`./main/songs/${value}`));
    data_songs.push(songs_values);
  }

  return {data_artists, data_songs};
})*/

const http = require('http');
const port = 3000;

function requestBusinessHandler(request, response, requestedFile) {
  let businessResult = {result: null}
  response.setHeader('Content-Type', 'application/json');
  response.statusCode = 200;
  response.end(JSON.stringify(businessResult));
}

function getAuthorizationData (url) {
  result = {};
  let [address, query] = url.split('?');
  if (query) for (keyvalue of query.split('&')){
    let [key, value] = keyvalue.split('=');
    result[key] = value;
  }
  return result;
}

function logIn (request, response, requestedFile) {
  let authData = getAuthorizationData(requestedFile);
  let resultValue = {authed: false};
  fs.readFile(`./data/profiles/${authData.username}.json`, 'utf-8', function(err, forParse){
    response.setHeader('Content-Type', 'application/json');
    console.log(err);
    if (err) {
      response.statusCode = 403;
    } else {
      let data = JSON.parse(forParse);
      console.log(data.account.password);
      console.log(authData.password);
      if (data.account.password === authData.password) {
        response.statusCode = 200;
        resultValue.authed = true;
      } else {
        response.statusCode = 403;
      }
    }
    response.end (JSON.stringify(resultValue));
  });
}

function router (request, response, requestedFile) {
  let dataURL = [
    {url: /^\/api$/, function: requestBusinessHandler},
    {url: /^\/api\/auth/, function: logIn}
  ]
  for (value of dataURL) {
    console.log(`${value.url} vs ${requestedFile} + ${value.url.test(requestedFile)}`);
    if (value.url.test(requestedFile)) {
      value.function(request, response, requestedFile);
      return true;
    }
  }
  return false
}

const requestHandler = (request, response) => {
    let requestedFile = decodeURI(request.url);
    console.log(requestedFile);
    if (requestedFile.slice(-1) === '/') {
      requestedFile += 'index.html';
    }

    let fileExtension = requestedFile.split(".");
    let fileType = fileExtension[fileExtension.length-1];
    let contentType = 'application/octet-stream';
    if (typeof mimeTypes[fileType] !== "undefined") {
      contentType = mimeTypes[fileType];
    }
    console.log(fileType);
    console.log(contentType);
    console.log(requestedFile);

    //if (requestBusinessHandler(request, response)) return;
    //if (logIn(request, response)) return;
    if (router(request, response, requestedFile)) return;

    try {
      let fileSize = fs.statSync(`./main/web${requestedFile}`)[`size`];
      response.setHeader('Content-Type', `${contentType}; utf-8`);
      response.setHeader('Content-Length', `${fileSize}; utf-8`);
      let readStream = fs.ReadStream(`./main/web${requestedFile}`);
      response.statusCode = 200;
      readStream.pipe(response);
      readStream.on('error', (e) => {
        response.setHeader('Content-Type', 'text/html; charset=utf-8;');
        response.statusCode = 500;
        response.end(`Server Error`);
        console.error(e);
      });
      response.on('close', () => {
        readStream.destroy();
      });
    } catch (e) {
      console.log(e);
      response.statusCode = 404;
      response.setHeader('Content-Type', `text/html; charset=utf-8`);
      response.end(`Запрашиваемого файла не существует`);
    }
}

/*(function saveData (artists, songs) {
  fs.writeFile('main.txt', JSON.stringify({artists, songs}), (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
})*/

//let loadedData = loadData();
//saveData(loadedData.data_artists, loadedData.data_songs);

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }    console.log(`server is listening on ${port}`);
})