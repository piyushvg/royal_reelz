$(function () {
  function hideLoader() {
    $(".loader").addClass("hide");
  }

  if (/noloader/.test(window.location.search)) {
    hideLoader();
    $("html").css("scroll-behavior", "auto");
  } else {
    $(window).on("load", function () {
      setTimeout(hideLoader, 650);
    });
    setTimeout(hideLoader, 2000);
  }

  var $header = $(".site-header");
  var $toggle = $(".nav-toggle");

  function closeMenu() {
    $header.removeClass("is-open");
    $toggle.attr({ "aria-expanded": "false", "aria-label": "Open menu" });
  }

  $toggle.on("click", function () {
    var open = !$header.hasClass("is-open");
    $header.toggleClass("is-open", open);
    $toggle.attr({
      "aria-expanded": open ? "true" : "false",
      "aria-label": open ? "Close menu" : "Open menu"
    });
  });

  function goTo(href) {
    var $target = $(href);
    if (!$target.length) return;
    var top = href === "#cover" ? 0 : $target.offset().top;
    $("html, body").stop(true).animate({ scrollTop: top }, 700);
  }

  $(document).on("click", ".nav-link, .brand, .scroll-hint, .page-dots .dot", function (e) {
    var href = $(this).attr("href");
    if (!href || href.charAt(0) !== "#") return;
    e.preventDefault();
    closeMenu();
    goTo(href);
  });

  var $links = $(".nav-link");
  var sections = ["#cover", "#about", "#destinations", "#gallery"];

  function setCurrent() {
    var y = $(window).scrollTop();
    var aboutTop = $("#about").offset() ? $("#about").offset().top : $(window).height();
    $header.toggleClass("is-light", y > aboutTop - 80);
    var mark = y + 120;
    var current = "#cover";
    sections.forEach(function (id) {
      var $el = $(id);
      if ($el.length && $el.offset().top <= mark) current = id;
    });
    $links.removeClass("is-current");
    $links.filter('[href="' + current + '"]').addClass("is-current");
    $(".page-dots .dot").removeClass("is-on");
    $(".page-dots .dot").filter('[href="' + current + '"]').addClass("is-on");
  }

  if (window.location.hash && $(window.location.hash).length) {
    $(window).scrollTop($(window.location.hash).offset().top);
  }

  $(window).on("scroll", setCurrent);
  $(window).on("resize", function () {
    if ($(window).width() > 900) closeMenu();
  });
  setCurrent();

  var $slides = $(".hero-slide");
  var $dots = $(".hero-dots");
  var slide = 0;
  var timer;

  $slides.each(function (i) {
    $dots.append(
      $("<button type='button' aria-label='Photo " + (i + 1) + "'></button>").toggleClass("is-on", i === 0)
    );
  });

  function showSlide(n) {
    slide = (n + $slides.length) % $slides.length;
    $slides.removeClass("is-on").eq(slide).addClass("is-on");
    $dots.children().removeClass("is-on").eq(slide).addClass("is-on");
  }

  function startBanner() {
    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(slide + 1);
    }, 3000);
  }

  $dots.on("click", "button", function () {
    showSlide($(this).index());
    startBanner();
  });

  $(".hero-frame").on("mouseenter", function () {
    clearInterval(timer);
  }).on("mouseleave", startBanner);

  if ($slides.length) startBanner();

  var $box = $(".lightbox");
  var $boxImg = $box.find("img");
  var $items = $(".gallery-item");
  var gIndex = 0;

  function openGallery(i) {
    gIndex = i;
    $boxImg.attr("src", $items.eq(gIndex).attr("href"));
    $box.removeAttr("hidden");
  }

  $items.on("click", function (e) {
    e.preventDefault();
    openGallery($items.index(this));
  });

  $box.find(".lightbox-close").on("click", function () {
    $box.attr("hidden", true);
    $boxImg.attr("src", "");
  });

  $box.find(".lightbox-prev").on("click", function () {
    openGallery((gIndex - 1 + $items.length) % $items.length);
  });

  $box.find(".lightbox-next").on("click", function () {
    openGallery((gIndex + 1) % $items.length);
  });

  $(document).on("keydown", function (e) {
    if ($box.is("[hidden]")) return;
    if (e.key === "Escape") $box.find(".lightbox-close").click();
    if (e.key === "ArrowLeft") $box.find(".lightbox-prev").click();
    if (e.key === "ArrowRight") $box.find(".lightbox-next").click();
  });
});
$(function () {
  var $items = $('.gallery-grid .gallery-item');
  var INITIAL = 5;   // pehli baar kitni dikhengi
  var STEP    = 10;  // har click par kitni aur
  var shown   = INITIAL;

  if (!$items.length) return;

  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    : null;

  function paint() {
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

  paint();

  $('.btn-more').on('click', function () {
    var first = shown;
    shown = Math.min(shown + STEP, $items.length);
    paint();
    // naye batch ki pehli image tak halka sa scroll
    var $target = $items.eq(first);
    if ($target.length) {
      $('html, body').animate({
        scrollTop: $target.offset().top - 160
      }, 700, 'swing');
    }
  });
});