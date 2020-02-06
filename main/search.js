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
  let paramsString = url;
  let searchParams = new URLSearchParams(paramsString);
  let data = JSON.stringify({
    username: searchParams.get("username"),
    password: searchParams.get("password")
  });
  return data;
}
  /*result = {};
  let [address, query] = url.split('?');
  if (query) for (keyvalue of query.split('&')){
    let [key, value] = keyvalue.split('=');
    result[key] = value;
  }
  return result;
}*/

function logIn (request, response, requestedFile, authData) {
  //let authData = getAuthorizationData(requestedFile);
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

function router (request, response, requestedFile, authData) {
  let dataURL = [
    {url: /^\/api$/, function: requestBusinessHandler},
    {url: /^\/api\/auth/, function: logIn}
  ]
  for (value of dataURL) {
    console.log(`${value.url} vs ${requestedFile} + ${value.url.test(requestedFile)}`);
    if (value.url.test(requestedFile)) {
      value.function(request, response, requestedFile, authData);
      return true;
    }
  }
  return false
}

function getCookie (request, response, authData) {
  console.log('Cookies from client:', request.headers.cookie);
  if (request.headers.cookie == undefined) {
    let token = makeToken();
    const dateCREATE = new Date(Date.now()).toUTCString()
    const dateDELETE = new Date(Date.now() + 172800e3).toUTCString();
    console.log('Cookies will be save until:', dateDELETE);
    response.setHeader('Set-Cookie', `token = ${token}; expires=${dateDELETE}`);
    console.log(response.getHeader('Set-Cookie'));

    let sessionData = {};
    sessionData.username = authData.username;
    sessionData.create = dateCREATE;
    sessionData.expires = dateDELETE;

    fs.writeFile(`./data/session/${token}.json`, JSON.stringify(sessionData), (err) => {
      if(err) throw err;
      console.log('Token', token, 'created');
      });
  } else {
    let searchParams = new URLSearchParams(request.headers.cookie);
    let token = searchParams.get("token");
    let context = {};
    checkToken (token);
    console.log(context);
  }
}



function makeToken () {
  let token = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i <16; i++)
    token += possible.charAt((Math.random() * possible.length));

  return token;
}

function checkToken (token) {
  console.log(token);
  fs.readFile(`./data/session/${token}.json`, function (err, forParse) {
    if (err) {
      console.log("This token doesn't exist");
    } else {
      let data = JSON.parse(forParse);
      let date = new Date(Date.now()).toUTCString();
      console.log(data.expires);
      console.log(date);
      if (data.expires > date) {
        data.expires = new Date(Date.now() + 172800e3).toUTCString();
        fs.writeFileSync(`./data/session/${token}.json`, JSON.stringify(data), (err) => {
          if(err) throw err;
          console.log('Token data', token, 'changed: new time set');
          });
        let context = data.username;
        return context;
      } else {
        fs.unlink(`./data/session/${token}.json`, (err) => {
          if (err) throw err;
          console.log('Token was deleted');
          return false;
        });
      }
    }
  });
}

/*const requestHandler = (request, response) => {
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
  }*/

/*(function saveData (artists, songs) {
  fs.writeFile('main.txt', JSON.stringify({artists, songs}), (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
})*/

//let loadedData = loadData();
//saveData(loadedData.data_artists, loadedData.data_songs);

const server = http.createServer();
server.on('request', function(request, response) {
  let requestedFile = decodeURI(request.url);
  let data = '';
  let authError = {authed: null};

  request.on('data', function(chunk) {
      data += chunk.toString();
  });

  request.on('end', function() {
    response.setHeader('Content-Type', 'application/json');
      let authData = JSON.parse(getAuthorizationData(data));
      console.log(authData);
      if (authData !== '') {
        getCookie (request, response, authData);
        return router(request, response, requestedFile, authData);
      } else {
        response.statusCode = 404;
        response.end(JSON.stringify(authError));
      }
  });
});

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }    console.log(`server is listening on ${port}`);
})
