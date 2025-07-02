"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  BarChart4,
  HelpCircle,
  LayoutGrid,
  LinkIcon,
  Search,
  Settings2,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const SubscribedHomeView = () => (
  <>
    <div className="min-h-screen bg-black">
      <section className="bg-gradient-to-br from-black to-[#1E1B4B] text-white py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg leading-tight">
            Você já está no jogo.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-blue-900">
              Agora, vamos vencer.
            </span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-300">
            Sua barbearia já é digital. Explore as ferramentas do seu plano para
            fidelizar clientes e otimizar sua rotina. O próximo nível está a um
            clique.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="font-bold">
              <Link href="/dashboard">Acessar Meu Painel</Link>
            </Button>
            <Button asChild size="lg"  className="font-bold">
              <Link href="/plans">Explorar Upgrades de Plano</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
    Aproveite o Melhor do Seu Plano.{" "}
    <span className="text-primary">E Veja Até Onde Você Pode Chegar.</span>
  </h2>
  <p className="mt-4 text-lg text-muted-foreground">
    Você já conta com ferramentas poderosas para atrair mais clientes e organizar sua barbearia.  
    Mas isso é só o começo. Descubra recursos avançados que estão a caminho — prontos para levar seu negócio ainda mais longe.
  </p>
</div>


          <div className="grid md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 xl:max-w-[80%] 2xl:max-w-[70%] m-auto gap-8 mt-12">
    
            <Card className="hover:shadow-lg  hover:border-yellow-700 transition-all duration-300 border-2 border-yellow-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                  <span className="text-xl">Plano Avançado Exclusivo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                Sua barbearia em destaque logo na entrada do app.
Gerencie quem atende, defina preços, horários e ofereça cupons.
Futuro com pagamentos direto pelo sistema.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <LinkIcon className="w-8 h-8 text-primary" />
                  <span className="text-xl">Agendamentos Sem WhatsApp</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Seus clientes não precisam te chamar no WhatsApp para agendar.
                  Basta acessar seu link exclusivo e escolher o melhor horário.
                  Rápido, direto e profissional.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <LayoutGrid className="w-8 h-8 text-primary" />
                  <span className="text-xl">Organização Total</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Atendeu alguém fora do sistema? Sem problemas. Você pode
                  bloquear manualmente um horário para manter sua agenda
                  completa e gerar estatísticas ainda mais precisas.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart4 className="w-8 h-8 text-primary" />
                  <span className="text-xl">Estatísticas de Clientes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Veja quantos clientes novos você atendeu, quantos voltaram, e
                  quais dias são os mais movimentados. Tenha controle e
                  inteligência para crescer.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Search className="w-8 h-8 text-primary" />
                  <span className="text-xl">Descubra Novos Clientes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Barbearias com muitos agendamentos aparecem em destaque quando
                  alguém procura uma barbearia próxima na nossa plataforma. Mais
                  visibilidade, mais agendamentos.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings2 className="w-8 h-8 text-primary" />
                  <span className="text-xl">Pronto Para Crescer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Em breve: você poderá definir preços, serviços (como barba,
                  cabelo, combo etc) e deixar tudo pronto para que o cliente
                  escolha exatamente o que quer. Exclusivo para assinantes do
                  plano Intermediário.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="py-12 px-12 lg:px-80 bg-gradient-to-br from-black to-[#1E1B4B]">
        <h1 className="text-2xl font-bold mb-4 text-white">
          <HelpCircle className="w-6 h-6 inline mr-2 text-white" />
          Dúvidas Frequentes (Assinantes)
        </h1>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg text-left text-white">
              Posso usar o sistema mesmo com clientes que não agendam online?
            </AccordionTrigger>
            <AccordionContent className="text-base text-gray-300 ">
              Sim! O painel permite adicionar manualmente clientes que chegam
              direto na barbearia ou que agendam por WhatsApp. Assim, você
              mantém a agenda organizada e evita conflitos de horário.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg text-left text-white">
              O que acontece se eu esquecer de renovar meu plano?
            </AccordionTrigger>
            <AccordionContent className="text-base text-gray-300">
              Seu acesso ao painel e agendamentos será temporariamente suspenso,
              mas seus dados continuarão salvos. Você pode renovar a qualquer
              momento e retomar o uso normalmente.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg text-left text-white">
              Quantas barbearias posso gerenciar ao mesmo tempo?
            </AccordionTrigger>
            <AccordionContent className="text-base text-gray-300">
              Depende do seu plano. O básico permite 1 barbearia, o
              intermediário até 2 e o avançado até 5. Você pode fazer upgrade ou
              downgrade sempre que precisar.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg text-left text-white">
              Preciso cadastrar todos os meus clientes no sistema?
            </AccordionTrigger>
            <AccordionContent className="text-base text-gray-300">
              Não é obrigatório. Os agendamentos online são automáticos. Mas, se
              quiser manter um histórico ou controle interno, você pode
              cadastrar manualmente os clientes que chegam presencialmente.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-lg text-left text-white">
              E se meu cliente perder o link do agendamento?
            </AccordionTrigger>
            <AccordionContent className="text-base text-gray-300">
              Isso é bem raro de acontecer. Quando o cliente agenda, ele informa
              o número do WhatsApp e recebe o link automaticamente na tela.
              <br />
              <br />
              Se ainda assim ele não salvar, você pode reenviar a qualquer
              momento diretamente pelo seu painel. Basta um clique para abrir o
              WhatsApp e mandar a mensagem.
              <br />
              <br />
              Além disso, usamos um sistema inteligente que armazena o
              agendamento no próprio navegador do cliente, facilitando o acesso
              mesmo que ele feche a aba. Tudo pensado para tornar quase
              impossível perder o link.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-lg text-left text-white">
              O sistema funciona bem em celular?
            </AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">
              Sim! Toda a plataforma foi pensada para ser responsiva. Você pode
              gerenciar tudo do celular, tablet ou computador, sem complicação.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  </>
);
