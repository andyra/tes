
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

var elms = ['tracks', 'title', 'timer', 'duration', 'playButton', 'pauseButton', 'prevButton', 'nextButton', 'progress', 'loading', 'playlist', 'list', 'slowButton'];
elms.forEach(function(elm) {
  window[elm] = document.getElementById(elm);
});

// Functions
// -----------------------------------------------------------------------------

/**
 * Player class containing the state of our playlist and where we are in it.
 * Includes all methods for playing, skipping, updating the display, etc.
 * @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
 */
var Player = function(playlist) {
  this.playlist = playlist;
  this.index = 0;

  // Display the title of the first track.
  title.innerHTML = playlist[0].title;

  console.log(title);
  console.log(playlist[0].title);

  // // Setup the playlist display.
  // // TODO: This is where you have the play buttons in the tracklist
  // playlist.forEach(function(song) {
  //   var div = document.createElement('div');
  //   div.className = 'list-song';
  //   div.innerHTML = song.title;
  //   div.onclick = function() {
  //     player.skipTo(playlist.indexOf(song));
  //   };
  //   list.appendChild(div);
  // });
};

Player.prototype = {
  /**
   * Play a song in the playlist.
   * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
   */
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

          // Start the wave animation if we have already loaded
          pauseButton.style.display = 'block';
        },
        onload: function() {
          // Start the wave animation.
          loading.style.display = 'none';
        },
        onend: function() {
          // Stop the wave animation.
          self.skip('next');
        },
        onpause: function() {
          // Stop the wave animation.
        },
        onstop: function() {
          // Stop the wave animation.
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
      playButton.style.display = 'none';
      pauseButton.style.display = 'block';
    } else {
      loading.style.display = 'block';
      playButton.style.display = 'none';
      pauseButton.style.display = 'none';
    }

    // Keep track of the index we are currently playing.
    self.index = index;
  },

  /**
   * Pause the currently playing track.
   */
  pause: function() {
    console.log("pause");
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Puase the sound.
    sound.pause();

    // Show the play button.
    playButton.style.display = 'block';
    pauseButton.style.display = 'none';
  },

  /**
   * Skip to the next or previous track.
   * @param  {String} direction 'next' or 'prev'.
   */
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

  /**
   * Skip to a specific track based on its playlist index.
   * @param  {Number} index Index in the playlist.
   */
  skipTo: function(index) {
    console.log("skipTo");
    var self = this;

    // Stop the current track.
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }

    // Reset progress.
    progress.setAttribute('value', 0);

    // Play the new track.
    self.play(index);
  },

  /**
   * Seek to a new position in the currently playing track.
   * @param  {Number} per Percentage through the song to skip.
   */
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

  /**
   * The step called within requestAnimationFrame to update the playback position.
   */
  step: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Determine our current seek position.
    var seek = sound.seek() || 0;
    timer.innerHTML = self.formatTime(Math.round(seek));
    value = ((seek / sound.duration()) * 100) || 0;
    progress.setAttribute('value', value);

    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },

  /**
   * Format the time from seconds to M:SS.
   * @param  {Number} secs Seconds to format.
   * @return {String}      Formatted time.
   */
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

playButton.addEventListener('click', function() {
  console.log("Event: Play Click");
  player.play();
});

pauseButton.addEventListener('click', function() {
  console.log("Event: Pause Click");
  player.pause();
});

prevButton.addEventListener('click', function() {
  console.log("Event: Prev Click");
  player.skip('prev');
});

nextButton.addEventListener('click', function() {
  console.log("Event: Next Click");
  player.skip('next');
});

slowButton.addEventListener('click', function() {
  console.log("Event: Slow Click");
  player.rate('slow');
});

tracks.addEventListener('click', function(e) {
  if (e.target !== e.currentTarget) { // Ensure it's a click on a child
    action = e.target.getAttribute('data-track-button');

    if (action === 'play') {
      var tracks = Array.from(e.currentTarget.children);
      var track = e.target.closest('li');
      var i = tracks.indexOf(track);
      player.skipTo(i);
    }

    if (action === 'pause') {
      player.pause();
    }
  }
  e.stopPropagation();
}, false);
