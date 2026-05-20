// Direction A — Гэр (Ger / "foyer")
// Éditorial chaleureux adapté pour la Mongolie. Noto Serif (cyrillique).
// Palette feutre/terre, motifs khee discrets, typo italique pour respiration.

const atelierTokens = {
  ink: 'var(--at-ink, #1a1714)',
  cream: 'var(--at-cream, #f4ede1)',
  paper: 'var(--at-paper, #faf6ee)',
  sand: 'var(--at-sand, #e8ddc8)',
  terre: 'var(--at-terre, #a8542a)',
  olive: 'var(--at-olive, #5e6b3a)',
  muted: 'var(--at-muted, #8a7f6f)',
  line: 'var(--at-line, #d9cfba)',
  serif: "var(--at-serif, 'Noto Serif', Georgia, serif)",
  sans: "var(--at-sans, 'Noto Sans', system-ui, sans-serif)",
  mono: "'Noto Sans Mono', ui-monospace, monospace",
};
const at = atelierTokens;

// motif khee (border traditionnel mongol simplifié)
function KheeBorder({ color = at.terre, h = 10 }) {
  return (
    <svg width="100%" height={h} viewBox="0 0 200 10" preserveAspectRatio="none" style={{ display: 'block' }}>
      <pattern id="khee" x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
        <path d="M0 5 L5 5 L5 2 L10 2 L10 8 L15 8 L15 5 L20 5" stroke={color} strokeWidth="1.2" fill="none"/>
      </pattern>
      <rect width="200" height="10" fill="url(#khee)"/>
    </svg>
  );
}

function ATFrame({ children, bg = at.paper, time = '9:41', statusInk }) {
  const inkColor = statusInk || at.ink;
  return (
    <div style={{
      width: '100%', height: '100%', background: bg, color: at.ink,
      fontFamily: at.sans, position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        height: 38, padding: '0 22px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
        fontFamily: at.sans, fontWeight: 600, fontSize: 13, color: inkColor,
      }}>
        <span>{time}</span>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: 0.85 }}>
          <svg width="15" height="10" viewBox="0 0 15 10"><path d="M1 9h2V6H1v3zm4 0h2V4H5v5zm4 0h2V2H9v7zm4 0h2V0h-2v9z" fill={inkColor}/></svg>
          <div style={{ width: 22, height: 10, border: `1px solid ${inkColor}`, opacity: 0.6, borderRadius: 2.5, padding: 1, display: 'flex' }}>
            <div style={{ flex: 1, background: inkColor, borderRadius: 1 }} />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{children}</div>
    </div>
  );
}

function ATPlaceholder({ label, h = 160, tone = 'sand', radius = 0 }) {
  const bg = tone === 'sand' ? at.sand : tone === 'olive' ? '#9aa478' : tone === 'terre' ? '#c98869' : '#bfb19a';
  return (
    <div style={{
      width: '100%', height: h, borderRadius: radius, position: 'relative', overflow: 'hidden',
      background: `repeating-linear-gradient(135deg, ${bg}, ${bg} 8px, ${bg}dd 8px, ${bg}dd 16px)`,
      display: 'flex', alignItems: 'flex-end', padding: 10,
    }}>
      {label && <span style={{
        fontFamily: at.mono, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase',
        color: at.ink, background: at.cream, padding: '3px 6px', borderRadius: 2,
      }}>{label}</span>}
    </div>
  );
}

