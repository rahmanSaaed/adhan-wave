import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { rel } from "./Globe.jsx";
import { CITIES } from "./cities.js";
import { PRAYERS, getEvents, lowerBound, DAY } from "./astro.js";
import { loadLand } from "./land.js";

const nf = new Intl.NumberFormat("ar-EG");
const fmtTime = new Intl.DateTimeFormat("ar-EG", { hour: "numeric", minute: "2-digit" });
const fmtClock = new Intl.DateTimeFormat("ar-EG", { hour: "numeric", minute: "2-digit", second: "2-digit" });
const fmtDay = new Intl.DateTimeFormat("ar-EG", { weekday: "long", day: "numeric", month: "long" });
const TL_SPEED = 1440; // 24h in 60s
const norm = (s) => s.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, " ").trim();

function makeClock() {
  const c = {
    speed: 1, paused: false, aReal: Date.now(), aVirt: Date.now(), start: Date.now(),
    now() { return c.paused ? c.aVirt : c.aVirt + (Date.now() - c.aReal) * c.speed; },
    set(speed, virt) { c.aVirt = virt ?? c.now(); c.aReal = Date.now(); c.speed = speed; c.paused = false; },
    pause(p) { if (p) { c.aVirt = c.now(); c.paused = true; } else { c.aReal = Date.now(); c.paused = false; } },
  };
  return c;
}

function useTicker(ms) {
  const [, set] = useState(0);
  useEffect(() => { const id = setInterval(() => set((x) => x + 1), ms); return () => clearInterval(id); }, [ms]);
}

function savedCity() {
  try { const s = localStorage.getItem("adhan-city"); if (s !== null && CITIES[+s]) return +s; } catch (e) {}
  return 0;
}

