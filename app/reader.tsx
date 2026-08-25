"use client";

import {
  Fragment,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DUNA_CHAPTER_ONE } from "./duna-chapter-1";
import { DUNA_CHAPTER_TWO } from "./duna-chapter-2";
import { DUNA_CHAPTER_THREE } from "./duna-chapter-3";
import { DUNA_CHAPTER_FOUR } from "./duna-chapter-4";
import { DUNA_CHAPTER_FIVE } from "./duna-chapter-5";
import { DUNA_CHAPTER_SIX } from "./duna-chapter-6";
import { DUNA_CHAPTER_SEVEN } from "./duna-chapter-7";

type Chapter = { id: string; title: string; content: string };
type Book = { id: string; title: string; author: string; chapters: Chapter[] };
type Theme = "paper" | "sepia" | "dusk";
type FontFamily = "lora" | "geist" | "georgia" | "palatino";
type ReadingPosition = { bookId: string; chapterId: string; y: number };

const FONT_OPTIONS: { id: FontFamily; label: string; detail: string }[] = [
  { id: "lora", label: "Lora", detail: "Literária" },
  { id: "geist", label: "Geist", detail: "Contemporânea" },
  { id: "georgia", label: "Georgia", detail: "Clássica" },
  { id: "palatino", label: "Palatino", detail: "Editorial" },
];

const FONT_STACKS: Record<FontFamily, string> = {
  lora: "var(--font-serif), Georgia, serif",
  geist: "var(--font-sans), Arial, sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  palatino: "Palatino, 'Palatino Linotype', 'Book Antiqua', serif",
};

const DUNA_BOOK: Book = {
  id: "duna-a-abdicacao",
  title: "Duna: A Abdicação",
  author: "7 capítulos disponíveis",
  chapters: [
    {
      id: "o-peso-das-colheitas",
      title: "O Peso das Colheitas",
      content: DUNA_CHAPTER_ONE,
    },
    {
      id: "o-futuro-mais-provavel",
      title: "O Futuro Mais Provável",
      content: DUNA_CHAPTER_TWO,
    },
    {
      id: "a-memoria-dos-erros",
      title: "A Memória dos Erros",
      content: DUNA_CHAPTER_THREE,
    },
    {
      id: "a-moral-dos-numeros",
      title: "A Moral dos Números",
      content: DUNA_CHAPTER_FOUR,
    },
    {
      id: "o-homem-que-disse-nao",
      title: "O Homem que Disse Não",
      content: DUNA_CHAPTER_FIVE,
    },
    {
      id: "a-correcao",
      title: "A Correção",
      content: DUNA_CHAPTER_SIX,
    },
    {
      id: "um-nome-impossivel",
      title: "Um Nome Impossível",
      content: DUNA_CHAPTER_SEVEN,
    },
  ],
};

const SAMPLE_BOOK: Book = {
  id: "jardim-silencioso",
  title: "O jardim silencioso",
  author: "Livro de demonstração",
  chapters: [
    {
      id: "a-casa",
      title: "A casa no fim da rua",
      content: `# A casa no fim da rua

No fim da rua havia uma casa que parecia guardar o último pedaço de tarde. As janelas eram altas, as paredes cobertas de hera e, no quintal, uma figueira desenhava sombras sobre o chão.

Clara passava por ali todos os dias. Nunca vira alguém entrar ou sair, mas sempre encontrava um detalhe novo: uma cortina entreaberta, um vaso mudado de lugar, o som breve de páginas sendo viradas.

> Algumas casas esperam por seus moradores. Outras esperam por seus leitores.

Naquela terça-feira, o portão estava aberto.

## Um convite

Sobre o primeiro degrau havia um envelope sem nome. Dentro dele, apenas uma frase: **“Entre devagar. Toda história precisa de silêncio para começar.”**`,
    },
    {
      id: "biblioteca",
      title: "A biblioteca de vidro",
      content: `# A biblioteca de vidro

A sala era maior do que a casa permitia. Estantes subiam até um teto invisível, e cada lombada carregava uma data — algumas do passado, outras de anos que ainda não tinham chegado.

Clara tocou o volume marcado com o dia de seu nascimento. O livro se abriu sozinho.

## O que os livros guardam

- Lugares que deixamos para trás
- Perguntas que ainda não sabemos fazer
- A lembrança exata de uma voz

Ela fechou o livro antes de chegar à última página. Certos finais pedem tempo.`,
    },
    {
      id: "primeira-luz",
      title: "Primeira luz",
      content: `# Primeira luz

Quando saiu da biblioteca, a manhã já encostava nos telhados. Clara levava um único livro debaixo do braço — sem título, sem data, com todas as páginas em branco.

No jardim, a figueira estremecia com o vento.

---

Ela se sentou no degrau, abriu o livro e escreveu a primeira linha:

**“No fim da rua havia uma casa que parecia guardar o último pedaço de tarde.”**`,
    },
  ],
};

