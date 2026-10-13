import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CatmullRomCurve3,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshStandardMaterialParameters,
  Object3D,
  PCFSoftShadowMap,
  Path,
  PerspectiveCamera,
  RepeatWrapping,
  RingGeometry,
  SRGBColorSpace,
  Scene,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * "Một chuyến cứu hộ": mô hình đường phố low-poly dựng hoàn toàn bằng code (không có tệp 3D ngoài).
 * Xe của khách chết máy bên đường, thợ chạy tới theo đường, sửa xong. Trạng thái duy nhất là `time`
 * (giây trong một chu kỳ); vị trí xe, vòng quay bánh, đèn, ghim, bánh răng và thẻ trạng thái ngoài DOM
 * đều suy ra từ nó nên tạm dừng hay tua đều nhất quán.
 */

export type Phase = 0 | 1 | 2 | 3 | 4;
export interface SceneState {
  phase: Phase;
  etaMin: number;
}
export interface RescueSceneOptions {
  host: HTMLElement;
  reducedMotion: boolean;
  onState: (s: SceneState) => void;
}
export interface RescueScene {
  setActive(v: boolean): void;
  setPaused(v: boolean): void;
  dispose(): void;
}

/* ----- Dòng thời gian (giây) ----- */
const T_ACCEPT = 2.8; // hết "đang tìm thợ", thợ nhận đơn
const T_GO = 3.5; // bắt đầu chạy
const T_ARRIVE = 9.2; // thợ tới nơi
const T_FIX = 10.4; // bắt đầu sửa
const T_FADE = 13.6; // mờ dần rồi lặp lại
const CYCLE = 14.4;
const FREEZE_AT = 11.8; // khung hình tĩnh khi giảm chuyển động
const ETA_TOTAL_MIN = 6;
/** Xe và người phóng to so với nhà cửa để còn đọc được ở khung hình tổng quát. */
const VS = 1.55;

