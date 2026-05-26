(function () {
  const CURRENT_VERSION_CODE = 1;

  async function checkAppUpdate() {
    try {
      const res = await fetch('app-version.json?t=' + Date.now());
      const data = await res.json();

      if (Number(data.latestVersionCode) > CURRENT_VERSION_CODE) {
        showUpdatePopup(data);
      }
    } catch (e) {
      console.log('Update check failed:', e);
    }
  }

  function showUpdatePopup(data) {
    const force = data.forceUpdate === true || Number(data.minimumVersionCode) > CURRENT_VERSION_CODE;
    const notes = Array.isArray(data.releaseNotes) ? data.releaseNotes.map(n => `<li>${n}</li>`).join('') : '';

    const box = document.createElement('div');
    box.id = 'appUpdateOverlay';
    box.innerHTML = `
      <div class="update-card">
        <h2>🚀 Update Available</h2>
        <p>New Version: <b>${data.latestVersionName || ''}</b></p>
        <ul>${notes}</ul>
        <button onclick="window.location.href='${data.apkUrl}'">⬇️ Download Update</button>
        ${force ? '' : `<button class="later" onclick="document.getElementById('appUpdateOverlay').remove()">Later</button>`}
      </div>
    `;
    document.body.appendChild(box);
  }

  const css = document.createElement('style');
  css.innerHTML = `
    #appUpdateOverlay{position:fixed;inset:0;background:rgba(15,23,42,.72);z-index:999999;display:flex;align-items:center;justify-content:center;padding:18px;font-family:system-ui,Arial,sans-serif}
    .update-card{width:100%;max-width:420px;background:#fff;border-radius:22px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.25);color:#111827}
    .update-card h2{margin:0 0 8px;font-size:24px;color:#1e3a8a}
    .update-card p{margin:0 0 12px;color:#475569}
    .update-card ul{margin:10px 0 18px;padding-left:20px;color:#334155}
    .update-card button{width:100%;border:0;border-radius:14px;padding:13px 16px;background:#2563eb;color:white;font-weight:800;font-size:15px;margin-top:8px}
    .update-card button.later{background:#e5e7eb;color:#111827}
  `;
  document.head.appendChild(css);

  window.addEventListener('load', checkAppUpdate);
})();
