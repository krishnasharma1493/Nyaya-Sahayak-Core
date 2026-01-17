const book = document.querySelector('.book');
const intro = document.getElementById('intro-scene');
const site = document.getElementById('main-site');

// 1. Open the book after a short delay
setTimeout(() => {
  book.classList.add('open');
}, 800);

// 2. Fade in the actual website
setTimeout(() => {
  site.classList.add('show-site');
}, 2200);

// 3. Remove the intro scene from the view
setTimeout(() => {
  intro.classList.add('hide-intro');
}, 3200);