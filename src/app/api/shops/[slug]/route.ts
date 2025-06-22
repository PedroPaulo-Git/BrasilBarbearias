import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// type RouteContext = { params: { slug: string } };


export async function GET(
  request: NextRequest,
  {params}: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const shop = await prisma.shop.findUnique({
      where: { slug },
      include: {
        appointments: {
          select: {
            date: true
          }
        }
      }
    })

    if (!shop) {
      return NextResponse.json(
        { error: "Barbearia não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(shop)
  } catch (error) {
    console.error("Erro ao buscar shop:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 