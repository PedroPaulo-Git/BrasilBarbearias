import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
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
    const status = searchParams.get('status')

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

    // Construir filtro dinâmico
    const whereClause: any = { shopId: shop.id }

    if (status === "active") {
      whereClause.status = { in: ['pending', 'confirmed'] }
    } else if (status === "cancelled") {
      whereClause.status = "cancelled"
    } else if (status === "completed") {
      whereClause.status = "completed"
    }
    // status === "all" ou não informado: não filtra por status

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: { date: 'asc' }
    })

    // Formatar os dados para o frontend
    const formattedAppointments = appointments.map((appointment: any) => ({
      id: appointment.id,
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.date.toTimeString().slice(0, 5),
      status: appointment.status,
      service: appointment.selectedServices,
      customer: {
        name: appointment.clientName,
        phone: appointment.clientContact,
        email: ''
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