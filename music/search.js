var artists = ['./artists/1.json', './artists/2.json', './artists/3.json'];
var songs = ['./songs/1.json', './songs/2.json', './songs/3.json']

let artist = require(artists);
let song = require(songs);

console.log(artist[0], song[0]);
