import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "./Globe.jsx";
import { CITIES } from "./cities.js";
import { PRAYERS, getEvents, lowerBound, DAY } from "./astro.js";
import { loadLand } from "./land.js";
import { CITY_NAMES_LATIN } from "./cityNames.js";
import { I18n, LANGS, detectLang, makeI18n, useI18n } from "./i18n.js";

const TL_SPEED = 1440; // 24h in 60s
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, " ").trim();

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
  const [lang, setLang] = useState(detectLang);
  const i18n = useMemo(() => makeI18n(lang), [lang]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = i18n.dir;
    document.title = i18n.t.metaTitle;
    try { localStorage.setItem("adhan-lang", lang); } catch (e) {}
    try { history.replaceState(null, "", "#" + lang); } catch (e) {}
  }, [lang, i18n]);
  return (
    <I18n.Provider value={i18n}>
      <Main lang={lang} setLang={setLang} />
    </I18n.Provider>
  );
}

function Main({ lang, setLang }) {
  const i18n = useI18n();
  const { t: T, nf } = i18n;
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
    try { await navigator.clipboard.writeText(location.href); setToast(T.copied); }
    catch (e) { setToast(T.copyFail); }
    setTimeout(() => setToast(""), 2600);
  };

  return (
    <div className="app">
      <div className="stars" aria-hidden="true" />
      <header className="top">
        <div className="brand"><span className="logo">☾</span><span>{T.title}</span></div>
        <div className="top-actions">
          <label className="lang">
            <span aria-hidden="true">🌐</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={T.language}>
              {LANGS.map((l) => (<option key={l.code} value={l.code}>{l.name}</option>))}
            </select>
          </label>
          <button className="ghost" onClick={share}>{T.share}</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-text">
          <span className={"pill " + (mode === "live" ? "live" : "tl")}>
            <i />{mode === "live" ? T.live : paused ? T.paused : T.tlPill}
          </span>
          <h1>{T.h1a}<br /><em>{T.h1b}</em></h1>
          <p className="lead">{T.lead}</p>

          <div className="counter card">
            <div className="counter-top">
              <span className="muted">{T.nowPre}</span>
              <span className="big">{nf.format(activeList.length)}</span>
              <span className="muted">{T.nowPost(activeList.length)}</span>
            </div>
            <div className="chips">
              {activeList.slice(0, 6).map((e) => (
                <button key={e.ci + "-" + e.t} className="chip" style={{ "--c": PRAYERS[e.pi].c }} onClick={() => setCity(e.ci)}>
                  <i />{i18n.city(e.ci)} <small>{i18n.prayer(e.pi)}</small>
                </button>
              ))}
              {activeList.length > 6 && <span className="chip more">+{nf.format(activeList.length - 6)}</span>}
              {activeList.length === 0 && nextEv && (
                <span className="muted small">{T.nextIn(i18n.city(nextEv.ci), i18n.prayer(nextEv.pi), i18n.inn(nextEv.t - t))}</span>
              )}
            </div>
          </div>

          <div className="play card">
            <div className="play-row">
              {mode === "live" ? (
                <button className="cta" onClick={startTimelapse}><span className="tri">▶</span> {T.tlBtn}</button>
              ) : (
                <>
                  <button className="cta" onClick={togglePause}>{paused ? <><span className="tri">▶</span> {T.resume}</> : <>❚❚ {T.pause}</>}</button>
                  <button className="ghost" onClick={goLive}>● {T.backLive}</button>
                </>
              )}
              <div className="clock">
                <div className="clock-t">{i18n.fmtClock.format(t)}</div>
                <div className="muted small">{i18n.fmtDay.format(t)} · {T.deviceTime}</div>
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
              <button className={view === "globe" ? "on" : ""} onClick={() => setView("globe")}>{T.globe}</button>
              <button className={view === "flat" ? "on" : ""} onClick={() => setView("flat")}>{T.map}</button>
            </div>
            {view === "globe" && (
              <button className={"ghost sm " + (spin ? "on" : "")} onClick={() => setSpin(!spin)}>{"⟳ " + (spin ? T.spinOn : T.spinOff)}</button>
            )}
          </div>
          <Globe clock={clock} land={land} mode={view} autoSpin={spin} selected={city} onSelect={setCity} activeWin={activeWin} />
          {!land && <div className="muted small center">{landFailed ? T.landFail : T.landLoading}</div>}
          <div className="legend">
            {PRAYERS.map((p, i) => (<span key={p.k}><b style={{ background: p.c }} />{i18n.prayer(i)}</span>))}
            <span><b className="sun" />{T.sun}</span>
          </div>
          <div className="muted small center">{view === "globe" ? T.dragHint : T.tapHint}</div>
        </div>
      </section>

      <section className="grid2">
        <CityCard city={city} setCity={setCity} t={t} byCity={byCity} />
        <Feed events={events} t={t} setCity={setCity} live={mode === "live"} />
      </section>

      <section className="how">
        <h2>{T.howTitle}</h2>
        <div className="steps">
          {T.steps.map(([title, text], i) => (
            <Step key={i} n={nf.format(i + 1)} title={title} text={text} icon={["earth", "sun", "mosque"][i]} />
          ))}
        </div>
        <div className="prayers">
          {PRAYERS.map((p, i) => (
            <div key={p.k} className="prayer card" style={{ "--c": p.c }}>
              <div className="prayer-n"><i />{i18n.prayer(i)}</div>
              <div className="muted small">{T.prayerDesc[i]}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="stats">
        <h2>{T.statsTitle}</h2>
        <p className="muted">{T.statsPre}{T.statsPre && " "}<a href={i18n.video} target="_blank" rel="noopener">{T.channel}</a> {T.statsPost}</p>
        <div className="stat-row">
          <Stat big={nf.format(0)} label={T.stats[0]} />
          <Stat big={"~" + nf.format(4000)} label={T.stats[1]} />
          <Stat big={"+" + i18n.compact.format(46000)} label={T.stats[2]} />
          <Stat big={"+" + i18n.compact.format(488000)} label={T.stats[3]} />
        </div>
      </section>

      <footer>{T.footer(nf.format(CITIES.length))}</footer>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function CityCard({ city, setCity, t, byCity }) {
  const i18n = useI18n();
  const T = i18n.t;
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const list = useMemo(() => {
    const n = norm(q);
    return CITIES.map((c, i) => ({ n: i18n.city(i), i, k: norm(c[0] + " " + CITY_NAMES_LATIN[i]) }))
      .filter((x) => !n || x.k.includes(n))
      .sort((a, b) => a.n.localeCompare(b.n, i18n.locale))
      .slice(0, 40);
  }, [q, i18n]);
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
        <h3>{T.yourCity}</h3>
        <div className="search">
          <input
            value={open ? q : i18n.city(city)}
            onFocus={() => { setOpen(true); setQ(""); }}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onChange={(e) => setQ(e.target.value)}
            placeholder={T.searchPh}
            aria-label={T.searchAria}
          />
          {open && (
            <ul className="dd">
              {list.map((x) => (<li key={x.i} onMouseDown={() => { setCity(x.i); setOpen(false); }}>{x.n}</li>))}
              {list.length === 0 && <li className="muted">{T.notFound}</li>}
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
            <div className="muted small">{T.nextAdhan}</div>
            <div className="next-p" style={{ color: PRAYERS[nx.pi].c }}>{i18n.prayer(nx.pi)}</div>
            <div className="cd"><bdi dir="ltr">{[hh, mm, ss].map((v) => String(v).padStart(2, "0")).join(":")}</bdi></div>
          </div>
        </div>
      )}
      <div className="times">
        {upcoming.map((e) => (
          <div key={e.pi} className={nx && e === nx ? "nx" : ""} style={{ "--c": PRAYERS[e.pi].c }}>
            <div className="tn">{i18n.prayer(e.pi)}</div>
            <div className="tv">{i18n.fmtTime.format(e.t)}</div>
          </div>
        ))}
      </div>
      <div className="muted small">{T.upcomingNote}</div>
    </div>
  );
}

function Feed({ events, t, setCity, live }) {
  const i18n = useI18n();
  const T = i18n.t;
  const i1 = lowerBound(events, t + 1);
  const items = [];
  const seen = new Set();
  for (let i = i1 - 1; i >= 0 && items.length < 7; i--) { const e = events[i]; if (seen.has(e.ci)) continue; seen.add(e.ci); items.push(e); }
  const upcoming = events.slice(i1, i1 + 3);
  return (
    <div className="card feed">
      <div className="card-h"><h3>{T.onAir}</h3><span className="muted small">{live ? T.onAirSub : T.onAirSubTL}</span></div>
      <ul>
        {upcoming.slice().reverse().map((e) => (
          <li key={"u" + e.ci + e.t} className="soon" onClick={() => setCity(e.ci)}>
            <i style={{ background: PRAYERS[e.pi].c }} />
            <span className="fc">{i18n.city(e.ci)}</span>
            <span className="fp" style={{ color: PRAYERS[e.pi].c }}>{i18n.prayer(e.pi)}</span>
            <span className="ft">{i18n.inn(e.t - t)}</span>
          </li>
        ))}
        {items.map((e, k) => (
          <li key={e.ci + "-" + e.t} className={k === 0 ? "new" : ""} onClick={() => setCity(e.ci)}>
            <i style={{ background: PRAYERS[e.pi].c }} />
            <span className="fc">{i18n.city(e.ci)}</span>
            <span className="fp" style={{ color: PRAYERS[e.pi].c }}>{i18n.prayer(e.pi)}</span>
            <span className="ft">{i18n.ago(t - e.t)}</span>
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

