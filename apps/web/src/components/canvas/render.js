import { state, clamp } from "../../shared/state.js";
import { hexToRgba } from "../../shared/utils.js";
import { ctx } from "./canvas.js";


export function render(){
  ctx.clearRect(0, 0, state.w, state.h);
  ctx.fillStyle = "rgba(10,12,20,0.18)";
  ctx.fillRect(0, 0, state.w, state.h);
  drawGrid();
  drawUser(state.me, true);
}

function drawGrid(){
  const g = state.grid;
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  for (let x=0;x<state.w;x+=g){
    ctx.beginPath();
    ctx.moveTo(x+0.5,0);
    ctx.lineTo(x+0.5,state.h);
    ctx.stroke();
  }
  for (let y=0;y<state.h;y+=g){
    ctx.beginPath();
    ctx.moveTo(0,y+0.5);
    ctx.lineTo(state.w,y+0.5);
    ctx.stroke();
  }
}

function drawUser(u, isMe){
  if (isMe){
    ctx.fillStyle = hexToRgba(u.color,0.18);
    ctx.beginPath();
    ctx.arc(u.x,u.y,u.r+10,0,Math.PI*2);
    ctx.fill();
  }
  ctx.fillStyle = u.color;
  ctx.beginPath();
  ctx.arc(u.x,u.y,u.r,0,Math.PI*2);
  ctx.fill();
}
