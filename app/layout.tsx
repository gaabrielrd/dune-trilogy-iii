import type { Metadata } from "next";
import { Geist, Lora } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const serif = Lora({ variable: "--font-serif", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Margem — Leitor de livros em Markdown",
  description: "Uma biblioteca calma para ler livros organizados em arquivos Markdown.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${sans.variable} ${serif.variable}`}>{children}</body></html>;
}
