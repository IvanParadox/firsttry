fs=require("fs");
let data_artists=[];
let data_songs=[];

function loadData() {
  try {
    artists_read = fs.readdirSync("./music/artists");
    songs_read = fs.readdirSync("./music/songs");
    console.log(artists_read, songs_read);
  } catch(err) {
    console.log('Вынь голову из жопы, у тебя ошибка!');
  }
  return

  for (let value of artists_read) {
    let artists_values = JSON.parse(fs.readFileSync(`./music/artists/${value}`));
    data_artists.push(artists_values);
  }

  for (let value of songs_read) {
    let songs_values = JSON.parse(fs.readFileSync(`./music/songs/${value}`));
    data_songs.push(songs_values);
  }

  let data=[data_artists, data_songs];
  return data;
}

function saveData (data) {
  fs.writeFile('music.txt', JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
}

let loadedData = loadData();
saveData(loadedData);
