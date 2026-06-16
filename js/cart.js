// ─────────────────────────────────────────────
// WOVENWISHES — CART + FORMSPREE ORDER
// ─────────────────────────────────────────────

// !! REPLACE THIS WITH YOUR FORMSPREE ENDPOINT !!
var FORMSPREE_URL = 'https://formspree.io/f/mjgdlonr';

var cart = [];

// ── Open / Close ──
var cartSidebar = document.getElementById('cart-sidebar');
var cartOverlay = document.getElementById('cart-overlay');
var cartNavBtn  = document.getElementById('cart-nav-btn');
var cartClose   = document.getElementById('cart-close');

function openCart() {
  cartSidebar.removeAttribute('hidden');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartSidebar.setAttribute('hidden', '');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

if (cartNavBtn) cartNavBtn.addEventListener('click', openCart);
if (cartClose)  cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeCart();
});

// ── Add to cart ──
function addToCart(btn) {
  var card  = btn.closest('.product-card');
  var name  = btn.getAttribute('data-name');
  var priceEl = card.querySelector('.product-price');
  var priceText = priceEl ? priceEl.textContent.replace(/[^\d]/g, '') : '0';
  var price = parseInt(priceText, 10) || 0;

  var existing = cart.find(function(i) { return i.name === name; });
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name: name, price: price, qty: 1 });
  }

  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Added!';
  btn.style.background = 'linear-gradient(135deg, #7EDFD3, #5dd6c8)';
  setTimeout(function() {
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Add to cart';
    btn.style.background = '';
  }, 1200);

  renderCart();
  updateCartCount();
  openCart();
}

// ── Render cart ──
function renderCart() {
  var itemsEl  = document.getElementById('cart-items');
  var emptyEl  = document.getElementById('cart-empty');
  var footerEl = document.getElementById('cart-footer');
  var totalEl  = document.getElementById('cart-total');

  if (!itemsEl) return;

  itemsEl.querySelectorAll('.cart-row').forEach(function(r) { r.remove(); });

  if (cart.length === 0) {
    if (emptyEl)  emptyEl.hidden  = false;
    if (footerEl) footerEl.hidden = true;
    return;
  }

  if (emptyEl)  emptyEl.hidden  = true;
  if (footerEl) footerEl.hidden = false;

  var total = 0;
  cart.forEach(function(item, idx) {
    var row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML =
      '<div class="cart-row-name">' + item.name + '</div>' +
      '<div class="cart-row-controls">' +
        '<button class="qty-btn" onclick="changeQty(' + idx + ', -1)">−</button>' +
        '<span class="qty-val">' + item.qty + '</span>' +
        '<button class="qty-btn" onclick="changeQty(' + idx + ', 1)">+</button>' +
      '</div>' +
      '<div class="cart-row-price">₹ ' + (item.price * item.qty).toLocaleString('en-IN') + '</div>' +
      '<button class="cart-remove" onclick="removeItem(' + idx + ')" aria-label="Remove">✕</button>';
    itemsEl.appendChild(row);
    total += item.price * item.qty;
  });

  if (totalEl) totalEl.textContent = '₹ ' + total.toLocaleString('en-IN');
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
  updateCartCount();
}

function removeItem(idx) {
  cart.splice(idx, 1);
  renderCart();
  updateCartCount();
}

function updateCartCount() {
  var total = cart.reduce(function(sum, i) { return sum + i.qty; }, 0);
  var badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

// ── Show confirmation screen ──
function showConfirmation() {
  var itemsEl  = document.getElementById('cart-items');
  var footerEl = document.getElementById('cart-footer');
  var emptyEl  = document.getElementById('cart-empty');

  if (footerEl) footerEl.hidden = true;
  if (emptyEl)  emptyEl.hidden  = true;
  if (itemsEl)  itemsEl.querySelectorAll('.cart-row').forEach(function(r) { r.remove(); });

  var confirm = document.createElement('div');
  confirm.className = 'cart-confirmation';
  confirm.innerHTML =
    '<div class="cart-confirm-icon">✨</div>' +
    '<h3>Order placed!</h3>' +
    '<p>Thank you! Your order has been sent to WovenWishes successfully.</p>' +
    '<div class="cart-confirm-status">⏳ Awaiting confirmation</div>' +
    '<p class="cart-confirm-note">You\'ll hear back within 24 hours.</p>';

  if (itemsEl) itemsEl.appendChild(confirm);
}

// ── Order form submission ──
var orderForm = document.getElementById('cart-order-form');
if (orderForm) {
  orderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    if (cart.length === 0) return;

    var nameVal    = document.getElementById('order-name').value.trim();
    var emailVal   = document.getElementById('order-email').value.trim();
    var phoneVal   = document.getElementById('order-phone').value.trim();
    var addressVal = document.getElementById('order-address').value.trim();
    var dateVal    = document.getElementById('order-date').value;
    var noteVal    = document.getElementById('order-note').value.trim();

    if (!nameVal || !emailVal) {
      alert('Please enter your name and email.');
      return;
    }
    if (!addressVal) {
      alert('Please enter your shipping address.');
      return;
    }

    // Build order summary
    var lines = cart.map(function(item) {
      return item.name + ' × ' + item.qty + ' = ₹ ' + (item.price * item.qty).toLocaleString('en-IN');
    }).join('\n');
    var total = cart.reduce(function(sum, i) { return sum + i.price * i.qty; }, 0);
    var summary = lines + '\n─────────────────\nTotal: ₹ ' + total.toLocaleString('en-IN');

    // Format date nicely
    var dateFormatted = 'Not specified';
    if (dateVal) {
      var d = new Date(dateVal);
      dateFormatted = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // Show loading state
    var submitBtn = orderForm.querySelector('.cart-submit-btn');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Submit to Formspree
    fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _subject:         '🛍️ NEW ORDER — WovenWishes — ₹ ' + total.toLocaleString('en-IN'),
        name:             nameVal,
        email:            emailVal,
        phone:            phoneVal || 'Not provided',
        shipping_address: addressVal,
        required_by:      dateFormatted,
        order_items:      summary,
        total:            '₹ ' + total.toLocaleString('en-IN'),
        special_requests: noteVal  || 'None'
      })
    })
    .then(function(res) {
      if (res.ok) {
        cart = [];
        updateCartCount();
        showConfirmation();
      } else {
        submitBtn.textContent = 'Place order';
        submitBtn.disabled = false;
        alert('Something went wrong. Please try again or email wovenwishes216@gmail.com directly.');
      }
    })
    .catch(function() {
      submitBtn.textContent = 'Place order';
      submitBtn.disabled = false;
      alert('Network error. Please try again or email wovenwishes216@gmail.com directly.');
    });
  });
}

updateCartCount();
