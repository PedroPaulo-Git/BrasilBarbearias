"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  MessageCircle,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
  Star,
  X,
} from "lucide-react";
import { format, parseISO, isToday, isThisWeek, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ImageUploader } from "@/components/ImageUploader";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import { useToast } from "@/components/ui/use-toast";
import { toast } from 'sonner'

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  service: string;
  createdAt: string;
  galleryImages: string[];
  instagramUrl?: string | null;
  whatsappUrl?: string | null;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  address?: string;
  openTime: string;
  closeTime: string;
  serviceDuration: number;
  description?: string | null;
  galleryImages: string[];
  instagramUrl?: string | null;
  whatsappUrl?: string | null;
  mapUrl?: string | null;
  rating?: number | null;
}

export default function ManageShopPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  // const { toast } = useToast();
  const [shop, setShop] = useState<Shop | null>(null);
  // const [shopId, setShopId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">(
    "all"
  );
  const [showCancelled, setShowCancelled] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "appointments" | "stats" | "settings"
  >("appointments");

  // States for profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    address: "",
    description: "",
    instagramUrl: "",
    whatsappNumber: "",
    mapUrl: "",
    rating: 0,
  });
  const [gallery, setGallery] = useState<{ key: string, url: string }[]>([]);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Estados para remoção em massa
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  // Dentro do componente principal:
  const [removingShop, setRemovingShop] = useState(false);
  const [removeShopMsg, setRemoveShopMsg] = useState("");

  const [formData, setFormData] = useState<Partial<Shop>>({});
  const [saving, setSaving] = useState(false);
  const [initialGallery, setInitialGallery] = useState<{ key: string, url: string }[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const submitted = useRef(false);

  const fetchAppointmentsOnly = useCallback(async (shopId: string) => {
    console.log("⏱️ Polling for new appointments...");
    try {
      const apptRes = await fetch(
        `/api/shops/${shopId}/appointments?showCancelled=${showCancelled}`
      );
      if (!apptRes.ok) {
        // Silently fail or log to console without disrupting the user
        console.error("Polling failed: Could not fetch appointments.");
        return;
      }
      const apptData = await apptRes.json();
      setAppointments(apptData); // Update only the appointments list
    } catch (err) {
      console.error("Error during appointment polling:", err);
    }
  }, [showCancelled]); // Dependency on showCancelled ensures the poll uses the latest filter

  const fetchShopAndAppointmentsInitial = useCallback(async (shopId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch shop data and initial appointments in parallel for speed
      const [shopResponse, apptResponse] = await Promise.all([
        fetch(`/api/shops/${shopId}`),
        fetch(`/api/shops/${shopId}/appointments?showCancelled=${showCancelled}`)
      ]);
  
      if (!shopResponse.ok) throw new Error("Barbershop not found or permission denied.");
      if (!apptResponse.ok) throw new Error("Failed to fetch initial appointments.");
      
      const shopData = await shopResponse.json();
      const apptData = await apptResponse.json();
  
      // Set all state related to the shop
      setShop(shopData);
      setProfileData({
        name: shopData.name || "",
        address: shopData.address || "",
        description: shopData.description || "",
        instagramUrl: shopData.instagramUrl || "",
        whatsappNumber: shopData.whatsappUrl ? shopData.whatsappUrl.replace(/\D/g, "") : "",
        mapUrl: shopData.mapUrl || "",
        rating: shopData.rating || 0,
      });
      const galleryFiles = (shopData.galleryImages || []).map((url: string) => ({
        url,
        key: url.substring(url.lastIndexOf("/") + 1),
      }));
      setGallery(galleryFiles);
      setInitialGallery(galleryFiles);
  
      // Set the initial appointments
      setAppointments(apptData);
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [showCancelled]); 

  // const fetchShopAndAppointments = async () => {
  //   const resolvedParams = await params;
  //   const shopId = resolvedParams.shopId;
    
  //   if (!shopId) return; // Só executa se shopId estiver disponível
    
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     // 1. Buscar dados da barbearia por slug
  //     const shopResponse = await fetch(`/api/shops/${shopId}`);
  //     if (!shopResponse.ok) {
  //       throw new Error("Barbearia não encontrada ou sem permissão.");
  //     }
  //     const shopData = await shopResponse.json();
  //     setShop(shopData);
  
  //     // 2. Popular profileData
  //     setProfileData({
  //       name: shopData.name || "",
  //       address: shopData.address || "",
  //       description: shopData.description || "",
  //       instagramUrl: shopData.instagramUrl || "",
  //       whatsappNumber: shopData.whatsappUrl
  //         ? shopData.whatsappUrl.replace(/\D/g, "")
  //         : "",
  //       mapUrl: shopData.mapUrl || "",
  //       rating: shopData.rating || 0,
  //     });
  
  //     // 3. Popular galeria
  //     const galleryFiles = (shopData.galleryImages || []).map((url: string) => ({
  //       url,
  //       key: url.substring(url.lastIndexOf("/") + 1),
  //     }));
  //     setGallery(galleryFiles);
  //     setInitialGallery(galleryFiles);
  
  //     // 4. Buscar agendamentos
  //     const apptRes = await fetch(
  //       `/api/shops/${shopId}/appointments?showCancelled=${showCancelled}`
  //     );
  //     if (!apptRes.ok) {
  //       throw new Error("Falha ao buscar agendamentos.");
  //     }
  //     const apptData = await apptRes.json();
  //     setAppointments(apptData);
  //   } catch (err: any) {
  //     console.error("Erro ao carregar dados:", err);
  //     setError(err.message || "Erro inesperado.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // Remover BroadcastChannel e garantir polling confiável
  // useEffect(() => {
  //   fetchShopAndAppointments();
  // }, [params, showCancelled]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
  
    const initialize = async () => {
      const resolvedParams = await params;
      const shopId = resolvedParams.shopId;
      
      if (!shopId) return;
  
      // 1. Perform the full, initial data load
      await fetchShopAndAppointmentsInitial(shopId);
  
      // 2. Set up the polling interval to only fetch appointments
      intervalId = setInterval(() => {
        fetchAppointmentsOnly(shopId);
      }, 5000); // Poll every 5 seconds
    };
  
    initialize();
  
    // Cleanup function: this runs when the component unmounts or dependencies change
    return () => {
      clearInterval(intervalId);
    };
  }, [params, fetchShopAndAppointmentsInitial, fetchAppointmentsOnly]);
  
  useEffect(() => {
    return () => {
      // This cleanup function runs when the component unmounts
      if (submitted.current) {
        return; // Don't delete files if form was submitted
      }

      // Determine which files were newly uploaded but not saved
      const initialKeys = new Set(initialGallery.map(img => img.key));
      const currentKeys = new Set(gallery.map(img => img.key));
      const newKeysNotSaved = [...currentKeys].filter(key => !initialKeys.has(key));

      if (newKeysNotSaved.length > 0) {
        console.log("Cleaning up orphaned files:", newKeysNotSaved);
        // Fire-and-forget request to delete orphaned files
        fetch('/api/uploadthing/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keys: newKeysNotSaved }),
          keepalive: true, // Ensures the request is sent even if the page is closing
        });
      }
    };
  }, [gallery, initialGallery]);

  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = parseISO(appointment.date);

    // Se não estiver mostrando cancelados, filtrar eles
    if (!showCancelled && appointment.status === "cancelled") {
      return false;
    }

    switch (filter) {
      case "today":
        return isToday(appointmentDate);
      case "week":
        return isThisWeek(appointmentDate);
      case "month":
        return isThisMonth(appointmentDate);
      default:
        return true;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
        );
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Realizado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setAppointments(
          appointments.map((apt) =>
            apt.id === appointmentId
              ? { ...apt, status: newStatus as any }
              : apt
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const getWhatsAppMessage = (appointment: Appointment, status: string) => {
    const customerName = appointment.customer.name;
    const appointmentDate = format(parseISO(appointment.date), "dd/MM/yyyy", {
      locale: ptBR,
    });
    const appointmentTime = appointment.time;
    const shopName = shop?.name || "Barbearia";

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

Obrigado! ✂️`,
    };

    return messages[status as keyof typeof messages] || messages.pending;
  };

  const openWhatsApp = (appointment: Appointment) => {
    // Formatar telefone para WhatsApp (apenas números, adicionar 55 se necessário)
    let phone = appointment.customer.phone.replace(/\D/g, ""); // Remove caracteres não numéricos

    // Se não começar com 55 (código do Brasil), adicionar
    if (!phone.startsWith("55")) {
      phone = "55" + phone;
    }

    const message = encodeURIComponent(
      getWhatsAppMessage(appointment, appointment.status)
    );
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  // Funções para remoção em massa
  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleDeleteAppointments = async () => {
    if (selectedStatuses.length === 0) {
      setDeleteMessage(
        "Selecione pelo menos um tipo de agendamento para remover."
      );
      return;
    }

    setDeleting(true);
    setDeleteMessage("");

    try {
      const { shopId: slug } = await params;
      const response = await fetch(`/api/shops/${slug}/appointments`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statuses: selectedStatuses }),
      });

      const data = await response.json();

      if (response.ok) {
        setDeleteMessage(data.message);
        setSelectedStatuses([]);
        setShowDeleteDialog(false);

        // Recarregar agendamentos
        const appointmentsResponse = await fetch(
          `/api/shops/${slug}/appointments?showCancelled=${showCancelled}`
        );
        const appointmentsData = await appointmentsResponse.json();

        if (appointmentsResponse.ok) {
          setAppointments(appointmentsData);
        }
      } else {
        setDeleteMessage(data.error || "Erro ao remover agendamentos");
      }
    } catch (error) {
      console.error("Erro ao remover agendamentos:", error);
      setDeleteMessage("Erro interno do servidor");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusCount = (status: string) => {
    return appointments.filter((a) => a.status === status).length;
  };

  const stats = {
    total: appointments.filter((a) => a.status !== "cancelled").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    pending: appointments.filter((a) => a.status === "pending").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  const handleRemoveShop = async () => {
    setRemovingShop(true);
    setRemoveShopMsg("");
    try {
      const { shopId: slug } = await params;
      const res = await fetch(`/api/shops/${slug}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setRemoveShopMsg("Barbearia removida com sucesso!");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setRemoveShopMsg(data.error || "Erro ao remover barbearia");
      }
    } catch {
      setRemoveShopMsg("Erro ao remover barbearia");
    } finally {
      setRemovingShop(false);
    }
  };

  const handleProfileUpdate = async () => {
    setUpdatingProfile(true);
    setProfileMessage("");
    try {
      const { shopId: slug } = await params;
      const { whatsappNumber, ...rest } = profileData;
      const fullData = {
        ...rest,
        galleryImages: gallery.map(img => img.url),
        whatsappUrl: whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}` : undefined,
      };
      const res = await fetch(`/api/shops/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage("Perfil atualizado com sucesso!");
        setShop(data); // Update shop data locally
        setTimeout(() => setProfileMessage(""), 2000);
      } else {
        setProfileMessage(data.error || "Erro ao atualizar perfil");
      }
    } catch {
      setProfileMessage("Erro ao atualizar perfil");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    submitted.current = true; // Mark as submitted to prevent cleanup

    const { whatsappNumber, ...restOfData } = profileData;

    const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : undefined;

    try {
      // Determine which files to delete from Uploadthing
      const initialKeys = new Set(initialGallery.map(img => img.key));
      const currentKeys = new Set(gallery.map(img => img.key));
      const keysToDelete = [...initialKeys].filter(key => !currentKeys.has(key));

      const response = await fetch(`/api/shops/${(await params).shopId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...restOfData, 
          whatsappUrl,
          galleryImages: gallery.map(img => img.url) // Send only URLs to backend
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar a barbearia.");
      }
      
      // If shop update is successful, delete the removed files from Uploadthing
      if (keysToDelete.length > 0) {
        await fetch('/api/uploadthing/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keys: keysToDelete }),
        });
      }

      toast.success("Perfil atualizado com sucesso!", {
        description: "As alterações foram salvas com sucesso.",
      });
      
      // Update the initial state to match the saved state
      setInitialGallery(gallery);

    } catch (error: any) {
      toast.error("Erro ao atualizar perfil", {
        description: error.message,
      })
    } finally {
      setSaving(false);
      setTimeout(() => submitted.current = false, 100); // Reset submitted status
    }
  };

  if (status === "loading") {
    return <div>Carregando...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Carregando dados da barbearia...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Barbearia não encontrada</h1>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="mr-auto cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{shop.name}</h1>
              <p className="text-muted-foreground">
                Gerenciamento da Barbearia
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open(`/shops/${shop.slug}`, "_blank")}
            className="w-full sm:w-auto cursor-pointer"
          >
            Ver Página Pública
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-1 mb-6">
          <Button
            variant={activeTab === "appointments" ? "default" : "outline"}
            onClick={() => setActiveTab("appointments")}
            className="justify-start sm:justify-center cursor-pointer"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Agendamentos
          </Button>
          <Button
            variant={activeTab === "stats" ? "default" : "outline"}
            onClick={() => setActiveTab("stats")}
            className="justify-start sm:justify-center cursor-pointer"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Estatísticas
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
            className="justify-start sm:justify-center cursor-pointer"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>

        {/* Content */}
        {activeTab === "appointments" && (
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filtrar:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="cursor-pointer"
                >
                  Todos
                </Button>
                <Button
                  variant={filter === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("today")}
                  className="cursor-pointer"
                >
                  Hoje
                </Button>
                <Button
                  variant={filter === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("week")}
                  className="cursor-pointer"
                >
                  Esta Semana
                </Button>
                <Button
                  variant={filter === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("month")}
                  className="cursor-pointer"
                >
                  Este Mês
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={showCancelled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowCancelled(!showCancelled)}
                  className="cursor-pointer"
                >
                  {showCancelled ? "Ocultar Cancelados" : "Mostrar Cancelados"}
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
                  <Card
                    key={appointment.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {appointment.customer.name}
                              </span>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">
                                {format(
                                  parseISO(appointment.date),
                                  "dd/MM/yyyy",
                                  { locale: ptBR }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">
                                {appointment.customer.phone}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                          {/* Botão WhatsApp para status específicos */}
                          {(appointment.status === "pending" ||
                            appointment.status === "confirmed" ||
                            appointment.status === "cancelled") && (
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

                          {appointment.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(
                                    appointment.id,
                                    "confirmed"
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700 cursor-pointer"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleStatusChange(
                                    appointment.id,
                                    "cancelled"
                                  )
                                }
                                className="cursor-pointer"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </>
                          )}
                          {appointment.status === "confirmed" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(appointment.id, "completed")
                              }
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

        {activeTab === "stats" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Agendamentos
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Confirmados
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.confirmed}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Realizados
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.completed}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Perfil da Barbearia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2" htmlFor="description">Sobre Nós</Label>
                  <Textarea
                    id="description"
                    placeholder="Conte a história da sua barbearia..."
                    value={profileData.description}
                    onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2" htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    placeholder="https://instagram.com/suabarbearia"
                    value={profileData.instagramUrl}
                    onChange={(e) => setProfileData({ ...profileData, instagramUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2" htmlFor="whatsappNumber">WhatsApp (Apenas Números)</Label>
                  <Input
                    id="whatsappNumber"
                    placeholder="5511999998888"
                    value={profileData.whatsappNumber}
                    onChange={(e) => setProfileData({ ...profileData, whatsappNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2" htmlFor="mapUrl">Google Maps URL</Label>
                  <Input
                    id="mapUrl"
                    placeholder="https://maps.app.goo.gl/..."
                    value={profileData.mapUrl}
                    onChange={(e) => setProfileData({ ...profileData, mapUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2">Galeria de Fotos (Opcional, até 5)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-2">
                    {gallery.map((image) => (
                      <div key={image.key} className="relative group">
                        <img 
                          src={image.url} 
                          alt="Foto da galeria" 
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button 
                          type="button"
                          onClick={() => setGallery(gallery.filter(g => g.key !== image.key))} 
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {gallery.length < 5 && (
                    <ImageUploader
                      onUploadComplete={(res) => {
                        setGallery(prev => [...prev, ...res]);
                      }}
                      onUploadError={(err) => {
                        toast.error("Erro no Upload", {
                          description: `Ocorreu um erro ao enviar a imagem: ${err.message}`,
                        })
                      }}
                    />
                  )}
                </div>
                {session?.user.isAdmin && (
                  <div>
                    <Label className="mb-2" htmlFor="rating">Avaliação (Admin)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.5"
                      min="0"
                      max="5"
                      value={profileData.rating}
                      onChange={(e) => setProfileData({ ...profileData, rating: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}
                <Button onClick={handleUpdate} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
                {profileMessage && <p className="text-sm text-muted-foreground">{profileMessage}</p>}
              </CardContent>
            </Card>

            {/* Remoção em Massa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  Remover Agendamentos em Massa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Selecione os tipos de agendamentos que deseja remover
                  permanentemente. Esta ação não pode ser desfeita.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all"
                        checked={selectedStatuses.includes("all")}
                        onCheckedChange={() => handleStatusToggle("all")}
                      />
                      <label
                        htmlFor="all"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Todos os Agendamentos
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pending"
                        checked={selectedStatuses.includes("pending")}
                        onCheckedChange={() => handleStatusToggle("pending")}
                      />
                      <label
                        htmlFor="pending"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Pendentes ({getStatusCount("pending")})
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="confirmed"
                        checked={selectedStatuses.includes("confirmed")}
                        onCheckedChange={() => handleStatusToggle("confirmed")}
                      />
                      <label
                        htmlFor="confirmed"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Confirmados ({getStatusCount("confirmed")})
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="completed"
                        checked={selectedStatuses.includes("completed")}
                        onCheckedChange={() => handleStatusToggle("completed")}
                      />
                      <label
                        htmlFor="completed"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Realizados ({getStatusCount("completed")})
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cancelled"
                        checked={selectedStatuses.includes("cancelled")}
                        onCheckedChange={() => handleStatusToggle("cancelled")}
                      />
                      <label
                        htmlFor="cancelled"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Cancelados ({getStatusCount("cancelled")})
                      </label>
                    </div>
                  </div>
                </div>

                {selectedStatuses.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Atenção: Esta ação é irreversível!
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          {selectedStatuses.includes("all")
                            ? `Todos os ${appointments.length} agendamentos serão removidos permanentemente.`
                            : `${selectedStatuses.length} tipo(s) de agendamento selecionado(s) serão removidos.`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Dialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={selectedStatuses.length === 0}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover Agendamentos Selecionados
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Confirmar Remoção
                      </DialogTitle>
                      <DialogDescription>
                        Tem certeza que deseja remover permanentemente os
                        agendamentos selecionados? Esta ação não pode ser
                        desfeita.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Tipos selecionados:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {selectedStatuses.includes("all") && (
                          <li>
                            • Todos os agendamentos ({appointments.length})
                          </li>
                        )}
                        {selectedStatuses.includes("pending") &&
                          !selectedStatuses.includes("all") && (
                            <li>• Pendentes ({getStatusCount("pending")})</li>
                          )}
                        {selectedStatuses.includes("confirmed") &&
                          !selectedStatuses.includes("all") && (
                            <li>
                              • Confirmados ({getStatusCount("confirmed")})
                            </li>
                          )}
                        {selectedStatuses.includes("completed") &&
                          !selectedStatuses.includes("all") && (
                            <li>
                              • Realizados ({getStatusCount("completed")})
                            </li>
                          )}
                        {selectedStatuses.includes("cancelled") &&
                          !selectedStatuses.includes("all") && (
                            <li>
                              • Cancelados ({getStatusCount("cancelled")})
                            </li>
                          )}
                      </ul>
                    </div>

                    {deleteMessage && (
                      <div
                        className={`p-3 rounded-md text-sm ${
                          deleteMessage.includes("sucesso")
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {deleteMessage}
                      </div>
                    )}

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteDialog(false)}
                        disabled={deleting}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAppointments}
                        disabled={deleting}
                      >
                        {deleting ? "Removendo..." : "Confirmar Remoção"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Outras Configurações */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Outras Configurações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configurações avançadas da barbearia serão implementadas em
                  breve.
                </p>
              </CardContent>
            </Card> */}

            {/* Remoção de Barbearia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  Remover Barbearia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta ação é irreversível. Todos os dados da barbearia e seus agendamentos serão permanentemente excluídos.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={removingShop}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover Barbearia
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar Remoção</DialogTitle>
                      <DialogDescription>
                        Tem certeza que deseja remover esta barbearia? Esta ação é final e não pode ser desfeita.
                      </DialogDescription>
                    </DialogHeader>
                    {removeShopMsg && (
                      <div className={`mt-2 text-sm ${removeShopMsg.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                        {removeShopMsg}
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" disabled={removingShop}>
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleRemoveShop}
                        disabled={removingShop}
                      >
                        {removingShop ? "Removendo..." : "Sim, Remover"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
