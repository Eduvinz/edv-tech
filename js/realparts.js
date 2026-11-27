// Piezas con modelo 3D real (Sketchfab, licencia CC BY 4.0; créditos en el pie de la página).
// Reemplazan a las piezas hechas por código, en el mismo lugar y con el mismo despiece.
// Si un archivo no carga, el equipo sigue armado con las piezas por código.
//
// La escena del PCModel se dibuja en espejo (pc.root.scale.z = -1) para que el gabinete quede con la
// disposición real del Corsair 4000D: vidrio a la izquierda mirando de frente. Por eso todas las matrices
// de este archivo tienen determinante negativo: espejo × espejo = pieza real, con sus letras al derecho.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const loader = new GLTFLoader();
const files = {};
const load = (n) => (files[n] ||= loader.loadAsync(`models/${n}.glb`).then((g) => g.scene));
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ejes: a dónde va el x, y, z del archivo (columnas de la matriz)
const basis = (ex, ey, ez) => new THREE.Matrix4().makeBasis(V(...ex), V(...ey), V(...ez));
const SWAP = basis([0, 0, 1], [0, 1, 0], [1, 0, 0]);          // frente del archivo (+z) → hacia el vidrio (+x)

function ensureIndex(g) {
  if (!g.index) g.setIndex(Array.from({ length: g.attributes.position.count }, (_, i) => i));
  return g;
}

// Copia las mallas del archivo con su transformación ya aplicada a la geometría
function bake(scene, m, skip = []) {
  scene.updateMatrixWorld(true);
  const out = [];
  scene.traverse((o) => {
    if (!o.isMesh || skip.includes(o.name)) return;
    const w = new THREE.Matrix4().multiplyMatrices(m, o.matrixWorld);
    const g = ensureIndex(o.geometry.clone());
    g.applyMatrix4(w);
    if (w.determinant() < 0) { const a = g.index.array; for (let i = 0; i < a.length; i += 3) { const t = a[i + 1]; a[i + 1] = a[i + 2]; a[i + 2] = t; } }
    g.morphAttributes = {};
    out.push({ name: o.name, g, mat: o.material });
  });
  return out;
}

const boxOf = (list) => { const b = new THREE.Box3(); list.forEach(({ g }) => { g.computeBoundingBox(); b.union(g.boundingBox); }); return b; };
const ctr = (b) => b.getCenter(V());
const boxTop = (list) => boxOf(list).max.x;

// Escala uniforme y lleva el punto ancla de la pieza a `to`. Devuelve el desplazamiento aplicado.
function place(list, s, anchor, to) {
  list.forEach(({ g }) => g.scale(s, s, s));
  const a = anchor(boxOf(list));
  const d = V(...to).sub(a);
  list.forEach(({ g }) => g.translate(d.x, d.y, d.z));
  return d;
}

// Separa los triángulos de una malla según la posición de su centro (o, con whole, de sus 3 vértices)
function splitTris(list, pred, whole = false) {
  const yes = [], no = [];
  const v = V(), c = V();
  list.forEach((it) => {
    const idx = it.g.index.array, pos = it.g.attributes.position, A = [], B = [];
    for (let i = 0; i < idx.length; i += 3) {
      let ok;
      if (whole) ok = [0, 1, 2].every((k) => pred(v.fromBufferAttribute(pos, idx[i + k])));
      else { c.set(0, 0, 0); for (let k = 0; k < 3; k++) c.add(v.fromBufferAttribute(pos, idx[i + k])); ok = pred(c.multiplyScalar(1 / 3)); }
      (ok ? A : B).push(idx[i], idx[i + 1], idx[i + 2]);
    }
    if (A.length) { const g = it.g.clone(); g.setIndex(A); yes.push({ ...it, g }); }
    if (B.length) { const g = it.g.clone(); g.setIndex(B); no.push({ ...it, g }); }
  });
  return [yes, no];
}

// Une las mallas que comparten material: muchas menos llamadas de dibujo
function merge(list) {
  const by = new Map();
  list.forEach((it) => {
    const key = it.mat.uuid + '|' + Object.keys(it.g.attributes).sort().join(',');
    if (!by.has(key)) by.set(key, { mat: it.mat, gs: [] });
    by.get(key).gs.push(it.g);
  });
  const out = [];
  by.forEach(({ mat, gs }) => {
    const g = gs.length > 1 ? mergeGeometries(gs) : gs[0];
    if (g) { g.computeBoundingSphere(); g.computeBoundingBox(); out.push({ g, mat }); } else gs.forEach((x) => out.push({ g: x, mat }));
  });
  return out;
}

// Altura (x) de la superficie en un punto (y, z), mirando desde el vidrio hacia la bandeja
function surfaceX(list, y, z) {
  const ray = new THREE.Raycaster(V(3, y, z), V(-1, 0, 0));
  const meshes = list.map(({ g, mat }) => new THREE.Mesh(g, mat));
  const h = ray.intersectObjects(meshes, false)[0];
  return h ? h.point.x : null;
}

