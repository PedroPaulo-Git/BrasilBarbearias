import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from 'sonner'
import Footer from "@/components/Footer";
import { SessionProvider } from "@/components/SessionProvider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brasil Barbearias - Plataforma de Agendamento para Barbearias",
  description: "Gerencie sua barbearia de forma profissional. Agendamentos online, controle de horários e atendimento moderno em uma única plataforma pensada para barbeiros de todo o Brasil.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        <SessionProvider>
          <Toaster />
          <Header />
          <main className="pt-22">
            {children}
          </main>
          <Footer />
          <Toaster />
        </SessionProvider>
        <Script src="https://sdk.mercadopago.com/js/v2" />
      </body>
    </html>
  );
}