function Brief() {
  return (
    <div style={{
      width: '100%', height: '100%', background: at.paper, color: at.ink,
      padding: 48, fontFamily: at.sans, boxSizing: 'border-box', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      <div>
        <div style={{ fontFamily: at.mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: at.muted }}>Брийф · 2026 · Монгол</div>
        <h1 style={{ fontFamily: at.serif, fontWeight: 500, fontSize: 48, lineHeight: 1.05, margin: '12px 0 0', letterSpacing: -1.2 }}>
          <em style={{ fontStyle: 'italic', color: at.terre }}>tusch</em> — Монголын<br/>үйлчилгээний зах зээл.
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, fontSize: 13, lineHeight: 1.5 }}>
        <div>
          <div style={{ fontFamily: at.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: at.muted, marginBottom: 8 }}>Зорилтот хэрэглэгч</div>
          <p style={{ margin: 0 }}>Улаанбаатар хот болон томоохон аймгуудын оршин суугчид. Засвар, цэвэрлэгээ, хичээл, дасгал, гоо сайхан, асрамжийн үйлчилгээ хайж буй хүмүүс.</p>
        </div>
        <div>
          <div style={{ fontFamily: at.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: at.muted, marginBottom: 8 }}>Бэрхшээл</div>
          <p style={{ margin: 0 }}>Одоогийн дизайн нь хэт энгийн, өвөрмөц шинж чанаргүй, итгэл үнэмшил төрүүлэхгүй байна.</p>
        </div>
      </div>

      <div style={{ height: 1, background: at.line }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: at.mono, fontSize: 11, letterSpacing: 1, color: at.muted }}>А</span>
            <span style={{ fontFamily: at.serif, fontWeight: 500, fontSize: 26, fontStyle: 'italic' }}>Гэр</span>
          </div>
          <p style={{ fontSize: 12.5, lineHeight: 1.5, margin: '0 0 12px' }}>
            Найдвартай, дулаахан. Уламжлалт хээгийн нөлөөтэй, нааш дэвтэр шиг сэтгэгдэл.
          </p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {[at.paper, at.cream, at.sand, at.terre, at.olive, at.ink].map((c, i) => (
              <div key={i} style={{ width: 30, height: 44, background: c, border: c === at.paper ? `1px solid ${at.line}` : 'none' }} />
            ))}
          </div>
          <div style={{ fontFamily: at.mono, fontSize: 10, color: at.muted, lineHeight: 1.6 }}>
            Noto Serif · Noto Sans<br/>Уламжлалт хээ · засварлагдсан
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: at.mono, fontSize: 11, letterSpacing: 1, color: at.muted }}>Б</span>
            <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 26, letterSpacing: -1 }}>ХҮЧИТ</span>
          </div>
          <p style={{ fontSize: 12.5, lineHeight: 1.5, margin: '0 0 12px' }}>
            Зоригтой, орчин үеийн. Хөх тэнгэрийн өнгө + шар тэмдэг. Их үсгийн тод тоглолт.
          </p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {['#1a3a8a', '#f5f3ee', '#f5d800', '#1a1a1a', '#d8d2c4', '#c8302c'].map((c, i) => (
              <div key={i} style={{ width: 30, height: 44, background: c, border: c === '#f5f3ee' ? '1px solid #ddd' : 'none' }} />
            ))}
          </div>
          <div style={{ fontFamily: at.mono, fontSize: 10, color: at.muted, lineHeight: 1.6 }}>
            Archivo Black · Archivo<br/>Хөх тэнгэр · Соёмбо
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', fontFamily: at.mono, fontSize: 10, color: at.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
        9 дэлгэц · iPhone 360 × 740 · Кирилл
      </div>
    </div>
  );
}

