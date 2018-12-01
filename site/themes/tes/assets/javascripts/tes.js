// Docs
// -----------------------------------------------------------------------------

// SC Methods:      https://developers.soundcloud.com/docs/api/sdks#documentation
// Endpoints:       https://developers.soundcloud.com/docs/api/reference
// Player Methods:  https://developers.soundcloud.com/docs/api/sdks#player

// Utility Functions
// -----------------------------------------------------------------------------

function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

// Soundcloud Functions
// -----------------------------------------------------------------------------

SC.initialize({
  client_id: 'f11f2d447ec7f20fa47ac2ea94db415e'
});
var trackUrl    = 'https://soundcloud.com/thiseveningsshow/vampire-squid?in=thiseveningsshow/sets/shakespeares-tomb-87';
var playlistUrl = 'https://soundcloud.com/thiseveningsshow/sets/moon-base-98';

var audioPlayer  = document.querySelector('[data-player]')
var globalPlayer = null;
var globalPlaylist = [];
var globalTrackId = null;

var initPlaylist = function(playlistUrl) {
  SC.resolve(playlistUrl).then(function(playlist) {
    SC.get('/playlists/' + playlist.id).then(function(playlist) {
      globalPlaylist = playlist.tracks;
      globalTrackId = playlist.tracks[0].id;

      initTrack(globalTrackId);
    });
  });
}

var initTrack = function(trackId, playNow = false) {
  SC.stream('/tracks/' + trackId).then(function(player) {
    globalPlayer = player;

    if (playNow) {
      globalPlayer.play().then(function() { console.log("Play"); });
    } else {
      console.log("Ready");
    }
  });
}

var skipTrack = function(direction) {
  globalPlayer.kill();
  var currentPosition = globalPlaylist.indexOf(globalPlaylist.find( track => track.id === globalTrackId ));
  var skipPosition = currentPosition + direction;

  if (0 <= skipPosition && skipPosition <= globalPlaylist.length) {
    globalTrackId = globalPlaylist[skipPosition].id;
    initTrack(globalTrackId, true);
  } else {
    console.log("First or Last track reached");
  }
}

// Events
// -----------------------------------------------------------------------------

ready(function() {
  initPlaylist(playlistUrl);

  // Listeners
  // Need to set loading state. If you click before loading is done, etc.
  audioPlayer.addEventListener('click', function(e) {
    if (e.target !== e.currentTarget) { // Ensure it's a click on a child
      action = e.target.getAttribute('data-player');

      if (action === "play") {
        globalPlayer.play().then(function() { console.log("Play"); });
      }

      if (action === "pause") {
        globalPlayer.pause().then(function() { console.log("Pause"); });
      }

      if (action === "next") {
        console.log("Next");
        skipTrack(1);
      }

      if (action === "prev") {
        console.log("Prev");
        skipTrack(-1);
      }
    }
    e.stopPropagation();
  }, false);
});
