// Atelier — Desktop (1440 × 900)
// Conserve le wordmark et la grammaire Atelier (Noto Serif italique, terre, crème)
// Plus de couleur: ajout cobalt, rose terracotta, ocre — utilisés en blocs francs.

const atd = {
  ink: 'var(--at-ink, #1a1714)',
  cream: 'var(--at-cream, #f4ede1)',
  paper: 'var(--at-paper, #faf6ee)',
  sand: 'var(--at-sand, #e8ddc8)',
  terre: 'var(--at-terre, #a8542a)',
  rose: 'var(--at-rose, #d97a5f)',
  ocre: 'var(--at-ocre, #e0a830)',
  olive: 'var(--at-olive, #5e6b3a)',
  cobalt: 'var(--at-cobalt, #264a8b)',
  pourpre: 'var(--at-pourpre, #7a2b3a)',
  muted: 'var(--at-muted, #8a7f6f)',
  line: 'var(--at-line, #d9cfba)',
  serif: "var(--at-serif, 'Noto Serif', Georgia, serif)",
  sans: "var(--at-sans, 'Noto Sans', system-ui, sans-serif)",
  mono: "'Noto Sans Mono', ui-monospace, monospace",
};

function KheeD({ color = atd.terre, h = 12 }) {
  return (
    <svg width="100%" height={h} viewBox="0 0 200 12" preserveAspectRatio="none" style={{ display: 'block' }}>
      <pattern id={`kheed-${color.slice(1)}`} x="0" y="0" width="24" height="12" patternUnits="userSpaceOnUse">
        <path d="M0 6 L6 6 L6 2 L12 2 L12 10 L18 10 L18 6 L24 6" stroke={color} strokeWidth="1.4" fill="none"/>
      </pattern>
      <rect width="200" height="12" fill={`url(#kheed-${color.slice(1)})`}/>
    </svg>
  );
}

function Wordmark({ size = 26, dotColor = atd.terre, ital = atd.terre }) {
  return (
    <span style={{
      fontFamily: atd.serif, fontSize: size, fontWeight: 500,
      letterSpacing: -size * 0.04, color: atd.ink, lineHeight: 1,
    }}>
      tus<span style={{ fontStyle: 'italic', color: ital }}>ch</span>
      <span style={{ color: dotColor }}>.</span>
    </span>
  );
}

function Block({ tone = 'sand', children, style }) {
  const tones = {
    sand: atd.sand, paper: atd.paper, cream: atd.cream,
    terre: atd.terre, rose: atd.rose, ocre: atd.ocre,
    olive: atd.olive, cobalt: atd.cobalt, pourpre: atd.pourpre, ink: atd.ink,
  };
  return <div style={{ background: tones[tone] || tone, ...style }}>{children}</div>;
}

function ImgD({ tone = 'sand', h = 200, label, dense = false }) {
  const colors = {
    sand: ['#e8ddc8', '#d4c2a3'],
    terre: ['#a8542a', '#8a4220'],
    rose: ['#d97a5f', '#c0654c'],
    ocre: ['#e0a830', '#c89020'],
    olive: ['#5e6b3a', '#4a5530'],
    cobalt: ['#264a8b', '#1a3870'],
    pourpre: ['#7a2b3a', '#5e1f2c'],
    cream: ['#f4ede1', '#e8ddc8'],
  };
  const [a, b] = colors[tone] || colors.sand;
  const dark = ['terre','olive','cobalt','pourpre','ink'].includes(tone);
  return (
    <div style={{
      width: '100%', height: h, position: 'relative', overflow: 'hidden',
      background: dense
        ? `repeating-linear-gradient(135deg, ${a}, ${a} 4px, ${b} 4px, ${b} 8px)`
        : `repeating-linear-gradient(135deg, ${a}, ${a} 10px, ${b}cc 10px, ${b}cc 20px)`,
      display: 'flex', alignItems: 'flex-end', padding: 14, boxSizing: 'border-box',
    }}>
      {label && <span style={{
        fontFamily: atd.mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
        color: dark ? atd.cream : atd.ink, background: dark ? 'rgba(244,237,225,0.15)' : atd.cream,
        padding: '4px 8px',
      }}>{label}</span>}
    </div>
  );
}

