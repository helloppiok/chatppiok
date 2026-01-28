const BASE = "https://YOUR-DOMAIN";
const HEALTH = BASE + "/health";

export async function checkRealtime(){
  try{
    const r = await fetch(HEALTH,{cache:"no-store"});
    setBadge(r.ok);
  }catch{
    setBadge(false);
  }
}

function setBadge(on){
  const el = document.getElementById("cs-realtime-badge");
  if (!el) return;
  el.textContent = on ? "실시간 켜짐" : "실시간 꺼짐";
  el.classList.toggle("cs-muted", !on);
}
