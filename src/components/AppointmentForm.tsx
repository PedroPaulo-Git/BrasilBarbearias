"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ExternalLink, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Shop {
  id: string;
  name: string;
  slug: string;
  openTime: string;
  closeTime: string;
  serviceDuration: number;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}
interface AppointmentFormProps {
  shop: Shop;
  services: Service[];
  defaultServices: { name: string }[];
  defaultDuration: number;
  // ...other props if needed
}

export function AppointmentForm({ shop, services: initialServices, defaultServices, defaultDuration }: AppointmentFormProps) {
  const [services, setServices] = useState<Service[]>(initialServices || []);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [existingAppointment, setExistingAppointment] = useState<any>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [checkingInitial, setCheckingInitial] = useState(true);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [haircutStyle, setHaircutStyle] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [customServices, setCustomServices] = useState<string[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`/api/shops/${shop.slug}/services`);
        const data = await response.json();
        if (response.ok) {
         setServices(data.services || data);
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    };
    fetchServices();
  }, [shop.slug]);

  useEffect(() => {
    const calculateTotals = () => {
      const selected = services.filter((s) => selectedServices.includes(s.id));
      const price = selected.reduce((acc, s) => acc + s.price, 0);
      const duration = selected.reduce((acc, s) => acc + s.duration, 0);
      setTotalPrice(price);
      setTotalDuration(duration);
    };
    calculateTotals();
  }, [selectedServices, services]);

  const handleServiceChange = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length > 11) return value.slice(0, 11);
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
        6
      )}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7
      )}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setClientPhone(formatted);
  };

  const getPhoneNumbers = (phone: string) => {
    return phone.replace(/\D/g, "");
  };

  const fetchAvailableSlots = useCallback(async () => {
    if (!date) return;

    try {
      const dateString = date.toISOString().split("T")[0];
      const response = await fetch(
        `/api/shops/${shop.slug}/availability?date=${dateString}`
      );
      const data = await response.json();

      if (response.ok) {
        setAvailableSlots(data.availableSlots || []);
        setTime("");
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      setMessage("Erro ao buscar horários disponíveis");
    }
  }, [date, shop.slug]);

  useEffect(() => {
    if (date) {
      fetchAvailableSlots();
    }
  }, [date, fetchAvailableSlots]);

  useEffect(() => {
    const checkInitialAppointment = async () => {
      try {
        const savedPhones = JSON.parse(
          localStorage.getItem("appointmentPhones") || "[]"
        );

        for (const phone of savedPhones) {
          const response = await fetch(
            `/api/shops/${shop.slug}/check-appointment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ phone }),
            }
          );

          const data = await response.json();

          if (response.ok && data.hasAppointment) {
            setExistingAppointment(data);
            setCheckingInitial(false);
            return;
          }
        }

        setCheckingInitial(false);
      } catch (error) {
        console.error("Erro ao verificar agendamento inicial:", error);
        setCheckingInitial(false);
      }
    };

    checkInitialAppointment();
  }, [shop.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!date || !time || !clientName || !clientPhone) {
      setMessage("Todos os campos são obrigatórios");
      setLoading(false);
      return;
    }

    if (selectedServices.length === 0 && customServices.length === 0) {
      setMessage("Selecione pelo menos um serviço");
      setLoading(false);
      return;
    }

    try {
      const phoneNumbers = getPhoneNumbers(clientPhone);
      const checkResponse = await fetch(
        `/api/shops/${shop.slug}/check-appointment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone: phoneNumbers }),
        }
      );

      const checkData = await checkResponse.json();

      if (checkResponse.ok && checkData.hasAppointment) {
        setMessage("Você já possui um agendamento ativo nesta barbearia.");
        setExistingAppointment(checkData);
        setShowTracking(false);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Erro ao verificar agendamento:", error);
    }

    const phoneNumbers = getPhoneNumbers(clientPhone);
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      setMessage("Telefone deve ter 10 ou 11 dígitos (com DDD)");
      setLoading(false);
      return;
    }

    if (clientPhone.includes("@")) {
      setMessage(
        "Por favor, use apenas números de telefone. Emails não são aceitos."
      );
      setLoading(false);
      return;
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
          date: date.toISOString().split("T")[0],
          time,
          selectedServices: [
            ...selectedServices,
            ...customServices.map((name) => ({ name, price: 0, duration: defaultDuration }))
          ],
          haircutStyle,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        try {
          const phoneNumbers = getPhoneNumbers(clientPhone);
          const savedPhones = JSON.parse(
            localStorage.getItem("appointmentPhones") || "[]"
          );
          if (!savedPhones.includes(phoneNumbers)) {
            savedPhones.push(phoneNumbers);
            localStorage.setItem(
              "appointmentPhones",
              JSON.stringify(savedPhones)
            );
          }

          const recentAppointments = JSON.parse(
            localStorage.getItem(`recentAppointments_${shop.slug}`) || "[]"
          );
          const newAppointment = {
            phone: phoneNumbers,
            date: new Date().toISOString(),
            shopSlug: shop.slug,
          };
          recentAppointments.push(newAppointment);

          if (recentAppointments.length > 5) {
            recentAppointments.splice(0, recentAppointments.length - 5);
          }

          localStorage.setItem(
            `recentAppointments_${shop.slug}`,
            JSON.stringify(recentAppointments)
          );
        } catch (e) {
          console.log(
            "localStorage não disponível, agendamento salvo apenas no servidor"
          );
        }

        setExistingAppointment({
          trackingUrl: data.trackingUrl,
          appointment: {
            date: date.toISOString().split("T")[0],
            time: time,
          },
        });
        setShowTracking(true);

        const bc = new BroadcastChannel("appointments-sync");
        bc.postMessage({ type: "new_appointment", shopSlug: shop.slug });
        bc.close();

        setClientName("");
        setClientPhone("");
        setDate(undefined);
        setTime("");
        setAvailableSlots([]);
        setSelectedServices([]);
        setHaircutStyle("");
      } else {
        setMessage(data.error);
      }
    } catch {
      setMessage("Erro ao realizar agendamento");
    } finally {
      setLoading(false);
    }
  };

  if (checkingInitial) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (existingAppointment && !showTracking) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-xl font-semibold text-blue-800 mb-3">
            Agendamento Ativo Encontrado
          </h3>
          <p className="text-blue-700 mb-6">
            Você já possui um agendamento ativo nesta barbearia. Para fazer um
            novo agendamento, aguarde o cancelamento ou conclusão do atual.
          </p>

          <Button
            onClick={() => {
              window.location.href = existingAppointment.trackingUrl;
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Acompanhar Agendamento
          </Button>
        </div>
      </div>
    );
  }

  if (showTracking && existingAppointment) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Agendamento Confirmado!
          </h3>
          <p className="text-green-700 mb-6">
            Seu agendamento foi realizado com sucesso. Acompanhe o status
            através do link abaixo.
          </p>

          <Button
            onClick={() => {
              window.location.href = existingAppointment.trackingUrl;
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Acompanhar Agendamento
          </Button>
        </div>
      </div>
    );
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

      {services.length > 0 && (
        <div className="space-y-4">
          <Label>Serviços</Label>
          {services.map((service) => (
            <div key={service.id} className="flex items-center space-x-2">
              <Checkbox
                id={service.id}
                checked={selectedServices.includes(service.id)}
                onCheckedChange={() => handleServiceChange(service.id)}
              />
              <label
                htmlFor={service.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {service.name} - R$ {service.price.toFixed(2)} ({service.duration} min)
              </label>
            </div>
          ))}
        </div>
      )}
      {services.length === 0 && (
        <div className="p-6 border border-gray-200 rounded-lg bg-white text-center space-y-4">
          <p className="text-base text-gray-700 font-medium">
            Não existem serviços pré-definidos pelo barbeiro.<br />
            <span className="text-gray-500 font-normal">Adicione o serviço que você deseja abaixo.</span>
          </p>
          <div className="max-w-xs mx-auto">
            <Select
              value=""
              onValueChange={(name: string) => setCustomServices([...customServices, name])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {defaultServices
                  .map((s: { name: string }) => s.name)
                  .filter((name: string) => !customServices.includes(name))
                  .map((name: string) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {customServices.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {customServices.map((name: string) => (
                <div key={name} className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-200">
                  <span className="text-sm text-gray-700">{name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-100"
                    onClick={() => setCustomServices(customServices.filter((n) => n !== name))}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* {services.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="haircutStyle">Estilo de Corte (Opcional)</Label>
          <Select value={haircutStyle} onValueChange={setHaircutStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um estilo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="classic">Clássico</SelectItem>
              <SelectItem value="buzz">Buzz Cut</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )} */}

      <div className="space-y-2">
        <Label>Data</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date
                ? format(date, "PPP", { locale: ptBR })
                : "Selecione uma data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Horário</Label>
        <Select
          value={time}
          onValueChange={setTime}
          disabled={!date || availableSlots.length === 0}
        >
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
        {services.length > 0 && (
      <div className="p-4 bg-gray-100 rounded-md">
        <p>Total: R$ {totalPrice.toFixed(2)}</p>
        <p>Duração: {totalDuration} minutos</p>
      </div>
      )}
      
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.includes("sucesso")
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          <div className="whitespace-pre-line">{message}</div>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || (services.length === 0 && customServices.length === 0)}
      >
        {loading ? "Agendando..." : "Confirmar Agendamento"}
      </Button>
    </form>
  );
}