function NavD({ active = 'home' }) {
  const items = [
    ['home', 'Нүүр'], ['search', 'Хайх'], ['categories', 'Ангилал'],
    ['providers', 'Мастер'], ['msg', 'Зурвас'],
  ];
  return (
    <header style={{
      height: 76, padding: '0 56px', display: 'flex', alignItems: 'center',
      gap: 48, background: atd.paper, borderBottom: `1px solid ${atd.line}`, flexShrink: 0,
    }}>
      <Wordmark size={28} />
      <nav style={{ display: 'flex', gap: 28, flex: 1 }}>
        {items.map(([id, l]) => {
          const on = id === active;
          return (
            <span key={id} style={{
              fontFamily: atd.serif, fontStyle: on ? 'italic' : 'normal',
              fontSize: 15, color: on ? atd.terre : atd.ink,
              borderBottom: on ? `1.5px solid ${atd.terre}` : 'none',
              paddingBottom: 4,
            }}>{l}</span>
          );
        })}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{
          background: atd.cream, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8,
          width: 280, border: `1px solid ${atd.line}`,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={atd.muted} strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <span style={{ fontSize: 13, color: atd.muted, flex: 1 }}>Үйлчилгээ, мастер хайх…</span>
          <span style={{ fontFamily: atd.mono, fontSize: 10, color: atd.muted, letterSpacing: 1 }}>⌘K</span>
        </div>
        <span style={{ fontFamily: atd.mono, fontSize: 11, color: atd.muted, letterSpacing: 1 }}>УБ · СБД</span>
        <div style={{ position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={atd.ink} strokeWidth="1.6"><path d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 10-12 0v3a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"/></svg>
          <div style={{ position: 'absolute', top: -2, right: -3, width: 8, height: 8, background: atd.terre, borderRadius: '50%' }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: atd.ocre, fontFamily: atd.serif, fontStyle: 'italic', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', color: atd.ink }}>О</div>
          <span style={{ fontFamily: atd.serif, fontSize: 14, fontStyle: 'italic' }}>Оюуна</span>
        </div>
      </div>
    </header>
  );
}

function FooterD() {
  return (
    <footer style={{
      padding: '40px 56px 30px', background: atd.cream, borderTop: `1px solid ${atd.line}`,
      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 40,
    }}>
      <div>
        <Wordmark size={28} />
        <p style={{ fontFamily: atd.serif, fontStyle: 'italic', fontSize: 13, color: atd.muted, marginTop: 14, maxWidth: 280, lineHeight: 1.5 }}>
          Танай хорооллын чанартай үйлчилгээ. Улаанбаатараас Дархан хүртэл.
        </p>
        <div style={{ marginTop: 18, opacity: 0.5 }}><KheeD color={atd.terre} h={10} /></div>
      </div>
      {[
        ['Үйлчилгээ', ['Засвар', 'Цэвэрлэгээ', 'Хичээл', 'Дасгал', 'Гоо сайхан', 'Асрамж']],
        ['Мастер нарт', ['Мастер болох', 'Үнэлгээ', 'Багц', 'Тусламж']],
        ['tusch', ['Бидний тухай', 'Сэтгүүл', 'Дүүрэг', 'Ажлын байр']],
        ['Хууль', ['Нөхцөл', 'Нууцлал', 'Күүки', 'Холбоо']],
      ].map(([t, items], i) => (
        <div key={i}>
          <div style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: atd.muted, marginBottom: 14 }}>{t}</div>
          {items.map(l => (
            <div key={l} style={{ fontFamily: atd.serif, fontSize: 13, marginBottom: 8 }}>{l}</div>
          ))}
        </div>
      ))}
    </footer>
  );
}

function Home() {
  const cats = [
    ['Засвар', '420+', 'terre'],
    ['Цэвэрлэгээ', '310+', 'olive'],
    ['Хичээл', '180+', 'ocre'],
    ['Дасгал', '95+', 'cobalt'],
    ['Гоо сайхан', '150+', 'rose'],
    ['Асрамж', '230+', 'pourpre'],
  ];
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: atd.paper, fontFamily: atd.sans, color: atd.ink }}>
      <NavD active="home" />

      {/* HERO */}
      <section style={{ padding: '56px 56px 40px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 56, alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted, marginBottom: 18 }}>Сайн уу, Оюуна — Улаанбаатар, СБД</div>
          <h1 style={{
            fontFamily: atd.serif, fontSize: 88, fontWeight: 400, lineHeight: 0.98,
            letterSpacing: -3, margin: 0, color: atd.ink,
          }}>
            Танай хорооллын<br/>
            <em style={{ fontStyle: 'italic', color: atd.terre }}>чанартай</em> мастерууд<span style={{ color: atd.cobalt }}>.</span>
          </h1>
          <p style={{ fontFamily: atd.serif, fontSize: 18, lineHeight: 1.5, color: atd.ink, opacity: 0.75, marginTop: 22, maxWidth: 520 }}>
            tusch нь сантехникч, багш, цэвэрлэгчдийг чамтай хамгийн ойр газраас холбоно. Үнэлгээ үнэгүй, бүх төлбөр хамгаалагдсан.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, alignItems: 'center', background: atd.cream, border: `1px solid ${atd.ink}`, padding: '6px 6px 6px 20px', maxWidth: 580 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={atd.ink} strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <span style={{ flex: 1, fontFamily: atd.serif, fontStyle: 'italic', fontSize: 15, color: atd.muted }}>Сантехникч, иогийн багш, шкаф угсрах…</span>
            <span style={{ padding: '12px 22px', background: atd.ink, color: atd.cream, fontFamily: atd.serif, fontSize: 14, fontWeight: 500 }}>Хайх →</span>
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 24, fontFamily: atd.mono, fontSize: 11, color: atd.muted, letterSpacing: 1 }}>
            <span><b style={{ color: atd.terre }}>★ 4,9</b> · 12,400 сэтгэгдэл</span>
            <span><b style={{ color: atd.cobalt }}>✓</b> Бүх мастер баталгаажсан</span>
            <span>24 цагт хариу</span>
          </div>
        </div>

        <div style={{ position: 'relative', height: 520 }}>
          <Block tone="terre" style={{ position: 'absolute', top: 0, left: 40, width: 280, height: 360 }}>
            <ImgD tone="terre" h={360} label="Бат-Эрдэнэ · Сантехникч" />
          </Block>
          <Block tone="ocre" style={{ position: 'absolute', top: 200, right: 0, width: 220, height: 280 }}>
            <ImgD tone="ocre" h={280} label="Цэцэгмаа · Хийл" />
          </Block>
          <Block tone="cobalt" style={{ position: 'absolute', top: 80, left: 0, width: 140, height: 100, padding: 16, color: atd.cream }}>
            <div style={{ fontFamily: atd.mono, fontSize: 9, letterSpacing: 1.5, opacity: 0.7 }}>ӨНӨӨДӨР</div>
            <div style={{ fontFamily: atd.serif, fontSize: 26, fontStyle: 'italic', marginTop: 6 }}>184</div>
            <div style={{ fontFamily: atd.mono, fontSize: 9, letterSpacing: 1, marginTop: 2 }}>САНАЛ ИРСЭН</div>
          </Block>
        </div>
      </section>

      {/* KHEE DIVIDER */}
      <div style={{ padding: '0 56px' }}>
        <KheeD color={atd.terre} h={14} />
      </div>

      {/* CATEGORIES */}
      <section style={{ padding: '60px 56px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted }}>№ 01</div>
            <h2 style={{ fontFamily: atd.serif, fontSize: 44, fontWeight: 400, margin: '8px 0 0', letterSpacing: -1.5 }}>
              Зургаан <em style={{ fontStyle: 'italic', color: atd.terre }}>ангилал</em>, нэг товчоор.
            </h2>
          </div>
          <span style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: atd.ink }}>Бүгдийг үзэх →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {cats.map(([l, n, t], i) => {
            const dark = ['terre','olive','cobalt','pourpre'].includes(t);
            return (
              <div key={i} style={{ position: 'relative', aspectRatio: '0.78', overflow: 'hidden' }}>
                <ImgD tone={t} h="100%" />
                <div style={{
                  position: 'absolute', inset: 0, padding: 18,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  color: dark ? atd.cream : atd.ink,
                }}>
                  <div style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 1, opacity: 0.8 }}>{n} мастер</div>
                  <div style={{ fontFamily: atd.serif, fontSize: 22, fontStyle: 'italic', lineHeight: 1 }}>{l}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED + EDITORIAL */}
      <section style={{ padding: '40px 56px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
        <Block tone="cream" style={{ padding: 40, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 20, right: 24, fontFamily: atd.mono, fontSize: 10, letterSpacing: 1.5, color: atd.terre }}>★ ТҮҮХ № 04</div>
          <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted, marginBottom: 18 }}>Онцлох</div>
          <h2 style={{ fontFamily: atd.serif, fontSize: 38, fontWeight: 400, lineHeight: 1.05, letterSpacing: -1, margin: 0 }}>
            Сүхбаатар <em style={{ fontStyle: 'italic', color: atd.pourpre }}>дүүргийн</em><br/>шилдэг мастерууд.
          </h2>
          <p style={{ fontFamily: atd.serif, fontSize: 15, lineHeight: 1.55, color: atd.ink, opacity: 0.8, margin: '16px 0 24px', maxWidth: 380 }}>
            «Цахилгаанчин, паркетчин, иогийн багш — гурван мэргэжилтэн нэг хорооллоос. 13 жилийн туршлага, хамтран ажилласан гэр бүл 200+.»
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <ImgD tone="rose" h={130} />
            <ImgD tone="olive" h={130} />
            <ImgD tone="terre" h={130} />
          </div>
          <div style={{ marginTop: 24, fontFamily: atd.serif, fontSize: 14, fontStyle: 'italic', color: atd.ink }}>Үргэлжлүүлэн унших →</div>
        </Block>

        <div>
          <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted, marginBottom: 18 }}>Ойролцоо · 1,2 км</div>
          <h2 style={{ fontFamily: atd.serif, fontSize: 32, fontWeight: 400, letterSpacing: -1, margin: '0 0 24px' }}>
            Танай <em style={{ fontStyle: 'italic' }}>ойролцоо.</em>
          </h2>
          {[
            { n: 'Бат-Эрдэнэ Б.', s: 'Сантехникч · 12 жилийн туршлага', r: '4,9', km: '0,4 км', t: 'terre', p: '60,000₮/ц' },
            { n: 'Цэцэгмаа Д.', s: 'Хийлийн хичээл, эхлэгчээс ахисан', r: '5,0', km: '0,8 км', t: 'ocre', p: '40,000₮/ц' },
            { n: 'Мөнхбат Д.', s: 'Паркетчин, лакдалт', r: '4,9', km: '1,1 км', t: 'rose', p: '480,000₮-аас' },
            { n: 'Оюун-Эрдэнэ Ц.', s: 'Йогийн багш, ахисан түвшин', r: '4,8', km: '1,2 км', t: 'olive', p: '30,000₮/ц' },
          ].map((p, i) => (
            <div key={i} style={{
              padding: '18px 0', borderTop: `1px solid ${atd.line}`,
              display: 'flex', gap: 18, alignItems: 'center',
            }}>
              <div style={{ width: 64, height: 64, flexShrink: 0 }}><ImgD tone={p.t} h={64} dense /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: atd.serif, fontSize: 17, fontWeight: 500 }}>{p.n}</div>
                <div style={{ fontSize: 12, color: atd.muted, marginTop: 2 }}>{p.s}</div>
                <div style={{ fontFamily: atd.mono, fontSize: 10, color: atd.muted, letterSpacing: 1, marginTop: 4 }}>{p.km} · {p.p}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: atd.serif, fontSize: 17, fontStyle: 'italic', color: atd.terre }}>★ {p.r}</div>
                <div style={{ fontFamily: atd.mono, fontSize: 9, color: atd.muted, letterSpacing: 1, marginTop: 2 }}>142 ҮНЭЛГЭЭ</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COLOR CTA STRIP */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
        <Block tone="terre" style={{ padding: '48px 40px', color: atd.cream, minHeight: 240 }}>
          <div style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 2, opacity: 0.7 }}>МАСТЕРУУДАД</div>
          <h3 style={{ fontFamily: atd.serif, fontSize: 30, fontWeight: 400, lineHeight: 1.05, margin: '16px 0', letterSpacing: -0.8 }}>
            Шинэ <em style={{ fontStyle: 'italic' }}>үйлчлүүлэгчдийг</em> ол.
          </h3>
          <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.85, marginTop: 0 }}>15 минутын дотор профайлаа үүсгээд орон нутгийнхаа хүсэлтүүдийг хүлээж аваарай.</p>
          <div style={{ marginTop: 24, fontFamily: atd.serif, fontStyle: 'italic', fontSize: 14 }}>Мастер болох →</div>
        </Block>
        <Block tone="cobalt" style={{ padding: '48px 40px', color: atd.cream, minHeight: 240 }}>
          <div style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 2, opacity: 0.7 }}>ҮЙЛЧЛҮҮЛЭГЧДЭД</div>
          <h3 style={{ fontFamily: atd.serif, fontSize: 30, fontWeight: 400, lineHeight: 1.05, margin: '16px 0', letterSpacing: -0.8 }}>
            Хүсэлтээ <em style={{ fontStyle: 'italic' }}>үнэгүй</em> нийтэл.
          </h3>
          <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.85, marginTop: 0 }}>Тайлбараа бичээд 24 цагт дунджаар 4 санал хүлээж аваарай.</p>
          <div style={{ marginTop: 24, fontFamily: atd.serif, fontStyle: 'italic', fontSize: 14 }}>Хүсэлт оруулах →</div>
        </Block>
        <Block tone="ocre" style={{ padding: '48px 40px', color: atd.ink, minHeight: 240 }}>
          <div style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 2, opacity: 0.75 }}>tusch · ОНЦГОЙ</div>
          <h3 style={{ fontFamily: atd.serif, fontSize: 30, fontWeight: 400, lineHeight: 1.05, margin: '16px 0', letterSpacing: -0.8 }}>
            7 хоног <em style={{ fontStyle: 'italic' }}>үнэгүй</em> туршаарай.
          </h3>
          <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.8, marginTop: 0 }}>tusch+ гишүүнчлэлээр бүх онцлог нээгдэнэ. Сонголт хязгааргүй.</p>
          <div style={{ marginTop: 24, fontFamily: atd.serif, fontStyle: 'italic', fontSize: 14 }}>Гишүүнчлэл →</div>
        </Block>
      </section>

      <FooterD />
    </div>
  );
}

