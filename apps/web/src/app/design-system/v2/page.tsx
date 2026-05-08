import type { Metadata } from 'next';
import {
  Button,
  Input,
  Tag,
  Avatar,
  Placeholder,
  KheeBorder,
  StatusBar,
  TabBar,
  LabelMono,
  SectionHeader,
  DropCap,
} from '@web/components/ui-v2';

export const metadata: Metadata = {
  title: 'Design System v2 — Atelier / Гэр',
  robots: { index: false, follow: false },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-b border-atelier-line py-10">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-atelier-muted">{title}</h2>
      {children}
    </section>
  );
}

function Row({ children, wrap = true }: { children: React.ReactNode; wrap?: boolean }) {
  return (
    <div className={['flex items-center gap-4', wrap ? 'flex-wrap' : ''].join(' ')}>{children}</div>
  );
}

function Swatch({ color, name, hex }: { color: string; name: string; hex: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-14 w-28 border border-atelier-line" style={{ backgroundColor: hex }} />
      <LabelMono>{name}</LabelMono>
      <span className="font-mono text-[10px] text-atelier-muted/60">{hex}</span>
    </div>
  );
}

export default function DesignSystemV2Page() {
  return (
    <div className="min-h-screen bg-atelier-paper">
      {/* Header */}
      <header className="border-b border-atelier-line bg-atelier-paper px-6 py-8">
        <KheeBorder className="mb-6" />
        <h1 className="font-serif text-4xl italic text-atelier-ink">Atelier / Гэр</h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-atelier-muted">
          Design System v2 — Tusch.mn
        </p>
      </header>

      <main className="mx-auto max-w-2xl px-6">

        {/* COLORS */}
        <Section title="Өнгөт токен / Colour Tokens">
          <div className="flex flex-wrap gap-6">
            <Swatch color="ink" name="ink" hex="#1a1714" />
            <Swatch color="cream" name="cream" hex="#f4ede1" />
            <Swatch color="paper" name="paper" hex="#faf6ee" />
            <Swatch color="sand" name="sand" hex="#e8ddc8" />
            <Swatch color="terre" name="terre" hex="#a8542a" />
            <Swatch color="olive" name="olive" hex="#5e6b3a" />
            <Swatch color="muted" name="muted" hex="#8a7f6f" />
            <Swatch color="line" name="line" hex="#d9cfba" />
          </div>
        </Section>

        {/* TYPOGRAPHY */}
        <Section title="Типографи / Typography">
          <div className="flex flex-col gap-5">
            <div>
              <LabelMono className="mb-2 block">Noto Serif — font-serif</LabelMono>
              <p className="font-serif text-4xl text-atelier-ink">
                Монголын гэр бүл
              </p>
              <p className="font-serif text-4xl italic text-atelier-terre">
                Italic — Гэр бүл
              </p>
              <p className="font-serif text-xl font-medium text-atelier-ink">
                Medium 500 — Засвар үйлчилгээ
              </p>
              <p className="font-serif text-sm text-atelier-muted">
                Small — Дэлгэрэнгүй мэдээлэл
              </p>
            </div>

            <div>
              <LabelMono className="mb-2 block">Noto Sans — font-sans</LabelMono>
              <p className="font-sans text-2xl text-atelier-ink">
                Regular 400 — Үйлчилгээний тайлбар
              </p>
              <p className="font-sans text-base font-medium text-atelier-ink">
                Medium 500 — Санал болгох
              </p>
              <p className="font-sans text-sm text-atelier-muted">
                Small muted — Хоёрдогч мэдээлэл
              </p>
            </div>

            <div>
              <LabelMono className="mb-2 block">Noto Sans Mono — font-mono</LabelMono>
              <p className="font-mono text-base text-atelier-ink">
                МОНГОЛ КИРИЛЛ — MONGOLIAN CYRILLIC
              </p>
              <LabelMono>LABEL · METADATA · CAPS</LabelMono>
            </div>

            <div>
              <LabelMono className="mb-2 block">DropCap</LabelMono>
              <DropCap>
                Монголын гэр бүл бол нийгмийн суурь нэгж бөгөөд хамтын амьдрал, харилцан туслалцааны
                уламжлалт үнэт зүйлийг агуулсан байдаг. Гэр бүлийн гишүүд бие биенээ дэмжин
                хамтдаа хөгжих нь нийгмийн тогтвортой байдлыг хангадаг.
              </DropCap>
            </div>
          </div>
        </Section>

        {/* BUTTONS */}
        <Section title="Товч / Buttons">
          <div className="flex flex-col gap-4">
            <div>
              <LabelMono className="mb-3 block">Primary</LabelMono>
              <Row>
                <Button variant="primary" size="sm">Жижиг</Button>
                <Button variant="primary" size="md">Захиалах</Button>
                <Button variant="primary" size="lg">Том товч</Button>
                <Button variant="primary" disabled>Идэвхгүй</Button>
              </Row>
            </div>
            <div>
              <LabelMono className="mb-3 block">Outline (italic serif)</LabelMono>
              <Row>
                <Button variant="outline" size="sm">Жижиг</Button>
                <Button variant="outline" size="md">Дэлгэрэнгүй</Button>
                <Button variant="outline" size="lg">Том</Button>
              </Row>
            </div>
            <div>
              <LabelMono className="mb-3 block">Ghost</LabelMono>
              <Row>
                <Button variant="ghost" size="sm">Болих</Button>
                <Button variant="ghost" size="md">Буцах</Button>
                <Button variant="ghost" size="lg">Хаах</Button>
              </Row>
            </div>
            <div>
              <LabelMono className="mb-3 block">Full width</LabelMono>
              <Button variant="primary" fullWidth>Бүтэн өргөн</Button>
            </div>
          </div>
        </Section>

        {/* INPUTS */}
        <Section title="Оролт / Inputs">
          <div className="flex flex-col gap-4 max-w-sm">
            <Input placeholder="Placeholder текст" />
            <Input label="Нэр" placeholder="Нэрээ оруулна уу" />
            <Input label="Хайлт" type="search" placeholder="Үйлчилгээ хайх..." />
            <Input
              label="Утасны дугаар"
              type="tel"
              placeholder="99 00 00 00"
              error="Буруу утасны дугаар"
            />
          </div>
        </Section>

        {/* TAGS */}
        <Section title="Шошго / Tags">
          <Row>
            <Tag variant="active">Засвар</Tag>
            <Tag variant="active">Сантехник</Tag>
            <Tag variant="inactive">Цэвэрлэгээ</Tag>
            <Tag variant="inactive">Зөөвөрлөлт</Tag>
            <Tag variant="inactive">Барилга</Tag>
            <Tag variant="inactive">Мужаан</Tag>
          </Row>
        </Section>

        {/* AVATARS */}
        <Section title="Нүүр зураг / Avatars">
          <div className="flex flex-col gap-6">
            <div>
              <LabelMono className="mb-3 block">Тонууд (fallback)</LabelMono>
              <Row>
                <Avatar size="xl" tone="sand" initials="БД" />
                <Avatar size="xl" tone="terre" initials="МЭ" />
                <Avatar size="xl" tone="olive" initials="УБ" />
              </Row>
            </div>
            <div>
              <LabelMono className="mb-3 block">Хэмжээ</LabelMono>
              <Row wrap={false} >
                <Avatar size="sm" tone="sand" initials="SM" />
                <Avatar size="md" tone="terre" initials="MD" />
                <Avatar size="lg" tone="olive" initials="LG" />
                <Avatar size="xl" tone="sand" initials="XL" />
              </Row>
            </div>
          </div>
        </Section>

        {/* PLACEHOLDERS */}
        <Section title="Дүрс орлуулагч / Placeholders">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <LabelMono className="mb-2 block">Sand</LabelMono>
              <Placeholder tone="sand" height={120} label="ЗУРАГ БАЙХГҮЙ" />
            </div>
            <div>
              <LabelMono className="mb-2 block">Terre</LabelMono>
              <Placeholder tone="terre" height={120} label="ЗУРАГ БАЙХГҮЙ" />
            </div>
            <div>
              <LabelMono className="mb-2 block">Olive</LabelMono>
              <Placeholder tone="olive" height={120} />
            </div>
            <div>
              <LabelMono className="mb-2 block">Beige</LabelMono>
              <Placeholder tone="beige" height={120} />
            </div>
            <div className="col-span-2">
              <LabelMono className="mb-2 block">Aspect ratio 16/9</LabelMono>
              <Placeholder tone="sand" aspectRatio="16/9" label="COVER ЗУРАГ" />
            </div>
          </div>
        </Section>

        {/* KHEE BORDER */}
        <Section title="Хээ / KheeBorder">
          <div className="flex flex-col gap-4">
            <div>
              <LabelMono className="mb-2 block">Terre (default)</LabelMono>
              <KheeBorder />
            </div>
            <div>
              <LabelMono className="mb-2 block">Olive</LabelMono>
              <KheeBorder color="#5e6b3a" />
            </div>
            <div>
              <LabelMono className="mb-2 block">Muted, height 14</LabelMono>
              <KheeBorder color="#8a7f6f" height={14} />
            </div>
            <div>
              <LabelMono className="mb-2 block">Ink, height 6</LabelMono>
              <KheeBorder color="#1a1714" height={6} />
            </div>
          </div>
        </Section>

        {/* SECTION HEADER + LABEL MONO */}
        <Section title="Хэсгийн гарчиг / SectionHeader + LabelMono">
          <div className="flex flex-col gap-4">
            <SectionHeader title="Санал болгох үйлчилгээ" action="Бүгдийг харах →" />
            <SectionHeader title="Сүүлийн захиалгууд" />
            <SectionHeader title="Дуусгасан ажлууд" action="12 бүгд" />
            <div className="mt-2 flex flex-wrap gap-4">
              <LabelMono>Сантехник</LabelMono>
              <LabelMono>4.8 ★</LabelMono>
              <LabelMono className="text-atelier-terre">Шинэ</LabelMono>
              <LabelMono className="text-atelier-olive">Баталгаажсан</LabelMono>
            </div>
          </div>
        </Section>

        {/* STATUS BAR */}
        <Section title="Статус мөр / StatusBar (mobile)">
          <div className="max-w-xs overflow-hidden border border-atelier-line">
            <StatusBar time="9:41" />
            <div className="bg-atelier-paper p-4">
              <p className="font-sans text-sm text-atelier-muted">Дэлгэцийн дээд хэсэг</p>
            </div>
          </div>
        </Section>

        {/* TAB BAR */}
        <Section title="Доод навигаци / TabBar (mobile)">
          <div className="max-w-xs overflow-hidden border border-atelier-line">
            <div className="bg-atelier-paper p-4 text-center">
              <p className="font-sans text-sm text-atelier-muted">Агуулга</p>
            </div>
            <TabBar active="home" />
          </div>
          <div className="mt-4 max-w-xs overflow-hidden border border-atelier-line">
            <div className="bg-atelier-paper p-4 text-center">
              <p className="font-sans text-sm text-atelier-muted">Агуулга</p>
            </div>
            <TabBar active="search" />
          </div>
          <div className="mt-4 max-w-xs overflow-hidden border border-atelier-line">
            <div className="bg-atelier-paper p-4 text-center">
              <p className="font-sans text-sm text-atelier-muted">Агуулга</p>
            </div>
            <TabBar active="create" />
          </div>
        </Section>

        {/* COMBINED PREVIEW */}
        <Section title="Нэгдсэн жишээ / Combined preview">
          <div className="border border-atelier-line bg-atelier-paper">
            <StatusBar />
            <div className="p-4">
              <KheeBorder className="mb-4" />
              <SectionHeader
                title="Санал болгох"
                action="Бүгдийг харах"
                className="mb-4"
              />
              <div className="flex gap-3 overflow-x-auto pb-2">
                {['Засвар', 'Сантехник', 'Цэвэрлэгээ'].map((cat) => (
                  <Tag key={cat} variant="inactive">{cat}</Tag>
                ))}
                <Tag variant="active">Барилга</Tag>
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-atelier-line pt-4">
                <Avatar size="md" tone="terre" initials="БД" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-sm font-medium text-atelier-ink">
                    Болд Дорж
                  </span>
                  <LabelMono>Сантехник · 4.9 ★ · 3 жил</LabelMono>
                </div>
              </div>
              <Placeholder tone="sand" height={100} label="COVER" className="mt-4" />
            </div>
            <TabBar active="home" />
          </div>
        </Section>

      </main>

      <footer className="mt-10 px-6 pb-10">
        <KheeBorder className="mb-6" />
        <LabelMono>Atelier / Гэр — Tusch.mn Design System v2 — 2026</LabelMono>
      </footer>
    </div>
  );
}
