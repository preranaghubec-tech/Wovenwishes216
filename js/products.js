document.addEventListener('DOMContentLoaded', function () {

  // ── TAB FILTERING ──
  var tabBtns    = document.querySelectorAll('.tab-btn');
  var cards      = document.querySelectorAll('.product-card');
  var noProducts = document.getElementById('no-products');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      var selected = btn.getAttribute('data-category');
      var visible  = 0;
      cards.forEach(function (card) {
        var match = selected === 'all' || card.getAttribute('data-category') === selected;
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (noProducts) noProducts.hidden = visible > 0;
    });
  });

  // ── IMAGE STRIP: click thumbnail → update main image ──
  document.querySelectorAll('.product-card').forEach(function (card) {
    var mainImg = card.querySelector('.main-img');
    var thumbs  = card.querySelectorAll('.thumb-img');
    if (!mainImg || thumbs.length === 0) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        mainImg.src = thumb.getAttribute('data-full');
        thumbs.forEach(function (t) { t.classList.remove('active-thumb'); });
        thumb.classList.add('active-thumb');
      });
    });
  });

});
