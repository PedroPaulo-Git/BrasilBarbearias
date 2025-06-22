"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ExternalLink, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Shop {
  id: string
  name: string
  slug: string
  openTime: string
  closeTime: string
  serviceDuration: number
}

interface AppointmentFormProps {
  shop: Shop
}

export function AppointmentForm({ shop }: AppointmentFormProps) {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [existingAppointment, setExistingAppointment] = useState<any>(null)
  const [showTracking, setShowTracking] = useState(false)
  const [checkingInitial, setCheckingInitial] = useState(true)

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Limita a 11 dígitos (DDD + 9 dígitos)
    if (numbers.length > 11) return value.slice(0, 11)
    
    // Formata o telefone
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    }
  }

  // Função para lidar com mudança no telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setClientPhone(formatted)
  }

  // Função para obter apenas números do telefone
  const getPhoneNumbers = (phone: string) => {
    return phone.replace(/\D/g, '')
  }

  const fetchAvailableSlots = useCallback(async () => {
    if (!date) return

    try {
      const dateString = date.toISOString().split('T')[0]
      console.log(`Buscando horários para data: ${dateString}`)
      const response = await fetch(
        `/api/shops/${shop.slug}/availability?date=${dateString}`
      )
      const data = await response.json()

      console.log(`Resposta da API:`, data)

      if (response.ok) {
        console.log(`Horários disponíveis recebidos: ${data.availableSlots}`)
        console.log(`Horários ocupados: ${data.bookedTimes}`)
        setAvailableSlots(data.availableSlots || [])
        setTime("")
        console.log(`Horários disponíveis definidos no estado: ${data.availableSlots}`)
      } else {
        setMessage(data.error)
        console.error(`Erro da API: ${data.error}`)
      }
    } catch (error) {
      console.error("Erro ao buscar horários:", error)
      setMessage("Erro ao buscar horários disponíveis")
    }
  }, [date, shop.slug])

  // Buscar horários disponíveis quando a data muda
  useEffect(() => {
    if (date) {
      fetchAvailableSlots()
    }
  }, [date, fetchAvailableSlots])

  // Verificação inicial para ver se já tem agendamento
  useEffect(() => {
    const checkInitialAppointment = async () => {
      try {
        // Verificar telefones salvos no localStorage
        const savedPhones = JSON.parse(localStorage.getItem('appointmentPhones') || '[]')
        
        for (const phone of savedPhones) {
          const response = await fetch(`/api/shops/${shop.slug}/check-appointment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone }),
          })

          const data = await response.json()

          if (response.ok && data.hasAppointment) {
            setExistingAppointment(data)
            setCheckingInitial(false)
            return
          }
        }
        
        setCheckingInitial(false)
      } catch (error) {
        console.error("Erro ao verificar agendamento inicial:", error)
        setCheckingInitial(false)
      }
    }

    checkInitialAppointment()
  }, [shop.slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (!date || !time || !clientName || !clientPhone) {
      setMessage("Todos os campos são obrigatórios")
      setLoading(false)
      return
    }

    // Verificar se já existe agendamento para este telefone
    try {
      const phoneNumbers = getPhoneNumbers(clientPhone)
      const checkResponse = await fetch(`/api/shops/${shop.slug}/check-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumbers }),
      })

      const checkData = await checkResponse.json()

      if (checkResponse.ok && checkData.hasAppointment) {
        setMessage("Você já possui um agendamento ativo nesta barbearia.")
        setLoading(false)
        return
      }
    } catch (error) {
      console.error("Erro ao verificar agendamento:", error)
    }

    // Validar formato do telefone
    const phoneNumbers = getPhoneNumbers(clientPhone)
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      setMessage("Telefone deve ter 10 ou 11 dígitos (com DDD)")
      setLoading(false)
      return
    }

    // Verificar se não é um email
    if (clientPhone.includes('@')) {
      setMessage("Por favor, use apenas números de telefone. Emails não são aceitos.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopId: shop.id,
          clientName,
          clientContact: getPhoneNumbers(clientPhone),
          date: date.toISOString().split('T')[0],
          time,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Salvar telefone no localStorage para futuras verificações (se disponível)
        try {
          const phoneNumbers = getPhoneNumbers(clientPhone)
          const savedPhones = JSON.parse(localStorage.getItem('appointmentPhones') || '[]')
          if (!savedPhones.includes(phoneNumbers)) {
            savedPhones.push(phoneNumbers)
            localStorage.setItem('appointmentPhones', JSON.stringify(savedPhones))
          }

          // Salvar agendamento recente para esta barbearia específica
          const recentAppointments = JSON.parse(localStorage.getItem(`recentAppointments_${shop.slug}`) || '[]')
          const newAppointment = {
            phone: phoneNumbers,
            date: new Date().toISOString(),
            shopSlug: shop.slug
          }
          recentAppointments.push(newAppointment)
          
          // Manter apenas os últimos 5 agendamentos
          if (recentAppointments.length > 5) {
            recentAppointments.splice(0, recentAppointments.length - 5)
          }
          
          localStorage.setItem(`recentAppointments_${shop.slug}`, JSON.stringify(recentAppointments))
        } catch (e) {
          // localStorage não disponível (guia anônima)
          console.log("localStorage não disponível, agendamento salvo apenas no servidor")
        }

        // Mostrar tracking imediatamente
        setExistingAppointment({
          trackingUrl: data.trackingUrl,
          appointment: {
            date: date.toISOString().split('T')[0],
            time: time
          }
        })
        setShowTracking(true)
        
        setClientName("")
        setClientPhone("")
        setDate(undefined)
        setTime("")
        setAvailableSlots([])
      } else {
        setMessage(data.error)
      }
    } catch {
      setMessage("Erro ao realizar agendamento")
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading enquanto verifica inicialmente
  if (checkingInitial) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  // Mostrar apenas tracking se já tem agendamento
  if (existingAppointment && !showTracking) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-xl font-semibold text-blue-800 mb-3">Agendamento Ativo Encontrado</h3>
          <p className="text-blue-700 mb-6">
            Você já possui um agendamento ativo nesta barbearia. Para fazer um novo agendamento, 
            aguarde o cancelamento ou conclusão do atual.
          </p>
          
          <Button
            onClick={() => window.open(existingAppointment.trackingUrl, '_blank')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Acompanhar Agendamento
          </Button>
        </div>
      </div>
    )
  }

  // Mostrar tracking após agendamento
  if (showTracking && existingAppointment) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Agendamento Confirmado!</h3>
          <p className="text-green-700 mb-6">
            Seu agendamento foi realizado com sucesso. Acompanhe o status através do link abaixo.
          </p>
          
          <Button
            onClick={() => window.open(existingAppointment.trackingUrl, '_blank')}
            className="bg-green-600 hover:bg-green-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Acompanhar Agendamento
          </Button>
        </div>
      </div>
    )
  }

  // Formulário normal para novo agendamento
  console.log(`Renderizando formulário com ${availableSlots.length} horários disponíveis:`, availableSlots)
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Seu nome completo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={clientPhone}
          onChange={handlePhoneChange}
          placeholder="(11) 99999-9999"
          required
          type="tel"
        />
        <p className="text-xs text-muted-foreground">
          Digite apenas números. O telefone será formatado automaticamente.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Data</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Horário</Label>
        <Select value={time} onValueChange={setTime} disabled={!date || availableSlots.length === 0}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um horário" />
          </SelectTrigger>
          <SelectContent>
            {availableSlots.map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {date && availableSlots.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum horário disponível para esta data
          </p>
        )}
        {date && availableSlots.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {availableSlots.length} horário(s) disponível(is)
          </p>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes("sucesso") 
            ? "bg-green-100 text-green-800 border border-green-200" 
            : "bg-red-100 text-red-800 border border-red-200"
        }`}>
          <div className="whitespace-pre-line">{message}</div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Agendando..." : "Confirmar Agendamento"}
      </Button>
    </form>
  )
} 