import { Request, Response } from 'express';
import { createPreference, getPayment, createDirectPayment } from '../services/mercadoPagoService';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

const processPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planId, token, paymentMethodId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!planId || !token || !paymentMethodId) {
      return res.status(400).json({ error: 'Dados de pagamento incompletos.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const plan = await prisma.plan.findUnique({ where: { id: planId } });

    if (!user || !plan) {
      return res.status(404).json({ error: 'Usuário ou Plano não encontrado.' });
    }

    // 1. Criar a assinatura com status 'pending'
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: { planId, status: 'pending' },
      create: { userId, planId, status: 'pending' },
    });

    // 2. Chamar o serviço para criar o pagamento direto
    const paymentResult = await createDirectPayment({
      plan,
      token,
      userEmail: user.email,
      paymentMethodId,
      externalReference: subscription.id,
    });

    // 3. Verificar o resultado e atualizar a assinatura
    if (paymentResult.status === 'approved') {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 30);

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
          mercadoPagoPaymentId: String(paymentResult.id),
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
        },
      });
      return res.status(201).json({ success: true, message: 'Pagamento aprovado e assinatura ativada!' });
    } else {
      // Se o pagamento não foi aprovado, reverte (ou mantém como pending)
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'payment_failed' },
      });
      return res.status(400).json({
        success: false,
        message: paymentResult.status_detail || 'Pagamento recusado.',
        details: paymentResult,
      });
    }
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
};

export const createCheckout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!planId) {
      return res.status(400).json({ error: 'planId is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    // Garante que o usuário tenha um nome para o checkout
    if (!user.name) {
      return res.status(400).json({ error: 'User name is required for checkout' });
    }

    // Etapa 1: Criar/atualizar a assinatura para obter um ID
    const subscription = await prisma.subscription.upsert({
      where: {
        userId,
      },
      update: {
        planId,
        status: 'pending',
      },
      create: {
        userId,
        planId,
        status: 'pending',
      },
    });

    // Etapa 2: Criar a preferência de pagamento com o ID da assinatura como referência externa
    const backUrls = {
      success: `${process.env.BASE_URL}/profile?payment=success`,
      failure: `${process.env.BASE_URL}/profile?payment=failure`,
      pending: `${process.env.BASE_URL}/profile?payment=pending`,
    };
    const notificationUrl = `${process.env.API_BASE_URL}/webhook/mercadopago`;
    const pref = await createPreference({
      plan,
      user,
      backUrls,
      notificationUrl,
      externalReference: subscription.id,
    });

    if (!pref.id) {
      return res.status(500).json({ error: 'Failed to create payment preference' });
    }

    // Etapa 3: Atualizar a assinatura com o ID da preferência do Mercado Pago
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        mercadoPagoPreferenceId: pref.id,
      },
    });

    return res.json({ init_point: pref.init_point });
  } catch (error) {
    console.error('Erro no checkout:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const mercadoPagoWebhook = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    console.log('Webhook recebido:', JSON.stringify(body, null, 2));

    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id;
      const payment: any = await getPayment(paymentId);

      if (payment && payment.status === 'approved') {
        const externalReference = payment.external_reference;
        const preferenceId = payment.preference_id;

        let subscription = null;

        if (externalReference) {
          subscription = await prisma.subscription.findUnique({
            where: { id: externalReference },
          });
        } else if (preferenceId) {
          subscription = await prisma.subscription.findFirst({
            where: { mercadoPagoPreferenceId: preferenceId },
          });
        }

        if (subscription && subscription.status !== 'active') {
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 30);

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'active',
              mercadoPagoPaymentId: String(payment.id),
              currentPeriodStart: startDate,
              currentPeriodEnd: endDate,
            },
          });
          console.log(`Assinatura ${subscription.id} ativada com sucesso.`);
        } else {
          console.log('Assinatura não encontrada ou já está ativa.');
        }
      }
    }
    res.status(200).send('ok');
  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const paymentController = {
  createCheckout,
  mercadoPagoWebhook,
  processPayment,
}; 