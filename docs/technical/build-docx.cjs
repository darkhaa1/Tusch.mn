/**
 * Assemble la documentation technique Tusch.mn en un seul .docx.
 *
 * Lit les chapitres Markdown de ./chapters, embarque les diagrammes PNG de
 * ./diagrams, et produit ./output/Tusch-Documentation-Technique-FR.docx avec
 * page de garde, sommaire automatique, en-têtes/pieds de page numérotés et
 * styles cohérents (Heading 1/2/3, blocs de code, tables, légendes de figures).
 *
 * Lancement (docx installé dans le sandbox de build) :
 *   NODE_PATH=<...>/build-docx/node_modules node build-docx.js
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, Header, Footer, AlignmentType, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak, TableOfContents,
  ExternalHyperlink, VerticalAlign,
} = require("docx");

const HERE = __dirname;
const CHAPTERS_DIR = path.join(HERE, "chapters");
const DIAGRAMS_DIR = path.join(HERE, "diagrams");
const OUT_DIR = path.join(HERE, "output");
const OUT_FILE = path.join(OUT_DIR, "Tusch-Documentation-Technique-FR.docx");

// Palette Atelier
const INK = "1A1714", TERRE = "A8542A", SAND = "E8DDC8", LINE = "D9CFBA",
      CREAM = "F4EDE1", CODEBG = "F2EFE8", MUTED = "8A7F6F";

const CONTENT_WIDTH = 9360; // US Letter, marges 1"
const MONO = "Consolas";

// ── Dimensions PNG (lecture de l'en-tête) ────────────────────────────────
function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

// ── Parsing inline : **gras**, `code`, [texte](url) ──────────────────────
function inlineRuns(text, base = {}) {
  const runs = [];
  // tokenise sur les motifs markdown inline
  const re = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, m;
  const pushPlain = (s) => { if (s) runs.push(new TextRun({ text: s, ...base })); };
  while ((m = re.exec(text)) !== null) {
    pushPlain(text.slice(last, m.index));
    if (m[1]) runs.push(new TextRun({ text: m[2], bold: true, ...base }));
    else if (m[3]) runs.push(new TextRun({ text: m[4], font: MONO, ...base }));
    else if (m[5]) {
      runs.push(new ExternalHyperlink({
        link: m[7],
        children: [new TextRun({ text: m[6], style: "Hyperlink" })],
      }));
    }
    last = re.lastIndex;
  }
  pushPlain(text.slice(last));
  return runs.length ? runs : [new TextRun({ text: "", ...base })];
}

// ── Lexer Markdown → blocs ───────────────────────────────────────────────
function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];

    if (line.trim() === "") { i++; continue; }

    // Code fence
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) { code.push(lines[i]); i++; }
      i++; // ferme le fence
      blocks.push({ type: "code", lang, code });
      continue;
    }

    // Heading
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) { blocks.push({ type: "heading", level: h[1].length, text: h[2].trim() }); i++; continue; }

    // Image
    const img = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/.exec(line);
    if (img) { blocks.push({ type: "image", alt: img[1], src: img[2] }); i++; continue; }

    // Caption (ligne en italique seule, juste après une image)
    const cap = /^\*([^*].*?)\*\s*$/.exec(line);
    if (cap && blocks.length && blocks[blocks.length - 1].type === "image") {
      blocks.push({ type: "caption", text: cap[1] }); i++; continue;
    }

    // Blockquote (fusionne les lignes consécutives)
    if (line.startsWith(">")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, "")); i++;
      }
      blocks.push({ type: "quote", text: buf.join(" ").trim() });
      continue;
    }

    // Table
    if (line.trim().startsWith("|")) {
      const tbl = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) { tbl.push(lines[i]); i++; }
      const rows = tbl
        .map((r) => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim()));
      // retire la ligne séparatrice ---|---
      const body = rows.filter((r) => !r.every((c) => /^:?-{1,}:?$/.test(c)));
      blocks.push({ type: "table", rows: body });
      continue;
    }

    // Liste à puces / checklist
    if (/^\s*-\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        let t = lines[i].replace(/^\s*-\s+/, "");
        t = t.replace(/^\[[ xX]\]\s*/, ""); // checklist
        items.push(t);
        i++;
      }
      blocks.push({ type: "bullets", items });
      continue;
    }

    // Règle horizontale
    if (/^---+$/.test(line.trim())) { blocks.push({ type: "hr" }); i++; continue; }

    // Paragraphe (une ligne logique)
    blocks.push({ type: "para", text: line.trim() });
    i++;
  }
  return blocks;
}

