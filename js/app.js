// 臺灣歷史軌跡｜介面主程式：時期切換、時間軸拉軸、說明卡、語音、測驗、索引
(function () {
  "use strict";
  const 版本 = { 語音: 1 };
  const TL = window.TL, SC = window.SCENES || {};
  const $ = (s) => document.querySelector(s);
  const 色16 = (n) => "#" + n.toString(16).padStart(6, "0");

  /* ── 資料攤平 ── */
  const 全事件 = [];
  TL.時期.forEach((p, pi) => p.事件.forEach((e, ei) => 全事件.push({ e, p, pi, ei, gi: 全事件.length })));
  const 依id = Object.fromEntries(全事件.map(x => [x.e.id, x]));
  const 小期色 = (x) => (x.p.小期色 && x.p.小期色[x.e.小期]) || x.p.色;

  /* ── 本機儲存（讀不到也能正常運作） ── */
  const 存 = {
    讀(k, d) { try { const v = localStorage.getItem("臺灣歷史軌跡:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    寫(k, v) { try { localStorage.setItem("臺灣歷史軌跡:" + k, JSON.stringify(v)); } catch (e) { /* 無痕視窗等情況 */ } }
  };
  const 狀態 = { 期: 0, 事: null, 朗讀: 存.讀("朗讀", true), 看過: new Set(存.讀("看過", [])), 成績: 存.讀("成績", {}), 分頁: "註記" };

  /* ── 語音：預產 mp3，讀不到時改用瀏覽器語音 ── */
  const 唸稿 = (e) => `${e.年}，${e.標題}。${e.說明.join("")}`;
  const 語音 = (() => {
    let a = null, 序 = 0, 鈕 = null;
    function 設鈕(b) { if (鈕) 鈕.classList.remove("播放中"); 鈕 = b; if (b) b.classList.add("播放中"); }
    function 停() { 序++; if (a) { a.pause(); a = null; } try { speechSynthesis.cancel(); } catch (e) { /* 不支援 */ } 設鈕(null); }
    function 備用(文, 本, res) {
      if (本 !== 序 || !文 || !window.speechSynthesis) { res("錯誤"); return; }
      const u = new SpeechSynthesisUtterance(文); u.lang = "zh-TW"; u.rate = .95;
      u.onend = () => { if (本 === 序) 設鈕(null); res("結束"); };
      speechSynthesis.speak(u);
    }
    function 播(key, 文, b) {
      停(); const 本 = 序; 設鈕(b || null);
      return new Promise((res) => {
        const x = new Audio(`assets/audio/${key}.mp3?v=${版本.語音}`); a = x;
        x.onended = () => { if (本 === 序) 設鈕(null); res("結束"); };
        x.onerror = () => 備用(文, 本, res);
        x.play().catch(() => 備用(文, 本, res));
      });
    }
    return { 播, 停, 自動: (k, 文) => 狀態.朗讀 ? 播(k, 文) : Promise.resolve("略過"), 播放中: () => !!鈕 };
  })();

  /* ── 頂列：時期按鈕 ── */
  function 畫時期列() {
    $("#時期列").innerHTML = TL.時期.map((p, i) => {
      const 分 = 狀態.成績[p.id];
      return `<button class="時期鈕 ${i === 狀態.期 ? "選" : ""}" style="--c:${p.色}" data-i="${i}">${p.名}<small>${p.年代}</small>${分 != null ? `<span class="星">⭐ ${分}/${p.測驗.length}</span>` : ""}</button>`;
    }).join("");
    $("#時期列").querySelectorAll("button").forEach(b => b.onclick = () => 去封面(+b.dataset.i));
  }
  function 套期色(p) {
    document.documentElement.style.setProperty("--期色", p.色);
    document.documentElement.style.setProperty("--期淺", p.淺);
  }

  /* ── 圖解（2D） ── */
  function 圖解HTML(g) {
    if (g.型 === "比較") return `<div class="圖解"><h4>📊 ${g.題}</h4><div class="表框"><table class="比較表"><thead><tr>${g.欄.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${g.列.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`;
    if (g.型 === "流程") return `<div class="圖解"><h4>➡️ ${g.題}</h4><div class="流程">${g.步.map((s, i) => `${i ? '<div class="箭">▼</div>' : ""}<div class="步 ${g.亮 === i ? "亮" : ""}">${s}</div>`).join("")}</div></div>`;
    if (g.型 === "圖示") return `<div class="圖解"><h4>🧩 ${g.題}</h4><div class="圖示格">${g.項.map(([i, t]) => `<div><span>${i}</span>${t}</div>`).join("")}</div></div>`;
    if (g.型 === "地圖") return `<div class="圖解"><h4>🗺️ ${g.題}</h4><div class="地圖說">地點：${g.點.join("、")}<br>👉 在右邊的立體地圖上看得到</div></div>`;
    return "";
  }
  const 分類籤 = (c) => { const k = TL.分類[c]; return `<span class="分類籤" style="background:${k.色}">${k.圖示} ${c}</span>`; };

  /* ── 說明卡：時期封面 ── */
  function 畫封面(pi) {
    const p = TL.時期[pi];
    $("#資訊卡").innerHTML = `
      <div class="年大">${p.年代}</div>
      <h2>${p.名}</h2>
      <div class="封面朝代">🏯 ${p.朝代}<br>📘 ${p.課次}</div>
      <p class="導言">${p.導言}</p>
      <button class="唸鈕" id="唸導言">🔊 唸給我聽</button>
      <h3>🎯 這個時期要學會</h3>
      <ul class="重點清單">${p.學習重點.map(s => `<li>${s}</li>`).join("")}</ul>
      <h3>🚩 這個時期的 ${p.事件.length} 站（地圖上的標記也可以點）</h3>
      <div class="站清單">${p.事件.map(e => `<button data-id="${e.id}" class="${狀態.看過.has(e.id) ? "看過" : ""}"><b>${e.年}</b>${e.標題}</button>`).join("")}</div>
      <div class="導覽鈕列">
        <button class="主" id="鈕開始">▶ 從第一站開始</button>
      </div>
      <div class="導覽鈕列">
        <button id="鈕整理">📋 分類整理</button>
        <button id="鈕測驗">📝 小測驗</button>
      </div>`;
    $("#唸導言").onclick = (ev) => 語音.播放中() ? 語音.停() : 語音.播("intro_" + p.id, p.導言, ev.currentTarget);
    $("#資訊卡").querySelectorAll(".站清單 button").forEach(b => b.onclick = () => 去事件(b.dataset.id));
    $("#鈕開始").onclick = () => 去事件(p.事件[0].id);
    $("#鈕整理").onclick = () => 開整理(pi);
    $("#鈕測驗").onclick = () => 開測驗(pi);
    $("#資訊卡").scrollTop = 0;
  }

  /* ── 說明卡：事件 ── */
  function 畫事件(x) {
    const { e, p } = x;
    const 末 = x.ei === p.事件.length - 1;
    $("#資訊卡").innerHTML = `
      <div class="年大">${e.年}</div>
      <div class="籤列">
        <span class="籤 實">${p.名}</span>
        <span class="籤" style="color:${小期色(x)};border-color:${小期色(x)}">${e.小期}</span>
        <span class="籤 年號">🏯 ${e.年號}</span>
      </div>
      <h2>${e.標題}</h2>
      <ul class="說明">${e.說明.map(s => `<li>${s}</li>`).join("")}</ul>
      <button class="唸鈕" id="唸事件">🔊 唸給我聽</button>
      <div class="分頁" role="tablist">
        ${["註記", "圖解", "人物", "分類"].map(t => `<button data-t="${t}" class="${狀態.分頁 === t ? "選" : ""}">${{ 註記: "📌", 圖解: "🧩", 人物: "👤", 分類: "🗂️" }[t]} ${t}</button>`).join("")}
      </div>
      <div class="分頁內" id="分頁內"></div>
      <div class="接下來">🔗 <b>接下來：</b>${e.接下來}</div>
      <div class="導覽鈕列">
        <button id="鈕上">◀ 上一站</button>
        <button class="主" id="鈕下">${末 ? "📋 時期整理" : "下一站 ▶"}</button>
      </div>
      ${末 ? `<div class="導覽鈕列"><button id="鈕卡測驗">📝 ${p.短名}小測驗</button></div>` : ""}`;
    $("#唸事件").onclick = (ev) => 語音.播放中() ? 語音.停() : 語音.播("ev_" + e.id, 唸稿(e), ev.currentTarget);
    $("#資訊卡").querySelectorAll(".分頁 button").forEach(b => b.onclick = () => { 狀態.分頁 = b.dataset.t; 畫事件(x); });
    $("#鈕上").onclick = 上一站;
    $("#鈕下").onclick = 末 ? () => 開整理(x.pi) : 下一站;
    if (末) $("#鈕卡測驗").onclick = () => 開測驗(x.pi);
    const 內 = $("#分頁內");
    if (狀態.分頁 === "註記") 內.innerHTML = e.註記.length ? `<dl class="註記">${e.註記.map(n => `<dt>${n.詞}</dt><dd>${n.解}</dd>`).join("")}</dl>` : "（這一站沒有特別的名詞）";
    if (狀態.分頁 === "圖解") 內.innerHTML = e.圖解.map(圖解HTML).join("");
    if (狀態.分頁 === "人物") 內.innerHTML = e.人物.length ? e.人物.map(r => `<div class="人物卡"><span class="像">👤</span><div><b>${r.名}</b><br>${r.說}</div></div>`).join("") : "（這一站沒有點名的歷史人物）";
    if (狀態.分頁 === "分類") 內.innerHTML = `<p>這件事屬於：</p>${e.分類.map(分類籤).join("")}<p style="margin-top:12px">想看這個時期所有事件的分類，按「📋 時期整理」。</p><button class="唸鈕" id="鈕分類整理">📋 時期整理</button>`;
    const 整 = $("#鈕分類整理"); if (整) 整.onclick = () => 開整理(x.pi);
  }

  /* ── 導覽 ── */
  function 去封面(pi) {
    狀態.期 = pi; 狀態.事 = null; 語音.停();
    const p = TL.時期[pi];
    套期色(p); 畫時期列(); 畫封面(pi); 更新軌道();
    if (W3D) W.總覽(p, (id) => 去事件(id), SC);
  }
  function 去事件(id, 朗讀 = true) {
    const x = 依id[id]; if (!x) return;
    狀態.期 = x.pi; 狀態.事 = id;
    狀態.看過.add(id); 存.寫("看過", [...狀態.看過]); 存.寫("目前", id);
    套期色(x.p); 畫時期列(); 畫事件(x); 更新軌道(true);
    $("#資訊卡").scrollTop = 0;
    if (W3D) W.演出(x.e, SC);
    if (朗讀) 語音.自動("ev_" + id, 唸稿(x.e)); else 語音.停();
  }
  function 下一站() {
    if (!狀態.事) return 去事件(TL.時期[狀態.期].事件[0].id);
    const x = 依id[狀態.事];
    if (x.ei === x.p.事件.length - 1) return 開整理(x.pi);
    去事件(全事件[x.gi + 1].e.id);
  }
  function 上一站() {
    if (!狀態.事) return 狀態.期 > 0 ? 去事件(TL.時期[狀態.期 - 1].事件.slice(-1)[0].id) : null;
    const x = 依id[狀態.事];
    if (x.ei === 0) return 去封面(x.pi);
    去事件(全事件[x.gi - 1].e.id);
  }

  /* ── 時間軸拉軸 ── */
  function 畫軌道() {
    const 內 = $("#軌道內");
    let html = "";
    TL.時期.forEach((p, pi) => {
      html += `<button class="軌期" style="--c:${p.色}" data-p="${pi}"><b>${p.名}</b><small>${p.年代}｜${p.朝代}</small></button>`;
      let 前小期 = null;
      p.事件.forEach((e) => {
        const x = 依id[e.id], c = 小期色(x);
        if (e.小期 !== 前小期) { html += `<div class="軌小期" style="--c:${c}">${e.小期}</div>`; 前小期 = e.小期; }
        html += `<button class="軌列" style="--c:${c};--淺:${p.淺}" data-id="${e.id}" title="${e.年}｜${e.標題}"><span class="點"></span><span class="年">${短年(e.年)}</span><span class="名">${e.標題}</span></button>`;
      });
    });
    內.insertAdjacentHTML("beforeend", html);
    內.querySelectorAll(".軌期").forEach(b => b.onclick = () => 去封面(+b.dataset.p));
    內.querySelectorAll(".軌列").forEach(b => b.onclick = () => { 去事件(b.dataset.id); document.body.classList.remove("開軌道"); });
    裝拉把();
  }
  const 短年 = (s) => s.replace(/（.*）/, "");
  function 更新軌道(捲 = false) {
    document.querySelectorAll(".軌列").forEach(b => {
      b.classList.toggle("選", b.dataset.id === 狀態.事);
      b.classList.toggle("看過", 狀態.看過.has(b.dataset.id));
    });
    const 目標 = 狀態.事 ? document.querySelector(`.軌列[data-id="${狀態.事}"]`) : document.querySelectorAll(".軌期")[狀態.期];
    if (!目標) return;
    const 把 = $("#軌把");
    把.style.top = (目標.offsetTop + 目標.offsetHeight / 2 - 14) + "px";
    把.style.borderColor = getComputedStyle(目標).getPropertyValue("--c");
    if (捲 || true) {
      const 捲區 = $("#軌道捲"), y = 目標.offsetTop - 捲區.clientHeight / 2;
      捲區.scrollTo({ top: y, behavior: "smooth" });
    }
  }
  function 裝拉把() {
    const 把 = $("#軌把"), 捲區 = $("#軌道捲");
    把.innerHTML = '<span class="泡"></span>';
    let 拖中 = false, 候選 = null;
    const 列們 = () => [...document.querySelectorAll(".軌列")];
    function 找最近(clientY) {
      const r = $("#軌道內").getBoundingClientRect(), y = clientY - r.top;
      let 最 = null, 差 = Infinity;
      for (const b of 列們()) { const d = Math.abs(b.offsetTop + b.offsetHeight / 2 - y); if (d < 差) { 差 = d; 最 = b; } }
      return { 最, y };
    }
    把.addEventListener("pointerdown", (e) => { 拖中 = true; 把.setPointerCapture(e.pointerId); 把.classList.add("拖"); e.preventDefault(); });
    把.addEventListener("pointermove", (e) => {
      if (!拖中) return;
      const { 最, y } = 找最近(e.clientY);
      把.style.top = (Math.max(0, y) - 14) + "px";
      const r = 捲區.getBoundingClientRect();
      if (e.clientY < r.top + 40) 捲區.scrollTop -= 12;
      if (e.clientY > r.bottom - 40) 捲區.scrollTop += 12;
      if (最) { 候選 = 最.dataset.id; const x = 依id[候選]; 把.querySelector(".泡").textContent = `${x.e.年}｜${x.e.標題}`; 把.style.borderColor = 小期色(x); }
    });
    const 放開 = () => { if (!拖中) return; 拖中 = false; 把.classList.remove("拖"); if (候選) 去事件(候選); else 更新軌道(); 候選 = null; };
    把.addEventListener("pointerup", 放開);
    把.addEventListener("pointercancel", 放開);
  }

  /* ── 彈窗 ── */
  function 開窗(html, 期色) {
    const 窗 = $("#彈窗");
    if (期色) 窗.style.setProperty("--期色", 期色);
    窗.innerHTML = `<button class="關閉" id="關閉" aria-label="關閉">✕</button>` + html;
    $("#遮罩").hidden = false;
    $("#關閉").onclick = 關窗;
  }
  function 關窗() { $("#遮罩").hidden = true; 語音.停(); }
  $("#遮罩").addEventListener("click", (e) => { if (e.target.id === "遮罩") 關窗(); });

  /* ── 時期整理：分類板＋人物 ── */
  function 開整理(pi) {
    const p = TL.時期[pi];
    const 欄 = Object.keys(TL.分類).map(c => {
      const 們 = p.事件.filter(e => e.分類.includes(c));
      if (!們.length) return "";
      const k = TL.分類[c];
      return `<div class="分類欄" style="--c:${k.色}"><h3>${k.圖示} ${c}</h3>${們.map(e => `<button class="晶片" data-id="${e.id}"><b>${e.年}</b>${e.標題}</button>`).join("")}</div>`;
    }).join("");
    const 人 = []; const 見 = new Set();
    p.事件.forEach(e => e.人物.forEach(r => { if (!見.has(r.名)) { 見.add(r.名); 人.push({ ...r, id: e.id }); } }));
    const 下期 = TL.時期[pi + 1];
    開窗(`<h2>📋 ${p.名}｜分類整理</h2>
      <p style="font-size:18px">${p.年代}　🏯 ${p.朝代}</p>
      <div class="分類板">${欄}</div>
      ${人.length ? `<h2 style="margin-top:18px">👤 這個時期的人物</h2><div>${人.map(r => `<button class="索引項" data-id="${r.id}"><b>${r.名}</b><small>${r.說}</small></button>`).join("")}</div>` : ""}
      ${p.終點 ? `<div class="接下來" style="margin-top:16px">🚩 ${p.終點}</div>` : ""}
      <div class="彈窗鈕列">
        <button class="主" id="窗測驗">📝 ${p.短名}小測驗（${p.測驗.length} 題）</button>
        ${下期 ? `<button id="窗下期">➡️ 前往下一個時期：${下期.名}</button>` : ""}
      </div>`, p.色);
    $("#彈窗").querySelectorAll("[data-id]").forEach(b => b.onclick = () => { 關窗(); 去事件(b.dataset.id); });
    $("#窗測驗").onclick = () => 開測驗(pi);
    if (下期) $("#窗下期").onclick = () => { 關窗(); 去封面(pi + 1); };
  }

  /* ── 小測驗（兩選一，選項位置固定，不唸 A／B） ── */
  function 開測驗(pi) {
    const p = TL.時期[pi];
    const 紀錄 = [];
    let 題 = 0;
    function 畫題() {
      const q = p.測驗[題];
      開窗(`<h2>📝 ${p.短名}小測驗</h2>
        <div class="進度點">${p.測驗.map((_, i) => `<i class="${紀錄[i] === true ? "對" : 紀錄[i] === false ? "錯" : ""} ${i === 題 ? "現" : ""}"></i>`).join("")}</div>
        <div class="題幹">${q.題}</div>
        <button class="唸鈕" id="唸題">🔊 唸題目</button>
        <div class="選項列" style="margin-top:14px">${q.選項.map((o, i) => `<button class="選項鈕" data-i="${i}">${o}</button>`).join("")}</div>
        <div id="回饋區"></div>`, p.色);
      $("#唸題").onclick = (ev) => 語音.播(`q_${p.id}_${題 + 1}`, `${q.題}${q.選項[0]}，還是${q.選項[1]}？`, ev.currentTarget);
      語音.自動(`q_${p.id}_${題 + 1}`, `${q.題}${q.選項[0]}，還是${q.選項[1]}？`);
      $("#彈窗").querySelectorAll(".選項鈕").forEach(b => b.onclick = () => 作答(+b.dataset.i));
    }
    function 作答(i) {
      const q = p.測驗[題], 對 = i === q.正解;
      紀錄[題] = 對;
      $("#彈窗").querySelectorAll(".選項鈕").forEach((b, k) => {
        b.disabled = true;
        if (k === q.正解) b.classList.add("正解");
        else if (k === i) b.classList.add("你選");
      });
      const x = 依id[q.事件];
      $("#回饋區").innerHTML = `<div class="回饋 ${對 ? "" : "錯"}">${對 ? "<b>✅ 答對了！</b><br>" : "<b>💡 再看一次：</b><br>"}答案是「${q.選項[q.正解]}」。${q.解說}</div>
        <div class="彈窗鈕列">
          <button class="主" id="下一題">${題 < p.測驗.length - 1 ? "下一題 ▶" : "看成績 🏁"}</button>
          <button id="去複習">📖 回去複習「${x.e.標題}」</button>
        </div>`;
      語音.自動(`a_${p.id}_${題 + 1}`, `答案是${q.選項[q.正解]}。${q.解說}`);
      $("#下一題").onclick = () => { 題++; 題 < p.測驗.length ? 畫題() : 畫成績(); };
      $("#去複習").onclick = () => { 關窗(); 去事件(q.事件); };
    }
    function 畫成績() {
      const 分 = 紀錄.filter(Boolean).length;
      狀態.成績[p.id] = Math.max(分, 狀態.成績[p.id] || 0); 存.寫("成績", 狀態.成績); 畫時期列();
      const 錯題 = p.測驗.map((q, i) => ({ q, i })).filter(({ i }) => !紀錄[i]);
      開窗(`<h2>🏁 ${p.短名}小測驗 成績</h2>
        <div class="成績">${"⭐".repeat(Math.round(分 / p.測驗.length * 3)) || "💪"} ${分} / ${p.測驗.length}</div>
        ${錯題.length ? `<p style="font-size:19px">這幾題可以再回去複習：</p>${錯題.map(({ q }) => `<button class="晶片" data-id="${q.事件}"><b>📖</b>${q.題}</button>`).join("")}` : `<p style="font-size:21px">全部答對，太厲害了！</p>`}
        <div class="彈窗鈕列"><button class="主" id="再做">🔁 再做一次</button><button id="回軸">🕰️ 回到時間軸</button></div>`, p.色);
      $("#彈窗").querySelectorAll("[data-id]").forEach(b => b.onclick = () => { 關窗(); 去事件(b.dataset.id); });
      $("#再做").onclick = () => 開測驗(pi);
      $("#回軸").onclick = 關窗;
    }
    畫題();
  }

  /* ── 人事物索引：人物、地點、名詞、分類，依時期分組 ── */
  function 開索引(分頁 = "人物", 關鍵 = "") {
    const 組 = TL.時期.map(p => {
      let 項 = [];
      const 見 = new Set();
      p.事件.forEach(e => {
        if (分頁 === "人物") e.人物.forEach(r => { if (!見.has(r.名)) { 見.add(r.名); 項.push({ 名: r.名, 說: r.說, id: e.id }); } });
        if (分頁 === "名詞") e.註記.forEach(n => { if (!見.has(n.詞)) { 見.add(n.詞); 項.push({ 名: n.詞, 說: n.解, id: e.id }); } });
        if (分頁 === "地點") e.圖解.filter(g => g.型 === "地圖").forEach(g => g.點.forEach(d => { if (!見.has(d)) { 見.add(d); 項.push({ 名: d, 說: `${e.年}｜${e.標題}`, id: e.id }); } }));
        if (分頁 === "年代") 項.push({ 名: e.年, 說: e.標題, id: e.id });
      });
      if (關鍵) 項 = 項.filter(x => (x.名 + x.說).includes(關鍵));
      if (!項.length) return "";
      return `<div class="索引期" style="--c:${p.色}"><h3>${p.名}（${p.年代}）</h3>${項.map(x => `<button class="索引項" data-id="${x.id}"><b>${x.名}</b><small>${x.說}</small></button>`).join("")}</div>`;
    }).join("");
    開窗(`<h2>🔎 人事物索引</h2>
      <div class="索引分頁">${["人物", "地點", "名詞", "年代"].map(t => `<button data-t="${t}" class="${t === 分頁 ? "選" : ""}">${{ 人物: "👤", 地點: "📍", 名詞: "📌", 年代: "📅" }[t]} ${t}</button>`).join("")}</div>
      <input class="搜尋" id="搜尋" placeholder="輸入關鍵字，例如：鄭成功、水圳、淡水" value="${關鍵}">
      <div>${組 || "<p>找不到符合的項目。</p>"}</div>`, "#263238");
    $("#彈窗").querySelectorAll(".索引分頁 button").forEach(b => b.onclick = () => 開索引(b.dataset.t, $("#搜尋").value));
    $("#彈窗").querySelectorAll("[data-id]").forEach(b => b.onclick = () => { 關窗(); 去事件(b.dataset.id); });
    const 框 = $("#搜尋");
    框.oninput = () => { const v = 框.value, pos = 框.selectionStart; 開索引(分頁, v); const n = $("#搜尋"); n.focus(); n.setSelectionRange(pos, pos); };
  }

  /* ── 工具列 ── */
  function 設朗讀鈕() { const b = $("#鈕朗讀"); b.textContent = 狀態.朗讀 ? "🔊 自動朗讀：開" : "🔇 自動朗讀：關"; b.classList.toggle("關", !狀態.朗讀); }
  $("#鈕朗讀").onclick = () => { 狀態.朗讀 = !狀態.朗讀; 存.寫("朗讀", 狀態.朗讀); if (!狀態.朗讀) 語音.停(); 設朗讀鈕(); };
  $("#鈕索引").onclick = () => 開索引();
  $("#鈕全景").onclick = () => W3D && W.全景();
  $("#鈕臺灣").onclick = () => W3D && W.臺灣全景();
  $("#鈕焦點").onclick = () => W3D && W.回焦點();
  $("#鈕重播").onclick = () => { if (狀態.事) 去事件(狀態.事); else 去封面(狀態.期); };
  $("#鈕收合").onclick = () => { document.body.classList.toggle("收起"); $("#鈕收合").textContent = document.body.classList.contains("收起") ? "▶" : "◀"; };
  $("#鈕軌道").onclick = () => document.body.classList.toggle("開軌道");
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "Escape") { if (!$("#遮罩").hidden) 關窗(); return; }
    if (!$("#遮罩").hidden) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") 下一站();
    if (e.key === "ArrowLeft" || e.key === "PageUp") 上一站();
  });
  setTimeout(() => $("#操作提示").classList.add("淡"), 9000);
  // 手機上點說明卡標題列可收合
  $("#資訊卡").addEventListener("dblclick", () => { if (innerWidth <= 900) document.body.classList.toggle("收起"); });

  /* ── 啟動 ── */
  let W3D = false;
  try {
    W.啟動({ 畫布: $("#畫布"), 標籤層: $("#標籤層"), 字幕: $("#字幕"), 地點表: TL.地點 });
    W3D = true;
  } catch (err) {
    console.error(err);
    $("#無3D").hidden = false;
  }
  設朗讀鈕();
  畫軌道();
  const 網址id = new URLSearchParams(location.search).get("e");
  const 上次 = 網址id || 存.讀("目前", null);
  if (上次 && 依id[上次]) { 去封面(依id[上次].pi); 去事件(上次, false); }
  else 去封面(0);

  // 給教學影片錄製腳本用
  window.App = { 去事件, 去封面, 全事件, 唸稿 };
})();
