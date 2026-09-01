/* Admin panel.

   Everything is edited against one in-memory copy of content/data.json and
   sent back whole on save; the server validates, writes, and rebuilds the
   static site. Photos are the exception - they publish the moment you pick
   one, because there is nothing to type alongside them.
*/

(function () {
  'use strict';

  var $ = function (sel) { return document.querySelector(sel); };
  var data = null;
  var dirty = false;

  // ------------------------------------------------------------------ helpers
  function api(url, opts) {
    opts = opts || {};
    var init = { method: opts.method || 'GET', credentials: 'same-origin' };
    if (opts.body !== undefined) {
      init.headers = { 'Content-Type': 'application/json' };
      init.body = JSON.stringify(opts.body);
    }
    return fetch(url, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) {
        if (!r.ok) throw new Error(body.error || ('Request failed (' + r.status + ')'));
        return body;
      });
    });
  }

  var toastTimer;
  function toast(msg, kind) {
    var el = $('#toast');
    el.textContent = msg;
    el.className = 'toast' + (kind ? ' is-' + kind : '');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, kind === 'err' ? 7000 : 3000);
  }

  function markDirty() {
    dirty = true;
    $('#dirty-flag').hidden = false;
  }

  function clearDirty() {
    dirty = false;
    $('#dirty-flag').hidden = true;
  }

  window.addEventListener('beforeunload', function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  // A labelled input bound straight to obj[key].
  function field(obj, key, label, opts) {
    opts = opts || {};
    var wrap = el('div', 'field' + (opts.wide ? ' wide' : ''));
    var id = 'f-' + Math.random().toString(36).slice(2);
    var lab = el('label', null, label);
    lab.htmlFor = id;
    wrap.appendChild(lab);

    var input = document.createElement(opts.multiline ? 'textarea' : 'input');
    input.id = id;
    input.value = obj[key] === undefined || obj[key] === null ? '' : String(obj[key]);
    if (opts.type) input.type = opts.type;
    if (opts.rows) input.rows = opts.rows;
    input.addEventListener('input', function () {
      obj[key] = opts.number ? Number(input.value) : input.value;
      markDirty();
      if (opts.onInput) opts.onInput(input.value);
    });
    wrap.appendChild(input);
    if (opts.hint) wrap.appendChild(el('span', 'hint', opts.hint));
    return wrap;
  }

  // Editor for an array of plain strings (paragraphs, bullets, areas).
  function stringList(arr, label, opts) {
    opts = opts || {};
    var wrap = el('div', 'field wide');
    wrap.appendChild(el('label', null, label));
    var list = el('div', 'list-editor');

    function draw() {
      list.textContent = '';
      arr.forEach(function (value, i) {
        var line = el('div', 'line');
        var input = document.createElement(opts.multiline ? 'textarea' : 'input');
        input.value = value;
        if (opts.multiline) input.rows = 3;
        input.addEventListener('input', function () { arr[i] = input.value; markDirty(); });
        var del = el('button', 'btn-del', 'Remove');
        del.type = 'button';
        del.addEventListener('click', function () {
          arr.splice(i, 1); draw(); markDirty();
        });
        line.appendChild(input);
        line.appendChild(del);
        list.appendChild(line);
      });
      var add = el('button', 'btn-add', opts.addLabel || '+ Add');
      add.type = 'button';
      add.addEventListener('click', function () { arr.push(''); draw(); markDirty(); });
      list.appendChild(add);
    }
    draw();
    wrap.appendChild(list);
    if (opts.hint) wrap.appendChild(el('span', 'hint', opts.hint));
    return wrap;
  }

  // A collapsible card with move up/down and delete.
  function card(title, tag, onRemove, moves) {
    var box = el('div', 'card');
    var head = el('div', 'card-head');
    var body = el('div', 'card-body');
    body.hidden = true;

    var titleEl = el('span', 'title', title);
    head.appendChild(el('span', 'grip', '▾'));
    head.appendChild(titleEl);
    if (tag) head.appendChild(el('span', 'tag', tag));

    if (moves) {
      [['↑', -1], ['↓', 1]].forEach(function (pair) {
        var b = el('button', 'btn-move', pair[0]);
        b.type = 'button';
        b.disabled = !moves.can(pair[1]);
        b.addEventListener('click', function (e) { e.stopPropagation(); moves.go(pair[1]); });
        head.appendChild(b);
      });
    }
    if (onRemove) {
      var del = el('button', 'btn-del', 'Delete');
      del.type = 'button';
      del.addEventListener('click', function (e) { e.stopPropagation(); onRemove(); });
      head.appendChild(del);
    }
    head.addEventListener('click', function () { body.hidden = !body.hidden; });

    box.appendChild(head);
    box.appendChild(body);
    return { box: box, body: body, setTitle: function (t) { titleEl.textContent = t; } };
  }

  function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // ----------------------------------------------------------------- business
  function drawBusiness() {
    var b = data.business;
    var form = $('#business-form');
    form.textContent = '';
    [
      ['name', 'Business name'],
      ['tagline', 'Tagline'],
      ['phone', 'Phone (as shown)', { hint: 'e.g. (505) 528-5353' }],
      ['phoneDial', 'Phone (for dialling)', { hint: 'Digits only, e.g. +15055285353' }],
      ['email', 'Email', { type: 'email' }],
      ['street', 'Street'],
      ['city', 'City'],
      ['state', 'State'],
      ['zip', 'ZIP'],
      ['region', 'Region served', { hint: 'e.g. Albuquerque & Central New Mexico' }],
      ['regionShort', 'Region (short)'],
      ['since', 'Trading since', { number: true, hint: 'Drives the "Years of Experience" figure' }],
      ['warrantyYears', 'Warranty (years)', { number: true }],
      ['license', 'License number'],
      ['facebook', 'Facebook URL', { wide: true }],
      ['google', 'Google Maps URL', { wide: true }],
    ].forEach(function (f) {
      form.appendChild(field(b, f[0], f[1], f[2] || {}));
    });

    var hours = $('#hours-list');
    function drawHours() {
      hours.textContent = '';
      (b.hours || []).forEach(function (h, i) {
        var row = el('div', 'row');
        var d = document.createElement('input'); d.value = h.days; d.placeholder = 'Monday - Friday';
        var t = document.createElement('input'); t.value = h.time; t.placeholder = '7:00 am - 6:00 pm';
        d.addEventListener('input', function () { h.days = d.value; markDirty(); });
        t.addEventListener('input', function () { h.time = t.value; markDirty(); });
        var del = el('button', 'btn-del', 'Remove'); del.type = 'button';
        del.addEventListener('click', function () { b.hours.splice(i, 1); drawHours(); markDirty(); });
        row.appendChild(d); row.appendChild(t); row.appendChild(del);
        hours.appendChild(row);
      });
    }
    drawHours();
    $('#add-hours').onclick = function () {
      b.hours = b.hours || [];
      b.hours.push({ days: '', time: '' });
      drawHours(); markDirty();
    };

    var stats = $('#stats-list');
    function drawStats() {
      stats.textContent = '';
      (b.stats || []).forEach(function (s, i) {
        var row = el('div', 'row');
        var n = document.createElement('input'); n.value = s.n; n.placeholder = '350+';
        var l = document.createElement('input'); l.value = s.label; l.placeholder = 'Roofs repaired';
        n.addEventListener('input', function () { s.n = n.value; markDirty(); });
        l.addEventListener('input', function () { s.label = l.value; markDirty(); });
        var del = el('button', 'btn-del', 'Remove'); del.type = 'button';
        del.addEventListener('click', function () { b.stats.splice(i, 1); drawStats(); markDirty(); });
        row.appendChild(n); row.appendChild(l); row.appendChild(del);
        stats.appendChild(row);
      });
    }
    drawStats();
    $('#add-stat').onclick = function () {
      b.stats = b.stats || [];
      b.stats.push({ n: '', label: '' });
      drawStats(); markDirty();
    };
  }

  // ----------------------------------------------------------------- services
  function drawServices() {
    var list = $('#services-list');
    list.textContent = '';

    data.services.forEach(function (s, i) {
      var c = card(s.name || '(untitled)', s.group, function () {
        if (!confirm('Delete "' + (s.name || 'this service') + '"? Its page goes too.')) return;
        data.services.splice(i, 1);
        drawServices(); markDirty();
      }, {
        can: function (dir) { return i + dir >= 0 && i + dir < data.services.length; },
        go: function (dir) {
          var moved = data.services.splice(i, 1)[0];
          data.services.splice(i + dir, 0, moved);
          drawServices(); markDirty();
        },
      });

      var grid = el('div', 'form-grid');
      grid.appendChild(field(s, 'name', 'Name', {
        onInput: function (v) { c.setTitle(v || '(untitled)'); },
      }));
      grid.appendChild(field(s, 'slug', 'Web address', {
        hint: '/services/' + (s.slug || '') + '.html',
      }));

      var groupWrap = el('div', 'field');
      groupWrap.appendChild(el('label', null, 'Group'));
      var sel = document.createElement('select');
      [['design', 'Design'], ['roofing', 'Roofing']].forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o[0]; opt.textContent = o[1];
        if (s.group === o[0]) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function () { s.group = sel.value; markDirty(); });
      groupWrap.appendChild(sel);
      grid.appendChild(groupWrap);

      var featWrap = el('div', 'field');
      featWrap.appendChild(el('label', null, 'On the homepage'));
      var featSel = document.createElement('select');
      [['yes', 'Yes - show it'], ['no', 'No']].forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o[0]; opt.textContent = o[1];
        if ((o[0] === 'yes') === !!s.featured) opt.selected = true;
        featSel.appendChild(opt);
      });
      featSel.addEventListener('change', function () {
        s.featured = featSel.value === 'yes'; markDirty();
      });
      featWrap.appendChild(featSel);
      featWrap.appendChild(el('span', 'hint', 'The homepage shows the first six that are on.'));
      grid.appendChild(featWrap);

      grid.appendChild(field(s, 'short', 'One-line summary', {
        wide: true, multiline: true, rows: 2,
        hint: 'Used on the card and as the page description in Google.',
      }));
      grid.appendChild(field(s, 'icon', 'Icon', {
        hint: 'e.g. hammer, drop, compass, cube, ruler, shield-check',
      }));

      c.body.appendChild(grid);
      s.body = s.body || [];
      s.includes = s.includes || [];
      c.body.appendChild(stringList(s.body, 'Page text (one box per paragraph)', {
        multiline: true, addLabel: '+ Add a paragraph',
      }));
      c.body.appendChild(stringList(s.includes, 'What is included (bullets)', {
        addLabel: '+ Add a bullet',
      }));

      list.appendChild(c.box);
    });
  }

  $('#add-service').onclick = function () {
    var name = prompt('Name of the new service?');
    if (!name) return;
    data.services.push({
      slug: slugify(name), name: name, group: 'roofing', icon: 'hammer',
      featured: false, short: '', body: [''], includes: [''],
    });
    drawServices(); markDirty();
    toast('Added. Fill it in, then Save & publish.');
  };

  // ------------------------------------------------------------------ reviews
  function drawReviews() {
    var list = $('#reviews-list');
    list.textContent = '';
    data.reviews = data.reviews || [];
    data.reviews.forEach(function (r, i) {
      var c = card(r.name || '(no name)', r.source, function () {
        if (!confirm('Delete this review?')) return;
        data.reviews.splice(i, 1); drawReviews(); markDirty();
      }, {
        can: function (d) { return i + d >= 0 && i + d < data.reviews.length; },
        go: function (d) {
          var m = data.reviews.splice(i, 1)[0];
          data.reviews.splice(i + d, 0, m);
          drawReviews(); markDirty();
        },
      });
      var grid = el('div', 'form-grid');
      grid.appendChild(field(r, 'name', 'Customer name', {
        onInput: function (v) { c.setTitle(v || '(no name)'); },
      }));

      var srcWrap = el('div', 'field');
      srcWrap.appendChild(el('label', null, 'Where it came from'));
      var sel = document.createElement('select');
      ['Google', 'Facebook'].forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o; opt.textContent = o;
        if (r.source === o) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function () { r.source = sel.value; markDirty(); });
      srcWrap.appendChild(sel);
      grid.appendChild(srcWrap);

      grid.appendChild(field(r, 'text', 'What they wrote', { wide: true, multiline: true, rows: 5 }));
      grid.appendChild(el('span', 'hint',
        'Photo for this review: Photos tab, slot "review-' + (i + 1) + '".'));
      c.body.appendChild(grid);
      list.appendChild(c.box);
    });
  }

  $('#add-review').onclick = function () {
    data.reviews = data.reviews || [];
    data.reviews.push({ name: '', source: 'Google', text: '' });
    drawReviews(); markDirty();
  };

  // --------------------------------------------------------------------- faqs
  function drawFaqs() {
    var list = $('#faqs-list');
    list.textContent = '';
    data.faqs = data.faqs || [];
    data.faqs.forEach(function (f, i) {
      var c = card(f.q || '(no question)', null, function () {
        if (!confirm('Delete this question?')) return;
        data.faqs.splice(i, 1); drawFaqs(); markDirty();
      }, {
        can: function (d) { return i + d >= 0 && i + d < data.faqs.length; },
        go: function (d) {
          var m = data.faqs.splice(i, 1)[0];
          data.faqs.splice(i + d, 0, m);
          drawFaqs(); markDirty();
        },
      });
      var grid = el('div', 'form-grid');
      grid.appendChild(field(f, 'q', 'Question', {
        wide: true, onInput: function (v) { c.setTitle(v || '(no question)'); },
      }));
      grid.appendChild(field(f, 'a', 'Answer', { wide: true, multiline: true, rows: 4 }));
      c.body.appendChild(grid);
      list.appendChild(c.box);
    });
  }

  $('#add-faq').onclick = function () {
    data.faqs = data.faqs || [];
    data.faqs.push({ q: '', a: '' });
    drawFaqs(); markDirty();
  };

  // -------------------------------------------------------------------- areas
  function drawAreas() {
    var list = $('#areas-list');
    list.textContent = '';
    data.areas = data.areas || [];
    data.areas.forEach(function (a, i) {
      var chip = el('div', 'chip');
      var input = document.createElement('input');
      input.value = a;
      input.addEventListener('input', function () { data.areas[i] = input.value; markDirty(); });
      var del = el('button', 'btn-del', '×');
      del.type = 'button';
      del.addEventListener('click', function () { data.areas.splice(i, 1); drawAreas(); markDirty(); });
      chip.appendChild(input); chip.appendChild(del);
      list.appendChild(chip);
    });
  }

  $('#add-area').onclick = function () {
    data.areas = data.areas || [];
    data.areas.push('');
    drawAreas(); markDirty();
  };

  // ------------------------------------------------------------------- photos
  // Every slot the build looks for, so the tab can show what is missing rather
  // than only what happens to exist.
  function photoSlots() {
    var slots = [
      { slot: 'hero', label: 'Homepage headline background', ratio: 5 / 3 },
      { slot: 'about', label: 'Beside "We’re Committed To Provide"', ratio: 3 / 2 },
      { slot: 'band', label: 'Behind the blue help strip', ratio: 3 / 1 },
    ];
    for (var i = 1; i <= 6; i++) {
      slots.push({ slot: 'work-' + i, label: 'Recent work ' + i, ratio: 4 / 3 });
    }
    data.services.forEach(function (s) {
      slots.push({ slot: 'service-' + s.slug, label: s.name, ratio: 4 / 3 });
    });
    (data.reviews || []).forEach(function (r, i) {
      slots.push({ slot: 'review-' + (i + 1), label: (r.name || 'Review ' + (i + 1)), ratio: 1 });
    });
    return slots;
  }

  // Resize and crop in the browser: a 6MB phone photo becomes a ~200KB JPEG
  // before it ever leaves, so the site stays fast without anyone thinking about it.
  function prepare(file, ratio) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var targetW = ratio >= 3 ? 1600 : (ratio > 1.5 ? 2000 : (ratio === 1 ? 400 : 1200));
        var targetH = Math.round(targetW / ratio);
        var scale = Math.max(targetW / img.width, targetH / img.height);
        var w = img.width * scale, h = img.height * scale;
        var canvas = document.createElement('canvas');
        canvas.width = targetW; canvas.height = targetH;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, (targetW - w) / 2, (targetH - h) / 2, w, h);
        canvas.toBlob(function (blob) {
          if (!blob) return reject(new Error('Could not process that image'));
          resolve(blob);
        }, 'image/jpeg', 0.84);
      };
      img.onerror = function () { reject(new Error('That file is not an image the browser can read')); };
      img.src = URL.createObjectURL(file);
    });
  }

  function drawPhotos(images) {
    var have = {};
    (images || []).forEach(function (f) { have[f] = true; });

    var grid = $('#photos-list');
    grid.textContent = '';

    photoSlots().forEach(function (s) {
      var file = s.slot + '.jpg';
      var box = el('div', 'photo');
      var frame = el('div', 'frame');
      if (have[file]) {
        var img = document.createElement('img');
        img.src = '/assets/img/' + file + '?v=' + Date.now();
        img.alt = '';
        frame.appendChild(img);
      } else {
        frame.appendChild(el('span', null, 'No photo yet'));
      }
      box.appendChild(frame);

      var meta = el('div', 'meta');
      meta.appendChild(el('b', null, s.label));
      meta.appendChild(el('span', null, file));
      box.appendChild(meta);

      var acts = el('div', 'acts');
      var pick = el('button', null, have[file] ? 'Replace' : 'Add photo');
      pick.type = 'button';
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.hidden = true;
      pick.addEventListener('click', function () { input.click(); });

      input.addEventListener('change', function () {
        var f = input.files && input.files[0];
        if (!f) return;
        box.classList.add('is-busy');
        prepare(f, s.ratio).then(function (blob) {
          var form = new FormData();
          form.append('slot', s.slot);
          form.append('file', blob, s.slot + '.jpg');
          return fetch('/admin/api/upload', {
            method: 'POST', credentials: 'same-origin', body: form,
          }).then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (b) {
              if (!r.ok) throw new Error(b.error || 'Upload failed');
              return b;
            });
          });
        }).then(function () {
          toast('Photo published.', 'ok');
          return reloadPhotos();
        }).catch(function (err) {
          toast(err.message, 'err');
          box.classList.remove('is-busy');
        });
      });

      acts.appendChild(pick);
      acts.appendChild(input);

      if (have[file]) {
        var rm = el('button', 'rm', 'Remove');
        rm.type = 'button';
        rm.addEventListener('click', function () {
          if (!confirm('Remove this photo? The spot goes back to a placeholder.')) return;
          box.classList.add('is-busy');
          api('/admin/api/image/' + s.slot, { method: 'DELETE' })
            .then(function () { toast('Removed.', 'ok'); return reloadPhotos(); })
            .catch(function (e) { toast(e.message, 'err'); box.classList.remove('is-busy'); });
        });
        acts.appendChild(rm);
      }

      box.appendChild(acts);
      grid.appendChild(box);
    });
  }

  function reloadPhotos() {
    return api('/admin/api/data').then(function (res) { drawPhotos(res.images); });
  }

  // --------------------------------------------------------------------- save
  function save(btn) {
    var buttons = document.querySelectorAll('[data-save]');
    buttons.forEach(function (b) { b.disabled = true; });
    if (btn) btn.textContent = 'Publishing…';
    api('/admin/api/data', { method: 'PUT', body: data })
      .then(function (res) {
        clearDirty();
        toast('Published — ' + res.build.files + ' pages rebuilt.', 'ok');
      })
      .catch(function (err) { toast(err.message, 'err'); })
      .finally(function () {
        buttons.forEach(function (b) { b.disabled = false; });
        if (btn) btn.textContent = 'Save & publish';
      });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-save]');
    if (btn) save(btn);
  });

  // --------------------------------------------------------------------- tabs
  document.querySelectorAll('.admin-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.admin-tab').forEach(function (t) { t.classList.remove('is-on'); });
      tab.classList.add('is-on');
      document.querySelectorAll('.panel').forEach(function (p) { p.hidden = true; });
      $('#tab-' + tab.dataset.tab).hidden = false;
      // Slots follow the services and reviews, so redraw on arrival rather than
      // showing a list that went stale while another tab was edited.
      if (tab.dataset.tab === 'photos') reloadPhotos();
    });
  });

  // -------------------------------------------------------------------- login
  $('#login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('#login-error');
    err.hidden = true;
    api('/admin/api/login', { method: 'POST', body: { password: $('#login-password').value } })
      .then(function () { $('#login-password').value = ''; start(); })
      .catch(function (ex) { err.textContent = ex.message; err.hidden = false; });
  });

  $('#logout-btn').addEventListener('click', function () {
    if (dirty && !confirm('You have unsaved changes. Log out anyway?')) return;
    api('/admin/api/logout', { method: 'POST' }).then(function () { location.reload(); });
  });

  // --------------------------------------------------------------------- boot
  function start() {
    api('/admin/api/data').then(function (res) {
      data = res.data;
      $('#login-screen').hidden = true;
      $('#dashboard').hidden = false;
      drawBusiness();
      drawServices();
      drawReviews();
      drawFaqs();
      drawAreas();
      drawPhotos(res.images);
      clearDirty();
    }).catch(function (err) { toast(err.message, 'err'); });
  }

  api('/admin/api/session').then(function (res) {
    if (res.authenticated) start();
  }).catch(function () { /* login screen is already showing */ });
})();
