// Carga los logos SVG de img/logos/, los rasteriza en alta resolución y recorta el margen vacío.
// Devuelve un canvas listo para usar como textura (three.js) o como <img> (dataURL).
const cache = new Map();

export function loadLogo(name, size = 1024) {
  const key = name + '@' + size;
  if (!cache.has(key)) cache.set(key, rasterize(name, size).catch(() => null));
  return cache.get(key);
}

async function rasterize(name, size) {
  const txt = await (await fetch(`img/logos/${name}.svg`)).text();
  if (!txt.includes('<svg')) throw new Error('no es svg');
  const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
  const svg = doc.documentElement;
  let w = parseFloat(svg.getAttribute('width')), h = parseFloat(svg.getAttribute('height'));
  const vb = svg.getAttribute('viewBox');
  if (vb) { const p = vb.trim().split(/[\s,]+/).map(Number); w = p[2]; h = p[3]; }
  if (!w || !h) { w = 300; h = 150; }
  const k = size / Math.max(w, h);
  svg.setAttribute('width', w * k);
  svg.setAttribute('height', h * k);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
  const img = new Image();
  img.src = url;
  await img.decode();
  URL.revokeObjectURL(url);

  const c = document.createElement('canvas');
  c.width = Math.ceil(w * k); c.height = Math.ceil(h * k);
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0, c.width, c.height);
  // recorte del área transparente
  const { data } = g.getImageData(0, 0, c.width, c.height);
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    if (data[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 <= x0) return c;
  const out = document.createElement('canvas');
  out.width = x1 - x0 + 1; out.height = y1 - y0 + 1;
  out.getContext('2d').drawImage(c, -x0, -y0);
  return out;
}

// Dibuja un logo teñido de un color sobre un contexto 2D. Ajusta al alto h (o al ancho máximo maxW).
export function drawLogo(g, logo, x, y, h, color = '#fff', maxW = Infinity, align = 'left') {
  if (!logo) return 0;
  let dh = h, dw = (logo.width / logo.height) * h;
  if (dw > maxW) { dw = maxW; dh = (logo.height / logo.width) * maxW; }
  const t = document.createElement('canvas');
  t.width = Math.ceil(dw); t.height = Math.ceil(dh);
  const tg = t.getContext('2d');
  tg.drawImage(logo, 0, 0, dw, dh);
  if (color) { tg.globalCompositeOperation = 'source-in'; tg.fillStyle = color; tg.fillRect(0, 0, dw, dh); }
  const dx = align === 'center' ? x - dw / 2 : align === 'right' ? x - dw : x;
  g.drawImage(t, dx, y + (h - dh) / 2);
  return dw;
}
