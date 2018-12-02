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

// Elements
var audioPlayer = document.querySelector('[data-player]');
var audioSeek = document.querySelector('[data-player="seek"]');
var audioProgress = document.querySelector('[data-player="progress"]');

// Global State
var globalPlaylist = [];
var globalTrack = null;
var globalPlayer = null;

var initPlaylist = function(playlistUrl) {
  SC.resolve(playlistUrl).then(function(playlist) {
    SC.get('/playlists/' + playlist.id).then(function(playlist) {
      globalPlaylist = playlist.tracks;
      globalTrack = playlist.tracks[0];

      initTrack(globalTrack);
    });
  });
}

var initTrack = function(track, playNow) {
  SC.stream('/tracks/' + track.id).then(function(player) {
    globalPlayer = player;

    if (playNow) {
      globalPlayer.play().then(function() { console.log("Play"); });
    } else {
      console.log("Ready");
    }

    globalPlayer.on("time", function() {
      updateProgress(globalPlayer.currentTime());
    });
  });
}

var currentTrackPosition = function() {
  return globalPlaylist.indexOf(globalPlaylist.find( track => track.id === globalTrack.id ));
}

var skipTrack = function(direction) {
  globalPlayer.kill();
  var skipPosition = currentTrackPosition() + direction;

  if (0 <= skipPosition && skipPosition <= globalPlaylist.length) {
    globalTrack.id = globalPlaylist[skipPosition].id;
    initTrack(globalTrack, true);
  } else {
    console.log("First or Last track reached");
  }
}

var seekTrack = function(e) {
  var mousePosition = e.clientX;
  var progressOffset = audioSeek.getBoundingClientRect().left;
  var progressWidth = audioSeek.getBoundingClientRect().width;
  var factor = (mousePosition - progressOffset) / progressWidth;
  var time = globalTrack.duration * factor;

  globalPlayer.seek(time);
  audioProgress.style.width = (factor * 100) + "%";
}

var updateProgress = function(ms) {
  factor = globalPlayer.currentTime() / globalTrack.duration;
  audioProgress.style.width = (factor * 100) + "%";
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

      if (action === "seek" || action === "progress") {
        seekTrack(e);
      }
    }
    e.stopPropagation();
  }, false);
});
