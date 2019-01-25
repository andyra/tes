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

// Elements
var player = document.querySelector('[data-player]');
var playerSeek = document.querySelector('[data-player="seek"]');
var playerProgress = document.querySelector('[data-player="progress"]');
var playerTitle = document.querySelector('[data-player="title"]');
var playerCurrentTime = document.querySelector('[data-player="current-time"]');
var playerTotalTime = document.querySelector('[data-player="total-time"]');
var playerSpinner = document.querySelector('[data-player="spinner"]');

// Global State
var playlistUrl = player.getAttribute('data-player-url');
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

var setPlayerState = function(state) {
  if (state === "paused") {
    player
      .setAttribute('data-player-state', 'paused')
      .setAttribute('aria-disabled', false);
  } else {
    player
      .setAttribute('data-player-state', 'disabled')
      .setAttribute('aria-disabled', true);
  }
}

var setTracklistState = function(el, state) {
  if (state === "paused") {
    el.setAttribute('data-track-state', 'paused');
  } else if (state === "playing") {
    el.setAttribute('data-track-state', 'disabled');
  } else {
    el.setAttribute('data-track-state', 'init');
  }
}

var initTrack = function(track, playNow) {
  SC.stream('/tracks/' + track.id).then(function(player) {
    globalPlayer = player;
    playerTitle.textContent = track.title;
    playerTotalTime.textContent = formatTime(track.duration);

    if (playNow) {
      globalPlayer.play().then(function() {
        console.log('Playing');
        setPlayerState("playing");
        setTracklistState("playing");
      });
    } else {
      console.log('Ready');
      setPlayerState("paused");
    }

    globalPlayer.on('time', function() {
      updateProgress(globalPlayer.currentTime());
    });

    // globalPlayer.on('play', function() {
    //   console.log("On Play");
    // });

    // globalPlayer.on('pause', function() {
    //   console.log("On Pause");
    // });
  });
}

var currentTrackPosition = function() {
  return globalPlaylist.indexOf(globalPlaylist.find( track => track.id === globalTrack.id ));
}

var skipTrack = function(direction) {
  console.log("Skip " + direction);
  var playNow = (globalPlayer.isPlaying()) ? true : false;
  var skipPosition = currentTrackPosition() + direction;
  globalPlayer.kill();

  // Ensure you aren't at the beginning/end of a playlist
  if (0 <= skipPosition && skipPosition <= globalPlaylist.length) {
    globalTrack = globalPlaylist[skipPosition];
    initTrack(globalTrack, playNow);
  } else {
    console.log("First or Last track reached");
  }
}

// TODO:
// Skip tracks needs to diable the prev when at the first in the tracklist, etc.

var updatePlaylist = function(track) {
  // On init, the playlist is normal.
  // When a track is initialized/played, put a Pause icon next to the title.
}

var seekTrack = function(e) {
  var mousePosition = e.clientX;
  var progressOffset = playerSeek.getBoundingClientRect().left;
  var progressWidth = playerSeek.getBoundingClientRect().width;
  var factor = (mousePosition - progressOffset) / progressWidth;
  var time = globalTrack.duration * factor;

  globalPlayer.seek(time);
  updateProgress(time, factor);
}

var updateProgress = function(duration, factor) {
  var factor = (factor) ? factor : globalPlayer.currentTime() / globalTrack.duration;
  var percent = (factor * 100) + "%";

  playerProgress.style.width = percent;
  playerCurrentTime.textContent = formatTime(duration);
}

var formatTime = function(duration) {
  var seconds = parseInt((duration / 1000) % 60);
  var minutes = parseInt((duration / (1000 * 60)) % 60);
  var hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  minutes = (hours > 1 && minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  time = (hours > 0) ? hours + ":" : "";
  time += minutes + ":" + seconds;

  return time;
}

// Events
// -----------------------------------------------------------------------------

ready(function() {
  initPlaylist(playlistUrl);

  // Listeners
  player.addEventListener('click', function(e) {
    console.log("Player clicked");
    if (e.target !== e.currentTarget) { // Ensure it's a click on a child
      action = e.target.getAttribute('data-player');

      switch (action) {
        case "control":
          console.log("Control clicked");
          if (player.getAttribute('data-player-state') == "paused") {
            globalPlayer.play().then(function() { console.log("Play"); });
            player.setAttribute('data-player-state', 'playing');
          }
          if (player.getAttribute('data-player-state') == "playing") {
            globalPlayer.pause().then(function() { console.log("Pause"); });
            player.setAttribute('data-player-state', 'paused');
          }
          break;
        case "next":
          console.log("Next clicked");
          skipTrack(1);
          break;
        case "prev":
          console.log("Prev clicked");
          skipTrack(-1);
          break;
        case "seek" || "progress":
          seekTrack(e);
          break;
      }
    }
    e.stopPropagation();
  }, false);
});
