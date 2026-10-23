/* Royal Reelz — Atelier Cinema
   loader · header · cover slider · page dots · gallery reveal · tabs · lightbox */

function initRoyalReelz() {

  var isInner = $('body').hasClass('inner');

  /* ---------- loader ---------- */
  setTimeout(function () { $('.loader').addClass('hide'); }, 250);
  $(window).on('load', function () { $('.loader').addClass('hide'); });

  // page change par loader wapas
  $(document).on('click', 'a[href]', function (e) {
    var href = $(this).attr('href') || '';
    if (e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if ($(this).attr('target') === '_blank') return;
    if (/^(#|mailto:|tel:|https?:)/i.test(href)) return;
    if (!/\.html(\?|#|$)/i.test(href)) return;
    $('.loader').removeClass('hide').addClass('is-leaving');
  });
  $(window).on('pageshow', function (ev) {
    if (ev.originalEvent && ev.originalEvent.persisted) {
      $('.loader').removeClass('is-leaving').addClass('hide');
    }
  });

  /* ---------- mobile nav ---------- */
  var $header = $('.site-header');
  $('.nav-toggle').on('click', function () {
    var open = $header.toggleClass('is-open').hasClass('is-open');
    $(this).attr('aria-expanded', open);
  });
  $('.site-nav .nav-link').on('click', function () {
    $header.removeClass('is-open').find('.nav-toggle').attr('aria-expanded', false);
  });

  /* ---------- header tone + active section (home only) ---------- */
  if (!isInner) {
    var $sections = $('#cover, #about, #destinations, #gallery');

    function onScroll() {
      var y = $(window).scrollTop();
      var heroEnd = $('#cover').outerHeight() - 90;
      $header.toggleClass('is-light', y > heroEnd);

      var current = 'cover';
      $sections.each(function () {
        if ($(this).offset().top - 140 <= y) current = this.id;
      });
      $('.page-dots .dot').removeClass('is-on')
        .filter('[href="#' + current + '"]').addClass('is-on');
      $('.site-nav .nav-link[href^="#"]').removeClass('is-current')
        .filter('[href="#' + current + '"]').addClass('is-current');
    }
    $(window).on('scroll resize', onScroll);
    onScroll();
  }

  /* ---------- cover slider ---------- */
  var $slides = $('.hero-slide');
  if ($slides.length) {
    var $dots = $('.hero-dots');
    var at = 0;
    var timer;

    $slides.each(function (i) {
      $('<button type="button" aria-label="Photo ' + (i + 1) + '"></button>')
        .toggleClass('is-on', i === 0)
        .appendTo($dots);
    });

    function go(i) {
      at = (i + $slides.length) % $slides.length;
      $slides.removeClass('is-on').eq(at).addClass('is-on');
      $dots.children().removeClass('is-on').eq(at).addClass('is-on');
    }
    function play() { timer = setInterval(function () { go(at + 1); }, 5000); }
    function stop() { clearInterval(timer); }

    $dots.on('click', 'button', function () { stop(); go($(this).index()); play(); });
    play();
  }

  /* ---------- gallery reveal ---------- */
  var $items = $('.gallery-grid .gallery-item');
  if ($items.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
      $items.each(function () { io.observe(this); });
      // jo items pehle se screen me hain unhe turant dikhao (observer miss ho to bhi)
      setTimeout(function () {
        $items.each(function () {
          var r = this.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) this.classList.add('is-in');
        });
      }, 400);
    } else {
      $items.addClass('is-in');
    }
  }

  /* ---------- why-choose-us tabs ---------- */
  $(document).off('click.rrtabs').on('click.rrtabs', '.tab-btn', function () {
    var key = String($(this).attr('data-tab'));
    var $bar = $(this).closest('.tabs');
    if (!$bar.length) $bar = $(document);
    $bar.find('.tab-btn').removeClass('is-on');
    $(this).addClass('is-on');
    $bar.find('.tab-panel').removeClass('is-on')
      .filter('[data-panel="' + key + '"]').addClass('is-on');
  });

  /* ---------- lightbox ----------
     Har click par list DOM se banti hai (CMS se aayi images bhi chalti hain),
     events namespaced hain, isliye initUI dobara chale tab bhi double-bind nahi hota. */
  var $box  = $('.lightbox');
  var $boxI = $box.find('img');
  var list  = [];
  var cur   = 0;

  function show(i) {
    if (!list.length) return;
    cur = (i + list.length) % list.length;
    $boxI.attr('src', list[cur]);
  }
  function close() {
    $box.prop('hidden', true);
    $boxI.attr('src', '');
    $('body').css('overflow', '');
  }

  $(document).off('.rrlb');
  $('.lightbox-close, .lightbox-prev, .lightbox-next').off('.rrlb');
  $box.off('.rrlb');

  $(document).on('click.rrlb', '.gallery-grid .gallery-item', function (e) {
    if (!$box.length) return;            // is page par lightbox nahi hai
    e.preventDefault();
    var $all = $('.gallery-grid .gallery-item');
    list = $all.map(function () { return $(this).attr('href'); }).get();
    show($all.index(this));
    $box.prop('hidden', false);
    $('body').css('overflow', 'hidden');
  });

  $('.lightbox-close').on('click.rrlb', close);
  $('.lightbox-prev').on('click.rrlb', function (e) { e.stopPropagation(); show(cur - 1); });
  $('.lightbox-next').on('click.rrlb', function (e) { e.stopPropagation(); show(cur + 1); });
  $box.on('click.rrlb', function (e) { if (e.target === this) close(); });

  // mobile swipe
  var touchX = null;
  $box.on('touchstart.rrlb', function (e) { touchX = e.originalEvent.touches[0].clientX; });
  $box.on('touchend.rrlb', function (e) {
    if (touchX == null) return;
    var dx = e.originalEvent.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  $(document).on('keydown.rrlb', function (e) {
    if ($box.prop('hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });

  if (window.RR && typeof window.RR.initVideos === 'function') window.RR.initVideos();

}

/* CMS data pehle aata hai, phir UI init hota hai.
   cms.js na ho to turant init kar do. */
window.RR = window.RR || {};
window.RR.initUI = initRoyalReelz;
$(function () {
  if (!window.RR.cmsPending) initRoyalReelz();
});