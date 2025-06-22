"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  User,
  ArrowLeft
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"

interface Appointment {
  id: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  service: string
  shop: {
    name: string
    slug: string
    address?: string
  }
  createdAt: string
}

interface TrackingData {
  phone: string
  appointments: Appointment[]
}

export default function TrackAppointmentPage({ params }: { params: Promise<{ phone: string }> }) {
  const router = useRouter()
  const [data, setData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const { phone } = await params
      const response = await fetch(`/api/track/${phone}`)
      const result = await response.json()

      if (response.ok) {
        setData(result)
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError("Erro ao carregar dados do agendamento")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [params])

  // Atualização automática a cada 10 segundos
  useEffect(() => {
    if (!data) return

    const interval = setInterval(() => {
      fetchData()
    }, 10000) // 10 segundos

    return () => clearInterval(interval)
  }, [data])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Realizado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p>Carregando seu agendamento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Agendamento não encontrado</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!data || data.appointments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum agendamento ativo</h2>
              <p className="text-muted-foreground mb-4">
                Não encontramos agendamentos ativos para este telefone.
              </p>
              <Button onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Fazer Novo Agendamento
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Acompanhe seu Agendamento</h1>
          <p className="text-muted-foreground">
            Telefone: {data.phone}
          </p>
        </div>

        {/* Appointments */}
        <div className="space-y-4">
          {data.appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(appointment.status)}
                    <div>
                      <CardTitle className="text-lg">{appointment.shop.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{appointment.service}</p>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.time}</span>
                  </div>
                  {appointment.shop.address && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.shop.address}</span>
                    </div>
                  )}
                </div>

                {/* Status Messages */}
                <div className="mt-4 p-3 rounded-md bg-gray-50">
                  {appointment.status === 'pending' && (
                    <p className="text-sm text-gray-700">
                      Seu agendamento está aguardando confirmação da barbearia. 
                      Você será notificado quando for confirmado.
                    </p>
                  )}
                  {appointment.status === 'confirmed' && (
                    <p className="text-sm text-green-700">
                      ✅ Seu agendamento foi confirmado! Aguardamos você no horário marcado.
                    </p>
                  )}
                  {appointment.status === 'completed' && (
                    <p className="text-sm text-blue-700">
                      ✅ Agendamento realizado com sucesso! Obrigado pela preferência.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  )
} 