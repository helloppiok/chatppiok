export function hexToRgba(hex, a){
  const h = hex.replace("#","");
  const full = h.length === 3
    ? h.split("").map(ch => ch + ch).join("")
    : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

export function timeNow(){
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
