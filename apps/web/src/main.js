import { state, clamp, rand } from "./shared/state.js";
import { initCanvas, resize, canvas } from "./components/canvas/canvas.js";
import { moveMe } from "./components/canvas/movement.js";
import { render } from "./components/canvas/render.js";
import { addMsg } from "./components/chat/chat.js";

function updateStageScale(){
  const root = document.documentElement;

  const stageW = 1280;
  const stageH = 720;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const safeW = Math.max(0, vw - 16);
  const safeH = Math.max(0, vh - 16);

  const scale = Math.min(safeW / stageW, safeH / stageH);

  root.style.setProperty("--stage-scale", String(Math.max(0, +scale.toFixed(4))));
}

function init(){
  updateStageScale();
  window.addEventListener("resize", updateStageScale);

  document.body.focus();

  const meNameEl = document.getElementById("cs-me-name");
  const meDotEl = document.getElementById("cs-me-dot");
  const toastEl = document.getElementById("cs-toast");

  const chatLog = document.getElementById("cs-chat-log");
  const chatForm = document.getElementById("cs-chat-form");
  const chatInput = document.getElementById("cs-chat-input");

  const namePoolA = ["몽글","푸른","은은","조용","반짝","새벽","아늑","달콤","차분","맑은","검은","하얀"];
  const namePoolB = ["고래","고양이","여우","펭귄","토끼","판다","호랑이","수달","참새","돌고래","곰","강아지"];
  const nickname = `${namePoolA[rand(0,namePoolA.length-1)]}${namePoolB[rand(0,namePoolB.length-1)]}${rand(1000,9999)}`;

  const palette = ["#8b5cf6","#22c55e","#38bdf8","#f97316","#ef4444","#eab308","#a78bfa"];
  const myColor = palette[rand(0,palette.length-1)];

  state.me = { x: 160, y: 160, r: 6, name: nickname, color: myColor };

  meNameEl.textContent = nickname;
  meDotEl.style.background = myColor;

  initCanvas();
  resize();

  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastEl._t);
    toastEl._t = window.setTimeout(() => toastEl.classList.remove("show"), 1100);
  }

  function getCanvasPoint(e){
    const rect = canvas.getBoundingClientRect();
    const s = state.viewScale || 1;

    const x = (e.clientX - rect.left) / s;
    const y = (e.clientY - rect.top) / s;

    return {
      x: clamp(x, 0, state.w),
      y: clamp(y, 0, state.h)
    };
  }

  function bindInputs(){
    document.addEventListener("keydown", (e) => {
      const isArrow =
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight";

      if (isArrow){
        if (document.activeElement === chatInput) chatInput.blur();
        e.preventDefault();
      }

      if (e.key === "ArrowUp") state.keys.up = true;
      if (e.key === "ArrowDown") state.keys.down = true;
      if (e.key === "ArrowLeft") state.keys.left = true;
      if (e.key === "ArrowRight") state.keys.right = true;
    }, { passive: false });

    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowUp") state.keys.up = false;
      if (e.key === "ArrowDown") state.keys.down = false;
      if (e.key === "ArrowLeft") state.keys.left = false;
      if (e.key === "ArrowRight") state.keys.right = false;
    }, { passive: false });

    canvas.addEventListener("pointerdown", (e) => {
      chatInput.blur();
      const p = getCanvasPoint(e);
      state.touchTarget = p;
      toast("이동");
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!canvas.hasPointerCapture(e.pointerId)) return;
      state.touchTarget = getCanvasPoint(e);
    });

    canvas.addEventListener("pointerup", (e) => {
      if (!canvas.hasPointerCapture(e.pointerId)) return;
      canvas.releasePointerCapture(e.pointerId);
      state.touchTarget = null;
    });

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = (chatInput.value || "").trim();
      if (!text) return;
      addMsg(chatLog, state.me.name, text);
      chatInput.value = "";
    });
  }

  bindInputs();

  window.addEventListener("resize", () => {
    resize();
  });

  function loop(){
    moveMe();
    render();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

window.addEventListener("DOMContentLoaded", init);
