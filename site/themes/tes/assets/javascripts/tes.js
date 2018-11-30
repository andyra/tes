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

var globalPlayer = null;

var playButton   = document.querySelectorAll('[data-audio="play"]')[0];
var pauseButton  = document.querySelectorAll('[data-audio="pause"]')[0];
var prevButton   = document.querySelectorAll('[data-audio="prev"]')[0];
var nextButton   = document.querySelectorAll('[data-audio="next"]')[0];

// permalink to a track
var trackUrl    = 'https://soundcloud.com/thiseveningsshow/vampire-squid?in=thiseveningsshow/sets/shakespeares-tomb-87';
var playlistUrl = 'https://soundcloud.com/thiseveningsshow/sets/shakespeares-tomb-87';

// We have the tracks now, but no player. Just a bunch of IDs, I guess.
// The player itself will know what state its in and what track its playing, but not about the playlist itself.
// If you click "Play" on the stereo button, the default track is 0. Look for the playlist track 0 and initTrack.
// When 0 is finished or "Next" is pressed, we know the next value is 1. So the player might like to know about the playlist.

// SC.resolve(playlistUrl).then(getPlaylist).then(playPlaylist);
// the playPlaylist() method now has a copy of the playlist.

// When you init a playlist, it queues up track 0. When you hit Play, the player knows what ID it is, but not what's next or anything.
// So maybe when the playlist initializes, it looks at the DOM and adds IDs to the tracks (so we can use the DOM to know what's next)
// So when you hit Next inside the player, it can look at the DOM, find the active track, then the next one (if it exists) and play it.

/*
When you initialize a playlist:
You have an array of available tracks. Got that part.

If you hit "Play" and the state is unPlayed, play tracks[0]
If you hit "Next", it needs to know the current i and ++
*/

var myPlaylist = [];

var initPlaylist = function(playlistUrl) {
  SC.resolve(playlistUrl).then(function(playlist) {
    SC.get('/playlists/' + playlist.id).then(function(playlist) {
      myPlaylist = playlist.tracks;
      // inside here, we should get all the track IDs and match them up to the DOM. That will be our official playlist.
      // After injecting all the IDs, get the first one in the DOM and pass it to initTrack(id)
      initTrack(playlist.tracks[0]);
      // Thing is, we have all the track objects already. If we just grab the ID, we have to SC.get() it later. I guess we could put All the stuff in the params?
      // What if the DOM didn't handle the state? Let's toss the playlist up a level.
    });
  });
}

var initTrack = function(currentTrack) {
  var i = myPlaylist.indexOf(myPlaylist.find( track => track.id === currentTrack.id ));
  console.log("Track " + i + ": " + currentTrack.title);

  SC.stream('/tracks/' + currentTrack.id).then(function(player) {
    // Play
    playButton.addEventListener('click', function (e) {
      player.play().then(function() {
        console.log("Play");
      });
    }, false);

    // Pause
    pauseButton.addEventListener('click', function (e) {
      player.pause().then(function() {
        console.log("Pause");
      });
    }, false);

    // Next
    nextButton.addEventListener('click', function (e) {
      player.kill();

      var nextTrack = myPlaylist[i + 1];
      initTrack(nextTrack);
    }, false);
  });
}

// Events
// -----------------------------------------------------------------------------

ready(function() {
  // SC.resolve(trackUrl).then(initTrack);
  // SC.resolve(playlistUrl).then(initPlaylist);
  // SC.resolve(playlistUrl).then(playSet);
  initPlaylist(playlistUrl);
});
