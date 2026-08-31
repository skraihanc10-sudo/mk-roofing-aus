/* Small behaviours only: the pages themselves are static HTML. */

(function () {
  'use strict';

  // ---------------------------------------------------------- mobile drawer
  var drawer = document.getElementById('drawer');
  var toggle = document.querySelector('.nav-toggle');
  var closeBtn = document.querySelector('.drawer-close');

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) toggle.addEventListener('click', function () { setDrawer(true); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false); });
  if (drawer) {
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setDrawer(false);
  });

  // ------------------------------------------------------------------- faq
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  // ---------------------------------------------------------- back to top
  var top = document.getElementById('to-top');
  if (top) {
    var onScroll = function () {
      top.classList.toggle('is-on', window.scrollY > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ----------------------------------------------------------- quote forms
  // There is more than one on a page (hero, "Book Now", contact), so wire them
  // all rather than a single id.
  //
  // With no backend, each form hands the enquiry to the visitor's mail client.
  // Set FORM_ENDPOINT to a Formspree/Netlify/Web3Forms URL and they will POST
  // instead - see README.
  var FORM_ENDPOINT = '';
  var MAILTO = 'mkroofing2023@gmail.com';

  document.querySelectorAll('form[id$="form"]').forEach(function (form) {
    var status = document.getElementById('status-' + form.id);

    function say(msg, ok) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status ' + (ok ? 'is-ok' : 'is-err');
      status.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });

      if (!data.name || !data.phone) {
        say('Please add your name and a phone number so we can call you back.', false);
        return;
      }

      var btn = form.querySelector('button[type="submit"]');

      if (FORM_ENDPOINT) {
        var label = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending…';

        fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        })
          .then(function (r) {
            if (!r.ok) throw new Error('Request failed');
            form.reset();
            say('Thanks — we have your request and will get back to you shortly.', true);
          })
          .catch(function () {
            say('Something went wrong sending that. Please call us instead.', false);
          })
          .finally(function () {
            btn.disabled = false;
            btn.textContent = label;
          });
        return;
      }

      var body = [
        'Name: ' + data.name,
        'Phone: ' + data.phone,
        'Email: ' + (data.email || '-'),
        'Address: ' + (data.address || '-'),
        'Service: ' + (data.service || 'Not specified'),
        '',
        data.detail || '',
      ].join('\n');

      window.location.href = 'mailto:' + MAILTO
        + '?subject=' + encodeURIComponent('Quote request — ' + data.name)
        + '&body=' + encodeURIComponent(body);

      say('Opening your email app with the request ready to send.', true);
    });
  });
})();
