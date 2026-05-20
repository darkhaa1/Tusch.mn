// Tweaks for Atelier — 3 expressive controls that reshape the whole feel:
//   1. Палитр (palette mood) — swap the warmth/coolness of the entire system
//   2. Чимэглэл (ornament richness) — turn khee borders + italic flourishes up or down
//   3. Маяг (type voice) — editorial italic vs upright classical vs modern hybrid

const PALETTES = {
  // default warm terre/cream
  shoroo: {
    label: 'Шороо',
    sub: 'Terre · cream',
    swatch: ['#a8542a', '#f4ede1', '#1a1714'],
    vars: {
      '--at-ink': '#1a1714',
      '--at-cream': '#f4ede1',
      '--at-paper': '#faf6ee',
      '--at-sand': '#e8ddc8',
      '--at-terre': '#a8542a',
      '--at-rose': '#d97a5f',
      '--at-ocre': '#e0a830',
      '--at-olive': '#5e6b3a',
      '--at-cobalt': '#264a8b',
      '--at-pourpre': '#7a2b3a',
      '--at-muted': '#8a7f6f',
      '--at-line': '#d9cfba',
    },
  },
  // steppe — cool sage + sky, parchment
  tal: {
    label: 'Тал нутаг',
    sub: 'Sage · sky',
    swatch: ['#4f7d6b', '#eef0e6', '#1a2230'],
    vars: {
      '--at-ink': '#1a2230',
      '--at-cream': '#eef0e6',
      '--at-paper': '#f6f7ee',
      '--at-sand': '#dde0d0',
      '--at-terre': '#4f7d6b',     // sage replaces terracotta as primary
      '--at-rose': '#7fa996',
      '--at-ocre': '#d4a84a',
      '--at-olive': '#6b7a3a',
      '--at-cobalt': '#3a6b9e',
      '--at-pourpre': '#2d4a5c',
      '--at-muted': '#7a8576',
      '--at-line': '#c8d0bc',
    },
  },
  // mountain — deep aubergine + ocre, smoky
  uuls: {
    label: 'Уулс',
    sub: 'Aubergine · ocre',
    swatch: ['#5a2438', '#f0e4cf', '#0e0a10'],
    vars: {
      '--at-ink': '#0e0a10',
      '--at-cream': '#f0e4cf',
      '--at-paper': '#f6ecd6',
      '--at-sand': '#e2d3b4',
      '--at-terre': '#5a2438',     // aubergine
      '--at-rose': '#a04050',
      '--at-ocre': '#d68a2e',
      '--at-olive': '#7a5a20',
      '--at-cobalt': '#3a2848',
      '--at-pourpre': '#5a2438',
      '--at-muted': '#8a7058',
      '--at-line': '#d0bc94',
    },
  },
};

const TYPES = {
  // default — Noto Serif with italic flourishes
  setguul: {
    label: 'Сэтгүүл',
    sub: 'Italic editorial',
    vars: {
      '--at-serif': "'Noto Serif', Georgia, serif",
      '--at-sans': "'Noto Sans', system-ui, sans-serif",
      '--at-italic-style': 'italic',
      '--at-italic-display': 'inline',
    },
  },
  // upright classical — same serif, no italic
  songodog: {
    label: 'Сонгодог',
    sub: 'Upright serif',
    vars: {
      '--at-serif': "'Noto Serif', Georgia, serif",
      '--at-sans': "'Noto Sans', system-ui, sans-serif",
      '--at-italic-style': 'normal',
      '--at-italic-display': 'inline',
    },
  },
  // modern — DM Sans for everything, no italic, no flourishes
  orchin: {
    label: 'Орчин үе',
    sub: 'Modern sans',
    vars: {
      '--at-serif': "'DM Sans', system-ui, sans-serif",
      '--at-sans': "'DM Sans', system-ui, sans-serif",
      '--at-italic-style': 'normal',
      '--at-italic-display': 'none',
    },
  },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "shoroo",
  "ornament": 60,
  "type": "setguul"
}/*EDITMODE-END*/;

