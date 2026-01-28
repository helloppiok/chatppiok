import { timeNow } from "../../shared/utils.js";

export function addMsg(chatLog, name, text){
  const wrap = document.createElement("div");
  wrap.className = "cs-msg";
  wrap.innerHTML = `
    <div class="cs-msg-head">
      <div class="cs-msg-name">${name}</div>
      <div class="cs-msg-time">${timeNow()}</div>
    </div>
    <div class="cs-msg-body">${text}</div>
  `;
  chatLog.appendChild(wrap);
  chatLog.scrollTop = chatLog.scrollHeight;
}