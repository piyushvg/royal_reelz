/* Royal Reelz — trailer videos and the client Videos tab
   Jo video screen me aati hai wahi chalti hai, baaki pause ho jati hain. */

(function () {
  'use strict';

  window.RR = window.RR || {};

  var players = [];
  var apiReady = false;
  var pendingInit = false;
  var current = null;
  var observer = null;

  function videoId(url) {
    if (!url) return '';
    var m = String(url).match(
      /(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/v\/)([A-Za-z0-9_-]{6,})/
    );
    return m ? m[1] : '';
  }
  window.RR.videoId = videoId;

  function loadApi() {
    if (window.YT && window.YT.Player) { apiReady = true; return; }
    if (document.getElementById('yt-api')) return;
    var s = document.createElement('script');
    s.id = 'yt-api';
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }

  window.onYouTubeIframeAPIReady = function () {
    apiReady = true;
    if (pendingInit) build();
  };

  function frames() {
    return Array.prototype.slice.call(
      document.querySelectorAll('.video-frame[data-yt], .video-frame[data-file]')
    );
  }

  function safe(fn) {
    try { fn(); } catch (err) { /* player not ready */ }
  }

  function build() {
    var list = frames();
    if (!list.length) return;

    var needsYt = list.some(function (frame) { return frame.hasAttribute('data-yt'); });
    if (needsYt && !apiReady) { pendingInit = true; loadApi(); return; }
    pendingInit = false;

    if (observer) { observer.disconnect(); observer = null; }
    players.forEach(function (p) {
      safe(function () { if (p.destroy) p.destroy(); });
    });
    players = [];
    current = null;

    list.forEach(function (frame, i) {
      var entry = { ratio: 0, ready: false, play: function () {}, pause: function () {}, muted: function () { return true; }, mute: function () {}, unmute: function () {}, destroy: null };
      frame.innerHTML = '';

      if (frame.hasAttribute('data-file')) {
        var video = document.createElement('video');
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.controls = true;
        video.preload = 'metadata';
        video.src = frame.getAttribute('data-file');
        frame.appendChild(video);
        entry.play = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); };
        entry.pause = function () { video.pause(); };
        entry.muted = function () { return video.muted; };
        entry.mute = function () { video.muted = true; };
        entry.unmute = function () { video.muted = false; };
        video.addEventListener('loadeddata', function () {
          entry.ready = true;
          decide();
        });
      } else {
        var holder = document.createElement('div');
        holder.id = 'yt-player-' + i + '-' + Date.now();
        frame.appendChild(holder);
        var player = new YT.Player(holder.id, {
          videoId: frame.getAttribute('data-yt'),
          playerVars: {
            autoplay: 0,
            mute: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1
          },
          events: {
            onReady: function () { entry.ready = true; decide(); }
          }
        });
        entry.play = function () { player.playVideo(); };
        entry.pause = function () { player.pauseVideo(); };
        entry.muted = function () { return player.isMuted(); };
        entry.mute = function () { player.mute(); };
        entry.unmute = function () { player.unMute(); };
        entry.destroy = function () { player.destroy(); };
      }

      players.push(entry);
      frame._entry = entry;
    });

    watch(list);
    bindSound();
  }

  function watch(list) {
    if (!('IntersectionObserver' in window)) return;

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target._entry) e.target._entry.ratio = e.intersectionRatio;
      });
      decide();
    }, { threshold: [0, 0.25, 0.5, 0.65, 0.85, 1] });

    list.forEach(function (f) { observer.observe(f); });
  }

  function decide() {
    var best = null;
    players.forEach(function (p) {
      if (!p.ready) return;
      if (p.ratio >= 0.6 && (!best || p.ratio > best.ratio)) best = p;
    });

    if (best === current) return;

    players.forEach(function (p) {
      if (!p.ready || p === best) return;
      safe(function () { p.pause(); });
    });

    if (best) safe(function () { best.play(); });
    current = best;
  }

  function bindSound() {
    document.querySelectorAll('.video-sound').forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener('click', function () {
        var card = btn.closest('.video-card');
        var frame = card && card.querySelector('.video-frame');
        var entry = frame && frame._entry;
        if (!entry || !entry.ready) return;

        if (entry.muted()) {
          players.forEach(function (p) {
            if (p !== entry && p.ready) safe(function () { p.mute(); });
          });
          document.querySelectorAll('.video-sound').forEach(function (b) {
            b.classList.remove('is-on');
            b.setAttribute('aria-label', 'Sound on');
          });
          safe(function () { entry.unmute(); });
          btn.classList.add('is-on');
          btn.setAttribute('aria-label', 'Sound off');
        } else {
          safe(function () { entry.mute(); });
          btn.classList.remove('is-on');
          btn.setAttribute('aria-label', 'Sound on');
        }
      });
    });
  }

  window.RR.pauseVideos = function () {
    players.forEach(function (p) { safe(function () { p.pause(); }); });
    current = null;
  };

  window.RR.initVideos = function () {
    if (!frames().length) return;
    var needsYt = frames().some(function (frame) { return frame.hasAttribute('data-yt'); });
    if (needsYt) loadApi();
    build();
  };
})();
