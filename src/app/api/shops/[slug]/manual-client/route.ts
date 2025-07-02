import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const { slug } = context.params;
    const { date, time } = await request.json();

    if (!date || !time) {
      return NextResponse.json(
        { error: "Data e horário são obrigatórios." },
        { status: 400 }
      );
    }

    // Encontra a loja pelo slug, que deve ser único
    const shop = await prisma.shop.findUnique({
      where: { slug },
    });

    if (!shop) {
      return NextResponse.json({ error: "Loja não encontrada." }, { status: 404 });
    }

    // Cria um novo agendamento com dados padrão para o cliente manual
    const manualAppointment = await prisma.appointment.create({
      data: {
        shopId: shop.id, // Usa o ID da loja encontrada
        date: new Date(`${date}T${time}`),
        // time: time,
        status: "confirmed", // Já vem confirmado
        clientName: "Presencial",
        clientContact: "",
        // serviceName: "Serviço Manual",
        // isManual: true, // Importante para identificar a origem
      },
    });

    return NextResponse.json(manualAppointment, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar agendamento manual:", error);
    return NextResponse.json(
      { error: "Falha ao criar agendamento manual" },
      { status: 500 }
    );
  }
}
