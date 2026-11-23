// 臺灣歷史軌跡｜會考題參考：歷屆國中教育會考社會科中，屬於史前～清帝國的臺灣史題目
// 題目資料在 exam-data.js（window.會考題），由 工具腳本/會考題.py 從逐題抄錄的 JSON 合併產生。
// 與 app.js 分開，改這裡不會讓教學影片的錄影指紋變動。
(function () {
  "use strict";
  const 題庫 = window.會考題 || [];
  const TL = window.TL;
  if (!題庫.length || !TL || new URLSearchParams(location.search).has("錄影")) return;
  const $ = (s) => document.querySelector(s);
  const 事件名 = {}, 期名 = {}, 期色 = {};
  TL.時期.forEach(p => { 期名[p.id] = p.名; 期色[p.id] = p.色; p.事件.forEach(e => 事件名[e.id] = e.標題); });
  const 原卷 = (年) => `https://cap.rcpet.edu.tw/exam/${年}/${年}exam.html`;
  const 字 = (s) => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])).replace(/\n/g, "<br>");

  let 篩 = "全部", 顯答 = false;
  function 開會考() {
    const 期們 = TL.時期.filter(p => 題庫.some(q => q.時期 === p.id));
    const 列 = 題庫.filter(q => 篩 === "全部" || q.時期 === 篩);
    const 窗 = $("#彈窗");
    窗.style.setProperty("--期色", 篩 === "全部" ? "#263238" : 期色[篩]);
    窗.innerHTML = `<button class="關閉" id="關閉" aria-label="關閉">✕</button>
      <h2>📚 會考題參考｜臺灣史（史前～清帝國）</h2>
      <p class="考說明">歷屆國中教育會考社會科原題（四選一），共 ${題庫.length} 題，給老師出題與評量參考。點選項可以看對錯，「去複習」會跳到網站上對應的那一站。</p>
      <div class="索引分頁">
        <button data-p="全部" class="${篩 === "全部" ? "選" : ""}">全部（${題庫.length}）</button>
        ${期們.map(p => `<button data-p="${p.id}" class="${篩 === p.id ? "選" : ""}" style="--c:${p.色}">${p.名}（${題庫.filter(q => q.時期 === p.id).length}）</button>`).join("")}
        <button id="顯答" class="考顯答">${顯答 ? "🙈 隱藏答案" : "👀 全部顯示答案"}</button>
      </div>
      <div class="考列">${列.map(卡).join("")}</div>`;
    $("#遮罩").hidden = false;
    $("#關閉").onclick = () => { $("#遮罩").hidden = true; };
    窗.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { 篩 = b.dataset.p; 開會考(); 窗.scrollTop = 0; });
    $("#顯答").onclick = () => { 顯答 = !顯答; 開會考(); };
    窗.querySelectorAll(".考卡").forEach(c => {
      const q = 列[+c.dataset.i];
      c.querySelectorAll(".考選").forEach(b => b.onclick = () => 作答(c, q, b.dataset.k));
      if (顯答) 作答(c, q, null);
    });
    窗.querySelectorAll("[data-id]").forEach(b => b.onclick = () => { $("#遮罩").hidden = true; window.App.去事件(b.dataset.id); });
  }
  function 卡(q, i) {
    return `<div class="考卡" data-i="${i}" style="--c:${期色[q.時期]}">
      <div class="考頭"><span class="考年">${q.年}年會考 第${q.題號}題</span><span class="考期">${期名[q.時期] || ""}</span>${q.跨時期 ? `<span class="考期 跨">跨時期</span>` : ""}</div>
      ${q.題組引文 ? `<div class="考引">${字(q.題組引文)}</div>` : ""}
      ${q.圖表文字 ? `<div class="考圖">${q.有圖 ? "🖼️ 原題附圖：" : "📋 "}${字(q.圖表文字)}${q.有圖 ? `　<a href="${原卷(q.年)}" target="_blank" rel="noopener">看原卷 ↗</a>` : ""}</div>` : ""}
      <div class="考幹">${字(q.題幹)}</div>
      <div class="考選列">${q.選項.map(o => `<button class="考選" data-k="${o.trim().charAt(1)}">${字(o)}</button>`).join("")}</div>
      <div class="考解" hidden></div>
    </div>`;
  }
  function 作答(c, q, k) {
    c.querySelectorAll(".考選").forEach(b => {
      b.disabled = true;
      if (b.dataset.k === q.答案) b.classList.add("正解");
      else if (b.dataset.k === k) b.classList.add("你選");
    });
    const 解 = c.querySelector(".考解");
    解.hidden = false;
    解.innerHTML = `${k == null ? "" : k === q.答案 ? "<b>✅ 答對了！</b> " : "<b>💡 再想想：</b> "}答案是 <b>(${q.答案})</b>。考點：${字(q.考點)}
      <div class="考複習">${q.事件.filter(id => 事件名[id]).map(id => `<button data-id="${id}">📖 去複習「${事件名[id]}」</button>`).join("")}</div>`;
    解.querySelectorAll("[data-id]").forEach(b => b.onclick = () => { $("#遮罩").hidden = true; window.App.去事件(b.dataset.id); });
  }

  const 鈕 = document.createElement("button");
  鈕.id = "鈕會考";
  鈕.textContent = "📚 會考題";
  鈕.title = "歷屆會考的臺灣史題目（老師評量參考）";
  鈕.onclick = 開會考;
  $("#頂列 .工具列").appendChild(鈕);
  window.開會考 = 開會考;
})();