async function buildKit() {
  const [caseS, mbS, cpuS, ramS, ssdS, gpuS, fanS] = await Promise.all(
    ['corsair-4000d', 'asus-prime-x570', 'cpu-am4', 'corsair-dominator-ram', 'samsung-990-pro', 'asus-rog-4090', 'nzxt-aer-p120'].map(load));
  const kit = {};

  /* ---------- Gabinete Corsair 4000D Airflow ----------
     Archivo: x = profundidad (frente +x), y = alto, z = ancho (vidrio +z), en metros.
     Se ajusta a la caja interior del equipo: bandeja en x = -1.13, cubierta de fuente en y = -1.28. */
  const MC = new THREE.Matrix4().set(0, 0, 11.75, -0.032, 0, 10.92, 0, -2.503, 10.43, 0, 0, -0.11, 0, 0, 0, 1);
  const all = bake(caseS, MC);
  const sets = { glass: ['Object_42', 'Object_43'], rear: ['Object_44'], front: ['Object_18', 'Object_32', 'Object_34', 'Object_36', 'Object_38'], top: ['Object_26'] };
  const taken = new Set(Object.values(sets).flat());
  Object.entries(sets).forEach(([k, names]) => { kit[k] = merge(all.filter((it) => names.includes(it.name))); });
  // la tapa lateral de la cubierta de la fuente se separa para que la fuente pueda salir hacia el vidrio
  const [cover, shroudRest] = splitTris(all.filter((it) => it.name === 'Object_20'), (c) => c.x > 0.79 && c.y < -1.28);
  kit.cover = merge(cover);
  kit.case = merge([...all.filter((it) => !taken.has(it.name) && it.name !== 'Object_20'), ...shroudRest]);

  /* ---------- Placa madre ASUS PRIME X570-PRO ----------
     Archivo: cara de componentes +z, I/O hacia -x. Medida ATX real (305 × 244 mm). */
  const mb = bake(mbS, SWAP);
  const ks = 0.941;
  const dm = place(mb, ks, (b) => V(b.min.x, ctr(b).y, ctr(b).z), [-1.12, 0.75, -0.7]);
  const onBoard = (gx, gy) => [gy * ks + dm.y, gx * ks + dm.z]; // punto del archivo (x, y) → (y, z) del equipo
  kit.mb = merge(mb);
  const [sy, sz] = onBoard(-0.612, 0.198);                    // centro del socket AM4
  const sockTop = surfaceX(kit.mb, sy, sz) ?? -1.03;
  const boardFront = surfaceX(kit.mb, ...onBoard(-0.69, -0.557)) ?? -1.08;
  kit.sock = [sockTop, sy, sz];

  /* ---------- AMD Ryzen 9 5900X ---------- */
  const cpu = bake(cpuS, SWAP);
  place(cpu, 0.4 / boxOf(cpu).getSize(V()).y, (b) => V(b.min.x, ctr(b).y, ctr(b).z), [0, 0, 0]);
  kit.cpu = merge(cpu);
  kit.cpuBase = [sockTop, sy, sz];
  kit.coolerBase = [sockTop + boxOf(kit.cpu).getSize(V()).x, sy, sz];

  /* ---------- Corsair Dominator Platinum RGB (A2 y B2) ----------
     Archivo: largo en z, contactos hacia -y, etiqueta en +x. */
  const ram = bake(ramS, basis([0, 0, -1], [1, 0, 0], [0, 1, 0]), ['Object_196', 'Object_198']);
  place(ram, 1.34 / boxOf(ram).getSize(V()).y, (b) => V(b.min.x, ctr(b).y, ctr(b).z), [0, 0, 0]);
  kit.ram = merge(ram);
  kit.ramBases = [0.026, 0.224].map((gx) => {
    const [y, z] = onBoard(gx, 0.198);
    return [(surfaceX(kit.mb, y, z) ?? -1.0) - 0.03, y, z];
  });

  /* ---------- Samsung 990 PRO en el M.2_1 ---------- */
  const ssd = bake(ssdS, basis([0, 0, 1], [1, 0, 0], [0, -1, 0]));
  place(ssd, 0.8 / boxOf(ssd).getSize(V()).z, (b) => V(b.min.x, ctr(b).y, ctr(b).z), [0, 0, 0]);
  kit.ssd = merge(ssd);
  kit.ssdBase = [boardFront + 0.02, ...onBoard(-0.905, -0.557)];

  /* ---------- ASUS ROG Strix GeForce RTX 4090 ----------
     Archivo: largo en x (bracket en -x), ventiladores hacia -y, borde con el logo hacia +z. */
  const gpu = bake(gpuS, SWAP);
  const kg = 0.772;
  const dg = place(gpu, kg, (b) => V(b.min.x, 0.95 * kg, b.min.z), [-1.12, 0.44, -2.24]);
  kit.gpu = merge(gpu);
  kit.gpuPower = [0.81 * kg + dg.x, 0.93 * kg + dg.y, 0.41 * kg + dg.z]; // conector 16 pines

  /* ---------- NZXT F120 / Aer P120 ---------- */
  const fan = bake(fanS, basis([1, 0, 0], [0, 1, 0], [0, 0, -1]));
  place(fan, 1.2 / boxOf(fan).getSize(V()).x, ctr, [0, 0, 0]);
  const [rotor, frame] = splitTris(fan, (c) => Math.hypot(c.x, c.y) < 0.55);
  kit.fanFrame = merge(frame);
  kit.fanRotor = merge(rotor);
  return kit;
}

/* ------------------------------------------------------------------ */
/* Piezas de las otras variantes (se cargan solo cuando se muestran)   */
/* ------------------------------------------------------------------ */
const extra = {};
const once = (k, f) => (extra[k] ||= f().catch((e) => { console.warn('Modelo 3D no disponible:', k, e); return null; }));

// mueve en x los vértices que cumplen la condición (abre el compartimiento de cables detrás de la bandeja)
function shiftX(list, cond, dx) {
  list.forEach(({ g }) => {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) if (cond(p.getX(i))) p.setX(i, p.getX(i) + dx);
    p.needsUpdate = true; g.computeBoundingBox(); g.computeBoundingSphere();
  });
}

/* Gabinete mid-tower blanco con vidrio (archivo en cm aprox.: x = profundidad, frente +x; z = ancho, vidrio +z).
   Escala pareja; la bandeja cae en x = -1.13 y la cubierta de la fuente en y = -1.28, igual que el 4000D. */
