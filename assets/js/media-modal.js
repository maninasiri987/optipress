(function () {
  if (typeof window.wp === 'undefined' || !wp.media || !wp.media.view) {
    return;
  }

  var cfg = window.optipressSettings || { apiUrl: '/wp-json/optipress/v1', nonce: '' };
  var STATUS_LABELS = {
    completed: 'بهینه‌شده',
    pending: 'در صف',
    processing: 'در حال پردازش',
    failed: 'ناموفق',
    skipped: 'رد شده',
    none: 'بهینه‌نشده',
  };

  function getStatus(id, cb) {
    fetch(cfg.apiUrl + '/attachment/' + id + '/status', {
      headers: { 'X-WP-Nonce': cfg.nonce, Accept: 'application/json' },
    })
      .then(function (r) { return r.json(); })
      .then(cb)
      .catch(function () {});
  }

  function restore(id, done) {
    fetch(cfg.apiUrl + '/attachment/' + id + '/restore', {
      method: 'POST',
      headers: { 'X-WP-Nonce': cfg.nonce },
    })
      .then(function () { done(); })
      .catch(function () { done(); });
  }

  var Details = wp.media.view.Attachment.Details.TwoColumn;
  if (!Details) {
    return;
  }

  wp.media.view.Attachment.Details.TwoColumn = Details.extend({
    render: function () {
      Details.prototype.render.apply(this, arguments);
      var self = this;
      var id = this.model ? this.model.get('id') : null;
      if (!id) {
        return this;
      }

      getStatus(id, function (data) {
        var el = self.el;
        var wrap = el.querySelector('.optipress-modal-status');
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.className = 'optipress-modal-status';
          var info = el.querySelector('.attachment-info') || el;
          info.appendChild(wrap);
        }

        var label = STATUS_LABELS[data.status] || data.status;
        var html =
          '<div style="margin-top:12px;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;">' +
          '<strong>OptiPress:</strong> ' + label;
        if (data.status === 'completed' && data.saved_bytes) {
          html += ' (−' + data.ratio + '٪، ' + data.saved_bytes + ' بایت)';
        }
        if (data.has_backup) {
          html += ' · <a href="#" class="optipress-restore" style="color:#2563eb;">بازیابی نسخه اصلی</a>';
        }
        html += '</div>';
        wrap.innerHTML = html;

        var link = wrap.querySelector('.optipress-restore');
        if (link) {
          link.addEventListener('click', function (e) {
            e.preventDefault();
            link.textContent = 'در حال بازیابی…';
            restore(id, function () {
              wrap.innerHTML =
                '<div style="margin-top:12px;padding:10px 12px;border:1px solid #bbf7d0;border-radius:8px;background:#f0fdf4;color:#16a34a;">نسخه اصلی بازیابی شد.</div>';
            });
          });
        }
      });

      return this;
    },
  });
})();
