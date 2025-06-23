import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const session: any = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { appointmentId } = await params
    const { status } = await request.json()

    // Verificar se o status é válido
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 }
      )
    }

    // Buscar o agendamento e verificar se pertence a uma barbearia do usuário
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        shop: {
          owner: {
            email: session.user.email
          }
        }
      },
      include: {
        shop: true
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      )
    }

    // Atualizar o status do agendamento
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId
      },
      data: {
        status: status
      }
    })

    return NextResponse.json({
      message: "Status atualizado com sucesso",
      appointment: {
        id: updatedAppointment.id,
        status: updatedAppointment.status
      }
    })
  } catch (error) {
    console.error("Erro ao atualizar status:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 