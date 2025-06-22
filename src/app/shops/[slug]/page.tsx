"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin } from "lucide-react"
import { AppointmentForm } from "@/components/AppointmentForm"

interface Shop {
  id: string
  name: string
  slug: string
  address?: string
  openTime: string
  closeTime: string
  serviceDuration: number
}

interface ShopPageProps {
  params: Promise<{ slug: string }>
}

export default function ShopPage({ params }: ShopPageProps) {
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  const fetchShop = useCallback(async () => {
    try {
      const { slug } = await params
      const response = await fetch(`/api/shops/${slug}`)
      const data = await response.json()

      if (response.ok) {
        setShop(data)
      } else {
        setErrorMsg(data.error)
      }
    } catch {
      setErrorMsg("Erro ao carregar barbearia")
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchShop()
  }, [fetchShop])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Carregando barbearia...</p>
        </div>
      </div>
    )
  }

  if (errorMsg || !shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erro</h1>
          <p className="text-muted-foreground">
            {errorMsg || "Barbearia não encontrada"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Informações da Barbearia */}
          <div>
            <h1 className="text-3xl font-bold mb-6">{shop.name}</h1>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shop.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{shop.address}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Horário de funcionamento: {shop.openTime} - {shop.closeTime}</span>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">
                    Duração do serviço: {shop.serviceDuration} minutos
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Agendamento */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Agendar Horário</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentForm shop={shop} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 