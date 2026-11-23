// 臺灣歷史軌跡｜3D 漂浮島場景引擎
// three.js r147 UMD（js/vendor/three.min.js），雙擊 index.html 就能離線使用。
// 座標：臺灣附近用實際比例；離臺灣越遠，距離做對數壓縮，讓東亞周邊國家也放得進同一片漂浮海。
(function () {
  "use strict";
  const T = THREE;
  const W = {};
  window.W = W;

  /* ══════════ 1. 投影 ══════════ */
  const 中心 = [120.85, 23.72], R0 = 450, C壓 = 250, 盤R = 1300, 陸高 = 4.5, 鄰高 = 3;
  function 投(lon, lat) {
    const x = (lon - 中心[0]) * 160, z = (中心[1] - lat) * 176;
    const r = Math.hypot(x, z);
    if (r <= R0) return [x, z];
    const r2 = R0 + C壓 * Math.log(1 + (r - R0) / C壓);
    return [x * r2 / r, z * r2 / r];
  }

  /* ══════════ 2. 地理資料（示意，不是精確測繪） ══════════ */
  const 臺灣經緯 = [
    [121.54, 25.30], [121.64, 25.23], [121.69, 25.21], [121.74, 25.15], [121.92, 25.13], [122.00, 25.01],
    [121.86, 24.88], [121.83, 24.76], [121.87, 24.60], [121.80, 24.45], [121.76, 24.33], [121.62, 23.98],
    [121.52, 23.60], [121.45, 23.32], [121.38, 23.10], [121.16, 22.76], [121.00, 22.60], [120.90, 22.34],
    [120.88, 22.20], [120.88, 22.00], [120.85, 21.90], [120.73, 21.93], [120.70, 22.02], [120.70, 22.08],
    [120.68, 22.20], [120.59, 22.36], [120.45, 22.46], [120.27, 22.58], [120.28, 22.68], [120.18, 22.88],
    [120.15, 23.00], [120.08, 23.15], [120.12, 23.27], [120.15, 23.38], [120.15, 23.46], [120.14, 23.58],
    [120.20, 23.70], [120.25, 23.80], [120.32, 23.93], [120.42, 24.06], [120.50, 24.27], [120.58, 24.38],
    [120.64, 24.44], [120.76, 24.62], [120.85, 24.70], [120.92, 24.85], [120.98, 24.93], [121.10, 25.05],
    [121.30, 25.13], [121.39, 25.15], [121.42, 25.19], [121.56, 25.29]
  ];
  const 澎湖經緯 = [[119.52, 23.68], [119.66, 23.66], [119.69, 23.52], [119.56, 23.44], [119.50, 23.55]];
  const 大陸海岸 = [
    [94.0, 16.0], [97.6, 16.5], [98.6, 12.0], [98.3, 8.0], [100.3, 5.4], [101.3, 2.8], [103.4, 1.3], [104.2, 1.4],
    [103.4, 3.8], [102.6, 6.0], [101.3, 6.9], [100.3, 8.5], [99.9, 10.0], [99.9, 12.5], [100.9, 13.4], [102.5, 12.2],
    [103.5, 10.6], [104.5, 10.4], [105.0, 8.6], [106.7, 10.4], [107.6, 10.9], [109.2, 11.6], [109.2, 12.2], [109.3, 13.8],
    [108.9, 15.4], [108.2, 16.1], [107.1, 17.0], [106.4, 18.0], [105.7, 19.0], [106.6, 20.7], [107.9, 21.5], [108.6, 21.6],
    [109.6, 21.5], [110.2, 20.4], [110.6, 21.2], [111.8, 21.6], [113.0, 22.0], [113.55, 22.2], [114.2, 22.3], [115.5, 22.7],
    [116.7, 23.3], [117.5, 23.8], [118.1, 24.5], [118.7, 24.8], [119.1, 25.4], [119.6, 26.0], [119.9, 26.7], [120.5, 27.3],
    [121.0, 28.0], [121.6, 28.9], [121.9, 29.9], [121.3, 30.3], [121.9, 31.0], [121.9, 31.7], [121.0, 32.4], [120.5, 33.5],
    [119.4, 34.7], [120.3, 36.0], [121.0, 36.6], [122.5, 37.4], [121.5, 37.6], [120.3, 37.6], [119.0, 37.2], [118.5, 38.3],
    [117.7, 39.0], [118.5, 39.2], [119.5, 39.9], [121.0, 40.8], [122.2, 40.5], [121.2, 39.6], [121.2, 38.8], [122.2, 39.3],
    [123.5, 39.8], [124.3, 39.9], [125.2, 39.4], [125.3, 38.7], [126.0, 37.8], [126.6, 37.4], [126.5, 36.5], [126.3, 35.5],
    [126.3, 34.5], [127.3, 34.6], [128.5, 34.9], [129.1, 35.1], [129.5, 36.0], [129.4, 37.2], [128.6, 38.4], [127.6, 39.6],
    [128.4, 40.0], [129.7, 40.9], [130.0, 42.0], [130.7, 42.3], [131.9, 43.0], [133.0, 42.8], [135.0, 43.5], [137.5, 45.5],
    [140.0, 48.5], [141.0, 52.0]
  ];
  const 鄰島經緯 = {
    海南: [[108.6, 19.2], [109.5, 18.2], [110.5, 18.7], [111.0, 19.6], [110.6, 20.1], [109.6, 20.1], [108.7, 19.6]],
    九州: [[129.7, 33.4], [130.4, 33.9], [131.0, 33.9], [131.9, 33.1], [131.5, 32.0], [131.1, 31.3], [130.6, 31.0], [130.2, 31.4], [130.4, 32.3], [129.8, 32.6], [129.6, 33.1]],
    四國: [[132.4, 33.3], [132.9, 32.8], [133.8, 33.5], [134.7, 33.8], [134.6, 34.2], [133.6, 34.4], [132.7, 33.9]],
    本州: [[130.9, 34.0], [131.4, 34.4], [132.4, 34.4], [133.5, 34.5], [134.6, 34.7], [135.2, 34.6], [135.1, 34.2], [135.4, 33.5], [135.9, 33.5], [136.8, 34.3], [137.4, 34.6], [138.3, 34.6], [138.9, 34.7], [139.2, 35.2], [139.8, 35.0], [140.4, 35.2], [140.8, 35.8], [140.8, 36.8], [141.0, 38.3], [141.6, 38.9], [141.9, 39.8], [141.5, 40.6], [141.4, 41.4], [140.6, 41.2], [139.9, 40.6], [140.0, 39.6], [139.6, 38.6], [138.6, 37.6], [137.3, 36.8], [136.7, 37.3], [136.1, 36.2], [135.5, 35.6], [134.3, 35.6], [133.1, 35.6], [132.2, 35.2], [131.3, 34.5]],
    北海道: [[140.0, 41.5], [141.1, 41.8], [141.8, 42.6], [143.3, 42.0], [144.4, 42.9], [145.6, 43.3], [144.8, 43.9], [143.6, 44.2], [141.9, 45.5], [141.6, 44.3], [141.3, 43.3], [140.4, 43.3], [139.9, 42.6]],
    呂宋: [[120.6, 18.5], [121.2, 18.6], [122.2, 18.5], [122.3, 17.3], [122.5, 16.5], [121.6, 15.8], [121.6, 14.8], [122.2, 14.1], [123.0, 13.8], [124.1, 13.0], [123.9, 12.6], [123.3, 13.0], [122.6, 13.2], [121.7, 13.9], [120.9, 13.8], [120.6, 14.4], [120.0, 14.8], [119.9, 15.9], [120.3, 16.3], [120.4, 17.5]],
    民答那峨: [[122.0, 7.0], [123.5, 7.6], [124.0, 8.2], [125.0, 9.0], [125.6, 9.8], [126.3, 9.0], [126.6, 7.2], [126.0, 6.3], [125.3, 5.6], [124.0, 6.4], [122.1, 6.9]],
    巴拉望: [[117.2, 8.4], [118.0, 9.0], [119.0, 10.0], [119.6, 11.0], [119.3, 11.3], [118.4, 10.2], [117.5, 9.1]],
    婆羅洲: [[109.0, 1.8], [110.4, 1.7], [111.5, 2.8], [113.0, 3.2], [114.5, 4.6], [115.5, 5.4], [116.7, 6.9], [117.7, 6.4], [119.2, 5.1], [118.0, 4.3], [117.8, 1.9], [118.9, 0.9], [117.5, 0.1], [116.6, -1.9], [116.3, -3.5], [114.5, -3.7], [113.0, -3.2], [111.6, -3.0], [110.2, -2.9], [110.0, -1.4], [109.0, 0.0]],
    蘇門答臘: [[95.3, 5.6], [97.5, 5.2], [98.7, 3.8], [100.4, 2.2], [101.5, 1.7], [103.5, 0.5], [104.4, -1.6], [105.9, -3.1], [105.8, -5.8], [104.6, -5.9], [103.0, -4.3], [101.0, -2.3], [99.5, 0.0], [98.3, 1.9], [96.8, 3.7]],
    爪哇: [[105.2, -6.8], [106.0, -5.9], [106.8, -6.1], [108.3, -6.3], [110.4, -6.9], [111.5, -6.6], [112.7, -7.0], [114.4, -7.7], [114.6, -8.6], [112.5, -8.4], [110.4, -8.1], [108.0, -7.8], [106.4, -7.4], [105.5, -6.9]]
  };
  const 小島橢圓 = [
    [129.4, 28.3, .25, .15], [127.9, 26.45, .16, .42], [125.3, 24.75, .15, .1], [124.15, 24.4, .22, .12], [123.0, 24.45, .1, .06],
    [121.95, 20.45, .07, .14], [121.9, 19.4, .15, .1], [121.0, 13.0, .45, .35], [125.0, 11.8, .5, .6], [124.8, 10.9, .3, .5],
    [122.5, 11.1, .55, .4], [123.0, 10.0, .35, .7], [123.8, 10.3, .12, .6], [126.55, 33.38, .3, .12]
  ];
  const 橢圓 = (lon, lat, rx, ry) => Array.from({ length: 12 }, (_, i) => [lon + rx * Math.cos(i / 12 * 6.283), lat + ry * Math.sin(i / 12 * 6.283)]);

  // 周邊地區：標籤位置與朝代（依事件年份自動換）
  const 周邊區 = {
    中國: { 點: [116.6, 27.0], 名: "中國" },
    朝鮮: { 點: [127.6, 36.8], 名: "朝鮮半島" },
    日本: { 點: [133.0, 34.6], 名: "日本" },
    琉球: { 點: [128.0, 26.9], 名: "琉球" },
    菲律賓: { 點: [121.7, 16.2], 名: "菲律賓（呂宋島）" },
    越南: { 點: [106.4, 16.6], 名: "越南" },
    爪哇: { 點: [110.0, -7.3], 名: "爪哇（今印尼）" },
    婆羅洲: { 點: [114.0, 0.5], 名: "婆羅洲" },
    澳門: { 點: [113.55, 22.25], 名: "澳門" }
  };
  const 清年號 = [[1644, "順治"], [1662, "康熙"], [1723, "雍正"], [1736, "乾隆"], [1796, "嘉慶"], [1821, "道光"], [1851, "咸豐"], [1862, "同治"], [1875, "光緒"]];
  function 朝代(區, 年) {
    if (年 == null) return "";
    switch (區) {
      case "中國":
        if (年 < 1368) return "";
        if (年 < 1573) return "明朝";
        if (年 <= 1620) return "明朝（萬曆年間）";
        if (年 <= 1627) return "明朝（天啟年間）";
        if (年 < 1644) return "明朝（崇禎年間）";
        { let n = "順治"; for (const [y, k] of 清年號) if (年 >= y) n = k; return `清朝（${n}年間）`; }
      case "日本":
        if (年 < 1573) return "戰國時代";
        if (年 < 1603) return "安土桃山時代";
        if (年 < 1868) return 年 >= 1639 && 年 <= 1853 ? "江戶幕府（鎖國中）" : "江戶幕府";
        return "明治時代";
      case "朝鮮": return 年 < 1392 ? "高麗" : 年 < 1897 ? "朝鮮王朝" : "大韓帝國";
      case "琉球": return 年 < 1429 ? "三山時代" : 年 < 1879 ? "琉球王國（中國的藩屬）" : "日本沖繩縣";
      case "菲律賓": return 年 < 1565 ? "各島部落" : "西班牙殖民地";
      case "爪哇": return 年 < 1619 ? "萬丹等王國" : 年 < 1800 ? "荷蘭東印度公司（巴達維亞）" : "荷蘭殖民地（巴達維亞）";
      case "越南": return 年 < 1789 ? "後黎朝" : 年 < 1802 ? "西山朝" : 年 >= 1858 && 年 <= 1885 ? "阮朝（法國入侵中）" : 年 > 1885 ? "阮朝（法國保護國）" : "阮朝";
      case "澳門": return 年 < 1557 ? "明朝" : "葡萄牙人居住";
      case "婆羅洲": return "汶萊等王國";
    }
    return "";
  }
  W.朝代 = 朝代;

  // 臺灣以外的港口與地點
  const 外地點 = {
    廈門: [118.08, 24.47], 金門: [118.35, 24.44], 泉州: [118.6, 24.88], 漳州: [117.65, 24.5], 福州: [119.3, 26.08],
    馬尾: [119.45, 26.0], 潮州: [116.62, 23.66], 長崎: [129.87, 32.75], 那霸: [127.68, 26.2], 馬尼拉: [120.97, 14.6],
    巴達維亞: [106.82, -6.13], 澳門: [113.55, 22.19], 北京: [116.4, 39.9], 順化: [107.6, 16.46]
  };

  /* ══════════ 3. 小工具 ══════════ */
  let 種 = 20251122;
  const 亂 = () => (種 = (種 * 16807) % 2147483647) / 2147483647;
  const 夾 = (v, a, b) => Math.max(a, Math.min(b, v));
  const 緩 = (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const 彈 = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  function 在內(x, z, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, zi] = poly[i], [xj, zj] = poly[j];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
    }
    return c;
  }
  function 點線距(px, pz, a, b) {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz;
    const t = L ? 夾(((px - a[0]) * dx + (pz - a[1]) * dz) / L, 0, 1) : 0;
    return Math.hypot(px - a[0] - t * dx, pz - a[1] - t * dz);
  }
  function 邊距(x, z, poly) { let m = Infinity; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) m = Math.min(m, 點線距(x, z, poly[j], poly[i])); return m; }

  /* ══════════ 4. 陸塊登記與地形高度 ══════════ */
  const 陸塊 = [];
  function 登記陸(poly, 臺) {
    const xs = poly.map(p => p[0]), zs = poly.map(p => p[1]);
    const L = { poly, 臺, minx: Math.min(...xs), maxx: Math.max(...xs), minz: Math.min(...zs), maxz: Math.max(...zs) };
    陸塊.push(L);
    return L;
  }
  function 陸塊於(x, z) {
    for (const L of 陸塊) if (x >= L.minx && x <= L.maxx && z >= L.minz && z <= L.maxz && 在內(x, z, L.poly)) return L;
    return null;
  }
  const 臺灣 = 臺灣經緯.map(p => 投(p[0], p[1]));
  const 澎湖 = 澎湖經緯.map(p => 投(p[0], p[1]));
  登記陸(臺灣, true); 登記陸(澎湖, true);
  function 大陸多邊形() {
    const pts = 大陸海岸.map(p => 投(p[0], p[1]));
    const a0 = Math.atan2(pts[pts.length - 1][1], pts[pts.length - 1][0]);
    let a1 = Math.atan2(pts[0][1], pts[0][0]);
    while (a1 > a0) a1 -= Math.PI * 2;
    const R = 盤R - 10;
    for (let i = 0; i <= 60; i++) { const a = a0 + (a1 - a0) * i / 60; pts.push([Math.cos(a) * R, Math.sin(a) * R]); }
    return pts;
  }
  const 鄰陸們 = [大陸多邊形()];
  for (const k in 鄰島經緯) 鄰陸們.push(鄰島經緯[k].map(p => 投(p[0], p[1])));
  for (const e of 小島橢圓) 鄰陸們.push(橢圓(...e).map(p => 投(p[0], p[1])));
  鄰陸們.forEach(p => 登記陸(p, false));

  const 山們 = [];
  const 埔里xz = 投(120.97, 23.97);
  const 八仙洞xz = 投(121.41, 23.33);   // 長濱八仙洞前留一塊海岸平台，演出才看得到
  function 造山脈(線, 高們, 基r) {
    for (let s = 0; s < 線.length - 1; s++) {
      const [ax, az] = 投(...線[s]), [bx, bz] = 投(...線[s + 1]);
      const n = Math.ceil(Math.hypot(bx - ax, bz - az) / 7);
      for (let k = 0; k < n; k++) {
        const t = k / n, x = ax + (bx - ax) * t + (亂() - .5) * 14, z = az + (bz - az) * t + (亂() - .5) * 14;
        if (!在內(x, z, 臺灣)) continue;
        if (Math.hypot(x - 埔里xz[0], z - 埔里xz[1]) < 18) continue;
        if (Math.hypot(x - 八仙洞xz[0], z - 八仙洞xz[1]) < 16) continue;
        const r = Math.min(基r * (.7 + 亂() * .6), 邊距(x, z, 臺灣) * .95);
        if (r < 7) continue;
        山們.push({ x, z, r, h: (高們[s] + (高們[s + 1] - 高們[s]) * t) * (.65 + 亂() * .5) });
      }
    }
  }
  造山脈([[121.55, 24.85], [121.35, 24.6], [121.25, 24.35], [121.15, 24.05], [121.05, 23.75], [120.98, 23.47], [120.92, 23.1], [120.88, 22.75], [120.83, 22.4], [120.82, 22.15]],
    [26, 42, 52, 48, 50, 64, 54, 44, 30, 18], 30);
  造山脈([[121.5, 23.9], [121.42, 23.55], [121.32, 23.2], [121.2, 22.9]], [20, 24, 20, 14], 16);
  function 地高(x, z) {
    const L = 陸塊於(x, z);
    if (!L) return 0;
    if (!L.臺) return 鄰高;
    let h = 陸高;
    for (const m of 山們) { const d = Math.hypot(x - m.x, z - m.z); if (d < m.r) h = Math.max(h, 陸高 + m.h * (1 - d / m.r)); }
    return h;
  }
  W.地高 = 地高;

  /* ══════════ 5. 材質、幾何快取 ══════════ */
  const 材快取 = new Map();
  function 材(色, 額外) {
    const k = 色 + (額外 ? JSON.stringify(額外) : "");
    let m = 材快取.get(k);
    if (!m) { m = new T.MeshStandardMaterial(Object.assign({ color: 色, flatShading: true, roughness: .85, metalness: 0 }, 額外 || {})); 材快取.set(k, m); }
    return m;
  }
  function 網(geo, 色, 額外, 影 = true) {
    const m = new T.Mesh(geo, typeof 色 === "number" ? 材(色, 額外) : 色);
    m.castShadow = 影; m.receiveShadow = true;
    return m;
  }
  const 幾快取 = {};
  const 幾 = (名, 造) => 幾快取[名] || (幾快取[名] = 造());

  /* ══════════ 6. 渲染器、場景、燈光 ══════════ */
  let 渲染器, 場景, 鏡頭, 浮島, 舞台, 雲群, 瀑布材 = [], 標籤層, 字幕el, 畫布;
  const 時鐘 = { 總: 0, 場: 0 };

  function 造世界() {
    場景 = new T.Scene();
    場景.fog = new T.Fog(0xdcecf8, 4200, 11000);
    鏡頭 = new T.PerspectiveCamera(42, 1, 2, 16000);
    場景.add(new T.HemisphereLight(0xeaf6ff, 0x8f8266, .62));
    const 日 = new T.DirectionalLight(0xfff1dc, .72);
    日.position.set(260, 620, 300);
    日.castShadow = true;
    日.shadow.mapSize.set(2048, 2048);
    Object.assign(日.shadow.camera, { left: -460, right: 460, top: 460, bottom: -460, near: 50, far: 1600 });
    日.shadow.bias = -0.0008;
    場景.add(日);
    場景.add(new T.AmbientLight(0xffffff, .1));

    浮島 = new T.Group();
    場景.add(浮島);
    舞台 = new T.Group();
    浮島.add(舞台);

    // 海盤
    const 海 = new T.Mesh(new T.CylinderGeometry(盤R, 盤R, 12, 128, 1),
      [材(0x2f6f93), 材(0x4aa3d8, { roughness: .35, metalness: .05 }), 材(0x3b2f2f)]);
    海.position.y = -6; 海.receiveShadow = true;
    浮島.add(海);
    W.海 = 海;
    const 浪邊 = new T.Mesh(new T.TorusGeometry(盤R, 2.2, 6, 160), 材(0xffffff, { roughness: .5 }));
    浪邊.rotation.x = Math.PI / 2; 浪邊.position.y = .4;
    浮島.add(浪邊);

    // 海盤下方的岩石（漂浮感）
    const 岩 = new T.ConeGeometry(盤R * .97, 盤R * .78, 18, 5);
    岩.rotateX(Math.PI);
    const 位 = 岩.attributes.position, 色們 = [];
    const 上色 = new T.Color(0x7a5a3a), 下色 = new T.Color(0x4b4a55), tmp = new T.Color();
    for (let i = 0; i < 位.count; i++) {
      const x = 位.getX(i), y = 位.getY(i), z = 位.getZ(i);
      const t = (y + 盤R * .39) / (盤R * .78);
      if (t < .98) {
        const n = Math.sin(x * .013 + z * .021) * Math.cos(z * .017 - x * .009);
        位.setXYZ(i, x * (1 + n * .16), y + n * 40, z * (1 + n * .16));
      }
      tmp.copy(下色).lerp(上色, 夾(t, 0, 1));
      色們.push(tmp.r, tmp.g, tmp.b);
    }
    岩.setAttribute("color", new T.Float32BufferAttribute(色們, 3));
    岩.computeVertexNormals();
    const 岩網 = new T.Mesh(岩, new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
    岩網.position.y = -12 - 盤R * .39;
    浮島.add(岩網);
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * 6.283 + 亂(), r = 盤R * (.35 + 亂() * .5), h = 220 + 亂() * 260;
      const g = new T.ConeGeometry(60 + 亂() * 90, h, 6); g.rotateX(Math.PI);
      const m = 網(g, 0x5a5048, null, false);
      m.position.set(Math.cos(a) * r, -20 - h / 2 - 亂() * 60, Math.sin(a) * r);
      浮島.add(m);
    }

    // 海盤邊緣的瀑布
    const 瀑c = document.createElement("canvas"); 瀑c.width = 64; 瀑c.height = 256;
    const 瀑x = 瀑c.getContext("2d");
    for (let i = 0; i < 26; i++) {
      瀑x.fillStyle = `rgba(255,255,255,${.25 + 亂() * .6})`;
      瀑x.fillRect(亂() * 64, 亂() * 256, 2 + 亂() * 5, 30 + 亂() * 90);
    }
    for (let i = 0; i < 16; i++) {
      const tex = new T.CanvasTexture(瀑c); tex.wrapT = T.RepeatWrapping;
      const m = new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: .75, side: T.DoubleSide, depthWrite: false });
      瀑布材.push(m);
      const a = i / 16 * 6.283 + .2;
      const p = new T.Mesh(new T.PlaneGeometry(60 + 亂() * 50, 360), m);
      p.position.set(Math.cos(a) * (盤R + 1.5), -180, Math.sin(a) * (盤R + 1.5));
      p.rotation.y = -a + Math.PI / 2;
      浮島.add(p);
    }

    // 陸地
    造陸(臺灣, 0x7dbb5a, 0xe8d7a5, 5, true);
    造陸(澎湖, 0x7dbb5a, 0xe8d7a5, 5, true);
    鄰陸們.forEach(p => 造陸(p, 0x9db57a, 0xd9c99a, 3.6, false));
    造山();
    造樹();
    造河();
    造富士();

    // 雲
    雲群 = new T.Group(); 場景.add(雲群);
    for (let i = 0; i < 26; i++) {
      const c = new T.Group(), n = 4 + Math.floor(亂() * 4);
      for (let k = 0; k < n; k++) {
        const s = new T.Mesh(幾("雲球", () => new T.IcosahedronGeometry(1, 1)), 材(0xffffff, { roughness: 1 }));
        const r = 50 + 亂() * 70;
        s.scale.set(r, r * .7, r);
        s.position.set((k - n / 2) * 70 + 亂() * 40, 亂() * 40, 亂() * 60);
        c.add(s);
      }
      const a = 亂() * 6.283, R = 1500 + 亂() * 1300;
      c.position.set(Math.cos(a) * R, -500 + 亂() * 900, Math.sin(a) * R);
      c.userData.速 = (.004 + 亂() * .01) * (亂() < .5 ? 1 : -1);
      雲群.add(c);
    }
  }

  function 造陸(poly, 頂色, 邊色, 厚, 臺) {
    const s = new T.Shape(poly.map(([x, z]) => new T.Vector2(x, -z)));
    const g = new T.ExtrudeGeometry(s, { depth: 厚, bevelEnabled: true, bevelThickness: 1.5, bevelSize: 臺 ? 2.5 : 2, bevelSegments: 1, curveSegments: 1 });
    const m = new T.Mesh(g, [材(頂色), 材(邊色)]);
    m.rotation.x = -Math.PI / 2;
    m.position.y = (臺 ? 陸高 : 鄰高) - 厚 - 1.5;
    m.receiveShadow = true; m.castShadow = 臺;
    浮島.add(m);
    if (臺) W.島網 = (W.島網 || []).concat(m);
  }

  function 造山() {
    const 綠 = new T.Color(0x5f9e45), 墨 = new T.Color(0x3f7a3a), 岩 = new T.Color(0x8f8a78), 雪 = new T.Color(0xf5f7fa), c = new T.Color();
    const 山材 = new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .95 });
    for (const m of 山們) {
      const g = new T.ConeGeometry(m.r, m.h, 5 + Math.floor(亂() * 3), 3);
      const p = g.attributes.position, 色們 = [];
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = (y + m.h / 2) / m.h;
        if (t > .05 && t < .95) {
          const n = Math.sin(x * 3.1 + z * 2.3 + m.x) * .5;
          p.setXYZ(i, x * (1 + n * .2), y + n * m.h * .06, z * (1 + n * .2));
        }
        if (t < .35) c.copy(綠).lerp(墨, t / .35);
        else if (t < .78) c.copy(墨).lerp(岩, (t - .35) / .43);
        else c.copy(m.h > 46 ? 雪 : 岩);
        色們.push(c.r, c.g, c.b);
      }
      g.setAttribute("color", new T.Float32BufferAttribute(色們, 3));
      g.computeVertexNormals();
      const mesh = new T.Mesh(g, 山材);
      mesh.position.set(m.x, 陸高 + m.h / 2 - .4, m.z);
      mesh.rotation.y = 亂() * 6.28;
      mesh.castShadow = true; mesh.receiveShadow = true;
      浮島.add(mesh);
      W.島網.push(mesh);
    }
  }

  function 造樹() {
    const n = 420;
    const 尖 = new T.InstancedMesh(new T.ConeGeometry(2.2, 6.5, 5), 材(0x3f7d3a), n);
    const 圓 = new T.InstancedMesh(new T.IcosahedronGeometry(2.6, 0), 材(0x5c9b46), n);
    const d = new T.Object3D();
    // 歷史地點附近不種樹，讓人物和建築看得清楚
    const 空地 = Object.values(W.地點表 || {}).map(p => 投(p[0], p[1]));
    let a = 0, b = 0, 試 = 0;
    while ((a < n || b < n) && 試 < 20000) {
      試++;
      const x = -130 + 亂() * 320, z = -290 + 亂() * 620;
      if (!在內(x, z, 臺灣)) continue;
      const h = 地高(x, z);
      if (h > 陸高 + 34) continue;
      const 山上 = h > 陸高 + 3;
      if (!山上 && (亂() < .55 || 空地.some(([px, pz]) => Math.hypot(px - x, pz - z) < 16))) continue;
      d.position.set(x, h + (山上 ? 2.6 : 1.6), z);
      const s = 山上 ? .7 + 亂() * .7 : .45 + 亂() * .4; d.scale.set(s, s, s); d.rotation.y = 亂() * 6;
      d.updateMatrix();
      if (山上 && a < n) 尖.setMatrixAt(a++, d.matrix);
      else if (!山上 && b < n) 圓.setMatrixAt(b++, d.matrix);
    }
    尖.count = a; 圓.count = b;
    [尖, 圓].forEach(m => { m.castShadow = true; m.receiveShadow = true; 浮島.add(m); });
  }

  // 平面帶狀：河、水圳、道路共用；回傳 mesh，drawRange 可做逐步畫出
  function 帶狀(點們, 寬, 色, 浮 = .35, 額外) {
    const pos = [], 點 = 點們;
    for (let i = 0; i < 點.length - 1; i++) {
      const [ax, az] = 點[i], [bx, bz] = 點[i + 1];
      const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz) || 1, nx = -dz / L * 寬 / 2, nz = dx / L * 寬 / 2;
      const ya = 地高(ax, az) + 浮, yb = 地高(bx, bz) + 浮;
      pos.push(ax + nx, ya, az + nz, ax - nx, ya, az - nz, bx + nx, yb, bz + nz,
        ax - nx, ya, az - nz, bx - nx, yb, bz - nz, bx + nx, yb, bz + nz);
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    const m = new T.Mesh(g, typeof 色 === "number" ? 材(色, Object.assign({ side: T.DoubleSide }, 額外 || {})) : 色);
    m.receiveShadow = true;
    return m;
  }
  function 加密(點們, 步 = 3) {
    const out = [];
    for (let i = 0; i < 點們.length - 1; i++) {
      const [ax, az] = 點們[i], [bx, bz] = 點們[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 步));
      for (let k = 0; k < n; k++) out.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]);
    }
    out.push(點們[點們.length - 1]);
    return out;
  }
  function 造河() {
    const 河們 = [
      [[120.95, 23.78], [120.78, 23.80], [120.62, 23.81], [120.45, 23.83], [120.25, 23.84]],
      [[121.0, 24.26], [120.88, 24.25], [120.75, 24.26], [120.58, 24.33]],
      [[121.6, 24.92], [121.55, 24.97], [121.51, 25.03], [121.49, 25.08], [121.45, 25.15], [121.42, 25.18]],
      [[120.68, 22.98], [120.56, 22.80], [120.48, 22.65], [120.43, 22.50]],
      [[120.62, 23.22], [120.45, 23.18], [120.22, 23.08]]
    ];
    河們.forEach(r => 浮島.add(帶狀(加密(r.map(p => 投(...p)), 3), 2.6, 0x4ea6e0, .3)));
  }
  function 造富士() {
    const [x, z] = 投(138.73, 35.36);
    const m = 網(new T.ConeGeometry(16, 20, 7), 0x8e9aa8);
    m.position.set(x, 鄰高 + 10, z); 浮島.add(m);
    const s = 網(new T.ConeGeometry(6.5, 8.2, 7), 0xffffff);
    s.position.set(x, 鄰高 + 16, z); 浮島.add(s);
  }

  /* ══════════ 7. 標籤（HTML 疊在 3D 上） ══════════ */
  const 標籤們 = [];
  const 暫v = new T.Vector3();
  function 加標籤(html, 類, 錨, 偏高 = 0, 可點 = null) {
    const el = document.createElement("div");
    el.className = "標 " + 類;
    el.innerHTML = html;
    if (可點) { el.classList.add("可點"); el.addEventListener("click", 可點); }
    標籤層.appendChild(el);
    const L = { el, 錨, 偏高, 活: true };
    標籤們.push(L);
    requestAnimationFrame(() => el.classList.add("現"));
    return L;
  }
  function 移除標籤(L) { if (!L || !L.活) return; L.活 = false; L.el.remove(); }
  // 標籤避讓：疊在畫面上的字卡（錄影模式的大標、說明卡、時間軸）也算障礙物
  const 遮擋選擇器 = "#錄影卡:not([hidden]), #錄影大標:not([hidden]), #錄影軸";
  const 避讓距 = 4;
  function 撞(a, b) { return a.x < b.x + b.w + 避讓距 && b.x < a.x + a.w + 避讓距 && a.y < b.y + b.h + 避讓距 && b.y < a.y + a.h + 避讓距; }
  function 更新標籤() {
    const w = 畫布.clientWidth, h = 畫布.clientHeight;
    const 可見 = [];
    for (let i = 標籤們.length - 1; i >= 0; i--) {
      const L = 標籤們[i];
      if (!L.活) { 標籤們.splice(i, 1); continue; }
      if (L.錨.isObject3D) {
        if (!L.錨.parent) { 移除標籤(L); 標籤們.splice(i, 1); continue; }
        L.錨.getWorldPosition(暫v);
      } else 暫v.copy(L.錨);
      暫v.y += L.偏高;
      暫v.project(鏡頭);
      if (暫v.z > 1 || 暫v.x < -1.2 || 暫v.x > 1.2 || 暫v.y < -1.2 || 暫v.y > 1.2) { L.el.style.display = "none"; L.已顯 = false; continue; }
      if (L.el.style.display === "none") L.el.style.display = "";
      L.sx = (暫v.x + 1) / 2 * w; L.sy = (1 - 暫v.y) / 2 * h; L.sz = 暫v.z;
      可見.push(L);
    }
    // 先量尺寸（集中讀取，避免反覆重排）
    for (const L of 可見) { L.寬 = L.el.offsetWidth; L.高 = L.el.offsetHeight; }
    const 層框 = 標籤層.getBoundingClientRect();
    const 障 = [];
    document.querySelectorAll(遮擋選擇器).forEach(el => {
      if (el.style.visibility === "hidden") return;
      const r = el.getBoundingClientRect();
      if (r.width && r.height) 障.push({ x: r.left - 層框.left, y: r.top - 層框.top, w: r.width, h: r.height });
    });
    // 依優先序擺放：周邊國家標籤最後擺（最常讓位），同類依建立先後（順序穩定，畫面不會跳）
    可見.reverse();
    const 序 = 可見.filter(L => !L.el.classList.contains("標-周邊")).concat(可見.filter(L => L.el.classList.contains("標-周邊")));
    const 已放 = 障.slice();
    for (const L of 序) {
      const 原 = { x: L.sx - L.寬 / 2, y: L.sy - L.高, w: L.寬, h: L.高 };
      // 錨點還在畫面內時，標籤不要被畫面左右邊緣切掉
      let 邊 = 0;
      if (L.sx >= 0 && L.sx <= w) 邊 = 原.x < 0 ? -原.x : 原.x + 原.w > w ? w - 原.x - 原.w : 0;
      原.x += 邊; L.sx += 邊;
      let 選 = [0, 0];
      const 空 = (dx, dy) => {
        const r = { x: 原.x + dx, y: 原.y + dy, w: 原.w, h: 原.h };
        if ((dx || dy) && (r.y < 0 || r.y + r.h > h || r.x < 0 || r.x + r.w > w)) return false;
        for (const o of 已放) if (撞(r, o)) return false;
        return true;
      };
      if (!空(0, 0)) {
        找: for (let 距 = 6; 距 <= 260; 距 += 6) {
          for (const [dx, dy] of [[0, -距], [0, 距], [-距, 0], [距, 0]]) if (空(dx, dy)) { 選 = [dx, dy]; break 找; }
        }
      }
      // 平滑移動，避免旋轉時標籤一格一格跳；剛出現的直接到位
      if (!L.已顯) { L.dx = 選[0]; L.dy = 選[1]; L.已顯 = true; }
      else { L.dx += (選[0] - L.dx) * .3; L.dy += (選[1] - L.dy) * .3; }
      已放.push({ x: 原.x + 選[0], y: 原.y + 選[1], w: 原.w, h: 原.h });
      L.el.style.transform = `translate(${L.sx + L.dx}px,${L.sy + L.dy}px) translate(-50%,-100%)`;
      L.el.style.zIndex = String(1000 - Math.round(L.sz * 900));
    }
  }

  /* ══════════ 8. 陣營、旗幟 ══════════ */
  const 陣營表 = {
    荷蘭: { 色: 0x1e5bd8, 副: 0xff8c00, 名: "荷蘭（聯合東印度公司）", 帽: "寬帽", 武: "槍", 旗: "荷蘭" },
    西班牙: { 色: 0xf2b705, 副: 0xb71c1c, 名: "西班牙", 帽: "鐵盔", 武: "槍", 旗: "西班牙" },
    葡萄牙: { 色: 0x2e9e4f, 副: 0xc62828, 名: "葡萄牙", 帽: "鐵盔", 武: "槍", 旗: "葡萄牙" },
    明: { 色: 0xc62828, 副: 0xffd54f, 名: "明朝", 帽: "尖盔", 武: "矛", 旗: "明" },
    鄭氏: { 色: 0xd32f2f, 副: 0x212121, 名: "鄭氏軍隊", 帽: "尖盔", 武: "矛", 旗: "鄭" },
    清: { 色: 0xf5d000, 副: 0x1a3a8a, 名: "清帝國", 帽: "清帽", 武: "矛", 旗: "清" },
    日本: { 色: 0xf2f2f2, 副: 0xd32f2f, 名: "日本軍隊", 帽: "軍帽", 武: "槍", 旗: "日本" },
    法國: { 色: 0x1a237e, 副: 0xe53935, 名: "法國軍隊", 帽: "軍帽", 武: "槍", 旗: "法國" },
    英國: { 色: 0x455a64, 副: 0xc62828, 名: "英國商人", 帽: "高帽", 武: null, 旗: "英國" },
    原住民: { 色: 0x6d3f1f, 副: 0xe53935, 名: "原住民", 帽: "頭飾", 武: "矛", 旗: null, 深膚: true },
    漢人: { 色: 0xe65100, 副: 0x4e342e, 名: "漢人移民", 帽: "斗笠", 武: "鋤", 旗: "漢" },
    民變: { 色: 0x7b1fa2, 副: 0xffffff, 名: "民變群眾", 帽: "頭巾", 武: "矛", 旗: "民" },
    海商: { 色: 0x8d6e63, 副: 0xffcc80, 名: "漢人海商", 帽: "頭巾", 武: null, 旗: "商" },
    琉球: { 色: 0x26a69a, 副: 0xffffff, 名: "琉球人", 帽: "頭巾", 武: null, 旗: null },
    頂郊: { 色: 0x00897b, 副: 0xffffff, 名: "頂郊（三邑人）", 帽: "頭巾", 武: "棍", 旗: "頂" },
    下郊: { 色: 0xd81b60, 副: 0xffffff, 名: "下郊（同安人）", 帽: "頭巾", 武: "棍", 旗: "下" },
    海盜: { 色: 0x263238, 副: 0xb0bec5, 名: "海盜", 帽: "頭巾", 武: "矛", 旗: "盜" },
    史前: { 色: 0x8d6e63, 副: 0x5d4037, 名: "史前人", 帽: "亂髮", 武: null, 旗: null, 深膚: true }
  };
  W.陣營表 = 陣營表;
  const 角色表 = {
    工人: { 色: 0x5d7b9d, 帽: "斗笠", 武: "鋤" }, 農夫: { 色: 0x7a8f4a, 帽: "斗笠", 武: "鋤" },
    移民: { 色: 0x8d6e63, 帽: "斗笠", 武: null }, 官員: { 色: 0x1a3a8a, 帽: "官帽", 武: null },
    傳教士: { 色: 0x263238, 帽: null, 武: "書" }, 洋商: { 色: 0x37474f, 帽: "高帽", 武: null },
    學生: { 色: 0x3f6fb5, 帽: "小帽", 武: "書" }, 考古學家: { 色: 0xa1887f, 帽: "探險帽", 武: "鋤" },
    史前人: { 色: 0x8d6e63, 帽: "亂髮", 武: null, 深膚: true }, 原住民: { 色: 0x6d3f1f, 帽: "頭飾", 武: "矛", 深膚: true },
    長老: { 色: 0x6d3f1f, 帽: "頭飾", 武: "杖", 深膚: true }, 婦女: { 色: 0xc2185b, 帽: "髻", 武: null },
    孩童: { 色: 0x43a047, 帽: "髻", 武: null, 小: true }, 漁夫: { 色: 0x5d7b9d, 帽: "斗笠", 武: "竿" },
    商人: { 色: 0x8d6e63, 帽: "小帽", 武: null }, 搬運工: { 色: 0x6d7b8d, 帽: "斗笠", 武: null },
    長官: { 色: 0x1e5bd8, 帽: "寬帽", 武: "杖" }, 醫生: { 色: 0x263238, 帽: null, 武: null }
  };
  const 旗快取 = {};
  function 旗材(key, 字) {
    const k = key + "|" + (字 || "");
    if (旗快取[k]) return 旗快取[k];
    const c = document.createElement("canvas"); c.width = 192; c.height = 128;
    const x = c.getContext("2d");
    const 填 = (col) => { x.fillStyle = col; x.fillRect(0, 0, 192, 128); };
    const 橫 = (cols) => cols.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * 128 / cols.length, 192, 128 / cols.length + 1); });
    const 直 = (cols) => cols.forEach((col, i) => { x.fillStyle = col; x.fillRect(i * 192 / cols.length, 0, 192 / cols.length + 1, 128); });
    const 寫 = (t, col, size) => {
      x.fillStyle = col; x.font = `900 ${size}px "Microsoft JhengHei","Noto Sans TC","PingFang TC",sans-serif`;
      x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(t, 96, 68);
    };
    const 陣 = 陣營表[key];
    switch (key) {
      case "荷蘭": 橫(["#c8102e", "#ffffff", "#1e4fa8"]); 寫("VOC", "#1d2b55", 44); break;
      case "西班牙": 填("#ffffff"); x.strokeStyle = "#c8102e"; x.lineWidth = 20; x.beginPath(); x.moveTo(10, 10); x.lineTo(182, 118); x.moveTo(182, 10); x.lineTo(10, 118); x.stroke(); break;
      case "葡萄牙": 填("#ffffff"); x.fillStyle = "#c8102e"; x.fillRect(80, 10, 32, 108); x.fillRect(20, 48, 152, 32); break;
      case "日本": 填("#ffffff"); x.fillStyle = "#d32f2f"; x.beginPath(); x.arc(96, 64, 36, 0, 7); x.fill(); break;
      case "法國": 直(["#1e3a8a", "#ffffff", "#e53935"]); break;
      case "英國": 填("#c62828"); x.fillStyle = "#1e3a8a"; x.fillRect(0, 0, 86, 58); x.strokeStyle = "#fff"; x.lineWidth = 12; x.beginPath(); x.moveTo(43, 0); x.lineTo(43, 58); x.moveTo(0, 29); x.lineTo(86, 29); x.stroke(); x.strokeStyle = "#c62828"; x.lineWidth = 6; x.stroke(); break;
      case "清": 填("#f5d000"); 寫(字 || "清", "#1a3a8a", 92); break;
      default: {
        const 底 = 陣 ? "#" + 陣.色.toString(16).padStart(6, "0") : "#795548";
        填(底);
        const t = 字 || (陣 && 陣.旗) || "";
        寫(t, key === "日本" ? "#d32f2f" : "#ffffff", t.length > 2 ? 40 : t.length > 1 ? 64 : 92);
      }
    }
    x.strokeStyle = "rgba(0,0,0,.35)"; x.lineWidth = 4; x.strokeRect(2, 2, 188, 124);
    return (旗快取[k] = new T.MeshBasicMaterial({ map: new T.CanvasTexture(c) }));
  }
  // 旗子正反兩面各一片，從哪一邊看文字都是正的
  function 造旗(key, 字, 寬 = 4.4) {
    const g = new T.Group();
    const 正 = new T.Mesh(幾("旗面" + 寬, () => { const p = new T.PlaneGeometry(寬, 寬 * .66); p.translate(寬 / 2, 0, 0); return p; }), 旗材(key, 字));
    const 反 = new T.Mesh(幾("旗背" + 寬, () => { const p = new T.PlaneGeometry(寬, 寬 * .66); p.rotateY(Math.PI); p.translate(寬 / 2, 0, 0); return p; }), 旗材(key, 字));
    g.add(正, 反);
    g.userData.旗面 = [正, 反];
    return g;
  }

  /* ══════════ 9. 人物、動物 ══════════ */
  const 膚 = 0xf2c99b, 深膚 = 0xb97a4a;
  const 人們 = [];
  function 造人(o = {}) {
    const 陣 = 陣營表[o.陣營] || null;
    const 角 = 角色表[o.角] || null;
    const 士兵 = !o.角 || o.角 === "士兵";
    const 色 = o.色 != null ? o.色 : 陣 && (士兵 || !角) ? 陣.色 : 角 ? 角.色 : 陣 ? 陣.色 : 0x8d6e63;
    const 帽 = 士兵 && 陣 ? 陣.帽 : 角 ? 角.帽 : 陣 ? 陣.帽 : null;
    const 武 = o.武 !== undefined ? o.武 : 士兵 && 陣 ? 陣.武 : 角 ? 角.武 : null;
    const g = new T.Group();
    const 身 = 網(幾("身", () => new T.CylinderGeometry(.95, 1.45, 4.2, 7)), 色);
    身.position.y = 2.1; g.add(身);
    if (陣 && !士兵) { const 帶 = 網(幾("帶", () => new T.CylinderGeometry(1.33, 1.38, .55, 7)), 陣.色); 帶.position.y = 1.7; g.add(帶); }
    else if (陣) { const 帶 = 網(幾("帶", () => new T.CylinderGeometry(1.33, 1.38, .55, 7)), 陣.副); 帶.position.y = 1.7; g.add(帶); }
    const 頭 = 網(幾("頭", () => new T.SphereGeometry(1.12, 8, 6)), (陣 && 陣.深膚) || (角 && 角.深膚) ? 深膚 : 膚);
    頭.position.y = 5.3; g.add(頭);
    加帽(g, 帽, 陣);
    if (o.角 === "傳教士" || o.角 === "醫生") { const 領 = 網(幾("領", () => new T.TorusGeometry(.75, .18, 4, 10)), 0xffffff); 領.rotation.x = Math.PI / 2; 領.position.y = 4.25; g.add(領); }
    const 手 = new T.Group(); 手.position.set(1.35, 3.9, 0); g.add(手);
    加武(手, 武);
    if (o.旗) { const 桿 = 網(幾("小旗桿", () => new T.CylinderGeometry(.13, .13, 9, 4)), 0x5d4037); 桿.position.set(-.3, 1.5, -.4); 手.add(桿); const f = 造旗(o.陣營 || "漢人", o.旗字, 3.6); f.position.set(-.3, 5.2, -.4); 手.add(f); }
    let 比 = 1;
    if (o.領袖) {
      const 披 = 網(幾("披", () => new T.BoxGeometry(.25, 3.6, 2.6)), 陣 ? 陣.副 : 0x8e24aa);
      披.position.set(-1.25, 3, 0); g.add(披);
      比 *= 1.4;
    }
    if (角 && 角.小) 比 *= .7;
    g.scale.setScalar(比);
    g.userData.人 = { 相: 亂() * 6.28, 動作: o.動作 || "站", 手, 底: 0 };
    人們.push(g);
    return g;
  }
  function 加帽(g, 帽, 陣) {
    const 加 = (geo, 色, y, 額 = {}) => { const m = 網(geo, 色); m.position.y = y; Object.assign(m.rotation, 額); g.add(m); return m; };
    switch (帽) {
      case "寬帽": 加(幾("寬沿", () => new T.CylinderGeometry(2.1, 2.1, .25, 10)), 0x212121, 6.1); 加(幾("帽冠", () => new T.CylinderGeometry(.95, 1.05, 1.2, 8)), 0x212121, 6.8); break;
      case "高帽": 加(幾("寬沿", () => new T.CylinderGeometry(2.1, 2.1, .25, 10)), 0x212121, 6.1); 加(幾("高冠", () => new T.CylinderGeometry(.95, .95, 2.2, 8)), 0x212121, 7.3); break;
      case "鐵盔": 加(幾("盔", () => new T.SphereGeometry(1.3, 8, 4, 0, 6.3, 0, 1.6)), 0x9e9e9e, 5.6); 加(幾("盔脊", () => new T.BoxGeometry(.2, .8, 2.2)), 陣 ? 陣.副 : 0x9e9e9e, 7); break;
      case "尖盔": 加(幾("尖盔", () => new T.ConeGeometry(1.35, 1.8, 6)), 陣 && 陣.旗 === "明" ? 0xffd54f : 0x37291f, 6.7); break;
      case "清帽": 加(幾("笠", () => new T.ConeGeometry(2.0, 1.0, 10)), 0x5d4037, 6.4); 加(幾("珠", () => new T.SphereGeometry(.38, 6, 4)), 0xd32f2f, 7.0); break;
      case "官帽": 加(幾("官帽", () => new T.ConeGeometry(1.6, .8, 10)), 0x3e2723, 6.3); 加(幾("珠", () => new T.SphereGeometry(.38, 6, 4)), 0xd32f2f, 6.85); break;
      case "軍帽": 加(幾("軍帽", () => new T.CylinderGeometry(1.0, 1.1, 1.1, 8)), 陣 && 陣.旗 === "法國" ? 0xe53935 : 0x263238, 6.4); break;
      case "斗笠": 加(幾("斗笠", () => new T.ConeGeometry(2.35, 1.15, 10)), 0xd8b76a, 6.4); break;
      case "頭飾":
        加(幾("頭帶", () => new T.TorusGeometry(1.12, .22, 4, 10)), 0xe53935, 5.7, { x: Math.PI / 2 });
        加(幾("羽", () => new T.BoxGeometry(.3, 2.0, .1)), 0xffffff, 7.0, { z: .25 });
        break;
      case "頭巾": 加(幾("頭巾", () => new T.CylinderGeometry(1.18, 1.18, .7, 8)), 陣 ? 陣.副 : 0xffffff, 6.1); break;
      case "亂髮": { const m = 加(幾("髮", () => new T.SphereGeometry(1.25, 7, 5)), 0x3e2723, 5.7); m.scale.set(1, .8, 1); break; }
      case "小帽": 加(幾("小帽", () => new T.CylinderGeometry(.85, .95, .55, 8)), 0x212121, 6.25); break;
      case "探險帽": 加(幾("寬沿", () => new T.CylinderGeometry(2.1, 2.1, .25, 10)), 0xc8b58a, 6.1); 加(幾("探冠", () => new T.SphereGeometry(1.05, 8, 4, 0, 6.3, 0, 1.6)), 0xc8b58a, 6.15); break;
      case "髻": 加(幾("髻", () => new T.SphereGeometry(.6, 6, 4)), 0x212121, 6.55); break;
    }
  }
  function 加武(手, 武) {
    const 加 = (geo, 色, x, y, z, rz = 0) => { const m = 網(geo, 色); m.position.set(x, y, z); m.rotation.z = rz; 手.add(m); return m; };
    switch (武) {
      case "矛": 加(幾("矛桿", () => new T.CylinderGeometry(.12, .12, 8.5, 4)), 0x6d4c41, .3, .2, 0); 加(幾("矛頭", () => new T.ConeGeometry(.38, 1.2, 4)), 0xcfd8dc, .3, 5, 0); break;
      case "槍": 加(幾("槍", () => new T.CylinderGeometry(.17, .17, 6, 5)), 0x3e2723, .2, .8, 0, .35); break;
      case "鋤": 加(幾("鋤柄", () => new T.CylinderGeometry(.12, .12, 4.8, 4)), 0x8d6e63, .3, -.6, 0); 加(幾("鋤頭", () => new T.BoxGeometry(1.4, .25, .8)), 0x78909c, .7, -2.9, 0); break;
      case "書": 加(幾("書", () => new T.BoxGeometry(1.3, 1.0, .35)), 0x8b1e1e, -.2, -.3, .9); break;
      case "棍": 加(幾("棍", () => new T.CylinderGeometry(.15, .15, 5.5, 4)), 0x6d4c41, .3, .3, 0, .3); break;
      case "杖": 加(幾("杖", () => new T.CylinderGeometry(.14, .14, 6, 4)), 0xa1887f, .4, -.8, 0); break;
      case "竿": 加(幾("竿", () => new T.CylinderGeometry(.08, .1, 9, 4)), 0x8d6e63, 2, 2, 0, -.9); break;
    }
  }
  function 造動物(種類) {
    const g = new T.Group(), 色 = 種類 === "鹿" ? 0xa8693a : 0x6d6d6d;
    const 身 = 網(幾("獸身", () => new T.BoxGeometry(4.2, 1.9, 1.7)), 色); 身.position.y = 2.6; g.add(身);
    const 頭 = 網(幾("獸頭", () => new T.BoxGeometry(1.5, 1.2, 1.1)), 色); 頭.position.set(2.5, 3.7, 0); g.add(頭);
    for (const [x, z] of [[1.5, .6], [1.5, -.6], [-1.5, .6], [-1.5, -.6]]) { const l = 網(幾("獸腳", () => new T.CylinderGeometry(.22, .22, 1.8, 4)), 色); l.position.set(x, .9, z); g.add(l); }
    if (種類 === "鹿") { for (const z of [.35, -.35]) { const a = 網(幾("角", () => new T.ConeGeometry(.12, 1.6, 4)), 0xe0d2b4); a.position.set(2.4, 4.9, z); a.rotation.z = -.3; g.add(a); } }
    else { for (const z of [.6, -.6]) { const a = 網(幾("牛角", () => new T.ConeGeometry(.15, .9, 4)), 0xeeeeee); a.position.set(2.7, 4.5, z); a.rotation.x = z > 0 ? .9 : -.9; g.add(a); } }
    g.userData.人 = { 相: 亂() * 6.28, 動作: "吃草", 手: null, 底: 0 };
    人們.push(g);
    return g;
  }

  /* ══════════ 10. 船 ══════════ */
  function 船身(長, 寬, 高, 尖) {
    const g = new T.BoxGeometry(長, 高, 寬, 3, 1, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      if (x > 長 * .2) { const f = 1 - (x - 長 * .2) / (長 * .3) * 尖; p.setZ(i, p.getZ(i) * Math.max(.12, f)); if (p.getY(i) > 0) p.setY(i, p.getY(i) + .5); }
    }
    g.computeVertexNormals();
    return g;
  }
  function 造船(型 = "帆船", 陣key, 旗字) {
    const g = new T.Group(), 陣 = 陣營表[陣key] || null;
    if (型 === "獨木舟") {
      const h = 網(幾("舟身", () => 船身(9, 2, 1.2, .9)), 0x6d4c41); h.position.y = .5; g.add(h);
      const 架 = 網(幾("舟架", () => new T.BoxGeometry(7, .35, .5)), 0x8d6e63); 架.position.set(0, .6, 3.2); g.add(架);
      for (const x of [-2, 2]) { const b = 網(幾("舟臂", () => new T.BoxGeometry(.3, .3, 3.4)), 0x8d6e63); b.position.set(x, 1, 1.6); g.add(b); }
      for (const x of [-1.8, 1.8]) { const r = 造人({ 角: "史前人" }); r.scale.setScalar(.7); r.position.set(x, .6, 0); r.userData.人.動作 = "划"; g.add(r); }
      g.userData.船 = { 型 };
      return g;
    }
    const 汽 = 型 === "汽船" || 型 === "軍艦";
    const 身色 = 型 === "軍艦" ? 0x5f6b73 : 汽 ? 0x263238 : 型 === "戎克船" ? 0x4e342e : 0x6d4c2f;
    const 身 = 網(幾("船身" + 型, () => 船身(16, 5.2, 3.4, .85)), 身色); 身.position.y = 1.2; g.add(身);
    if (陣) { const 帶 = 網(幾("船帶", () => new T.BoxGeometry(12.5, .6, 5.35)), 陣.色); 帶.position.set(-1.6, 2.35, 0); g.add(帶); }
    let 主桅頂 = [0, 16, 0];
    const 桅 = (x, h) => { const m = 網(幾("桅" + h, () => new T.CylinderGeometry(.22, .28, h, 5)), 0x5d4037); m.position.set(x, 2.9 + h / 2, 0); g.add(m); };
    if (型 === "帆船") {
      const 樓 = 網(幾("船樓", () => new T.BoxGeometry(4, 2.6, 4.9)), 0x7b5534); 樓.position.set(-6, 4.2, 0); g.add(樓);
      [[4, 14], [-.5, 17], [-4.5, 12]].forEach(([x, h]) => {
        桅(x, h);
        const 帆 = 網(幾("帆" + h, () => new T.BoxGeometry(.25, h * .48, 6.6)), 0xfaf7ee); 帆.position.set(x + .3, 2.9 + h * .52, 0); g.add(帆);
        if (陣) { const 紋 = 網(幾("帆紋" + h, () => new T.BoxGeometry(.3, 1.1, 6.7)), 陣.色); 紋.position.set(x + .35, 2.9 + h * .7, 0); g.add(紋); }
      });
      主桅頂 = [-.5, 2.9 + 17, 0];
    } else if (型 === "戎克船") {
      const 樓 = 網(幾("戎樓", () => new T.BoxGeometry(4.5, 3.6, 5.4)), 0x5d4037); 樓.position.set(-5.6, 4.4, 0); g.add(樓);
      [[3.5, 13], [-1.5, 15.5]].forEach(([x, h]) => {
        桅(x, h);
        const 帆 = 網(幾("戎帆" + h, () => new T.BoxGeometry(.25, h * .62, 6.2)), 0xb5651d); 帆.position.set(x + .3, 2.9 + h * .5, 0); g.add(帆);
        for (let k = 0; k < 4; k++) { const 骨 = 網(幾("帆骨", () => new T.BoxGeometry(.35, .18, 6.4)), 0x3e2723); 骨.position.set(x + .35, 2.9 + h * (.25 + k * .16), 0); g.add(骨); }
      });
      主桅頂 = [-1.5, 2.9 + 15.5, 0];
    } else {
      const 艙 = 網(幾("艙", () => new T.BoxGeometry(6, 3, 4)), 型 === "軍艦" ? 0x90a4ae : 0xf5f5f5); 艙.position.set(-2, 4.4, 0); g.add(艙);
      const 囪 = 網(幾("囪", () => new T.CylinderGeometry(1, 1.1, 6, 8)), 0x212121); 囪.position.set(.6, 8.2, 0); g.add(囪);
      if (陣) { const 環 = 網(幾("囪環", () => new T.CylinderGeometry(1.06, 1.06, 1.1, 8)), 陣.色); 環.position.set(.6, 9.8, 0); g.add(環); }
      桅(5, 11);
      if (型 === "軍艦") { const 砲 = 網(幾("砲塔", () => new T.CylinderGeometry(1.3, 1.4, 1.2, 8)), 0x546e7a); 砲.position.set(5.6, 3.8, 0); g.add(砲); const 管 = 網(幾("砲管", () => new T.CylinderGeometry(.3, .3, 4.5, 5)), 0x37474f); 管.rotation.z = Math.PI / 2; 管.position.set(7.6, 4, 0); g.add(管); }
      主桅頂 = [5, 2.9 + 11, 0];
      g.userData.煙口 = new T.Vector3(.6, 11.5, 0);
    }
    if (陣 && 陣.旗) {
      const f = 造旗(陣key, 旗字, 4.4);
      f.position.set(主桅頂[0] - .2, 主桅頂[1] - 1.6, 0);
      f.rotation.y = Math.PI;
      g.add(f); g.userData.旗 = f;
    }
    g.userData.船 = { 型 };
    return g;
  }

  /* ══════════ 11. 建築 ══════════ */
  function 屋頂(w, d, h, 色) { const m = 網(幾("屋頂", () => new T.ConeGeometry(.71, 1, 4).rotateY(Math.PI / 4)), 色); m.scale.set(w, h, d); return m; }
  function 盒(w, h, d, 色) { return 網(幾("盒", () => new T.BoxGeometry(1, 1, 1)), 色); }
  function 放(g, m, x, y, z, s) { m.position.set(x, y, z); if (s) m.scale.set(...s); g.add(m); return m; }
  function 造建築(物, o = {}) {
    const g = new T.Group();
    const 盒子 = (w, h, d, 色, x, y, z) => 放(g, 盒(w, h, d, 色), x, y + h / 2, z, [w, h, d]);
    const 頂 = (w, d, h, 色, x, y, z) => 放(g, 屋頂(w, d, h, 色), x, y + h / 2, z);
    const 中式 = (w, d, 牆, 瓦, x = 0, z = 0, 高 = 5) => {
      盒子(w + 1, 1, d + 1, 0x9e9e9e, x, 0, z); 盒子(w, 高, d, 牆, x, 1, z); 頂(w * 1.25, d * 1.3, 高 * .7, 瓦, x, 1 + 高, z);
      for (const s of [-1, 1]) { const e = 網(幾("燕尾", () => new T.ConeGeometry(.5, 2.2, 4)), 瓦); e.position.set(x + s * w * .58, 1 + 高 + 高 * .45, z); e.rotation.z = -s * .9; g.add(e); }
    };
    const 西式 = (w, d, 牆, 瓦, x = 0, z = 0, 高 = 7) => {
      盒子(w, 高, d, 牆, x, 0, z); 頂(w * 1.15, d * 1.15, 4, 瓦, x, 高, z);
      for (let i = -1; i <= 1; i++) 盒子(1.2, 1.8, .3, 0x37474f, x + i * w * .3, 高 * .45, z + d / 2 + .05);
    };
    switch (物) {
      case "城堡":
        盒子(22, 4, 22, 0xb5651d, 0, 0, 0);
        for (const [x, z] of [[11, 11], [-11, 11], [11, -11], [-11, -11]]) { const b = 盒子(6.5, 5, 6.5, 0xa0522d, x, 0, z); b.rotation.y = Math.PI / 4; }
        盒子(10, 8, 10, 0xc97b43, 0, 4, 0); 盒子(10.8, .8, 10.8, 0x6d4c41, 0, 12, 0);
        break;
      case "西式樓": 西式(12, 9, 0xf5f0e6, 0xb23a2a); break;
      case "紅磚樓": 西式(12, 9, 0xa1452e, 0x5d4037); break;
      case "洋行": 西式(14, 9, 0xfafafa, 0x8d6e63, 0, 0, 8); 盒子(14.5, .6, 2.5, 0xbdbdbd, 0, 4, 5.5); break;
      case "教堂":
        盒子(8, 7, 12, 0xf5f5f5, 0, 0, 0); 頂(9, 13, 4, 0x8d2f2f, 0, 7, 0);
        盒子(4, 14, 4, 0xeeeeee, 0, 0, -7.5); 頂(4.8, 4.8, 5, 0x8d2f2f, 0, 14, -7.5);
        盒子(.5, 3, .5, 0xffd54f, 0, 19, -7.5); 盒子(2.2, .5, .5, 0xffd54f, 0, 20.2, -7.5);
        break;
      case "廟": 中式(11, 8, 0xc0392b, 0x4e4e4e); break;
      case "孔廟": 中式(14, 10, 0xc0392b, 0xe0a12a, 0, 0, 6); 盒子(26, 2.5, 1, 0xb03a2e, 0, 0, 10); 盒子(26, 2.5, 1, 0xb03a2e, 0, 0, -10); break;
      case "衙門": 中式(13, 9, 0xe8e0d0, 0x5d5d5d); break;
      case "祠堂": 中式(10, 7, 0xd7ccc8, 0x5d4037, 0, 0, 4.5); break;
      case "茶行": 中式(12, 7, 0xfafafa, 0x5d4037, 0, 0, 5); break;
      case "學堂": 西式(12, 8, 0xa1452e, 0x5d4037, 0, 0, 6.5); break;
      case "醫館": 西式(11, 8, 0xffffff, 0x546e7a, 0, 0, 6); break;
      case "郵局": 西式(11, 8, 0xcfd8dc, 0x455a64, 0, 0, 6); break;
      case "炮臺":
        放(g, 網(幾("炮臺圈", () => new T.CylinderGeometry(9, 10, 3.5, 12)), 0x9e9e9e), 0, 1.75, 0);
        for (let i = 0; i < 4; i++) { const a = i / 4 * 6.28 + .4; const c = 網(幾("大砲", () => new T.CylinderGeometry(.6, .8, 6, 6)), 0x263238); c.rotation.z = Math.PI / 2; c.rotation.y = -a; c.position.set(Math.cos(a) * 9, 4, Math.sin(a) * 9); g.add(c); }
        break;
      case "村落": case "漢人村":
        for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + 亂(), r = 4 + 亂() * 9, x = Math.cos(a) * r, z = Math.sin(a) * r; 盒子(4.5, 3, 3.6, 0xe8d5b0, x, 0, z); 頂(5.5, 4.4, 2.2, 0xb23a2a, x, 3, z); }
        break;
      case "番社":
        for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28 + 亂(), r = 4 + 亂() * 8, x = Math.cos(a) * r, z = Math.sin(a) * r; 放(g, 網(幾("茅屋", () => new T.CylinderGeometry(2.2, 2.4, 2.6, 8)), 0x8d6e63), x, 1.3, z); 放(g, 網(幾("茅頂", () => new T.ConeGeometry(3.3, 3.2, 8)), 0xc9a65a), x, 4.2, z); }
        break;
      case "洞穴": {
        const r = 網(幾("岩丘", () => new T.IcosahedronGeometry(9, 1)), 0x8a8a8a); r.scale.set(1.3, .95, 1.1); r.position.y = 5; g.add(r);
        const 口 = new T.Mesh(幾("洞口", () => new T.CircleGeometry(3.6, 10)), new T.MeshBasicMaterial({ color: 0x1b1410 }));
        口.position.set(0, 3.6, 10.4); g.add(口);
        break;
      }
      case "窯": 放(g, 網(幾("窯", () => new T.CylinderGeometry(3, 4, 5.5, 8)), 0x795548), 0, 2.75, 0); 放(g, 網(幾("窯口", () => new T.CylinderGeometry(2.5, 2.5, .5, 8)), 0xff7a1a, { emissive: 0xff5a00, emissiveIntensity: .9 }), 0, 5.7, 0); break;
      case "碑": 盒子(3, .8, 1.6, 0x9e9e9e, 0, 0, 0); 盒子(2.2, 5.5, .7, 0xbdbdbd, 0, .8, 0); break;
      case "關卡":
        盒子(.9, 7, .9, 0x6d4c41, 0, 0, 5.5); 盒子(.9, 7, .9, 0x6d4c41, 0, 0, -5.5); 盒子(.9, .9, 12.5, 0x8d2f2f, 0, 7, 0);
        盒子(4, 3.5, 4, 0xe8e0d0, -5, 0, -9); 頂(5, 5, 2, 0x5d5d5d, -5, 3.5, -9);
        break;
      case "涼亭":
        盒子(12, .6, 12, 0x9e9e9e, 0, 0, 0);
        for (const [x, z] of [[5, 5], [-5, 5], [5, -5], [-5, -5]]) 盒子(.6, 5, .6, 0x6d4c41, x, .6, z);
        頂(14, 14, 3.5, 0xb23a2a, 0, 5.6, 0);
        break;
      case "隘門": 盒子(1.5, 7, 1.5, 0xa1452e, 0, 0, 4); 盒子(1.5, 7, 1.5, 0xa1452e, 0, 0, -4); 盒子(1.8, 1.6, 10, 0x8d2f2f, 0, 7, 0); 頂(3, 11, 1.6, 0x4e4e4e, 0, 8.6, 0); break;
      case "貝塚":
        for (let i = 0; i < 36; i++) { const a = 亂() * 6.28, r = 亂() * 6, h = (6 - r) * .6; const s = 網(幾("貝", () => new T.IcosahedronGeometry(.9, 0)), 亂() < .5 ? 0xf5ecd7 : 0xe0d2b4); s.position.set(Math.cos(a) * r, h + .5, Math.sin(a) * r); g.add(s); }
        break;
      case "石板棺":
        for (let i = 0; i < 6; i++) { const x = (i % 3 - 1) * 5, z = Math.floor(i / 3) * 4 - 2; 盒子(4, .9, 2, 0x9e9e9e, x, 0, z); if (i % 2) 盒子(4.2, .4, 2.2, 0x757575, x + .6, 1.1, z + .4); }
        break;
      case "考古坑":
        [0x6d4c41, 0x8d6e63, 0xa1887f, 0x5d4037].forEach((c, i) => 盒子(16, 1.2, 11, c, 0, -1.2 * (i + 1) + .3, 0));
        盒子(7, .3, 5, 0x1b1410, 0, .05, 0);
        for (const z of [-5.6, 5.6]) 盒子(16, .25, .25, 0xffffff, 0, .4, z);
        for (const x of [-8, 8]) 盒子(.25, .25, 11, 0xffffff, x, .4, 0);
        break;
      case "車站": 盒子(14, 1, 5, 0x9e9e9e, 0, 0, 0); 盒子(10, 4, 4, 0xa1452e, 0, 1, -1); 頂(12, 6, 2, 0x455a64, 0, 5, -1); break;
      case "糖廍": case "腦寮": 盒子(7, 4, 6, 0x795548, 0, 0, 0); 頂(8.5, 7, 3, 0xc9a65a, 0, 4, 0); break;
      case "官署": 中式(13, 9, 0xe8e0d0, 0x5d5d5d); break;
      default: 盒子(6, 5, 6, 0xbdbdbd, 0, 0, 0);
    }
    if (o.陣營 && 陣營表[o.陣營] && 陣營表[o.陣營].旗) {
      const h = { 城堡: 13, 衙門: 10, 官署: 10, 炮臺: 4, 關卡: 8 }[物] || 9;
      const 桿 = 網(幾("旗桿", () => new T.CylinderGeometry(.22, .22, 12, 5)), 0x5d4037); 桿.position.set(0, h + 6, 0); g.add(桿);
      const f = 造旗(o.陣營, o.旗字, 5.2); f.position.set(0, h + 10.4, 0); g.add(f);
      g.userData.旗 = f;
    }
    return g;
  }

  /* ══════════ 12. 舞台、演員、排程 ══════════ */
  let 演員 = [], 排程 = [], 名物 = {}, 陣營物 = {}, 演出長 = 0, 目前場 = null, 結束回呼 = null;
  const 加演員 = (f) => 演員.push(f);
  function 出現(obj, 延 = 0, 目標 = null) {
    const s = 目標 || obj.scale.clone();
    obj.scale.setScalar(.001);
    let t = -延;
    加演員((dt) => { t += dt; if (t < 0) return true; const k = Math.min(1, t / .55); obj.scale.copy(s).multiplyScalar(Math.max(.001, 彈(k))); return k < 1; });
  }
  function 消失(obj, 秒 = .6, 後 = null) {
    const s = obj.scale.clone(); let t = 0;
    加演員((dt) => { t += dt; const k = Math.min(1, t / 秒); obj.scale.copy(s).multiplyScalar(Math.max(.001, 1 - 緩(k))); if (k >= 1) { obj.parent && obj.parent.remove(obj); 後 && 後(); return false; } return true; });
  }
  function 放到(obj, xz, 浮 = 0) { obj.position.set(xz[0], 地高(xz[0], xz[1]) + 浮, xz[1]); 舞台.add(obj); return obj; }
  function 登記(名, 陣營, 物) {
    if (名) (名物[名] = 名物[名] || []).push(物);
    if (陣營) (陣營物[陣營] = 陣營物[陣營] || []).push(物);
  }
  function 字幕(文) {
    if (!字幕el) return;
    字幕el.classList.remove("現");
    void 字幕el.offsetWidth;
    字幕el.textContent = 文;
    字幕el.classList.add("現");
    W.當前字幕 = 文;
    W.on字幕 && W.on字幕(文);
  }

  // 位置解析：地點名、[經,緯]、方向字
  const 方向表 = { 西: [-1, 0], 東: [1, 0], 北: [0, -1], 南: [0, 1], 西北: [-.7, -.7], 東北: [.7, -.7], 西南: [-.7, .7], 東南: [.7, .7] };
  // 已經換算好的平面座標要用 已投() 包起來，避免被誤認成經緯度
  const 已投 = (xz) => ({ 已: xz });
  function 解(p, 參考) {
    if (p && p.已) return p.已;
    if (Array.isArray(p)) return typeof p[0] === "number" && Math.abs(p[0]) > 60 ? 投(p[0], p[1]) : p;
    if (typeof p === "string") {
      if (W.地點表[p]) return 投(W.地點表[p][0], W.地點表[p][1]);
      if (外地點[p]) return 投(...外地點[p]);
      if (周邊區[p]) return 投(...周邊區[p].點);
      if (方向表[p]) return 邊點(參考 || [0, 0], 方向表[p]);
    }
    console.warn("找不到位置", p);
    return [0, 0];
  }
  function 邊點(起, d) {
    const R = 盤R * .9, bx = 起[0], bz = 起[1], a = d[0] * d[0] + d[1] * d[1], b = 2 * (bx * d[0] + bz * d[1]), c = bx * bx + bz * bz - R * R;
    const t = (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a);
    return [bx + d[0] * t, bz + d[1] * t];
  }
  // 從陸上港口出發：沿著前往方向找到第一個海上的點
  function 出海點(p, 往) {
    if (!陸塊於(p[0], p[1])) return p;
    const dx = 往[0] - p[0], dz = 往[1] - p[1], L = Math.hypot(dx, dz) || 1;
    for (let s = 2; s < 400; s += 2) { const q = [p[0] + dx / L * s, p[1] + dz / L * s]; if (!陸塊於(q[0], q[1])) return [q[0] + dx / L * 4, q[1] + dz / L * 4]; }
    return p;
  }
  function 靠岸(從, 到) {
    const dx = 到[0] - 從[0], dz = 到[1] - 從[1], L = Math.hypot(dx, dz), n = Math.ceil(L / 1.5);
    for (let i = 1; i <= n; i++) {
      const p = [從[0] + dx * i / n, 從[1] + dz * i / n];
      if (陸塊於(p[0], p[1])) { const b = Math.max(0, i - 4); return { 海: [從[0] + dx * b / n, 從[1] + dz * b / n], 岸: p }; }
    }
    return { 海: 到, 岸: null };
  }

  /* ── 動作：人物走動、船航行 ── */
  function 走(人, 從, 到, 速 = 11, 完 = null, 延 = 0) {
    const L = Math.hypot(到[0] - 從[0], 到[1] - 從[1]); let t = -延;
    人.userData.人.動作 = "走";
    人.rotation.y = -Math.atan2(到[1] - 從[1], 到[0] - 從[0]);
    加演員((dt) => {
      t += dt; if (t < 0) return true;
      const k = Math.min(1, L ? t * 速 / L : 1);
      const x = 從[0] + (到[0] - 從[0]) * k, z = 從[1] + (到[1] - 從[1]) * k;
      人.position.x = x; 人.position.z = z; 人.userData.人.底 = 地高(x, z);
      if (k >= 1) { 人.userData.人.動作 = 人.userData.人.到後 || "站"; 完 && 完(); return false; }
      return true;
    });
  }
  function 航行(船, 路, 秒, 完 = null, 延 = 0) {
    const 段 = []; let 總 = 0;
    for (let i = 0; i < 路.length - 1; i++) { const L = Math.hypot(路[i + 1][0] - 路[i][0], 路[i + 1][1] - 路[i][1]); 段.push(L); 總 += L; }
    let t = -延;
    船.userData.航行中 = true;
    船.visible = 延 <= 0;
    加演員((dt) => {
      t += dt; if (t < 0) return true;
      船.visible = true;
      const k = Math.min(1, t / 秒), d = 緩(k) * 總;
      let 累 = 0, i = 0;
      while (i < 段.length - 1 && 累 + 段[i] < d) { 累 += 段[i]; i++; }
      const f = 段[i] ? (d - 累) / 段[i] : 1, a = 路[i], b = 路[i + 1];
      船.position.x = a[0] + (b[0] - a[0]) * f; 船.position.z = a[1] + (b[1] - a[1]) * f;
      const 目向 = -Math.atan2(b[1] - a[1], b[0] - a[0]);
      let 差 = 目向 - 船.rotation.y; while (差 > Math.PI) 差 -= 6.283; while (差 < -Math.PI) 差 += 6.283;
      船.rotation.y += 差 * Math.min(1, dt * 4);
      if (k >= 1) { 船.userData.航行中 = false; 完 && 完(); return false; }
      return true;
    });
  }

  /* ── 各種演出動作 ── */
  const 動作表 = {
    鏡頭(a) { 鏡頭至(a, a.秒 || 2.2); },
    標記(a) {
      a.點.forEach((p, i) => {
        const xz = 解(p);
        const 釘 = new T.Group();
        const 桿 = 網(幾("釘桿", () => new T.CylinderGeometry(.35, .35, 9, 5)), 0x455a64); 桿.position.y = 4.5; 釘.add(桿);
        const 頭 = 網(幾("釘頭", () => new T.SphereGeometry(1.8, 10, 8)), a.色 || W.期色 || 0xd84315); 頭.position.y = 9.5; 釘.add(頭);
        放到(釘, xz); 出現(釘, i * .25);
        const 文 = (a.文 && a.文[i]) || (typeof p === "string" ? p : "");
        if (文) 加標籤(文, "標-地", 釘, 13);
      });
    },
    光圈(a) {
      const xz = 解(a.在), 色 = a.色 || W.期色 || 0xff7043;
      let 上次 = -9;
      加演員(() => {
        if (時鐘.場 - 上次 > 1.6) {
          上次 = 時鐘.場;
          const r = new T.Mesh(幾("光環", () => new T.RingGeometry(3, 4.4, 40).rotateX(-Math.PI / 2)), new T.MeshBasicMaterial({ color: 色, transparent: true, opacity: .8, depthWrite: false }));
          放到(r, xz, .6); let t = 0;
          加演員((d) => { t += d; r.scale.setScalar(1 + t * 5); r.material.opacity = .8 * (1 - t / 1.6); if (t > 1.6) { 舞台.remove(r); r.material.dispose(); return false; } return true; });
        }
        return true;
      });
    },
    建築(a) {
      const xz = 解(a.在);
      const b = 造建築(a.物, a);
      if (a.偏) { xz[0] += a.偏[0]; xz[1] += a.偏[1]; }
      放到(b, xz); b.rotation.y = a.轉 || 0;
      if (a.大) b.scale.setScalar(a.大);
      if (!a.即) 出現(b);
      登記(a.名, a.陣營, b);
      if (a.名 && !a.無標) 加標籤(a.名, "標-建", b, (a.大 || 1) * 18);
    },
    人群(a) { 造群(a, false); },
    軍隊(a) { 造群(a, true); },
    動物(a) {
      const 中 = 解(a.在);
      for (let i = 0; i < (a.數 || 5); i++) {
        const m = 造動物(a.物 || "鹿");
        放到(m, [中[0] + (亂() - .5) * 22, 中[1] + (亂() - .5) * 22]); m.rotation.y = 亂() * 6; 出現(m, i * .1);
        登記(a.名, null, m);
      }
      if (a.名) { const 錨 = new T.Object3D(); 放到(錨, 中); 加標籤(a.名, "標-地", 錨, 12); 登記(a.名, null, 錨); }
    },
    船隊: 船隊,
    交戰(a) {
      const 甲 = a.甲 ? 解(a.甲) : null, 乙 = a.乙 ? 解(a.乙) : null;
      const 中 = a.在 ? 解(a.在) : [(甲[0] + 乙[0]) / 2, (甲[1] + 乙[1]) / 2];
      const 錨 = new T.Object3D(); 放到(錨, 中, 2);
      const L = 加標籤("⚔️", "標-戰", 錨, 14);
      const 長 = a.長 || 6; let t = 0, 下 = 0;
      for (const 人 of 人們) { if (人.parent && Math.hypot(人.position.x - 中[0], 人.position.z - 中[1]) < (a.範圍 || 45) && 人.userData.人.動作 !== "走") 人.userData.人.動作 = "戰"; }
      加演員((dt) => {
        t += dt; 下 -= dt;
        if (下 <= 0 && t < 長) { 下 = .22; 煙([中[0] + (亂() - .5) * 26, 中[1] + (亂() - .5) * 26], 亂() < .3); }
        if (t >= 長) {
          移除標籤(L);
          for (const 人 of 人們) if (人.userData.人.動作 === "戰") 人.userData.人.動作 = "站";
          return false;
        }
        return true;
      });
    },
    撤離(a) {
      // 只帶走船和人（建築、地區色塊留著）
      for (const 物 of (陣營物[a.陣營] || [])) {
        if (!物.parent) continue;
        if (物.userData.船) {
          const 起 = [物.position.x, 物.position.z], 終 = 解(a.到 || "西南", 起);
          航行(物, [起, 出海點(終, 起)], a.秒 || 6, () => 消失(物, .5));
        } else if (物.userData.人 || 物.userData.登陸旗) 消失(物, .8);
      }
    },
    消失(a) {
      const 們 = [].concat(a.名 ? (名物[a.名] || []) : [], a.陣營 ? (陣營物[a.陣營] || []) : []);
      們.forEach(o => o.parent && 消失(o, a.秒 || .8));
    },
    換旗(a) {
      for (const 物 of (名物[a.名] || [])) {
        const f = 物.userData.旗; if (!f) continue;
        f.userData.旗面.forEach(m => m.material = 旗材(a.陣營, a.旗字));
        const s = f.scale.clone(); 出現(f, 0, s);
      }
    },
    改名(a) { (名物[a.名] || []).forEach(o => { const L = 標籤們.find(x => x.錨 === o); if (L) { L.el.innerHTML = a.新; L.el.classList.add("閃"); } }); },
    移動(a) {
      const 到 = 解(a.到);
      (名物[a.名] || []).forEach((o, i) => {
        if (o.userData.人) 走(o, [o.position.x, o.position.z], [到[0] + (亂() - .5) * 16, 到[1] + (亂() - .5) * 16], a.速 || 12, null, i * .05);
      });
    },
    線: 畫線,
    火車(a) {
      const 點們 = 加密(a.路.map(p => 解(p)), 1.5);
      const 車 = new T.Group();
      const 頭 = new T.Group();
      放(頭, 網(幾("鍋爐", () => new T.CylinderGeometry(1.4, 1.4, 6, 10).rotateZ(Math.PI / 2)), 0x212121), 0, 2.4, 0);
      放(頭, 盒(1, 1, 1, 0xb71c1c), -3.4, 2.8, 0, [3, 3.6, 3]);
      放(頭, 網(幾("煙囪", () => new T.CylinderGeometry(.5, .7, 2.2, 6)), 0x212121), 2.2, 4.4, 0);
      車.add(頭);
      for (let i = 1; i <= 2; i++) { const c = 盒(1, 1, 1, i === 1 ? 0x2e7d32 : 0x8d6e63); c.scale.set(6, 3, 2.8); c.position.set(-6 * i - 2.5, 2.2, 0); 車.add(c); }
      舞台.add(車); 車.visible = false;
      let t = -(a.延 || 0), 下 = 0;
      const 秒 = a.秒 || 7;
      加演員((dt) => {
        t += dt; if (t < 0) return true;
        車.visible = true;
        const k = Math.min(1, t / 秒), f = 緩(k) * (點們.length - 1), i = Math.min(點們.length - 2, Math.floor(f)), r = f - i;
        const p = 點們[i], q = 點們[i + 1], x = p[0] + (q[0] - p[0]) * r, z = p[1] + (q[1] - p[1]) * r;
        車.position.set(x, 地高(x, z) + .3, z); 車.rotation.y = -Math.atan2(q[1] - p[1], q[0] - p[0]);
        下 -= dt; if (下 <= 0) { 下 = .18; 煙([x, z], false, 8, .7); }
        return k < 1;
      });
      加標籤(a.名 || "🚂 火車", "標-建", 車, 9);
    },
    區域(a) {
      const xz = 解(a.在), 陣 = 陣營表[a.陣營];
      const 色 = a.色 || (陣 ? 陣.色 : 0xff7043);
      const m = new T.Mesh(new T.CircleGeometry(a.半徑 || 60, 48).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 色, transparent: true, opacity: a.透 || .32, depthWrite: false }));
      m.position.set(xz[0], (a.高 != null ? a.高 : 陸高) + .6, xz[1]); 舞台.add(m); 出現(m);
      登記(a.名, a.陣營, m);
      if (a.名) 加標籤(a.名, "標-區塊", m, 6).el.style.setProperty("--c", "#" + 色.toString(16).padStart(6, "0"));
    },
    田(a) {
      const 中 = 解(a.在), 大 = a.大 || 1, g = new T.Group(); 放到(g, 中);
      const n = Math.round(4 * 大);
      for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
        if (i * i + j * j > n * n + 1) continue;
        const x = i * 4.2 + (亂() - .5), z = j * 4.2 + (亂() - .5);
        let m;
        if (a.物 === "茶") { m = 網(幾("茶叢", () => new T.SphereGeometry(1.5, 6, 4)), 0x2e6b30); m.position.set(x, 1, z); m.scale.y = .7; }
        else if (a.物 === "甘蔗") { m = 網(幾("蔗", () => new T.CylinderGeometry(.35, .35, 5, 4)), 0x8bc34a); m.position.set(x, 2.5, z); }
        else if (a.物 === "樟樹") { if ((i + j) % 2) continue; m = 網(幾("樟", () => new T.IcosahedronGeometry(3, 0)), 0x33691e); m.position.set(x * 1.4, 4, z * 1.4); }
        else if (a.物 === "小米") { m = 網(幾("小米", () => new T.ConeGeometry(.8, 2.4, 5)), 0xe0b43a); m.position.set(x, 1.2, z); }
        else { m = 網(幾("稻格", () => new T.BoxGeometry(3.8, .35, 3.8)), (i + j) % 2 ? 0x9ccc65 : 0x7cb342); m.position.set(x, .2, z); }
        g.add(m);
        出現(m, (Math.abs(i) + Math.abs(j)) * .06, m.scale.clone());
      }
      登記(a.名, null, g);
      if (a.名) 加標籤(a.名, "標-地", g, 8);
    },
    遺物(a) {
      const 中 = 解(a.在);
      const 型 = { 陶罐: () => new T.LatheGeometry([[0, 0], [1.6, .2], [2.2, 1.5], [1.8, 3], [1.1, 3.6], [1.3, 4]].map(p => new T.Vector2(...p)), 10), 玉器: () => new T.TorusGeometry(1.6, .5, 6, 14), 石器: () => new T.TetrahedronGeometry(2, 0), 鐵器: () => new T.BoxGeometry(3.2, .7, 1.2), 玻璃環: () => new T.TorusGeometry(1.5, .35, 6, 14), 銅錢: () => new T.CylinderGeometry(1.4, 1.4, .3, 12) };
      const 色 = { 陶罐: 0xa65e3a, 玉器: 0x4caf7a, 石器: 0x8d8d8d, 鐵器: 0x37474f, 玻璃環: 0x4dd0e1, 銅錢: 0xc9a227 }[a.物] || 0xbdbdbd;
      const m = 網(幾("遺物" + a.物, 型[a.物] || 型.石器), 色, { emissive: 色, emissiveIntensity: .25 });
      const g = new T.Group(); g.add(m); 放到(g, [中[0] + (a.偏 ? a.偏[0] : 0), 中[1] + (a.偏 ? a.偏[1] : 0)], 2.5); 出現(g, a.延 || 0);
      m.position.y = 2;
      加演員((dt) => { g.rotation.y += dt * 1.2; m.position.y = 2 + Math.sin(時鐘.總 * 2) * .5; return !!g.parent; });
      加標籤("✨ " + (a.名 || a.物), "標-物", g, 8);
    },
    效果(a) {
      const xz = 解(a.在), 長 = a.長 || 99;
      if (a.樣 === "火") {
        const g = new T.Group(); 放到(g, xz);
        const f = 網(幾("火焰", () => new T.ConeGeometry(1.4, 3.6, 6)), 0xff8f00, { emissive: 0xff6d00, emissiveIntensity: 1 }, false); f.position.y = 1.8; g.add(f);
        加演員(() => { f.scale.set(1 + Math.sin(時鐘.總 * 17) * .15, 1 + Math.sin(時鐘.總 * 11) * .25, 1); return !!g.parent; });
      }
      let t = 0, 下 = 0;
      if (a.樣 === "煙" || a.樣 === "火" || a.樣 === "砲煙") 加演員((dt) => { t += dt; 下 -= dt; if (下 <= 0) { 下 = a.樣 === "砲煙" ? .3 : .5; 煙([xz[0] + (亂() - .5) * 3, xz[1] + (亂() - .5) * 3], a.樣 === "砲煙", a.樣 === "火" ? 4 : 7); } return t < 長; });
      if (a.樣 === "雨") 造雨(xz, 長);
    },
    牌(a) {
      const xz = 解(a.在); const 錨 = new T.Object3D(); 放到(錨, xz);
      const L = 加標籤(a.文, "標-牌" + (a.樣 ? " 牌-" + a.樣 : ""), 錨, a.高 || 26);
      登記(a.名 || a.文, null, 錨);
      if (a.長) 排程.push({ t: 時鐘.場 + a.長, fn: () => { 移除標籤(L); 舞台.remove(錨); } });
    },
    話(a) {
      const 對象 = a.名 ? (名物[a.名] || [])[0] : null;
      let 錨 = 對象;
      if (!錨) { 錨 = new T.Object3D(); 放到(錨, 解(a.在)); }
      const L = 加標籤(a.文, "標-話", 錨, a.高 || 16);
      排程.push({ t: 時鐘.場 + (a.長 || 4), fn: () => 移除標籤(L) });
    },
    貨物(a) {
      const 起 = 解(a.從), 終 = 解(a.到);
      if (a.方式 === "人") {
        const p = 造人({ 角: "搬運工", 陣營: a.陣營 });
        const 箱 = 盒(1, 1, 1, 0xa1887f); 箱.scale.set(2.2, 2.2, 2.2); 箱.position.set(0, 7.6, 0); p.add(箱);
        放到(p, 起); 走(p, 起, 終, a.速 || 9, () => 消失(p, .5), a.延 || 0);
        加標籤("📦 " + a.物, "標-物", p, 11);
      } else {
        const 出 = 出海點(起, 終), 入 = 靠岸(出, 終).海;
        const 船 = 造船(a.船 || "戎克船", a.陣營, a.旗字);
        for (let i = 0; i < 3; i++) { const 箱 = 盒(1, 1, 1, [0xa1887f, 0xd7ccc8, 0x8d6e63][i]); 箱.scale.set(2, 2, 2); 箱.position.set(-2 + i * 2.2, 3.8, 0); 船.add(箱); }
        放到(船, 出); 船.position.y = 0;
        航行(船, a.經 ? [出, ...a.經.map(p => 解(p)), 入] : [出, 入], a.秒 || 6, () => { if (!a.停) 消失(船, .6); }, a.延 || 0);
        加標籤("📦 " + a.物, "標-物", 船, 20);
      }
    },
    字幕(a) { 字幕(a.文); }
  };

  function 造群(a, 有陣營) {
    const 中 = 解(a.在), n = a.數 || 6, 陣 = 陣營表[a.陣營];
    const 朝 = a.朝 ? 解(a.朝) : null;
    const 群 = [];
    const 錨 = new T.Object3D(); 錨.userData.群錨 = true; 放到(錨, 中);
    const 角度 = 朝 ? Math.atan2(朝[1] - 中[1], 朝[0] - 中[0]) : Math.PI / 2;
    for (let i = 0; i < n; i++) {
      let x, z;
      if (a.隊形 === "圍城") { const r = a.半徑 || 18, t = i / n * 6.283; x = 中[0] + Math.cos(t) * r; z = 中[1] + Math.sin(t) * r; }
      else if (a.隊形 === "散" || !有陣營) { x = 中[0] + (亂() - .5) * (a.散 || 18); z = 中[1] + (亂() - .5) * (a.散 || 18); }
      else {
        const 排 = Math.floor(i / 4), 列 = i % 4 - 1.5;
        const 前 = -排 * 3.6, 側 = 列 * 3.4;
        x = 中[0] + Math.cos(角度) * 前 - Math.sin(角度) * 側; z = 中[1] + Math.sin(角度) * 前 + Math.cos(角度) * 側;
      }
      const 領 = i === 0 && a.領袖;
      const p = 造人({ 陣營: a.陣營, 角: 領 ? (a.領角 || a.角) : a.角, 領袖: 領, 動作: a.動作, 武: a.武, 旗: (i === 1 && 有陣營 && 陣 && 陣.旗) || (領 && a.領旗), 旗字: a.旗字 });
      p.userData.人.到後 = a.動作 || "站";
      if (a.隊形 === "圍城") p.userData.人.終向 = -Math.atan2(中[1] - z, 中[0] - x);
      else if (朝) p.userData.人.終向 = -角度;
      const 目 = [x, z];
      if (a.從) { const 起 = 解(a.從); const 偏 = [(亂() - .5) * 10, (亂() - .5) * 10]; 放到(p, [起[0] + 偏[0], 起[1] + 偏[1]]); 走(p, [起[0] + 偏[0], 起[1] + 偏[1]], 目, a.速 || 12, () => { if (p.userData.人.終向 != null) p.rotation.y = p.userData.人.終向; }, i * .07); }
      else { 放到(p, 目); 出現(p, i * .05); }
      if (!a.從) p.rotation.y = p.userData.人.終向 != null ? p.userData.人.終向 : -Math.PI / 2 + (亂() - .5) * 1.5;
      p.userData.人.底 = 地高(p.position.x, p.position.z);
      群.push(p);
      登記(a.名 || a.領袖 || a.陣營, a.陣營, p);
      if (領 && a.名) 登記(a.領袖, null, p);   // 對話泡泡可以直接用人物名字找到他
      if (領) 加標籤("★ " + a.領袖, "標-人", p, 11).el.style.setProperty("--c", 陣 ? "#" + 陣.色.toString(16).padStart(6, "0") : "#6d4c41");
    }
    登記(a.名 || a.領袖 || a.陣營, a.陣營, 錨);
    // 陣營腳下色盤與名牌，跟著群體中心移動
    if (有陣營 && 陣) {
      const 盤 = new T.Mesh(幾("陣盤", () => new T.CircleGeometry(1, 28).rotateX(-Math.PI / 2)), new T.MeshBasicMaterial({ color: 陣.色, transparent: true, opacity: .35, depthWrite: false }));
      舞台.add(盤);
      加演員(() => {
        const 活 = 群.filter(p => p.parent);
        if (!活.length) { 舞台.remove(盤); return false; }
        let x = 0, z = 0; 活.forEach(p => { x += p.position.x; z += p.position.z; }); x /= 活.length; z /= 活.length;
        let r = 6; 活.forEach(p => r = Math.max(r, Math.hypot(p.position.x - x, p.position.z - z) + 4));
        錨.position.set(x, 地高(x, z), z); 盤.position.set(x, 地高(x, z) + .4, z); 盤.scale.setScalar(Math.min(r, 40));
        return true;
      });
      const 牌 = 加標籤(`<b>${a.名 || 陣.名}</b>`, "標-陣", 錨, 18);
      牌.el.style.setProperty("--c", "#" + 陣.色.toString(16).padStart(6, "0"));
      if (陣.色 === 0xf2f2f2 || 陣.色 === 0xf5d000 || 陣.色 === 0xf2b705) 牌.el.classList.add("淺底");
    } else if (a.名 && !a.領袖) 加標籤(a.名, "標-地", 錨, 14);
    return 群;
  }

  function 船隊(a) {
    const 到 = 解(a.到);
    const 起原 = 解(a.從, 到);
    const 經 = (a.經 || []).map(p => 解(p));
    const 起 = 出海點(起原, 經[0] || 到);
    const n = a.數 || 3, 秒 = a.秒 || 7, 艦 = [];
    const 末前 = 經.length ? 經[經.length - 1] : 起;
    const 向 = Math.atan2(到[1] - 末前[1], 到[0] - 末前[0]), 側x = -Math.sin(向), 側z = Math.cos(向);
    for (let i = 0; i < n; i++) {
      const 側 = (i - (n - 1) / 2) * 13, 後 = Math.abs(i - (n - 1) / 2) * 9;
      const 偏 = (p) => [p[0] + 側x * 側 - Math.cos(向) * 後, p[1] + 側z * 側 - Math.sin(向) * 後];
      const 己起 = 偏(起), 己經 = 經.map(偏), 己到 = 偏(到);
      const 岸 = a.停在 ? { 海: 偏(解(a.停在)), 岸: null } : 靠岸(己經.length ? 己經[己經.length - 1] : 己起, 己到);
      const 船 = 造船(a.船 || "帆船", a.陣營, a.旗字);
      船.userData.岸 = 岸.岸 || 岸.海;
      船.position.set(己起[0], 0, 己起[1]); 舞台.add(船);
      船.rotation.y = -Math.atan2((己經[0] || 岸.海)[1] - 己起[1], (己經[0] || 岸.海)[0] - 己起[0]);
      艦.push(船);
      登記(a.名, a.陣營, 船);
      航行(船, [己起, ...己經, 岸.海], 秒, () => { if (i === 0 && a.登陸) 登陸(a, 艦); }, i * .35);
    }
    const 陣 = 陣營表[a.陣營];
    if (陣) {
      const L = 加標籤(`<b>⛵ ${a.名 || 陣.名}</b>`, "標-陣", 艦[0], 24);
      L.el.style.setProperty("--c", "#" + 陣.色.toString(16).padStart(6, "0"));
      if (陣.色 === 0xf2f2f2 || 陣.色 === 0xf5d000 || 陣.色 === 0xf2b705) L.el.classList.add("淺底");
    }
    if (a.領袖 && !a.登陸) 加標籤("★ " + a.領袖, "標-人", 艦[0], 34).el.style.setProperty("--c", 陣 ? "#" + 陣.色.toString(16).padStart(6, "0") : "#555");
  }
  function 登陸(a, 艦) {
    const 登 = a.登陸 === true ? {} : a.登陸;
    const 集 = 解(登.集 || a.到);
    // 每艘船的人從「那艘船預定靠岸的地方」上岸，不要用船在半路上的位置
    const 岸們 = 艦.map(s => s.userData.岸).filter(Boolean);
    if (!岸們.length) 岸們.push([艦[0].position.x, 艦[0].position.z]);
    const 群 = 造群({ 陣營: a.陣營, 在: 已投(集), 數: 登.數 || 8, 領袖: 登.領袖 || a.領袖, 名: 登.名, 朝: 登.朝, 角: 登.角, 隊形: 登.隊形, 半徑: 登.半徑 }, true);
    群.forEach((p, i) => {
      const 目 = [p.position.x, p.position.z], 起 = 岸們[i % 岸們.length];
      p.position.set(起[0], 地高(起[0], 起[1]), 起[1]);
      走(p, 起, 目, 13, () => { if (p.userData.人.終向 != null) p.rotation.y = p.userData.人.終向; }, i * .12);
    });
    if (登.插旗 !== false && 陣營表[a.陣營] && 陣營表[a.陣營].旗) {
      const 桿 = new T.Group();
      放(桿, 網(幾("登陸旗桿", () => new T.CylinderGeometry(.25, .25, 14, 5)), 0x5d4037), 0, 7, 0);
      const f = 造旗(a.陣營, a.旗字, 6); f.position.set(0, 12, 0); 桿.add(f);
      桿.userData.登陸旗 = true;
      放到(桿, [集[0] + 7, 集[1] + 7]); 出現(桿, 1.6);
      登記(a.名, a.陣營, 桿);
    }
  }

  function 畫線(a) {
    const 原 = a.點.map(p => 解(p));
    const 點們 = 加密(原, a.樣 === "鐵路" ? 1.2 : 2.5);
    const 秒 = a.長 || 4, 延 = a.延 || 0;
    const 色 = { 水圳: 0x1e88e5, 道路: 0xc8a96a, 番界: 0xd32f2f, 航線: 0xffffff, 遷徙: 0xff8f00, 貿易: 0xffca28, 開墾: 0xff7043 }[a.樣] || a.色 || 0xffffff;
    const g = new T.Group(); 舞台.add(g);
    登記(a.名, null, g);
    if (a.樣 === "水圳" || a.樣 === "道路" || a.樣 === "遷徙" || a.樣 === "開墾") {
      const m = 帶狀(點們, a.樣 === "水圳" ? 2.4 : a.樣 === "道路" ? 2 : 3, 色, a.樣 === "水圳" ? .45 : .5, a.樣 === "水圳" ? { emissive: 0x0d47a1, emissiveIntensity: .35 } : null);
      g.add(m);
      const 總 = m.geometry.attributes.position.count;
      m.geometry.setDrawRange(0, 0);
      let t = -延;
      加演員((dt) => { t += dt; if (t < 0) return true; const k = Math.min(1, t / 秒); m.geometry.setDrawRange(0, Math.floor(總 * k / 6) * 6); return k < 1; });
      if (a.樣 === "水圳") {
        let 下 = 0; 加演員((dt) => {
          if (!g.parent) return false; if (t < 秒) return true; 下 -= dt;
          if (下 <= 0) { 下 = .35; const d = 網(幾("水滴", () => new T.SphereGeometry(.9, 6, 4)), 0x90caf9, { emissive: 0x42a5f5, emissiveIntensity: .6 }, false); g.add(d); let u = 0; 加演員((dd) => { u += dd * .25; const f = u * (點們.length - 1), i = Math.min(點們.length - 2, Math.floor(f)), r = f - i; const x = 點們[i][0] + (點們[i + 1][0] - 點們[i][0]) * r, z = 點們[i][1] + (點們[i + 1][1] - 點們[i][1]) * r; d.position.set(x, 地高(x, z) + 1, z); if (u >= 1) { g.remove(d); return false; } return true; }); }
          return true;
        });
      }
      if (a.樣 === "遷徙" || a.樣 === "開墾") { const 末 = 點們[點們.length - 1], 前 = 點們[Math.max(0, 點們.length - 4)]; const 箭 = 網(幾("箭頭", () => new T.ConeGeometry(3.2, 7, 4).rotateZ(-Math.PI / 2)), 色); 箭.position.set(末[0], 地高(末[0], 末[1]) + 2, 末[1]); 箭.rotation.y = -Math.atan2(末[1] - 前[1], 末[0] - 前[0]); g.add(箭); 出現(箭, 延 + 秒); }
    } else if (a.樣 === "鐵路") {
      const n = 點們.length - 1; let 已 = 0, t = -延;
      const 工 = a.工人 === false ? null : 造群({ 角: "工人", 在: 已投(點們[0]), 數: 4, 散: 6, 動作: "挖" }, false);
      加演員((dt) => {
        t += dt; if (t < 0) return true;
        const 應 = Math.floor(Math.min(1, t / 秒) * n);
        while (已 < 應) {
          const p = 點們[已], q = 點們[已 + 1], y = Math.max(地高(p[0], p[1]), 地高(q[0], q[1])) + .2, 角 = -Math.atan2(q[1] - p[1], q[0] - p[0]);
          const 枕 = 網(幾("枕木", () => new T.BoxGeometry(.6, .35, 4)), 0x6d4c41); 枕.position.set(p[0], y, p[1]); 枕.rotation.y = 角; g.add(枕);
          for (const s of [-1.2, 1.2]) { const 軌 = 網(幾("軌", () => new T.BoxGeometry(1, .3, .3)), 0x424242); 軌.scale.x = Math.hypot(q[0] - p[0], q[1] - p[1]) + .1; 軌.position.set((p[0] + q[0]) / 2 - Math.sin(-角) * s, y + .3, (p[1] + q[1]) / 2 + Math.cos(-角) * s); 軌.rotation.y = 角; g.add(軌); }
          已++;
          if (工) 工.forEach((w, i) => { w.position.x = p[0] + (i - 1.5) * 2.5; w.position.z = p[1] + 3 + (i % 2) * 2; w.userData.人.底 = 地高(w.position.x, w.position.z); });
        }
        return 已 < n;
      });
    } else if (a.樣 === "番界") {
      let 已 = 0, t = -延; const n = 點們.length;
      加演員((dt) => {
        t += dt; if (t < 0) return true;
        const 應 = Math.floor(Math.min(1, t / 秒) * n);
        while (已 < 應) {
          const p = 點們[已];
          if (已 % 2 === 0) { const 牛 = 網(幾("土牛", () => new T.BoxGeometry(2.6, 1.6, 1.6)), 0x8d6e63); 牛.position.set(p[0], 地高(p[0], p[1]) + .8, p[1]); g.add(牛); }
          else { const 標 = 網(幾("界標", () => new T.BoxGeometry(.8, 3, .8)), 0xd32f2f); 標.position.set(p[0], 地高(p[0], p[1]) + 1.5, p[1]); g.add(標); }
          已++;
        }
        return 已 < n;
      });
    } else if (a.樣 === "電報") {
      const 桿們 = 點們.filter((_, i) => i % 5 === 0); let 已 = 0, t = -延;
      加演員((dt) => {
        t += dt; if (t < 0) return true;
        const 應 = Math.floor(Math.min(1, t / 秒) * 桿們.length);
        while (已 < 應) {
          const p = 桿們[已], y = 地高(p[0], p[1]);
          if (y > 0) { const 桿 = 網(幾("電桿", () => new T.CylinderGeometry(.2, .25, 7, 4)), 0x6d4c41); 桿.position.set(p[0], y + 3.5, p[1]); g.add(桿); }
          if (已 > 0) { const q = 桿們[已 - 1], yq = 地高(q[0], q[1]); const 線g = new T.BufferGeometry().setFromPoints([new T.Vector3(q[0], (yq || 0) + 7, q[1]), new T.Vector3(p[0], (y || 0) + 7, p[1])]); g.add(new T.Line(線g, new T.LineBasicMaterial({ color: 0x212121 }))); }
          已++;
        }
        return 已 < 桿們.length;
      });
    } else {
      // 航線、貿易：海面上的虛線＋跑動的箭頭
      const 段 = []; for (let i = 0; i < 點們.length - 1; i += 2) 段.push([點們[i], 點們[i + 1]]);
      let 已 = 0, t = -延;
      加演員((dt) => {
        t += dt; if (t < 0) return true;
        const 應 = Math.floor(Math.min(1, t / 秒) * 段.length);
        while (已 < 應) {
          const [p, q] = 段[已]; const d = 網(幾("虛線", () => new T.BoxGeometry(1, .3, 1)), 色, { emissive: 色, emissiveIntensity: .3 }, false);
          d.scale.set(Math.hypot(q[0] - p[0], q[1] - p[1]), 1, 1); d.position.set((p[0] + q[0]) / 2, Math.max(地高(p[0], p[1]), 0) + .8, (p[1] + q[1]) / 2); d.rotation.y = -Math.atan2(q[1] - p[1], q[0] - p[0]); g.add(d);
          已++;
        }
        return 已 < 段.length;
      });
    }
    if (a.名) {
      const 中 = 點們[Math.floor(點們.length / 2)], 錨 = new T.Object3D();
      錨.position.set(中[0], Math.max(地高(中[0], 中[1]), 0) + 2, 中[1]); g.add(錨);
      排程.push({ t: 時鐘.場 + 延 + 秒 * .5, fn: () => 加標籤(a.名, a.樣 === "番界" ? "標-警" : "標-地", 錨, 8) });
    }
  }

  /* ── 特效 ── */
  function 煙(xz, 閃 = false, 大 = 6, 透 = .85) {
    const y = Math.max(地高(xz[0], xz[1]), 0);
    const m = new T.Mesh(幾("煙球", () => new T.IcosahedronGeometry(1, 0)), new T.MeshStandardMaterial({ color: 閃 ? 0xffb74d : 0xcfd2d6, transparent: true, opacity: 透, flatShading: true, emissive: 閃 ? 0xff6d00 : 0, emissiveIntensity: 閃 ? .8 : 0, depthWrite: false }));
    m.position.set(xz[0], y + 2, xz[1]); 舞台.add(m);
    let t = 0;
    加演員((dt) => {
      t += dt;
      const k = t / 1.6;
      m.scale.setScalar(1 + k * 大); m.position.y += dt * 6;
      if (閃 && t > .15) { m.material.color.setHex(0xb0b4b8); m.material.emissiveIntensity = 0; }
      m.material.opacity = 透 * (1 - k);
      if (k >= 1) { 舞台.remove(m); m.material.dispose(); return false; }
      return true;
    });
  }
  function 造雨(xz, 長) {
    const 雲 = new T.Group();
    for (let i = 0; i < 6; i++) { const s = 網(幾("雲球", () => new T.IcosahedronGeometry(1, 1)), 0x6b7280, null, false); s.scale.setScalar(14 + 亂() * 10); s.position.set((亂() - .5) * 60, 0, (亂() - .5) * 40); 雲.add(s); }
    雲.position.set(xz[0], 70, xz[1]); 舞台.add(雲);
    const n = 300, pos = new Float32Array(n * 6);
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(pos, 3));
    const 線 = new T.LineSegments(g, new T.LineBasicMaterial({ color: 0x90a4ae, transparent: true, opacity: .7 }));
    舞台.add(線);
    const 雨點 = Array.from({ length: n }, () => [xz[0] + (亂() - .5) * 90, 亂() * 70, xz[1] + (亂() - .5) * 70]);
    let t = 0;
    加演員((dt) => {
      t += dt;
      雨點.forEach((p, i) => { p[1] -= dt * 90; if (p[1] < 0) p[1] = 70; pos.set([p[0], p[1], p[2], p[0] - 1, p[1] - 5, p[2]], i * 6); });
      g.attributes.position.needsUpdate = true;
      if (t > 長) { 舞台.remove(線); 舞台.remove(雲); return false; }
      return true;
    });
  }

  /* ══════════ 13. 周邊地區標籤（含當時朝代） ══════════ */
  let 周邊標籤們 = [];
  function 設周邊(年, 相關 = [], 自訂 = {}) {
    周邊標籤們.forEach(移除標籤); 周邊標籤們 = [];
    for (const 區 in 周邊區) {
      const 重點 = 相關.includes(區);
      const 朝 = 自訂[區] != null ? 自訂[區] : 朝代(區, 年);
      const [x, z] = 投(...周邊區[區].點);
      const html = `<span class="區名">${周邊區[區].名}</span>${朝 ? `<span class="區朝">${朝}</span>` : ""}`;
      周邊標籤們.push(加標籤(html, "標-周邊" + (重點 ? " 重點" : ""), new T.Vector3(x, 鄰高 + 4, z), 0));
    }
  }
  W.設周邊 = 設周邊;
  W.周邊區 = 周邊區;

  /* ══════════ 14. 鏡頭控制（拖曳旋轉、滾輪縮放、右鍵平移） ══════════ */
  const 控 = { 目標: new T.Vector3(0, 陸高, 0), 距: 2600, 方位: 0, 仰: .9, 補: null, 互動: 0 };
  function 套鏡頭() {
    const s = Math.sin(控.仰);
    鏡頭.position.set(控.目標.x + 控.距 * s * Math.sin(控.方位), 控.目標.y + 控.距 * Math.cos(控.仰), 控.目標.z + 控.距 * s * Math.cos(控.方位));
    鏡頭.lookAt(控.目標);
  }
  function 鏡頭至(o, 秒 = 2) {
    const xz = o.看 ? 解(o.看) : [控.目標.x, 控.目標.z];
    const 終 = { x: xz[0], y: Math.max(地高(xz[0], xz[1]), 0), z: xz[1], 距: o.距 || 控.距, 方位: o.方位 != null ? o.方位 * Math.PI / 180 : 控.方位, 仰: o.仰 != null ? o.仰 * Math.PI / 180 : 控.仰 };
    let 差 = 終.方位 - 控.方位; while (差 > Math.PI) 差 -= 6.283; while (差 < -Math.PI) 差 += 6.283; 終.方位 = 控.方位 + 差;
    控.補 = { 起: { x: 控.目標.x, y: 控.目標.y, z: 控.目標.z, 距: 控.距, 方位: 控.方位, 仰: 控.仰 }, 終, t: 0, 秒 };
    W.最後焦點 = o;
  }
  W.鏡頭至 = 鏡頭至;
  function 更新補間(dt) {
    const b = 控.補; if (!b) return;
    b.t += dt; const k = 緩(Math.min(1, b.t / b.秒));
    控.目標.set(b.起.x + (b.終.x - b.起.x) * k, b.起.y + (b.終.y - b.起.y) * k, b.起.z + (b.終.z - b.起.z) * k);
    控.距 = Math.exp(Math.log(b.起.距) + (Math.log(b.終.距) - Math.log(b.起.距)) * k);
    控.方位 = b.起.方位 + (b.終.方位 - b.起.方位) * k; 控.仰 = b.起.仰 + (b.終.仰 - b.起.仰) * k;
    if (k >= 1) 控.補 = null;
  }
  function 裝控制() {
    const 指 = new Map();
    let 前距 = 0, 前中 = null;
    畫布.addEventListener("contextmenu", e => e.preventDefault());
    畫布.addEventListener("pointerdown", e => {
      畫布.setPointerCapture(e.pointerId);
      指.set(e.pointerId, { x: e.clientX, y: e.clientY, 平: e.button === 2 || e.button === 1 || e.shiftKey });
      控.補 = null; 控.互動 = performance.now();
      if (指.size === 2) { const [a, b] = [...指.values()]; 前距 = Math.hypot(a.x - b.x, a.y - b.y); 前中 = [(a.x + b.x) / 2, (a.y + b.y) / 2]; }
    });
    畫布.addEventListener("pointermove", e => {
      const p = 指.get(e.pointerId); if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY; 控.互動 = performance.now();
      if (指.size === 1) {
        if (p.平) 平移(dx, dy);
        else { 控.方位 -= dx * .006; 控.仰 = 夾(控.仰 - dy * .005, .12, 1.9); }
      } else if (指.size === 2) {
        const [a, b] = [...指.values()], d = Math.hypot(a.x - b.x, a.y - b.y), 中 = [(a.x + b.x) / 2, (a.y + b.y) / 2];
        if (前距) 控.距 = 夾(控.距 * 前距 / d, 40, 5200);
        if (前中) 平移(中[0] - 前中[0], 中[1] - 前中[1]);
        前距 = d; 前中 = 中;
      }
    });
    const 放開 = e => { 指.delete(e.pointerId); 前距 = 0; 前中 = null; };
    畫布.addEventListener("pointerup", 放開); 畫布.addEventListener("pointercancel", 放開);
    畫布.addEventListener("wheel", e => { e.preventDefault(); 控.補 = null; 控.互動 = performance.now(); 控.距 = 夾(控.距 * Math.exp(e.deltaY * .0012), 40, 5200); }, { passive: false });
    畫布.addEventListener("dblclick", e => {
      const r = 畫布.getBoundingClientRect(), m = new T.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      const ray = new T.Raycaster(); ray.setFromCamera(m, 鏡頭);
      const hit = ray.intersectObjects([...(W.島網 || []), W.海], false)[0];
      if (hit) { const p = 浮島.worldToLocal(hit.point.clone()); 鏡頭至({ 看: 已投([p.x, p.z]), 距: Math.max(60, 控.距 * .55) }, 1.2); }
    });
  }
  function 平移(dx, dy) {
    const k = 控.距 * .0013;
    const 右x = Math.cos(控.方位), 右z = -Math.sin(控.方位), 前x = -Math.sin(控.方位), 前z = -Math.cos(控.方位);
    控.目標.x += -dx * k * 右x + dy * k * 前x;
    控.目標.z += -dx * k * 右z + dy * k * 前z;
    const r = Math.hypot(控.目標.x, 控.目標.z); if (r > 盤R) { 控.目標.x *= 盤R / r; 控.目標.z *= 盤R / r; }
  }

  /* ══════════ 15. 對外 API ══════════ */
  function 清場() {
    舞台.clear();
    演員 = []; 排程 = []; 名物 = {}; 陣營物 = {};
    for (let i = 人們.length - 1; i >= 0; i--) 人們.splice(i, 1);
    標籤們.filter(L => !周邊標籤們.includes(L)).forEach(移除標籤);
    時鐘.場 = 0;
  }
  W.清場 = 清場;

  W.啟動 = function (o) {
    畫布 = o.畫布; 標籤層 = o.標籤層; 字幕el = o.字幕;
    W.地點表 = o.地點表 || {};
    渲染器 = new T.WebGLRenderer({ canvas: 畫布, antialias: true, alpha: true, preserveDrawingBuffer: !!o.錄影 });
    渲染器.setPixelRatio(Math.min(window.devicePixelRatio || 1, o.錄影 ? 1 : 1.75));
    渲染器.shadowMap.enabled = true;
    渲染器.shadowMap.type = T.PCFSoftShadowMap;
    造世界();
    裝控制();
    const 調 = () => { const w = 畫布.clientWidth, h = 畫布.clientHeight; 渲染器.setSize(w, h, false); 鏡頭.aspect = w / h; 鏡頭.updateProjectionMatrix(); };
    window.addEventListener("resize", 調); 調();
    套鏡頭();
    W.錄影 = !!o.錄影;
    if (W.錄影) return;   // 錄影時由錄製程式一格一格呼叫 W.步進()，不自己跑動畫迴圈
    let 上 = performance.now();
    function 迴圈(now) {
      requestAnimationFrame(迴圈);
      const dt = Math.min(.05, (now - 上) / 1000); 上 = now;
      W.步進(dt);
    }
    requestAnimationFrame(迴圈);
  };

  // 每一格的更新（錄影時也直接呼叫它）
  W.步進 = function (dt) {
    時鐘.總 += dt; 時鐘.場 += dt;
    for (let i = 排程.length - 1; i >= 0; i--) if (時鐘.場 >= 排程[i].t) { const f = 排程[i].fn; 排程.splice(i, 1); f(); }
    for (let i = 演員.length - 1; i >= 0; i--) if (!演員[i](dt)) 演員.splice(i, 1);
    for (const p of 人們) {
      const u = p.userData.人; if (!p.parent) continue;
      const t = 時鐘.總 * 1 + u.相;
      let y = u.底;
      if (u.動作 === "走") y += Math.abs(Math.sin(t * 9)) * .7;
      else if (u.動作 === "挖" && u.手) { u.手.rotation.z = Math.sin(t * 5) * .7; y += Math.abs(Math.sin(t * 5)) * .2; }
      else if (u.動作 === "戰") { const k = Math.sin(t * 6) * .9; p.translateX(k * dt * 6); if (u.手) u.手.rotation.z = Math.sin(t * 6) * .6; }
      else if (u.動作 === "揮" && u.手) u.手.rotation.x = Math.sin(t * 6) * .8;
      else if (u.動作 === "划" && u.手) u.手.rotation.z = Math.sin(t * 4) * .6;
      else if (u.動作 === "吃草") { p.rotation.z = Math.sin(t * .8) * .06; }
      else y += Math.sin(t * 2) * .12;
      if (p.parent === 舞台) p.position.y = y;
    }
    for (const o of 舞台.children) {
      if (o.userData.船) {
        o.position.y = Math.sin(時鐘.總 * 1.6 + o.position.x) * .35;
        o.rotation.x = Math.sin(時鐘.總 * 1.3 + o.position.z) * .04;
        if (o.userData.煙口 && Math.random() < .08) { const v = o.userData.煙口.clone().applyMatrix4(o.matrixWorld); const l = 浮島.worldToLocal(v); 煙([l.x, l.z], false, 4, .6); }
      }
      if (o.userData.旗) o.userData.旗.rotation.y = Math.sin(時鐘.總 * 2.2 + o.position.x) * .25 + (o.userData.船 ? Math.PI : 0);
    }
    浮島.position.y = Math.sin(時鐘.總 * .45) * 3;
    浮島.rotation.z = Math.sin(時鐘.總 * .3) * .004;
    雲群.children.forEach(c => { const a = Math.atan2(c.position.z, c.position.x) + c.userData.速 * dt, r = Math.hypot(c.position.x, c.position.z); c.position.x = Math.cos(a) * r; c.position.z = Math.sin(a) * r; });
    瀑布材.forEach(m => { m.map.offset.y += dt * .5; });
    if (W.自轉 && (W.錄影 || performance.now() - 控.互動 > 6000) && !控.補) 控.方位 += dt * .05;
    更新補間(dt);
    套鏡頭();
    渲染器.render(場景, 鏡頭);
    更新標籤();
    if (目前場 && 結束回呼 && 時鐘.場 >= 演出長) { const f = 結束回呼; 結束回呼 = null; f(); }
  };

  W.總覽 = function (時期, 回呼, 場景表) {
    清場(); 目前場 = null; W.自轉 = true;
    W.期色 = parseInt(時期.色.slice(1), 16);
    const 已用 = [];
    時期.事件.forEach((e, i) => {
      const sc = 場景表[e.id] || {};
      const 看 = sc.鏡頭 && sc.鏡頭.看 ? sc.鏡頭.看 : 預設點(e);
      if (!看) return;
      const xz = 解(看);
      const 近 = 已用.filter(p => Math.hypot(p[0] - xz[0], p[1] - xz[1]) < 30).length; 已用.push(xz);
      const 釘 = new T.Group();
      放(釘, 網(幾("釘桿", () => new T.CylinderGeometry(.35, .35, 9, 5)), 0x455a64), 0, 4.5, 0);
      放(釘, 網(幾("釘頭", () => new T.SphereGeometry(1.8, 10, 8)), W.期色), 0, 9.5, 0);
      放到(釘, xz); 出現(釘, i * .06);
      加標籤(`<b>${e.年}</b> ${e.標題}`, "標-年", 釘, 13 + 近 * 7, () => 回呼(e.id));
    });
    const 年 = (場景表[(時期.事件[0] || {}).id] || {}).西元;
    設周邊(年, (場景表[時期.id] || {}).周邊 || [], (場景表[時期.id] || {}).周邊文 || {});
    鏡頭至(Object.assign({ 看: [0, 40], 距: 1700, 方位: 0, 仰: 52 }, (場景表[時期.id] || {}).鏡頭 || {}), 2.4);
  };
  function 預設點(e) {
    for (const g of e.圖解 || []) if (g.型 === "地圖" && g.點.length) return g.點[0];
    return null;
  }

  W.演出 = function (事件, 場景表, 完) {
    清場(); W.自轉 = false;
    const sc = 場景表[事件.id] || {};
    目前場 = 事件.id; 結束回呼 = 完 || null;
    設周邊(sc.西元, sc.周邊 || [], sc.周邊文 || {});
    const 預看 = 預設點(事件);
    鏡頭至(Object.assign({ 看: 預看 || [0, 0], 距: 260, 方位: 0, 仰: 55 }, sc.鏡頭 || {}), 2.2);
    const 演 = sc.演 || (預看 ? [{ 型: "標記", 點: (事件.圖解.find(g => g.型 === "地圖") || { 點: [] }).點 }, { 型: "光圈", 在: 預看 }] : []);
    let 最晚 = 4;
    for (const a of 演) {
      const t = a.時 || 0;
      最晚 = Math.max(最晚, t + (a.長 || a.秒 || 3));
      排程.push({ t, fn: () => { if (a.字幕) 字幕(a.字幕); const f = 動作表[a.型]; if (f) f(a); else if (a.型) console.warn("未知動作", a.型); } });
    }
    演出長 = sc.長 || 最晚 + 3;
    return 演出長;
  };
  W.重播 = function (事件, 場景表, 完) { return W.演出(事件, 場景表, 完); };
  W.回焦點 = function () { if (W.最後焦點) 鏡頭至(W.最後焦點, 1.6); };
  W.全景 = function () { 鏡頭至({ 看: [0, 40], 距: 2600, 方位: 0, 仰: 50 }, 2); };
  W.臺灣全景 = function () { 鏡頭至({ 看: [0, 10], 距: 900, 方位: 0, 仰: 48 }, 2); };
  W.投 = 投;
  W.場時 = () => 時鐘.場;
  W._除錯 = () => ({ 舞台, 人們, 陸塊於, 解 });
})();
