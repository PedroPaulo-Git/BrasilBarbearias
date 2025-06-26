import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

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
  return payment;
}
export async function createDirectPayment({
  plan,
  token,
  userEmail,
  paymentMethodId,
  externalReference,
  payer,
  installments,
}: {
  plan: { name: string; price: number };
  token: string;
  userEmail: string;
  paymentMethodId: string;
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
  const payment = await paymentClient.create({
    body: {
      transaction_amount: plan.price,
      description: `Assinatura Plano ${plan.name}`,
      payment_method_id: paymentMethodId,
      token,
      payer: {
        email: payer.email,
        identification: {
          type: payer.identification.type,
          number: payer.identification.number,
        },
      },
      installments,
      external_reference: externalReference,
    },
  });

  return payment;
}
