/* Royal Reelz — Client Login portal
   Customer login karke sirf apni photos / videos dekhta hai.
   Payload ke cookie-login (/api/users/login) par chalta hai, isliye ye page
   usi server se khulna chahiye jahan CMS chal raha hai. */
(function () {
  'use strict';

  var API = window.location.origin + '/api';
  var state = { photos: [], videos: [] };

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
          var msg = (data.errors && data.errors[0] && data.errors[0].message) || data.message || 'Something went wrong.';
          var err = new Error(msg);
          err.status = res.status;
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
    show('portal-staff', which === 'staff');
    show('portal-area', which === 'area');
  }

  function setLede(text) { var el = $('#portal-lede'); if (el) el.textContent = text; }

  function routeUser(user) {
    if (!user) {
      setLede('Sign in to view your own wedding photos and videos.');
      showOnly('login');
      return;
    }
    if (user.role !== 'customer') {
      setLede('You are signed in.');
      showOnly('staff');
      return;
    }
    setLede('Your celebration, all in one place.');
    $('#portal-hello').textContent = 'Welcome, ' + (user.name || user.email);
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
      if (err.status === 401 || err.status === 403) { routeUser(null); return; }
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

  var form = document.getElementById('portal-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('#portal-error');
      var btn = $('#portal-submit');
      err.hidden = true;
      var email = form.elements.email.value.trim();
      var password = form.elements.password.value;
      if (!email || !password) {
        err.textContent = 'Please enter your email and password.';
        err.hidden = false;
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Signing in…';
      api('/users/login', { method: 'POST', body: JSON.stringify({ email: email, password: password }) })
        .then(function (data) {
          form.reset();
          routeUser(data.user);
        })
        .catch(function (error) {
          err.textContent = error.status === 401 || error.status === 400
            ? 'Email or password is incorrect.'
            : error.message;
          err.hidden = false;
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = 'Sign in';
        });
    });
  }

  /* -------------------------------------------------------- start */
  api('/users/me').then(function (data) { routeUser(data.user || null); })
    .catch(function () { routeUser(null); });
})();