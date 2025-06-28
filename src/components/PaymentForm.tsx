"use client";

import { useState, useEffect, useRef } from "react";
import { Payment, initMercadoPago } from "@mercadopago/sdk-react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

const MERCADO_PAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;

interface PaymentFormProps {
  planId: string;
  planPrice: number;
  onPaymentSuccess: () => void;
  onClose: () => void;
}

export const PaymentForm = ({
  planId,
  planPrice,
  onPaymentSuccess,
  onClose,
}: PaymentFormProps) => {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<"success" | "pending" | "error" | null>(null);
  const preferenceCreationInProgress = useRef(false);

  useEffect(() => {
    console.log(
      "Mercado Pago Public Key:",
      MERCADO_PAGO_PUBLIC_KEY ? "Carregada" : "NÃO ENCONTRADA"
    );

    if (MERCADO_PAGO_PUBLIC_KEY && !(window as any).mercadoPagoInitialized) {
      initMercadoPago(MERCADO_PAGO_PUBLIC_KEY);
      (window as any).mercadoPagoInitialized = true;
      console.log("SDK Mercado Pago inicializado.", MERCADO_PAGO_PUBLIC_KEY);
    }
  }, []);

  useEffect(() => {
    const createPreference = async () => {
      if (!planId || preferenceCreationInProgress.current) return;

      preferenceCreationInProgress.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Falha ao criar a preferência de pagamento."
          );
        }
        if (!data.preferenceId || !data.subscriptionId) {
          throw new Error("preferenceId ou subscriptionId não recebido do backend.");
        }
        console.log("data createPreference frontend->", data);
        setPreferenceId(data.preferenceId);
        setSubscriptionId(data.subscriptionId);
      } catch (err: any) {
        setError(err.message);
        console.error("Erro ao criar preferência:", err);
      } finally {
        setIsLoading(false);
        preferenceCreationInProgress.current = false;
      }
    };

    createPreference();
  }, [planId]);
  
  useEffect(() => {
    if (paymentResult) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [paymentResult, onClose]);

  const paymentConfig = {
    customization: {
      visual: {
        style: {
          theme: "default" as const,
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
        maxInstallments: 1,
      } as const,
    },
    initialization: {
      amount: planPrice,
      preferenceId: preferenceId as string,
    },
    onReady: () => {
      console.log("Brick de Pagamento pronto!");
    },
    onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
      console.log("🔄 Iniciando processamento do pagamento...");
      console.log("Método de pagamento:", selectedPaymentMethod);
      console.log("Dados do formulário:", formData);

      setIsProcessing(true);
      setError(null);

      try {
        // Processa o pagamento no seu backend
        const response = await fetch("/api/process-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            subscriptionId,
            paymentData: {
              token: formData.token,
              issuer_id: formData.issuer_id
                ? Number(formData.issuer_id)
                : undefined,
              transaction_amount: planPrice,
              description: `Assinatura do plano - ${planId}`,
              payer: {
                email: formData.payer?.email || "",
                identification: formData.payer?.identification || {},
              },
              installments: formData.installments || 1,
            },
          }),
        });
        console.log("response process-payment frontend->", response);
        const result = await response.json();
        console.log("result process-payment frontend->", result);
        if (!response.ok) {
          throw new Error(result.error || "Erro ao processar pagamento");
        }

        console.log("✅ Pagamento processado:", result);

        // Verifica o status do pagamento
        if (result.status === "approved") {
          console.log("✅ Pagamento aprovado!");
          setPaymentResult('success');
          onPaymentSuccess();
        } else if (result.status === "pending" || result.status === 'in_process') {
          console.log("⏳ Pagamento pendente");
          setPaymentResult('pending');
        } else {
          console.log("❌ Pagamento rejeitado:", result.status_detail);
          setError(
            `Pagamento não foi aprovado: ${
              result.status_detail || "Tente novamente"
            }`
          );
          setPaymentResult('error');
        }
      } catch (err: any) {
        console.error("❌ Erro no processamento:", err);
        setError(
          err.message || "Erro ao processar pagamento. Tente novamente."
        );
        setPaymentResult('error');
      } finally {
        setIsProcessing(false);
      }
    },
    onError: (error: any) => {
      console.warn("🚨 Erro detectado no Brick:", error);

      // Se o erro for não crítico, só loga e não altera a UI
      if (error?.type === "non_critical") {
        return;
      }

      // Se for erro de verdade, aí sim mostra pro usuário
      setError("Ocorreu um erro no formulário de pagamento. Tente novamente.");
      setPaymentResult('error');
      setIsProcessing(false);
    },
  };

  if (isLoading) {
    return (
      <p className="text-center py-8">Carregando formulário de pagamento...</p>
    );
  }

  if (error && !preferenceId) {
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
  
  if (paymentResult) {
    let icon, title, message;

    switch (paymentResult) {
      case 'success':
        icon = <CheckCircle2 className="h-16 w-16 text-green-500" />;
        title = "Pagamento Aprovado!";
        message = "Seu plano foi atualizado com sucesso. Bom proveito!";
        break;
      case 'pending':
        icon = <Clock className="h-16 w-16 text-yellow-500" />;
        title = "Pagamento Pendente";
        message = "Assim que o pagamento for confirmado, seu plano será ativado. Você receberá um e-mail.";
        break;
      default: // 'error'
        icon = <XCircle className="h-16 w-16 text-red-500" />;
        title = "Falha no Pagamento";
        message = error || "Não foi possível processar seu pagamento. Por favor, tente novamente.";
        break;
    }

    return (
      <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
        {icon}
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{message}</p>
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
    <div>
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
