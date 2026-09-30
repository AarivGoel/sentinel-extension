function checkForms() {
  const forms = document.querySelectorAll('form');
  const pageDomain = window.location.hostname.replace(/^www\./, '');

  forms.forEach(form => {
    const hasPasswordField = form.querySelector('input[type="password"]');
    if (!hasPasswordField) return;

    const action = form.getAttribute('action');
    if (!action) return;

    let actionDomain;
    try {
      actionDomain = new URL(action, window.location.href).hostname.replace(/^www\./, '');
    } catch (e) {
      return;
    }

    if (actionDomain && actionDomain !== pageDomain) {
      showFormWarning(pageDomain, actionDomain);
    }
  });
}

function showFormWarning(pageDomain, actionDomain) {
  if (document.getElementById('sentinel-form-banner')) return;

  const bar = document.createElement('div');
  bar.id = 'sentinel-form-banner';
  bar.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:2147483647;
    background:#F87171;color:#111;padding:10px 16px;font-family:sans-serif;
    font-size:14px;display:flex;justify-content:space-between;align-items:center;
    box-shadow:0 2px 8px rgba(0,0,0,.2);`;

  const text = document.createElement('span');
  text.textContent = `🚨 This page (${pageDomain}) has a login form that sends your password to a different site (${actionDomain}) — this is a common sign of a fake login page.`;
  bar.appendChild(text);

  const btn = document.createElement('button');
  btn.textContent = 'Dismiss';
  btn.style.cssText = 'background:#111;color:#fff;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;';
  btn.onclick = () => bar.remove();
  bar.appendChild(btn);

  document.documentElement.prepend(bar);
}

checkForms();

const observer = new MutationObserver(() => checkForms());
observer.observe(document.body, { childList: true, subtree: true });