const PUBLISHED_BOOKS = [DUNA_BOOK, SAMPLE_BOOK];

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.md$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function chapterTitle(filename: string, content: string) {
  const heading = content.match(/^#\s+(.+)$/m)?.[1];
  return heading?.replace(/[*_`]/g, "").trim() || filename.replace(/\.md$/i, "").replace(/^\d+[\s._-]*/, "");
}

function chapterPreview(source: string) {
  return source
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .filter((block) => !/^\s*#{1,6}\s/.test(block) && !/^\s*---+\s*$/.test(block))
    .map((block) => block
      .replace(/^\s*>\s?/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[\*_`]/g, "")
      .replace(/\s+/g, " ")
      .trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((text) => text.length > 145 ? `${text.slice(0, 142).trim()}…` : text);
}

function inline(text: string): ReactNode[] {
  const token = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^\s)]+\))/g;
  return text.split(token).filter(Boolean).map((part, index) => {
    if (/^\*\*.*\*\*$/.test(part) || /^__.*__$/.test(part)) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (/^\*.*\*$/.test(part) || /^_.*_$/.test(part)) return <em key={index}>{part.slice(1, -1)}</em>;
    if (/^`.*`$/.test(part)) return <code key={index}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r/g, "").split("\n");
  const nodes: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length) nodes.push(<p key={`p-${nodes.length}`}>{inline(paragraph.join(" "))}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) nodes.push(<ul key={`l-${nodes.length}`}>{list.map((item, i) => <li key={i}>{inline(item)}</li>)}</ul>);
    list = [];
  };

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (code) { nodes.push(<pre key={`c-${nodes.length}`}><code>{code.join("\n")}</code></pre>); code = null; }
      else { flushParagraph(); flushList(); code = []; }
      return;
    }
    if (code) { code.push(line); return; }
    if (!line.trim()) { flushParagraph(); flushList(); return; }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      const children = inline(heading[2]);
      const key = `h-${nodes.length}`;
      if (heading[1].length === 1) nodes.push(<h1 key={key}>{children}</h1>);
      else if (heading[1].length === 2) nodes.push(<h2 key={key}>{children}</h2>);
      else nodes.push(<h3 key={key}>{children}</h3>);
      return;
    }
    if (/^---+$/.test(line.trim())) { flushParagraph(); flushList(); nodes.push(<hr key={`r-${nodes.length}`} />); return; }
    if (line.startsWith("> ")) { flushParagraph(); flushList(); nodes.push(<blockquote key={`q-${nodes.length}`}>{inline(line.slice(2))}</blockquote>); return; }
    const item = line.match(/^[-*+]\s+(.+)$/);
    if (item) { flushParagraph(); list.push(item[1]); return; }
    paragraph.push(line.trim());
  });
  flushParagraph(); flushList();
  if (code) nodes.push(<pre key={`c-${nodes.length}`}><code>{code.join("\n")}</code></pre>);
  return <>{nodes}</>;
}

