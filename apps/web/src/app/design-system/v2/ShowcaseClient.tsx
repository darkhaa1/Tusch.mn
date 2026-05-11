'use client';

import * as React from 'react';
import {
  Avatar,
  Button,
  DropCap,
  Input,
  KheeBorder,
  LabelMono,
  Placeholder,
  type PlaceholderTone,
  ScreenFrame,
  SectionHeader,
  StatusBar,
  Tag,
  Wordmark,
} from '@web/components/ui-v2';

type Palette = 'shoroo' | 'tal' | 'uuls';
type Typo = 'setguul' | 'songodog' | 'orchin';

const palettes: ReadonlyArray<{ id: Palette; label: string; sub: string }> = [
  { id: 'shoroo', label: 'Шороо', sub: 'Terre · cream' },
  { id: 'tal', label: 'Тал нутаг', sub: 'Sage · sky' },
  { id: 'uuls', label: 'Уулс', sub: 'Aubergine · ocre' },
];

const typos: ReadonlyArray<{ id: Typo; label: string; sub: string }> = [
  { id: 'setguul', label: 'Сэтгүүл', sub: 'Italic editorial' },
  { id: 'songodog', label: 'Сонгодог', sub: 'Upright serif' },
  { id: 'orchin', label: 'Орчин үе', sub: 'Modern sans' },
];

const tones: ReadonlyArray<PlaceholderTone> = [
  'sand',
  'terre',
  'rose',
  'ocre',
  'olive',
  'cobalt',
  'pourpre',
  'cream',
];

