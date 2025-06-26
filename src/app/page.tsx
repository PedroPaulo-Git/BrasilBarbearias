"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Loader2,
  CheckCircle,
  Users,
  BarChart,
  Share2,
  Star,
  MapPin,
  TrendingUp,
  Rocket,
  BarChartHorizontal,
  HelpCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardShop } from "@/components/CardShop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { SubscribedHomeView } from "@/components/SubscribedHomeView";

interface Shop {
  id: string;
  name: string;
  slug: string;
  address?: string;
  openTime: string;
  closeTime: string;
}

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<any>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/shops/public");
        if (!response.ok) {
          throw new Error("Failed to fetch shops");
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setShops(data.data);
        } else {
          setShops([]);
        }
      } catch (error) {
        console.error(error);
        setShops([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      console.log("plan", plan);
      setIsLoadingPlan(true);
      const fetchPlan = async () => {
        try {
          const res = await fetch("/api/user/plan");
          if (res.ok) {
            const data = await res.json();
            setPlan(data);
          } else {
            setPlan(null);
          }
        } catch (error) {
          console.error("Failed to fetch user plan", error);
          setPlan(null);
        } finally {
          setIsLoadingPlan(false);
        }
      };
      fetchPlan();
    } else if (status !== "loading") {
      setIsLoadingPlan(false);
      setPlan(null);
    }
  }, [status]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      router.push("/shops");
    } else {
      router.push(`/shops?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const featuredShops = useMemo(() => shops.slice(0, 6), [shops]);
  const isSubscribed = status === "authenticated" && plan?.status === "active";

  if (isLoading || (status === "loading" && isLoadingPlan)) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (isSubscribed) {
    return <SubscribedHomeView />;
  }

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section - Foco no Cliente com CTA para Donos */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-24 md:py-32">
          <div className="container mx-auto px-2 lg:px-12 xl:px-36 2xl:px-64 text-center">
            <h1 className="text-4xl md:text-6xl xl:text-7xl 2xl:text-7xl font-extrabold mb-6 drop-shadow-lg">
              A Barbearia Perfeita Espera por Você
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-primary-foreground/90">
              Encontre e agende seu próximo corte em qualquer lugar do Brasil.
              Simples, rápido e online.
            </p>
            <form
              onSubmit={handleSearchSubmit}
              className="flex justify-center mb-4"
            >
              <div className="relative w-full max-w-2xl">
                <input
                  type="text"
                  placeholder="Buscar por nome, cidade ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-32 py-4 text-lg text-gray-700 bg-white border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full font-bold py-6"
                >
                  Buscar
                </Button>
              </div>
            </form>
            <p className="text-sm text-primary-foreground/80">
              {status === "authenticated" ? "Pronto para encher sua cadeira?" : "É dono de uma barbearia?"}{"  "}
              <Link
                href="/auth/signup"
                className="font-bold text-secondary underline hover:text-secondary/90 transition-colors"
              >
                {status === "authenticated" ? "Assine um plano e crie já sua barbearia." : "Cadastre seu negócio aqui."}
              </Link>
            </p>
          </div>
        </section>

        {/* Shops List Section */}
        <section id="shops-list" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Barbearias em Destaque
            </h2>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            ) : featuredShops.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
                {featuredShops.map((shop) => (
                  <CardShop key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-lg">
                Nenhuma barbearia cadastrada no momento.
              </p>
            )}
            {shops.length > 6 && (
              <div className="text-center mt-12">
                <Button asChild size="lg">
                  <Link href="/shops">Ver Todas as Barbearias</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* For Owners CTA Section */}
        <section id="for-owners" className="bg-muted py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Modernize Sua Barbearia
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Junte-se à nossa plataforma, ofereça agendamento online, alcance
              mais clientes e gerencie tudo em um só lugar.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-10 max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-10 h-10 text-primary" />
                <h3 className="font-semibold">Agenda Simplificada</h3>
                <p className="text-sm text-muted-foreground">
                  Menos telefonemas, mais agendamentos.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Users className="w-10 h-10 text-primary" />
                <h3 className="font-semibold">Atraia Mais Clientes</h3>
                <p className="text-sm text-muted-foreground">
                  Seja encontrado por milhares de pessoas.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BarChart className="w-10 h-10 text-primary" />
                <h3 className="font-semibold">Gestão Completa</h3>
                <p className="text-sm text-muted-foreground">
                  Controle seus horários e serviços.
                </p>
              </div>
            </div>
            <Link href="/auth/signup">
              <Button
                variant="default"
                className="h-auto whitespace-normal px-4 py-2 text-sm font-bold shadow-md transition-shadow hover:shadow-lg sm:px-6 sm:text-base cursor-pointer"
              >
                {status === "authenticated" ? "Assine um plano e crie já sua barbearia." : "Cadastre seu Negócio e Escolha um Plano"}
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Sua Barbearia no Piloto Automático.{" "}
                <span className="text-primary">
                  Mais Clientes, Menos Esforço.
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Deixe de lado a agenda de papel e as mensagens de WhatsApp.
                Nossa plataforma é a ferramenta definitiva para transformar sua
                gestão e multiplicar seus agendamentos.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-primary" />
                    <span className="text-xl">Agenda Inteligente 24/7</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sua barbearia aberta para negócios a qualquer hora. Clientes
                    agendam sozinhos, e você enche sua cadeira até enquanto
                    dorme.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Share2 className="w-8 h-8 text-primary" />
                    <span className="text-xl">Seu Link Mágico</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receba um link exclusivo. Coloque na bio do Instagram, no
                    WhatsApp e veja a mágica acontecer. Seus seguidores viram
                    clientes com um clique.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Star className="w-8 h-8 text-primary" />
                    <span className="text-xl">Vitrine de Destaque</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    As barbearias mais movimentadas ganham um lugar de honra em
                    nossa página inicial. Seja visto por milhares de novos
                    clientes em potencial.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BarChartHorizontal className="w-8 h-8 text-primary" />
                    <span className="text-xl">Gestão Simplificada</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Controle total dos seus horários, serviços e clientes em um
                    painel intuitivo. Funciona perfeitamente em qualquer
                    dispositivo.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-primary" />
                    <span className="text-xl">Faça Parte da Elite</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Junte-se a um dos maiores e mais modernos sistemas de
                    barbearias do Brasil. Eleve o nível do seu negócio e saia na
                    frente da concorrência.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MapPin className="w-8 h-8 text-primary" />
                    <span className="text-xl">Sua Vitrine no Mapa</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sua barbearia no Google Maps, direto na sua página. Clientes
                    da região te encontram, veem onde você está e agendam na
                    mesma hora. É a sua vitrine local definitiva.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sua decolagem começa em 3 passos
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Transformar sua barbearia é mais rápido e fácil do que você
              imagina.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Crie sua Página</h3>
                <p className="text-muted-foreground">
                  Cadastre-se, escolha seu plano e configure sua barbearia em
                  minutos. Sem burocracia.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Compartilhe seu Link
                </h3>
                <p className="text-muted-foreground">
                  Copie seu link exclusivo e espalhe pelo mundo: Instagram,
                  WhatsApp, onde for!
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Veja a Agenda Lotar
                </h3>
                <p className="text-muted-foreground">
                  Relaxe e veja os agendamentos chegarem. Sua única preocupação
                  será atender os clientes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
              <Rocket className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Chega de ficar para trás.
              </h2>
              <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto">
                Cada dia com a agenda de papel é um dia perdendo clientes e
                dinheiro. Dê o próximo passo e coloque sua barbearia no mapa do
                sucesso digital. A decisão que vai mudar seu negócio está a um
                clique de distância.
              </p>
              <Button asChild size="lg" variant="secondary" className="mt-8">
                <Link href="/plans">QUERO LOTAR MINHA AGENDA</Link>
              </Button>
            </div>
          </div>
        </section>
        <div className="max-w-3xl mx-auto my-12 px-10 md:px-0">
          <h1 className="text-2xl font-bold mb-4"><HelpCircle className="w-6 h-6 inline mr-2" />Tire suas dúvidas</h1>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg text-left">
                E meus clientes do WhatsApp e os que chegam sem marcar?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                Perfeitamente normal. Nossa plataforma fortalece seu
                atendimento, não o substitui.
                <br />
                <br />
                <strong>Clientes do WhatsApp:</strong> Ao agendar, o sistema
                captura o número. Você pode enviar uma mensagem de confirmação
                com um clique ou tirar dúvidas. Se um cliente cancelar, o
                horário abre automaticamente para outros. É o seu WhatsApp, só
                que mais inteligente.
                <br />
                <br />
                <strong>Clientes sem hora marcada:</strong> Você é o dono da
                agenda. Precisa de uma janela para encaixes ou clientes de
                última hora? Basta bloquear esses horários no seu painel.
                Simples assim.
                <br />
                <br />
                <em>
                  Você continua no controle. Só que com mais ferramentas, mais
                  agilidade e mais resultado.
                </em>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg text-left">
                É muito complicado de configurar e usar?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                Foi feito para barbeiros, não para programadores. Em menos de 5
                minutos, sua página está no ar, pronta para receber
                agendamentos. Nosso painel é tão intuitivo quanto usar seu
                próprio celular. Se você sabe mandar uma mensagem, sabe usar
                nossa plataforma.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg text-left">
                Vou perder o controle da minha agenda?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                Nunca. Você está no comando total. Defina seus horários de
                trabalho, a duração de cada serviço, seus dias de folga e até
                bloqueie horários para compromissos pessoais. A plataforma
                trabalha para você, 24 horas por dia, seguindo as suas regras.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg text-left">
                O investimento realmente vale a pena?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                Pense nisto: quanto vale um cliente que não desmarcou de última
                hora? Ou uma hora a mais de paz, sem responder mensagens para
                agendar? A plataforma não é um custo, é um investimento que se
                paga com o primeiro cliente novo que te descobre ou com o tempo
                que você economiza para focar no que realmente importa: seu
                talento com a tesoura.
                <br />
                <br />
                <em>
                  Esse sistema não é só tecnologia. É liberdade,
                  profissionalismo e mais retorno pra você.
                </em>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg text-left">
                Posso usar isso mesmo tendo mais de uma barbearia?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                Claro! Você pode cadastrar várias barbearias (dependendo do seu
                plano) e gerenciá-las todas em um só lugar. Cada uma com seu
                link, agenda, equipe e horários próprios.
                <br />
                <br />
                Se seu negócio está crescendo, o sistema cresce com você.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg text-left">
                Preciso instalar algo? Funciona no celular?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                Nada de instalar aplicativo. Você acessa tudo direto pelo
                navegador, seja no celular, tablet ou computador. É leve, rápido
                e funciona perfeitamente em qualquer dispositivo.
              
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg text-left">
                E se eu precisar de ajuda?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                Estamos aqui por você. Oferecemos suporte rápido e direto, com
                linguagem simples. Nada de burocracia ou robô que não entende
                sua pergunta. Fale com a gente quando precisar.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
       
    </div>
    </>
  );
}