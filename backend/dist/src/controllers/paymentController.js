"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const mercadoPagoService_1 = require("../services/mercadoPagoService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createCheckoutPreference(req, res) {
    try {
        const { planId } = req.body;
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Não autorizado' });
        if (!planId)
            return res.status(400).json({ error: 'planId é obrigatório' });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!user || !plan)
            return res.status(404).json({ error: 'Usuário ou Plano não encontrado' });
        if (!user.name)
            return res.status(400).json({ error: 'Nome do usuário é necessário' });
        const subscription = await prisma.subscription.create({
            data: {
                userId,
                planId,
                status: 'pending',
            },
        });
        const notificationUrl = `${process.env.API_BASE_URL}/payments/webhook`;
        const preference = await (0, mercadoPagoService_1.createPreference)({
            plan,
            user,
            externalReference: subscription.id,
            notificationUrl,
            backUrls: {
                success: `${process.env.FRONTEND_URL}/dashboard`,
                failure: `${process.env.FRONTEND_URL}/payment-failed`,
                pending: `${process.env.FRONTEND_URL}/payment-pending`,
            },
        });
        if (!preference.id) {
            return res.status(500).json({ error: 'Falha ao criar a preferência de pagamento' });
        }
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: { mercadoPagoPreferenceId: preference.id },
        });
        return res.json({ preferenceId: preference.id, subscriptionId: subscription.id });
    }
    catch (error) {
        console.error('Erro ao criar preferência de checkout:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
async function handleWebhook(req, res) {
    try {
        const paymentNotification = req.body;
        console.log('Webhook recebido:', JSON.stringify(paymentNotification, null, 2));
        if (paymentNotification.type === 'payment' && paymentNotification.data?.id) {
            const paymentId = paymentNotification.data.id;
            const payment = await (0, mercadoPagoService_1.getPayment)(paymentId);
            if (payment && payment.external_reference) {
                const subscriptionId = payment.external_reference;
                const subscription = await prisma.subscription.findUnique({
                    where: { id: subscriptionId },
                });
                if (subscription && subscription.status !== 'active') {
                    if (payment.status === 'approved') {
                        const startDate = new Date();
                        const endDate = new Date(startDate);
                        endDate.setMonth(startDate.getMonth() + 1);
                        await prisma.subscription.update({
                            where: { id: subscriptionId },
                            data: {
                                status: 'active',
                                mercadoPagoPaymentId: String(payment.id),
                                currentPeriodStart: startDate,
                                currentPeriodEnd: endDate,
                            },
                        });
                        console.log(`[Webhook] Assinatura ${subscription.id} ativada com sucesso.`);
                        await prisma.subscription.updateMany({
                            where: {
                                userId: subscription.userId,
                                status: 'active',
                                id: { not: subscriptionId },
                            },
                            data: {
                                status: 'inactive',
                            }
                        });
                    }
                    else if (payment.status) {
                        await prisma.subscription.update({
                            where: { id: subscriptionId },
                            data: { status: payment.status },
                        });
                        console.log(`[Webhook] Status da assinatura ${subscription.id} atualizado para: ${payment.status}`);
                    }
                }
                else {
                    console.log('[Webhook] Assinatura não encontrada ou já está ativa.');
                }
            }
        }
        res.status(200).send('ok');
    }
    catch (error) {
        console.error('Erro no webhook do Mercado Pago:', error);
        res.status(500).send('Internal Server Error');
    }
}
async function confirmPayment(req, res) {
    try {
        const { planId, paymentData, subscriptionId } = req.body;
        const userId = req.user?.id;
        console.log('confirmPayment data ->', req.body);
        if (!userId)
            return res.status(401).json({ error: 'Não autorizado' });
        if (!planId || !paymentData || !subscriptionId)
            return res.status(400).json({ error: 'planId, paymentData e subscriptionId são obrigatórios' });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!user || !plan)
            return res.status(404).json({ error: 'Usuário ou Plano não encontrado' });
        const subscription = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
        if (!subscription) {
            return res.status(404).json({ error: 'Assinatura não encontrada' });
        }
        const paymentResult = await (0, mercadoPagoService_1.createDirectPayment)({
            plan,
            token: paymentData.token,
            userEmail: user.email,
            externalReference: subscription.id,
            payer: {
                email: user.email,
                identification: paymentData.payer.identification,
            },
            installments: paymentData.installments || 1,
        });
        console.log('paymentResult ->', paymentResult);
        if (paymentResult.status === 'approved') {
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setMonth(startDate.getMonth() + 1);
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: 'active',
                    mercadoPagoPaymentId: String(paymentResult.id),
                    currentPeriodStart: startDate,
                    currentPeriodEnd: endDate,
                },
            });
            await prisma.subscription.updateMany({
                where: {
                    userId: userId,
                    status: 'active',
                    id: { not: subscription.id },
                },
                data: {
                    status: 'inactive',
                },
            });
        }
        else {
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: paymentResult.status || 'pending' },
            });
        }
        return res.json({
            status: paymentResult.status,
            status_detail: paymentResult.status_detail,
            id: paymentResult.id,
            message: 'Pagamento processado',
        });
    }
    catch (error) {
        console.error('Erro ao confirmar pagamento:', error);
        const mpMsg = error?.message || error?.cause?.[0]?.description;
        return res.status(400).json({ error: mpMsg || 'Erro ao processar pagamento' });
    }
}
exports.paymentController = {
    createCheckoutPreference,
    handleWebhook,
    confirmPayment,
};
//# sourceMappingURL=paymentController.js.map