const kitCaseV2 = () => once('v2', async () => {
  const sc = await load('computer-case-v2');
  const k = 0.0262;
  const M = new THREE.Matrix4().set(0, 0, k, -1.13 + 13.8 * k, 0, k, 0, -1.28 + 67.6 * k, k, 0, 0, -2.08 + 206.7 * k, 0, 0, 0, 1);
  const all = bake(sc, M);
  // el archivo viene en un solo gris oscuro: se pinta blanco satinado (acero con pintura en polvo)
  const white = new THREE.MeshStandardMaterial({ color: 0xe8e7e3, roughness: 0.55, metalness: 0.15, envMapIntensity: 0.7 });
  all.forEach((it) => { if (!/glass/i.test(it.mat.name || '')) it.mat = white; });
  const by = (re) => all.filter((it) => re.test(it.name));
  const side = by(/^side_panel/), chassis = by(/^main_chassi/);
  // la bandeja casi toca el lateral trasero: se abre un compartimiento de cables de 0,33 como en un gabinete real
  shiftX(side, () => true, -0.33);
  shiftX(chassis, (x) => x < -1.14, -0.33);
  const [cover, rest] = splitTris(chassis, (c) => c.x > 1.0 && c.y < -1.29);
  return {
    case: merge(rest), cover: merge(cover), glass: merge(by(/^side_glass/)), rear: merge(side),
    front: merge(by(/^front_panel/)), top: merge(by(/^air_filter/)),
    floorY: boxOf(all).min.y, frontFanZ: 2.9,
  };
});

/* Refrigeración líquida AIO de 240 mm: radiador blanco al frente (con sus 2 ventiladores) y bomba sobre la CPU.
   Las mangueras se dibujan por código para que lleguen del socket al radiador por encima de la RAM. */
const kitAIO = (coolerBase) => once('aio', async () => {
  const sc = await load('liquid-cooling');
  const rad = bake(sc, basis([1, 0, 0], [0, 0, 1], [0, 1, 0]), ['Object_22', 'Object_23', 'Object_27', 'Object_29']);
  place(rad, 1.0, ctr, [0, 0.95, 1.35]);
  const pump = bake(sc, basis([-1, 0, 0], [0, 1, 0], [0, 0, 1]), ['Object_8', 'Object_11', 'Object_17', 'Object_20', 'Object_25', 'Object_27', 'Object_29']);
  place(pump, 1.0, (b) => V(b.min.x, ctr(b).y, ctr(b).z), coolerBase);
  const rb = boxOf(rad), pb = boxOf(pump);
  const tubeM = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.55, metalness: 0.1 });
  const fitM = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.3, metalness: 0.9 });
  const items = [];
  const cx = (pb.min.x + pb.max.x) / 2, [, sy, sz] = coolerBase;
  [[0, -0.12], [0.16, 0.12]].forEach(([dx, dz], i) => {
    const pts = [[cx, pb.max.y - 0.02, sz + dz], [cx + 0.05, pb.max.y + 0.22, sz + dz * 0.6], [-0.38 + dx, 2.0 - i * 0.04, 0.15 + dz * 0.3], [-0.38 + dx, 2.08 - i * 0.04, 0.85], [-0.3 + dx, 2.12 - i * 0.05, rb.min.z - 0.03]];
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => V(...p)), false, 'centripetal'), 80, 0.05, 14, false);
    items.push({ g, mat: tubeM });
    [pts[0], pts[pts.length - 1]].forEach((p, j) => {
      const f = new THREE.CylinderGeometry(0.065, 0.065, 0.09, 20);
      if (j === 1) f.rotateX(Math.PI / 2); f.translate(...p);
      items.push({ g: f, mat: fitM });
    });
  });
  return { items: merge([...rad, ...pump, ...items]) };
});

/* Cooler Master de torre (4 heatpipes de cobre). Archivo: alto en y, base en -y. */
const kitCM = () => once('cm', async () => {
  const sc = await load('cm-cpu-cooler');
  const l = bake(sc, basis([0, 1, 0], [1, 0, 0], [0, 0, 1]));
  place(l, 1.6 / boxOf(l).getSize(V()).x, (b) => V(b.min.x, ctr(b).y, ctr(b).z), [0, 0, 0]);
  return { items: merge(l) };
});

/* Gigabyte GeForce RTX 4060 Gaming OC (281 mm). Archivo igual que la 4090: largo en x, bracket en -x. */
const kit4060 = () => once('4060', async () => {
  const sc = await load('rtx-4060-gigabyte');
  const l = bake(sc, SWAP);
  place(l, 2.84 / boxOf(l).getSize(V()).z, (b) => V(b.min.x, b.max.y, b.min.z), [-1.12, 0.54, -2.24]);
  const b = boxOf(l);
  return { items: merge(l), power: [b.max.x + 0.02, b.max.y - 0.14, (b.min.z + b.max.z) / 2 + 0.35] };
});

// Ojales de goma en la bandeja justo donde cada cable la cruza (el gabinete blanco no trae los ojales en esos puntos)
function addGrommets(pc) {
  const cab = pc.parts.cables.pieces[0].obj;
  pc.root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(pc.root.matrixWorld).invert();
  const cells = new Map(), v = V(), cell = 0.22;
  cab.traverse((o) => {
    if (!o.isMesh) return;
    const m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld), p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i += 2) {
      v.fromBufferAttribute(p, i).applyMatrix4(m);
      if (v.x < -1.17 || v.x > -1.09 || v.y < -1.25) continue;
      const k = Math.round(v.y / cell) + ':' + Math.round(v.z / cell);
      const b = cells.get(k) || cells.set(k, new THREE.Box3()).get(k); b.expandByPoint(v);
    }
  });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0 });
  const hole = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1, metalness: 0 });
  const geos = [], holes = [];
  // une celdas vecinas en un solo ojal por cruce
  const boxes = [...cells.values()];
  const merged = [];
  boxes.forEach((b) => { const m = merged.find((x) => x.clone().expandByScalar(0.12).intersectsBox(b)); if (m) m.union(b); else merged.push(b.clone()); });
  merged.forEach((b) => {
    const c = b.getCenter(V()), sz = b.getSize(V());
    const h = Math.max(0.16, sz.y + 0.1), w = Math.max(0.16, sz.z + 0.1);
    const g = new THREE.BoxGeometry(0.03, h, w); g.translate(-1.118, c.y, c.z); geos.push(g);
    const gh = new THREE.BoxGeometry(0.031, h - 0.05, w - 0.05); gh.translate(-1.116, c.y, c.z); holes.push(gh);
  });
  if (!geos.length) return;
  [[geos, rubber], [holes, hole]].forEach(([list, mat]) => { const mesh = new THREE.Mesh(mergeGeometries(list), mat); mesh.receiveShadow = true; mesh.userData.partId = 'case'; pc.parts.case.pieces[0].obj.add(mesh); });
}

