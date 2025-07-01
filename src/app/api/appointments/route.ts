import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
 
  try {
    const { shopId, clientName, clientContact, date, time } = await request.json()

    // 1. Validação dos campos de entrada
    if (!shopId || !clientName || !clientContact || !date || !time) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    const phoneNumbers = clientContact.replace(/\D/g, '')
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      return NextResponse.json(
        { error: "Telefone deve ter 10 ou 11 dígitos (com DDD)" },
        { status: 400 }
      )
    }

    // 2. Buscar dados da barbearia
    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    })

    if (!shop) {
      return NextResponse.json(
        { error: "Barbearia não encontrada" },
        { status: 404 }
      )
    }

    // 3. Montar a data do agendamento
    // ATENÇÃO: A criação de datas assim depende do fuso horário do servidor.
    // Para maior precisão, considere salvar tudo em UTC.
    const [year, month, day] = date.split('-').map(Number)
    const [hours, minutes] = time.split(':').map(Number)
    const appointmentDate = new Date(year, month - 1, day, hours, minutes)

    // 4. Verificar conflitos: Horário ocupado OU cliente com agendamento ativo
    // Esta é a verificação principal e corrigida. Ela combina as duas regras em uma só.
    const existingConflict = await prisma.appointment.findFirst({
      where: {
        shopId: shopId,
        // A condição de status 'in' se aplica a ambas as regras dentro do OR
        status: {
          in: ['pending', 'confirmed']
        },
        OR: [
          // Regra 1: Verifica se o mesmo cliente já tem um agendamento ativo
          {
            clientContact: phoneNumbers,
          },
          // Regra 2: Verifica se o horário exato já está ocupado por qualquer pessoa
          {
            date: appointmentDate,
          }
        ]
      }
    });

    if (existingConflict) {
      // Verifica qual regra causou o conflito para dar a mensagem correta
      if (existingConflict.clientContact === phoneNumbers) {
        return NextResponse.json(
          { error: "Você já possui um agendamento ativo. Cancele-o para agendar um novo." },
          { status: 409 } // 409 Conflict
        );
      } else {
        return NextResponse.json(
          { error: "Este horário já está ocupado. Por favor, escolha outro." },
          { status: 409 } // 409 Conflict
        );
      }
    }

    // 5. Se não houver conflitos, criar o agendamento
    const newAppointment = await prisma.appointment.create({
      data: {
        shopId,
        clientName,
        clientContact: phoneNumbers,
        date: appointmentDate,
        status: 'confirmed' // Define o status inicial como confirmado
      }
    })

    // 6. Gerar URL de acompanhamento
    const trackingUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/track/${encodeURIComponent(phoneNumbers)}`

    return NextResponse.json(
      {
        message: "Agendamento realizado com sucesso",
        appointment: newAppointment,
        trackingUrl: trackingUrl
      },
      { status: 201 } // 201 Created
    )

  } catch (error) {
    console.error("Erro ao criar agendamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 