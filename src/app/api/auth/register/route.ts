import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingOwner = await prisma.owner.findUnique({
      where: { email }
    })

    if (existingOwner) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar owner
    const owner = await prisma.owner.create({
      data: {
        email,
        password: hashedPassword
      }
    })

    return NextResponse.json(
      { 
        message: "Owner criado com sucesso",
        owner: {
          id: owner.id,
          email: owner.email
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao registrar owner:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 