/* Placa Mini-ITX hecha por código (170 × 170 mm), al nivel de detalle de la placa del primer diseño.
   Coordenadas de la placa: u = distancia desde el borde del I/O (hacia el frente), v = distancia desde el borde superior
   (hacia abajo), h = altura sobre el PCB. Se devuelve en coordenadas del equipo. */
function buildItxBoard() {
  const TOP = 1.31, IOE = -1.45, S = 1.7, PCB = 0.016, X0 = -1.12;
  const P = (u, v, h) => [X0 + PCB + h, TOP - v, IOE + u];
  const mats = {
    black: new THREE.MeshStandardMaterial({ color: 0x0e0e0f, roughness: 0.55, metalness: 0.2 }),
    plastic: new THREE.MeshStandardMaterial({ color: 0x151516, roughness: 0.7, metalness: 0.05 }),
    alu: new THREE.MeshStandardMaterial({ color: 0x1b1c1e, roughness: 0.35, metalness: 0.85 }),
    aluLight: new THREE.MeshStandardMaterial({ color: 0x6c6f74, roughness: 0.3, metalness: 0.9 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xc9cbce, roughness: 0.25, metalness: 0.95 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd4a640, roughness: 0.25, metalness: 1 }),
    socket: new THREE.MeshStandardMaterial({ color: 0xe9e4d6, roughness: 0.6, metalness: 0 }),
    choke: new THREE.MeshStandardMaterial({ color: 0x2b2c2e, roughness: 0.45, metalness: 0.6 }),
    cap: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.5 }),
    capTop: new THREE.MeshStandardMaterial({ color: 0xb8babd, roughness: 0.3, metalness: 0.9 }),
    chip: new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.35, metalness: 0.3 }),
    smd: new THREE.MeshStandardMaterial({ color: 0x3a3226, roughness: 0.5, metalness: 0.4 }),
    red: new THREE.MeshStandardMaterial({ color: 0xb0122a, roughness: 0.5, metalness: 0.1 }),
    white: new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.6, metalness: 0 }),
    rgb: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xff2a55, emissiveIntensity: 0.9, roughness: 0.4 }),
  };
  const lists = {};
  const add = (mat, g) => (lists[mat] ||= []).push(g);
  // caja: tamaño (a lo largo de u, de v, alto h) y esquina (u, v) sobre el PCB
  const bx = (mat, du, dv, dh, u, v, h0 = 0) => { const g = new THREE.BoxGeometry(dh, dv, du); g.translate(...P(u + du / 2, v + dv / 2, h0 + dh / 2)); add(mat, g); };
  const cy = (mat, r, dh, u, v, h0 = 0, seg = 16) => { const g = new THREE.CylinderGeometry(r, r, dh, seg); g.rotateZ(Math.PI / 2); g.translate(...P(u, v, h0 + dh / 2)); add(mat, g); };

  // --- PCB con textura: pistas, serigrafía, agujeros de montaje y zonas de componentes
  const cv = document.createElement('canvas'); cv.width = cv.height = 1536;
  const g = cv.getContext('2d'), W = 1536, k = W / S;
  g.fillStyle = '#0d0e0f'; g.fillRect(0, 0, W, W);
  g.strokeStyle = 'rgba(70,74,78,0.55)'; g.lineWidth = 2;
  for (let i = 0; i < 260; i++) {                          // pistas en ángulos de 45°, como en un PCB real
    let x = Math.random() * W, y = Math.random() * W; g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 4; s++) { const d = 30 + Math.random() * 140, a = (Math.floor(Math.random() * 8) * Math.PI) / 4; x += Math.cos(a) * d; y += Math.sin(a) * d; g.lineTo(x, y); }
    g.stroke();
  }
  g.fillStyle = 'rgba(150,150,145,0.55)';
  for (let i = 0; i < 2600; i++) { g.beginPath(); g.arc(Math.random() * W, Math.random() * W, 1.6, 0, 7); g.fill(); }   // vías
  g.fillStyle = '#d8d8d3'; g.font = '700 34px Arial, Helvetica, sans-serif';
  g.fillText('ROG STRIX B550-I GAMING', 0.42 * k, 1.05 * k);
  g.font = '500 20px Consolas, monospace';
  [['CPU_FAN', 0.95, 0.06], ['AIO_PUMP', 1.12, 0.06], ['EATX12V', 0.12, 0.06], ['DDR4_A1', 1.24, 1.5], ['DDR4_B1', 1.42, 1.5], ['M.2_1 (SOCKET 3)', 0.42, 1.48], ['PCIEX16', 0.2, 1.57], ['SATA6G', 1.48, 0.98], ['F_PANEL', 1.42, 1.66], ['USB3_12', 1.55, 0.75], ['AAFP', 0.05, 1.66], ['CHA_FAN', 1.0, 1.66]]
    .forEach(([t, u, v]) => g.fillText(t, u * k, v * k));
  g.strokeStyle = 'rgba(216,216,211,0.8)'; g.lineWidth = 3; g.strokeRect(0.45 * k, 0.4 * k, 0.48 * k, 0.48 * k); // contorno del socket
  [[0.06, 0.06], [1.64, 0.06], [0.06, 1.64], [1.64, 1.64]].forEach(([u, v]) => { g.fillStyle = '#b9b9b4'; g.beginPath(); g.arc(u * k, v * k, 22, 0, 7); g.fill(); g.fillStyle = '#0d0e0f'; g.beginPath(); g.arc(u * k, v * k, 11, 0, 7); g.fill(); });
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const pcbM = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.15 });
  const pcbG = new THREE.BoxGeometry(PCB, S, S);
  pcbG.translate(...P(S / 2, S / 2, -PCB / 2));
  // la cara que mira al vidrio (+x, primeros 4 vértices) lleva la textura: I/O a la izquierda, borde superior arriba
  const uv = pcbG.attributes.uv, pp = pcbG.attributes.position;
  for (let i = 0; i < 4; i++) uv.setXY(i, (pp.getZ(i) - IOE) / S, (pp.getY(i) - (TOP - S)) / S);
  lists.pcb = [pcbG];

  // --- cubierta del I/O trasero (alta, angulada, con franja RGB) y disipador del VRM con aletas
  bx('black', 0.20, 1.05, 0.42, 0.0, 0.02);
  bx('aluLight', 0.012, 0.95, 0.02, 0.18, 0.06, 0.40);
  bx('rgb', 0.01, 0.6, 0.012, 0.202, 0.25, 0.30);
  for (let i = 0; i < 14; i++) bx('alu', 0.045, 0.13, 0.24, 0.34 + i * 0.05, 0.01);            // aletas del VRM (bajas: el disipador pasa por encima)
  bx('alu', 0.72, 0.02, 0.24, 0.33, 0.0);
  // bobinas y condensadores sólidos del VRM
  for (let i = 0; i < 8; i++) bx('choke', 0.07, 0.07, 0.07, 0.36 + i * 0.075, 0.29);
  for (let i = 0; i < 7; i++) cy('cap', 0.022, 0.08, 0.40 + i * 0.08, 0.385), cy('capTop', 0.022, 0.005, 0.40 + i * 0.08, 0.385, 0.08);

  // --- socket AM4 (blanco) con campo de pines, palanca y marco de retención
  bx('socket', 0.40, 0.40, 0.055, 0.49, 0.44);
  bx('silver', 0.012, 0.40, 0.012, 0.905, 0.44, 0.045);                                          // palanca
  bx('plastic', 0.06, 0.52, 0.03, 0.40, 0.38); bx('plastic', 0.06, 0.52, 0.03, 0.92, 0.38);      // retención
  for (let i = 0; i < 18; i++) for (let j = 0; j < 18; j++) if (!(i > 6 && i < 11 && j > 6 && j < 11)) bx('gold', 0.006, 0.006, 0.004, 0.515 + i * 0.02, 0.465 + j * 0.02, 0.055);
  [[0.42, 0.36], [0.97, 0.36], [0.42, 0.94], [0.97, 0.94]].forEach(([u, v]) => { cy('silver', 0.018, 0.02, u, v); });

  // --- 2 slots de RAM con seguros (A1 / B1)
  [1.24, 1.38].forEach((u) => {
    bx('plastic', 0.07, 1.36, 0.07, u, 0.12);
    bx('plastic', 0.075, 0.05, 0.1, u - 0.003, 0.08); bx('plastic', 0.075, 0.05, 0.1, u - 0.003, 1.47);
    bx('gold', 0.01, 1.3, 0.005, u + 0.03, 0.15, 0.07);
  });

  // --- conectores: 24 pines (borde derecho), 8 pines CPU (arriba), SATA, headers
  bx('plastic', 0.09, 0.62, 0.11, 1.585, 0.18);
  for (let i = 0; i < 12; i++) bx('chip', 0.06, 0.035, 0.005, 1.6, 0.2 + i * 0.05, 0.11);
  bx('plastic', 0.2, 0.09, 0.11, 0.08, 0.0);                                                    // EPS 8 pines
  [0.97, 1.09].forEach((v) => { bx('plastic', 0.1, 0.08, 0.06, 1.5, v); bx('chip', 0.06, 0.03, 0.004, 1.52, v + 0.025, 0.06); });   // SATA
  [[1.0, 0.04], [1.16, 0.04], [1.0, 1.62], [1.42, 1.62], [0.06, 1.62], [1.6, 0.86]].forEach(([u, v]) => { bx('plastic', 0.1, 0.05, 0.05, u, v); for (let i = 0; i < 4; i++) bx('gold', 0.008, 0.008, 0.03, u + 0.01 + i * 0.022, v + 0.02, 0.05); });

  // --- disipador del chipset + M.2 (con logo y franja), PCIe x16 reforzado
  bx('alu', 0.9, 0.38, 0.07, 0.34, 1.08);
  for (let i = 0; i < 12; i++) bx('aluLight', 0.9, 0.008, 0.012, 0.34, 1.1 + i * 0.03, 0.07);
  bx('red', 0.12, 0.12, 0.01, 0.95, 1.2, 0.075);
  bx('plastic', 0.89, 0.07, 0.11, 0.14, 1.56);
  bx('silver', 0.89, 0.075, 0.02, 0.14, 1.556, 0.10);                                          // refuerzo metálico
  bx('plastic', 0.05, 0.1, 0.12, 1.03, 1.55);                                                  // seguro

  // --- audio (codec + condensadores dorados) junto al I/O, chips varios, batería
  bx('chip', 0.08, 0.08, 0.012, 0.05, 1.18);
  for (let i = 0; i < 6; i++) cy('gold', 0.02, 0.06, 0.06 + (i % 3) * 0.06, 1.32 + Math.floor(i / 3) * 0.08);
  bx('chip', 0.12, 0.12, 0.015, 1.05, 0.95); bx('chip', 0.08, 0.08, 0.012, 0.18, 0.95); bx('chip', 0.06, 0.1, 0.012, 0.92, 1.0);
  cy('silver', 0.06, 0.012, 1.25, 1.53, 0, 32);
  // cientos de componentes SMD en las zonas libres
  const free = [[1.1, 1.55, 0.9, 1.5], [0.32, 0.45, 0.42, 0.95], [1.0, 1.22, 0.4, 0.92], [0.05, 0.3, 1.1, 1.55], [0.35, 1.2, 1.47, 1.55]];
  for (let n = 0; n < 520; n++) {
    const [u0, u1, v0, v1] = free[n % free.length];
    const u = u0 + Math.random() * (u1 - u0), v = v0 + Math.random() * (v1 - v0), big = Math.random() < 0.15;
    bx(big ? 'chip' : 'smd', big ? 0.03 : 0.012, big ? 0.03 : 0.007, big ? 0.008 : 0.005, u, v);
  }

  const items = Object.entries(lists).map(([m, geos]) => ({ g: mergeGeometries(geos), mat: m === 'pcb' ? pcbM : mats[m] }));
  items.forEach((it) => { it.g.computeBoundingBox(); it.g.computeBoundingSphere(); });
  const sock = P(0.69, 0.64, 0.055);
  return {
    items,
    cpuBase: [sock[0], sock[1], sock[2]],
    ramBases: [1.275, 1.415].map((u) => { const p = P(u, 0.8, 0.07); return [p[0] - 0.04, p[1], p[2]]; }),
  };
}

