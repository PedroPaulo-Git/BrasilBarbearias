"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { CardShop } from "@/components/CardShop"
import { Loader2 } from "lucide-react"

interface Shop {
  id: string
  name: string
  slug: string
  address?: string
  openTime: string
  closeTime: string
}

function ShopsPageContent() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ""

  const [shops, setShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true)
        const url = searchQuery 
          ? `http://localhost:5000/shops/public?search=${searchQuery}`
          : 'http://localhost:5000/shops/public'
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch shops')
        }
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          setShops(data.data)
        } else {
          setShops([])
        }
      } catch (error) {
        console.error(error)
        setShops([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchShops()
  }, [searchQuery])

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Barbearias Encontradas</h1>
      <p className="text-muted-foreground mb-8">
        {searchQuery 
          ? `Resultados para: "${searchQuery}"`
          : "Mostrando todas as barbearias disponíveis."}
      </p>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
        </div>
      ) : shops.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {shops.map(shop => (
            <CardShop key={shop.id} shop={shop} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">Nenhuma barbearia encontrada.</h2>
          <p className="text-muted-foreground mt-2">Tente buscar por um termo diferente ou veja todas as barbearias.</p>
        </div>
      )}
    </div>
  )
}

export default function ShopsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="w-16 h-16 text-primary animate-spin" /></div>}>
      <ShopsPageContent />
    </Suspense>
  )
} 