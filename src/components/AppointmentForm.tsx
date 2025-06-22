"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
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
  const [clientContact, setClientContact] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const fetchAvailableSlots = useCallback(async () => {
    if (!date) return

    try {
      const response = await fetch(
        `/api/shops/${shop.slug}/availability?date=${date.toISOString().split('T')[0]}`
      )
      const data = await response.json()

      if (response.ok) {
        setAvailableSlots(data.availableSlots)
        setTime("")
      } else {
        setMessage(data.error)
      }
    } catch {
      setMessage("Erro ao buscar horários disponíveis")
    }
  }, [date, shop.slug])

  // Buscar horários disponíveis quando a data muda
  useEffect(() => {
    if (date) {
      fetchAvailableSlots()
    }
  }, [date, fetchAvailableSlots])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (!date || !time || !clientName || !clientContact) {
      setMessage("Todos os campos são obrigatórios")
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
          clientContact,
          date: date.toISOString().split('T')[0],
          time,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Agendamento realizado com sucesso!")
        setClientName("")
        setClientContact("")
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
        <Label htmlFor="contact">E-mail ou Telefone</Label>
        <Input
          id="contact"
          value={clientContact}
          onChange={(e) => setClientContact(e.target.value)}
          placeholder="seu@email.com ou (11) 99999-9999"
          required
        />
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
      </div>

      {message && (
        <div className={`p-3 rounded-md ${
          message.includes("sucesso") 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {message}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Agendando..." : "Confirmar Agendamento"}
      </Button>
    </form>
  )
} 