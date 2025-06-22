import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const where = search ? {
      name: {
        contains: search,
        mode: 'insensitive' as const
      }
    } : {}

    const shops = await prisma.shop.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        openTime: true,
        closeTime: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(shops)
  } catch (error) {
    console.error("Erro ao listar shops públicas:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 