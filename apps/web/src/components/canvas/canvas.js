import { state } from "../../shared/state.js";

export let canvas;
export let ctx;

export function initCanvas(){
  canvas = document.getElementById("cs-canvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");
}

export function resize(){
  if (!canvas || !ctx) return;

  const parent = canvas.parentElement;
  if (!parent) return;

  const w = parent.offsetWidth;
  const h = parent.offsetHeight;

  const rect = parent.getBoundingClientRect();

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  state.w = w;
  state.h = h;

  state.viewScale = rect.width / (w || 1);
}
