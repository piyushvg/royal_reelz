/* Royal Reelz — trailer videos
   Jo video screen me aati hai wahi chalti hai, baaki pause ho jati hain. */

(function () {
  'use strict';

  window.RR = window.RR || {};

  var players = [];        // { player, ratio, id }
  var apiReady = false;
  var pendingInit = false;
  var current = null;

  /* YouTube link se video id nikalo */
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

  function build() {
    var frames = Array.prototype.slice.call(document.querySelectorAll('.video-frame[data-yt]'));
    if (!frames.length) return;

    if (!apiReady) { pendingInit = true; loadApi(); return; }
    pendingInit = false;
    players = [];

    frames.forEach(function (frame, i) {
      var holder = document.createElement('div');
      holder.id = 'yt-player-' + i;
      frame.innerHTML = '';
      frame.appendChild(holder);

      var entry = { ratio: 0, player: null, ready: false };

      entry.player = new YT.Player(holder.id, {
        videoId: frame.getAttribute('data-yt'),
        playerVars: {
          autoplay: 0,
          mute: 1,            // browsers bina mute ke autoplay block karte hain
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: function () { entry.ready = true; decide(); }
        }
      });

      players.push(entry);
      frame._entry = entry;
    });

    watch(frames);
    bindSound();
  }

  function watch(frames) {
    if (!('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target._entry) e.target._entry.ratio = e.intersectionRatio;
      });
      decide();
    }, { threshold: [0, 0.25, 0.5, 0.65, 0.85, 1] });

    frames.forEach(function (f) { io.observe(f); });
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
      try { p.player.pauseVideo(); } catch (err) { /* ignore */ }
    });

    if (best) {
      try { best.player.playVideo(); } catch (err) { /* ignore */ }
    }
    current = best;
  }

  /* awaaz on/off */
  function bindSound() {
    document.querySelectorAll('.video-sound').forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener('click', function () {
        var card = btn.closest('.video-card');
        var frame = card && card.querySelector('.video-frame');
        var entry = frame && frame._entry;
        if (!entry || !entry.ready) return;

        if (entry.player.isMuted()) {
          players.forEach(function (p) {
            if (p !== entry && p.ready) { try { p.player.mute(); } catch (e) {} }
          });
          document.querySelectorAll('.video-sound').forEach(function (b) {
            b.classList.remove('is-on');
            b.textContent = 'Sound on';
          });
          entry.player.unMute();
          btn.classList.add('is-on');
          btn.textContent = 'Sound off';
        } else {
          entry.player.mute();
          btn.classList.remove('is-on');
          btn.textContent = 'Sound on';
        }
      });
    });
  }

  window.RR.initVideos = function () {
    if (!document.querySelector('.video-frame[data-yt]')) return;
    loadApi();
    build();
  };
})();