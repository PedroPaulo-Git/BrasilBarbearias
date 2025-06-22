import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin } from "lucide-react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

interface Shop {
  id: string
  name: string
  slug: string
  address?: string
  openTime: string
  closeTime: string
}

interface CardShopProps {
  shop: Shop
}

export function CardShop({ shop }: CardShopProps) {
  const router = useRouter()

  const handleShopClick = () => {
    router.push(`/shops/${shop.slug}`)
  }
  
  return (
    <Card 
      onClick={handleShopClick} 
      className="min-w-[280px] max-w-[300px] rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    >
      <CardHeader className="p-0">
        <div className="w-full h-[160px] relative">
          <CardHeader>
            <CardTitle className="text-xl">{shop.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {shop.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{shop.address}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{shop.openTime} - {shop.closeTime}</span>
            </div>

            <Link href={`/shops/${shop.slug}`}>
              <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                Agendar Horário
              </button>
            </Link>
          </CardContent>
        </div>
      </CardHeader>
    </Card>
  )
} 