function applyTweaks(t) {
  const root = document.documentElement;
  const pal = PALETTES[t.palette] || PALETTES.shoroo;
  const typ = TYPES[t.type] || TYPES.setguul;
  Object.entries(pal.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  Object.entries(typ.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  // Ornament intensity drives khee opacity + italic display + tag visibility
  const orn = Math.max(0, Math.min(100, t.ornament)) / 100;
  root.style.setProperty('--at-ornament', String(orn));
  // soft fade-out: kheen borders hide entirely below 15%, italic accents below 25%
  root.style.setProperty('--at-khee-display', orn < 0.15 ? 'none' : 'block');
  root.style.setProperty('--at-flourish-display', orn < 0.25 ? 'none' : 'inline');
}

function TweaksAtelierApp() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => { applyTweaks(t); }, [t]);

  const paletteOptions = Object.keys(PALETTES).map(k => PALETTES[k].swatch);
  const paletteKeys = Object.keys(PALETTES);
  const typeKeys = Object.keys(TYPES);

  const TS = window.TweaksPanel, TSec = window.TweakSection, TR = window.TweakRow;
  const TSl = window.TweakSlider, TC = window.TweakColor;

  // custom segmented for type (labels show personality, not just words)
  function TypeSeg() {
    return (
      <TR label="Маяг" value={TYPES[t.type].label}>
        <div style={{ display: 'flex', gap: 4, background: '#f1efe9', padding: 3, borderRadius: 10 }}>
          {typeKeys.map(k => {
            const on = t.type === k;
            return (
              <button key={k} onClick={() => setTweak('type', k)} style={{
                flex: 1, padding: '8px 6px', border: 'none', cursor: 'pointer',
                borderRadius: 7, background: on ? '#1a1714' : 'transparent',
                color: on ? '#f4ede1' : '#1a1714',
                fontFamily: k === 'orchin' ? "'DM Sans', sans-serif" : "'Noto Serif', serif",
                fontStyle: k === 'setguul' ? 'italic' : 'normal',
                fontSize: 12, fontWeight: 600, letterSpacing: 0.1,
                transition: 'all .15s',
              }}>
                {TYPES[k].label}
              </button>
            );
          })}
        </div>
      </TR>
    );
  }

  function PaletteSeg() {
    return (
      <TR label="Палитр" value={PALETTES[t.palette].label}>
        <div style={{ display: 'flex', gap: 6 }}>
          {paletteKeys.map(k => {
            const p = PALETTES[k];
            const on = t.palette === k;
            return (
              <button key={k} onClick={() => setTweak('palette', k)} style={{
                flex: 1, padding: 0, border: on ? '2px solid #1a1714' : '2px solid transparent',
                borderRadius: 10, cursor: 'pointer', background: 'transparent',
                display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'stretch',
              }}>
                <div style={{
                  display: 'flex', height: 32, borderRadius: 6, overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}>
                  <div style={{ flex: 2, background: p.swatch[0] }} />
                  <div style={{ flex: 1, background: p.swatch[1] }} />
                  <div style={{ flex: 1, background: p.swatch[2] }} />
                </div>
                <span style={{
                  fontFamily: "'Noto Serif', serif", fontStyle: 'italic',
                  fontSize: 11, color: '#1a1714', textAlign: 'left', paddingLeft: 2,
                }}>{p.label}</span>
              </button>
            );
          })}
        </div>
      </TR>
    );
  }

  return (
    <TS title="Tweaks · Гэр">
      <TSec label="Чанар">
        <PaletteSeg />
        <TypeSeg />
      </TSec>
      <TSec label="Чимэглэл">
        <TSl label="Хэв" value={t.ornament} min={0} max={100} step={5} unit="%"
             onChange={(v) => setTweak('ornament', v)} />
      </TSec>
    </TS>
  );
}

// Mount the panel into its own root so it doesn't interfere with the canvas.
(function mountTweaks() {
  // Apply defaults immediately so first paint is correct.
  applyTweaks(TWEAK_DEFAULTS);
  const host = document.createElement('div');
  host.id = 'tweaks-root';
  document.body.appendChild(host);
  ReactDOM.createRoot(host).render(<TweaksAtelierApp />);
})();