/* PC chico: Ncase M1 (ITX, ~13 L) + placa Mini-ITX hecha por código + Wraith Stealth.
   Archivo del Ncase: x = ancho (lado de la placa +x), y = alto, z = profundidad (panel trasero en -z). */
const kitITX = () => once('itx', async () => {
  const [caseS, wrS] = await Promise.all([load('ncase-m1'), load('amd-wraith-stealth')]);
  const k = 0.8;
  const MC = new THREE.Matrix4().set(-k, 0, 0, -0.392, 0, k, 0, 0, 0, 0, k, 1.2, 0, 0, 0, 1);
  const all = bake(caseS, MC);
  // la carcasa y sus mallas perforadas vienen juntas: se separan en lateral abierto, lateral de la placa, techo, frente y marco
  // solo triángulos enteros de cada lado: lo que cruza una esquina se queda en el marco (sin bordes rotos)
  // En el Ncase solo sale el lateral abierto (por ahí salen las piezas); el resto de la carcasa es una sola
  // pieza de aluminio con esquinas curvas y se queda entera, sin cortes.
  const [side, rest] = splitTris(all, (c) => c.x > 0.3, true);
  const out = { case: merge(rest), glass: merge(side), rear: [], top: [], front: [], cover: [] };
  out.floorY = boxOf(all).min.y;

  // Placa Mini-ITX hecha por código, completa y al detalle (ver buildItxBoard)
  const itxb = buildItxBoard();
  out.mb = itxb.items; out.cpuBase = itxb.cpuBase; out.ramBases = itxb.ramBases; out.ssdBase = null;

  // AMD Wraith Stealth (disipador bajo, 54 mm)
  const wr = bake(wrS, basis([0, 1, 0], [1, 0, 0], [0, 0, 1]));
  place(wr, 0.95 / boxOf(wr).getSize(V()).y, (b) => V(b.min.x, ctr(b).y, ctr(b).z), [0, 0, 0]);
  out.cooler = merge(wr);
  out.gpuShift = [0, -0.73, 0.69];       // la 4060 baja a las ranuras del Ncase y su bracket queda en el panel trasero
  return out;
});

