const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const SpotifyWebApi = require('spotify-web-api-node');

// Authenticate App

let clientId = 'ddb39440cc3043ba97df2dd4fb0fb542',
    clientSecret = '897084865b974e07a2e5240005c94787';

// Create the api object with the credentials
let spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret
});


function getAccessToken() {
    // Retrieve an access token.
      spotifyApi.clientCredentialsGrant().then(
          function(data) {
            console.log('The access token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);

            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
          },
          function(err) {
            console.log('Something went wrong when retrieving an access token', err);
          }
      );
}

getAccessToken();


app.get('/getPlaylists/:tag', (req, res) => {
    let tag = req.params.tag
    spotifyApi.searchPlaylists(tag, {limit: 20}) // Sube limite
        .then(function(data) {
            res.send(data.body.playlists.items)
        }, function(err) {
            res.send(err)
        });
})

app.get('/getSongsFromPlaylist/:id', (req, res) => {
    let id = req.params.id
    spotifyApi.getPlaylistTracks(id, {limit: 100}) // Sube limite
        .then(
            function(data) {
                res.send(data.body.items);
            },
            function(err) {
                console.log('Something went wrong!', err);
                res.send(err);
            }
        );
})

app.get('/getSongs/:ids', (req, res) => {
    let songs = req.params.ids.split(',')
    spotifyApi.getTracks(songs)
        .then(
            function(data) {
                res.send(data.body);
            },
            function(err) {
                //console.log('Something went wrong!', err);
                res.send(err);
            }
        );
})

app.listen(3000);