function applyChanges() {
  var headlineText = document.getElementById('headline').value;
  var ctaText = document.getElementById('cta').value;

  var h1 = document.querySelector('h1');
  var btn = document.querySelector('a, button');

  if (h1 && headlineText) {
    h1.dataset.original = h1.innerText;
    h1.innerText = headlineText;
  }

  if (btn && ctaText) {
    btn.dataset.original = btn.innerText;
    btn.innerText = ctaText;
  }

  alert('Preview Applied');
}

function resetChanges() {
  document.querySelectorAll('[data-original]').forEach(el => {
    el.innerText = el.dataset.original;
  });
  alert('Reset Done');
}