const C = {
  ground: 0xf3e6d6,
  platformSide: 0xd8c1a6,
  road: 0x2f3a4c,
  roadLine: 0xf8fafc,
  sidewalk: 0xe9ddcc,
  ink: 0x0b1c30,
  orange: 0xf97316,
  cta: 0xd2450b,
  blue: 0x0d47a1,
  blueBright: 0x2563eb,
  green: 0x16a34a,
  skin: 0xf0c4a0,
  leaf: 0x5aa469,
  leafDark: 0x3f8a55,
  trunk: 0x8a5a3c,
  glass: 0xbcd3f2,
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeInOutCubic = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const easeOutBack = (x: number) => {
  const t = clamp01(x);
  const c1 = 1.55;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function createRescueScene({ host, reducedMotion, onState }: RescueSceneOptions): RescueScene {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;';
  host.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(44, 1, 0.1, 100);
  camera.position.set(12.5, 12.5, 14.5);
  camera.lookAt(0.3, 0.2, 0.5);

  scene.add(new HemisphereLight(0xfff4e6, 0xd9c5b0, 1.25));
  const sun = new DirectionalLight(0xfff1dd, 2.4);
  sun.position.set(6, 11, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  const sc = sun.shadow.camera;
  sc.left = -9;
  sc.right = 9;
  sc.top = 9;
  sc.bottom = -9;
  sc.near = 1;
  sc.far = 30;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  /** Mọi thứ của diorama nằm trong `world` để xoay theo con trỏ và cuộn trang. */
  const world = new Group();
  scene.add(world);

  const mat = (color: number, o: MeshStandardMaterialParameters = {}) =>
    new MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.04, ...o });

  const add = (parent: Object3D, geo: BufferGeometry, m: Material, x = 0, y = 0, z = 0, shadow = true) => {
    const me = new Mesh(geo, m);
    me.position.set(x, y, z);
    me.castShadow = shadow;
    me.receiveShadow = true;
    parent.add(me);
    return me;
  };

  /** Trụ nối hai điểm, dùng cho tay chân người và càng xe. */
  const limb = (parent: Object3D, a: Vector3, b: Vector3, r: number, m: Material) => {
    const dir = new Vector3().subVectors(b, a);
    const len = dir.length();
    const me = new Mesh(new CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 4, 8), m);
    me.position.copy(a).addScaledVector(dir, 0.5);
    me.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize());
    me.castShadow = true;
    parent.add(me);
    return me;
  };

  /* ================= Thành phố ================= */

  function windowTexture(wall: string, glass: string, cols: number, rows: number) {
    const w = 128;
    const h = 128;
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const g = cv.getContext('2d')!;
    g.fillStyle = wall;
    g.fillRect(0, 0, w, h);
    const cw = w / cols;
    const ch = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        g.fillStyle = (r * 7 + c * 3) % 5 === 0 ? '#E9EEF7' : glass;
        g.fillRect(c * cw + cw * 0.2, r * ch + ch * 0.22, cw * 0.6, ch * 0.5);
      }
    }
    const tex = new CanvasTexture(cv);
    tex.colorSpace = SRGBColorSpace;
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
  }

  function building(x: number, z: number, w: number, d: number, h: number, wall: string, roof: number) {
    const cols = Math.max(2, Math.round(w * 1.6));
    const rows = Math.max(2, Math.round(h * 1.5));
    const tex = windowTexture(wall, '#8FB0DE', cols, rows);
    const side = new MeshStandardMaterial({ map: tex, roughness: 0.85 });
    const top = mat(roof);
    const me = new Mesh(new BoxGeometry(w, h, d), [side, side, top, top, side, side]);
    me.position.set(x, h / 2, z);
    me.castShadow = true;
    me.receiveShadow = true;
    world.add(me);
    // viền mái
    add(world, new BoxGeometry(w + 0.12, 0.1, d + 0.12), mat(roof), x, h + 0.05, z);
    return me;
  }

  function tree(x: number, z: number, s = 1) {
    const g = new Group();
    add(g, new CylinderGeometry(0.07, 0.1, 0.5, 6), mat(C.trunk), 0, 0.25, 0);
    add(g, new IcosahedronGeometry(0.42, 0), mat(C.leaf), 0, 0.85, 0);
    add(g, new IcosahedronGeometry(0.3, 0), mat(C.leafDark), 0.08, 1.2, 0.04);
    g.position.set(x, 0, z);
    g.scale.setScalar(s);
    world.add(g);
  }

  function lamp(x: number, z: number, rot = 0) {
    const g = new Group();
    add(g, new CylinderGeometry(0.04, 0.05, 1.6, 6), mat(0x44506a), 0, 0.8, 0);
    add(g, new BoxGeometry(0.4, 0.04, 0.04), mat(0x44506a), 0.18, 1.6, 0);
    add(g, new BoxGeometry(0.16, 0.05, 0.1), mat(0xfff3c4, { emissive: 0xffe9a8, emissiveIntensity: 0.6 }), 0.36, 1.58, 0, false);
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    world.add(g);
  }

  function buildCity() {
    // Bệ diorama
    const base = new Mesh(new RoundedBoxGeometry(14.4, 0.8, 12.4, 3, 0.3), mat(C.platformSide));
    base.position.set(0, -0.4 - 0.001, 0);
    base.receiveShadow = true;
    base.castShadow = true;
    world.add(base);
    add(world, new RoundedBoxGeometry(14, 0.12, 12, 3, 0.05), mat(C.ground), 0, -0.06, 0, false);

    // Đường chính (z 0.1..2.7), đường nhánh phía sau (x -4.7..-2.5)
    const road = mat(C.road, { roughness: 0.92 });
    add(world, new BoxGeometry(14, 0.06, 2.6), road, 0, 0.0, 1.4, false);
    add(world, new BoxGeometry(2.2, 0.06, 6.1), road, -3.6, 0.0, -2.95, false);
    // vạch kẻ
    const line = mat(C.roadLine, { roughness: 0.6 });
    for (let x = -6.6; x <= 6.6; x += 0.9) {
      if (x > -4.8 && x < -2.4) continue;
      add(world, new BoxGeometry(0.45, 0.012, 0.07), line, x, 0.035, 1.4, false);
    }
    for (let z = -5.6; z <= -0.5; z += 0.9) {
      add(world, new BoxGeometry(0.07, 0.012, 0.45), line, -3.6, 0.035, z, false);
    }
    // vạch qua đường
    for (let i = 0; i < 5; i++) {
      add(world, new BoxGeometry(0.1, 0.012, 0.36), line, -1.9, 0.035, 0.45 + i * 0.5, false);
    }

    // Vỉa hè
    const walk = mat(C.sidewalk);
    add(world, new BoxGeometry(14, 0.12, 1.2), walk, 0, 0.0, 3.3, false); // phía trước
    add(world, new BoxGeometry(9.3, 0.12, 1.2), walk, 2.35, 0.0, -0.5, false); // phía sau phải
    add(world, new BoxGeometry(2.3, 0.12, 1.2), walk, -5.85, 0.0, -0.5, false); // phía sau trái
    add(world, new BoxGeometry(0.9, 0.12, 5.4), walk, -2.05, 0.0, -3.1, false);
    add(world, new BoxGeometry(0.9, 0.12, 5.4), walk, -5.15, 0.0, -3.1, false);

    // Dãy nhà phía sau
    building(-6.0, -3.6, 1.5, 2.6, 2.4, '#FDE3C8', 0xe9a66a);
    building(-6.1, -1.9, 1.3, 1.1, 1.3, '#DCE8FB', 0x7ea0d8);
    building(-1.2, -4.6, 2.0, 2.2, 3.1, '#FFFFFF', 0xcfd6e3);
    building(0.9, -4.2, 1.8, 2.8, 2.0, '#FBD9B7', 0xe9a66a);
    building(2.9, -4.7, 2.0, 2.0, 3.6, '#DCE8FB', 0x7ea0d8);
    building(4.9, -4.0, 1.9, 2.9, 1.8, '#FFFFFF', 0xcfd6e3);
    building(6.2, -2.2, 1.2, 1.7, 2.6, '#FBD9B7', 0xe9a66a);

    // Tiệm sửa xe phía trước bên phải: mái hiên xanh, biển, cửa cuốn
    const shop = new Group();
    add(shop, new BoxGeometry(2.6, 1.3, 1.5), mat(0xffffff), 0, 0.65, 0);
    add(shop, new BoxGeometry(2.8, 0.1, 1.7), mat(C.blue), 0, 1.35, 0.05);
    const awning = add(shop, new BoxGeometry(2.7, 0.08, 0.7), mat(C.blueBright), 0, 1.05, 0.95);
    awning.rotation.x = -0.28;
    add(shop, new BoxGeometry(1.5, 0.82, 0.05), mat(0xc9d3e3), -0.35, 0.45, 0.78); // cửa cuốn
    add(shop, new BoxGeometry(0.62, 0.6, 0.05), mat(C.glass, { roughness: 0.3 }), 0.85, 0.7, 0.78);
    add(shop, new BoxGeometry(1.5, 0.28, 0.06), mat(C.orange), 0, 1.58, 0.0); // biển
    shop.position.set(4.3, 0, 5.0);
    world.add(shop);

    // Công viên nhỏ phía trước trái
    add(world, new BoxGeometry(5.2, 0.1, 1.9), mat(0xcfe5c8), -3.6, 0.0, 4.95, false);
    tree(-5.4, 4.9, 1.1);
    tree(-4.2, 5.4, 0.9);
    tree(-2.7, 4.7, 1.2);
    tree(-1.3, 5.3, 0.85);
    tree(6.2, 3.4, 0.9);
    tree(-6.4, 0.9, 0.8);
    lamp(0.0, 3.0);
    lamp(-1.0, -0.8, Math.PI);
    lamp(5.6, 3.0);
  }

  /* ================= Người ================= */

  function person(shirt: number, hair: number, headgear = false, headColor: number = C.blue, legs = true) {
    const g = new Group();
    const cloth = mat(shirt);
    const dark = mat(0x273244);
    const skin = mat(C.skin);
    // chân
    if (legs) {
      add(g, new CapsuleGeometry(0.075, 0.38, 4, 8), dark, -0.09, 0.3, 0);
      add(g, new CapsuleGeometry(0.075, 0.38, 4, 8), dark, 0.09, 0.3, 0);
    }
    // thân
    add(g, new CapsuleGeometry(0.17, 0.3, 4, 10), cloth, 0, 0.78, 0);
    // đầu
    const head = new Group();
    head.position.set(0, 1.2, 0);
    add(head, new SphereGeometry(0.15, 14, 12), skin, 0, 0, 0);
    if (headgear) {
      const hm = mat(headColor, { roughness: 0.4 });
      const helmet = add(head, new SphereGeometry(0.18, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hm, 0, 0.02, 0);
      helmet.rotation.x = -0.1;
      add(head, new BoxGeometry(0.22, 0.07, 0.05), mat(0x1f2937, { roughness: 0.2 }), 0, 0.0, 0.14);
    } else {
      add(head, new SphereGeometry(0.16, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(hair), 0, 0.03, -0.01);
    }
    g.add(head);
    return { g, head, cloth, skin };
  }

  /* ================= Xe máy ================= */

  interface Scooter {
    group: Group;
    wheels: Group[];
    headlight: MeshStandardMaterial;
    hazards: MeshStandardMaterial;
    tail: MeshStandardMaterial;
  }

  const WHEEL_R = 0.275;

  function wheel() {
    const w = new Group();
    add(w, new TorusGeometry(0.2, 0.075, 10, 26), mat(0x1c2433, { roughness: 0.95 }), 0, 0, 0);
    const rim = add(w, new CylinderGeometry(0.15, 0.15, 0.09, 18), mat(0xdfe5ee, { metalness: 0.4, roughness: 0.4 }), 0, 0, 0);
    rim.rotation.x = Math.PI / 2;
    add(w, new BoxGeometry(0.05, 0.2, 0.1), mat(0x9aa7bb), 0, 0.07, 0, false); // vạch để thấy bánh quay
    return w;
  }

  function scooter(bodyColor: number, accent: number, withBox: boolean): Scooter {
    const g = new Group();
    const body = mat(bodyColor, { roughness: 0.45, metalness: 0.12 });

    // Thân xe: một đường viền nhìn nghiêng rồi đùn ra, vát cạnh để bắt sáng
    const s = new Shape();
    s.moveTo(-0.8, 0.52);
    s.quadraticCurveTo(-0.84, 0.76, -0.62, 0.8);
    s.lineTo(-0.18, 0.78);
    s.lineTo(-0.1, 0.4);
    s.lineTo(0.26, 0.38);
    s.quadraticCurveTo(0.36, 0.5, 0.4, 0.98);
    s.lineTo(0.5, 0.98);
    s.lineTo(0.52, 0.62);
    s.lineTo(0.34, 0.6);
    s.lineTo(0.28, 0.26);
    s.lineTo(-0.14, 0.26);
    s.lineTo(-0.3, 0.52);
    s.closePath();
    const shell = new ExtrudeGeometry(s, {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
      curveSegments: 10,
    });
    shell.translate(0, 0, -0.1);
    add(g, shell, body, 0, 0, 0);

    // Yên, tay lái, đèn
    add(g, new RoundedBoxGeometry(0.66, 0.1, 0.26, 3, 0.04), mat(0x1f2937, { roughness: 0.6 }), -0.42, 0.88, 0);
    add(g, new CylinderGeometry(0.022, 0.022, 0.56, 8), mat(0x2a3446), 0.45, 1.06, 0).rotation.x = Math.PI / 2;
    const accentMat = mat(accent, { roughness: 0.4 });
    add(g, new CylinderGeometry(0.035, 0.035, 0.1, 8), accentMat, 0.45, 1.06, 0.3).rotation.x = Math.PI / 2;
    add(g, new CylinderGeometry(0.035, 0.035, 0.1, 8), accentMat, 0.45, 1.06, -0.3).rotation.x = Math.PI / 2;
    add(g, new BoxGeometry(0.1, 0.07, 0.4), accentMat, 0.18, 0.4, 0, false); // sọc nhận dạng bên sàn để chân
    const headlight = mat(0xfff8e1, { emissive: 0xffe9a8, emissiveIntensity: 0, roughness: 0.2 });
    add(g, new SphereGeometry(0.075, 12, 10), headlight, 0.54, 0.9, 0, false).scale.set(0.6, 1, 1.3);
    const tail = mat(0xdc2626, { emissive: 0xdc2626, emissiveIntensity: 0.2 });
    add(g, new BoxGeometry(0.05, 0.06, 0.16), tail, -0.88, 0.68, 0, false);
    // gương
    limb(g, new Vector3(0.44, 1.08, 0.2), new Vector3(0.36, 1.3, 0.3), 0.012, mat(0x2a3446));
    limb(g, new Vector3(0.44, 1.08, -0.2), new Vector3(0.36, 1.3, -0.3), 0.012, mat(0x2a3446));
    // ống xả
    const pipe = add(g, new CylinderGeometry(0.04, 0.05, 0.42, 8), mat(0xaeb8c8, { metalness: 0.6, roughness: 0.35 }), -0.55, 0.3, 0.17);
    pipe.rotation.z = Math.PI / 2;
    // càng trước
    limb(g, new Vector3(0.46, 0.98, 0.075), new Vector3(0.55, WHEEL_R, 0.075), 0.022, mat(0xaeb8c8, { metalness: 0.5 }));
    limb(g, new Vector3(0.46, 0.98, -0.075), new Vector3(0.55, WHEEL_R, -0.075), 0.022, mat(0xaeb8c8, { metalness: 0.5 }));
    // chắn bùn sau
    const fenderBack = add(g, new TorusGeometry(0.3, 0.025, 6, 16, Math.PI), body, -0.55, WHEEL_R, 0, false);
    fenderBack.scale.z = 4;

    // Bánh
    const front = wheel();
    front.position.set(0.55, WHEEL_R, 0);
    const rear = wheel();
    rear.position.set(-0.55, WHEEL_R, 0);
    g.add(front, rear);

    // Đèn cảnh báo (xe hỏng): hai chấm cam trước và sau
    const hazards = mat(0xffa94d, { emissive: 0xff8a1f, emissiveIntensity: 0 });
    add(g, new SphereGeometry(0.055, 10, 8), hazards, 0.56, 1.03, 0.14, false);
    add(g, new SphereGeometry(0.055, 10, 8), hazards, 0.56, 1.03, -0.14, false);
    add(g, new SphereGeometry(0.055, 10, 8), hazards, -0.86, 0.74, 0.1, false);
    add(g, new SphereGeometry(0.055, 10, 8), hazards, -0.86, 0.74, -0.1, false);

    if (withBox) {
      const box = new Group();
      add(box, new RoundedBoxGeometry(0.4, 0.34, 0.46, 3, 0.04), mat(C.blue, { roughness: 0.5 }), 0, 0, 0);
      add(box, new BoxGeometry(0.42, 0.06, 0.12), mat(0xffffff), 0, 0.06, 0, false);
      add(box, new BoxGeometry(0.12, 0.36, 0.48), mat(C.orange), 0, 0, 0, false);
      box.position.set(-0.72, 1.07, 0);
      g.add(box);
    }

    return { group: g, wheels: [front, rear], headlight, hazards, tail };
  }

  /* ================= Dựng cảnh ================= */

  buildCity();

  // Xe của khách (cam), đỗ sát lề trên làn gần vỉa hè phía trước
  const bike = scooter(C.orange, C.ink, false);
  bike.group.position.set(2.0, 0.03, 2.15);
  bike.group.scale.setScalar(VS);
  world.add(bike.group);

  // Người khách đứng trên vỉa hè, vẫy tay
  const customer = person(C.cta, 0x2a1f1a);
  customer.g.position.set(2.5, 0.06, 3.2);
  customer.g.rotation.y = -0.4;
  customer.g.scale.setScalar(VS);
  const armPivot = new Group();
  armPivot.position.set(0.19, 0.98, 0);
  limb(armPivot, new Vector3(0, 0, 0), new Vector3(0, -0.34, 0), 0.05, mat(C.cta));
  customer.g.add(armPivot);
  const armL = new Group();
  armL.position.set(-0.19, 0.98, 0);
  limb(armL, new Vector3(0, 0, 0), new Vector3(0, -0.34, 0), 0.05, mat(C.cta));
  customer.g.add(armL);
  world.add(customer.g);

  // Xe của thợ (xanh) với hộp đồ nghề
  const mech = scooter(C.blueBright, C.orange, true);
  mech.headlight.emissiveIntensity = 0.9;
  mech.group.rotation.order = 'YXZ';
  const mechRoot = new Group();
  mechRoot.add(mech.group);
  const rider = person(C.blue, 0, true, 0xffffff, false);
  rider.g.position.set(-0.36, 0.33, 0);
  rider.g.rotation.y = Math.PI / 2; // người quay mặt về hướng +x của xe
  rider.g.scale.setScalar(0.92);
  mech.group.add(rider.g);
  // tay nắm vào ghi đông, chân đặt sàn
  const jacket = mat(C.blue);
  const pants = mat(0x273244);
  for (const side of [1, -1]) {
    limb(mech.group, new Vector3(-0.34, 1.26, 0.17 * side), new Vector3(0.45, 1.06, 0.3 * side), 0.045, jacket);
    limb(mech.group, new Vector3(-0.38, 0.95, 0.1 * side), new Vector3(0.02, 0.97, 0.12 * side), 0.07, pants);
    limb(mech.group, new Vector3(0.02, 0.97, 0.12 * side), new Vector3(0.14, 0.5, 0.14 * side), 0.06, pants);
  }
  world.add(mechRoot);

  // Đường đi của thợ: từ nhánh phía sau, rẽ vào đường chính rồi dừng cạnh xe khách
  const path = new CatmullRomCurve3(
    [
      new Vector3(-3.6, 0.03, -5.7),
      new Vector3(-3.6, 0.03, -2.6),
      new Vector3(-3.55, 0.03, -0.2),
      new Vector3(-3.2, 0.03, 0.7),
      new Vector3(-2.3, 0.03, 1.0),
      new Vector3(-1.0, 0.03, 1.0),
      new Vector3(-0.3, 0.03, 1.0),
    ],
    false,
    'centripetal',
  );
  const pathLen = path.getLength();

  // Vạch đứt chỉ đường: tan dần khi thợ chạy qua
  const DASH_N = 46;
  const dashGeo = new BoxGeometry(0.2, 0.02, 0.07);
  const dashMat = new MeshBasicMaterial({ color: C.blueBright, transparent: true, opacity: 0.9 });
  const dashes = new InstancedMesh(dashGeo, dashMat, DASH_N);
  const dashPos: { p: Vector3; yaw: number }[] = [];
  for (let i = 0; i < DASH_N; i++) {
    const u = (i + 0.5) / DASH_N;
    const p = path.getPointAt(u);
    const tg = path.getTangentAt(u);
    dashPos.push({ p, yaw: Math.atan2(-tg.z, tg.x) });
  }
  world.add(dashes);
  const dummy = new Object3D();

  // Ghim vị trí của khách
  const pin = new Group();
  const pinMat = mat(C.cta, { roughness: 0.35 });
  const cone = add(pin, new ConeGeometry(0.2, 0.5, 14), pinMat, 0, 0.25, 0);
  cone.rotation.x = Math.PI;
  add(pin, new SphereGeometry(0.26, 18, 14), pinMat, 0, 0.62, 0);
  add(pin, new SphereGeometry(0.1, 12, 10), mat(0xffffff), 0, 0.64, 0.17, false);
  pin.position.set(2.0, 2.7, 2.15);
  world.add(pin);

  // Vòng sóng lan ra khi ghép thợ
  const rings: Mesh[] = [];
  const ringMat = [0, 1, 2].map(() => new MeshBasicMaterial({ color: C.orange, transparent: true, depthWrite: false }));
  for (let i = 0; i < 3; i++) {
    const r = new Mesh(new RingGeometry(0.92, 1, 64), ringMat[i]);
    r.rotation.x = -Math.PI / 2;
    r.position.set(2.0, 0.1, 2.15);
    world.add(r);
    rings.push(r);
  }
  // Vòng xanh báo "đã tới"
  const doneMat = new MeshBasicMaterial({ color: C.green, transparent: true, depthWrite: false });
  const doneRing = new Mesh(new RingGeometry(0.9, 1, 64), doneMat);
  doneRing.rotation.x = -Math.PI / 2;
  doneRing.position.set(1.2, 0.1, 1.65);
  world.add(doneRing);

  // Bánh răng "đang sửa"
  const gearShape = new Shape();
  const teeth = 9;
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 0.42 : 0.33;
    const a2 = a + (Math.PI * 2) / (teeth * 4);
    gearShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    gearShape.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
  }
  gearShape.closePath();
  const hole = new Path();
  hole.absarc(0, 0, 0.14, 0, Math.PI * 2, true);
  gearShape.holes.push(hole);
  const gear = new Mesh(
    new ExtrudeGeometry(gearShape, { depth: 0.14, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }),
    mat(C.blueBright, { roughness: 0.35, metalness: 0.2 }),
  );
  gear.geometry.translate(0, 0, -0.07);
  gear.castShadow = true;
  const gearHolder = new Group();
  gearHolder.add(gear);
  gearHolder.rotation.y = Math.PI / 4;
  const gearRoot = new Group();
  gearRoot.add(gearHolder);
  gearRoot.position.set(2.2, 2.2, 2.6);
  world.add(gearRoot);

  /* ================= Cập nhật theo thời gian ================= */

  let lastPhase: Phase | -1 = -1;
  let lastEta = -1;
  const tmpTan = new Vector3();
  const tmpTan2 = new Vector3();

  function update(t: number) {
    // Pha
    const phase: Phase = t < T_ACCEPT ? 0 : t < T_GO ? 1 : t < T_ARRIVE ? 2 : t < T_FIX ? 3 : 4;
    const s = clamp01((t - T_GO) / (T_ARRIVE - T_GO));
    const e = easeInOutCubic(s);
    const eta = phase >= 3 ? 0 : phase < 2 ? ETA_TOTAL_MIN : Math.max(1, Math.ceil(ETA_TOTAL_MIN * (1 - e)));
    if (phase !== lastPhase || eta !== lastEta) {
      lastPhase = phase;
      lastEta = eta;
      onState({ phase, etaMin: eta });
    }

    // Ghim: rơi xuống rồi nhún nhẹ; biến mất khi thợ tới
    const pinIn = easeOutBack(t / 0.7);
    const pinOut = 1 - easeOutCubic((t - T_ARRIVE) / 0.3);
    const pinScale = Math.max(0.0001, pinIn * pinOut);
    pin.visible = pinScale > 0.001;
    pin.scale.setScalar(pinScale);
    pin.position.y = 2.65 + (1 - clamp01(t / 0.7)) * 2.4 + Math.sin(t * 3) * 0.06;

    // Sóng ghép thợ: ba vòng nối nhau trong pha 0
    for (let i = 0; i < 3; i++) {
      const local = (t - 0.5 - i * 0.55) / 1.7;
      const ring = rings[i];
      if (t < T_ACCEPT + 0.3 && local > 0 && local < 1) {
        const k = easeOutCubic(local);
        ring.visible = true;
        ring.scale.setScalar(0.4 + k * 4.2);
        ringMat[i].opacity = 0.55 * (1 - local);
      } else ring.visible = false;
    }

    // Vạch đứt: hiện lần lượt khi nhận đơn, tan dần theo xe
    const reveal = clamp01((t - T_ACCEPT) / 0.6);
    for (let i = 0; i < DASH_N; i++) {
      const u = (i + 0.5) / DASH_N;
      const appear = clamp01(reveal * 1.6 - (i / DASH_N) * 0.6);
      const passed = clamp01((e - u) * 14);
      const sc2 = easeOutCubic(appear) * (1 - passed);
      dummy.position.copy(dashPos[i].p);
      dummy.position.y = 0.06;
      dummy.rotation.set(0, dashPos[i].yaw, 0);
      dummy.scale.setScalar(Math.max(0.0001, sc2));
      dummy.updateMatrix();
      dashes.setMatrixAt(i, dummy.matrix);
    }
    dashes.instanceMatrix.needsUpdate = true;

    // Xe thợ
    const mechIn = t >= T_ACCEPT ? easeOutBack((t - T_ACCEPT) / 0.5) : 0;
    mechRoot.visible = mechIn > 0.001;
    if (mechRoot.visible) {
      const u = e;
      const p = path.getPointAt(u);
      path.getTangentAt(u, tmpTan);
      path.getTangentAt(Math.min(1, u + 0.015), tmpTan2);
      const yaw = Math.atan2(-tmpTan.z, tmpTan.x);
      const yaw2 = Math.atan2(-tmpTan2.z, tmpTan2.x);
      let dyaw = yaw2 - yaw;
      if (dyaw > Math.PI) dyaw -= Math.PI * 2;
      if (dyaw < -Math.PI) dyaw += Math.PI * 2;
      const moving = Math.sin(Math.PI * s);
      const roll = Math.max(-0.26, Math.min(0.26, dyaw * 2.2)) * (0.35 + 0.65 * moving);
      mechRoot.position.copy(p);
      mechRoot.position.y += Math.sin(u * pathLen * 5) * 0.012 * moving + (1 - Math.min(1, mechIn)) * 0.3;
      mech.group.rotation.y = yaw;
      mech.group.rotation.x = roll;
      mechRoot.scale.setScalar(Math.max(0.0001, VS * (0.8 + 0.2 * Math.min(1, mechIn))));
      for (const w of mech.wheels) w.rotation.z = -(u * pathLen) / WHEEL_R;
      rider.head.rotation.y = phase >= 3 ? Math.sin(t * 2.6) * 0.5 : 0;
    }

    // Đèn xe: nhấp nháy khi hỏng, bật đèn pha khi sửa xong
    const blink = Math.floor(t * 3.4) % 2 === 0;
    bike.hazards.emissiveIntensity = t < T_FIX && t > 0.4 ? (blink ? 2.2 : 0.1) : 0;
    const fixedK = easeOutCubic((t - T_FIX) / 0.5);
    bike.headlight.emissiveIntensity = fixedK * 1.1;
    bike.tail.emissiveIntensity = 0.2 + fixedK * 0.9;

    // Khách vẫy tay, thôi vẫy khi thợ tới
    const lower = easeOutCubic((t - T_ARRIVE) / 0.4);
    const raise = easeOutCubic((t - 0.6) / 0.4);
    const wave = Math.sin(t * 8) * 0.3 * (1 - lower);
    armPivot.rotation.z = Math.PI * 0.82 * raise * (1 - lower) + wave * raise;
    armL.rotation.z = 0.08;
    customer.head.rotation.y = lower * 0.9;

    // Vòng xanh "đã tới"
    const dk = (t - T_ARRIVE) / 1.1;
    if (dk > 0 && dk < 1) {
      doneRing.visible = true;
      doneRing.scale.setScalar(0.6 + easeOutCubic(dk) * 3.0);
      doneMat.opacity = 0.7 * (1 - dk);
    } else doneRing.visible = false;

    // Bánh răng
    const gk = easeOutBack((t - T_FIX) / 0.5);
    gearRoot.visible = gk > 0.001;
    gearRoot.scale.setScalar(Math.max(0.0001, gk * 1.25));
    gearRoot.position.y = 2.15 + Math.sin(t * 2.4) * 0.05;
    gear.rotation.z = (t - T_FIX) * 2.1;
  }

  /* ================= Vòng lặp vẽ ================= */

  // `?scene-t=<giây>` cố định cảnh ở một thời điểm, dùng để kiểm tra từng pha bằng ảnh chụp.
  const debugT = new URLSearchParams(window.location.search).get('scene-t');
  const frozen = reducedMotion || debugT !== null;
  let time = debugT !== null && Number.isFinite(Number(debugT)) ? Number(debugT) : reducedMotion ? FREEZE_AT : 0;
  let paused = false;
  let active = true;
  let raf = 0;
  let last = performance.now();
  let disposed = false;

  const ptr = { x: 0, y: 0 };
  const view = { yaw: -0.16, pitch: 0 };
  const onPointer = (ev: PointerEvent) => {
    if (frozen) return;
    const r = host.getBoundingClientRect();
    ptr.x = Math.max(-1, Math.min(1, ((ev.clientX - (r.left + r.width / 2)) / window.innerWidth) * 2));
    ptr.y = Math.max(-1, Math.min(1, ((ev.clientY - (r.top + r.height / 2)) / window.innerHeight) * 2));
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  function applyView(dt: number, instant = false) {
    const sy = reducedMotion ? 0 : Math.min(1, window.scrollY / Math.max(1, host.offsetHeight + 120));
    const targetYaw = -0.16 + ptr.x * 0.1 + sy * 0.42;
    const targetPitch = ptr.y * 0.03 - sy * 0.05;
    const k = instant ? 1 : 1 - Math.exp(-dt * 5);
    view.yaw += (targetYaw - view.yaw) * k;
    view.pitch += (targetPitch - view.pitch) * k;
    world.rotation.y = view.yaw;
    world.rotation.x = view.pitch;
  }

  function size() {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Giữ nguyên khung nhìn khi cột hẹp lại (điện thoại): lùi camera thay vì cắt cảnh
    const base = 44;
    camera.fov = camera.aspect < 1 ? base / Math.max(0.62, camera.aspect) : base;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => {
    size();
    if (frozen || paused || !active) renderOnce();
  });
  ro.observe(host);
  size();

  function renderOnce() {
    update(time);
    applyView(0, true);
    canvas.style.opacity = '1';
    renderer.render(scene, camera);
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!active || document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!paused) {
      time += dt;
      if (time >= CYCLE) time -= CYCLE;
    }
    update(time);
    applyView(dt);
    // Mờ vào / mờ ra ở hai đầu chu kỳ để lần lặp không giật
    const fade = Math.min(clamp01(time / 0.5), 1 - clamp01((time - T_FADE) / (CYCLE - T_FADE)));
    canvas.style.opacity = fade.toFixed(3);
    renderer.render(scene, camera);
  }

  if (frozen) renderOnce();
  else raf = requestAnimationFrame(frame);

  return {
    setActive(v) {
      active = v;
    },
    setPaused(v) {
      paused = v;
      if (frozen) return;
      if (v) canvas.style.opacity = '1';
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      ro.disconnect();
      scene.traverse((o) => {
        const m = o as Mesh;
        m.geometry?.dispose();
        const mt = m.material as Material | Material[] | undefined;
        for (const x of Array.isArray(mt) ? mt : mt ? [mt] : []) {
          (x as MeshStandardMaterial).map?.dispose();
          x.dispose();
        }
      });
      renderer.dispose();
      canvas.remove();
    },
  };
}
