import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Encontra o plano para o trial (o mais barato)
    const trialPlan = await prisma.plan.findFirst({
      orderBy: {
        price: 'asc',
      },
    })

    if (!trialPlan) {
      console.error("Nenhum plano encontrado no banco de dados. Não é possível atribuir o trial.")
      return NextResponse.json(
        { error: "Erro de configuração do servidor: nenhum plano encontrado." },
        { status: 500 }
      )
    }

    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + trialPlan.trialDays)

    // Criar user e a subscription trial em uma transação
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        subscriptions: {
          create: {
            planId: trialPlan.id,
            status: 'trialing',
            trialStart: new Date(),
            trialEnd: trialEndDate,
          },
        },
      }
    })

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso com um período de teste.",
        user: {
          id: user.id,
          email: user.email
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao registrar user:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 