function Search() {
  const items = [
    { name: 'Паркетан шал · 22 м² зочны өрөө', who: 'Мөнхбат Д.', loc: 'УБ · СБД · 0,8 км', price: '480,000₮-аас', rate: '4,9', n: '142', t: 'terre' },
    { name: 'Бойлерын ус алдаа · яаралтай засвар', who: 'Бат-Эрдэнэ Б.', loc: 'УБ · СБД · 0,4 км', price: '24 цагт үнэлгээ', rate: '4,8', n: '98', t: 'cobalt' },
    { name: 'IKEA Pax шкафны угсралт', who: 'Сүхбат К.', loc: 'УБ · ХУД · 3,1 км', price: '60,000₮/цаг', rate: '5,0', n: '54', t: 'ocre' },
    { name: 'Зочны өрөө будалт 30 м² · экологийн будаг', who: 'Эрдэнэт Студи', loc: 'УБ · СХД · 5,4 км', price: 'Тохиролцоно', rate: '4,7', n: '210', t: 'rose' },
    { name: 'Цахилгааны угсралт · LED гэрлүүд', who: 'Лхагва Т.', loc: 'УБ · СБД · 1,2 км', price: '80,000₮/цаг', rate: '4,9', n: '76', t: 'olive' },
    { name: 'Гал тогооны шүүгээ шинэчлэх', who: 'Дорж А.', loc: 'УБ · БЗД · 4,8 км', price: '1,2 сая₮-аас', rate: '4,8', n: '34', t: 'pourpre' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: atd.paper, fontFamily: atd.sans, color: atd.ink }}>
      <NavD active="search" />

      <section style={{ padding: '36px 56px 24px', background: atd.cream, borderBottom: `1px solid ${atd.line}` }}>
        <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted }}>Хайлт → Засвар → Паркет</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
          <h1 style={{ fontFamily: atd.serif, fontSize: 56, fontWeight: 400, letterSpacing: -2, margin: 0 }}>
            <em style={{ fontStyle: 'italic', color: atd.terre }}>148</em> үр дүн, <em style={{ fontStyle: 'italic' }}>«засвар»</em>
          </h1>
          <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 1, color: atd.muted, textTransform: 'uppercase' }}>УБ Сүхбаатар · 5 км дотор</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 22, flexWrap: 'wrap' }}>
          {[
            ['Бүгд', true, atd.ink],
            ['Сантехник', false, null],
            ['Цахилгаан', false, null],
            ['Будалт', false, null],
            ['Мужаан', false, null],
            ['Шал', false, null],
            ['Гал тогоо', false, null],
            ['+ Шүүлтүүр', false, null],
          ].map(([l, on, bg], i) => (
            <span key={i} style={{
              fontFamily: atd.mono, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase',
              padding: '8px 14px',
              background: on ? atd.ink : 'transparent',
              color: on ? atd.cream : atd.ink,
              border: on ? 'none' : `1px solid ${atd.line}`,
            }}>{l}</span>
          ))}
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 580 }}>
        {/* Sidebar filters */}
        <aside style={{ padding: '32px 32px', borderRight: `1px solid ${atd.line}`, background: atd.paper }}>
          <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted, marginBottom: 4 }}>Шүүлтүүр</div>

          {[
            ['Үнэлгээ', ['★ 4,5+', '★ 4,0+', 'Бүгд']],
            ['Үнэ', ['< 50,000₮', '50,000 – 200,000₮', '200,000₮+']],
            ['Хугацаа', ['24 цаг дотор', 'Энэ 7-хоног', 'Уян хатан']],
            ['Туршлага', ['1+ жил', '5+ жил', '10+ жил']],
          ].map(([t, opts], i) => (
            <div key={i} style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${atd.line}` }}>
              <div style={{ fontFamily: atd.serif, fontSize: 15, fontStyle: 'italic', marginBottom: 10 }}>{t}</div>
              {opts.map((o, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 13 }}>
                  <div style={{
                    width: 14, height: 14, border: `1px solid ${atd.ink}`,
                    background: j === 0 && i === 0 ? atd.terre : 'transparent',
                  }} />
                  <span>{o}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: 32, padding: '12px 16px', background: atd.ink, color: atd.cream, fontFamily: atd.serif, fontSize: 14, textAlign: 'center', fontWeight: 500 }}>
            Шүүлтүүр хэрэглэх
          </div>
        </aside>

        {/* Results */}
        <div style={{ padding: '32px 56px 60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <div style={{ fontFamily: atd.serif, fontSize: 18, fontStyle: 'italic' }}>148 зарын <em>1-12</em> үзэж байна</div>
            <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: atd.muted }}>↓ Хамгийн тохиромжтой</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {items.map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '4px 0' }}>
                <div style={{ width: 160, height: 160, flexShrink: 0 }}><ImgD tone={it.t} h={160} dense /></div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontFamily: atd.serif, fontSize: 17, fontWeight: 500, lineHeight: 1.2 }}>{it.name}</div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={atd.ink} strokeWidth="1.6" style={{ flexShrink: 0, marginTop: 4 }}><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 22l7.8-7.8 1-1a5.5 5.5 0 000-7.8z"/></svg>
                  </div>
                  <div style={{ fontSize: 12.5, color: atd.muted, marginTop: 6 }}>{it.who} · {it.loc}</div>
                  <div style={{ flex: 1 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: `1px solid ${atd.line}` }}>
                    <div style={{ fontFamily: atd.serif, fontSize: 15, fontStyle: 'italic' }}>{it.price}</div>
                    <div style={{ display: 'flex', gap: 10, fontFamily: atd.mono, fontSize: 10, color: atd.muted, letterSpacing: 0.5 }}>
                      <span style={{ color: atd.terre }}>★ {it.rate}</span>
                      <span>· {it.n} сэтгэгдэл</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 4, fontFamily: atd.mono, fontSize: 12 }}>
            {['1', '2', '3', '4', '…', '13', '→'].map((p, i) => (
              <span key={i} style={{
                padding: '8px 14px',
                background: i === 0 ? atd.ink : 'transparent',
                color: i === 0 ? atd.cream : atd.ink,
                border: i === 0 ? 'none' : `1px solid ${atd.line}`,
              }}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      <FooterD />
    </div>
  );
}

function Listing() {
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: atd.paper, fontFamily: atd.sans, color: atd.ink }}>
      <NavD active="search" />

      <div style={{ padding: '20px 56px 0', fontFamily: atd.mono, fontSize: 11, letterSpacing: 1, color: atd.muted, textTransform: 'uppercase' }}>
        Нүүр / Засвар / Паркет / 22 м² зочны өрөөнд паркет тавих
      </div>

      <section style={{ padding: '20px 56px 40px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32 }}>
        <div>
          {/* Gallery */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, height: 480 }}>
            <ImgD tone="terre" h="100%" label="1 / 6" />
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 8 }}>
              <ImgD tone="ocre" h="100%" />
              <div style={{ position: 'relative' }}>
                <ImgD tone="rose" h="100%" />
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(26,23,20,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: atd.cream, fontFamily: atd.serif, fontStyle: 'italic', fontSize: 18,
                }}>+ 4 фото</div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 36 }}>
            <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.terre }}>Засвар · Паркетан шал</div>
            <h1 style={{ fontFamily: atd.serif, fontSize: 52, fontWeight: 400, lineHeight: 1.05, letterSpacing: -2, margin: '12px 0 0' }}>
              <em style={{ fontStyle: 'italic' }}>22 м²</em> зочны өрөө, унтлагын<br/>өрөөнд паркетан шал тавих.
            </h1>

            <div style={{ display: 'flex', gap: 24, marginTop: 22, paddingBottom: 22, borderBottom: `1px solid ${atd.line}` }}>
              <span style={{ fontFamily: atd.serif, fontSize: 14, fontStyle: 'italic' }}>УБ Сүхбаатар · <b style={{ fontStyle: 'normal' }}>0,8 км</b></span>
              <span style={{ fontFamily: atd.serif, fontSize: 14, fontStyle: 'italic' }}>Бэлэн <b style={{ fontStyle: 'normal' }}>энэ долоо хоногт</b></span>
              <span style={{ fontFamily: atd.serif, fontSize: 14, fontStyle: 'italic' }}><b style={{ fontStyle: 'normal', color: atd.cobalt }}>✓</b> Баталгаажсан</span>
            </div>

            <div style={{ marginTop: 28 }}>
              <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted, marginBottom: 12 }}>Тайлбар</div>
              <p style={{ fontFamily: atd.serif, fontSize: 16, lineHeight: 1.6, margin: 0 }}>
                <span style={{ fontFamily: atd.serif, fontSize: 56, float: 'left', lineHeight: 0.85, paddingTop: 8, paddingRight: 10, color: atd.terre }}>З</span>
                очны өрөө, унтлагын өрөөнд царс модон паркетыг өөрөө хангана. Шалны бэлтгэл, бортого орно. Хүнд тавилга шилжүүлэхэд тусална. Цэвэрхэн ажилладаг, дурсамж бэлэн. Хийсэн ажлын дунд 200+ паркет, лак, өнгөлгөө байна. Захиалга өгөхөөс өмнө байр хэмжих хүсэлт гаргаж болно — үнэгүй.
              </p>
            </div>

            <div style={{ marginTop: 32 }}>
              <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted, marginBottom: 14 }}>Юу орох вэ</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {['Шалны бэлтгэл, цэвэрлэгээ', 'Бортого тавилт', 'Тавилга шилжүүлэх', 'Үнэгүй үнэлгээ — 24 ц', 'Ажлын дараах цэвэрлэгээ', '2 жилийн баталгаа'].map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontFamily: atd.serif, fontSize: 15 }}>
                    <span style={{ color: atd.cobalt, fontStyle: 'italic' }}>✓</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${atd.line}` }}>
              <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted, marginBottom: 14 }}>Сэтгэгдэл · 142</div>
              {[
                { who: 'Сарангэрэл М.', when: '5 хоногийн өмнө', r: 5, txt: 'Цэвэрхэн ажил, цагтаа ирсэн, үр дүн хүлээлтээс илүү. Зөвлөж байна.' },
                { who: 'Энхбаяр Б.', when: '2 долоо хоног', r: 5, txt: 'Лак нь маш сайн өнгөлсөн. Шал шинэ юм шиг болсон. Үнэ үнэхээр хямд.' },
              ].map((r, i) => (
                <div key={i} style={{ padding: '18px 0', borderTop: i > 0 ? `1px solid ${atd.line}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontFamily: atd.serif, fontSize: 16, fontWeight: 500 }}>{r.who}</div>
                    <div style={{ fontFamily: atd.mono, fontSize: 10, color: atd.terre, letterSpacing: 1 }}>{'★★★★★'.slice(0, r.r)} <span style={{ color: atd.muted, marginLeft: 8 }}>{r.when}</span></div>
                  </div>
                  <p style={{ fontFamily: atd.serif, fontSize: 15, fontStyle: 'italic', lineHeight: 1.5, margin: '8px 0 0' }}>«&nbsp;{r.txt}&nbsp;»</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky right column */}
        <aside>
          <div style={{ position: 'sticky', top: 24 }}>
            <Block tone="cream" style={{ padding: 32, border: `1px solid ${atd.ink}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: atd.muted }}>Эхлэх үнэ</div>
                  <div style={{ fontFamily: atd.serif, fontSize: 48, letterSpacing: -2, marginTop: 4 }}>
                    480,000<em style={{ fontStyle: 'italic', fontSize: 26 }}>₮</em>
                  </div>
                </div>
                <div style={{ padding: '5px 10px', background: atd.ocre, color: atd.ink, fontFamily: atd.mono, fontSize: 10, letterSpacing: 1 }}>22 М²-Д</div>
              </div>

              <div style={{ marginTop: 22, paddingTop: 22, borderTop: `1px solid ${atd.line}` }}>
                <div style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: atd.muted, marginBottom: 10 }}>Тооцоо</div>
                {[
                  ['Талбай', '22 м²'],
                  ['Материал', 'Үйлчлүүлэгч хангана'],
                  ['Ажиллах хугацаа', '3 өдөр'],
                  ['Үнэлгээ', 'Үнэгүй · 24 ц'],
                ].map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontFamily: atd.serif, fontSize: 14 }}>
                    <span style={{ color: atd.muted, fontStyle: 'italic' }}>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 22, padding: '16px 18px', background: atd.terre, color: atd.cream, fontFamily: atd.serif, fontSize: 15, textAlign: 'center', fontWeight: 500 }}>
                Санал илгээх →
              </div>
              <div style={{ marginTop: 8, padding: '15px 18px', border: `1px solid ${atd.ink}`, fontFamily: atd.serif, fontStyle: 'italic', fontSize: 14, textAlign: 'center' }}>
                Зурвас бичих
              </div>
              <div style={{ marginTop: 14, fontFamily: atd.mono, fontSize: 10, color: atd.muted, letterSpacing: 0.5, textAlign: 'center' }}>
                Захиалга баталгаажих хүртэл төлбөр хамгаалагдсан.
              </div>
            </Block>

            <Block tone="paper" style={{ padding: 24, marginTop: 16, border: `1px solid ${atd.line}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden' }}><ImgD tone="terre" h={56} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: atd.serif, fontSize: 17, fontWeight: 500 }}>Мөнхбат Дорж</div>
                  <div style={{ fontSize: 12, color: atd.muted, marginTop: 2 }}>Дархан · 2021 оноос гишүүн</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${atd.line}`, fontFamily: atd.mono, fontSize: 10, color: atd.muted, letterSpacing: 0.5 }}>
                <span><b style={{ color: atd.terre, fontSize: 14, fontFamily: atd.serif, fontStyle: 'italic' }}>★ 4,9</b> · 142</span>
                <span><b style={{ color: atd.cobalt }}>✓</b> Үнэмлэх</span>
                <span>98% хариу</span>
              </div>
              <div style={{ marginTop: 14, fontFamily: atd.serif, fontStyle: 'italic', fontSize: 14, color: atd.ink }}>
                Профайл үзэх →
              </div>
            </Block>
          </div>
        </aside>
      </section>

      <FooterD />
    </div>
  );
}

