import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // (Opcional) Verifique se o usuário autenticado é dono da barbearia

    const shop = await prisma.shop.findUnique({
      where: { slug }
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Barbearia não encontrada" },
        { status: 404 }
      );
    }

    await prisma.shop.delete({
      where: { slug }
    });

    return NextResponse.json({ message: "Barbearia removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover barbearia:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;
    const body = await request.json();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const shop = await prisma.shop.findUnique({
      where: { slug },
    });

    if (!shop || shop.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Barbearia não encontrada ou acesso negado" }, { status: 404 });
    }

    const { description, galleryImages, instagramUrl, whatsappUrl, mapUrl, rating } = body;
    
    const updateData: any = {
      description,
      galleryImages,
      instagramUrl,
      whatsappUrl,
      mapUrl,
    };

    if (session.user.isAdmin) {
      updateData.rating = rating;
    }

    const updatedShop = await prisma.shop.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json(updatedShop);

  } catch (error) {
    console.error("Erro ao atualizar barbearia:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 