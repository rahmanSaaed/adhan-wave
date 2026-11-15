import { useEffect, useRef, useState } from "react";
import { geoOrthographic, geoNaturalEarth1, geoPath, geoGraticule10, geoCircle, geoDistance } from "d3-geo";
import { CITIES } from "./cities.js";
import { PRAYERS, fronts, getEvents, lowerBound } from "./astro.js";
import { useI18n } from "./i18n.js";

const night = [90.833, 84, 78, 72].map((r) => ({ r }));
const grat = geoGraticule10();

export default function Globe({ clock, land, mode, autoSpin, selected, onSelect, activeWin }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const rot = useRef([-35, -18]);
  const drag = useRef(null);
  const lastInteract = useRef(0);
  const projRef = useRef(null);
  const hoverRef = useRef(-1);
  const [hover, setHover] = useState(null);
  const [size, setSize] = useState({ w: 320, h: 320 });
  const i18n = useI18n();
  const props = useRef({});
  props.current = { land, mode, autoSpin, selected, activeWin, i18n };

  // center on selected city when it changes
  useEffect(() => {
    const c = CITIES[selected];
    if (c) { rot.current = [-c[3], -Math.max(-60, Math.min(60, c[2]))]; lastInteract.current = performance.now(); }
  }, [selected]);

  useEffect(() => {
    const el = wrapRef.current;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = mode === "globe" ? Math.min(w, 640) : Math.round(w * 0.52);
      setSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv.getContext("2d");
    let raf, prev = performance.now();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size.w * dpr; cv.height = size.h * dpr;
    const font = '600 12px "Readex Pro", system-ui, sans-serif';

    const draw = (now) => {
      const dt = Math.min(100, now - prev); prev = now;
      const { land, mode, autoSpin, selected, activeWin, i18n } = props.current;
      const globe = mode === "globe";
      const W = size.w, H = size.h;
      if (globe && autoSpin && !drag.current && now - lastInteract.current > 3500) rot.current[0] += dt * 0.006;
      const proj = globe
        ? geoOrthographic().rotate(rot.current).translate([W / 2, H / 2]).scale(Math.min(W, H) / 2 - 14).clipAngle(90)
        : geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: "Sphere" });
      projRef.current = proj;
      const path = geoPath(proj, ctx);
      const t = clock.now();
      const center = globe ? [-rot.current[0], -rot.current[1]] : null;
      const visible = (ll) => !globe || geoDistance(ll, center) < Math.PI / 2 - 0.02;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const R = proj.scale();
      // atmosphere
      if (globe) {
        const g = ctx.createRadialGradient(W / 2, H / 2, R * 0.9, W / 2, H / 2, R * 1.12);
        g.addColorStop(0, "rgba(110,168,255,0.25)"); g.addColorStop(1, "rgba(110,168,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, H / 2, R * 1.12, 0, 2 * Math.PI); ctx.fill();
      }
      // ocean
      ctx.beginPath(); path({ type: "Sphere" });
      if (globe) {
        const g = ctx.createRadialGradient(W / 2 - R * 0.35, H / 2 - R * 0.35, R * 0.1, W / 2, H / 2, R);
        g.addColorStop(0, "#132b52"); g.addColorStop(1, "#081327");
        ctx.fillStyle = g;
      } else ctx.fillStyle = "#0d1f3b";
      ctx.fill();
      ctx.save(); ctx.beginPath(); path({ type: "Sphere" }); ctx.clip();
      ctx.beginPath(); path(grat); ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 0.7; ctx.stroke();
      if (land) {
        ctx.beginPath(); path(land); ctx.fillStyle = "#2f5a8f"; ctx.fill();
        ctx.strokeStyle = "rgba(150,190,240,0.25)"; ctx.lineWidth = 0.5; ctx.stroke();
      }
      // night & twilight
      const f = fronts(t);
      const anti = [f.sun[0] + 180, -f.sun[1]];
      night.forEach(({ r }, i) => {
        ctx.beginPath(); path(geoCircle().center(anti).radius(r)());
        ctx.fillStyle = i === 0 ? "rgba(2,6,20,0.32)" : "rgba(2,6,20,0.14)"; ctx.fill();
      });
      // prayer fronts
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      f.lines.forEach((g, i) => {
        const c = PRAYERS[i].c;
        ctx.beginPath(); path(g);
        ctx.strokeStyle = c + "33"; ctx.lineWidth = 10; ctx.stroke();
        ctx.strokeStyle = c + "66"; ctx.lineWidth = 5; ctx.stroke();
        ctx.strokeStyle = c; ctx.lineWidth = 2.2; ctx.stroke();
      });
      ctx.restore();
      // sun
      if (visible(f.sun)) {
        const [sx, sy] = proj(f.sun);
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 22);
        g.addColorStop(0, "rgba(255,214,102,0.9)"); g.addColorStop(0.35, "rgba(255,214,102,0.35)"); g.addColorStop(1, "rgba(255,214,102,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 22, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = "#ffe08a"; ctx.beginPath(); ctx.arc(sx, sy, 5, 0, 2 * Math.PI); ctx.fill();
      }
      // cities
      const { events } = getEvents(t);
      const i0 = lowerBound(events, t - activeWin), i1 = lowerBound(events, t + 1);
      const active = new Map();
      for (let i = i1 - 1; i >= i0; i--) { const e = events[i]; if (!active.has(e.ci)) active.set(e.ci, e); }
      const pts = [];
      CITIES.forEach((c, ci) => {
        const ll = [c[3], c[2]];
        if (!visible(ll)) return;
        const [x, y] = proj(ll);
        pts.push({ ci, x, y });
        const a = active.get(ci);
        const base = 1.6 + c[4] * 0.7;
        if (a) {
          const col = PRAYERS[a.pi].c;
          for (let k = 0; k < 2; k++) {
            const ph = ((now / 1700 + ci * 0.37 + k * 0.5) % 1);
            ctx.beginPath(); ctx.arc(x, y, base + 3 + ph * 20, 0, 2 * Math.PI);
            ctx.strokeStyle = col; ctx.globalAlpha = (1 - ph) * 0.8; ctx.lineWidth = 2; ctx.stroke();
          }
          ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.arc(x, y, base + 1.8, 0, 2 * Math.PI); ctx.fillStyle = col; ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(x, y, base, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(220,230,250,0.55)"; ctx.fill();
        }
        if (ci === selected) {
          ctx.beginPath(); ctx.arc(x, y, base + 6, 0, 2 * Math.PI);
          ctx.strokeStyle = "#ffd36b"; ctx.lineWidth = 2; ctx.stroke();
        }
      });
      projRef.pts = pts;
      // labels: selected + active (greedy, no overlap)
      ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.direction = i18n.dir;
      const boxes = [];
      const label = (ci, color, strong) => {
        const p = pts.find((q) => q.ci === ci); if (!p) return;
        const txt = i18n.city(ci);
        const w = ctx.measureText(txt).width + 12, h = 20;
        const bx = p.x - w / 2, by = p.y - 12 - h;
        if (!strong && boxes.some((b) => bx < b[0] + b[2] && bx + w > b[0] && by < b[1] + b[3] && by + h > b[1])) return;
        boxes.push([bx, by, w, h]);
        ctx.fillStyle = "rgba(6,12,28,0.78)";
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, w, h, 10) : ctx.rect(bx, by, w, h); ctx.fill();
        ctx.fillStyle = color; ctx.fillText(txt, p.x, p.y - 15);
      };
      label(selected, "#ffd36b", true);
      [...active.values()].sort((a, b) => CITIES[b.ci][4] - CITIES[a.ci][4]).forEach((e) => { if (e.ci !== selected) label(e.ci, PRAYERS[e.pi].c, false); });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size, clock]);

  const pick = (ev) => {
    const r = canvasRef.current.getBoundingClientRect();
    const x = ev.clientX - r.left, y = ev.clientY - r.top;
    let best = -1, bd = 14 * 14;
    (projRef.pts || []).forEach((p) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = p.ci; } });
    return { best, x, y };
  };
  const onDown = (ev) => {
    lastInteract.current = performance.now();
    if (mode !== "globe") return;
    drag.current = { x: ev.clientX, y: ev.clientY, r: [...rot.current], moved: false };
    ev.currentTarget.setPointerCapture?.(ev.pointerId);
  };
  const onMove = (ev) => {
    if (drag.current) {
      const dx = ev.clientX - drag.current.x, dy = ev.clientY - drag.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
      const k = 0.35;
      rot.current = [drag.current.r[0] + dx * k, Math.max(-75, Math.min(75, drag.current.r[1] - dy * k))];
      lastInteract.current = performance.now();
      return;
    }
    const { best, x, y } = pick(ev);
    if (best !== hoverRef.current) { hoverRef.current = best; }
    setHover(best >= 0 ? { ci: best, x, y } : null);
  };
  const onUp = (ev) => {
    const d = drag.current; drag.current = null;
    if (d && d.moved) return;
    const { best } = pick(ev);
    if (best >= 0) onSelect(best);
  };

  let tip = null;
  if (hover) {
    const t = clock.now();
    const ev = getEvents(t).byCity[hover.ci];
    const nx = ev.find((e) => e.t > t);
    const ls = [...ev].reverse().find((e) => e.t <= t);
    tip = (
      <div className="tip" style={{ left: Math.max(4, Math.min(hover.x + 14, size.w - 210)), top: hover.y + 14 }}>
        <div className="tip-h">{i18n.city(hover.ci)}</div>
        {ls && <div>{i18n.t.lastAdhan}: <b style={{ color: PRAYERS[ls.pi].c }}>{i18n.prayer(ls.pi)}</b> · {i18n.ago(t - ls.t)}</div>}
        {nx && <div>{i18n.t.nextOne}: <b style={{ color: PRAYERS[nx.pi].c }}>{i18n.prayer(nx.pi)}</b> · {i18n.inn(nx.t - t)}</div>}
        <div className="tip-s">{i18n.t.tapToPick}</div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={"globe-wrap " + mode}>
      <canvas
        ref={canvasRef}
        style={{ width: size.w, height: size.h, cursor: mode === "globe" ? (drag.current ? "grabbing" : "grab") : "pointer", touchAction: mode === "globe" ? "none" : "auto" }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
        onPointerLeave={() => { setHover(null); }}
        aria-label={i18n.t.canvasAria}
        role="img"
      />
      {tip}
    </div>
  );
}