export default function App() {
  const clock = useRef(makeClock()).current;
  const [mode, setMode] = useState("live"); // live | timelapse
  const [paused, setPaused] = useState(false);
  const [view, setView] = useState("globe");
  const [spin, setSpin] = useState(true);
  const [land, setLand] = useState(null);
  const [landFailed, setLandFailed] = useState(false);
  const [city, setCity] = useState(savedCity);
  const [toast, setToast] = useState("");
  useTicker(250);

  useEffect(() => { loadLand().then((g) => (g ? setLand(g) : setLandFailed(true))); }, []);
  useEffect(() => { try { localStorage.setItem("adhan-city", String(city)); } catch (e) {} }, [city]);

  const t = clock.now();
  const activeWin = mode === "live" ? 4 * 60000 : 30 * 60000;
  const { events, byCity } = getEvents(t);

  // currently active
  const i0 = lowerBound(events, t - activeWin), i1 = lowerBound(events, t + 1);
  const activeList = [];
  const seen = new Set();
  for (let i = i1 - 1; i >= i0; i--) { const e = events[i]; if (!seen.has(e.ci)) { seen.add(e.ci); activeList.push(e); } }
  const nextEv = events[i1];

  const startTimelapse = () => { clock.start = clock.now(); clock.set(TL_SPEED); setMode("timelapse"); setPaused(false); };
  const goLive = () => { clock.set(1, Date.now()); setMode("live"); setPaused(false); };
  const togglePause = () => { clock.pause(!paused); setPaused(!paused); };

  const share = async () => {
    try { await navigator.clipboard.writeText(location.href); setToast("اتنسخ الرابط، ابعته لصحابك"); }
    catch (e) { setToast("انسخ الرابط من شريط العنوان"); }
    setTimeout(() => setToast(""), 2600);
  };

  return (
    <div className="app">
      <div className="stars" aria-hidden="true" />
      <header className="top">
        <div className="brand"><span className="logo">☾</span><span>الأذان حول العالم</span></div>
        <button className="ghost" onClick={share}>شارك الصفحة</button>
      </header>

      <section className="hero">
        <div className="hero-text">
          <span className={"pill " + (mode === "live" ? "live" : "tl")}>
            <i />{mode === "live" ? "مباشر دلوقتي" : paused ? "متوقف" : "يوم كامل في دقيقة"}
          </span>
          <h1>الأذان ما بيسكتش<br /><em>ولا ثانية</em></h1>
          <p className="lead">
            الأرض بتلف، فوقت كل صلاة بيتنقّل من مدينة للي بعدها من غير ما يقف.
            الخطوط الملوّنة على الكرة بتوريك الأذان واصل لحد فين في اللحظة دي.
          </p>

          <div className="counter card">
            <div className="counter-top">
              <span className="muted">دلوقتي بيأذّن في</span>
              <span className="big">{nf.format(activeList.length)}</span>
              <span className="muted">{activeList.length === 1 ? "مدينة" : "مدن"} على الخريطة</span>
            </div>
            <div className="chips">
              {activeList.slice(0, 6).map((e) => (
                <button key={e.ci + "-" + e.t} className="chip" style={{ "--c": PRAYERS[e.pi].c }} onClick={() => setCity(e.ci)}>
                  <i />{CITIES[e.ci][0]} <small>{PRAYERS[e.pi].n}</small>
                </button>
              ))}
              {activeList.length > 6 && <span className="chip more">+{nf.format(activeList.length - 6)}</span>}
              {activeList.length === 0 && nextEv && (
                <span className="muted small">الأذان الجاي في {CITIES[nextEv.ci][0]} ({PRAYERS[nextEv.pi].n}) بعد {rel(nextEv.t - t)}</span>
              )}
            </div>
          </div>

          <div className="play card">
            <div className="play-row">
              {mode === "live" ? (
                <button className="cta" onClick={startTimelapse}><span className="tri">▶</span> شوف يوم كامل في دقيقة</button>
              ) : (
                <>
                  <button className="cta" onClick={togglePause}>{paused ? <><span className="tri">▶</span> كمّل</> : <>❚❚ وقّف</>}</button>
                  <button className="ghost" onClick={goLive}>● رجوع للمباشر</button>
                </>
              )}
              <div className="clock">
                <div className="clock-t">{fmtClock.format(t)}</div>
                <div className="muted small">{fmtDay.format(t)} · بتوقيت جهازك</div>
              </div>
            </div>
            {mode === "timelapse" && (
              <div className="bar"><div style={{ width: (((t - clock.start) % DAY + DAY) % DAY) / DAY * 100 + "%" }} /></div>
            )}
          </div>
        </div>

        <div className="hero-globe">
          <div className="view-tabs">
            <div className="seg">
              <button className={view === "globe" ? "on" : ""} onClick={() => setView("globe")}>كرة</button>
              <button className={view === "flat" ? "on" : ""} onClick={() => setView("flat")}>خريطة</button>
            </div>
            {view === "globe" && (
              <button className={"ghost sm " + (spin ? "on" : "")} onClick={() => setSpin(!spin)}>{spin ? "⟳ بتلف لوحدها" : "⟳ اللف واقف"}</button>
            )}
          </div>
          <Globe clock={clock} land={land} mode={view} autoSpin={spin} selected={city} onSelect={setCity} activeWin={activeWin} />
          {!land && <div className="muted small center">{landFailed ? "تعذّر تحميل حدود الدول، بس المواقيت شغّالة عادي" : "بنحمّل الخريطة…"}</div>}
          <div className="legend">
            {PRAYERS.map((p) => (<span key={p.k}><b style={{ background: p.c }} />{p.n}</span>))}
            <span><b className="sun" />الشمس</span>
          </div>
          <div className="muted small center">{view === "globe" ? "اسحب الكرة عشان تلفها، واضغط على أي نقطة عشان تختار المدينة" : "اضغط على أي نقطة عشان تختار المدينة"}</div>
        </div>
      </section>

      <section className="grid2">
        <CityCard city={city} setCity={setCity} t={t} byCity={byCity} />
        <Feed events={events} t={t} setCity={setCity} live={mode === "live"} />
      </section>

      <section className="how">
        <h2>إزاي ده بيحصل؟</h2>
        <div className="steps">
          <Step n="١" title="الأرض بتلف" text="كل ٢٤ ساعة الأرض بتلف لفّة كاملة، فالشمس بتبان بتعدّي على المدن واحدة ورا التانية من الشرق للغرب." icon="earth" />
          <Step n="٢" title="الصلاة مربوطة بالشمس" text="كل صلاة ليها لحظة معيّنة في مكان الشمس: طلوع النور، أعلى نقطة، الغروب… فوقتها بيتنقّل مع الشمس." icon="sun" />
          <Step n="٣" title="المساجد في كل حتة" text="عشان فيه مساجد في كل خطوط الطول تقريبًا، أول ما الأذان يخلص في مدينة بيبدأ في اللي بعدها، فالسلسلة ما بتتقطعش." icon="mosque" />
        </div>
        <div className="prayers">
          {PRAYERS.map((p) => (
            <div key={p.k} className="prayer card" style={{ "--c": p.c }}>
              <div className="prayer-n"><i />{p.n}</div>
              <div className="muted small">{p.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="stats">
        <h2>الأرقام الحقيقية</h2>
        <p className="muted">قناة <a href="https://www.youtube.com/watch?v=hqMDzHqbeAQ" target="_blank" rel="noopener">وشلون؟</a> حسبت كل ثانية في سنة ٢٠٢٦ على أكثر من ٤٨٨ ألف مسجد، وده اللي طلع معاهم:</p>
        <div className="stat-row">
          <Stat big="٠" label="ثانية في السنة كلها من غير أذان" />
          <Stat big="~٤٬٠٠٠" label="مسجد بيأذّن في نفس اللحظة في المتوسط" />
          <Stat big="+٤٦ ألف" label="مسجد أذّنوا مع بعض في ثانية واحدة في أبريل" />
          <Stat big="+٤٨٨ ألف" label="مسجد دخلوا في الحسبة" />
        </div>
      </section>

      <footer>
        المواقيت هنا محسوبة فلكيًا من مكان الشمس، وكل بلد بالطريقة الرسمية المعتمدة عندها تقريبًا، وممكن تختلف دقيقة أو اتنين عن التقويم الرسمي. على الخريطة {nf.format(CITIES.length)} مدينة كأمثلة، مش كل المساجد، والخطوط محسوبة بمعايير رابطة العالم الإسلامي.
        حدود الدول من خريطة ECharts المفتوحة (Apache-2.0). الفكرة مأخوذة من فيديو قناة وشلون؟.
      </footer>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function CityCard({ city, setCity, t, byCity }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const list = useMemo(() => {
    const n = norm(q);
    return CITIES.map((c, i) => ({ n: c[0], i })).filter((x) => !n || norm(x.n).includes(n)).sort((a, b) => a.n.localeCompare(b.n, "ar")).slice(0, 40);
  }, [q]);
  const ev = byCity[city];
  const nxIdx = ev.findIndex((e) => e.t > t);
  const nx = ev[nxIdx], pv = ev[nxIdx - 1];
  const upcoming = [];
  for (const e of ev) { if (e.t <= t) continue; if (!upcoming.find((x) => x.pi === e.pi)) upcoming.push(e); if (upcoming.length === 5) break; }
  upcoming.sort((a, b) => a.pi - b.pi);
  const frac = nx && pv ? (t - pv.t) / (nx.t - pv.t) : 0;
  const left = nx ? Math.max(0, nx.t - t) : 0;
  const hh = Math.floor(left / 3600000), mm = Math.floor((left % 3600000) / 60000), ss = Math.floor((left % 60000) / 1000);
  const C = 2 * Math.PI * 52;

  return (
    <div className="card city">
      <div className="card-h">
        <h3>مدينتك</h3>
        <div className="search">
          <input
            value={open ? q : CITIES[city][0]}
            onFocus={() => { setOpen(true); setQ(""); }}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onChange={(e) => setQ(e.target.value)}
            placeholder="دوّر على مدينة…"
            aria-label="اختار مدينة"
          />
          {open && (
            <ul className="dd">
              {list.map((x) => (<li key={x.i} onMouseDown={() => { setCity(x.i); setOpen(false); }}>{x.n}</li>))}
              {list.length === 0 && <li className="muted">مش لاقيين المدينة دي</li>}
            </ul>
          )}
        </div>
      </div>
      {nx && (
        <div className="next">
          <svg viewBox="0 0 120 120" className="ring">
            <circle cx="60" cy="60" r="52" className="ring-bg" />
            <circle cx="60" cy="60" r="52" className="ring-fg" style={{ stroke: PRAYERS[nx.pi].c, strokeDasharray: C, strokeDashoffset: C * (1 - frac) }} />
          </svg>
          <div className="next-txt">
            <div className="muted small">الأذان الجاي</div>
            <div className="next-p" style={{ color: PRAYERS[nx.pi].c }}>{PRAYERS[nx.pi].n}</div>
            <div className="cd">{[hh, mm, ss].map((v) => String(v).padStart(2, "0")).join(":")}</div>
          </div>
        </div>
      )}
      <div className="times">
        {upcoming.map((e) => (
          <div key={e.pi} className={nx && e === nx ? "nx" : ""} style={{ "--c": PRAYERS[e.pi].c }}>
            <div className="tn">{PRAYERS[e.pi].n}</div>
            <div className="tv">{fmtTime.format(e.t)}</div>
          </div>
        ))}
      </div>
      <div className="muted small">المواعيد الجاية بتوقيت جهازك</div>
    </div>
  );
}

function Feed({ events, t, setCity, live }) {
  const i1 = lowerBound(events, t + 1);
  const items = [];
  const seen = new Set();
  for (let i = i1 - 1; i >= 0 && items.length < 7; i--) { const e = events[i]; if (seen.has(e.ci)) continue; seen.add(e.ci); items.push(e); }
  const upcoming = events.slice(i1, i1 + 3);
  return (
    <div className="card feed">
      <div className="card-h"><h3>على الهوا</h3><span className="muted small">{live ? "آخر الأذانات حوالين العالم" : "في الوقت المتسرّع"}</span></div>
      <ul>
        {upcoming.slice().reverse().map((e) => (
          <li key={"u" + e.ci + e.t} className="soon" onClick={() => setCity(e.ci)}>
            <i style={{ background: PRAYERS[e.pi].c }} />
            <span className="fc">{CITIES[e.ci][0]}</span>
            <span className="fp" style={{ color: PRAYERS[e.pi].c }}>{PRAYERS[e.pi].n}</span>
            <span className="ft">بعد {rel(e.t - t)}</span>
          </li>
        ))}
        {items.map((e, k) => (
          <li key={e.ci + "-" + e.t} className={k === 0 ? "new" : ""} onClick={() => setCity(e.ci)}>
            <i style={{ background: PRAYERS[e.pi].c }} />
            <span className="fc">{CITIES[e.ci][0]}</span>
            <span className="fp" style={{ color: PRAYERS[e.pi].c }}>{PRAYERS[e.pi].n}</span>
            <span className="ft">من {rel(t - e.t)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({ n, title, text, icon }) {
  return (
    <div className="step card">
      <div className="step-ic"><Icon name={icon} /><span>{n}</span></div>
      <h4>{title}</h4>
      <p className="muted">{text}</p>
    </div>
  );
}
function Icon({ name }) {
  if (name === "earth") return (
    <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="#2a4a72" /><path d="M14 18c4 1 6-2 9 0s1 5 4 6 6-1 7 2M12 28c3-1 5 1 7 3s4 0 5 3" stroke="#6ea8ff" strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M40 12a20 20 0 0 1 2 10" stroke="#ffd36b" strokeWidth="2.5" fill="none" strokeLinecap="round" /><path d="M42 22l-3-2.5M42 22l2-3" stroke="#ffd36b" strokeWidth="2.5" strokeLinecap="round" /></svg>
  );
  if (name === "sun") return (
    <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="8" fill="#ffd36b" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (<line key={a} x1="24" y1="9" x2="24" y2="5" stroke="#ffd36b" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${a} 24 24)`} />))}</svg>
  );
  return (
    <svg viewBox="0 0 48 48"><path d="M14 38V24a10 10 0 0 1 20 0v14z" fill="#a98bff" /><path d="M24 10v4" stroke="#a98bff" strokeWidth="2" /><circle cx="24" cy="9" r="1.8" fill="#ffd36b" /><rect x="36" y="16" width="4" height="22" rx="1" fill="#6ea8ff" /><path d="M36 16l2-5 2 5z" fill="#6ea8ff" /><rect x="10" y="38" width="32" height="3" rx="1.5" fill="#2a4a72" /></svg>
  );
}
function Stat({ big, label }) {
  return (<div className="stat card"><div className="stat-b">{big}</div><div className="muted small">{label}</div></div>);
}