/* ------------------------------------------------------------------ */
/* Piezas distintas por equipo: placas, procesador, RAM, tarjetas y ventiladores */
/* ------------------------------------------------------------------ */
const mapper = (B, k, d) => (pt) => V(...pt).applyMatrix4(B).multiplyScalar(k).add(d);

// Placas ATX: se calzan con el borde superior en y = 2.275, el borde del I/O en z = -1.92 y la cara trasera en x = -1.12
const BOARDS = {
  // Gigabyte B550 AORUS ELITE V2 (archivo acostado, componentes hacia +y, I/O en -x, borde superior en -z)
  b550: { file: 'b550-aorus-elite', B: basis([0, 0, 1], [1, 0, 0], [0, -1, 0]), k: 3.05 / 4.68, skip: ['Object_45'],
    sock: [0.035, 0, -0.495], ram: [[0.93, 0, -0.529], [1.199, 0, -0.529]], pcie: [0, 0, 0.885] },
  // MSI MEG Z590 ACE (archivo acostado y girado: borde superior en +x, I/O en -z)
  z590: { file: 'msi-z590-ace', B: basis([0, 1, 0], [1, 0, 0], [0, 0, 1]), k: 100, skip: [],
    sock: [0.00624, 0, 0.000465], ram: [[0.0064, 0, 0.00698], [0.0064, 0, 0.00872]], pcie: [-0.00335, 0, 0] },
};
const kitBoard = (id) => once('board-' + id, async () => {
  const c = BOARDS[id];
  const l = bake(await load(c.file), c.B, c.skip);
  const d = place(l, c.k, (b) => V(b.min.x, b.max.y, b.min.z), [-1.12, 2.275, -1.92]);
  const mp = mapper(c.B, c.k, d);
  const mb = merge(l);
  const sp = mp(c.sock);
  const cpuBase = [surfaceX(mb, sp.y, sp.z) ?? -1.03, sp.y, sp.z];
  const ramBases = c.ram.map((r) => { const q = mp(r); return [(surfaceX(mb, q.y, q.z) ?? -1.0) - 0.03, q.y, q.z]; });
  return { mb, cpuBase, ramBases, ssdBase: null, pcieY: mp(c.pcie).y };
});

