"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Clock,
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
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Check,
  Users,
  Calendar as CalendarIcon,
  Phone,
  LockKeyhole,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  format,
  parseISO,
  isToday,
  isThisWeek,
  isThisMonth,
  isYesterday,
} from "date-fns";
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
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

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

  const [statusFilter, setStatusFilter] = useState<
    "active" | "all" | "cancelled" | "completed"
  >("active");
  const [dateFilter, setDateFilter] = useState<
    "all" | "yesterday" | "today" | "week" | "month"
  >("all");
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
  const [gallery, setGallery] = useState<{ key: string; url: string }[]>([]);
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
  const [initialGallery, setInitialGallery] = useState<
    { key: string; url: string }[]
  >([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const submitted = useRef(false);

  const [showSimpleModal, setShowSimpleModal] = useState(false);
  const [simpleDate, setSimpleDate] = useState<Date | undefined>();
  const [simpleTime, setSimpleTime] = useState("");
  const [isManual, setIsManual] = useState(false);
  const [simpleReason, setSimpleReason] = useState("");

  const timeSlots = useMemo(() => {
    if (!shop) return [];

    const { openTime, closeTime, serviceDuration } = shop;
    if (!openTime || !closeTime || !serviceDuration) return [];

    const slots = [];

    let tempDate = new Date();
    const [openHour, openMinute] = openTime.split(":").map(Number);
    tempDate.setHours(openHour, openMinute, 0, 0);

    const [closeHour, closeMinute] = closeTime.split(":").map(Number);
    const closeDate = new Date();
    closeDate.setHours(closeHour, closeMinute, 0, 0);

    while (tempDate < closeDate) {
      slots.push(format(tempDate, "HH:mm"));
      tempDate.setMinutes(tempDate.getMinutes() + serviceDuration);
    }
    return slots;
  }, [shop]);

  const getAppointmentsUrl = (shopId: string, filter: string, data: string) => {
    let url = `/api/shops/${shopId}/appointments?status=${status}`;
    if (data && data !== "all") {
      url += `&date=${data}`;
    }
    return url;
  };

  const fetchAppointmentsOnly = useCallback(
    async (shopId: string) => {
      console.log("⏱️ Polling for new appointments...");
      try {
        const apptRes = await fetch(
          getAppointmentsUrl(shopId, statusFilter, dateFilter)
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
    },
    [statusFilter]
  );

  const fetchShopAndAppointmentsInitial = useCallback(
    async (shopId: string) => {
      setLoading(true);
      setError(null);
      try {
        // Fetch shop data and initial appointments in parallel for speed
        const [shopResponse, apptResponse] = await Promise.all([
          fetch(`/api/shops/${shopId}`),
          fetch(getAppointmentsUrl(shopId, statusFilter, dateFilter)),
        ]);

        if (!shopResponse.ok)
          throw new Error("Barbershop not found or permission denied.");
        if (!apptResponse.ok)
          throw new Error("Failed to fetch initial appointments.");

        const shopData = await shopResponse.json();
        const apptData = await apptResponse.json();

        // Set all state related to the shop
        setShop(shopData);
        setProfileData({
          name: shopData.name || "",
          address: shopData.address || "",
          description: shopData.description || "",
          instagramUrl: shopData.instagramUrl || "",
          whatsappNumber: shopData.whatsappUrl
            ? shopData.whatsappUrl.replace(/\D/g, "")
            : "",
          mapUrl: shopData.mapUrl || "",
          rating: shopData.rating || 0,
        });
        const galleryFiles = (shopData.galleryImages || []).map(
          (url: string) => ({
            url,
            key: url.substring(url.lastIndexOf("/") + 1),
          })
        );
        setGallery(galleryFiles);
        setInitialGallery(galleryFiles);

        // Set the initial appointments
        setAppointments(apptData);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

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
      const initialKeys = new Set(initialGallery.map((img) => img.key));
      const currentKeys = new Set(gallery.map((img) => img.key));
      const newKeysNotSaved = [...currentKeys].filter(
        (key) => !initialKeys.has(key)
      );

      if (newKeysNotSaved.length > 0) {
        console.log("Cleaning up orphaned files:", newKeysNotSaved);
        // Fire-and-forget request to delete orphaned files
        fetch("/api/uploadthing/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keys: newKeysNotSaved }),
          keepalive: true, // Ensures the request is sent even if the page is closing
        });
      }
    };
  }, [gallery, initialGallery]);

  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = parseISO(appointment.date);

    // Filtrar por status
    let statusMatch = false;
    switch (statusFilter) {
      case "active":
        statusMatch =
          appointment.status === "pending" ||
          appointment.status === "confirmed";
        break;
      case "cancelled":
        statusMatch = appointment.status === "cancelled";
        break;
      case "completed":
        statusMatch = appointment.status === "completed";
        break;
      case "all":
      default:
        statusMatch = true;
        break;
    }

    if (!statusMatch) {
      return false;
    }

    // Filtrar por data
    let dateMatch = false;
    switch (dateFilter) {
      case "yesterday":
        dateMatch = isYesterday(appointmentDate);
        break;
      case "today":
        dateMatch = isToday(appointmentDate);
        break;
      case "week":
        dateMatch = isThisWeek(appointmentDate);
        break;
      case "month":
        dateMatch = isThisMonth(appointmentDate);
        break;
      case "all":
      default:
        dateMatch = true;
        break;
    }

    return dateMatch;
  });

  // Filtro de data para as estatísticas
  const statsAppointments = appointments.filter((appointment) => {
    const appointmentDate = parseISO(appointment.date);
    switch (dateFilter) {
      case "yesterday":
        return isYesterday(appointmentDate);
      case "today":
        return isToday(appointmentDate);
      case "week":
        return isThisWeek(appointmentDate);
      case "month":
        return isThisMonth(appointmentDate);
      case "all":
      default:
        return true;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Confirmado
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            Pendente
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Cancelado
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Realizado
          </Badge>
        );
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
          getAppointmentsUrl(slug, statusFilter, dateFilter)
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

// Primeiro, filtra só os agendamentos reais (excluindo bloqueios)
const realAppointments = statsAppointments.filter(
  (a) =>
    a.customer.name !== "Horário reservado" &&
    a.customer.name !== "Horário bloqueado"
);

// Agora calcula os stats só com base nesses agendamentos reais
const stats = {
  total: realAppointments.length,
  confirmed: realAppointments.filter((a) => a.status === "confirmed").length,
  pending: realAppointments.filter((a) => a.status === "pending").length,
  cancelled: realAppointments.filter((a) => a.status === "cancelled").length,
  completed: realAppointments.filter((a) => a.status === "completed").length,
};

// Calcula as métricas com base nos agendamentos reais
const performanceMetrics = {
  completionRate: (stats.total > 0
    ? (stats.completed / (stats.total - stats.cancelled - stats.pending)) * 100
    : 0
  ).toFixed(1),
  confirmationRate: (stats.pending + stats.confirmed > 0
    ? (stats.confirmed / (stats.pending + stats.confirmed)) * 100
    : 0
  ).toFixed(1),
  cancellationRate: (stats.total > 0
    ? (stats.cancelled / stats.total) * 100
    : 0
  ).toFixed(1),
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

  const handleUpdate = async () => {
    setSaving(true);
    submitted.current = true; // Mark as submitted to prevent cleanup

    const { whatsappNumber, ...restOfData } = profileData;

    const whatsappUrl = whatsappNumber
      ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
      : undefined;

    try {
      // Determine which files to delete from Uploadthing
      const initialKeys = new Set(initialGallery.map((img) => img.key));
      const currentKeys = new Set(gallery.map((img) => img.key));
      const keysToDelete = [...initialKeys].filter(
        (key) => !currentKeys.has(key)
      );

      const response = await fetch(`/api/shops/${(await params).shopId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...restOfData,
          whatsappUrl,
          galleryImages: gallery.map((img) => img.url), // Send only URLs to backend
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar a barbearia.");
      }

      // If shop update is successful, delete the removed files from Uploadthing
      if (keysToDelete.length > 0) {
        await fetch("/api/uploadthing/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      });
    } finally {
      setSaving(false);
      setTimeout(() => (submitted.current = false), 100); // Reset submitted status
    }
  };

  const generateImpossiblePhone = () => {
    // Sempre começa com 99999 e termina com 6 dígitos aleatórios
    const random = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
    return `99999${random}`; // Exemplo: 99999123456
  };
  const handleSimpleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!shop || !simpleDate || !simpleTime) {
      toast.error("Por favor, selecione uma data e hora.");
      return;
    }

    const name = isManual ? "Presencial" : "Horário reservado";
    const dummyPhone = generateImpossiblePhone();
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: shop.id,
          clientName: name,
          clientContact: dummyPhone,
          date: format(simpleDate, "yyyy-MM-dd"),
          time: simpleTime,
        }),
      });
      toast.success("Agendamento rápido criado com sucesso!");
      setShowSimpleModal(false);
      setSimpleDate(undefined);
      setSimpleTime("");
      fetchAppointmentsOnly(shop.id); // Atualiza lista
    } catch (error) {
      console.error("Erro ao bloquear horário:", error);
      toast.error("Ocorreu um erro ao criar o agendamento.");
    }
  };

  const deleteSimpleAppointment = async (appointmentId: string) => {
    try {
      await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });
       // Remova do estado local imediatamente:
    setAppointments((prev) => prev.filter(a => a.id !== appointmentId));
    if (shop) fetchAppointmentsOnly(shop.id); // Atualiza do backend depois
    } catch (error) {
      toast.error("Erro ao remover agendamento");
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
            <CalendarIcon className="h-4 w-4 mr-2" />
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
            <div className="flex flex-col gap-4 mb-6">
              {/* Status Filters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Status:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={statusFilter === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("active")}
                  >
                    Ativos
                  </Button>
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={
                      statusFilter === "completed" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setStatusFilter("completed")}
                  >
                    Realizados
                  </Button>
                  <Button
                    variant={
                      statusFilter === "cancelled" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setStatusFilter("cancelled")}
                  >
                    Cancelados
                  </Button>
                </div>
              </div>
              {/* Date Filters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Período:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={dateFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateFilter("all")}
                  >
                    Todos os Dias
                  </Button>
                  <Button
                    variant={dateFilter === "yesterday" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateFilter("yesterday")}
                  >
                    Ontem
                  </Button>
                  <Button
                    variant={dateFilter === "today" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateFilter("today")}
                  >
                    Hoje
                  </Button>
                  <Button
                    variant={dateFilter === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateFilter("week")}
                  >
                    Esta Semana
                  </Button>
                  <Button
                    variant={dateFilter === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateFilter("month")}
                  >
                    Este Mês
                  </Button>
                </div>
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
                filteredAppointments.map((appointment) => {
                  const phone = appointment.customer.phone;
                  const isManual = appointment.customer.name === "Presencial";
                  const isBlocked = appointment.customer.name === "Horário reservado";                  
                
                  const dateFormatted = format(parseISO(appointment.date), "dd/MM/yyyy", {
                    locale: ptBR,
                  });
                
                  const baseCardClasses = isManual
                    ? "bg-yellow-50 border-yellow-500 border-2 shadow-none"
                    : isBlocked
                    ? "bg-red-50 border-red-300 border text-red-800 shadow-sm"
                    : "hover:shadow-md transition-shadow cursor-pointer";
                
                  return (
                    <Card key={appointment.id} className={baseCardClasses}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Conteúdo principal */}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                {isBlocked ? (<><LockKeyhole className="h-4 w-4 text-muted-foreground"  /></>):(<><User className="h-4 w-4 text-muted-foreground" /></>) }        
                                <span className="font-medium">
                                  {appointment.customer.name}
                                </span>
                                {isManual && (
                                  <Badge className="bg-yellow-300 text-yellow-900 ml-2">
                                    Cliente manual
                                  </Badge>
                                )}
                              </div>
                             
                                {isManual && appointment.status === "completed" && (
                                  <Badge className="bg-green-300 text-green-900 ml-2">
                                    Realizado
                                  </Badge>
                                )}
                                {isBlocked && (
                                  <Badge className="bg-gray-200 text-red-500 ml-2">
                                    Horário bloqueado
                                  </Badge>
                                )}
                              {!isManual && !isBlocked && getStatusBadge(appointment.status)}
                            </div>
                
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{dateFormatted}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>{appointment.time}</span>
                              </div>
                              {!isManual && !isBlocked && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="truncate">{appointment.customer.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                
                          {/* Ações */}
                          <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                            {/* Normal */}
                            {!isManual && !isBlocked && (
                              <>
                                {(appointment.status === "pending" ||
                                  appointment.status === "confirmed" ||
                                  appointment.status === "cancelled") && (
                                  <Button
                                    size="sm"
                                    onClick={() => openWhatsApp(appointment)}
                                    variant="outline"
                                    className="border-green-600 text-green-600 hover:bg-green-50 cursor-pointer"
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
                                        handleStatusChange(appointment.id, "confirmed")
                                      }
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Confirmar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleStatusChange(appointment.id, "cancelled")
                                      }
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
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Marcar Realizado
                                  </Button>
                                )}
                              </>
                            )}
                
                            {/* Cliente Manual */}
                            {isManual && appointment.status !== "completed" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() =>
                                    handleStatusChange(appointment.id, "completed")
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Marcar como Realizado
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteSimpleAppointment(appointment.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Remover
                                </Button>
                              </>
                            )}
                
                            {/* Bloqueio */}
                            {isBlocked && (
                              <>
                                {/* <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => openEditSimpleModal(appointment)}
                                >
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Alterar Horário
                                </Button> */}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteSimpleAppointment(appointment.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Remover Bloqueio
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })                
              )}
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Filtrar Período:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={dateFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateFilter("all")}
                >
                  Todos
                </Button>
                <Button
                  variant={dateFilter === "yesterday" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateFilter("yesterday")}
                >
                  Ontem
                </Button>
                <Button
                  variant={dateFilter === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateFilter("today")}
                >
                  Hoje
                </Button>
                <Button
                  variant={dateFilter === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateFilter("week")}
                >
                  Esta Semana
                </Button>
                <Button
                  variant={dateFilter === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateFilter("month")}
                >
                  Este Mês
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Agendamentos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
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
                  <CardTitle className="text-sm font-medium">
                    Pendentes
                  </CardTitle>
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cancelados
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.cancelled}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>Taxa de Conclusão</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {performanceMetrics.completionRate}%
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-1">
                    Dos agendamentos ativos, quantos foram concluídos.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Check className="h-4 w-4" />
                    <span>Taxa de Confirmação</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {performanceMetrics.confirmationRate}%
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-1">
                    Dos agendamentos pendentes, quantos foram confirmados.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span>Taxa de Cancelamento</span>
                  </div>
                  <div className="text-2xl font-bold mt-1 text-red-500">
                    {performanceMetrics.cancellationRate}%
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-1">
                    Do total de agendamentos, quantos foram cancelados.
                  </p>
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
                  <Label className="mb-2" htmlFor="description">
                    Sobre Nós
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Conte a história da sua barbearia..."
                    value={profileData.description}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2" htmlFor="instagramUrl">
                    Instagram URL
                  </Label>
                  <Input
                    id="instagramUrl"
                    placeholder="https://instagram.com/suabarbearia"
                    value={profileData.instagramUrl}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        instagramUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2" htmlFor="whatsappNumber">
                    WhatsApp (Apenas Números)
                  </Label>
                  <Input
                    id="whatsappNumber"
                    placeholder="5511999998888"
                    value={profileData.whatsappNumber}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        whatsappNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2" htmlFor="mapUrl">
                    Google Maps URL
                  </Label>
                  <Input
                    id="mapUrl"
                    placeholder="https://maps.app.goo.gl/..."
                    value={profileData.mapUrl}
                    onChange={(e) =>
                      setProfileData({ ...profileData, mapUrl: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2">
                    Galeria de Fotos (Opcional, até 5)
                  </Label>
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
                          onClick={() =>
                            setGallery(
                              gallery.filter((g) => g.key !== image.key)
                            )
                          }
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
                        setGallery((prev) => [...prev, ...res]);
                      }}
                      onUploadError={(err) => {
                        toast.error("Erro no Upload", {
                          description: `Ocorreu um erro ao enviar a imagem: ${err.message}`,
                        });
                      }}
                    />
                  )}
                </div>
                {session?.user.isAdmin && (
                  <div>
                    <Label className="mb-2" htmlFor="rating">
                      Avaliação (Admin)
                    </Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.5"
                      min="0"
                      max="5"
                      value={profileData.rating}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          rating: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                )}
                <Button onClick={handleUpdate} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
                {profileMessage && (
                  <p className="text-sm text-muted-foreground">
                    {profileMessage}
                  </p>
                )}
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
                  Esta ação é irreversível. Todos os dados da barbearia e seus
                  agendamentos serão permanentemente excluídos.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={removingShop}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover Barbearia
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar Remoção</DialogTitle>
                      <DialogDescription>
                        Tem certeza que deseja remover esta barbearia? Esta ação
                        é final e não pode ser desfeita.
                      </DialogDescription>
                    </DialogHeader>
                    {removeShopMsg && (
                      <div
                        className={`mt-2 text-sm ${
                          removeShopMsg.includes("sucesso")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
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
            <Card>
  <CardHeader>
    <CardTitle className="text-lg font-semibold">
      Criar Cliente Manual ou Bloqueio
    </CardTitle>
    <p className="text-sm text-muted-foreground">
      Selecione a data, horário e o tipo de reserva.
    </p>
  </CardHeader>
  <CardContent>
    <Button
      onClick={() => setShowSimpleModal(true)}
      className="w-full bg-primary text-white hover:bg-primary/90"
    >
      + Novo Bloqueio ou Cliente Manual
    </Button>
  </CardContent>
</Card>

<Dialog open={showSimpleModal} onOpenChange={setShowSimpleModal}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="text-lg">
        Novo Agendamento Rápido
      </DialogTitle>
      <p className="text-sm text-muted-foreground">
        Selecione a data, horário e tipo de entrada.
      </p>
    </DialogHeader>

    <form onSubmit={handleSimpleSubmit} className="space-y-4">
      {/* Seletor de Data */}
      <div className="space-y-2">
        <Label>Data</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {simpleDate
                ? format(simpleDate, "PPP", { locale: ptBR })
                : "Selecione uma data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
          <Calendar
              mode="single"
              selected={simpleDate}
              onSelect={setSimpleDate}
              initialFocus
              disabled={(date: Date) => {
                // Bloqueia datas antes de hoje (considerando só a data, sem hora)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Seletor de Hora */}
      <div className="space-y-2">
        <Label>Horário</Label>
        {timeSlots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 rounded-md border">
            {timeSlots.map((time) => (
              <Button
                key={time}
                type="button"
                variant={simpleTime === time ? "default" : "outline"}
                onClick={() => setSimpleTime(time)}
                className="w-full"
              >
                {time}
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center p-4 bg-secondary rounded-md">
            Configure os horários e duração do atendimento nas configurações
            para ver os horários.
          </div>
        )}
      </div>

      {/* Toggle entre Cliente Manual e Bloqueio */}
      <div className="space-y-2">
        <Label>Tipo de Agendamento</Label>
        <Select
          value={isManual ? "manual" : "bloqueio"}
          onValueChange={(value) => setIsManual(value === "manual")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Cliente Presencial</SelectItem>
            <SelectItem value="bloqueio">Bloqueio de Agenda</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="submit" className="w-full">
          Confirmar Agendamento
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

          </div>
        )}
      </div>
    </div>
  );
}
