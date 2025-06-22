import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SessionProvider } from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BarbeariaApp - Agendamento para Barbearias",
  description: "Gerencie sua barbearia de forma simples e eficiente. Agendamentos online, controle de horários e muito mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${inter.className} bg-background text-foreground`}>
        <SessionProvider>
          <Header />
          <main className="pt-20">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
