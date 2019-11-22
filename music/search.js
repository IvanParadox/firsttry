fs=require("fs");

function loadData() {

  let data_artists=[];
  let data_songs=[];

  try {
    artists_read = fs.readdirSync("./music/artists");
    songs_read = fs.readdirSync("./music/songs");
    console.log(artists_read, songs_read);
  } catch(err) {
    console.log('Вынь голову из жопы, у тебя ошибка!');
  }

  for (let value of artists_read) {
    let artists_values = JSON.parse(fs.readFileSync(`./music/artists/${value}`));
    data_artists.push(artists_values);
  }

  for (let value of songs_read) {
    let songs_values = JSON.parse(fs.readFileSync(`./music/songs/${value}`));
    data_songs.push(songs_values);
  }

  return {data_artists, data_songs};
}

const http = require('http');
const port = 3000;

const requestHandler = (request, response) => {
    let requestedFile = decodeURI(request.url);
    let mypage = fs.readFileSync(`./music/web/index.html`);
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    console.log(requestedFile);
    try {
      response.statuscode = 200;
      response.end(mypage);
    } catch (err) {
      response.statuscode = 404;
      response.end(`Запрашиваемого файла не существует`)
    }
}

//function saveData (artists, songs) {
  //fs.writeFile('music.txt', JSON.stringify({artists, songs}), (err) => {
    //if (err) throw err;
    //console.log('The file has been saved!');
  //});
//}

//let loadedData = loadData();
//saveData(loadedData.data_artists, loadedData.data_songs);

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }    console.log(`server is listening on ${port}`);
})
