document.addEventListener('DOMContentLoaded', function () {
  initCopyButtons();
  initTheme();
  initFilters();
  initSurpriseMe();
  initRevealOnScroll();
});

function initCopyButtons() {
  var buttons = document.querySelectorAll('.copy-btn');

  buttons.forEach(function (btn) {
    var promptEl = btn.previousElementSibling.querySelector('.text');
    var promptText = promptEl ? promptEl.getAttribute('data-prompt') : '';
    var defaultLabel = btn.textContent;

    btn.addEventListener('click', function () {
      copyToClipboard(promptText).then(function () {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = defaultLabel;
          btn.classList.remove('copied');
        }, 1500);
      });
    });
  });

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for older browsers
    return new Promise(function (resolve) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Copy failed', err);
      }
      document.body.removeChild(textarea);
      resolve();
    });
  }
}

function initTheme() {
  var toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  var stored = null;
  try { stored = localStorage.getItem('swiftee-theme'); } catch (e) {}
  if (stored === 'dark' || stored === 'light') {
    document.documentElement.setAttribute('data-theme', stored);
  }

  toggle.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    var isDark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('swiftee-theme', next); } catch (e) {}
  });
}

function initFilters() {
  var buttons = document.querySelectorAll('.filter-btn');
  var groups = document.querySelectorAll('.group');
  var status = document.querySelector('.filter-status');
  if (!buttons.length) return;

  var totalPrompts = document.querySelectorAll('.prompt').length;

  buttons.forEach(function (btn) {
    var filter = btn.getAttribute('data-filter');
    var countEl = btn.querySelector('.filter-count');
    if (!countEl) return;
    if (filter === 'all') {
      countEl.textContent = totalPrompts;
    } else {
      var group = document.querySelector('.group[data-category="' + filter + '"]');
      countEl.textContent = group ? group.querySelectorAll('.prompt').length : 0;
    }
  });

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      var filter = btn.getAttribute('data-filter');

      var visibleCount = 0;
      groups.forEach(function (group) {
        var match = filter === 'all' || group.getAttribute('data-category') === filter;
        if (match) {
          showGroup(group);
          visibleCount += group.querySelectorAll('.prompt').length;
        } else {
          hideGroup(group);
        }
      });

      if (status) {
        status.textContent = filter === 'all'
          ? 'Showing all ' + totalPrompts + ' prompts'
          : 'Showing ' + visibleCount + ' ' + (visibleCount === 1 ? 'prompt' : 'prompts') + ' · ' + capitalize(filter);
      }
    });
  });

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

function showGroup(el) {
  if (getComputedStyle(el).display !== 'none') return;
  el.style.overflow = 'hidden';
  el.style.display = '';
  el.classList.remove('is-hiding');
  el.style.maxHeight = '0px';
  var target = el.scrollHeight;
  requestAnimationFrame(function () {
    el.style.maxHeight = target + 'px';
  });
  var handler = function (e) {
    if (e.propertyName === 'max-height') {
      el.style.maxHeight = '';
      el.style.overflow = '';
      el.removeEventListener('transitionend', handler);
    }
  };
  el.addEventListener('transitionend', handler);
}

function hideGroup(el) {
  if (getComputedStyle(el).display === 'none') return;
  el.style.overflow = 'hidden';
  el.style.maxHeight = el.scrollHeight + 'px';
  requestAnimationFrame(function () {
    el.classList.add('is-hiding');
    el.style.maxHeight = '0px';
  });
  var handler = function (e) {
    if (e.propertyName === 'max-height') {
      el.style.display = 'none';
      el.removeEventListener('transitionend', handler);
    }
  };
  el.addEventListener('transitionend', handler);
}

function initSurpriseMe() {
  var btn = document.querySelector('.surprise-btn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    var visiblePrompts = Array.prototype.filter.call(document.querySelectorAll('.prompt'), function (p) {
      var group = p.closest('.group');
      return group && getComputedStyle(group).display !== 'none';
    });
    if (!visiblePrompts.length) return;

    var pick = visiblePrompts[Math.floor(Math.random() * visiblePrompts.length)];
    pick.scrollIntoView({ behavior: 'smooth', block: 'center' });
    pick.classList.remove('prompt-highlight');
    void pick.offsetWidth; // restart animation if clicked twice
    pick.classList.add('prompt-highlight');
    setTimeout(function () {
      pick.classList.remove('prompt-highlight');
    }, 2600);
  });
}

function initRevealOnScroll() {
  var targets = document.querySelectorAll('.rule, .prompt');
  if (!('IntersectionObserver' in window) || !targets.length) return;

  targets.forEach(function (el, i) {
    el.classList.add('reveal-init');
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(function (el) { observer.observe(el); });
}