function Provider() {
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: atd.paper, fontFamily: atd.sans, color: atd.ink }}>
      <NavD active="providers" />

      {/* Hero band — color block */}
      <section style={{ background: atd.terre, color: atd.cream, padding: '56px 56px 48px', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.18 }}><KheeD color={atd.cream} h={14} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 36, alignItems: 'center' }}>
          <div style={{ width: 180, height: 180 }}><ImgD tone="cream" h={180} dense /></div>
          <div>
            <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, opacity: 0.75 }}>Мастер · УБ Сүхбаатар · 2021-оос</div>
            <h1 style={{ fontFamily: atd.serif, fontSize: 64, fontWeight: 400, letterSpacing: -2.5, lineHeight: 1, margin: '12px 0 8px' }}>
              Мөнхбат <em style={{ fontStyle: 'italic' }}>Дорж</em>
            </h1>
            <div style={{ fontFamily: atd.serif, fontSize: 18, fontStyle: 'italic', opacity: 0.9 }}>
              Паркетчин дархан · 15 жилийн туршлага
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <span style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 1, padding: '5px 10px', background: atd.cream, color: atd.ink }}>✓ ҮНЭМЛЭХ</span>
              <span style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 1, padding: '5px 10px', background: atd.ocre, color: atd.ink }}>★ 4,9</span>
              <span style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 1, padding: '5px 10px', background: 'rgba(244,237,225,0.15)', color: atd.cream }}>tusch+ ГИШҮҮН</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '14px 24px', background: atd.cream, color: atd.ink, fontFamily: atd.serif, fontSize: 15, fontWeight: 500 }}>Холбогдох →</div>
            <div style={{ padding: '13px 24px', border: `1px solid ${atd.cream}`, color: atd.cream, fontFamily: atd.serif, fontSize: 14, fontStyle: 'italic', textAlign: 'center' }}>Дуртай нэмэх ♡</div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderBottom: `1px solid ${atd.line}` }}>
        {[
          ['142', 'СЭТГЭГДЭЛ', atd.paper],
          ['4,9', 'ҮНЭЛГЭЭ', atd.cream],
          ['5 жил', 'tusch-Д', atd.paper],
          ['98%', 'ХАРИУ', atd.cream],
          ['<2ц', 'ХАРИУЛАХ', atd.paper],
        ].map(([n, l, bg], i) => (
          <div key={i} style={{ padding: '28px 24px', background: bg, borderRight: i < 4 ? `1px solid ${atd.line}` : 'none', textAlign: 'center' }}>
            <div style={{ fontFamily: atd.serif, fontSize: 36, fontStyle: 'italic', letterSpacing: -1 }}>{n}</div>
            <div style={{ fontFamily: atd.mono, fontSize: 10, color: atd.muted, letterSpacing: 1.5, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </section>

      <section style={{ padding: '48px 56px', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 56 }}>
        <div>
          <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted }}>Тухай</div>
          <h2 style={{ fontFamily: atd.serif, fontSize: 32, fontWeight: 400, letterSpacing: -1, lineHeight: 1.1, margin: '10px 0 16px' }}>
            <em style={{ fontStyle: 'italic' }}>Шал нь өөрөө</em> миний өмнөөс ярина.
          </h2>
          <p style={{ fontFamily: atd.serif, fontSize: 16, lineHeight: 1.55, margin: 0 }}>
            Арван таван жилийн турш паркет тавьж, өнгөлж, лакдан ирлээ. Ганцаараа ажилладаг, цаг гарга, шал нь өөрөө миний өмнөөс ярина. Орхон аймагт төрж, Улаанбаатарт хоёр дахь хүүгээ дагаж нүүж ирсэн.
          </p>

          <div style={{ marginTop: 32, fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted, marginBottom: 14 }}>Чадвар</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              ['Паркетан шал', 'terre'], ['Цул мод', 'olive'], ['Бортого', 'ocre'],
              ['Цавууны угсралт', 'cobalt'], ['Лакдалт', 'rose'], ['Засвар', 'pourpre'],
            ].map(([c, t], i) => (
              <span key={i} style={{
                fontFamily: atd.serif, fontSize: 14, fontStyle: 'italic', padding: '7px 14px',
                border: `1px solid ${atd[t]}`, color: atd[t],
              }}>{c}</span>
            ))}
          </div>

          <div style={{ marginTop: 32, fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted, marginBottom: 14 }}>Үнийн санал</div>
          {[
            ['Шал · паркет тавилт', '22,000₮/м²'],
            ['Лакдалт', '8,000₮/м²'],
            ['Үнэгүй үнэлгээ, хэмжилт', '0₮'],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${atd.line}` }}>
              <span style={{ fontFamily: atd.serif, fontSize: 15 }}>{k}</span>
              <span style={{ fontFamily: atd.serif, fontSize: 15, fontStyle: 'italic', color: atd.terre }}>{v}</span>
            </div>
          ))}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted }}>Хийсэн ажил · 24</div>
            <span style={{ fontFamily: atd.mono, fontSize: 11, color: atd.ink, letterSpacing: 1, textTransform: 'uppercase' }}>Бүгд →</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {['terre','ocre','rose','cobalt','olive','pourpre','sand','terre','rose'].map((t, i) => (
              <div key={i} style={{ aspectRatio: '1' }}><ImgD tone={t} h="100%" dense /></div>
            ))}
          </div>

          <div style={{ marginTop: 32, fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted, marginBottom: 14 }}>Сэтгэгдэл</div>
          {[
            { who: 'Сарангэрэл М.', when: '5 хоног', r: 5, txt: 'Цэвэрхэн ажил, цагтаа ирсэн, үр дүн хүлээлтээс илүү.' },
            { who: 'Энхбаяр Б.', when: '2 долоо хоног', r: 5, txt: 'Лак нь маш сайн өнгөлсөн. Шал шинэ юм шиг болсон.' },
            { who: 'Ариунзул Г.', when: '1 сар', r: 5, txt: 'Хариу хурдан, үнэ оновчтой. Дахин уулзана.' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '18px 0', borderTop: `1px solid ${atd.line}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontFamily: atd.serif, fontSize: 16, fontWeight: 500 }}>{r.who}</div>
                <div style={{ fontFamily: atd.mono, fontSize: 10, color: atd.terre, letterSpacing: 1 }}>★★★★★ <span style={{ color: atd.muted, marginLeft: 8 }}>{r.when}</span></div>
              </div>
              <p style={{ fontFamily: atd.serif, fontSize: 15, fontStyle: 'italic', lineHeight: 1.5, margin: '6px 0 0' }}>«&nbsp;{r.txt}&nbsp;»</p>
            </div>
          ))}
        </div>
      </section>

      <FooterD />
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: atd.paper, fontFamily: atd.sans, color: atd.ink }}>
      <NavD active="home" />

      <section style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 800 }}>
        {/* Sidebar */}
        <aside style={{ padding: '36px 28px', borderRight: `1px solid ${atd.line}`, background: atd.cream }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: atd.ocre, fontFamily: atd.serif, fontStyle: 'italic', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>О</div>
            <div>
              <div style={{ fontFamily: atd.serif, fontSize: 17, fontStyle: 'italic' }}>Оюуна Ч.</div>
              <div style={{ fontFamily: atd.mono, fontSize: 10, color: atd.muted, letterSpacing: 0.5, marginTop: 2 }}>УБ СБД · 2024-оос</div>
            </div>
          </div>

          {[
            ['Хяналт', true, '·'],
            ['Хүсэлт', false, '2'],
            ['Санал', false, '4'],
            ['Зурвас', false, '5'],
            ['Дуртай', false, '12'],
            ['Сэтгэгдэл', false, '7'],
            ['Төлбөр', false, '·'],
            ['Тохиргоо', false, '·'],
          ].map(([l, on, n], i) => (
            <div key={i} style={{
              padding: '11px 14px', marginBottom: 4,
              background: on ? atd.ink : 'transparent',
              color: on ? atd.cream : atd.ink,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: atd.serif, fontSize: 14, fontStyle: on ? 'italic' : 'normal',
            }}>
              <span>{l}</span>
              <span style={{ fontFamily: atd.mono, fontSize: 10, color: on ? atd.ocre : atd.muted, letterSpacing: 0.5 }}>{n}</span>
            </div>
          ))}

          <div style={{ marginTop: 36, padding: 18, background: atd.terre, color: atd.cream }}>
            <div style={{ fontFamily: atd.mono, fontSize: 9, letterSpacing: 1.5, opacity: 0.75 }}>tusch+ ГИШҮҮН</div>
            <div style={{ fontFamily: atd.serif, fontSize: 16, fontStyle: 'italic', marginTop: 8, lineHeight: 1.3 }}>Сар бүр санал хязгааргүй.</div>
            <div style={{ fontFamily: atd.serif, fontSize: 12, marginTop: 12, fontStyle: 'italic' }}>Илүү ихийг үзэх →</div>
          </div>
        </aside>

        {/* Main */}
        <div style={{ padding: '40px 48px 60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted }}>Хяналтын самбар · Мягмар, 5 V</div>
              <h1 style={{ fontFamily: atd.serif, fontSize: 52, fontWeight: 400, letterSpacing: -2, margin: '8px 0 0' }}>
                Сайн уу, <em style={{ fontStyle: 'italic', color: atd.terre }}>Оюуна.</em>
              </h1>
            </div>
            <div style={{ padding: '12px 22px', background: atd.ink, color: atd.cream, fontFamily: atd.serif, fontSize: 14 }}>+ Шинэ хүсэлт</div>
          </div>

          {/* Active request — big card */}
          <Block tone="ink" style={{ padding: 36, color: atd.cream, marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: atd.ocre }}>● Идэвхтэй хүсэлт № 1</div>
              <div style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 1, color: atd.sand, textTransform: 'uppercase' }}>Дуусах: 2 өдөр</div>
            </div>
            <h2 style={{ fontFamily: atd.serif, fontSize: 36, fontWeight: 400, lineHeight: 1.1, letterSpacing: -1, margin: '14px 0 0' }}>
              22 м² зочны өрөөнд <em style={{ fontStyle: 'italic', color: atd.ocre }}>паркетан шал</em> тавих.
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28, marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(244,237,225,0.15)' }}>
              {[
                ['4', 'САНАЛ', atd.ocre],
                ['87', 'ҮЗСЭН', atd.cream],
                ['12', 'ХАДГАЛСАН', atd.cream],
                ['2', 'УНШААГҮЙ', atd.terre],
              ].map(([n, l, c], i) => (
                <div key={i}>
                  <div style={{ fontFamily: atd.serif, fontSize: 44, fontStyle: 'italic', letterSpacing: -1, color: c }}>{n}</div>
                  <div style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 1.5, color: atd.sand, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </Block>

          {/* Recent offers */}
          <div style={{ fontFamily: atd.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: atd.muted, marginBottom: 14 }}>Хүлээн авсан санал · 4</div>
          <div style={{ background: atd.paper, border: `1px solid ${atd.line}` }}>
            {[
              { who: 'Мөнхбат Д.', t: 'Паркетчин', price: '520,000₮', when: '3 өдөр', rate: '4,9', tone: 'terre', new: true },
              { who: 'Эрдэнэт Студи', t: 'Угсралтын баг', price: '610,000₮', when: '4 өдөр', rate: '4,7', tone: 'rose', new: true },
              { who: 'Сүхбат К.', t: 'Дархан, ганцаараа', price: '450,000₮', when: '2 өдөр', rate: '5,0', tone: 'ocre', new: false },
              { who: 'Лхагва Т.', t: 'Засварын мастер', price: '498,000₮', when: '3 өдөр', rate: '4,8', tone: 'cobalt', new: false },
            ].map((o, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: 'auto 1.5fr 1fr 1fr 1fr auto',
                gap: 20, alignItems: 'center', padding: '20px 24px',
                borderTop: i > 0 ? `1px solid ${atd.line}` : 'none',
              }}>
                <div style={{ width: 48, height: 48 }}><ImgD tone={o.tone} h={48} dense /></div>
                <div>
                  <div style={{ fontFamily: atd.serif, fontSize: 16, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {o.who}
                    {o.new && <span style={{ fontFamily: atd.mono, fontSize: 9, letterSpacing: 1, padding: '2px 6px', background: atd.terre, color: atd.cream }}>ШИНЭ</span>}
                  </div>
                  <div style={{ fontSize: 12, color: atd.muted, marginTop: 2 }}>{o.t}</div>
                </div>
                <div>
                  <div style={{ fontFamily: atd.mono, fontSize: 9, color: atd.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Үнэ</div>
                  <div style={{ fontFamily: atd.serif, fontSize: 16, fontStyle: 'italic', marginTop: 2 }}>{o.price}</div>
                </div>
                <div>
                  <div style={{ fontFamily: atd.mono, fontSize: 9, color: atd.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Хугацаа</div>
                  <div style={{ fontFamily: atd.serif, fontSize: 15, marginTop: 2 }}>{o.when}</div>
                </div>
                <div>
                  <div style={{ fontFamily: atd.mono, fontSize: 9, color: atd.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Үнэлгээ</div>
                  <div style={{ fontFamily: atd.serif, fontSize: 15, color: atd.terre, marginTop: 2 }}>★ {o.rate}</div>
                </div>
                <span style={{ fontFamily: atd.serif, fontSize: 14, fontStyle: 'italic' }}>Үзэх →</span>
              </div>
            ))}
          </div>

          {/* Activity grid */}
          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <Block tone="cobalt" style={{ padding: 28, color: atd.cream }}>
              <div style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 1.5, opacity: 0.75 }}>СҮҮЛИЙН ЯРИА</div>
              <div style={{ fontFamily: atd.serif, fontSize: 22, fontStyle: 'italic', margin: '12px 0' }}>Мөнхбат Д. дөнгөж хариулав.</div>
              <p style={{ fontFamily: atd.serif, fontSize: 14, opacity: 0.85, margin: 0 }}>«Сайн уу, Мягмарт 9 цагт ирж болно. 3 давхар асуудалгүй.»</p>
              <div style={{ marginTop: 22, fontFamily: atd.serif, fontStyle: 'italic', fontSize: 14 }}>Яриа нээх →</div>
            </Block>
            <Block tone="rose" style={{ padding: 28, color: atd.ink }}>
              <div style={{ fontFamily: atd.mono, fontSize: 10, letterSpacing: 1.5, opacity: 0.75 }}>САР БҮРИЙН ҮЙЛ АЖИЛЛАГАА</div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', marginTop: 16, height: 80 }}>
                {[20, 38, 28, 52, 44, 60, 72, 58, 80, 66, 88, 74].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 11 ? atd.ink : 'rgba(26,23,20,0.4)' }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: atd.mono, fontSize: 9, opacity: 0.7, letterSpacing: 0.5 }}>
                <span>06.2025</span>
                <span>05.2026</span>
              </div>
            </Block>
          </div>
        </div>
      </section>

      <FooterD />
    </div>
  );
}

window.AtelierDesktop = { Home, Search, Listing, Provider, Dashboard };