// Intel Core i9-11900K (LGA1200, 37,5 mm)
const kitI9 = () => once('i9', async () => {
  const l = bake(await load('i9-11900k'), basis([0, 0, 1], [1, 0, 0], [0, -1, 0]));
  place(l, 0.375 / boxOf(l).getSize(V()).z, (b) => V(b.min.x, ctr(b).y, ctr(b).z), [0, 0, 0]);
  return { items: merge(l) };
});

// RAM: Corsair Vengeance RGB PRO (un módulo) y G.Skill Trident Z (el archivo trae dos módulos juntos)
const kitVengeance = () => once('vengeance', async () => {
  const l = bake(await load('vengeance-rgb-pro'), basis([0, 0, -1], [1, 0, 0], [0, 1, 0]));
  place(l, 1.34 / boxOf(l).getSize(V()).y, (b) => V(b.min.x, ctr(b).y, ctr(b).z), [0, 0, 0]);
  const m = merge(l); return { sticks: [m, m] };
});
const kitTrident = () => once('trident', async () => {
  const l = bake(await load('gskill-tridentz'), basis([1, 0, 0], [0, 1, 0], [0, 0, -1]));
  const [a, b] = splitTris(l, (c) => c.z > -0.08);
  const sticks = [a, b].map((st) => {
    const geo = st.map((it) => ({ ...it, g: it.g.toNonIndexed() }));      // cada módulo con su propia geometría
    const k = 1.34 / boxOf(geo).getSize(V()).y;
    place(geo, k, (bb) => V(bb.min.x, ctr(bb).y, ctr(bb).z), [0, 0, 0]);
    return merge(geo.map((it) => ({ ...it, g: ensureIndex(it.g) })));
  });
  return { sticks };
});

// Tarjetas: MSI RTX 3080 Gaming X Trio y RTX 3070 Founders Edition (mismo calce que la 4090: bracket atrás, PCIe hacia la placa)
const gpuFromFile = (key, file, B, len) => once(key, async () => {
  const l = bake(await load(file), B);
  place(l, len / boxOf(l).getSize(V()).z, (b) => V(b.min.x, b.max.y, b.min.z), [-1.12, 0.54, -2.24]);
  const b = boxOf(l);
  return { items: merge(l), power: [b.max.x + 0.02, b.max.y - 0.14, (b.min.z + b.max.z) / 2 + 0.35] };
});
const kit3080 = () => gpuFromFile('3080', 'msi-3080-trio', basis([0, 0, 1], [0, -1, 0], [-1, 0, 0]), 3.23);
// Gigabyte RTX 4090 AERO (blanca): archivo con el largo en z (bracket en +z), PCIe hacia -x, ventiladores hacia -y
const kitAero = () => gpuFromFile('aero', 'aero-4090', basis([1, 0, 0], [0, 1, 0], [0, 0, -1]), 3.42);

// Ventiladores Lian Li UNI FAN SL120 (negro o blanco)
const kitLianLi = (color) => once('lianli-' + color, async () => {
  const l = bake(await load('lianli-sl120-' + color), basis([1, 0, 0], [0, 0, 1], [0, 1, 0]));
  place(l, 1.2 / boxOf(l).getSize(V()).x, ctr, [0, 0, 0]);
  const [rotor, frame] = splitTris(l, (c) => Math.hypot(c.x, c.y) < 0.52);
  return { frame: merge(frame), rotor: merge(rotor) };
});

let kitP = null;
const realKit = () => (kitP ||= buildKit().catch((e) => { console.warn('Modelos 3D reales no disponibles, quedan las piezas por código.', e); return null; }));

