/* Royal Reelz — Client Login portal
   Customer login karke sirf apni photos / videos dekhta hai.
   Payload ke cookie-login (/api/users/login) par chalta hai, isliye ye page
   usi server se khulna chahiye jahan CMS chal raha hai. */
(function () {
  'use strict';

  var API = window.location.origin + '/api';
  var state = { photos: [], videos: [] };
  var otp = { email: '', timer: null };

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

  function routeUser(user) {
    if (!user) {
      setLede('Sign in with a one-time code to view your own wedding photos and videos.');
      resetOtp();
      showOnly('login');
      return;
    }
    if (user.role !== 'customer') {
      setLede('You are signed in.');
      showOnly('staff');
      return;
    }
    if (!subActive(user)) { showExpired(user.subscriptionEnd); return; }
    setLede('Your celebration, all in one place.');
    showPlan(user.subscriptionEnd);
    $('#portal-hello').textContent = 'Welcome, ' + (user.name || user.email);
    showOnly('area');
    loadFiles();
  }

  /* ------------------------------------------------- subscription */
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
    var txt = 'Access valid till ' + fmtDate(iso) + ' · ' + days + ' day' + (days === 1 ? '' : 's') + ' left';
    if (days <= 30) txt += ' — contact us to renew.';
    el.textContent = txt;
    el.classList.toggle('is-warn', days <= 30);
    el.hidden = false;
  }
  function showExpired(iso) {
    setLede('Your gallery access has ended.');
    var t = $('#expired-text');
    if (t) t.textContent = iso
      ? 'Your one-year gallery access ended on ' + fmtDate(iso) + '. Please contact us to renew it.'
      : 'Your one-year gallery access has expired. Please contact us to renew it.';
    api('/users/logout', { method: 'POST' }).catch(function () {});
    showOnly('expired');
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

  function loadFiles() {
    $('#portal-sub').textContent = 'Loading your files…';
    api('/customer-files?limit=500&depth=0&sort=order,-createdAt').then(function (data) {
      state.photos = [];
      state.videos = [];
      (data.docs || []).forEach(function (f) {
        var mime = f.mimeType || '';
        if (mime.indexOf('image/') === 0) state.photos.push(f);
        else if (mime.indexOf('video/') === 0 || f.videoUrl) state.videos.push(f);
      });
      render();
    }).catch(function (err) {
      if (err.status === 403) { showExpired(null); return; }
      if (err.status === 401) { routeUser(null); return; }
      $('#portal-sub').textContent = 'Could not load your files. Please refresh.';
    });
  }

  function dlLink(f) {
    var href = f.downloadUrl || (f.url && f.mimeType ? f.url : '');
    if (!href) return '';
    var own = !f.downloadUrl;
    return '<a class="portal-dl" href="' + esc(href) + '"' +
      (own ? ' download' : ' target="_blank" rel="noopener"') + '>Download</a>';
  }

  function photoCard(f, i) {
    var thumb = (f.sizes && f.sizes.thumbnail && f.sizes.thumbnail.url) || f.url;
    return '<figure class="portal-photo">' +
      '<button type="button" class="portal-open" data-i="' + i + '" aria-label="Open ' + esc(f.title) + '">' +
      '<img src="' + esc(thumb) + '" alt="' + esc(f.title) + '" loading="lazy"></button>' +
      '<figcaption><span>' + esc(f.title) + '</span>' + dlLink(f) + '</figcaption></figure>';
  }

  function videoCard(f) {
    var media;
    var mime = f.mimeType || '';
    if (mime.indexOf('video/') === 0 && f.url) {
      media = '<video controls playsinline preload="metadata" src="' + esc(f.url) + '"></video>';
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
      '<div class="portal-meta"><h3>' + esc(f.title) + '</h3>' + dlLink(f) + '</div>' +
      (f.note ? '<p class="portal-note">' + esc(f.note) + '</p>' : '') + '</article>';
  }

  function render() {
    $('#count-photos').textContent = state.photos.length;
    $('#count-videos').textContent = state.videos.length;
    $('#grid-photos').innerHTML = state.photos.map(photoCard).join('');
    $('#grid-videos').innerHTML = state.videos.map(videoCard).join('');
    show('empty-photos', !state.photos.length);
    show('empty-videos', !state.videos.length);

    var total = state.photos.length + state.videos.length;
    $('#portal-sub').textContent = total
      ? state.photos.length + ' photos · ' + state.videos.length + ' videos'
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
      '<p class="portal-lb-c"></p>';
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
    lb.querySelector('img').src = f.url;
    lb.querySelector('img').alt = f.title || '';
    lb.querySelector('.portal-lb-c').textContent = (cur + 1) + ' / ' + n + (f.title ? '  ·  ' + f.title : '');
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
        state = { photos: [], videos: [] };
        routeUser(null);
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
    show('otp-email-form', true);
    show('otp-code-form', false);
    msg('portal-error', ''); msg('otp-error', '');
    var c = document.getElementById('pl-code'); if (c) c.value = '';
  }
  function countdown(sec) {
    var b = document.getElementById('otp-resend');
    clearInterval(otp.timer);
    function tick() {
      if (sec <= 0) { clearInterval(otp.timer); b.disabled = false; b.textContent = 'Resend code'; return; }
      b.disabled = true; b.textContent = 'Resend in ' + sec + 's'; sec--;
    }
    tick();
    otp.timer = setInterval(tick, 1000);
  }
  function sendCode(btn, label, errId) {
    msg(errId, '');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    return api('/otp/request', { method: 'POST', body: JSON.stringify({ email: otp.email }) })
      .then(function (d) {
        show('otp-email-form', false);
        show('otp-code-form', true);
        $('#otp-sent-to').textContent = otp.email;
        msg('otp-error', '');
        countdown(d.resendIn || 60);
        var c = document.getElementById('pl-code'); c.value = ''; c.focus();
        return true;
      })
      .catch(function (e) {
        if (e.status === 429 && errId === 'otp-error') countdown(60);
        msg(errId, e.message);
        return false;
      })
      .then(function (ok) { btn.textContent = label; if (btn.id !== 'otp-resend') btn.disabled = false; return ok; });
  }

  var emailForm = document.getElementById('otp-email-form');
  if (emailForm) emailForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = emailForm.elements.email.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg('portal-error', 'Please enter a valid email address.'); return; }
    otp.email = email;
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
      if (code.length !== 6) { msg('otp-error', 'Enter the 6-digit code.'); return; }
      msg('otp-error', '');
      btn.disabled = true; btn.textContent = 'Verifying…';
      api('/otp/verify', { method: 'POST', body: JSON.stringify({ email: otp.email, code: code }) })
        .then(function (d) { clearInterval(otp.timer); routeUser(d.user); })
        .catch(function (err) {
          if (err.status === 403) { showExpired(err.data && err.data.subscriptionEnd); return; }
          msg('otp-error', err.message);
        })
        .then(function () { btn.disabled = false; btn.textContent = 'Verify & sign in'; });
    });
    $('#otp-resend').addEventListener('click', function () { sendCode(this, 'Resend code', 'otp-error'); });
    $('#otp-change').addEventListener('click', resetOtp);
  }
  var back = document.getElementById('expired-back');
  if (back) back.addEventListener('click', function () { routeUser(null); });

  /* -------------------------------------------------------- start */
  api('/users/me').then(function (data) { routeUser(data.user || null); })
    .catch(function () { routeUser(null); });
})();