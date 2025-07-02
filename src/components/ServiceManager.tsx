"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Scissors, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface ServiceManagerProps {
  shopId: string; // This is now the slug
}

const PREDEFINED_SERVICES = [
  { name: "Corte de Cabelo", defaultPrice: 30, defaultDuration: 45 },
  { name: "Barba", defaultPrice: 20, defaultDuration: 30 },
  { name: "Corte + Barba", defaultPrice: 45, defaultDuration: 60 },
  { name: "Corte Fade", defaultPrice: 35, defaultDuration: 50 },
  { name: "Corte Clássico", defaultPrice: 25, defaultDuration: 40 },
  { name: "Corte Buzz Cut", defaultPrice: 20, defaultDuration: 30 },
  { name: "Hidratação", defaultPrice: 15, defaultDuration: 20 },
  { name: "Pigmentação", defaultPrice: 25, defaultDuration: 30 },
  { name: "Sobrancelha", defaultPrice: 10, defaultDuration: 15 },
  { name: "Pigmentação de Barba", defaultPrice: 30, defaultDuration: 45 },
];

export function ServiceManager({ shopId }: ServiceManagerProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [internalShopId, setInternalShopId] = useState<string>("");
  
  // Form states
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [customServiceName, setCustomServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [isCustomService, setIsCustomService] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [shopId]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shops/${shopId}/services`);
      const data = await response.json();
      console.log("Services response:", data);
      if (response.ok) {
        setServices(data.services || data);
        setInternalShopId(data.shopId || "");
        console.log("Internal shop ID set to:", data.shopId);
      } else {
        toast.error("Erro ao carregar serviços", {
          description: data.error || "Tente novamente mais tarde"
        });
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
      toast.error("Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceTypeChange = (value: string) => {
    setSelectedServiceType(value);
    setIsCustomService(value === "custom");
    
    if (value !== "custom") {
      const predefined = PREDEFINED_SERVICES.find(s => s.name === value);
      if (predefined) {
        setServicePrice(predefined.defaultPrice.toString());
        setServiceDuration(predefined.defaultDuration.toString());
      }
    } else {
      setServicePrice("");
      setServiceDuration("");
    }
  };

  const handleCreateService = async () => {
    console.log("Creating service with internalShopId:", internalShopId);
    
    let shopIdToUse = internalShopId;
    
    // Se não temos o ID interno, vamos buscá-lo
    if (!shopIdToUse) {
      try {
        const shopResponse = await fetch(`/api/shops/${shopId}`);
        const shopData = await shopResponse.json();
        if (shopResponse.ok && shopData.id) {
          shopIdToUse = shopData.id;
          setInternalShopId(shopData.id);
        } else {
          toast.error("Erro: Não foi possível obter o ID da loja");
          return;
        }
      } catch (error) {
        toast.error("Erro ao buscar dados da loja");
        return;
      }
    }

    if (!selectedServiceType && !customServiceName) {
      toast.error("Selecione um tipo de serviço ou digite um nome personalizado");
      return;
    }

    if (!servicePrice || !serviceDuration) {
      toast.error("Preço e duração são obrigatórios");
      return;
    }

    const serviceName = isCustomService ? customServiceName : selectedServiceType;
    
    setSubmitting(true);
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopId: shopIdToUse,
          name: serviceName,
          price: parseFloat(servicePrice),
          duration: parseInt(serviceDuration),
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setServices([...services, data]);
        toast.success("Serviço criado com sucesso!");
        resetForm();
        setIsDialogOpen(false);
      } else {
        toast.error("Erro ao criar serviço", {
          description: data.error || "Tente novamente mais tarde"
        });
      }
    } catch (error) {
      console.error("Failed to create service:", error);
      toast.error("Erro ao criar serviço");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setServices(services.filter((s) => s.id !== serviceId));
        toast.success("Serviço removido com sucesso!");
      } else {
        const data = await response.json();
        toast.error("Erro ao remover serviço", {
          description: data.error || "Tente novamente mais tarde"
        });
      }
    } catch (error) {
      console.error("Failed to delete service:", error);
      toast.error("Erro ao remover serviço");
    }
  };

  const resetForm = () => {
    setSelectedServiceType("");
    setCustomServiceName("");
    setServicePrice("");
    setServiceDuration("");
    setIsCustomService(false);
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.toLowerCase().includes("barba")) return "🧔";
    if (serviceName.toLowerCase().includes("combo") || serviceName.toLowerCase().includes("corte + barba")) return "✂️";
    return "💇";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Serviços da Barbearia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando serviços...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          Serviços da Barbearia
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gerencie os serviços oferecidos pela sua barbearia
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Serviço</Label>
                <Select value={selectedServiceType} onValueChange={handleServiceTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_SERVICES.map((service) => (
                      <SelectItem key={service.name} value={service.name}>
                        {service.name} - R$ {service.defaultPrice} ({service.defaultDuration} min)
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Serviço Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isCustomService && (
                <div className="space-y-2">
                  <Label htmlFor="customServiceName">Nome do Serviço</Label>
                  <Input
                    id="customServiceName"
                    value={customServiceName}
                    onChange={(e) => setCustomServiceName(e.target.value)}
                    placeholder="Ex: Hidratação, Pigmentação, etc."
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servicePrice">Preço (R$)</Label>
                  <Input
                    id="servicePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    placeholder="30.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceDuration">Duração (min)</Label>
                  <Input
                    id="serviceDuration"
                    type="number"
                    min="5"
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(e.target.value)}
                    placeholder="45"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateService} 
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {services.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum serviço cadastrado ainda</p>
            <p className="text-sm">Adicione seus primeiros serviços para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getServiceIcon(service.name)}</span>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">R$ {service.price.toFixed(2)}</Badge>
                      <Badge variant="outline">{service.duration} min</Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeleteService(service.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
