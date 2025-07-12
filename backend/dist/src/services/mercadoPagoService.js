"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPreference = createPreference;
exports.getPayment = getPayment;
exports.createDirectPayment = createDirectPayment;
const axios_1 = __importDefault(require("axios"));
const mercadopago_1 = require("mercadopago");
const uuid_1 = require("uuid");
const client = new mercadopago_1.MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});
const preferenceClient = new mercadopago_1.Preference(client);
const paymentClient = new mercadopago_1.Payment(client);
async function createPreference({ plan, user, backUrls, notificationUrl, externalReference, }) {
    const result = await preferenceClient.create({
        body: {
            items: [
                {
                    id: plan.id,
                    title: `Assinatura Plano ${plan.name}`,
                    currency_id: 'BRL',
                    quantity: 1,
                    unit_price: plan.price,
                    description: `Assinatura mensal do plano ${plan.name}`,
                    picture_url: 'https://www.brasilbarbearias.com.br/logo.png',
                    category_id: 'services',
                },
            ],
            payer: { email: user.email },
            ...(backUrls && { back_urls: backUrls, auto_return: 'approved' }),
            notification_url: notificationUrl,
            external_reference: externalReference,
            statement_descriptor: 'BRASILBARBEARIA',
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: [],
                installments: 1,
            },
            expires: false,
        },
    });
    console.log('result createPreference backend->', result);
    return result;
}
if (process.env.NODE_ENV !== 'production') {
    console.log('MP_ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'Encontrado' : 'Não encontrado');
}
else {
    console.log('MP_ACCESS_TOKEN: Encontrado');
}
async function getPayment(paymentId) {
    const payment = await paymentClient.get({ id: paymentId });
    console.log('payment getPayment backend->', payment);
    return payment;
}
async function createDirectPayment({ plan, token, userEmail, paymentMethodId, issuerId, externalReference, payer, installments, }) {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken)
        throw new Error('Access Token não configurado');
    const idempotencyKey = (0, uuid_1.v4)();
    const body = {
        transaction_amount: plan.price,
        token,
        description: `Assinatura do plano - ${plan.name}`,
        installments,
        ...(paymentMethodId ? { payment_method_id: paymentMethodId } : {}),
        ...(issuerId ? { issuer_id: Number(issuerId) } : {}),
        external_reference: externalReference,
        payer: {
            email: payer.email,
            identification: payer.identification,
        },
        additional_info: {
            items: [
                {
                    id: plan.id,
                    title: plan.name,
                    description: plan.description || 'Plano de assinatura',
                    picture_url: 'https://http2.mlstatic.com/resources/frontend/statics/growth-sellers-landings/device-mlb-point-i_medium2x.png',
                    category_id: 'services',
                    quantity: 1,
                    unit_price: plan.price,
                },
            ],
            payer: {
                first_name: 'Nome',
                last_name: 'Sobrenome',
                phone: {
                    area_code: '11',
                    number: '987654321',
                },
            },
            shipments: {
                receiver_address: {
                    zip_code: '12312-123',
                    state_name: 'Rio de Janeiro',
                    city_name: 'Buzios',
                    street_name: 'Av das Nacoes Unidas',
                    street_number: 3003,
                },
            },
        },
    };
    console.log('body createDirectPayment backend->', body);
    const response = await axios_1.default.post('https://api.mercadopago.com/v1/payments', body, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': idempotencyKey,
        },
    });
    console.log('response createDirectPayment backend->', response);
    return response.data;
}
//# sourceMappingURL=mercadoPagoService.js.map