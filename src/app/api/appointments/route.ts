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

    // Validar formato do telefone (aceita apenas números)
    const phoneNumbers = clientContact.replace(/\D/g, '')
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      return NextResponse.json(
        { error: "Telefone deve ter 10 ou 11 dígitos (com DDD)" },
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

    // Verificar se já existe agendamento ativo para este telefone (não cancelado)
    const existingAppointmentByPhone = await prisma.appointment.findFirst({
      where: {
        shopId,
        clientContact: phoneNumbers,
        status: {
          not: 'cancelled'
        }
      }
    })

    if (existingAppointmentByPhone) {
      return NextResponse.json(
        { error: "Já existe um agendamento ativo para este telefone" },
        { status: 409 }
      )
    }

    // Criar data completa considerando fuso horário local
    const [hours, minutes] = time.split(':').map(Number)
    const [year, month, day] = date.split('-').map(Number)
    const appointmentDate = new Date(year, month - 1, day, hours, minutes, 0, 0)

    console.log(`Data recebida: ${date}, Horário: ${time}`)
    console.log(`Data criada: ${appointmentDate.toISOString()}`)

    // Verificar se o horário está dentro do funcionamento
    const appointmentTime = appointmentDate.toTimeString().slice(0, 5)
    console.log(`Horário do agendamento: ${appointmentTime}`)
    console.log(`Horário de abertura: ${shop.openTime}`)
    console.log(`Horário de fechamento: ${shop.closeTime}`)
    
    if (appointmentTime < shop.openTime || appointmentTime >= shop.closeTime) {
      console.log(`❌ Horário fora do funcionamento: ${appointmentTime} não está entre ${shop.openTime} e ${shop.closeTime}`)
      return NextResponse.json(
        { error: "Horário fora do funcionamento da barbearia" },
        { status: 400 }
      )
    }

    // Verificar se já existe agendamento para este horário
    console.log(`Verificando agendamento existente para: ${appointmentDate.toISOString()}`)
    
    // Buscar agendamentos para a mesma data e horário
    const startOfSlot = new Date(appointmentDate)
    const endOfSlot = new Date(appointmentDate.getTime() + (shop.serviceDuration * 60000))
    
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        shopId,
        date: {
          gte: startOfSlot,
          lt: endOfSlot
        },
        status: {
          not: 'cancelled' // Excluir agendamentos cancelados
        }
      }
    })

    if (existingAppointment) {
      console.log(`❌ Agendamento existente encontrado: ${existingAppointment.id} para ${existingAppointment.date.toISOString()}`)
      return NextResponse.json(
        { error: "Horário já está ocupado" },
        { status: 409 }
      )
    }

    console.log(`✅ Horário disponível para agendamento`)

    // Criar o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        shopId,
        clientName,
        clientContact: phoneNumbers,
        date: appointmentDate
      }
    })

    console.log(`Agendamento criado: ${appointment.id} para ${appointment.date}`)

    // Gerar link de acompanhamento baseado no telefone
    const trackingUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/track/${encodeURIComponent(phoneNumbers)}`

    return NextResponse.json(
      { 
        message: "Agendamento realizado com sucesso",
        appointment: {
          id: appointment.id,
          clientName: appointment.clientName,
          date: appointment.date
        },
        trackingUrl: trackingUrl
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