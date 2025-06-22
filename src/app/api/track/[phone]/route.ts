import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params
    const decodedPhone = decodeURIComponent(phone)

    // Buscar agendamentos ativos por telefone (não cancelados)
    const appointments = await prisma.appointment.findMany({
      where: {
        clientContact: decodedPhone,
        status: {
          not: 'cancelled'
        }
      },
      include: {
        shop: {
          select: {
            name: true,
            slug: true,
            address: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    if (appointments.length === 0) {
      return NextResponse.json(
        { error: "Nenhum agendamento encontrado para este telefone" },
        { status: 404 }
      )
    }

    // Formatar dados para o frontend
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.date.toTimeString().slice(0, 5),
      status: appointment.status,
      service: 'Corte de Cabelo',
      shop: {
        name: appointment.shop.name,
        slug: appointment.shop.slug,
        address: appointment.shop.address
      },
      createdAt: appointment.createdAt.toISOString()
    }))

    return NextResponse.json({
      phone: decodedPhone,
      appointments: formattedAppointments
    })
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 