export function ShowcaseClient(): React.ReactElement {
  const [palette, setPalette] = React.useState<Palette>('shoroo');
  const [typo, setTypo] = React.useState<Typo>('setguul');
  const [ornament, setOrnament] = React.useState<number>(60);

  React.useEffect(() => {
    const root = document.documentElement;
    if (palette === 'shoroo') root.removeAttribute('data-palette');
    else root.dataset.palette = palette;
  }, [palette]);

  React.useEffect(() => {
    const root = document.documentElement;
    if (typo === 'setguul') root.removeAttribute('data-typo');
    else root.dataset.typo = typo;
  }, [typo]);

  React.useEffect(() => {
    const root = document.documentElement;
    const orn = Math.max(0, Math.min(100, ornament)) / 100;
    root.style.setProperty('--at-ornament', String(orn));
    root.style.setProperty('--at-khee-display', orn < 0.15 ? 'none' : 'block');
    root.style.setProperty('--at-flourish-display', orn < 0.25 ? 'none' : 'inline');
    return () => {
      // intentionally leave values in place; navigating away keeps tweaks
    };
  }, [ornament]);

  return (
    <ScreenFrame>
      <header className="py-10">
        <LabelMono>Дизайн систем · v2</LabelMono>
        <h1
          className="m-0 mt-2"
          style={{
            fontFamily: 'var(--at-serif)',
            fontSize: 56,
            fontWeight: 400,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          Atelier <em style={{ fontStyle: 'var(--at-italic-style, italic)', color: 'var(--at-terre)' }}>tusch</em>
          <span style={{ color: 'var(--at-terre)' }}>.</span>
        </h1>
      </header>

      <Controls
        palette={palette}
        onPalette={setPalette}
        typo={typo}
        onTypo={setTypo}
        ornament={ornament}
        onOrnament={setOrnament}
      />

      <Section title="Wordmark" number="№ 01">
        <div className="flex flex-wrap items-baseline gap-8">
          <Wordmark size={20} />
          <Wordmark size={28} />
          <Wordmark size={48} />
          <Wordmark size={72} dotColor="var(--at-cobalt)" italColor="var(--at-cobalt)" />
        </div>
      </Section>

      <Section title="Button" number="№ 02">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm">
            Санал илгээх
          </Button>
          <Button variant="primary" size="md">
            Санал илгээх
          </Button>
          <Button variant="primary" size="lg">
            Санал илгээх
          </Button>
          <Button variant="outline">Зурвас</Button>
          <Button variant="ghost">Цуцлах</Button>
          <Button variant="primary" italic>
            Үргэлжлүүлэх
          </Button>
          <Button variant="primary" disabled>
            Идэвхгүй
          </Button>
        </div>
      </Section>

      <Section title="Input" number="№ 03">
        <div className="grid gap-4 md:grid-cols-2 max-w-3xl">
          <Input label="Хайх" placeholder="Сантехникч, иогийн багш…" />
          <Input
            label="Имэйл"
            placeholder="name@example.mn"
            error="И-мэйл хаяг буруу байна"
          />
          <Input label="Дүүрэг" placeholder="УБ · СБД" hint="Хорооллоо сонгоно уу" />
          <Input label="Цаг" placeholder="14:30" />
        </div>
      </Section>

      <Section title="Tag" number="№ 04">
        <div className="flex flex-wrap gap-2">
          <Tag variant="active">Бүгд</Tag>
          <Tag variant="inactive">Сантехник</Tag>
          <Tag variant="inactive">Цахилгаан</Tag>
          <Tag variant="inactive">Будалт</Tag>
          <Tag variant="outline-tone" tone="terre">
            Засвар
          </Tag>
          <Tag variant="outline-tone" tone="olive">
            Цэвэрлэгээ
          </Tag>
          <Tag variant="outline-tone" tone="cobalt">
            Дасгал
          </Tag>
          <Tag italic variant="inactive">
            Паркетан шал
          </Tag>
          <Tag mono variant="active">
            Тохиромж
          </Tag>
        </div>
      </Section>

      <Section title="Avatar" number="№ 05">
        <div className="flex items-end gap-4">
          <Avatar size="sm" initial="О" />
          <Avatar size="md" initial="Б" />
          <Avatar size="lg" initial="М" />
          <Avatar size="xl" initial="Ц" />
          <Avatar size="lg" tone="terre" />
          <Avatar size="lg" tone="olive" />
          <Avatar size="lg" tone="cobalt" />
        </div>
      </Section>

      <Section title="Placeholder" number="№ 06">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tones.map((t) => (
            <Placeholder key={t} tone={t} height={140} label={t} />
          ))}
        </div>
        <div className="mt-4">
          <Placeholder tone="terre" height={120} label="Шигүү" dense />
        </div>
      </Section>

      <Section title="Khee border" number="№ 07">
        <div className="flex flex-col gap-3">
          <KheeBorder height={10} />
          <KheeBorder height={14} color="var(--at-cobalt)" />
          <KheeBorder height={10} color="var(--at-olive)" opacity={0.5} />
        </div>
      </Section>

      <Section title="LabelMono" number="№ 08">
        <div className="flex flex-wrap gap-6 items-baseline">
          <LabelMono>Брийф · 2026 · Монгол</LabelMono>
          <LabelMono tone="ink">Идэвхтэй хүсэлт</LabelMono>
          <LabelMono tone="terre">Засвар</LabelMono>
          <LabelMono tone="cobalt" size="sm">
            Баталгаажсан
          </LabelMono>
        </div>
      </Section>

      <Section title="SectionHeader" number="№ 09">
        <div className="flex flex-col gap-8">
          <SectionHeader
            number="№ 01"
            title={
              <>
                Зургаан <em style={{ fontStyle: 'var(--at-italic-style, italic)', color: 'var(--at-terre)' }}>ангилал</em>, нэг товчоор.
              </>
            }
            action={<LabelMono tone="ink">Бүгдийг үзэх →</LabelMono>}
            size="lg"
          />
          <SectionHeader
            title="Ойролцоо"
            subtitle="1,2 км дотор"
            italic
            action={<LabelMono>1,2 КМ</LabelMono>}
          />
        </div>
      </Section>

      <Section title="DropCap" number="№ 10">
        <div className="max-w-xl">
          <DropCap color="var(--at-terre)" size={42}>
            Зочны өрөө, унтлагын өрөө. Царс модон паркетыг өөрөө хангана. Шалны бэлтгэл, бортого
            орно. Хүнд тавилга шилжүүлэхэд тусална. Цэвэрхэн ажилладаг, дурсамж бэлэн.
          </DropCap>
        </div>
      </Section>

      <Section title="StatusBar (mobile)" number="№ 11">
        <div className="max-w-sm border border-atelier-line bg-atelier-paper">
          <StatusBar />
          <div className="px-6 py-4">
            <LabelMono>Утасны статус самбар (зөвхөн мобайл)</LabelMono>
          </div>
        </div>
      </Section>

      <Section title="Combined card sample" number="№ 12">
        <article
          className="max-w-md border-t border-b border-atelier-line py-4 flex gap-4 items-center"
        >
          <Avatar size="lg" initial="Б" />
          <div className="flex-1 min-w-0">
            <div
              style={{
                fontFamily: 'var(--at-serif)',
                fontWeight: 500,
                fontSize: 16,
              }}
            >
              Бат-Эрдэнэ Б.
            </div>
            <div className="text-atelier-muted text-xs mt-1">
              Сантехникч · 12 жилийн туршлага
            </div>
            <div className="mt-2 flex gap-2">
              <Tag variant="outline-tone" tone="terre">
                Засвар
              </Tag>
              <Tag italic>★ 4,9</Tag>
            </div>
          </div>
        </article>
      </Section>

      <div className="h-20" />
    </ScreenFrame>
  );
}

interface SectionProps {
  title: string;
  number?: string;
  children: React.ReactNode;
}

function Section({ title, number, children }: SectionProps): React.ReactElement {
  return (
    <section className="py-10 border-t border-atelier-line">
      <SectionHeader title={title} number={number} italic />
      <div className="mt-6">{children}</div>
    </section>
  );
}

interface ControlsProps {
  palette: Palette;
  onPalette: (p: Palette) => void;
  typo: Typo;
  onTypo: (t: Typo) => void;
  ornament: number;
  onOrnament: (n: number) => void;
}

function Controls({
  palette,
  onPalette,
  typo,
  onTypo,
  ornament,
  onOrnament,
}: ControlsProps): React.ReactElement {
  return (
    <div className="sticky top-0 z-30 -mx-5 md:-mx-14 px-5 md:px-14 py-4 bg-atelier-cream border-y border-atelier-line">
      <div className="grid gap-6 md:grid-cols-3 items-start">
        <fieldset>
          <legend>
            <LabelMono>Палитр</LabelMono>
          </legend>
          <div className="mt-2 flex gap-2">
            {palettes.map((p) => (
              <label
                key={p.id}
                className={[
                  'flex-1 cursor-pointer border px-2 py-2 text-center',
                  palette === p.id
                    ? 'border-atelier-ink bg-atelier-paper'
                    : 'border-atelier-line bg-transparent',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="palette"
                  value={p.id}
                  checked={palette === p.id}
                  onChange={() => onPalette(p.id)}
                  className="sr-only"
                />
                <div
                  style={{
                    fontFamily: 'var(--at-serif)',
                    fontStyle: 'var(--at-italic-style, italic)',
                    fontSize: 13,
                  }}
                >
                  {p.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--at-mono)',
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    color: 'var(--at-muted)',
                  }}
                >
                  {p.sub}
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <LabelMono>Маяг</LabelMono>
          </legend>
          <div className="mt-2 flex gap-2">
            {typos.map((t) => (
              <label
                key={t.id}
                className={[
                  'flex-1 cursor-pointer border px-2 py-2 text-center',
                  typo === t.id
                    ? 'border-atelier-ink bg-atelier-paper'
                    : 'border-atelier-line bg-transparent',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="typo"
                  value={t.id}
                  checked={typo === t.id}
                  onChange={() => onTypo(t.id)}
                  className="sr-only"
                />
                <div
                  style={{
                    fontFamily: t.id === 'orchin' ? 'var(--font-dm-sans)' : 'var(--at-serif)',
                    fontStyle: t.id === 'setguul' ? 'italic' : 'normal',
                    fontSize: 13,
                  }}
                >
                  {t.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--at-mono)',
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    color: 'var(--at-muted)',
                  }}
                >
                  {t.sub}
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <LabelMono>Чимэглэл · {ornament}%</LabelMono>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={ornament}
            onChange={(e) => onOrnament(Number(e.target.value))}
            aria-label="Чимэглэлийн хэв"
            className="w-full mt-2 accent-atelier-ink"
          />
        </div>
      </div>
    </div>
  );
}
