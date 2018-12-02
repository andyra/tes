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

// For development
var playlistUrl = 'https://soundcloud.com/thiseveningsshow/sets/moon-base-98';

// Elements
var player = document.querySelector('[data-player]');
var playerSeek = document.querySelector('[data-player="seek"]');
var playerProgress = document.querySelector('[data-player="progress"]');
var playerTitle = document.querySelector('[data-player="title"]');
var playerCurrentTime = document.querySelector('[data-player="current-time"]');
var playerTotalTime = document.querySelector('[data-player="total-time"]');
var playerSpinner = document.querySelector('[data-player="spinner"]');

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

var setPlayerState = function(state) {
  if (state === "ready") {
    player.classList.remove('player--disabled');
    playerTitle.setAttribute('aria-hidden', false);
    playerTotalTime.setAttribute('aria-hidden', false);
    playerSpinner.setAttribute('hidden', false);
  } else {
    player.classList.add('player--disabled');
    playerTitle.setAttribute('aria-hidden', true);
    playerTotalTime.setAttribute('aria-hidden', true);
    playerSpinner.setAttribute('hidden', true);
  }
}

var initTrack = function(track, playNow) {
  SC.stream('/tracks/' + track.id).then(function(player) {
    globalPlayer = player;
    playerTitle.textContent = track.title;
    playerTotalTime.textContent = formatTime(track.duration);

    setPlayerState("ready");

    // Play or pause
    if (playNow) {
      globalPlayer.play().then(function() { console.log("Play"); });
    } else {
      console.log("Ready");
    }

    // Update time on play
    globalPlayer.on("time", function() {
      updateProgress(globalPlayer.currentTime());
    });
  });
}

var currentTrackPosition = function() {
  return globalPlaylist.indexOf(globalPlaylist.find( track => track.id === globalTrack.id ));
}

var skipTrack = function(direction) {
  console.log("Skip " + direction);
  globalPlayer.kill();
  var skipPosition = currentTrackPosition() + direction;

  if (0 <= skipPosition && skipPosition <= globalPlaylist.length) {
    globalTrack.id = globalPlaylist[skipPosition].id;
    initTrack(globalTrack, true);
  } else {
    console.log("First or Last track reached");
  }
}

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

function formatTime(duration) {
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
  // Need to set loading state. If you click before loading is done, etc.
  player.addEventListener('click', function(e) {
    if (e.target !== e.currentTarget) { // Ensure it's a click on a child
      action = e.target.getAttribute('data-player');

      switch (action) {
        case "play":
          globalPlayer.play().then(function() { console.log("Play"); });;
          break;
        case "pause":
          globalPlayer.pause().then(function() { console.log("Pause"); });;
          break;
        case "next":
          skipTrack(1);
          break;
        case "prev":
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
