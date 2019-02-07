// DOM Ready
(function() {

  // DOM Elements
  // ---------------------------------------------------------------------------

  var tracklistItems = document.querySelectorAll('[data-track]');
  var elements = ['stereo', 'title', 'timer', 'duration', 'play', 'pause',
  'speed', 'next', 'prev', 'progress', 'loader', 'tracklist']

  elements.forEach(function(el) {
    window[el] = document.querySelector(`[data-player="${el}"]`);
  });

  player = {};
  radioCollections = [];
  virtualPlaylist = [];

  // Player
  // ---------------------------------------------------------------------------

  if (stereo) {
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

    // Tracklist
    // ---------------------------------------------------------------------------

    function updateTracklist(e) {
      // Ensure it's a click on a child
      if (e.target !== e.currentTarget) {
        var track = e.target.closest('.tracklist__item');
        var action = e.target.getAttribute('data-track-button');
        var playButton = track.querySelector('[data-track-button="play"]');
        var pauseButton = track.querySelector('[data-track-button="pause"]');

        if (action === 'play') {
          // Create an array from all the tracklist items and find the index of
          // the one we clicked on
          var i = Array.from(tracklistItems).indexOf(track);

          if (i === player.index) {
            player.play();
          } else {
            Array.prototype.forEach.call(tracklistItems, function(track, i) {
              track.setAttribute('data-state', 'init');
            });
            player.skipTo(i);
          }
          track.setAttribute('data-state', 'playing');
        }

        if (action === 'pause') {
          player.pause();
          track.setAttribute('data-state', 'paused');
        }
      }
      e.stopPropagation();
    }

    function playlistFromDOM() {
      // Create a playlist from the DOM
      var playlist = [];
      Array.prototype.forEach.call(tracklistItems, function(el, i) {
        var title = el.querySelector('[data-track-title]').textContent;
        var file = el.getAttribute('data-track');
        playlist.push({
          title: title,
          file: file,
          howl: null
        });
      });
      return playlist;
    }

    // function tracklistTimes() {
    //   var jsmediatags = window.jsmediatags;

    //   Array.prototype.forEach.call(tracklistItems, function(el, i) {
    //     var time = el.querySelector('[datetime]');
    //     var file = el.getAttribute('data-track');

    //     // ID3
    //     jsmediatags.read(file, {
    //       onSuccess: function(tag) {
    //         time.textContent = '000';
    //         console.log(tag);
    //       },
    //       onError: function(error) {
    //         console.log(error);
    //       }
    //     });
    //   });
    // }

    // Radio
    // -------------------------------------------------------------------------

    function randomMax(max) {
      var min = 0;
      return Math.floor(Math.random() * (max - min)) + min;
    }

    async function fetchItems(url) {
      const response = await fetch(`/!/Fetch${url}`, {});
      const data = await response.json();
      return data;
    }

    function pushRandomTrack() {
      return new Promise(resolve => {
        var i = randomMax(radioCollections.length);
        var n = randomMax(radioCollections[i].tracklist.length);
        var track = radioCollections[i].tracklist[n];

        // Delete the item from the array so we don't get it again
        radioCollections[i].tracklist.splice(n, 1);

        // Now that we have the ID, we can fetch the song title
        fetchItems(`/entry/${track.song}`).then(data => {
          virtualPlaylist.push({
            title: data.data.title,
            file: track.audio_file,
            howl: null
          });
        }).then(function() {
          resolve('Added random track to the virtual playlist!');
        });
      });
    }

    async function initVirtualPlaylist() {
      var result = await pushRandomTrack();
      console.log(result);
      player = new Player(virtualPlaylist);
    }

    if (tracklistItems.length) {
      player = new Player(playlistFromDOM());
    } else {
      fetchItems('/collection/albums').then(data => {
        radioCollections = data.data;
        initVirtualPlaylist();
      });
    }





    // var randoTrackButton = document.querySelector('#rando-track');
    // randoTrackButton.addEventListener('click', function() {
    //   randomTrack();
    // });

    // OK, maybe this is what we can do...
    // After the page loads, load all the collections into the array.
    // Then get a random track and push to the playlist. Remove it from the array.
    // Now it's ready to play.
    // When the song ends (`onend`), push another track to the array and `skipto`.
    // (Same for the "next" button--push a rando track and skip to it)
    // (Skipping back works like normal)
    // Normally we run `var player = new Player(playlistFromDOM())`, which crates our playlist from the DOM.
    // This time we can run `var player = new Player(radioPlaylist)`

    // The next version can include alternative material.
    // Once we can get the actual track object via AJAX, we should have acess to all its associated wikis.
    // Then we can fetch the wiki entry for that track and display their titles with links, plus content.
    //
    // Playing: "Conversation with Robert Bogarth"
    // Pictures of: Robert Bogarth, JP Spline, Harold Kellog (click for more) (wikis:people)
    // Learn about: Bogarth Engines, Morning SPA (wikis:!people)
    // See All: Radio Shows, Technology, People, Scientists (tags for each wiki)






    // Bind player controls.
    // -------------------------------------------------------------------------

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

    if (tracklistItems.length) {
      tracklist.addEventListener('click', function(e) {
        updateTracklist(e);
      }, false);
    }
  }
})(); // end DOM ready
