const form = document.getElementById('qr-form');
const input = document.getElementById('qr-input');
const charCount = document.getElementById('char-count');
const sizeSelect = document.getElementById('qr-size');

const emptyState = document.getElementById('empty-state');
const qrWrap = document.getElementById('qr-wrap');
const qrImage = document.getElementById('qr-image');
const laser = document.getElementById('laser');
const bedReadout = document.getElementById('bed-readout');
const outputActions = document.getElementById('output-actions');

const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');

let lastData = '';

input.addEventListener('input', () => {
  charCount.textContent = `${input.value.length} / 900`;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = input.value.trim();
  if (!data) return;

  lastData = data;
  const size = sizeSelect.value;
  const encoded = encodeURIComponent(data);
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;

  bedReadout.textContent = 'SCANNING…';
  bedReadout.classList.remove('ready');

  // reset animation by re-triggering the wrap
  qrWrap.hidden = true;
  outputActions.hidden = true;
  emptyState.hidden = true;

  const img = new Image();
  img.onload = () => {
    qrImage.src = url;
    qrWrap.hidden = false;

    // restart the sweep + develop animations
    void laser.offsetWidth;
    laser.style.animation = 'none';
    void laser.offsetWidth;
    laser.style.animation = '';
    qrWrap.style.animation = 'none';
    void qrWrap.offsetWidth;
    qrWrap.style.animation = '';

    setTimeout(() => {
      bedReadout.textContent = 'READY';
      bedReadout.classList.add('ready');
      outputActions.hidden = false;
    }, 700);
  };
  img.onerror = () => {
    bedReadout.textContent = 'ENCODING FAILED — RETRY';
    emptyState.hidden = false;
  };
  img.src = url;
});

downloadBtn.addEventListener('click', async () => {
  try {
    const response = await fetch(qrImage.src);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'qrforge-code.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    window.open(qrImage.src, '_blank');
  }
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(lastData);
    copyBtn.textContent = 'Copied ✓';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = 'Copy data';
      copyBtn.classList.remove('copied');
    }, 1600);
  } catch (err) {
    copyBtn.textContent = 'Copy failed';
  }
});