document.getElementById('check').addEventListener('click', () => {
  const val = document.getElementById('url').value;
  const out = analyze(val);
  const el = document.getElementById('result');
  if (!out) { el.innerHTML = ''; return; }

  const color = out.score >= 75 ? '#34D399' : out.score >= 45 ? '#FBBF24' : '#F87171';
  const verdict = out.score >= 75 ? 'Looks safe' : out.score >= 45 ? 'Proceed with caution' : "Don't click this";

  let html = `<div class="label" style="color:${color}">${verdict} — ${out.score}/100</div><ul>`;
  out.reasons.forEach(r => { html += `<li>${r.t}</li>`; });
  html += '</ul>';
  el.innerHTML = html;
});