/* ------------------------------------------------------------------ */
export async function applyRealParts(pc, variant = {}) {
  const kit = await realKit();
  if (!kit) return false;
  const [v2, aio, cm, g4060, itx] = await Promise.all([
    variant.case === 'v2' ? kitCaseV2() : null,
    variant.cooler === 'aio' ? kitAIO(kit.coolerBase) : null,
    variant.cooler === 'cm' ? kitCM() : null,
    variant.gpu === 'rtx4060' ? kit4060() : null,
    variant.case === 'ncase' ? kitITX() : null,
  ]);
  const [brd, i9, ramKit, gExtra, fanKit] = await Promise.all([
    BOARDS[variant.board] ? kitBoard(variant.board) : null,
    variant.cpu === 'i9' ? kitI9() : null,
    variant.ram === 'trident' ? kitTrident() : variant.ram === 'vengeance' ? kitVengeance() : null,
    variant.gpu === '3080trio' ? kit3080() : variant.gpu === 'aero4090' ? kitAero() : null,
    variant.fans?.startsWith('lianli') ? kitLianLi(variant.fans.split('-')[1]) : null,
  ]);
  const shell = itx || v2 || kit;
  const P = (id) => pc.parts[id].pieces;

  // origin: punto del equipo al que corresponde el (0,0,0) de la geometría
  const fill = (piece, items, origin = [0, 0, 0], tweak) => {
    const obj = piece.obj;
    [...obj.children].forEach((c) => { if (!c.isLight) obj.remove(c); });
    if (obj.isMesh) obj.geometry = new THREE.BufferGeometry();
    items.forEach(({ g, mat }) => {
      const m = new THREE.Mesh(g, mat);
      m.position.set(origin[0] - piece.base.x, origin[1] - piece.base.y, origin[2] - piece.base.z);
      m.castShadow = true; m.receiveShadow = true;
      tweak?.(m);
      obj.add(m);
    });
  };

  // gabinete y paneles (vidrio, panel trasero, frontal, techo y tapa de la cubierta)
  fill(P('case')[0], shell.case);
  const [glass, rearPanel, front, top, cover] = P('panels');
  const glassMat = glass.obj.material;
  const isGlassMat = (m) => m.material.transparent || /glass/i.test(m.material.name || '');
  fill(glass, shell.glass, undefined, (m) => { m.userData.isGlass = true; if (isGlassMat(m)) { m.material = glassMat; m.renderOrder = 10; } });
  fill(rearPanel, shell.rear);
  fill(front, shell.front, undefined, (m) => { if (isGlassMat(m)) { m.material = glassMat; m.renderOrder = 10; m.userData.isGlass = true; } });
  fill(top, shell.top);
  fill(cover, shell.cover);
  pc.floorY = (itx || v2) ? (itx || v2).floorY : -2.68;

  const board = itx || brd || kit;
  fill(P('mb')[0], board.mb);
  const cpuItems = i9 ? i9.items : kit.cpu;
  const cpu = P('cpu')[0]; cpu.base.set(...board.cpuBase); fill(cpu, cpuItems, board.cpuBase);
  const coolerBase = board === kit ? kit.coolerBase : [board.cpuBase[0] + boxOf(cpuItems).getSize(V()).x, board.cpuBase[1], board.cpuBase[2]];
  const cool = P('cooler')[0]; cool.base.set(...coolerBase);
  if (itx) fill(cool, itx.cooler, coolerBase);
  if (aio) fill(cool, aio.items);                                  // bomba, mangueras y radiador se mueven juntos
  if (cm) fill(cool, cm.items, kit.coolerBase);

  // almacenamiento: 990 PRO real en el M.2_1; el segundo M.2 de la placa queda bajo su disipador (no se dibuja)
  const nv = pc.parts.nvme;
  const [ssd, wd, crucial] = nv.pieces;
  if (board.ssdBase) { ssd.base.set(...board.ssdBase); fill(ssd, kit.ssd, board.ssdBase); }
  // tornillo del M.2 en el extremo opuesto al conector
  if (board.ssdBase) ssd.obj.add(pc.screws([[boxTop(kit.ssd) + 0.004, 0, -0.395, '+x']], 0.02, 0x8a8a8a, 0x1a1a1a));
  // en placas con disipador sobre el M.2 el SSD queda tapado: no se dibuja
  [wd, ...(board.ssdBase ? [] : [ssd])].forEach((x) => x.obj.parent?.remove(x.obj));
  nv.pieces = nv.pieces.filter((p) => p !== wd && (board.ssdBase || p !== ssd));
  crucial.base.set(-1.142, 0.9, -0.55); // detrás de la placa, en el recorte de la bandeja

  P('ram').forEach((p, i) => { p.base.set(...board.ramBases[i]); fill(p, ramKit ? ramKit.sticks[i] : kit.ram, board.ramBases[i]); });
  // la tarjeta baja o sube según dónde queda el PCIe x16 de cada placa
  const gk = g4060 || gExtra;
  const dy = (board.pcieY ?? 0.441) - 0.441;
  const gShift = itx ? itx.gpuShift : [0, dy, 0];
  fill(P('gpu')[0], gk ? gk.items : kit.gpu, gShift);
  const gPower = (gk ? gk.power : kit.gpuPower).map((v, i) => v + gShift[i]);

  // ventiladores: marco fijo + rotor que gira; 3 al frente y 1 atrás, dentro del marco de acero
  // con AIO, el radiador trae sus 2 ventiladores: salen los 2 frontales de arriba
  if (aio) {
    const fp = pc.parts.fans;
    fp.pieces.slice(0, 2).forEach((p) => p.obj.parent?.remove(p.obj));
    fp.pieces = fp.pieces.slice(2);
  }
  pc.parts.fans.pieces.forEach((p) => {
    const rearFan = p.rear ??= p.base.z < 0;
    p.obj.rotation.y = 0;
    p.base.set(rearFan ? 0.15 : 0, rearFan ? 1.6 : p.base.y, rearFan ? -1.93 : (v2 ? v2.frontFanZ : 1.66));
    fill(p, fanKit ? fanKit.frame : kit.fanFrame, [p.base.x, p.base.y, p.base.z]);
    (fanKit ? fanKit.rotor : kit.fanRotor).forEach(({ g, mat }) => {
      const r = new THREE.Mesh(g, mat); r.castShadow = true;
      r.userData.speed = rearFan ? -1 : 1;
      p.obj.add(r); pc.spinners.push(r);
    });
    p.obj.children.forEach((c) => { if (c.isLight) c.position.set(0, 0, rearFan ? 0.35 : -0.35); });
    // 4 tornillos en las esquinas, del lado que da al marco del gabinete
    const zf = rearFan ? -0.135 : 0.135;
    p.obj.add(pc.screws([[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => [a * 0.525, b * 0.525, zf, rearFan ? '-z' : '+z']), 0.03, 0x2a2a2a, 0x0a0a0a));
  });

  if (itx) {
    // PC chico: sin ventiladores de gabinete, sin cables largos ni SSD extra; fuente SFX al frente, sobre la tarjeta
    const drop = (id, keepFn = () => false) => { const part = pc.parts[id]; part.pieces.filter((x) => !keepFn(x)).forEach((x) => x.obj.parent?.remove(x.obj)); part.pieces = part.pieces.filter(keepFn); };
    drop('fans'); drop('cables'); drop('nvme', (x) => x === ssd);
    const psu = P('psu')[0];
    psu.base.set(-0.78, 1.03, 1.4); psu.obj.rotation.set(0, 0, Math.PI / 2); psu.obj.scale.set(0.83, 0.74, 0.62);
    psu.obj.traverse((o) => { if (o.userData.flip) o.visible = false; });   // sin la etiqueta de la RM850x
    pc.afterSwap();
  } else pc.reroute12V(gPower); // incluye afterSwap()
  if (v2) addGrommets(pc);
  pc.update(0, 0);
  return true;
}
