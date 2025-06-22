import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session: any = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const showCancelled = searchParams.get('showCancelled') === 'true'

    // Verificar se a barbearia pertence ao usuário logado
    const shop = await prisma.shop.findFirst({
      where: {
        slug: slug,
        owner: {
          email: session.user.email
        }
      }
    })

    if (!shop) {
      return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 404 })
    }

    // Buscar agendamentos da barbearia
    const whereClause: any = {
      shopId: shop.id
    }

    // Por padrão, não mostrar agendamentos cancelados
    if (!showCancelled) {
      whereClause.status = {
        not: 'cancelled'
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc'
      }
    })

    // Formatar os dados para o frontend
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.date.toTimeString().slice(0, 5), // Usar o horário real do agendamento
      status: appointment.status, // Usar o status real do banco
      service: 'Corte de Cabelo', // Default service
      customer: {
        name: appointment.clientName,
        phone: appointment.clientContact,
        email: '' // Campo vazio já que agora só usamos telefone
      },
      createdAt: appointment.createdAt.toISOString()
    }))

    return NextResponse.json(formattedAppointments)
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { statuses } = await request.json()

    const shop = await prisma.shop.findUnique({
      where: { slug }
    })

    if (!shop) {
      return NextResponse.json(
        { error: "Barbearia não encontrada" },
        { status: 404 }
      )
    }

    // Construir a condição WHERE baseada nos status selecionados
    let whereCondition: any = {
      shopId: shop.id
    }

    if (statuses && statuses.length > 0) {
      if (statuses.includes('all')) {
        // Se "todos" estiver selecionado, deletar todos os agendamentos
        whereCondition = { shopId: shop.id }
      } else {
        // Deletar apenas os status selecionados
        whereCondition = {
          shopId: shop.id,
          status: {
            in: statuses
          }
        }
      }
    }

    // Deletar agendamentos
    const result = await prisma.appointment.deleteMany({
      where: whereCondition
    })

    return NextResponse.json({
      message: `${result.count} agendamento(s) removido(s) com sucesso`,
      deletedCount: result.count
    })
  } catch (error) {
    console.error("Erro ao deletar agendamentos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 