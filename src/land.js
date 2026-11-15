import { geoArea } from "d3-geo";

// World outlines from the ECharts 4 world map (Apache-2.0). Loaded as a <script>
// with a stub `echarts.registerMap`, then decoded here (no ECharts needed).
function decodeRing(s, o, sc) {
  const r = [];
  let px = o[0], py = o[1];
  for (let i = 0; i < s.length; i += 2) {
    let x = s.charCodeAt(i) - 64, y = s.charCodeAt(i + 1) - 64;
    x = (x >> 1) ^ -(x & 1);
    y = (y >> 1) ^ -(y & 1);
    x += px; y += py; px = x; py = y;
    r.push([x / sc, y / sc]);
  }
  return r;
}
function fixPoly(rings) {
  return geoArea({ type: "Polygon", coordinates: rings }) > 2 * Math.PI ? rings.map((r) => r.slice().reverse()) : rings;
}
function decode(G) {
  if (!G || !G.features) return null;
  const sc = G.UTF8Scale || 1024;
  G.features.forEach((f) => {
    const g = f.geometry;
    if (!g) return;
    if (G.UTF8Encoding) {
      if (g.type === "Polygon") g.coordinates = g.coordinates.map((s, i) => decodeRing(s, g.encodeOffsets[i], sc));
      else if (g.type === "MultiPolygon") g.coordinates = g.coordinates.map((p, j) => p.map((s, i) => decodeRing(s, g.encodeOffsets[j][i], sc)));
    }
    if (g.type === "Polygon") g.coordinates = fixPoly(g.coordinates);
    else if (g.type === "MultiPolygon") g.coordinates = g.coordinates.map(fixPoly);
  });
  return { type: "FeatureCollection", features: G.features };
}
export function loadLand() {
  const urls = ["https://cdn.jsdelivr.net/npm/echarts@4.9.0/map/js/world.js", "https://unpkg.com/echarts@4.9.0/map/js/world.js"];
  return new Promise((res) => {
    let got = null;
    window.echarts = { registerMap: (n, g) => { got = g; } };
    const next = (i) => {
      if (i >= urls.length) return res(null);
      const s = document.createElement("script");
      s.src = urls[i];
      s.onload = () => {
        let g = null;
        try { g = decode(got); } catch (e) { g = null; }
        g ? res(g) : next(i + 1);
      };
      s.onerror = () => next(i + 1);
      document.head.appendChild(s);
    };
    next(0);
  });
}
