// Add functionalities to DOM

document.addEventListener("DOMContentLoaded", function(event) {
    // Add button click
    const btn = document.getElementById("submit-button")
    btn.addEventListener("click", () => sendTags())
});


// MAIN CODE TO GET DATA

let songMap = {}

let globTags = "";
let globSongs = [];

function getSongsFromPlaylistID(id, sum) {
    return axios.get('/getSongsFromPlaylist/' + id)
        .then(res => {
            let songs = res.data;
            for(let i = 0; i < songs.length; i ++) {
                // console.log(songs[i].track.name)
                if(songs[i]?.track?.id != null) {
                    let songID = songs[i].track.id;
                    if (songMap[songID] == null) {
                        songMap[songID] = sum;
                    } else {
                        songMap[songID] += sum;
                    }
                }
            }
        }).catch(e => {
            console.log(e);
        });
}

function getPlaylistsWithTag(tag, sum) {
    return axios.get('/getPlaylists/' + tag)
        .then(res => {
            let playlists = res.data;
            for(let i = 0; i < playlists.length; i ++) {
                let playlist = playlists[i]
                getSongsFromPlaylistID(playlist.id, sum);
            }
        }).catch(e => {
            console.log(e);
        });
}

function sendTags() {
    songMap = {}
    const input = document.getElementById("input-tags")
    let tags = input.value.split(', ')
    console.log(tags)
    globTags = tags;

    // Just one tag
    for(let i = 0; i < tags.length; i ++)
        getPlaylistsWithTag(tags[i], 1)

    // Pair two tags
    setTimeout(() => {
        for(let i = 0; i < tags.length; i ++)
            for(let j = i + 1; j < tags.length; j ++)
                getPlaylistsWithTag(tags[i] + ' ' + tags[j], 3)}, 1000);

    // Pair three tags
    setTimeout(() => {
        for(let i = 0; i < tags.length; i ++)
            for(let j = i + 1; j < tags.length; j ++)
                for(let k = j + 1; k < tags.length; k ++)
                getPlaylistsWithTag(tags[i] + ' ' + tags[j] + ' ' + tags[k], 7)}, 2000);

    setTimeout(generatePlaylist, 5000)
}

function addSongsToPlaylist(ids) {
    erasePlaylist();
    globSongs = [];
    return axios.get('/getSongs/' + ids)
        .then(res => {
            let songs = res.data.tracks;
            // console.log(songs)
            for(let i = 0; i < songs.length; i ++) {
                let song = songs[i];
                displaySong(song)
                globSongs.push('spotify:track:' + song.id)
                // console.log(song.name + " by " + song.artists[0].name)
            }
        }).catch(e => {
            console.log(e);
        });
}

function createPlaylist() {
    // console.log(globSongs)
    return axios.post('/createPlaylist/', {tags: globTags, songs: globSongs})
        .then(res => {
            console.log(res)
        }).catch(e => {
            console.log(e);
        });
}

function generatePlaylist() {
    console.log("gen play")
    let sortable = []
    for (let songID in songMap) {
        sortable.push([songID, songMap[songID]]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });

    // Top 50 songs
    let ids = "";
    for(let i = 0; i < Math.min(50, sortable.length); i ++) {
        if(ids != '') {
            ids += ',';
        }
        ids += sortable[i][0];
    }
    addSongsToPlaylist(ids).then(() => {
        createPlaylist();
    })
}


// UI CODE

function erasePlaylist() {
    // First erase songs added before
    let playlist = document.getElementById('playlist');
    while (playlist.firstChild) {
        playlist.removeChild(playlist.firstChild);
    }
}

function displaySong(song) {
    let playlist = document.getElementById("playlist");

    // Create html elements
    let outerdiv = document.createElement("div");
    let songdiv = document.createElement("div");
    let img = document.createElement("img");
    let audio = document.createElement("audio");

    //add song class to div
    outerdiv.className = "song";

    let name = song.name;
    let artist = song.artists[0].name;
    let album = song.album.name;
    let text = 'Song: ' + name + '\nArtist: ' + artist + '\nAlbum: ' + album + '\n';
    let textNode = document.createTextNode(text);
    let audiosrc = song.preview_url;

    audio.setAttribute("type", "audio/mpeg");
    outerdiv.setAttribute('data-aos', 'fade-down');
    audio.controls = true;
    if(audiosrc != null) {
        audio.setAttribute("src", audiosrc)
        songdiv.appendChild(audio);
    }

    let albumcoversrc = song.album.images[0].url;
    img.setAttribute("src", albumcoversrc);

    songdiv.appendChild(img);
    songdiv.appendChild(textNode);
    outerdiv.appendChild(songdiv);

    playlist.appendChild(outerdiv);
}
