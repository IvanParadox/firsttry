let data_artists=[];
let data_songs=[];

data_artists[0]=require('./artists/1.json');
data_artists[1]=require('./artists/2.json');
data_artists[2]=require('./artists/3.json');

data_songs[0]=require('./songs/1.json');
data_songs[1]=require('./songs/2.json');
data_songs[2]=require('./songs/3.json');

console.log(data_artists[1], data_songs[1]);
