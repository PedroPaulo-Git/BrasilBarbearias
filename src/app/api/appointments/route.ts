import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { shopId, clientName, clientContact, date, time } = await request.json()

    if (!shopId || !clientName || !clientContact || !date || !time) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se a shop existe
    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    })

    if (!shop) {
      return NextResponse.json(
        { error: "Barbearia não encontrada" },
        { status: 404 }
      )
    }

    // Criar data completa
    const [hours, minutes] = time.split(':').map(Number)
    const appointmentDate = new Date(date)
    appointmentDate.setHours(hours, minutes, 0, 0)

    // Verificar se o horário está dentro do funcionamento
    const appointmentTime = appointmentDate.toTimeString().slice(0, 5)
    if (appointmentTime < shop.openTime || appointmentTime >= shop.closeTime) {
      return NextResponse.json(
        { error: "Horário fora do funcionamento da barbearia" },
        { status: 400 }
      )
    }

    // Verificar se já existe agendamento para este horário
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        shopId,
        date: appointmentDate
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: "Horário já está ocupado" },
        { status: 409 }
      )
    }

    // Criar o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        shopId,
        clientName,
        clientContact,
        date: appointmentDate
      }
    })

    // TODO: Enviar email de confirmação
    console.log(`Agendamento criado: ${appointment.id}`)

    return NextResponse.json(
      { 
        message: "Agendamento realizado com sucesso",
        appointment: {
          id: appointment.id,
          clientName: appointment.clientName,
          date: appointment.date
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao criar appointment:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 