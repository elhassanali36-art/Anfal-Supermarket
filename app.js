/* السوبرماركت — منطق عرض المتجر */
(function () {
  var S = window.__SHOWROOM__ || { settings: {}, cars: [] };
  var settings = S.settings || {};
  var cars = (S.cars || []).filter(function (c) { return c && c.title; });
  var activeCategory = 'الكل';
  var wa = String(settings.whatsapp || '').replace(/\D/g, '');

  function $(sel) { return document.querySelector(sel); }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  }); }
  function waLink(text) { return 'https://wa.me/' + wa + (text ? '?text=' + encodeURIComponent(text) : ''); }

  function applySettings() {
    var s = settings;
    if (s.name) { $('#storeName').textContent = s.name; $('#footerName').textContent = s.name; document.title = s.name + ' | منتجات وطلبات في الخرطوم'; }
    if (s.tagline) $('#storeTagline').textContent = s.tagline;
    if (s.heroText) $('#heroText').textContent = s.heroText;
    if (s.heroNote) $('#heroNote').textContent = s.heroNote;
    if (s.address) $('#footerAddress').textContent = s.address;
    if (s.phone) { $('#footerPhone').textContent = 'للتواصل: ' + s.phone; $('#callBtn').href = 'tel:' + s.phone; }
    if (wa) {
      $('#waBtn').href = waLink('مرحبا، أرغب في الاستفسار عن المنتجات المتاحة.');
      $('#heroWa').href = waLink('مرحبا، أرغب في الاستفسار عن المنتجات المتاحة.');
    }
    $('#statCars').textContent = String(cars.length);
  }

  function categories() {
    var seen = [];
    cars.forEach(function (c) { if (c.category && seen.indexOf(c.category) === -1) seen.push(c.category); });
    return seen;
  }

  function renderChips() {
    var all = ['الكل'].concat(categories());
    $('#categories').innerHTML = all.map(function (name) {
      return '<button class="chip' + (name === activeCategory ? ' active' : '') + '" role="tab" aria-selected="' +
        (name === activeCategory) + '" onclick="setCategory(\'' + esc(name).replace(/'/g, "\\'") + '\')">' + esc(name) + '</button>';
    }).join('');
  }

  function priceNum(c) {
    var v = parseFloat(String(c.price || '').replace(/[^0-9.]/g, ''));
    if (isNaN(v)) return 0;
    var unit = String(c.priceUnit || '');
    if (unit.indexOf('مليار') !== -1) return v * 1000;
    if (unit.indexOf('ألف') !== -1) return v / 1000;
    return v;
  }

  function filtered() {
    var q = ($('#search').value || '').trim().toLowerCase();
    return cars.slice().sort(function (a, b) { return priceNum(b) - priceNum(a); }).filter(function (c) {
      var inCat = activeCategory === 'الكل' || c.category === activeCategory;
      if (!inCat) return false;
      if (!q) return true;
      var hay = [c.title, c.year, c.category, c.badge, c.place, c.dealer, (c.specs || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function renderCars() {
    var list = filtered();
    $('#carCount').textContent = list.length ? (list.length + ' منتج') : '';
    if (!list.length) {
      $('#grid').innerHTML = '<div class="empty">لا توجد منتجات منشورة حالياً. اكتب لنا على الواتساب طلبك.</div>';
      return;
    }
    $('#grid').innerHTML = list.map(function (c) {
      var img = c.image ? '<img src="' + esc(c.image) + '" alt="' + esc(c.title) + '" loading="lazy">' : '';
      return '' +
        '<article class="car">' +
          '<div class="carimg">' + img +
            (c.badge ? '<span class="badge">' + esc(c.badge) + '</span>' : '') +
            (c.year ? '<span class="yearbadge">' + esc(c.year) + '</span>' : '') +
          '</div>' +
          '<div class="carbody">' +
            '<h4>' + esc(c.title) + '</h4>' +
            '<div class="metaline">' +
              (c.category ? '<i>' + esc(c.category) + '</i>' : '') +
              (c.dealer ? '<i>' + esc(c.dealer) + '</i>' : '') +
              (c.place ? '<i>التوصيل: ' + esc(c.place) + '</i>' : '') +
            '</div>' +
            '<div class="pricerow"><span class="price">' + esc(c.price) +
              (c.priceUnit ? ' <small>' + esc(c.priceUnit) + '</small>' : '') + '</span>' +
              (c.priceNote ? '<span class="muted small">' + esc(c.priceNote) + '</span>' : '') +
            '</div>' +
            (c.commission ? '<div class="commission">العمولة: ' + esc(c.commission) +
              (c.commissionNote ? ' — ' + esc(c.commissionNote) : '') + '</div>' : '') +
            '<div class="car-actions">' +
              '<button class="btn-gold" onclick="openCar(' + Number(c.id) + ')">التفاصيل</button>' +
              '<a class="btn-wa" style="flex:1;text-align:center;padding:11px 12px;border-radius:12px;font-size:13.5px;font-weight:700" target="_blank" rel="noopener" href="' +
                esc(waLink('مرحبا، أرغب في الاستفسار عن ' + c.title + ' — السعر ' + c.price + ' ' + (c.priceUnit || '') + '، التوصيل ' + (c.place || ''))) + '">واتساب</a>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  window.setCategory = function (name) { activeCategory = name; renderChips(); renderCars(); };
  window.resetSearch = function () { $('#search').value = ''; activeCategory = 'الكل'; renderChips(); renderCars(); };
  window.scrollToCars = function () { document.getElementById('carCount').scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  window.openCar = function (id) {
    var c = cars.filter(function (x) { return Number(x.id) === Number(id); })[0];
    if (!c) return;
    $('#mTitle').textContent = c.title;
    $('#mImage').src = c.image || '';
    $('#mImage').alt = c.title;
    $('#mImageNote').textContent = c.imageNote || '';
    $('#mImageNote').style.display = c.imageNote ? '' : 'none';
    $('#mMeta').innerHTML =
      (c.year ? '<i>' + esc(c.year) + '</i>' : '') +
      (c.category ? '<i>' + esc(c.category) + '</i>' : '') +
      (c.badge ? '<i>' + esc(c.badge) + '</i>' : '') +
      (c.dealer ? '<i>القسم: ' + esc(c.dealer) + '</i>' : '');
    $('#mPrice').textContent = c.price + (c.priceUnit ? ' ' + c.priceUnit : '');
    $('#mPriceNote').textContent = c.priceNote || '';
    $('#mCommission').textContent = c.commission ? ('العمولة: ' + c.commission + (c.commissionNote ? ' — ' + c.commissionNote : '')) : '';
    $('#mCommission').style.display = c.commission ? '' : 'none';
    $('#mSpecs').innerHTML = (c.specs || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    $('#mPlace').innerHTML = '📍 التوصيل: <strong style="color:#e8eef5;margin-inline-start:5px">' + esc(c.place || 'الخرطوم') + '</strong>';
    $('#mWa').href = waLink('مرحبا، أستفسر عن ' + c.title + ' — السعر ' + c.price + ' ' + (c.priceUnit || '') + '، التوصيل ' + (c.place || '') + '. هل ما زال متاحاً؟');
    $('#mCall').href = 'tel:' + (settings.phone || '');
    $('#carModal').classList.add('show');
    document.body.style.overflow = 'hidden';
  };
  window.closeCar = function () {
    $('#carModal').classList.remove('show');
    document.body.style.overflow = '';
  };

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') window.closeCar(); });
  $('#search').addEventListener('input', renderCars);

  applySettings();
  renderChips();
  renderCars();

  /* رابط مباشر لسيارة: ?car=3 */
  /* تثبيت التطبيق على الشاشة الرئيسية */
  var deferredPrompt = null;
  var installBtn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });
  if (installBtn) {
    installBtn.addEventListener('click', function () {
      if (!deferredPrompt) { installBtn.hidden = true; return; }
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () { deferredPrompt = null; installBtn.hidden = true; });
    });
  }
  window.addEventListener('appinstalled', function () { if (installBtn) installBtn.hidden = true; });

  var params = new URLSearchParams(window.location.search);
  var deep = params.get('car');
  if (deep) setTimeout(function () { window.openCar(Number(deep)); }, 60);
})();
