/* Royal Reelz — Client Login portal (mobile / email OTP)
   Customer OTP se login karke sirf apni photos / videos dekhta hai.
   Payload ke cookie-login (/api/users/login) par chalta hai, isliye ye page
   usi server se khulna chahiye jahan CMS chal raha hai. */
(function () {
  'use strict';

  var API = window.location.origin + '/api';
  var state = { photos: [], videos: [] };
  var otp = { id: '', timer: null };

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function show(id, on) { var el = document.getElementById(id); if (el) el.hidden = !on; }

  /* ---------------------------------------------------------- api */
  function api(path, options) {
    options = options || {};
    options.credentials = 'include';
    options.headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    return fetch(API + path, options).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var msg = data.error || (data.errors && data.errors[0] && data.errors[0].message) || data.message || 'Something went wrong.';
          var err = new Error(msg);
          err.status = res.status;
          err.data = data;
          throw err;
        }
        return data;
      });
    });
  }

  /* ------------------------------------------------------- screens */
  function showOnly(which) {
    show('portal-loading', which === 'loading');
    show('portal-login', which === 'login');
    show('portal-expired', which === 'expired');
    show('portal-staff', which === 'staff');
    show('portal-area', which === 'area');
  }

  function setLede(text) { var el = $('#portal-lede'); if (el) el.textContent = text; }
  function setHeading(a, b) {
    var x = $('#portal-h1a'), y = $('#portal-h1b');
    if (x) x.textContent = a;
    if (y) y.textContent = b;
    document.title = a + ' ' + b + ' \u2014 Royal Reelz';
  }

  function subActive(user) {
    return !!(user && user.subscriptionEnd && new Date(user.subscriptionEnd).getTime() > Date.now());
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return ''; }
  }
  function showPlan(iso) {
    var el = $('#portal-plan');
    if (!el || !iso) return;
    var days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
    var txt = 'Access valid till ' + fmtDate(iso) + ' \u00b7 ' + days + ' day' + (days === 1 ? '' : 's') + ' left';
    if (days <= 30) txt += ' \u2014 contact us to renew.';
    el.textContent = txt;
    el.classList.toggle('is-warn', days <= 30);
    el.hidden = false;
  }
  function showExpired(iso) {
    setHeading('Client', 'Login');
    setLede('Your gallery access has ended.');
    var t = $('#expired-text');
    if (t) t.textContent = iso
      ? 'Your one-year gallery access ended on ' + fmtDate(iso) + '. Please contact us to renew it.'
      : 'Your one-year gallery access has expired. Please contact us to renew it.';
    api('/users/logout', { method: 'POST' }).catch(function () {});
    showOnly('expired');
  }

  function routeUser(user) {
    document.body.classList.toggle('is-signed-in', !!(user && user.role === 'customer' && subActive(user)));
    if (!user) {
      setHeading('Client', 'Login');
      setLede('Sign in with a one-time password to view your own wedding photos and videos.');
      resetOtp();
      showOnly('login');
      return;
    }
    if (user.role !== 'customer') {
      setHeading('Client', 'Login');
      setLede('You are signed in.');
      showOnly('staff');
      return;
    }
    if (!subActive(user)) { showExpired(user.subscriptionEnd); return; }
    // login ho gaya => "Client Login" heading hata do, "My Gallery" dikhao
    setHeading('My', 'Gallery');
    setLede('Your celebration, all in one place.');
    showPlan(user.subscriptionEnd);
    $('#portal-hello').textContent = 'Welcome, ' + (user.name || user.phone || user.email);
    showOnly('area');
    loadFiles();
  }

  /* ------------------------------------------------------- files */
  function youtubeId(url) {
    var m = String(url || '').match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/v\/)([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : '';
  }
  function vimeoId(url) {
    var m = String(url || '').match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : '';
  }

  /* Payload kabhi absolute URL (http://localhost:9007/...) deta hai jo cookie ke bina fail hota hai.
     Isliye hamesha is page ke apne origin se /api/customer-files/file/<filename> banate hain. */
  function fileSrc(f, size) {
    var name = (size && f.sizes && f.sizes[size] && f.sizes[size].filename) || f.filename;
    if (name) return '/api/customer-files/file/' + encodeURIComponent(name);
    var u = (size && f.sizes && f.sizes[size] && f.sizes[size].url) || f.url || '';
    try { var x = new URL(u, window.location.origin); return x.pathname + x.search; } catch (e) { return u; }
  }
  function imgFallback(img) {
    // thumbnail na bane ho to full image par aa jao
    img.addEventListener('error', function () {
      var full = img.getAttribute('data-full');
      if (full && img.getAttribute('src') !== full) img.setAttribute('src', full);
    });
  }

  function loadFiles() {
    $('#portal-sub').textContent = 'Loading your files…';
    api('/customer-files?limit=500&depth=0&sort=order,-createdAt').then(function (data) {
      state.photos = [];
      state.videos = [];
      (data.docs || []).forEach(function (f) {
        var mime = f.mimeType || '';
        if (mime.indexOf('image/') === 0) state.photos.push(f);
        if (mime.indexOf('video/') === 0 || f.videoUrl) state.videos.push(f);
      });
      render();
    }).catch(function (err) {
      if (err.status === 403) { showExpired(null); return; }
      if (err.status === 401) { routeUser(null); return; }
      $('#portal-sub').textContent = 'Could not load your files. Please refresh.';
    });
  }

  function dlLink(f) {
    var href = f.downloadUrl || (f.filename && f.mimeType ? fileSrc(f) : '');
    if (!href) return '';
    var own = !f.downloadUrl;
    return '<a class="portal-dl" href="' + esc(href) + '"' +
      (own ? ' download' : ' target="_blank" rel="noopener"') + '>Download</a>';
  }

  /* download button for a photo (own file => real download, external link => new tab) */
  function photoDownload(f, cls) {
    var href = f.downloadUrl || (f.filename ? fileSrc(f) : '');
    if (!href) return '';
    if (f.downloadUrl) {
      return '<a class="' + cls + '" href="' + esc(href) + '" target="_blank" rel="noopener">Download</a>';
    }
    var ext = (String(f.filename).match(/\.[A-Za-z0-9]+$/) || ['.jpg'])[0];
    var name = String(f.title || 'photo').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'photo';
    return '<a class="' + cls + '" href="' + esc(href) + '" download="' + esc(name + ext) + '">Download</a>';
  }

  function photoCard(f, i) {
    return '<figure class="portal-tile">' +
      '<button type="button" class="portal-open" data-i="' + i + '" aria-label="Open ' + esc(f.title) + '">' +
      '<img src="' + esc(fileSrc(f, 'thumbnail')) + '" data-full="' + esc(fileSrc(f)) + '" alt="' + esc(f.title) + '" loading="lazy"></button>' +
      '<figcaption class="portal-cap">' +
        '<span class="portal-cap-title">' + esc(f.title) + '</span>' +
        (f.note ? '<span class="portal-cap-note">' + esc(f.note) + '</span>' : '') +
        photoDownload(f, 'portal-cap-dl') +
      '</figcaption></figure>';
  }

  function videoCard(f) {
    var media;
    var mime = f.mimeType || '';
    if (mime.indexOf('video/') === 0 && f.filename) {
      media = '<video controls playsinline preload="metadata" src="' + esc(fileSrc(f)) + '"></video>';
    } else if (youtubeId(f.videoUrl)) {
      media = '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(youtubeId(f.videoUrl)) +
        '?rel=0" title="' + esc(f.title) + '" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';
    } else if (vimeoId(f.videoUrl)) {
      media = '<iframe src="https://player.vimeo.com/video/' + esc(vimeoId(f.videoUrl)) +
        '" title="' + esc(f.title) + '" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
    } else {
      media = '<a class="portal-ext" href="' + esc(f.videoUrl) + '" target="_blank" rel="noopener">Watch video &#8599;</a>';
    }
    return '<article class="portal-video">' +
      '<div class="portal-frame">' + media + '</div>' +
      '<div class="portal-meta"><h3>' + esc(f.title) + '</h3>' +
        (f.videoUrl ? '<a class="portal-dl" href="' + esc(f.videoUrl) + '" target="_blank" rel="noopener">Open</a>' : dlLink(f)) + '</div>' +
      (f.note ? '<p class="portal-note">' + esc(f.note) + '</p>' : '') + '</article>';
  }

  function render() {
    $('#count-photos').textContent = state.photos.length;
    $('#count-videos').textContent = state.videos.length;
    $('#grid-photos').innerHTML = state.photos.map(photoCard).join('');
    $$('#grid-photos img').forEach(imgFallback);
    $('#grid-videos').innerHTML = state.videos.map(videoCard).join('');
    show('empty-photos', !state.photos.length);
    show('empty-videos', !state.videos.length);

    var total = state.photos.length + state.videos.length;
    $('#portal-sub').textContent = total
      ? state.photos.length + (state.photos.length === 1 ? ' photo' : ' photos') + ' \u00b7 ' +
        state.videos.length + (state.videos.length === 1 ? ' video' : ' videos')
      : 'Your files are not ready yet. We will let you know.';

    // jis tab me kuch hai wahi pehle dikhao
    selectTab(state.photos.length || !state.videos.length ? 'photos' : 'videos');
  }

  function selectTab(name) {
    $$('.portal-tab').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-tab') === name); });
    $$('.portal-panel').forEach(function (p) { p.classList.toggle('is-on', p.id === 'panel-' + name); });
    // doosre tab ki videos band karo
    if (name !== 'videos') {
      $$('#grid-videos video').forEach(function (v) { try { v.pause(); } catch (e) {} });
    }
  }

  /* ----------------------------------------------------- lightbox */
  var lb = null, cur = 0;

  function buildLightbox() {
    if (lb) return;
    lb = document.createElement('div');
    lb.className = 'portal-lb';
    lb.hidden = true;
    lb.innerHTML = '<button type="button" class="portal-lb-x" aria-label="Close">&times;</button>' +
      '<button type="button" class="portal-lb-p" aria-label="Previous">&#8249;</button>' +
      '<img alt="">' +
      '<button type="button" class="portal-lb-n" aria-label="Next">&#8250;</button>' +
      '<div class="portal-lb-c"></div>';
    document.body.appendChild(lb);
    lb.addEventListener('click', function (e) {
      var t = e.target;
      if (t === lb || t.className === 'portal-lb-x') closeLb();
      else if (t.className === 'portal-lb-p') go(cur - 1);
      else if (t.className === 'portal-lb-n') go(cur + 1);
    });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') go(cur - 1);
      if (e.key === 'ArrowRight') go(cur + 1);
    });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  function go(i) {
    var n = state.photos.length;
    if (!n) return;
    cur = (i + n) % n;
    var f = state.photos[cur];
    lb.querySelector('img').src = fileSrc(f);
    lb.querySelector('img').alt = f.title || '';
    lb.querySelector('.portal-lb-c').innerHTML =
      '<span class="portal-lb-t">' + esc(f.title || '') + '</span>' +
      (f.note ? '<span class="portal-lb-n2">' + esc(f.note) + '</span>' : '') +
      '<span class="portal-lb-meta">' + (cur + 1) + ' / ' + n + '</span>' +
      photoDownload(f, 'portal-lb-dl');
  }
  function openLb(i) {
    buildLightbox();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    go(i);
  }
  function closeLb() {
    lb.hidden = true;
    lb.querySelector('img').src = '';
    document.body.style.overflow = '';
  }

  /* ------------------------------------------------------ events */
  document.addEventListener('click', function (e) {
    var open = e.target.closest && e.target.closest('.portal-open');
    if (open) { openLb(parseInt(open.getAttribute('data-i'), 10) || 0); return; }

    var tab = e.target.closest && e.target.closest('.portal-tab');
    if (tab) { selectTab(tab.getAttribute('data-tab')); return; }

    var out = e.target.closest && e.target.closest('[data-logout]');
    if (out) {
      api('/users/logout', { method: 'POST' }).catch(function () {}).then(function () {
        // signed out -> back to the Royal Reelz website
        window.location.href = 'index.html';
      });
    }
  });

  /* ----------------------------------------------------- OTP login */
  function msg(id, text) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = text || '';
    el.hidden = !text;
  }
  function resetOtp() {
    clearInterval(otp.timer);
    show('otp-id-form', true);
    show('otp-code-form', false);
    msg('portal-error', ''); msg('otp-error', '');
    var c = document.getElementById('pl-code'); if (c) c.value = '';
  }
  function countdown(sec) {
    var b = document.getElementById('otp-resend');
    clearInterval(otp.timer);
    function tick() {
      if (sec <= 0) { clearInterval(otp.timer); b.disabled = false; b.textContent = 'Resend OTP'; return; }
      b.disabled = true; b.textContent = 'Resend in ' + sec + 's'; sec--;
    }
    tick();
    otp.timer = setInterval(tick, 1000);
  }
  function validId(v) {
    v = String(v || '').trim();
    if (v.indexOf('@') > -1) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    return v.replace(/\D/g, '').length >= 10;
  }
  function sendCode(btn, label, errId) {
    msg(errId, '');
    btn.disabled = true;
    btn.textContent = 'Sending\u2026';
    return api('/otp/request', { method: 'POST', body: JSON.stringify({ identifier: otp.id }) })
      .then(function (d) {
        show('otp-id-form', false);
        show('otp-code-form', true);
        $('#otp-sent-to').textContent = otp.id;
        msg('otp-error', '');
        countdown(d.resendIn || 60);
        var c = document.getElementById('pl-code'); c.value = ''; c.focus();
        return true;
      })
      .catch(function (e) {
        if (e.status === 429 && errId === 'otp-error') countdown((e.data && e.data.retryAfter) || 60);
        msg(errId, e.message);
        return false;
      })
      .then(function (ok) {
        if (btn.id !== 'otp-resend') { btn.textContent = label; btn.disabled = false; }
        else if (!ok) { btn.textContent = label; }
        return ok;
      });
  }

  var idForm = document.getElementById('otp-id-form');
  if (idForm) idForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = idForm.elements.identifier.value.trim();
    if (!validId(v)) { msg('portal-error', 'Please enter a valid 10-digit mobile number.'); return; }
    otp.id = v;
    sendCode($('#portal-submit'), 'Send OTP', 'portal-error');
  });

  var codeForm = document.getElementById('otp-code-form');
  if (codeForm) {
    codeForm.elements.code.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 6);
    });
    codeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = codeForm.elements.code.value;
      var btn = $('#otp-submit');
      if (code.length !== 6) { msg('otp-error', 'Enter the 6-digit OTP.'); return; }
      msg('otp-error', '');
      btn.disabled = true; btn.textContent = 'Verifying\u2026';
      api('/otp/verify', { method: 'POST', body: JSON.stringify({ identifier: otp.id, code: code }) })
        .then(function (d) { clearInterval(otp.timer); routeUser(d.user); })
        .catch(function (err) {
          if (err.status === 403) { showExpired(err.data && err.data.subscriptionEnd); return; }
          msg('otp-error', err.message);
        })
        .then(function () { btn.disabled = false; btn.textContent = 'Verify & sign in'; });
    });
    $('#otp-resend').addEventListener('click', function () { sendCode(this, 'Resend OTP', 'otp-error'); });
    $('#otp-change').addEventListener('click', resetOtp);
  }
  var back = document.getElementById('expired-back');
  if (back) back.addEventListener('click', function () { routeUser(null); });

  /* -------------------------------------------------------- start */
  api('/users/me').then(function (data) { routeUser(data.user || null); })
    .catch(function () { routeUser(null); });
})();