
var subnavToggle = document.querySelector('[data-subnav-toggle]');
var subnavMenu = document.querySelector('[data-subnav-menu]');
var mobileToggle = document.querySelector('[data-mobile-toggle]');
var mobileMenu = document.querySelector('[data-mobile-menu]');

function toggleMenu(el) {
  if (el.offsetParent === null) {
    el.style.display = 'flex';
  } else {
    el.style.display = 'none';
  }
}

subnavToggle.addEventListener('click', function() {
  console.log("Toggle subnav");
  toggleMenu(subnavMenu);
});

mobileToggle.addEventListener('click', function() {
  console.log("Toggle mobile");
  toggleMenu(mobileMenu);
});

// Hide subnav
document.addEventListener('click', function(e) {
  // Only trigger if the subnav is open
  if (subnavMenu.offsetParent != null) {
    if (!subnavToggle.contains(e.target)) {
      console.log("Outside");
      subnavMenu.style.display = 'none';
    }
  }
});
