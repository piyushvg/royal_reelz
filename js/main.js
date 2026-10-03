/* Royal Reelz — Atelier Cinema
   loader · header · cover slider · page dots · gallery reveal + load more · lightbox */

$(function () {

  /* ---------- loader ---------- */
  $(window).on('load', function () {
    setTimeout(function () { $('.loader').addClass('hide'); }, 450);
  });
  setTimeout(function () { $('.loader').addClass('hide'); }, 4000); // safety net

  /* ---------- mobile nav ---------- */
  var $header = $('.site-header');
  $('.nav-toggle').on('click', function () {
    var open = $header.toggleClass('is-open').hasClass('is-open');
    $(this).attr('aria-expanded', open);
  });
  $('.site-nav .nav-link').on('click', function () {
    $header.removeClass('is-open').find('.nav-toggle').attr('aria-expanded', false);
  });

  /* ---------- header tone + active section ---------- */
  var $sections = $('#cover, #about, #destinations, #gallery');

  function onScroll() {
    var y = $(window).scrollTop();
    var heroEnd = $('#cover').outerHeight() - 90;
    $header.toggleClass('is-light', y > heroEnd);

    var current = 'cover';
    $sections.each(function () {
      if ($(this).offset().top - 140 <= y) current = this.id;
    });
    $('.nav-link').removeClass('is-current')
      .filter('[href="#' + current + '"]').addClass('is-current');
    $('.page-dots .dot').removeClass('is-on')
      .filter('[href="#' + current + '"]').addClass('is-on');
  }
  $(window).on('scroll resize', onScroll);
  onScroll();

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
    function play() { timer = setInterval(function () { go(at + 1); }, 4800); }
    function stop() { clearInterval(timer); }

    $dots.on('click', 'button', function () {
      stop(); go($(this).index()); play();
    });
    play();
  }

  /* ---------- gallery: reveal + load more ---------- */
  var $items = $('.gallery-grid .gallery-item');
  var INITIAL = 5;   // pehli baar kitni images dikhengi
  var STEP    = 10;  // har "Load more" par kitni aur
  var shown   = INITIAL;

  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' })
    : null;

  function paintGallery() {
    $items.each(function (i) {
      var $el = $(this);
      if (i < shown) {
        $el.removeClass('is-hidden');
        if (io) io.observe(this);
        else $el.addClass('is-in');
      } else {
        $el.addClass('is-hidden');
      }
    });
    if (shown >= $items.length) $('.btn-more').addClass('is-done');
  }

  if ($items.length) {
    paintGallery();

    $('.btn-more').on('click', function () {
      var firstNew = shown;
      shown = Math.min(shown + STEP, $items.length);
      paintGallery();
      var $target = $items.eq(firstNew);
      if ($target.length) {
        $('html, body').animate({ scrollTop: $target.offset().top - 170 }, 650);
      }
    });
  }

  /* ---------- lightbox (sirf visible images) ---------- */
  var $box  = $('.lightbox');
  var $boxI = $box.find('img');
  var list  = [];
  var cur   = 0;

  function show(i) {
    cur = (i + list.length) % list.length;
    $boxI.attr('src', list[cur]);
  }

  $('.gallery-grid').on('click', '.gallery-item', function (e) {
    e.preventDefault();
    var $visible = $items.not('.is-hidden');
    list = $visible.map(function () { return $(this).attr('href'); }).get();
    show($visible.index(this));
    $box.prop('hidden', false);
    $('body').css('overflow', 'hidden');
  });

  function close() {
    $box.prop('hidden', true);
    $boxI.attr('src', '');
    $('body').css('overflow', '');
  }

  $('.lightbox-close').on('click', close);
  $('.lightbox-prev').on('click', function () { show(cur - 1); });
  $('.lightbox-next').on('click', function () { show(cur + 1); });
  $box.on('click', function (e) { if (e.target === this) close(); });

  $(document).on('keydown', function (e) {
    if ($box.prop('hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });

});