// ── Conversion blocs → éléments docx ─────────────────────────────────────
function tableCell(text, { header = false, widthDxa } = {}) {
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    shading: header ? { fill: SAND, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 110, right: 110 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      spacing: { before: 20, after: 20 },
      children: inlineRuns(text, header ? { bold: true, color: INK } : {}),
    })],
  });
}

function blocksToElements(blocks) {
  const out = [];
  const border = { style: BorderStyle.SINGLE, size: 2, color: LINE };
  const borders = { top: border, bottom: border, left: border, right: border,
                    insideHorizontal: border, insideVertical: border };

  for (const b of blocks) {
    switch (b.type) {
      case "heading": {
        const map = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2,
                      3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 };
        out.push(new Paragraph({
          heading: map[b.level] || HeadingLevel.HEADING_4,
          pageBreakBefore: b.level === 1,
          children: inlineRuns(b.text),
        }));
        break;
      }
      case "para":
        out.push(new Paragraph({ spacing: { after: 120, line: 276 }, children: inlineRuns(b.text) }));
        break;
      case "quote":
        out.push(new Paragraph({
          spacing: { before: 80, after: 120, line: 276 },
          indent: { left: 240 },
          border: { left: { style: BorderStyle.SINGLE, size: 18, color: TERRE, space: 12 } },
          shading: { fill: CREAM, type: ShadingType.CLEAR, color: "auto" },
          children: inlineRuns(b.text, { italics: true, color: "4A4036" }),
        }));
        break;
      case "code": {
        const lines = b.code.length ? b.code : [""];
        lines.forEach((ln, idx) => {
          out.push(new Paragraph({
            shading: { fill: CODEBG, type: ShadingType.CLEAR, color: "auto" },
            spacing: { before: idx === 0 ? 60 : 0, after: idx === lines.length - 1 ? 60 : 0, line: 240 },
            indent: { left: 120, right: 120 },
            children: [new TextRun({ text: ln || " ", font: MONO, size: 18, color: "2A2520" })],
          }));
        });
        break;
      }
      case "bullets":
        b.items.forEach((it) => {
          out.push(new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40, line: 264 },
            children: inlineRuns(it),
          }));
        });
        break;
      case "table": {
        if (!b.rows.length) break;
        const ncol = Math.max(...b.rows.map((r) => r.length));
        const colW = Math.floor(CONTENT_WIDTH / ncol);
        const widths = Array(ncol).fill(colW);
        widths[ncol - 1] = CONTENT_WIDTH - colW * (ncol - 1);
        const rows = b.rows.map((cells, ri) => {
          const padded = [...cells];
          while (padded.length < ncol) padded.push("");
          return new TableRow({
            tableHeader: ri === 0,
            children: padded.map((c, ci) =>
              tableCell(c, { header: ri === 0, widthDxa: widths[ci] })),
          });
        });
        out.push(new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: widths,
          borders,
          rows,
        }));
        out.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
        break;
      }
      case "image": {
        const file = path.resolve(DIAGRAMS_DIR, path.basename(b.src));
        if (!fs.existsSync(file)) break;
        const { w, h } = pngSize(file);
        const maxW = 624, maxH = 760;
        let dw = maxW, dh = Math.round((h / w) * dw);
        if (dh > maxH) { dh = maxH; dw = Math.round((w / h) * dh); }
        out.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 40 },
          children: [new ImageRun({
            type: "png",
            data: fs.readFileSync(file),
            transformation: { width: dw, height: dh },
            altText: { title: b.alt || "figure", description: b.alt || "figure", name: path.basename(file) },
          })],
        }));
        break;
      }
      case "caption":
        out.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: inlineRuns(b.text, { italics: true, size: 18, color: MUTED }),
        }));
        break;
      case "hr":
        out.push(new Paragraph({
          spacing: { before: 60, after: 60 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 1 } },
          children: [],
        }));
        break;
    }
  }
  return out;
}

