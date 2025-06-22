"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Calendar, Clock, Smartphone, Loader2, CheckCircle, Users, BarChart } from "lucide-react"
import { CardShop } from "@/components/CardShop"

interface Shop {
  id: string
  name: string
  slug: string
  address?: string
  openTime: string
  closeTime: string
}

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('http://localhost:5000/shops/public')
        if (!response.ok) {
          throw new Error('Failed to fetch shops')
        }
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          setShops(data.data)
        } else {
          setShops([])
        }
      } catch (error) {
        console.error(error)
        setShops([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchShops()
  }, [])

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      router.push('/shops')
    } else {
      router.push(`/shops?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  const featuredShops = useMemo(() => shops.slice(0, 6), [shops])

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section - Foco no Cliente com CTA para Donos */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-24 md:py-32">
          <div className="container mx-auto px-4 xl:px-24 2xl:px-64 text-center">
            <h1 className="text-4xl md:text-6xl xl:text-7xl 2xl:text-7xl font-extrabold mb-6 drop-shadow-lg">
              A Barbearia Perfeita Espera por Você
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-primary-foreground/90">
              Encontre e agende seu próximo corte de cabelo em Pernambuco. Simples, rápido e online.
            </p>
            <form onSubmit={handleSearchSubmit} className="flex justify-center mb-4">
              <div className="relative w-full max-w-2xl">
                <input
                  type="text"
                  placeholder="Buscar por nome, cidade ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-32 py-4 text-lg text-gray-700 bg-white border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Button type="submit" size="lg" className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full font-bold py-6">
                  Buscar
                </Button>
              </div>
            </form>
            <p className="text-sm text-primary-foreground/80">
              É dono de uma barbearia?{' '}
              <Link href="/auth/signup" className="font-bold text-secondary underline hover:text-secondary/90 transition-colors">
                Cadastre seu negócio aqui.
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredShops.map(shop => (
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Modernize Sua Barbearia</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Junte-se à nossa plataforma, ofereça agendamento online, alcance mais clientes e gerencie tudo em um só lugar.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-10 max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-10 h-10 text-primary" />
                <h3 className="font-semibold">Agenda Simplificada</h3>
                <p className="text-sm text-muted-foreground">Menos telefonemas, mais agendamentos.</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Users className="w-10 h-10 text-primary" />
                <h3 className="font-semibold">Atraia Mais Clientes</h3>
                <p className="text-sm text-muted-foreground">Seja encontrado por milhares de pessoas.</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BarChart className="w-10 h-10 text-primary" />
                <h3 className="font-semibold">Gestão Completa</h3>
                <p className="text-sm text-muted-foreground">Controle seus horários e serviços.</p>
              </div>
            </div>
            <Link href="/auth/signup">
              <Button variant="default" className="h-auto whitespace-normal px-4 py-2 text-sm font-bold shadow-md transition-shadow hover:shadow-lg sm:px-6 sm:text-base cursor-pointer">
                Cadastre seu Negócio Gratuitamente por 3 dias
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Vantagens para Todos
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-primary" />
                    <span className="text-xl">Agendamento Online</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Seus clientes podem agendar horários 24/7, de qualquer lugar.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-primary" />
                    <span className="text-xl">Controle de Horários</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Defina seus horários e serviços. O sistema evita conflitos.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Smartphone className="w-8 h-8 text-primary" />
                    <span className="text-xl">Interface Responsiva</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Funciona perfeitamente em celulares, tablets e computadores.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
