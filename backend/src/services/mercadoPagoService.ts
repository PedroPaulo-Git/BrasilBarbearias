import axios from 'axios';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { v4 as uuidv4 } from 'uuid';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

export async function createPreference({
  plan,
  user,
  backUrls,
  notificationUrl,
  externalReference,
}: {
  plan: { id: string; name: string; price: number };
  user: {
    email: string;
    name: string | null;
    surname?: string;
    phone?: { area_code: string; number: string };
    identification?: { type: string; number: string };
    address?: { street_name: string; street_number: number; zip_code: string };
  };
  backUrls?: { success: string; failure: string; pending: string };
  notificationUrl: string;
  externalReference: string;
}) {
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
          picture_url: 'https://www.brasilbarbearias.com.br/logo.png', // opcional
          category_id: 'services', // ou outro
        },
      ],
      payer: { email: user.email },
      ...(backUrls && { back_urls: backUrls, auto_return: 'approved' as const }),
      notification_url: notificationUrl,
      external_reference: externalReference,
      statement_descriptor: 'BRASILBARBEARIA',
      
      payment_methods: {
        excluded_payment_methods: [
          // { id: 'master' }, // descomente se quiser bloquear
        ],
        excluded_payment_types: [
          // { id: 'ticket' }, // boleto, pix, etc
        ],
        installments: 1,
      },
      expires: false, // ou true com os campos abaixo
      // expiration_date_from: new Date().toISOString(),
      // expiration_date_to: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    },
  });
  console.log('result createPreference backend->', result);
  return result;
}

// Log da chave (apenas em ambiente de desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  console.log('MP_ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'Encontrado' : 'Não encontrado');
}else{
  console.log('MP_ACCESS_TOKEN: Encontrado')
}

export async function getPayment(paymentId: string) {
  const payment = await paymentClient.get({ id: paymentId });
  console.log('payment getPayment backend->', payment);
  return payment;
}
export async function createDirectPayment({
  plan,
  token,
  userEmail,
  paymentMethodId,
  issuerId,
  externalReference,
  payer,
  installments,
}: {
  plan: any;
  token: string;
  userEmail: string;
  paymentMethodId?: string;
  issuerId?: string | number;
  externalReference: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
  installments: number;
}) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error('Access Token não configurado');

  const idempotencyKey = uuidv4();

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
  const response = await axios.post('https://api.mercadopago.com/v1/payments', body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey,
    },
  });
  console.log('response createDirectPayment backend->', response);
  return response.data;
}
