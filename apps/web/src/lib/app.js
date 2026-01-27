export function boot(){
document.body.focus();

  const canvas = document.getElementById("cs-canvas");
  const ctx = canvas.getContext("2d");

  const meNameEl = document.getElementById("cs-me-name");
  const meDotEl = document.getElementById("cs-me-dot");
  const toastEl = document.getElementById("cs-toast");

  const chatLog = document.getElementById("cs-chat-log");
  const chatForm = document.getElementById("cs-chat-form");
  const chatInput = document.getElementById("cs-chat-input");

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const namePoolA = ["몽글","푸른","은은","조용","반짝","새벽","아늑","달콤","차분","맑은","검은","하얀"];
  const namePoolB = ["고래","고양이","여우","펭귄","토끼","판다","호랑이","수달","참새","돌고래","곰","강아지"];

  const nickname = `${namePoolA[rand(0,namePoolA.length-1)]}${namePoolB[rand(0,namePoolB.length-1)]}${rand(1000,9999)}`;

  const palette = ["#8b5cf6","#22c55e","#38bdf8","#f97316","#ef4444","#eab308","#a78bfa"];
  const myColor = palette[rand(0,palette.length-1)];
  meNameEl.textContent = nickname;
  meDotEl.style.background = myColor;
  meDotEl.style.boxShadow = `0 0 0 6px ${hexToRgba(myColor, 0.18)}`;

  const state = {
    w: 0,
    h: 0,
    grid: 32,
    me: { x: 160, y: 160, r: 6, name: nickname, color: myColor },
    bots: [],
    keys: { up:false, down:false, left:false, right:false },
    touchTarget: null,
    lastMoveAt: 0
  };


function resize(){
  const parent = canvas.parentElement;

  // 변형(scale)과 무관한 "레이아웃 기준" 크기
  const w = parent.offsetWidth;
  const h = parent.offsetHeight;

  // 화면에서 보이는 크기(변형 scale 적용됨)
  const rect = parent.getBoundingClientRect();

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  // 캔버스 내부 픽셀 버퍼는 레이아웃 기준으로 맞춤
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);

  // CSS 크기는 100%로 유지하고 JS에서 px로 덮어쓰지 않음
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 그리기 기준도 레이아웃 기준으로 고정
  state.w = w;
  state.h = h;

  // 클릭 좌표 보정용 스케일(보이는 크기 / 레이아웃 크기)
  state.viewScale = rect.width / (w || 1);
}



// function resize(){
//   const parent = canvas.parentElement;
//   const rect = parent.getBoundingClientRect();

//   const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

//   const prevW = state.w || rect.width;
//   const prevH = state.h || rect.height;

//   canvas.width = Math.floor(rect.width * dpr);
//   canvas.height = Math.floor(rect.height * dpr);

//   canvas.style.width = rect.width + "px";
//   canvas.style.height = rect.height + "px";

//   ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

//   state.w = rect.width;
//   state.h = rect.height;

