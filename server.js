const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
app.use(cors());
console.log("top11")
const SpotifyWebApi = require('spotify-web-api-node');

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Authenticate App

let clientId = 'ddb39440cc3043ba97df2dd4fb0fb542',
    clientSecret = '897084865b974e07a2e5240005c94787',
    redirectUri = 'http://localhost:3000/callback';

let scopes = ['user-read-private', 'user-read-email', 'playlist-modify'];
let state = 'some-state-of-my-choice';

// Create the api object with the credentials
let spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri,
});

app.get('/login', function(req, res) {
    res.send(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    spotifyApi
        .authorizationCodeGrant(code)
        .then(data => {
            const access_token = data.body['access_token'];
            const refresh_token = data.body['refresh_token'];
            const expires_in = data.body['expires_in'];

            spotifyApi.setAccessToken(access_token);
            spotifyApi.setRefreshToken(refresh_token);

            console.log('access_token:', access_token);
            console.log('refresh_token:', refresh_token);

            console.log(
                `Sucessfully retreived access token. Expires in ${expires_in} s.`
            );
            res.send('Success! You can now close the window.');

            setInterval(async () => {
                const data = await spotifyApi.refreshAccessToken();
                const access_token = data.body['access_token'];

                console.log('The access token has been refreshed!');
                console.log('access_token:', access_token);
                spotifyApi.setAccessToken(access_token);
            }, expires_in / 2 * 1000);
        })
        .catch(error => {
            console.error('Error getting Tokens:', error);
            res.send(`Error getting Tokens: ${error}`);
        });
});

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

app.post('/createPlaylist', (req, res) => {
    // req.body
    let tags = '[';
    for(let i = 0; i < req.body.tags.length; i ++) {
        if(i > 0)
            tags += ', ';
        tags += req.body.tags[i];
    }
    tags += ']';
    spotifyApi.createPlaylist(tags, { 'description': 'Playlist creada con S-tags con tags: ' + tags, 'public': true })
        .then(function(data) {
            console.log('Created playlist!');
            let playlistID = data.body.id;
            // Add songs
            spotifyApi.addTracksToPlaylist(playlistID, req.body.songs)
                .then(function(data) {
                    console.log('Added tracks to playlist!');
                    res.send("ok")
                }, function(err) {
                    console.log('Something went wrong!', err);
                });

        }, function(err) {
            console.log('Something went wrong!', err);
        });
})

app.listen(3000);