function Cover() {
  return (
    <ATFrame bg={at.cream}>
      <div style={{ flex: 1, padding: '32px 24px 24px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: at.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: at.muted }}>Чиглэл А</div>
        <div style={{ fontFamily: at.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: at.muted, marginTop: 2 }}>Гэр · 2026</div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 20 }}>
          <div style={{ marginBottom: 14, opacity: 0.5 }}><KheeBorder /></div>
          <div style={{
            fontFamily: at.serif, fontSize: 110, fontWeight: 400,
            letterSpacing: -5, lineHeight: 0.85, color: at.ink,
          }}>
            tus<span style={{ fontStyle: 'italic', color: at.terre }}>ch</span>
            <span style={{ color: at.terre }}>.</span>
          </div>
          <div style={{ marginTop: 20, fontFamily: at.serif, fontSize: 17, lineHeight: 1.35, fontStyle: 'italic', color: at.ink }}>
            Танай хорооллын<br/>чанартай үйлчилгээ.
          </div>
          <div style={{ marginTop: 20, opacity: 0.5 }}><KheeBorder /></div>
        </div>

        <div style={{ borderTop: `1px solid ${at.line}`, paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontFamily: at.mono, fontSize: 9, color: at.muted, letterSpacing: 0.5 }}>
          <div>
            <div style={{ textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Үсэг</div>
            <div style={{ color: at.ink, fontFamily: at.serif, fontSize: 14, fontStyle: 'italic' }}>Noto Serif</div>
            <div style={{ color: at.ink, fontFamily: at.sans, fontSize: 11 }}>Noto Sans</div>
          </div>
          <div>
            <div style={{ textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Өнгө</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[at.paper, at.sand, at.terre, at.olive, at.ink].map((c, i) => (
                <div key={i} style={{ width: 18, height: 18, background: c, border: c === at.paper ? `1px solid ${at.line}` : 'none' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </ATFrame>
  );
}

function ATTabBar({ active = 'home' }) {
  const tabs = [
    { id: 'home', label: 'Нүүр', icon: 'M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z' },
    { id: 'search', label: 'Хайх', icon: 'M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-5-5' },
    { id: 'create', label: 'Нийтлэх', icon: 'M12 5v14M5 12h14' },
    { id: 'msg', label: 'Зурвас', icon: 'M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H8l-5 4V5z' },
    { id: 'me', label: 'Би', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 0116 0' },
  ];
  return (
    <div style={{
      borderTop: `1px solid ${at.line}`, background: at.paper,
      padding: '8px 8px 14px', display: 'flex', justifyContent: 'space-around', flexShrink: 0,
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: on ? at.ink : at.muted }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d={t.icon}/>
            </svg>
            <span style={{ fontSize: 9.5, fontFamily: at.sans, fontWeight: on ? 600 : 500, letterSpacing: 0.2 }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Home() {
  const categories = [
    { label: 'Засвар', tone: 'terre' },
    { label: 'Цэвэрлэгээ', tone: 'olive' },
    { label: 'Хичээл', tone: 'sand' },
    { label: 'Дасгал', tone: 'beige' },
    { label: 'Гоо сайхан', tone: 'terre' },
    { label: 'Асрамж', tone: 'olive' },
  ];
  return (
    <ATFrame>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '4px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: at.serif, fontSize: 26, fontWeight: 500, letterSpacing: -1 }}>
            tus<span style={{ fontStyle: 'italic', color: at.terre }}>ch</span><span style={{ color: at.terre }}>.</span>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', color: at.ink }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 10-12 0v3a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"/></svg>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: at.sand, fontFamily: at.serif, fontStyle: 'italic', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>О</div>
          </div>
        </div>

        <div style={{ overflow: 'auto', flex: 1 }}>
          <div style={{ padding: '0 22px 22px' }}>
            <div style={{ fontFamily: at.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: at.muted, marginBottom: 10 }}>Сайн байна уу, Оюун-Эрдэнэ</div>
            <h1 style={{
              fontFamily: at.serif, fontSize: 32, fontWeight: 400, lineHeight: 1.1,
              letterSpacing: -1, margin: 0, color: at.ink,
            }}>
              Танд ямар <em style={{ fontStyle: 'italic', color: at.terre }}>үйлчилгээ</em><br/>хэрэгтэй вэ?
            </h1>
            <div style={{
              marginTop: 18, background: at.paper, border: `1px solid ${at.ink}`,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={at.ink} strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <span style={{ flex: 1, color: at.muted, fontSize: 14 }}>Сантехник, иогийн багш…</span>
              <span style={{ fontFamily: at.mono, fontSize: 10, color: at.muted, letterSpacing: 1 }}>УБ · СБД</span>
            </div>
          </div>

          <div style={{ padding: '0 22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontFamily: at.serif, fontSize: 16, fontWeight: 500, margin: 0, fontStyle: 'italic' }}>Ангилал</h2>
              <span style={{ fontFamily: at.mono, fontSize: 10, color: at.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Бүгд →</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {categories.map((c, i) => (
                <div key={i} style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden' }}>
                  <ATPlaceholder h="100%" tone={c.tone} />
                  <div style={{
                    position: 'absolute', left: 8, bottom: 8, right: 8,
                    fontFamily: at.serif, fontSize: 13, fontStyle: 'italic',
                    color: at.cream, textShadow: '0 1px 4px rgba(0,0,0,.4)',
                  }}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: at.cream, padding: '18px 22px 22px' }}>
            <div style={{ marginBottom: 14, opacity: 0.4 }}><KheeBorder color={at.ink} /></div>
            <div style={{ fontFamily: at.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: at.muted, marginBottom: 8 }}>Онцлох · №4</div>
            <h2 style={{ fontFamily: at.serif, fontSize: 22, fontWeight: 500, lineHeight: 1.15, margin: '0 0 12px', letterSpacing: -0.5 }}>
              Сүхбаатар дүүргийн <em style={{ fontStyle: 'italic' }}>шилдэг</em> мэргэжилтнүүд.
            </h2>
            <ATPlaceholder h={110} tone="terre" />
          </div>

          <div style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontFamily: at.serif, fontSize: 16, fontWeight: 500, margin: 0, fontStyle: 'italic' }}>Ойролцоо</h2>
              <span style={{ fontFamily: at.mono, fontSize: 10, color: at.muted, letterSpacing: 1 }}>1,2 КМ</span>
            </div>
            {[
              { name: 'Бат-Эрдэнэ Б.', svc: 'Сантехникч · 12 жилийн туршлага', rate: '4,9', tone: 'sand' },
              { name: 'Цэцэгмаа Д.', svc: 'Хийлийн хичээл, эхлэгчээс ахисан', rate: '5,0', tone: 'olive' },
            ].map((p, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, padding: '14px 0',
                borderTop: `1px solid ${at.line}`, alignItems: 'center',
              }}>
                <div style={{ width: 56, height: 56, flexShrink: 0 }}><ATPlaceholder h={56} tone={p.tone} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: at.serif, fontSize: 16, fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: at.muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.svc}</div>
                </div>
                <div style={{ fontFamily: at.serif, fontSize: 16, fontStyle: 'italic' }}>★ {p.rate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ATTabBar active="home" />
    </ATFrame>
  );
}

function Search() {
  const items = [
    { name: 'Паркетан шал · 22 м²', who: 'Мөнхбат Д. · УБ СБД', price: '480,000₮-аас', rate: '4,9', tone: 'terre' },
    { name: 'Бойлер засвар, ус алдаа', who: 'Бат-Эрдэнэ Б. · УБ СБД', price: '24 цагт үнэлгээ', rate: '4,8', tone: 'sand' },
    { name: 'IKEA шкаф угсралт', who: 'Сүхбат К. · УБ ХУД', price: '60,000₮/цаг', rate: '5,0', tone: 'olive' },
    { name: 'Зочны өрөө будалт 30 м²', who: 'Эрдэнэт Студи · УБ', price: 'Тохиролцоно', rate: '4,7', tone: 'terre' },
  ];
  return (
    <ATFrame>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '4px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={at.ink} strokeWidth="1.8"><path d="M15 18l-6-6 6-6"/></svg>
            <div style={{ flex: 1, background: at.paper, border: `1px solid ${at.ink}`, padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: at.mono, fontSize: 10, color: at.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Q</span>
              <span style={{ fontSize: 13, color: at.ink }}>засвар</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {['Бүгд', 'Сантехник', 'Цахилгаан', 'Будалт', 'Мужаан'].map((c, i) => (
              <span key={i} style={{
                fontFamily: at.mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
                padding: '6px 11px',
                background: i === 0 ? at.ink : 'transparent',
                color: i === 0 ? at.cream : at.ink,
                border: i === 0 ? 'none' : `1px solid ${at.line}`,
                whiteSpace: 'nowrap',
              }}>{c}</span>
            ))}
          </div>
        </div>

        <div style={{ padding: '14px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `1px solid ${at.line}` }}>
          <h2 style={{ fontFamily: at.serif, fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: -0.5 }}>
            <em style={{ fontStyle: 'italic' }}>148</em> зар
          </h2>
          <span style={{ fontFamily: at.mono, fontSize: 10, color: at.muted, letterSpacing: 1, textTransform: 'uppercase' }}>↓ Тохиромж</span>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {items.map((it, i) => (
            <div key={i} style={{
              padding: '16px 20px', borderTop: `1px solid ${at.line}`,
              display: 'flex', gap: 14,
            }}>
              <div style={{ width: 88, height: 88, flexShrink: 0 }}><ATPlaceholder h={88} tone={it.tone} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ fontFamily: at.serif, fontSize: 16, fontWeight: 500, lineHeight: 1.25, flex: 1 }}>{it.name}</div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={at.ink} strokeWidth="1.6" style={{ flexShrink: 0, marginTop: 4 }}>
                    <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 22l7.8-7.8 1-1a5.5 5.5 0 000-7.8z"/>
                  </svg>
                </div>
                <div style={{ fontSize: 11.5, color: at.muted, marginTop: 4 }}>{it.who}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <div style={{ fontFamily: at.serif, fontSize: 13, fontStyle: 'italic' }}>{it.price}</div>
                  <div style={{ fontFamily: at.mono, fontSize: 10, color: at.terre, letterSpacing: 1 }}>★ {it.rate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ATTabBar active="search" />
    </ATFrame>
  );
}

function Listing() {
  return (
    <ATFrame>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ position: 'relative' }}>
          <ATPlaceholder h={260} tone="terre" />
          <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: at.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={at.ink} strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['↗','♡'].map((s, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: at.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: at.serif, fontSize: 16 }}>{s}</div>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 12, left: 16, fontFamily: at.mono, fontSize: 10, color: at.cream, background: at.ink, padding: '4px 8px', letterSpacing: 1 }}>1 / 6</div>
        </div>

        <div style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: at.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: at.terre }}>Засвар · Паркетан шал</div>
          <h1 style={{
            fontFamily: at.serif, fontSize: 26, fontWeight: 400, lineHeight: 1.15,
            letterSpacing: -0.8, margin: '8px 0 0',
          }}>
            <em style={{ fontStyle: 'italic' }}>22 м²</em> зочны өрөө, унтлагын өрөөнд паркетан шал тавих.
          </h1>

          <div style={{ display: 'flex', gap: 18, marginTop: 18, fontSize: 12, color: at.muted, paddingBottom: 18, borderBottom: `1px solid ${at.line}` }}>
            <span><b style={{ color: at.ink, fontWeight: 600 }}>УБ СБД</b> · 0,8 км</span>
            <span>Бэлэн <b style={{ color: at.ink, fontWeight: 600 }}>энэ долоо хоногт</b></span>
          </div>

          <div style={{ padding: '18px 0', borderBottom: `1px solid ${at.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: at.mono, fontSize: 10, color: at.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Эхлэх үнэ</div>
              <div style={{ fontFamily: at.serif, fontSize: 30, letterSpacing: -1, marginTop: 2 }}>480,000<em style={{ fontStyle: 'italic', fontSize: 18 }}>₮</em></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: at.mono, fontSize: 10, color: at.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Үнэлгээ</div>
              <div style={{ fontFamily: at.serif, fontSize: 16, fontStyle: 'italic', marginTop: 2 }}>24 цагт</div>
            </div>
          </div>

          <div style={{ padding: '18px 0' }}>
            <p style={{ fontFamily: at.serif, fontSize: 15, lineHeight: 1.5, margin: 0, color: at.ink }}>
              <span style={{ fontFamily: at.serif, fontSize: 38, float: 'left', lineHeight: 0.9, paddingTop: 4, paddingRight: 6 }}>З</span>
              очны өрөө, унтлагын өрөө. Царс модон паркетыг өөрөө хангана. Шалны бэлтгэл, бортого орно. Хүнд тавилга шилжүүлэхэд тусална. Цэвэрхэн ажилладаг, дурсамж бэлэн.
            </p>
          </div>

          <div style={{ padding: '14px 0', borderTop: `1px solid ${at.line}`, borderBottom: `1px solid ${at.line}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden' }}><ATPlaceholder h={52} tone="sand" /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: at.serif, fontSize: 16, fontWeight: 500 }}>Мөнхбат Д.</div>
              <div style={{ fontSize: 11.5, color: at.muted }}>Дархан · 2021 оноос гишүүн</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, fontFamily: at.mono, fontSize: 10, color: at.muted }}>
                <span><b style={{ color: at.terre }}>★ 4,9</b> · 142 сэтгэгдэл</span>
                <span style={{ color: at.olive }}>✓ Баталгаажсан</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 20px 14px', borderTop: `1px solid ${at.line}`, background: at.paper, display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, padding: '14px 16px', border: `1px solid ${at.ink}`, fontFamily: at.serif, fontSize: 14, fontStyle: 'italic', textAlign: 'center' }}>
          Зурвас
        </div>
        <div style={{ flex: 1.4, padding: '14px 16px', background: at.ink, color: at.cream, fontFamily: at.serif, fontSize: 14, textAlign: 'center', fontWeight: 500 }}>
          Санал илгээх
        </div>
      </div>
    </ATFrame>
  );
}

function Provider() {
  return (
    <ATFrame bg={at.cream}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ background: at.cream, padding: '20px 22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={at.ink} strokeWidth="1.8"><path d="M15 18l-6-6 6-6"/></svg>
            <span style={{ fontFamily: at.mono, fontSize: 10, color: at.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Профайл</span>
            <span>⋯</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: 22 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              <ATPlaceholder h={80} tone="terre" />
            </div>
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <h1 style={{ fontFamily: at.serif, fontSize: 26, fontWeight: 400, margin: 0, letterSpacing: -0.8, lineHeight: 1.05 }}>
                Мөнхбат <em style={{ fontStyle: 'italic' }}>Дорж</em>
              </h1>
              <div style={{ fontFamily: at.serif, fontSize: 13, fontStyle: 'italic', color: at.muted, marginTop: 4 }}>Паркетчин дархан, УБ Сүхбаатар</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 22, borderTop: `1px solid ${at.line}`, borderBottom: `1px solid ${at.line}` }}>
            {[['142', 'сэтгэгдэл'], ['4,9', 'үнэлгээ'], ['5 жил', 'tusch-д']].map(([n, l], i) => (
              <div key={i} style={{ padding: '14px 6px', textAlign: 'center', borderRight: i < 2 ? `1px solid ${at.line}` : 'none' }}>
                <div style={{ fontFamily: at.serif, fontSize: 22, fontStyle: 'italic' }}>{n}</div>
                <div style={{ fontFamily: at.mono, fontSize: 9, color: at.muted, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: at.paper, padding: '22px' }}>
          <div style={{ fontFamily: at.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: at.muted, marginBottom: 8 }}>Тухай</div>
          <p style={{ fontFamily: at.serif, fontSize: 14, lineHeight: 1.5, margin: 0 }}>
            Арван таван жилийн турш паркет тавьж, өнгөлж, лакдан ирлээ. Ганцаараа ажилладаг, цаг гарга, шал нь өөрөө миний өмнөөс ярина.
          </p>

          <div style={{ marginTop: 22, fontFamily: at.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: at.muted, marginBottom: 12 }}>Чадвар</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Паркетан шал', 'Цул мод', 'Бортого', 'Цавууны угсралт', 'Лакдалт'].map((c, i) => (
              <span key={i} style={{ fontFamily: at.serif, fontSize: 13, fontStyle: 'italic', padding: '5px 11px', border: `1px solid ${at.line}` }}>{c}</span>
            ))}
          </div>

          <div style={{ marginTop: 22, fontFamily: at.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: at.muted, marginBottom: 12 }}>Хийсэн ажил · 24</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            {['terre','olive','sand','sand','terre','olive'].map((t, i) => (
              <div key={i} style={{ aspectRatio: '1' }}><ATPlaceholder h="100%" tone={t} /></div>
            ))}
          </div>

          <div style={{ marginTop: 22, fontFamily: at.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: at.muted, marginBottom: 12 }}>Сүүлийн сэтгэгдэл</div>
          <div style={{ borderTop: `1px solid ${at.line}`, padding: '14px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: at.serif, fontSize: 14, fontWeight: 500 }}>Сарангэрэл М.</div>
              <div style={{ fontFamily: at.mono, fontSize: 10, color: at.terre }}>★★★★★</div>
            </div>
            <p style={{ fontFamily: at.serif, fontSize: 13, lineHeight: 1.45, margin: '6px 0 0', fontStyle: 'italic', color: at.ink }}>
              «&nbsp;Цэвэрхэн ажил, цагтаа ирсэн, үр дүн хүлээлтээс илүү. Зөвлөж байна.&nbsp;»
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 20px 14px', borderTop: `1px solid ${at.line}`, background: at.paper }}>
        <div style={{ padding: '14px', background: at.ink, color: at.cream, fontFamily: at.serif, fontSize: 14, textAlign: 'center', fontWeight: 500 }}>
          Мөнхбаттай холбогдох
        </div>
      </div>
    </ATFrame>
  );
}

function Messages() {
  const convos = [
    { name: 'Мөнхбат Д.', svc: 'Паркетан шал 22 м²', last: 'Сайн уу, Мягмарт 9 цагт хэмжихээр ирж болно.', time: '14:32', unread: true, tone: 'terre' },
    { name: 'Цэцэгмаа Д.', svc: 'Хийлийн хичээл', last: 'Энэ долоо хоногийн чөлөөт цагуудыг илгээлээ.', time: '12:08', unread: true, tone: 'olive' },
    { name: 'Сүхбат К.', svc: 'Pax шкаф', last: 'Та: Баярлалаа, Бямба гарагт уулзъя.', time: 'Өчигдөр', unread: false, tone: 'sand' },
    { name: 'Эрдэнэт Студи', svc: 'Зочны өрөө будалт', last: 'Өнөө орой үнэлгээгээ илгээнэ.', time: 'Дав.', unread: false, tone: 'terre' },
    { name: 'Уянга В.', svc: 'Муур асрах', last: 'Та: Хэрэв 14-нд бол.', time: '12 V', unread: false, tone: 'olive' },
  ];
  return (
    <ATFrame>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '6px 22px 16px' }}>
          <div style={{ fontFamily: at.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: at.muted }}>Зурвас</div>
          <h1 style={{ fontFamily: at.serif, fontSize: 36, fontWeight: 400, margin: '4px 0 0', letterSpacing: -1.2, lineHeight: 1.05 }}>
            <em style={{ fontStyle: 'italic' }}>5</em> яриа
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '0 22px 14px' }}>
          {['Бүгд', 'Уншаагүй', 'Саналтай'].map((t, i) => (
            <span key={i} style={{
              fontFamily: at.mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
              padding: '6px 11px',
              background: i === 0 ? at.ink : 'transparent',
              color: i === 0 ? at.cream : at.ink,
              border: i === 0 ? 'none' : `1px solid ${at.line}`,
            }}>{t}</span>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {convos.map((c, i) => (
            <div key={i} style={{
              padding: '14px 22px', borderTop: `1px solid ${at.line}`, display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                <ATPlaceholder h={44} tone={c.tone} />
                {c.unread && <div style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, background: at.terre, borderRadius: '50%', border: `2px solid ${at.paper}` }}/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontFamily: at.serif, fontSize: 16, fontWeight: c.unread ? 600 : 500 }}>{c.name}</div>
                  <div style={{ fontFamily: at.mono, fontSize: 9, color: at.muted, letterSpacing: 0.5, flexShrink: 0 }}>{c.time}</div>
                </div>
                <div style={{ fontFamily: at.serif, fontSize: 12, fontStyle: 'italic', color: at.terre, marginTop: 1 }}>{c.svc}</div>
                <div style={{ fontSize: 12.5, color: c.unread ? at.ink : at.muted, marginTop: 4, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{c.last}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ATTabBar active="msg" />
    </ATFrame>
  );
}

function Conversation() {
  return (
    <ATFrame>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ borderBottom: `1px solid ${at.line}`, padding: '6px 18px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={at.ink} strokeWidth="1.8"><path d="M15 18l-6-6 6-6"/></svg>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden' }}><ATPlaceholder h={36} tone="terre" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: at.serif, fontSize: 15, fontWeight: 500 }}>Мөнхбат Дорж</div>
            <div style={{ fontFamily: at.serif, fontSize: 11, fontStyle: 'italic', color: at.terre }}>Паркетан шал 22 м²</div>
          </div>
          <span style={{ fontSize: 18, color: at.muted }}>⋯</span>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, background: at.paper }}>
          <div style={{ textAlign: 'center', fontFamily: at.mono, fontSize: 9, color: at.muted, letterSpacing: 1.5 }}>МЯГ. 4 V · 14:30</div>

          <div style={{ alignSelf: 'flex-start', maxWidth: '78%', background: at.cream, padding: '11px 14px', fontSize: 13.5, lineHeight: 1.45, fontFamily: at.serif }}>
            Сайн байна уу Мөнхбат, энэ долоо хоногт хэмжих бэлэн үү? Байр 3 давхарт, цахилгаан шатгүй.
          </div>

          <div style={{ alignSelf: 'flex-end', maxWidth: '78%', background: at.ink, color: at.cream, padding: '11px 14px', fontSize: 13.5, lineHeight: 1.45, fontFamily: at.serif }}>
            Сайн уу, Мягмарт 9 цагт ирж болно. 3 давхар асуудалгүй.
          </div>

          <div style={{ alignSelf: 'flex-end', width: '82%', background: at.paper, border: `1px solid ${at.ink}`, padding: 14 }}>
            <div style={{ fontFamily: at.mono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: at.terre }}>Санал · санал болгосон</div>
            <div style={{ fontFamily: at.serif, fontSize: 16, fontWeight: 500, marginTop: 6, lineHeight: 1.25 }}>
              Паркетан шал <em style={{ fontStyle: 'italic' }}>22 м²</em>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: `1px solid ${at.line}` }}>
              <div>
                <div style={{ fontFamily: at.mono, fontSize: 9, color: at.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Нийт</div>
                <div style={{ fontFamily: at.serif, fontSize: 22, fontStyle: 'italic' }}>520,000₮</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: at.mono, fontSize: 9, color: at.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Хугацаа</div>
                <div style={{ fontFamily: at.serif, fontSize: 14, marginTop: 4 }}>3 өдөр</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <div style={{ flex: 1, padding: '9px', textAlign: 'center', border: `1px solid ${at.line}`, fontFamily: at.serif, fontSize: 12, fontStyle: 'italic' }}>Татгалзах</div>
              <div style={{ flex: 1.6, padding: '9px', textAlign: 'center', background: at.ink, color: at.cream, fontFamily: at.serif, fontSize: 12, fontWeight: 500 }}>Зөвшөөрөх</div>
            </div>
          </div>

          <div style={{ alignSelf: 'flex-start', maxWidth: '78%', background: at.cream, padding: '11px 14px', fontSize: 13.5, lineHeight: 1.45, fontFamily: at.serif }}>
            Сайн байна, үнэлгээг эргэн харж өнөө орой хариу өгье.
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${at.line}`, padding: '10px 14px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 34, height: 34, border: `1px solid ${at.line}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: at.serif, fontSize: 18 }}>+</span>
          </div>
          <div style={{ flex: 1, padding: '10px 14px', border: `1px solid ${at.line}`, fontFamily: at.serif, fontSize: 13, fontStyle: 'italic', color: at.muted }}>
            Зурвас бичих…
          </div>
        </div>
      </div>
    </ATFrame>
  );
}

function Create() {
  return (
    <ATFrame bg={at.cream}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '4px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 22, color: at.ink }}>×</span>
          <span style={{ fontFamily: at.mono, fontSize: 10, color: at.muted, letterSpacing: 1.5, textTransform: 'uppercase' }}>Үе шат 2 / 4</span>
          <span style={{ fontFamily: at.mono, fontSize: 10, color: at.terre, letterSpacing: 1.5, textTransform: 'uppercase' }}>Ноорог</span>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '12px 22px 24px' }}>
          <h1 style={{ fontFamily: at.serif, fontSize: 28, fontWeight: 400, lineHeight: 1.15, letterSpacing: -0.8, margin: 0 }}>
            Юу хэрэгтэйгээ <em style={{ fontStyle: 'italic' }}>тайлбарла.</em>
          </h1>
          <p style={{ fontFamily: at.serif, fontSize: 13, color: at.muted, fontStyle: 'italic', margin: '8px 0 24px' }}>
            Илүү тодорхой бичих тусам мэргэжилтнүүд илүү сайн санал болгоно.
          </p>

          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${at.line}` }}>
            <div style={{ fontFamily: at.mono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: at.muted, marginBottom: 8 }}>Гарчиг</div>
            <div style={{ fontFamily: at.serif, fontSize: 17, lineHeight: 1.35, color: at.ink }}>
              22 м² зочны өрөөнд паркетан шал тавих<span style={{ background: at.ink, width: 2, height: 22, display: 'inline-block', marginLeft: 1, verticalAlign: 'middle' }}/>
            </div>
          </div>

          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${at.line}` }}>
            <div style={{ fontFamily: at.mono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: at.muted, marginBottom: 10 }}>Ангилал</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[['Засвар', true], ['Цэвэрлэгээ', false], ['Хичээл', false], ['Дасгал', false], ['Гоо сайхан', false], ['Асрамж', false]].map(([l, on], i) => (
                <span key={i} style={{
                  fontFamily: at.serif, fontStyle: 'italic', fontSize: 13,
                  padding: '6px 12px',
                  background: on ? at.ink : 'transparent',
                  color: on ? at.cream : at.ink,
                  border: on ? 'none' : `1px solid ${at.line}`,
                }}>{l}</span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${at.line}` }}>
            <div style={{ fontFamily: at.mono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: at.muted, marginBottom: 8 }}>Тайлбар</div>
            <div style={{ fontFamily: at.serif, fontSize: 14, lineHeight: 1.55, color: at.ink }}>
              Зочны өрөө, унтлагын өрөө. Царс модыг өөрөө худалдаж авсан. Бортого тавих хэрэгтэй. 3 давхар, цахилгаан шатгүй. 6 сарын эхний долоо хоногт хийвэл сайн.
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: at.mono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: at.muted, marginBottom: 10 }}>Зураг · 2 / 6</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 80, height: 80 }}><ATPlaceholder h={80} tone="terre" /></div>
              <div style={{ width: 80, height: 80 }}><ATPlaceholder h={80} tone="sand" /></div>
              <div style={{ width: 80, height: 80, border: `1px dashed ${at.muted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: at.muted, fontFamily: at.serif }}>+</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 20px 14px', borderTop: `1px solid ${at.line}`, background: at.cream, display: 'flex', gap: 10 }}>
          <div style={{ padding: '14px 18px', border: `1px solid ${at.ink}`, fontFamily: at.serif, fontSize: 14, fontStyle: 'italic' }}>← Буцах</div>
          <div style={{ flex: 1, padding: '14px 16px', background: at.ink, color: at.cream, fontFamily: at.serif, fontSize: 14, textAlign: 'center', fontWeight: 500 }}>
            Үргэлжлүүлэх
          </div>
        </div>
      </div>
    </ATFrame>
  );
}

function Dashboard() {
  return (
    <ATFrame>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '6px 22px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: at.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: at.muted }}>Миний хэсэг</div>
            <h1 style={{ fontFamily: at.serif, fontSize: 30, fontWeight: 400, margin: '4px 0 0', letterSpacing: -1, lineHeight: 1.1 }}>
              Сайн уу, <em style={{ fontStyle: 'italic' }}>Оюун.</em>
            </h1>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden' }}><ATPlaceholder h={44} tone="olive" /></div>
        </div>

        <div style={{ margin: '0 22px 22px', background: at.ink, color: at.cream, padding: 20 }}>
          <div style={{ fontFamily: at.mono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: at.sand }}>Идэвхтэй хүсэлт</div>
          <div style={{ fontFamily: at.serif, fontSize: 22, lineHeight: 1.2, marginTop: 8 }}>
            Паркетан шал <em style={{ fontStyle: 'italic' }}>22 м²</em>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, paddingTop: 14, borderTop: `1px solid rgba(244,237,225,0.15)` }}>
            <div>
              <div style={{ fontFamily: at.mono, fontSize: 9, color: at.sand, letterSpacing: 1 }}>САНАЛ</div>
              <div style={{ fontFamily: at.serif, fontSize: 26, fontStyle: 'italic' }}>4</div>
            </div>
            <div>
              <div style={{ fontFamily: at.mono, fontSize: 9, color: at.sand, letterSpacing: 1 }}>ҮЗСЭН</div>
              <div style={{ fontFamily: at.serif, fontSize: 26, fontStyle: 'italic' }}>87</div>
            </div>
            <div>
              <div style={{ fontFamily: at.mono, fontSize: 9, color: at.sand, letterSpacing: 1 }}>ХУГАЦАА</div>
              <div style={{ fontFamily: at.serif, fontSize: 16, fontStyle: 'italic', marginTop: 8 }}>2 өдөр</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 22px 16px' }}>
          <div style={{ fontFamily: at.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: at.muted, marginBottom: 4 }}>Үйл ажиллагаа</div>
        </div>

        {[
          ['Хүлээн авсан санал', '4', 'Мөнхбат Д., Эрдэнэт Студи, +2'],
          ['Яриа', '5', '2 уншаагүй'],
          ['Дуртай', '12', 'Бат-Эрдэнэ Б., Цэцэгмаа Д., +10'],
          ['Миний зар', '2', '1 идэвхтэй · 1 архивласан'],
          ['Үлдээсэн сэтгэгдэл', '7', 'Дундаж 4,9'],
        ].map(([title, count, sub], i) => (
          <div key={i} style={{
            padding: '16px 22px', borderTop: `1px solid ${at.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontFamily: at.serif, fontSize: 16, fontWeight: 500 }}>{title}</div>
              <div style={{ fontSize: 12, color: at.muted, marginTop: 2 }}>{sub}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: at.serif, fontSize: 22, fontStyle: 'italic' }}>{count}</span>
              <svg width="10" height="14" viewBox="0 0 8 14" style={{ color: at.muted }} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l6 6-6 6"/></svg>
            </div>
          </div>
        ))}
      </div>
      <ATTabBar active="me" />
    </ATFrame>
  );
}

window.AtelierScreens = { Brief, Cover, Home, Search, Listing, Provider, Messages, Conversation, Create, Dashboard };
