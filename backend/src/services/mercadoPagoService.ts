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
  user: { email: string; name: string | null };
  backUrls: { success: string; failure: string; pending: string };
  notificationUrl: string;
  externalReference: string;
}) {
  const result = await preferenceClient.create({
    body: {
      items: [
        {
          id: plan.id,
          title: `Assinatura Plano ${plan.name}`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: plan.price,
        },
      ],
      payer: { email: user.email },
      back_urls: backUrls,
      auto_return: 'approved',
      notification_url: notificationUrl,
      external_reference: externalReference,
    },
  });

  return result;
}

export async function createDirectPayment({
  plan,
  token,
  userEmail,
  paymentMethodId,
  externalReference,
}: {
  plan: { name: string; price: number };
  token: string;
  userEmail: string;
  paymentMethodId: string;
  externalReference: string;
}) {
  const paymentData = {
    body: {
      transaction_amount: plan.price,
      description: `Assinatura Plano ${plan.name}`,
      payment_method_id: paymentMethodId,
      token,
      payer: {
        email: userEmail,
      },
      external_reference: externalReference,
      installments: 1,
    },
  };

  const payment = await paymentClient.create(paymentData);
  return payment;
}

export async function getPayment(paymentId: string) {
  const payment = await paymentClient.get({ id: paymentId });
  return payment;
} 