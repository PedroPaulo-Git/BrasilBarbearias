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
    const startOfDay = new Date(date + 'T00:00:00.000Z')
    const endOfDay = new Date(date + 'T23:59:59.999Z')

    console.log(`Buscando agendamentos entre: ${startOfDay.toISOString()} e ${endOfDay.toISOString()}`)

    const appointments = await prisma.appointment.findMany({
      where: {
        shopId: shop.id,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['confirmed', 'completed'] // Só bloqueia horários confirmados ou realizados
        }
      },
      select: {
        date: true,
        status: true
      }
    })

    console.log(`Agendamentos encontrados: ${appointments.length}`)
    appointments.forEach(apt => {
      console.log(`- ${apt.date.toISOString()} (${apt.status})`)
    })

    // Gerar todos os horários disponíveis
    const allTimeSlots = generateTimeSlots(
      shop.openTime,
      shop.closeTime,
      shop.serviceDuration
    )

    // Filtrar horários ocupados - comparar HH:MM
    const bookedTimes = appointments.map((apt: { date: Date }) => {
      const hours = apt.date.getHours().toString().padStart(2, '0')
      const minutes = apt.date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    })

    console.log(`Data: ${date}`)
    console.log(`Horários ocupados: ${bookedTimes}`)
    console.log(`Todos os horários: ${allTimeSlots}`)

    const availableSlots = allTimeSlots.filter(slot => !bookedTimes.includes(slot))

    console.log(`Horários disponíveis: ${availableSlots}`)

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