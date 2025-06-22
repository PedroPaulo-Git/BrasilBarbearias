import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateTimeSlots } from "@/lib/utils"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: "Data é obrigatória" },
        { status: 400 }
      )
    }

    const shop = await prisma.shop.findUnique({
      where: { slug }
    })

    if (!shop) {
      return NextResponse.json(
        { error: "Barbearia não encontrada" },
        { status: 404 }
      )
    }

    // Buscar agendamentos para a data
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const appointments = await prisma.appointment.findMany({
      where: {
        shopId: shop.id,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        date: true
      }
    })

    // Gerar todos os horários disponíveis
    const allTimeSlots = generateTimeSlots(
      shop.openTime,
      shop.closeTime,
      shop.serviceDuration
    )

    // Filtrar horários ocupados
    const bookedTimes = appointments.map((apt: { date: Date }) => 
      apt.date.toTimeString().slice(0, 5)
    )

    const availableSlots = allTimeSlots.filter(
      slot => !bookedTimes.includes(slot)
    )

    return NextResponse.json({
      availableSlots,
      bookedTimes,
      shop: {
        id: shop.id,
        openTime: shop.openTime,
        closeTime: shop.closeTime,
        serviceDuration: shop.serviceDuration
      }
    })
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 