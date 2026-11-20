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

// Escala uniforme y lleva el punto ancla de la pieza a `to`. Devuelve el desplazamiento aplicado.
function place(list, s, anchor, to) {
  list.forEach(({ g }) => g.scale(s, s, s));
  const a = anchor(boxOf(list));
  const d = V(...to).sub(a);
  list.forEach(({ g }) => g.translate(d.x, d.y, d.z));
  return d;
}

// Separa los triángulos de una malla según la posición de su centro
function splitTris(list, pred) {
  const yes = [], no = [];
  const v = V(), c = V();
  list.forEach((it) => {
    const idx = it.g.index.array, pos = it.g.attributes.position, A = [], B = [];
    for (let i = 0; i < idx.length; i += 3) {
      c.set(0, 0, 0);
      for (let k = 0; k < 3; k++) c.add(v.fromBufferAttribute(pos, idx[i + k]));
      (pred(c.multiplyScalar(1 / 3)) ? A : B).push(idx[i], idx[i + 1], idx[i + 2]);
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

let kitP = null;
const realKit = () => (kitP ||= buildKit().catch((e) => { console.warn('Modelos 3D reales no disponibles, quedan las piezas por código.', e); return null; }));

/* ------------------------------------------------------------------ */
export async function applyRealParts(pc) {
  const kit = await realKit();
  if (!kit) return false;
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
  fill(P('case')[0], kit.case);
  const [glass, rearPanel, front, top, cover] = P('panels');
  const glassMat = glass.obj.material;
  fill(glass, kit.glass, undefined, (m) => { m.userData.isGlass = true; if (m.material.transparent) { m.material = glassMat; m.renderOrder = 10; } });
  fill(rearPanel, kit.rear);
  fill(front, kit.front);
  fill(top, kit.top);
  fill(cover, kit.cover);

  fill(P('mb')[0], kit.mb);
  const cpu = P('cpu')[0]; cpu.base.set(...kit.cpuBase); fill(cpu, kit.cpu, kit.cpuBase);
  const cool = P('cooler')[0]; cool.base.set(...kit.coolerBase);

  // almacenamiento: 990 PRO real en el M.2_1; el segundo M.2 de la placa queda bajo su disipador (no se dibuja)
  const nv = pc.parts.nvme;
  const [ssd, wd, crucial] = nv.pieces;
  ssd.base.set(...kit.ssdBase); fill(ssd, kit.ssd, kit.ssdBase);
  wd.obj.parent?.remove(wd.obj);
  nv.pieces = nv.pieces.filter((p) => p !== wd);
  crucial.base.set(-1.142, 0.9, -0.55); // detrás de la placa, en el recorte de la bandeja

  P('ram').forEach((p, i) => { p.base.set(...kit.ramBases[i]); fill(p, kit.ram, kit.ramBases[i]); });
  fill(P('gpu')[0], kit.gpu);

  // ventiladores: marco fijo + rotor que gira; 3 al frente y 1 atrás, dentro del marco de acero
  P('fans').forEach((p, i) => {
    const rearFan = i === 3;
    p.obj.rotation.y = 0;
    p.base.set(rearFan ? 0.15 : 0, rearFan ? 1.6 : p.base.y, rearFan ? -1.93 : 1.66);
    fill(p, kit.fanFrame, [p.base.x, p.base.y, p.base.z]);
    kit.fanRotor.forEach(({ g, mat }) => {
      const r = new THREE.Mesh(g, mat); r.castShadow = true;
      r.userData.speed = rearFan ? -1 : 1;
      p.obj.add(r); pc.spinners.push(r);
    });
    p.obj.children.forEach((c) => { if (c.isLight) c.position.set(0, 0, rearFan ? 0.35 : -0.35); });
  });

  pc.reroute12V(kit.gpuPower); // incluye afterSwap()
  return true;
}
