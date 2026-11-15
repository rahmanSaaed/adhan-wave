import { CITIES } from "./cities.js";

export const PRAYERS = [
  { k: "fajr", n: "الفجر", c: "#6ea8ff", d: "أول ما السما تبدأ تنوّر قبل الشروق" },
  { k: "dhuhr", n: "الظهر", c: "#ffc94d", d: "لما الشمس تعدّي أعلى نقطة في السما" },
  { k: "asr", n: "العصر", c: "#ff9a52", d: "لما ضل أي حاجة يبقى قدّ طولها تقريبًا" },
  { k: "maghrib", n: "المغرب", c: "#ff5f8f", d: "مع غروب الشمس على طول" },
  { k: "isha", n: "العشاء", c: "#a98bff", d: "لما الشفق الأحمر يختفي والسما تضلم" },
];

const METHODS = {
  UQ: { f: 18.5, im: 90, m: 0.833, a: 1 },
  EG: { f: 19.5, i: 17.5, m: 0.833, a: 1 },
  MWL: { f: 18, i: 17, m: 0.833, a: 1 },
  KAR: { f: 18, i: 18, m: 0.833, a: 2 },
  ISNA: { f: 15, i: 15, m: 0.833, a: 1 },
  SEA: { f: 20, i: 18, m: 0.833, a: 1 },
  MAR: { f: 19, i: 17, m: 0.833, a: 1 },
  IR: { f: 17.7, i: 14, m: 4.5, a: 1 },
  TR: { f: 18, i: 17, m: 0.833, a: 1 },
};

const RAD = Math.PI / 180, DEG = 180 / Math.PI;
export const DAY = 86400000;
const fixA = (a) => ((a % 360) + 360) % 360;
const fixH = (h) => ((h % 24) + 24) % 24;
const julian = (ms) => ms / DAY + 2440587.5;

export function sunPos(jd) {
  const D = jd - 2451545.0;
  const g = fixA(357.529 + 0.98560028 * D);
  const q = fixA(280.459 + 0.98564736 * D);
  const L = fixA(q + 1.915 * Math.sin(g * RAD) + 0.02 * Math.sin(2 * g * RAD));
  const e = 23.439 - 0.00000036 * D;
  const RA = (Math.atan2(Math.cos(e * RAD) * Math.sin(L * RAD), Math.cos(L * RAD)) * DEG) / 15;
  let eqt = q / 15 - fixH(RA);
  if (eqt > 12) eqt -= 24;
  if (eqt < -12) eqt += 24;
  const decl = Math.asin(Math.sin(e * RAD) * Math.sin(L * RAD)) * DEG;
  return { decl, eqt };
}
function hourAngle(alt, lat, decl) {
  const c = (Math.sin(alt * RAD) - Math.sin(lat * RAD) * Math.sin(decl * RAD)) / (Math.cos(lat * RAD) * Math.cos(decl * RAD));
  if (c < -1 || c > 1) return NaN;
  return Math.acos(c) * DEG;
}
const asrAlt = (f, lat, decl) => Math.atan(1 / (f + Math.tan(Math.abs(lat - decl) * RAD))) * DEG;

function cityTimes(c, dayMs) {
  const [, mk, lat, lon] = c;
  const m = METHODS[mk];
  const sp = sunPos(julian(dayMs) + 0.5 - lon / 360);
  const dh = 12 - lon / 15 - sp.eqt;
  const H = (a) => hourAngle(a, lat, sp.decl) / 15;
  const sunset = dh + H(-0.833);
  const t = [
    dh - H(-m.f),
    dh + 1 / 60,
    dh + H(asrAlt(m.a, lat, sp.decl)),
    dh + H(-m.m),
    m.im ? sunset + m.im / 60 : dh + H(-m.i),
  ];
  return t.map((h) => (isNaN(h) ? NaN : dayMs + h * 3600000));
}

// Event index cached per UTC day
let cache = { day: null, events: [], byCity: [] };
export function getEvents(tMs) {
  const d = Math.floor(tMs / DAY) * DAY;
  if (cache.day === d) return cache;
  const events = [];
  const byCity = CITIES.map(() => []);
  for (const off of [-1, 0, 1, 2]) {
    const day = d + off * DAY;
    CITIES.forEach((c, ci) => {
      cityTimes(c, day).forEach((t, pi) => {
        if (!isNaN(t)) {
          const e = { t, ci, pi };
          events.push(e);
          byCity[ci].push(e);
        }
      });
    });
  }
  events.sort((a, b) => a.t - b.t);
  byCity.forEach((l) => l.sort((a, b) => a.t - b.t));
  cache = { day: d, events, byCity };
  return cache;
}
export function lowerBound(events, t) {
  let lo = 0, hi = events.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (events[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// Global "fronts": where each prayer's moment is right now (MWL angles, Shafi asr)
export function fronts(tMs) {
  const sp = sunPos(julian(tMs));
  const utcH = (((tMs % DAY) + DAY) % DAY) / 3600000;
  const norm = (l) => ((((l + 540) % 360) + 360) % 360) - 180;
  const ls = norm((12 - utcH - sp.eqt) * 15);
  const mk = (altFn, dir) => {
    const segs = [];
    let cur = [];
    for (let lat = -75; lat <= 80; lat += 0.5) {
      const ha = hourAngle(altFn(lat), lat, sp.decl);
      if (isNaN(ha)) {
        if (cur.length > 1) segs.push(cur);
        cur = [];
        continue;
      }
      cur.push([norm(ls + dir * ha), lat]);
    }
    if (cur.length > 1) segs.push(cur);
    return { type: "MultiLineString", coordinates: segs };
  };
  const dh = [];
  for (let lat = -75; lat <= 80; lat += 1) dh.push([norm(ls + 0.25), lat]);
  return {
    sun: [ls, sp.decl],
    lines: [
      mk(() => -18, -1),
      { type: "LineString", coordinates: dh },
      mk((lat) => asrAlt(1, lat, sp.decl), 1),
      mk(() => -0.833, 1),
      mk(() => -17, 1),
    ],
  };
}
