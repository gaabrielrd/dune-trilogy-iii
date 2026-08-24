import type { Metadata } from "next";
import { BookReader } from "./reader";

export const metadata: Metadata = {
  title: "Margem — Leitor de livros em Markdown",
  description: "Uma biblioteca calma para ler livros organizados em arquivos Markdown.",
};

export default function Home() {
  return <BookReader />;
}