//   // 기존 위치 비율 유지
//   if (prevW && prevH){
//     state.me.x = (state.me.x / prevW) * state.w;
//     state.me.y = (state.me.y / prevH) * state.h;
//   }
// }


  function seedBots(){
    const botNames = [
      "라운지새벽1203","조용한수달3301","푸른고래1841","반짝토끼7720","맑은여우5409"
    ];
    state.bots = botNames.map((n, i) => {
      const c = palette[(i + 2) % palette.length];
      return {
        x: rand(60, 420),
        y: rand(70, 360),
        r: 6,
        name: n,
        color: c,
        vx: (Math.random() * 0.8) + 0.2,
        vy: (Math.random() * 0.8) + 0.2
      };
    });
  }

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  function step(){
    moveMe();
    moveBots();
    render();
    requestAnimationFrame(step);
  }

  function moveMe(){
    const speed = 2.4;

    let dx = 0;
    let dy = 0;

    if (state.keys.left) dx -= 1;
    if (state.keys.right) dx += 1;
    if (state.keys.up) dy -= 1;
    if (state.keys.down) dy += 1;


    if (state.touchTarget){
      const tx = state.touchTarget.x;
      const ty = state.touchTarget.y;
      const vx = tx - state.me.x;
      const vy = ty - state.me.y;
      const dist = Math.hypot(vx, vy);

      if (dist > 2){
        dx = vx / dist;
        dy = vy / dist;
      } else {
        state.touchTarget = null;
      }
    }

    if (dx !== 0 || dy !== 0){
      const norm = Math.hypot(dx, dy) || 1;
      state.me.x += (dx / norm) * speed;
      state.me.y += (dy / norm) * speed;
      state.lastMoveAt = Date.now();
    }

    const pad = 18;
    state.me.x = clamp(state.me.x, pad, state.w - pad);
    state.me.y = clamp(state.me.y, pad, state.h - pad);
  }

  function moveBots(){
    const pad = 18;
    for (const b of state.bots){
      b.x += b.vx;
      b.y += b.vy;

      if (b.x < pad || b.x > state.w - pad) b.vx *= -1;
      if (b.y < pad || b.y > state.h - pad) b.vy *= -1;

      b.x = clamp(b.x, pad, state.w - pad);
      b.y = clamp(b.y, pad, state.h - pad);
    }
  }

  function render(){
    ctx.clearRect(0, 0, state.w, state.h);
    ctx.fillStyle = "rgba(10,12,20,0.18)";
    ctx.fillRect(0, 0, state.w, state.h);

    drawGrid();
    
    //가짜 유저 테스트용 1of2
    //for (const b of state.bots) drawUser(b, false);
    drawUser(state.me, true);
  }

  function drawGrid(){
    const g = state.grid;
    ctx.save();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;

    for (let x = 0; x < state.w; x += g){
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, state.h);
      ctx.stroke();
    }
    for (let y = 0; y < state.h; y += g){
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(state.w, y + 0.5);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawUser(u, isMe){
    ctx.save();

    if (isMe){
      ctx.fillStyle = hexToRgba(u.color, 0.18);
      ctx.beginPath();
      ctx.arc(u.x, u.y, u.r + 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = u.color;
    ctx.beginPath();
    ctx.arc(u.x, u.y, u.r, 0, Math.PI * 2);
    ctx.fill();

    const label = u.name;
    ctx.font = "12px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textBaseline = "middle";

    const paddingX = 8;
    const paddingY = 6;

    const textW = ctx.measureText(label).width;
    const boxW = textW + paddingX * 2;
    const boxH = 22;

    const bx = clamp(u.x + 12, 10, state.w - boxW - 10);
    const by = clamp(u.y - 16, 10, state.h - boxH - 10);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundRect(ctx, bx, by, boxW, boxH, 10);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText(label, bx + paddingX, by + boxH / 2);

    ctx.restore();
  }

  function roundRect(c, x, y, w, h, r){
    const rr = Math.min(r, w/2, h/2);
    c.beginPath();
    c.moveTo(x + rr, y);
    c.arcTo(x + w, y, x + w, y + h, rr);
    c.arcTo(x + w, y + h, x, y + h, rr);
    c.arcTo(x, y + h, x, y, rr);
    c.arcTo(x, y, x + w, y, rr);
    c.closePath();
  }

  function hexToRgba(hex, a){
    const h = hex.replace("#","");
    const full = h.length === 3 ? h.split("").map(ch => ch + ch).join("") : h;
    const n = parseInt(full, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
  }

  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastEl._t);
    toastEl._t = window.setTimeout(() => toastEl.classList.remove("show"), 1100);
  }

  function addMsg(name, text){
    const wrap = document.createElement("div");
    wrap.className = "cs-msg";

    const head = document.createElement("div");
    head.className = "cs-msg-head";

    const nm = document.createElement("div");
    nm.className = "cs-msg-name";
    nm.textContent = name;

    const tm = document.createElement("div");
    tm.className = "cs-msg-time";
    tm.textContent = timeNow();

    const body = document.createElement("div");
    body.className = "cs-msg-body";
    body.textContent = text;

    head.appendChild(nm);
    head.appendChild(tm);
    wrap.appendChild(head);
    wrap.appendChild(body);

    chatLog.appendChild(wrap);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function timeNow(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,"0");
    const mm = String(d.getMinutes()).padStart(2,"0");
    return `${hh}:${mm}`;
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
    addMsg(state.me.name, text);
    chatInput.value = "";
    fakeReply();
  });
}


  // function getCanvasPoint(e){
  //   const rect = canvas.getBoundingClientRect();
  //   return {
  //     x: clamp(e.clientX - rect.left, 0, rect.width),
  //     y: clamp(e.clientY - rect.top, 0, rect.height)
  //   };
  // }

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

  function fakeReply(){
    if (!state.bots.length) return;
    const pick = state.bots[rand(0, state.bots.length - 1)];
    const lines = [
      "안녕하세요",
      "여기 분위기 좋네요",
      "이동 테스트 중",
      "채팅 잘 보이네요",
      "반갑습니다"
    ];
    const delay = rand(450, 1100);
    window.setTimeout(() => {
      addMsg(pick.name, lines[rand(0, lines.length - 1)]);
    }, delay);
  }

  function init(){
    resize();
    
    // 테스트용 가짜 유저 2of2
    //seedBots();
    
    bindInputs();

    // 첫 화면에 빈 화면처럼 보이지 않게
    //addMsg("Chatppiok", "UI 테스트 모드입니다");

    window.addEventListener("resize", resize);
    requestAnimationFrame(step);



    function applyStageScale(){
    const stage = document.getElementById("cs-stage");
    if (!stage) return;

    const sw = Number(getComputedStyle(document.documentElement).getPropertyValue("--stage-w").trim()) || 1280;
    const sh = Number(getComputedStyle(document.documentElement).getPropertyValue("--stage-h").trim()) || 720;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const scale = Math.min(vw / sw, vh / sh);

    document.documentElement.style.setProperty("--stage-scale", String(scale));
  }

  window.addEventListener("resize", applyStageScale);
  applyStageScale();

  }

  init();

const REALTIME_BASE = "https://YOUR-DOMAIN"; // 나중에 배포 주소로 교체
const HEALTH_URL = REALTIME_BASE + "/health"; // 서버에 이 엔드포인트만 있으면 됨
const WS_URL = "wss://YOUR-DOMAIN/ws"; // 웹소켓 쓸 거면 이것도

function setRealtimeBadge(isOn){
  const el = document.getElementById("cs-realtime-badge");
  if (!el) return;

  if (isOn){
    el.textContent = "실시간 켜짐";
    el.classList.remove("cs-muted");
  } else {
    el.textContent = "실시간 꺼짐";
    el.classList.add("cs-muted");
  }
}

function fetchWithTimeout(url, ms){
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    fetch(url, { cache: "no-store" })
      .then((r) => { clearTimeout(t); resolve(r); })
      .catch((e) => { clearTimeout(t); reject(e); });
  });
}

async function checkRealtime(){
  try {
    const r = await fetchWithTimeout(HEALTH_URL, 1200);
    if (!r.ok) throw new Error("bad status");
    setRealtimeBadge(true);
  } catch (_) {
    setRealtimeBadge(false);
  }
}

// 최초 1회 + 주기적 갱신
checkRealtime();
setInterval(checkRealtime, 5000);




}
