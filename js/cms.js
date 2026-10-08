/* Royal Reelz — CMS bridge
   Payload ka /api/frontend data laa kar maujooda HTML me bhar deta hai.
   Design/markup waisa hi rehta hai, sirf content CMS se aata hai. */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     SETUP: yahan apne Payload server ka URL daalo.
     Local:      http://localhost:3000
     Production: https://cms.royalreelz.com  (jo bhi domain ho)
     --------------------------------------------------------------- */
  var CMS_URL = 'http://localhost:3000';

  var API = CMS_URL.replace(/\/$/, '') + '/api/frontend';
  var WREATH = 'images/wreath.png';
  var PREVIEW_COUNT = 8; // home page par kitni gallery images

  // main.js ko batao ki pehle data aane do
  window.RR = window.RR || {};
  window.RR.cmsPending = true;

  /* ---------------------------------------------------- tiny helpers */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function text(sel, value, root) {
    var el = $(sel, root);
    if (el && value) el.textContent = value;
  }
  function attr(sel, name, value, root) {
    var el = $(sel, root);
    if (el && value) el.setAttribute(name, value);
  }
  function html(sel, markup, root) {
    var el = $(sel, root);
    if (el && markup) el.innerHTML = markup;
  }
  function list(items, fn) { return (items || []).map(fn).join(''); }

  var SOCIAL_SVG = {
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.5-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3H10v8h3.5z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.4" d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/><circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="16.8" cy="7.2" r="1.1" fill="currentColor"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>'
  };
  var SOCIAL_LABEL = { facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube' };

  function socialMarkup(socials, extraClass) {
    var out = '';
    ['facebook', 'instagram', 'youtube'].forEach(function (key) {
      var url = socials && socials[key];
      if (!url) return;
      out += '<li><a href="' + esc(url) + '" target="_blank" rel="noopener" aria-label="' +
        SOCIAL_LABEL[key] + '">' + SOCIAL_SVG[key] + '</a></li>';
    });
    var ul = $('.socials' + (extraClass || ''));
    if (ul && out) ul.innerHTML = out;
  }

  /* ------------------------------------------------- shared shell */
  function renderShell(d) {
    var site = d.site || {};
    var isHome = !!$('#cover');

    if (isHome && site.title) document.title = site.title;

    attr('.loader-logo', 'src', site.logoWhite);
    text('.loader-kicker', site.loaderKicker);
    attr('.site-header .logo-dark', 'src', site.logoWhite);
    attr('.site-header .logo-light', 'src', site.logoInk);

    // header menu
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if ((site.nav || []).length) {
      html('.site-nav', list(site.nav, function (item) {
        var href = item.href || '';
        if (isHome) {
          if (/index\.html$/i.test(href)) href = '#cover';
          else if (/#destinations$/i.test(href)) href = '#destinations';
        }
        var target = (item.href || '').split('#')[0].toLowerCase();
        var current = target && target === here && !/^#/.test(href);
        if (isHome && href === '#cover') current = true;
        return '<a href="' + esc(href) + '" class="nav-link' + (current ? ' is-current' : '') + '">' +
          esc(item.label) + '</a>';
      }));
    }

    // footer
    attr('.foot-logo', 'src', site.logoInk);
    text('.foot-brand .brand-sub', site.tagline);
    if ((site.nav || []).length) {
      html('.foot-nav', list(site.nav, function (item) {
        return '<a href="' + esc(item.href) + '">' + esc(item.label) + '</a>';
      }));
    }
    if ((site.footerPlaces || []).length) {
      html('.foot-places', list(site.footerPlaces, function (name) {
        return '<li>' + esc(name) + '</li>';
      }));
    }
    socialMarkup(site.socials);

    var contact = d.contact || {};
    var footContact = $('.foot-contact');
    if (footContact && (contact.address || contact.email || contact.phone)) {
      var bits = [];
      if (contact.address) bits.push(esc(contact.address));
      if (contact.email) bits.push('<a href="mailto:' + esc(contact.email) + '">' + esc(contact.email) + '</a>');
      if (contact.phone) {
        bits.push('<a href="tel:' + esc(contact.phone.replace(/[^\d+]/g, '')) + '">' + esc(contact.phone) + '</a>');
      }
      footContact.innerHTML = bits.join('<span class="foot-sep">&#10070;</span>');
    }
    text('.foot-base', site.footer);

    var credit = site.credit || {};
    var creditEl = $('.foot-credit');
    if (creditEl && credit.name) {
      creditEl.innerHTML = esc(credit.text || 'Designed and Powered by') + ' ' +
        '<a href="' + esc(credit.url || '#') + '" target="_blank" rel="noopener">' +
        esc(credit.name) + '</a>';
    }

    // WhatsApp
    var wa = site.whatsapp || {};
    var waEl = $('.wa-float');
    if (waEl && wa.number) {
      waEl.setAttribute('href', 'https://wa.me/' + wa.number.replace(/[^\d]/g, '') +
        (wa.message ? '?text=' + encodeURIComponent(wa.message) : ''));
    }
  }

  /* ---------------------------------------------------- home page */
  function renderHome(d) {
    if (!$('#cover')) return;
    var site = d.site || {};

    // cover slider
    if ((d.slides || []).length) {
      html('.hero-slides', list(d.slides, function (s, i) {
        return '<figure class="hero-slide' + (i === 0 ? ' is-on' : '') + '">' +
          '<img src="' + esc(s.src) + '" alt="' + esc(s.alt) + '"></figure>';
      }));
    }
    text('.hero-edition', site.edition);
    text('.scroll-hint span', site.scrollHint);

    // about block
    var about = d.about || {};
    text('.about-title', about.title);
    if ((about.paragraphs || []).length) {
      html('.about-copy', list(about.paragraphs, function (p) {
        return '<p>' + esc(p) + '</p>';
      }));
    }
    var awardsTitle = $('.awards-title');
    if (awardsTitle && about.awardsTitle) {
      awardsTitle.innerHTML = '<span>&#10070;</span> ' + esc(about.awardsTitle) + ' <span>&#10070;</span>';
    }
    var pressTitle = $('.press-title');
    if (pressTitle && about.featuredLabel) {
      pressTitle.innerHTML = '<span>&#10070;</span> ' + esc(about.featuredLabel) +
        ' <em>' + esc(about.featuredIn || '') + '</em> <span>&#10070;</span>';
    }

    if ((d.awards || []).length) {
      html('.award-list', list(d.awards, function (a) {
        return '<li><div class="medal">' +
          '<img src="' + WREATH + '" alt="" class="wreath">' +
          '<span class="medal-copy' + (a.longName ? ' is-long' : '') + '">' +
          '<strong>' + esc(a.line1) + '</strong>' + esc(a.line2 || '') +
          (a.note ? '<small>' + esc(a.note) + '</small>' : '') +
          '</span></div><em>' + esc(a.years) + '</em></li>';
      }));
    }
    if ((d.press || []).length) {
      html('.press-logos', list(d.press, function (name) { return '<li>' + esc(name) + '</li>'; }));
    }

    // destinations
    var dest = d.destinations || {};
    var destSec = $('#destinations');
    if (destSec) {
      text('.eyebrow', dest.eyebrow, destSec);
      var title = $('.display', destSec);
      if (title && dest.titleGold) {
        title.innerHTML = '<span class="gold">' + esc(dest.titleGold) + '</span><span>' +
          esc(dest.titleRest || '') + '</span>';
      }
      text('.lede', dest.lede, destSec);
      attr('.dest-bg img', 'src', dest.background, destSec);

      var heads = $$('.atlas-head h3', destSec);
      if (heads[0] && dest.internationalTitle) heads[0].textContent = dest.internationalTitle;
      if (heads[1] && dest.indiaTitle) heads[1].textContent = dest.indiaTitle;

      var grids = $$('.atlas-grid', destSec);
      var places = d.places || {};

      // Har card CMS ke fields se banta hai: naam, sub line (location), aur venues list.
      // Region (International / India) se farak nahi padta - jo fields bhare hain wahi dikhte hain.
      function placeCard(p) {
        var img = p.icon ? '<img class="place-mark" src="' + esc(p.icon) + '" alt="">' : '';
        var sub = p.location ? '<p>' + esc(p.location) + '</p>' : '';
        var venues = (p.venues || []).length
          ? '<ul>' + list(p.venues, function (v) { return '<li>' + esc(v) + '</li>'; }) + '</ul>'
          : '';
        return '<article>' + img + '<h4>' + esc(p.name) + '</h4>' + sub + venues + '</article>';
      }

      // CMS me koi bhi place ho to dono grids CMS se hi bharo (khaali region = khaali grid).
      var hasPlaces = (places.international || []).length || (places.india || []).length;
      if (hasPlaces) {
        if (grids[0]) grids[0].innerHTML = list(places.international, placeCard);
        if (grids[1]) grids[1].innerHTML = list(places.india, placeCard);
      }
    }

    // gallery preview
    var gal = d.gallery || {};
    var gallerySec = $('#gallery');
    if (gallerySec) {
      text('.eyebrow', gal.eyebrow, gallerySec);
      var gTitle = $('.display', gallerySec);
      if (gTitle && gal.titleGold) {
        gTitle.innerHTML = '<span class="gold">' + esc(gal.titleGold) + '</span><span>' +
          esc(gal.titleRest || '') + '</span>';
      }
      text('.lede', gal.lede, gallerySec);
      text('.btn-more span', gal.loadMore, gallerySec);

      if ((d.photos || []).length) {
        html('.gallery-grid', list(d.photos.slice(0, PREVIEW_COUNT), photoItem), gallerySec);
      }
    }
  }

  function photoItem(p) {
    return '<a href="' + esc(p.src) + '" class="gallery-item">' +
      '<img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '" loading="lazy"></a>';
  }

  /* ------------------------------------------------- gallery page */
  function renderGalleryPage(d) {
    var sec = $('.gallery-full');
    if (!sec) return;
    var gal = d.gallery || {};
    var headEl = $('.page-head');
    if (headEl) {
      text('.eyebrow', gal.eyebrow, headEl);
      var t = $('.display', headEl);
      if (t && gal.titleGold) {
        t.innerHTML = '<span class="gold">' + esc(gal.titleGold) + '</span><span>' +
          esc(gal.titleRest || '') + '</span>';
      }
      text('.lede', gal.lede, headEl);
    }
    if ((d.photos || []).length) {
      html('.gallery-grid', list(d.photos, photoItem), sec);
    }
  }

  /* --------------------------------------------------- about page */
  function renderAboutPage(d) {
    if (!$('.why')) return;
    var about = d.about || {};

    var headEl = $('.page-head');
    if (headEl) {
      text('.eyebrow', about.pageEyebrow, headEl);
      var t = $('.display', headEl);
      if (t && about.pageTitleGold) {
        t.innerHTML = '<span class="gold">' + esc(about.pageTitleGold) + '</span><span>' +
          esc(about.pageTitleRest || '') + '</span>';
      }
      text('.lede', about.pageLede, headEl);
    }

    if ((about.storyParagraphs || []).length) {
      html('.sheet .about-copy', list(about.storyParagraphs, function (p) {
        return '<p>' + esc(p) + '</p>';
      }));
    }

    text('.why .section-title', about.whyTitle);
    text('.why-lede', about.whyLede);

    if ((d.services || []).length) {
      html('.tab-bar', list(d.services, function (s, i) {
        return '<button class="tab-btn' + (i === 0 ? ' is-on' : '') +
          '" type="button" data-tab="t' + i + '">' + esc(s.title) + '</button>';
      }));
      html('.tab-body', list(d.services, function (s, i) {
        return '<div class="tab-panel' + (i === 0 ? ' is-on' : '') + '" data-panel="t' + i + '">' +
          '<h3 class="panel-title">' + esc(s.title) + '</h3><p>' + esc(s.body) + '</p></div>';
      }));
    }

    text('.team .section-title', about.teamTitle);
    text('.team .lede', about.teamLede);
    text('.team .btn-solid', about.teamCta);

    if ((d.team || []).length) {
      html('.team-grid', list(d.team, function (m) {
        return '<article class="team-card">' +
          '<div class="team-shot"><img src="' + esc(m.photo) + '" alt="' + esc(m.name) +
          '" loading="lazy"></div>' +
          '<h3>' + esc(m.name) + '</h3><p>' + esc(m.role) + '</p></article>';
      }));
    }
  }

  /* -------------------------------------------------- videos page */
  function renderVideosPage(d) {
    var grid = $('.video-grid');
    if (!grid) return;
    if (!(d.videos || []).length) return;

    grid.innerHTML = list(d.videos, function (v) {
      var id = (window.RR && window.RR.videoId) ? window.RR.videoId(v.url) : '';
      if (!id) return '';
      return '<article class="video-card">' +
        '<div class="video-frame" data-yt="' + esc(id) + '"></div>' +
        (v.caption ? '<p class="video-cap">' + esc(v.caption) + '</p>' : '') +
        '<div class="video-meta">' +
        '<h2 class="video-title">' + esc(v.title) + '</h2>' +
        '<button class="video-sound" type="button">Sound on</button>' +
        '</div></article>';
    });
  }

  /* ------------------------------------------------- contact page */
  function renderContactPage(d) {
    var frame = $('.contact-frame');
    if (!frame) return;
    var c = d.contact || {};

    var headEl = $('.page-head');
    if (headEl) {
      text('.eyebrow', c.eyebrow, headEl);
      var t = $('.display', headEl);
      if (t && c.titleGold) {
        t.innerHTML = '<span class="gold">' + esc(c.titleGold) + '</span><span>' +
          esc(c.titleRest || '') + '</span>';
      }
      text('.lede', c.lede, headEl);
    }

    text('.contact-info .section-title', c.infoTitle);
    text('.contact-form-wrap .section-title', c.formTitle);

    var rows = $$('.info-list li');
    if (rows[0] && c.address) { var p0 = $('p', rows[0]); if (p0) p0.textContent = c.address; }
    if (rows[1] && c.email) {
      var p1 = $('p', rows[1]);
      if (p1) p1.innerHTML = '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a>';
    }
    if (rows[2] && c.phone) {
      var p2 = $('p', rows[2]);
      if (p2) {
        p2.innerHTML = '<a href="tel:' + esc(c.phone.replace(/[^\d+]/g, '')) + '">' +
          esc(c.phone) + '</a>';
      }
    }

    socialMarkup((d.site || {}).socials, '.socials-ink');
    attr('.contact-form', 'action', c.formAction);
  }

  /* ------------------------------------------------------- bootstrap */
  function start() {
    fetch(API, { credentials: 'omit' })
      .then(function (r) {
        if (!r.ok) throw new Error('CMS ' + r.status);
        return r.json();
      })
      .then(function (d) {
        renderShell(d);
        renderHome(d);
        renderGalleryPage(d);
        renderAboutPage(d);
        renderVideosPage(d);
        renderContactPage(d);
      })
      .catch(function (err) {
        // CMS band ho to page apne static content ke saath chalta rahega
        console.warn('[Royal Reelz] CMS se data nahi mila, static content dikh raha hai.', err);
      })
      .then(function () {
        window.RR.cmsPending = false;
        if (typeof window.RR.initUI === 'function') window.RR.initUI();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();