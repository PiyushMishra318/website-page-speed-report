const form = document.getElementById('form');
const status = document.getElementById('status');
const out = document.getElementById('out');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('url').value.trim();
  status.textContent = 'Running PageSpeed (this may take up to a minute)…';
  out.hidden = true;
  try {
    const res = await fetch(`/api/pagespeed?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);
    out.textContent = JSON.stringify(data, null, 2);
    out.hidden = false;
    status.textContent = `Done — performance scores: desktop ${data.desktop.score}, mobile ${data.mobile.score}`;
  } catch (err) {
    status.textContent = err.message || String(err);
  }
});
