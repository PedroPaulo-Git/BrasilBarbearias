"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Star, Instagram, MessageCircle } from "lucide-react";
import { AppointmentForm } from "@/components/AppointmentForm";
import { GalleryCarousel } from "@/components/CarrosselImages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Shop {
  id: string;
  name: string;
  slug: string;
  address?: string;
  openTime: string;
  closeTime: string;
  serviceDuration: number;
  description?: string | null;
  galleryImages?: string[];
  instagramUrl?: string | null;
  whatsappUrl?: string | null;
  mapUrl?: string | null;
  rating?: number | null;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface ShopPageProps {
  params: Promise<{ slug: string }>;
}

const DEFAULT_SERVICES = [
  { name: "Corte de Cabelo" },
  { name: "Barba" },
  { name: "Corte + Barba" },
  { name: "Corte Fade" },
  { name: "Corte Clássico" },
  { name: "Corte Buzz Cut" },
  { name: "Hidratação" },
  { name: "Pigmentação" },
  { name: "Sobrancelha" },
  { name: "Pigmentação de Barba" },
];

export default function ShopPage({ params }: ShopPageProps) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [customServices, setCustomServices] = useState<string[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 720);
    };

    // Verifica uma vez ao montar
    checkMobile();

    // Atualiza em tempo real (opcional)
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchShopAndServices = async () => {
      try {
        const { slug } = await params;
        const shopRes = await fetch(`/api/shops/${slug}`);
        const shopData = await shopRes.json();
        if (shopRes.ok) {
          setShop(shopData);
          // Buscar serviços cadastrados
          const servicesRes = await fetch(`/api/shops/${slug}/services`);
          const servicesData = await servicesRes.json();
          setServices(servicesData.services || []);
        } else {
          setErrorMsg(shopData.error);
        }
      } catch {
        setErrorMsg("Erro ao carregar barbearia");
      } finally {
        setLoading(false);
      }
    };
    fetchShopAndServices();
  }, [params]);

  // useEffect(() => {
  //   fetchShopAndServices();
  // }, [fetchShopAndServices]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className="h-5 w-5 text-yellow-400 fill-yellow-400"
          />
        ))}
        {halfStar && <Star key="half" className="h-5 w-5 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Carregando barbearia...</p>
        </div>
      </div>
    );
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
    );
  }

  return (
    <div className="bg-gray-50 w-full">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              {shop.name}
            </h1>
            {shop.rating && (
              <div className="flex items-center justify-center gap-2">
                {renderStars(shop.rating)}
                <span className="text-muted-foreground">
                  ({shop.rating.toFixed(1)})
                </span>
              </div>
            )}
          </div>

          {/* Gallery */}

          {/*  // <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8 rounded-lg overflow-hidden">
           
               {shop.galleryImages.map((url, i) => (
                <div key={i} className={`relative ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                  <img src={url} alt={`Foto da galeria ${i + 1}`} className="w-full h-full object-cover aspect-video md:aspect-auto" />
                </div>
              ))} 
            // </div>*/}
      
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
  {/* Sobre */}
  {shop.description && (
    <Card className="w-full order-1 lg:order-3 lg:col-span-2 lg:row-span-1 lg:max-h-44">
      <CardHeader>
        <CardTitle>Sobre Nós</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{shop.description}</p>
      </CardContent>
    </Card>
  )}

  {/* Agendamento (mobile e desktop controlado por ordem + lg) */}
  <Card className="w-full order-3 lg:order-2 lg:col-span-1 cursor-pointer">
    <CardHeader>
      <CardTitle>Agende seu Horário</CardTitle>
      <CardDescription>Rápido e fácil, sem complicações.</CardDescription>
    </CardHeader>
    <CardContent>
      <AppointmentForm
        shop={shop}
        services={services}
        defaultServices={DEFAULT_SERVICES}
        defaultDuration={shop?.serviceDuration || 30}
      />
    </CardContent>
  </Card>

  {/* Info */}
  {isMobile ? 
  <Card className="w-full order-2 lg:order-2 lg:col-span-2">
    <CardHeader>
      <CardTitle>Informações</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {shop.address && (
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
          <div>
            <p>{shop.address}</p>
            {shop.mapUrl && (
              <a
                href={shop.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Ver no mapa
              </a>
            )}
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-muted-foreground mt-1" />
        <p>
          Horário: {shop.openTime} - {shop.closeTime}
        </p>
      </div>
    </CardContent>
  </Card>
  :
  <></> }

  {/* Galeria */}
  <Card className="w-full order-4  lg:order-1 lg:col-span-2 ">
    <CardHeader>
      <CardTitle className="text-2xl">Fotos da barbearia</CardTitle>
      <CardDescription className="text-muted-foreground">
        Imagens enviadas pelo proprietário para mostrar o ambiente e os serviços oferecidos.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4 w-full max-w-[100vw] overflow-hidden">
      {shop.galleryImages && shop.galleryImages.length > 0 && (
        <div className="pt-2">
          <GalleryCarousel images={shop.galleryImages} />
        </div>
      )}
    </CardContent>
    {!isMobile ? 
  <div className="w-full order-2 lg:order-2 lg:col-span-2">
    <CardHeader>
      <CardTitle>Informações</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {shop.address && (
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
          <div>
            <p>{shop.address}</p>
            {shop.mapUrl && (
              <a
                href={shop.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Ver no mapa
              </a>
            )}
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-muted-foreground mt-1" />
        <p>
          Horário: {shop.openTime} - {shop.closeTime}
        </p>
      </div>
    </CardContent>
  </div>
   : <></>
   
   }
  </Card>

  {/* Redes sociais */}
  {(shop.instagramUrl || shop.whatsappUrl) && (
    <Card className="w-full order-5 lg:order-5 lg:col-span-1">
      <CardHeader>
        <CardTitle>Redes Sociais</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {shop.instagramUrl && (
          <Button asChild variant="outline">
            <a
              href={shop.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Instagram className="h-4 w-4" /> Instagram
            </a>
          </Button>
        )}
        {shop.whatsappUrl && (
          <Button asChild variant="outline">
            <a
              href={shop.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )}
</div>


          
        </div>
      </div>
    </div>
  );
}
