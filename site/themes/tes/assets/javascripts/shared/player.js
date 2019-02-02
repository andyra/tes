
// Utilities
// -----------------------------------------------------------------------------

function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

// Elements
// -----------------------------------------------------------------------------

// var elms = ['tracks', 'title', 'timer', 'duration', 'play', 'pause', 'prev', 'next', 'progress', 'loading', 'playlist', 'list', 'slow'];
// elms.forEach(function(elm) {
//   window[elm] = document.getElementById(elm);
// });

var elements = ['stereo', 'title', 'timer', 'duration', 'play', 'pause', 'speed', 'next', 'prev', 'progress', 'loader', 'tracks']
elements.forEach(function(el) {
  window[el] = document.querySelector(`[data-player="${el}"]`);
});

// Tracklist is the DOM element with a bunch of tracks that are converted to a virtual Playlist.
// The Radio version does not have a tracklist, but will still need to create a virtual Playlist.


// Functions
// -----------------------------------------------------------------------------


// Player class containing the state of our playlist and where we are in it.
// Includes all methods for playing, skipping, updating the display, etc.
// @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
var Player = function(playlist) {
  this.playlist = playlist;
  this.index = 0;

  // Display the title of the first track.
  title.innerHTML = playlist[0].title;
};

Player.prototype = {
  // Play a song in the playlist.
  // @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
  play: function(index, url) {
    var self = this;
    var sound;

    index = typeof index === 'number' ? index : self.index;
    var data = self.playlist[index];

    // If we already loaded this track, use the current one.
    // Otherwise, setup and load a new Howl.
    if (data.howl) {
      sound = data.howl;
    } else {
      sound = data.howl = new Howl({
        src: [data.file],
        html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
        onplay: function() {
          // Display the duration.
          duration.innerHTML = self.formatTime(Math.round(sound.duration()));

          // Start upating the progress of the track.
          requestAnimationFrame(self.step.bind(self));

          // Show the pause button
          pause.style.display = 'block';
        },
        onload: function() {
          loader.style.display = 'none';
        },
        onend: function() {
          self.skip('next');
        },
        onpause: function() {
          // ?
        },
        onstop: function() {
          // ?
        },
        onseek: function() {
          // Start upating the progress of the track.
          requestAnimationFrame(self.step.bind(self));
        }
      });
    }

    // Begin playing the sound.
    sound.play();

    // Update the track display.
    title.innerHTML = data.title;

    // Show the pause button.
    if (sound.state() === 'loaded') {
      play.style.display = 'none';
      pause.style.display = 'block';
    } else {
      loader.style.display = 'block';
      play.style.display = 'none';
      pause.style.display = 'none';
    }

    // Keep track of the index we are currently playing.
    self.index = index;
  },

  // Pause the currently playing track.
  pause: function() {
    console.log("pause");
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Puase the sound.
    sound.pause();

    // Show the play button.
    play.style.display = 'block';
    pause.style.display = 'none';
  },

  // Skip to the next or previous track.
  // @param  {String} direction 'next' or 'prev'.
  skip: function(direction) {
    console.log("skip");
    var self = this;

    // Get the next track based on the direction of the track.
    var index = 0;
    if (direction === 'prev') {
      index = self.index - 1;
      if (index < 0) {
        index = self.playlist.length - 1;
      }
    } else {
      index = self.index + 1;
      if (index >= self.playlist.length) {
        index = 0;
      }
    }

    self.skipTo(index);
  },

  // Skip to a specific track based on its playlist index.
  // @param  {Number} index Index in the playlist.
  skipTo: function(index) {
    console.log("skipTo");
    var self = this;

    // Stop the current track.
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }

    // Reset progress.
    progress.style.width = '0%';

    // Play the new track.
    self.play(index);
  },

  // Seek to a new position in the currently playing track.
  // @param  {Number} per Percentage through the song to skip.
  seek: function(per) {
    console.log("seek");
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Convert the percent into a seek position.
    if (sound.playing()) {
      sound.seek(sound.duration() * per);
    }
  },

  rate: function(speed) {
    console.log("rate");
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    if (sound.rate() === 1) {
      sound.rate(0.5);
    } else {
      sound.rate(1);
    }
  },

  // The step called within requestAnimationFrame to update the playback position.
  step: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Determine our current seek position.
    var seek = sound.seek() || 0;
    timer.innerHTML = self.formatTime(Math.round(seek));
    progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';

    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },

  // Format the time from seconds to M:SS.
  // @param  {Number} secs Seconds to format.
  // @return {String}      Formatted time.
  formatTime: function(secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }
};

// Set up playlist
// -----------------------------------------------------------------------------

// Create a playlist from the DOM
var tracksObj = [];
var domTracks = document.querySelectorAll('[data-track]');
Array.prototype.forEach.call(domTracks, function(el, i) {
  var title = el.querySelector('[data-track-title]').textContent;
  var file = el.getAttribute('data-track');
  tracksObj.push({
    title: title,
    file: file,
    howl: null
  });
});

// Setup our new audio player class and pass it the playlist
var player = new Player(tracksObj);

// Bind our player controls.
// -----------------------------------------------------------------------------

play.addEventListener('click', function() {
  player.play();
});

pause.addEventListener('click', function() {
  player.pause();
});

prev.addEventListener('click', function() {
  player.skip('prev');
});

next.addEventListener('click', function() {
  player.skip('next');
});

speed.addEventListener('click', function() {
  player.rate(0.5);
});

tracks.addEventListener('click', function(e) {
  if (e.target !== e.currentTarget) { // Ensure it's a click on a child
    action = e.target.getAttribute('data-track-button');
    if (action === 'play') {
      var tracks = Array.from(e.currentTarget.children);
      var track = e.target.closest('li');
      var i = tracks.indexOf(track);

      if (i === player.index) {
        player.play();
      } else {
        player.skipTo(i);
      }
    }

    if (action === 'pause') {
      player.pause();
    }
  }
  e.stopPropagation();
}, false);

/*

all play buttons on a page have an index and a URL
when you hit play, it should check if we're resuming or not.

*/

// ID3
var jsmediatags = window.jsmediatags;
jsmediatags.read("http://localhost:1234/site/themes/tes/assets/javascripts/test.mp3", {
  onSuccess: function(tag) {
    console.log(tag);
  },
  onError: function(error) {
    console.log(error);
  }
});

