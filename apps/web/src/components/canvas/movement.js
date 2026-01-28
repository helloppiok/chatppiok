import { state, clamp } from "../../shared/state.js";

export function moveMe(){
  const speed = 2.4;
  let dx=0, dy=0;

  if (state.keys.left) dx--;
  if (state.keys.right) dx++;
  if (state.keys.up) dy--;
  if (state.keys.down) dy++;

  if (state.touchTarget){
    const vx = state.touchTarget.x - state.me.x;
    const vy = state.touchTarget.y - state.me.y;
    const d = Math.hypot(vx,vy);
    if (d>2){
      dx = vx/d;
      dy = vy/d;
    } else state.touchTarget = null;
  }

  if (dx||dy){
    const n = Math.hypot(dx,dy)||1;
    state.me.x += (dx/n)*speed;
    state.me.y += (dy/n)*speed;
  }

  const pad = 18;
  state.me.x = clamp(state.me.x,pad,state.w-pad);
  state.me.y = clamp(state.me.y,pad,state.h-pad);
}
