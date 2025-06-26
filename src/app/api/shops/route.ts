import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { generateUniqueSlug, isValidTimeFormat } from "@/lib/utils"
import { authOptions } from "@/lib/authOptions"
import { canCreateShop } from "@/lib/subscriptionUtils"

// GET - Listar shops do owner autenticado
export async function GET() {
  try {
    const session: any = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const shops = await prisma.shop.findMany({
      where: {
        ownerId: session.user.id
      },
      include: {
        _count: {
          select: {
            appointments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(shops)
  } catch (error) {
    console.error("Erro ao listar shops:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST - Criar nova shop
export async function POST(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Verificar se o usuário pode criar mais lojas
    const canCreate = await canCreateShop(session.user.id);
    if (!canCreate) {
      return NextResponse.json(
        { error: "Você atingiu o limite de lojas do seu plano ou sua assinatura não está ativa." },
        { status: 403 }
      );
    }

    const { name, address, openTime, closeTime, serviceDuration } = await request.json()

    if (!name || !openTime || !closeTime) {
      return NextResponse.json(
        { error: "Nome, horário de abertura e fechamento são obrigatórios" },
        { status: 400 }
      )
    }

    if (!isValidTimeFormat(openTime) || !isValidTimeFormat(closeTime)) {
      return NextResponse.json(
        { error: "Formato de horário inválido. Use HH:MM" },
        { status: 400 }
      )
    }

    // Gerar slug único
    const slug = generateUniqueSlug(name)

    const shop = await prisma.shop.create({
      data: {
        name,
        slug,
        address,
        openTime,
        closeTime,
        serviceDuration: serviceDuration || 60,
        ownerId: session.user.id
      }
    })

    return NextResponse.json(shop, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar shop:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 