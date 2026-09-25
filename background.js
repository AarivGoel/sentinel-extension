importScripts('detector.js');

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId !== 0) return;

  const result = analyze(details.url);
  if (!result) return;

  if (result.score < 75) {
    const flaggedReasons = result.reasons.filter(r => r.flag).map(r => r.t);
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      func: showBanner,
      args: [result.score, flaggedReasons]
    });
  }
});

function showBanner(score, reasons) {
  if (document.getElementById('sentinel-banner')) return;

  const color = score < 45 ? '#F87171' : '#FBBF24';
  const label = score < 45 ? "⚠️ Don't trust this page" : '⚠️ Proceed with caution';

  const bar = document.createElement('div');
  bar.id = 'sentinel-banner';
  bar.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:2147483647;
    background:${color};color:#111;padding:10px 16px;font-family:sans-serif;
    font-size:14px;display:flex;justify-content:space-between;align-items:center;
    box-shadow:0 2px 8px rgba(0,0,0,.2);`;

  const text = document.createElement('span');
  text.textContent = `${label} — Sentinel score ${score}/100: ${reasons.join(' · ')}`;
  bar.appendChild(text);

  const btn = document.createElement('button');
  btn.textContent = 'Dismiss';
  btn.style.cssText = 'background:#111;color:#fff;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;';
  btn.onclick = () => bar.remove();
  bar.appendChild(btn);

  document.documentElement.prepend(bar);
}