// Setup
// -------------------------------------------------------------------------

var body = document.querySelector('body');
var coverArt = document.querySelector('[data-cover-art-expand]');

// Functions
// -------------------------------------------------------------------------

function showCoverArt() {
  var container = document.createElement('div');
  var coverArtLg = document.createElement('img');
  var urlLg = coverArt.getAttribute('data-cover-art-expand');

  coverArtLg.setAttribute('src', urlLg);

  container.appendChild(coverArtLg);
  container.classList.add('overlay');
  body.appendChild(container);
  body.style.overflow = 'hidden';

  container.addEventListener('click', function() {
    removeCoverArt();
  });
}

function removeCoverArt() {
  var el = document.querySelector('.overlay');
  el.parentNode.removeChild(el);
  body.style.overflow = 'initial';
}

// Event Listeners
// -------------------------------------------------------------------------

coverArt.addEventListener('click', function() {
  showCoverArt();
});

document.addEventListener('keyup', function (event) {
  if (event.defaultPrevented) {
    return;
  }

  var key = event.key || event.keyCode;

  if (key === 'Escape' || key === 'Esc' || key === 27) {
    removeCoverArt();
  }
});

// If ESC or click is detected anywhere while the thing is open, SHUT ER DOWN.
