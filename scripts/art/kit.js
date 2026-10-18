// Shared rendering kit for OSSGrid artwork scenes (loaded by scripts/art/*.html in headless Chromium).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";

export { THREE };

export const params = new URLSearchParams(location.search);
export const W = Number(params.get("w") || 1920);
export const H = Number(params.get("h") || 1200);
export const variant = params.get("variant") || "desktop";

/** Deterministic PRNG so every render is identical. */
export function prng(seed = 1337) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function makeRenderer({ exposure = 0.95 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

/** Vertical gradient sky as a canvas texture; stops are [offset, css colour]. */
export function gradientSky(stops) {
  const c = document.createElement("canvas");
  c.width = 4; c.height = 512;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  for (const [o, col] of stops) g.addColorStop(o, col);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Soft radial sprite texture for glows. */
export function radialTexture(inner = "rgba(255,255,255,0.6)", mid = "rgba(255,255,255,0.18)") {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner); g.addColorStop(0.35, mid); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export function environment(renderer, scene, intensity = 0.2) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = intensity;
}

export async function finish(renderer, scene, camera, { bloom = [0.6, 0.5, 0.9], bokeh = null } = {}) {
  const composer = new EffectComposer(renderer);
  composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  if (bokeh) composer.addPass(new BokehPass(scene, camera, bokeh));
  if (bloom) composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), ...bloom));
  composer.addPass(new OutputPass());
  composer.render();
  await new Promise((r) => requestAnimationFrame(r));
  composer.render();
}

/** Project world points to percentage coordinates of the frame (for live HTML labels). */
export function project(camera, points) {
  return points.map(({ id, position, radius = 0 }) => {
    const v = position.clone().project(camera);
    const top = position.clone().add(new THREE.Vector3(0, radius, 0)).project(camera);
    return { id, x: +(((v.x + 1) / 2) * 100).toFixed(2), y: +(((1 - v.y) / 2) * 100).toFixed(2), top: +(((1 - top.y) / 2) * 100).toFixed(2), visible: v.z < 1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 1 };
  });
}