export function BookReader() {
  const [books, setBooks] = useState<Book[]>(PUBLISHED_BOOKS);
  const [bookId, setBookId] = useState(DUNA_BOOK.id);
  const [chapterId, setChapterId] = useState(DUNA_BOOK.chapters[0].id);
  const [theme, setTheme] = useState<Theme>("paper");
  const [fontSize, setFontSize] = useState(19);
  const [fontFamily, setFontFamily] = useState<FontFamily>("lora");
  const [lineHeight, setLineHeight] = useState(1.83);
  const [paragraphMargin, setParagraphMargin] = useState(1.35);
  const [sidePadding, setSidePadding] = useState(56);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [resumePosition, setResumePosition] = useState<ReadingPosition | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("margem-library");
    const preferences = localStorage.getItem("margem-preferences");
    const savedPosition = localStorage.getItem("margem-reading-position");
    try {
      let availableBooks = PUBLISHED_BOOKS;
      if (stored) {
        const parsed = JSON.parse(stored) as Book[];
        const importedBooks = parsed.filter((saved) => !PUBLISHED_BOOKS.some((published) => published.id === saved.id));
        availableBooks = [...PUBLISHED_BOOKS, ...importedBooks];
        setBooks(availableBooks);
      }
      if (preferences) {
        const parsed = JSON.parse(preferences);
        if (["paper", "sepia", "dusk"].includes(parsed.theme)) setTheme(parsed.theme);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (["lora", "geist", "georgia", "palatino"].includes(parsed.fontFamily)) setFontFamily(parsed.fontFamily);
        if (typeof parsed.lineHeight === "number") setLineHeight(parsed.lineHeight);
        if (typeof parsed.paragraphMargin === "number") setParagraphMargin(parsed.paragraphMargin);
        if (typeof parsed.sidePadding === "number") setSidePadding(parsed.sidePadding);
        if (typeof parsed.letterSpacing === "number") setLetterSpacing(parsed.letterSpacing);
        if (parsed.bookId) setBookId(parsed.bookId);
        if (parsed.chapterId) setChapterId(parsed.chapterId);
      }
      if (savedPosition) {
        const parsed = JSON.parse(savedPosition) as ReadingPosition;
        const savedBook = availableBooks.find((item) => item.id === parsed.bookId);
        if (parsed.y > 160 && savedBook?.chapters.some((item) => item.id === parsed.chapterId)) setResumePosition(parsed);
      }
    } catch { /* Keep the published library if saved data is invalid. */ }
    fileRef.current?.setAttribute("webkitdirectory", "");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("margem-library", JSON.stringify(books));
    localStorage.setItem("margem-preferences", JSON.stringify({ theme, fontSize, fontFamily, lineHeight, paragraphMargin, sidePadding, letterSpacing, bookId, chapterId }));
  }, [books, theme, fontSize, fontFamily, lineHeight, paragraphMargin, sidePadding, letterSpacing, bookId, chapterId, ready]);

  useEffect(() => {
    if (!settingsOpen) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) setSettingsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("pointerdown", closeOnOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [settingsOpen]);

  useEffect(() => {
    if (!ready) return;
    let timer: ReturnType<typeof setTimeout>;
    const savePosition = () => {
      localStorage.setItem("margem-reading-position", JSON.stringify({ bookId, chapterId, y: Math.round(window.scrollY) }));
    };
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(savePosition, 180);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", savePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", savePosition);
    };
  }, [ready, bookId, chapterId]);

  const book = books.find((item) => item.id === bookId) || books[0];
  const chapterIndex = Math.max(0, book.chapters.findIndex((item) => item.id === chapterId));
  const chapter = book.chapters[chapterIndex] || book.chapters[0];
  const progress = Math.round(((chapterIndex + 1) / book.chapters.length) * 100);
  const previewParagraphs = chapterPreview(chapter.content);

  const rememberCurrentPosition = () => {
    localStorage.setItem("margem-reading-position", JSON.stringify({ bookId: book.id, chapterId: chapter.id, y: Math.round(window.scrollY) }));
  };

  const openChapter = (nextBookId: string, nextChapterId: string) => {
    rememberCurrentPosition();
    setBookId(nextBookId);
    setChapterId(nextChapterId);
    setSidebarOpen(false);
    setResumePosition(null);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const selectBook = (id: string) => {
    const next = books.find((item) => item.id === id);
    if (!next) return;
    openChapter(id, next.chapters[0].id);
  };

  const importBook = async (files: FileList | null) => {
    const markdownFiles = Array.from(files || []).filter((file) => file.name.toLowerCase().endsWith(".md"));
    if (!markdownFiles.length) return;
    const chapters = await Promise.all(markdownFiles.map(async (file, index) => {
      const content = await file.text();
      return { id: `${slug(file.name)}-${index}`, title: chapterTitle(file.name, content), content };
    }));
    const relative = markdownFiles[0].webkitRelativePath;
    const inferredTitle = relative ? relative.split("/")[0] : markdownFiles[0].name.replace(/\.md$/i, "");
    const id = `${slug(inferredTitle)}-${Date.now()}`;
    const next: Book = { id, title: inferredTitle.replace(/[-_]/g, " "), author: `${chapters.length} ${chapters.length === 1 ? "capítulo" : "capítulos"}`, chapters };
    setBooks((current) => [...current, next]);
    openChapter(id, chapters[0].id);
    if (fileRef.current) fileRef.current.value = "";
  };

  const go = (offset: number) => {
    const next = book.chapters[chapterIndex + offset];
    if (next) openChapter(book.id, next.id);
  };

  const resumeBook = resumePosition ? books.find((item) => item.id === resumePosition.bookId) : null;
  const resumeChapter = resumeBook?.chapters.find((item) => item.id === resumePosition?.chapterId);
  const restoreReading = () => {
    if (!resumePosition || !resumeBook || !resumeChapter) return;
    const target = resumePosition.y;
    setBookId(resumeBook.id);
    setChapterId(resumeChapter.id);
    setResumePosition(null);
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: target, behavior: "auto" })));
  };

  const resetTypography = () => {
    setFontSize(19);
    setFontFamily("lora");
    setLineHeight(1.83);
    setParagraphMargin(1.35);
    setSidePadding(56);
    setLetterSpacing(0);
  };

  const themes = useMemo(() => ([
    { id: "paper" as const, label: "Claro" },
    { id: "sepia" as const, label: "Sépia" },
    { id: "dusk" as const, label: "Noturno" },
  ]), []);

  if (!book || !chapter) return null;

  return (
    <main className="reader-shell" data-theme={theme} style={{
      "--reader-size": `${fontSize}px`,
      "--reader-font": FONT_STACKS[fontFamily],
      "--reader-line-height": lineHeight,
      "--paragraph-margin": `${paragraphMargin}em`,
      "--reader-padding": `${sidePadding}px`,
      "--reader-letter-spacing": `${letterSpacing}em`,
    } as React.CSSProperties}>
      <button className={`sidebar-backdrop ${sidebarOpen ? "visible" : ""}`} aria-label="Fechar sumário" onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} aria-label="Biblioteca e capítulos">
        <div className="brand-row">
          <div className="brand-mark">M</div>
          <div><strong>Margem</strong><span>leitor de livros</span></div>
          <button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Fechar sumário">×</button>
        </div>

        <div className="library-label">Sua biblioteca</div>
        <label className="book-select-wrap">
          <span className="sr-only">Livro atual</span>
          <select value={book.id} onChange={(event) => selectBook(event.target.value)}>
            {books.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>

        <div className="book-summary">
          <span>{book.author}</span>
          <div className="progress-label"><span>Progresso</span><strong>{progress}%</strong></div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        </div>

        <nav className="chapters" aria-label="Capítulos">
          <div className="chapters-heading"><span>Capítulos</span><span>{book.chapters.length}</span></div>
          {book.chapters.map((item, index) => (
            <button key={item.id} className={item.id === chapter.id ? "active" : ""} onClick={() => openChapter(book.id, item.id)}>
              <span>{String(index + 1).padStart(2, "0")}</span>{item.title}
            </button>
          ))}
        </nav>

        <div className="add-book">
          <input ref={fileRef} type="file" accept=".md,text/markdown" multiple onChange={(event) => importBook(event.target.files)} />
          <button onClick={() => fileRef.current?.click()}><span>＋</span> Adicionar livro</button>
          <small>Selecione uma pasta com um arquivo .md por capítulo.</small>
        </div>
      </aside>

      <section className="reading-area">
        <header className="toolbar">
          <button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir sumário">☰</button>
          <div className="chapter-position">Capítulo {chapterIndex + 1} <span>de {book.chapters.length}</span></div>
          <div className="reading-controls">
            <div className="theme-control" aria-label="Tema de leitura">
              {themes.map((item) => <button key={item.id} className={theme === item.id ? "selected" : ""} onClick={() => setTheme(item.id)} title={item.label} aria-label={`Tema ${item.label}`}><span className={`swatch ${item.id}`} /></button>)}
            </div>
            <div className="font-control" aria-label="Tamanho do texto">
              <button onClick={() => setFontSize((size) => Math.max(16, size - 1))} aria-label="Diminuir texto">A−</button>
              <button onClick={() => setFontSize((size) => Math.min(24, size + 1))} aria-label="Aumentar texto">A＋</button>
            </div>
            <div className="appearance-wrap" ref={settingsRef}>
              <button className={`appearance-trigger ${settingsOpen ? "active" : ""}`} onClick={() => setSettingsOpen((open) => !open)} aria-expanded={settingsOpen} aria-haspopup="dialog">
                <span>Aa</span><span className="appearance-label">Aparência</span>
              </button>
              {settingsOpen && (
                <div className="appearance-panel" role="dialog" aria-label="Personalizar leitura">
                  <div className="appearance-heading">
                    <div><small>Preferências de leitura</small><strong>Aparência</strong></div>
                    <button onClick={() => setSettingsOpen(false)} aria-label="Fechar personalização">×</button>
                  </div>

                  <div className="appearance-preview" aria-label="Prévia ao vivo das preferências">
                    <div className="preview-label"><span>Prévia ao vivo</span><span>{chapter.title}</span></div>
                    <div className="preview-page">
                      {previewParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                    </div>
                  </div>

                  <fieldset className="font-picker">
                    <legend>Fonte</legend>
                    <div className="font-options">
                      {FONT_OPTIONS.map((option) => (
                        <button key={option.id} className={`${option.id} ${fontFamily === option.id ? "selected" : ""}`} onClick={() => setFontFamily(option.id)}>
                          <span>{option.label}</span><small>{option.detail}</small>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="setting-range">
                    <label htmlFor="line-height"><span>Altura da linha</span><output>{lineHeight.toFixed(2)}</output></label>
                    <input id="line-height" type="range" min="1.45" max="2.2" step="0.05" value={lineHeight} onChange={(event) => setLineHeight(Number(event.target.value))} />
                  </div>
                  <div className="setting-range">
                    <label htmlFor="paragraph-margin"><span>Espaço entre parágrafos</span><output>{paragraphMargin.toFixed(2)}×</output></label>
                    <input id="paragraph-margin" type="range" min="0.75" max="2.2" step="0.05" value={paragraphMargin} onChange={(event) => setParagraphMargin(Number(event.target.value))} />
                  </div>
                  <div className="setting-range">
                    <label htmlFor="side-padding"><span>Margens laterais</span><output>{sidePadding}px</output></label>
                    <input id="side-padding" type="range" min="18" max="110" step="2" value={sidePadding} onChange={(event) => setSidePadding(Number(event.target.value))} />
                  </div>
                  <div className="setting-range">
                    <label htmlFor="letter-spacing"><span>Espaço entre letras</span><output>{letterSpacing.toFixed(3)}em</output></label>
                    <input id="letter-spacing" type="range" min="-0.02" max="0.06" step="0.005" value={letterSpacing} onChange={(event) => setLetterSpacing(Number(event.target.value))} />
                  </div>

                  <button className="reset-appearance" onClick={resetTypography}>Restaurar padrão</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-wrap">
          <article className="book-page">
            <div className="eyebrow">{book.title}</div>
            <Markdown source={chapter.content} />
          </article>

          <nav className="chapter-nav" aria-label="Navegação entre capítulos">
            <button onClick={() => go(-1)} disabled={chapterIndex === 0}><span>←</span><div><small>Anterior</small><strong>{book.chapters[chapterIndex - 1]?.title || "Início do livro"}</strong></div></button>
            <button onClick={() => go(1)} disabled={chapterIndex === book.chapters.length - 1}><div><small>Próximo</small><strong>{book.chapters[chapterIndex + 1]?.title || "Fim do livro"}</strong></div><span>→</span></button>
          </nav>
        </div>
      </section>
      {resumePosition && resumeBook && resumeChapter && (
        <aside className="resume-card" aria-live="polite">
          <div className="resume-mark">↳</div>
          <div className="resume-copy">
            <small>Continuar de onde parou?</small>
            <strong>{resumeChapter.title}</strong>
            <span>{resumeBook.title}</span>
          </div>
          <button className="resume-action" onClick={restoreReading}>Continuar</button>
          <button className="resume-dismiss" onClick={() => setResumePosition(null)} aria-label="Agora não">×</button>
        </aside>
      )}
    </main>
  );
}
