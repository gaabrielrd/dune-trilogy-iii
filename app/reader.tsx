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

type Chapter = { id: string; title: string; content: string };
type Book = { id: string; title: string; author: string; chapters: Chapter[] };
type Theme = "paper" | "sepia" | "dusk";

const DUNA_BOOK: Book = {
  id: "duna-a-abdicacao",
  title: "Duna: A Abdicação",
  author: "2 capítulos disponíveis",
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("margem-library");
    const preferences = localStorage.getItem("margem-preferences");
    try {
      if (stored) {
        const parsed = JSON.parse(stored) as Book[];
        const importedBooks = parsed.filter((saved) => !PUBLISHED_BOOKS.some((published) => published.id === saved.id));
        setBooks([...PUBLISHED_BOOKS, ...importedBooks]);
      }
      if (preferences) {
        const parsed = JSON.parse(preferences);
        if (["paper", "sepia", "dusk"].includes(parsed.theme)) setTheme(parsed.theme);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.bookId) setBookId(parsed.bookId);
        if (parsed.chapterId) setChapterId(parsed.chapterId);
      }
    } catch { /* Keep the published library if saved data is invalid. */ }
    fileRef.current?.setAttribute("webkitdirectory", "");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("margem-library", JSON.stringify(books));
    localStorage.setItem("margem-preferences", JSON.stringify({ theme, fontSize, bookId, chapterId }));
  }, [books, theme, fontSize, bookId, chapterId, ready]);

  const book = books.find((item) => item.id === bookId) || books[0];
  const chapterIndex = Math.max(0, book.chapters.findIndex((item) => item.id === chapterId));
  const chapter = book.chapters[chapterIndex] || book.chapters[0];
  const progress = Math.round(((chapterIndex + 1) / book.chapters.length) * 100);

  const selectBook = (id: string) => {
    const next = books.find((item) => item.id === id);
    if (!next) return;
    setBookId(id); setChapterId(next.chapters[0].id);
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
    setBookId(id); setChapterId(chapters[0].id); setSidebarOpen(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const go = (offset: number) => {
    const next = book.chapters[chapterIndex + offset];
    if (next) { setChapterId(next.id); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const themes = useMemo(() => ([
    { id: "paper" as const, label: "Claro" },
    { id: "sepia" as const, label: "Sépia" },
    { id: "dusk" as const, label: "Noturno" },
  ]), []);

  if (!book || !chapter) return null;

  return (
    <main className="reader-shell" data-theme={theme} style={{ "--reader-size": `${fontSize}px` } as React.CSSProperties}>
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
            <button key={item.id} className={item.id === chapter.id ? "active" : ""} onClick={() => { setChapterId(item.id); setSidebarOpen(false); }}>
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
    </main>
  );
}