// ── Page de garde ────────────────────────────────────────────────────────
function coverPage() {
  const t = (text, opts) => new Paragraph({ alignment: AlignmentType.CENTER, ...opts.p,
    children: [new TextRun({ text, ...opts.r })] });
  return [
    new Paragraph({ spacing: { before: 2600 }, children: [] }),
    t("TUSCH.MN", { p: { spacing: { after: 60 } }, r: { bold: true, size: 72, color: TERRE, font: "Arial" } }),
    t("Documentation Technique", { p: { spacing: { after: 40 } }, r: { size: 44, color: INK, font: "Arial" } }),
    t("Marketplace mongole de services entre particuliers", { p: { spacing: { after: 600 } }, r: { size: 24, italics: true, color: MUTED } }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 },
      border: { top: { style: BorderStyle.SINGLE, size: 8, color: LINE, space: 8 },
                bottom: { style: BorderStyle.SINGLE, size: 8, color: LINE, space: 8 } },
      children: [new TextRun({ text: "Next.js · NestJS · PostgreSQL · Prisma · Proxmox", size: 22, color: INK })],
    }),
    new Paragraph({ spacing: { before: 800 }, children: [] }),
    t("Auteur : Darkhansukh", { p: { spacing: { after: 40 } }, r: { size: 24, color: INK } }),
    t("Version : 1.0 — branche dev", { p: { spacing: { after: 40 } }, r: { size: 24, color: INK } }),
    t("Date : 20 mai 2026", { p: { spacing: { after: 40 } }, r: { size: 24, color: INK } }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── TOC ──────────────────────────────────────────────────────────────────
function tocPage() {
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Sommaire")] }),
    new TableOfContents("Sommaire", { hyperlink: true, headingStyleRange: "1-3" }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── Assemblage ─────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs.readdirSync(CHAPTERS_DIR).filter((f) => f.endsWith(".md")).sort();
  const body = [];
  for (const f of files) {
    const md = fs.readFileSync(path.join(CHAPTERS_DIR, f), "utf-8");
    body.push(...blocksToElements(parseMarkdown(md)));
  }

  const heading = (size, lvl) => ({
    run: { size, bold: true, font: "Arial", color: INK },
    paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: lvl },
  });

  const doc = new Document({
    creator: "Darkhansukh",
    title: "Tusch.mn — Documentation Technique",
    styles: {
      default: { document: { run: { font: "Arial", size: 21 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 34, bold: true, font: "Arial", color: TERRE },
          paragraph: { spacing: { before: 320, after: 200 }, outlineLevel: 0,
            border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: LINE, space: 6 } } } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, ...heading(27, 1) },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, ...heading(23, 2) },
        { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 21, bold: true, italics: true, font: "Arial", color: "4A4036" },
          paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 3 } },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({ children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
          children: [new TextRun({ text: "Tusch.mn — Documentation Technique", size: 16, color: MUTED })],
        })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
          children: [
            new TextRun({ text: "Page ", size: 16, color: MUTED }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED }),
            new TextRun({ text: " / ", size: 16, color: MUTED }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: MUTED }),
          ],
        })] }),
      },
      children: [...coverPage(), ...tocPage(), ...body],
    }],
  });

  Packer.toBuffer(doc).then((buf) => {
    fs.writeFileSync(OUT_FILE, buf);
    console.log("écrit :", OUT_FILE, `(${(buf.length / 1024).toFixed(0)} Ko)`);
  });
}

main();
