"use client";

import { useState, useEffect, useRef } from 'react';
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';

const MERCADO_PAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;

interface PaymentFormProps {
  planId: string;
  planPrice: number;
  onPaymentSuccess: () => void;
}

export const PaymentForm = ({ planId, planPrice, onPaymentSuccess }: PaymentFormProps) => {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const preferenceCreationInProgress = useRef(false);

  useEffect(() => {
    console.log('Mercado Pago Public Key:', MERCADO_PAGO_PUBLIC_KEY ? 'Carregada' : 'NÃO ENCONTRADA');
    
    if (MERCADO_PAGO_PUBLIC_KEY && !(window as any).mercadoPagoInitialized) {
      initMercadoPago(MERCADO_PAGO_PUBLIC_KEY);
      (window as any).mercadoPagoInitialized = true;
      console.log('SDK Mercado Pago inicializado.',MERCADO_PAGO_PUBLIC_KEY);
    }
  }, []);

  useEffect(() => {
    const createPreference = async () => {
      if (!planId || preferenceCreationInProgress.current) return;
      
      preferenceCreationInProgress.current = true;
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Falha ao criar a preferência de pagamento.');
        }
        if (!data.preferenceId) {
          throw new Error('preferenceId não recebido do backend.');
        }
        
        setPreferenceId(data.preferenceId);
      } catch (err: any) {
        setError(err.message);
        console.error('Erro ao criar preferência:', err);
      } finally {
        setIsLoading(false);
        preferenceCreationInProgress.current = false;
      }
    };

    createPreference();
  }, [planId]);

  const paymentConfig = {
    customization: {
      visual: {
        style: {
          theme: 'default' as const,
        },
      },
      paymentMethods: {
        creditCard: "all",
        debitCard: "all",
        ticket: "all",
        bankTransfer: "all",
        atm: "all",
        onboarding_credits: "all",
        wallet_purchase: "all",
        maxInstallments: 1
      } as const,
    },
    initialization: {
      amount: planPrice,
      preferenceId: preferenceId as string,
    },
    onReady: () => {
      console.log('Brick de Pagamento pronto!');
    },
    onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
      console.log('🔄 Iniciando processamento do pagamento...');
      console.log('Método de pagamento:', selectedPaymentMethod);
      console.log('Dados do formulário:', formData);
      
      setIsProcessing(true);
      setError(null);
      
      try {
        // Processa o pagamento no seu backend
        const response = await fetch('/api/process-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            paymentData: {
              token: formData.token,
              payment_method_id: selectedPaymentMethod,
              transaction_amount: planPrice,
              description: `Assinatura do plano - ${planId}`,
              payer: {
                email: formData.payer?.email || '',
                identification: formData.payer?.identification || {},
              },
              installments: formData.installments || 1,
            }
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Erro ao processar pagamento');
        }

        console.log('✅ Pagamento processado:', result);
        
        // Verifica o status do pagamento
        if (result.status === 'approved') {
          console.log('✅ Pagamento aprovado!');
          onPaymentSuccess();
        } else if (result.status === 'pending') {
          console.log('⏳ Pagamento pendente');
          // Você pode mostrar uma mensagem diferente para pagamentos pendentes
          setError('Pagamento em processamento. Você receberá uma confirmação em breve.');
        } else {
          console.log('❌ Pagamento rejeitado:', result.status_detail);
          setError(`Pagamento não foi aprovado: ${result.status_detail || 'Tente novamente'}`);
        }
        
      } catch (err: any) {
        console.error('❌ Erro no processamento:', err);
        setError(err.message || 'Erro ao processar pagamento. Tente novamente.');
      } finally {
        setIsProcessing(false);
      }
    },
    onError: (error: any) => {
      console.warn('🚨 Erro detectado no Brick:', error);
    
      // Se o erro for não crítico, só loga e não altera a UI
      if (error?.type === 'non_critical') {
        return;
      }
    
      // Se for erro de verdade, aí sim mostra pro usuário
      setError('Ocorreu um erro no formulário de pagamento. Tente novamente.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <p className="text-center py-8">Carregando formulário de pagamento...</p>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="text-center py-8">
        <p className="text-blue-600 mb-2">Processando pagamento...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {preferenceId && (
        <Payment
          initialization={paymentConfig.initialization}
          customization={paymentConfig.customization}
          onReady={paymentConfig.onReady}
          onSubmit={paymentConfig.onSubmit}
          onError={paymentConfig.onError}
        />
      )}
    </div>
  );
};