var toggle = document.querySelector('[data-toggle-subnav]');
var subnav = document.querySelector('[data-subnav]');
var hideClass = 'subnav--hide';

function toggleSubnav() {
  if (subnav.classList.contains(hideClass)) {
    subnav.classList.remove(hideClass);
  } else {
    subnav.classList.add(hideClass);
  }
}

toggle.addEventListener('click', function() {
  console.log("Toggle subnav");
  toggleSubnav();
});

document.addEventListener('click', function(e) {
  // Only trigger if the subnav is open
  if (!subnav.classList.contains(hideClass)) {
    if (!toggle.contains(e.target)) {
      console.log("Outside");
      subnav.classList.add(hideClass);
    }
  }
});
