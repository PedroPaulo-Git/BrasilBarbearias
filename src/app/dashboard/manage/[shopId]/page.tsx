"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Filter,
  BarChart3,
  Settings,
  MessageCircle
} from "lucide-react"
import { format, parseISO, isToday, isThisWeek, isThisMonth } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Appointment {
  id: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  customer: {
    name: string
    email: string
    phone: string
  }
  service: string
  createdAt: string
}

interface Shop {
  id: string
  name: string
  slug: string
  address?: string
  openTime: string
  closeTime: string
  serviceDuration: number
}

export default function ManageShopPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { status } = useSession()
  const router = useRouter()
  const [shop, setShop] = useState<Shop | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [showCancelled, setShowCancelled] = useState(false)
  const [activeTab, setActiveTab] = useState<'appointments' | 'stats' | 'settings'>('appointments')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { shopId: slug } = await params
        
        // Buscar dados da barbearia por slug
        const shopResponse = await fetch(`/api/shops/${slug}`)
        const shopData = await shopResponse.json()
        
        if (shopResponse.ok) {
          setShop(shopData)
        }

        // Buscar agendamentos usando o slug
        const appointmentsResponse = await fetch(`/api/shops/${slug}/appointments?showCancelled=${showCancelled}`)
        const appointmentsData = await appointmentsResponse.json()
        
        if (appointmentsResponse.ok) {
          setAppointments(appointmentsData)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params, showCancelled])

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = parseISO(appointment.date)
    
    // Se não estiver mostrando cancelados, filtrar eles
    if (!showCancelled && appointment.status === 'cancelled') {
      return false
    }
    
    switch (filter) {
      case 'today':
        return isToday(appointmentDate)
      case 'week':
        return isThisWeek(appointmentDate)
      case 'month':
        return isThisMonth(appointmentDate)
      default:
        return true
    }
  })

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

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setAppointments(appointments.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
        ))
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  const getWhatsAppMessage = (appointment: Appointment, status: string) => {
    const customerName = appointment.customer.name
    const appointmentDate = format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: ptBR })
    const appointmentTime = appointment.time
    const shopName = shop?.name || 'Barbearia'

    const messages = {
      pending: `Olá ${customerName}! 👋

Sobre seu agendamento na ${shopName}:
📅 Data: ${appointmentDate}
⏰ Horário: ${appointmentTime}
📋 Status: Pendente

Gostaríamos de confirmar se você ainda tem interesse no horário agendado. Por favor, confirme sua presença.

Obrigado! ✂️`,
      
      confirmed: `Olá ${customerName}! ✅

Seu agendamento na ${shopName} foi CONFIRMADO:
📅 Data: ${appointmentDate}
⏰ Horário: ${appointmentTime}
📋 Status: Confirmado

Aguardamos você no horário agendado! 

Obrigado pela preferência! ✂️`,
      
      cancelled: `Olá ${customerName}! ❌

Infelizmente seu agendamento na ${shopName} foi CANCELADO:
📅 Data: ${appointmentDate}
⏰ Horário: ${appointmentTime}
📋 Status: Cancelado

Para reagendar, entre em contato conosco.

Obrigado! ✂️`
    }

    return messages[status as keyof typeof messages] || messages.pending
  }

  const openWhatsApp = (appointment: Appointment) => {
    // Formatar telefone para WhatsApp (apenas números, adicionar 55 se necessário)
    let phone = appointment.customer.phone.replace(/\D/g, '') // Remove caracteres não numéricos
    
    // Se não começar com 55 (código do Brasil), adicionar
    if (!phone.startsWith('55')) {
      phone = '55' + phone
    }
    
    const message = encodeURIComponent(getWhatsAppMessage(appointment, appointment.status))
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const stats = {
    total: appointments.filter(a => a.status !== 'cancelled').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }

  if (status === "loading") {
    return <div>Carregando...</div>
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Carregando dados da barbearia...</p>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Barbearia não encontrada</h1>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-col items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="mr-auto cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{shop.name}</h1>
              <p className="text-muted-foreground">Gerenciamento da Barbearia</p>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={() => window.open(`/shops/${shop.slug}`, '_blank')}
            className="w-full sm:w-auto cursor-pointer"
          >
            Ver Página Pública
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-1 mb-6">
          <Button
            variant={activeTab === 'appointments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('appointments')}
            className="justify-start sm:justify-center cursor-pointer"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Agendamentos
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stats')}
            className="justify-start sm:justify-center cursor-pointer"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Estatísticas
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settings')}
            className="justify-start sm:justify-center cursor-pointer"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'appointments' && (
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filtrar:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="cursor-pointer"
                >
                  Todos
                </Button>
                <Button
                  variant={filter === 'today' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('today')}
                  className="cursor-pointer"
                >
                  Hoje
                </Button>
                <Button
                  variant={filter === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('week')}
                  className="cursor-pointer"
                >
                  Esta Semana
                </Button>
                <Button
                  variant={filter === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('month')}
                  className="cursor-pointer"
                >
                  Este Mês
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={showCancelled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowCancelled(!showCancelled)}
                  className="cursor-pointer"
                >
                  {showCancelled ? 'Ocultar Cancelados' : 'Mostrar Cancelados'}
                </Button>
              </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhum agendamento encontrado para o filtro selecionado.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAppointments.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{appointment.customer.name}</span>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{appointment.customer.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                          {/* Botão WhatsApp para status específicos */}
                          {(appointment.status === 'pending' || appointment.status === 'confirmed' || appointment.status === 'cancelled') && (
                            <Button
                              size="sm"
                              onClick={() => openWhatsApp(appointment)}
                              variant="outline"
                              className="border-green-600 text-green-600 hover:bg-green-50 cursor-pointer"
                              title={`Enviar mensagem no WhatsApp para ${appointment.customer.name}`}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              WhatsApp
                            </Button>
                          )}

                          {appointment.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700 cursor-pointer"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                className="cursor-pointer"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(appointment.id, 'completed')}
                              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Marcar Realizado
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Realizados</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Barbearia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configurações avançadas da barbearia serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 