document.addEventListener('DOMContentLoaded', function () {
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
});
