import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: "Telefone é obrigatório" },
        { status: 400 }
      )
    }

    // Garantir que o telefone contenha apenas números
    const phoneNumbers = phone.replace(/\D/g, '')
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      return NextResponse.json(
        { error: "Telefone deve ter 10 ou 11 dígitos (com DDD)" },
        { status: 400 }
      )
    }

    // Buscar a barbearia pelo slug
    const shop = await prisma.shop.findUnique({
      where: { slug }
    })

    if (!shop) {
      return NextResponse.json(
        { error: "Barbearia não encontrada" },
        { status: 404 }
      )
    }

    // Obter IP do cliente (comentado para testes)
    // const forwarded = request.headers.get("x-forwarded-for")
    // const realIp = request.headers.get("x-real-ip")
    // const clientIp = forwarded?.split(",")[0] || realIp || "unknown"

    // Verificar se já existe agendamento ativo para este telefone nesta barbearia
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        shopId: shop.id,
        clientContact: phoneNumbers,
        status: {
          in: ['pending', 'confirmed']
        }
      },
      select: {
        id: true,
        date: true,
        status: true
      }
    })

    // Verificar se há muitos agendamentos do mesmo IP (comentado para testes)
    // const recentAppointmentsFromIP = await prisma.appointment.count({
    //   where: {
    //     shopId: shop.id,
    //     createdAt: {
    //       gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
    //     }
    //   }
    // })

    // Permitir múltiplos agendamentos em ambiente de desenvolvimento (comentado para testes)
    // const isDevelopment = process.env.NODE_ENV === 'development'
    // const maxAppointmentsPerDay = isDevelopment ? 10 : 3 // Mais permissivo em desenvolvimento

    // if (recentAppointmentsFromIP >= maxAppointmentsPerDay) {
    //   return NextResponse.json({
    //     hasAppointment: false,
    //     blocked: true,
    //     message: isDevelopment 
    //       ? "Limite de agendamentos de teste atingido (10 por dia). Em produção seria 3."
    //       : "Limite de agendamentos atingido. Tente novamente amanhã."
    //   })
    // }

    if (existingAppointment) {
      // Gerar link de acompanhamento
      const trackingUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/track/${encodeURIComponent(phoneNumbers)}`
      
      return NextResponse.json({
        hasAppointment: true,
        appointment: existingAppointment,
        trackingUrl: trackingUrl,
        message: "Você já possui um agendamento ativo nesta barbearia"
      })
    }

    return NextResponse.json({
      hasAppointment: false,
      message: "Nenhum agendamento encontrado"
    })
  } catch (error) {
    console.error("Erro ao verificar agendamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 