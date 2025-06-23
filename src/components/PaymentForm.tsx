"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Tipagem para o SDK do Mercado Pago
declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface PaymentFormProps {
  planId: string;
  planName: string;
  planPrice: number;
  onSubmit: (formData: { token: string; paymentMethodId: string }) => void;
  isSubmitting: boolean;
}

export function PaymentForm({ planId, planName, planPrice, onSubmit, isSubmitting }: PaymentFormProps) {
  const [mercadoPago, setMercadoPago] = useState<any>(null);

  useEffect(() => {
    if (window.MercadoPago) {
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!, {
        locale: 'pt-BR'
      });
      setMercadoPago(mp);
      console.log('SDK do Mercado Pago inicializado.');
    } else {
      console.error('SDK do Mercado Pago não foi carregado.');
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mercadoPago || isSubmitting) return;

    console.log('Formulário submetido. Tentando gerar token...');
    const form = event.currentTarget;
    
    const [expirationMonth, expirationYear] = form.cardExpirationDate.value.split('/');
    
    const cardTokenRequest = {
      cardNumber: form.cardNumber.value.replace(/\s/g, ''),
      cardholderName: form.cardholderName.value,
      cardExpirationMonth: expirationMonth,
      cardExpirationYear: `20${expirationYear}`,
      securityCode: form.securityCode.value,
      identificationType: 'CPF',
      identificationNumber: form.identificationNumber.value,
    };

    console.log('Dados enviados para gerar token:', cardTokenRequest);

    try {
      // A função correta na v2 é `createCardToken`
      const cardToken = await mercadoPago.createCardToken(cardTokenRequest);
      
      console.log('Token recebido:', cardToken);

      if (!cardToken.id) {
        console.error('Erro ao criar token do cartão:', cardToken);
        alert('Verifique os dados do seu cartão. Ocorreu um erro ao gerar o token de pagamento.');
        return;
      }
      
      onSubmit({
        token: cardToken.id,
        paymentMethodId: 'master', // Este campo pode precisar de ajuste dependendo da API
      });

    } catch (error) {
      console.error('Erro inesperado no formulário de pagamento:', error);
      alert('Ocorreu um erro. Tente novamente.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento para {planName}</CardTitle>
        <CardDescription>Valor: R$ {planPrice.toFixed(2)}</CardDescription>
      </CardHeader>
      <form id="form-checkout" onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input id="cardNumber" name="cardNumber" placeholder="0000 0000 0000 0000" required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="cardholderName">Nome do Titular</Label>
              <Input id="cardholderName" name="cardholderName" placeholder="APRO para aprovar, REPRO para recusar" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardExpirationDate">Validade</Label>
              <Input id="cardExpirationDate" name="cardExpirationDate" placeholder="MM/AA" maxLength={5} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="securityCode">CVV</Label>
              <Input id="securityCode" name="securityCode" placeholder="123" maxLength={4} required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="identificationNumber">CPF</Label>
              <Input id="identificationNumber" name="identificationNumber" placeholder="Apenas números" required />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={!mercadoPago || isSubmitting}>
            {isSubmitting ? 'Processando...' : 'Pagar Agora'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 