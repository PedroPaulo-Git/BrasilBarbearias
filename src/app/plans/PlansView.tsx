"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { processDirectPayment } from "./actions";
import { Plan, Subscription } from "@prisma/client";
import { PaymentForm } from "@/components/PaymentForm";
import { useTransition } from 'react';

interface PlansViewProps {
  plans: Plan[];
  userSubscription: Partial<Subscription> | null;
}

export function PlansView({ plans, userSubscription }: PlansViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubscriptionClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setError(null);
  };

  const handleFormSubmit = async (formData: { token: string; paymentMethodId: string }) => {
    if (!selectedPlan) return;

    startTransition(async () => {
      try {
        await processDirectPayment({ ...formData, planId: selectedPlan.id });
        setSelectedPlan(null); // Fecha o dialog em caso de sucesso
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Ocorreu um erro desconhecido.");
      }
    });
  };

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Escolha o plano perfeito para você</h1>
        <p className="text-lg text-muted-foreground mt-2">Comece com um teste gratuito. Cancele quando quiser.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">R$ {plan.price.toFixed(2)}</span>/mês
                {plan.trialDays > 0 && <span className="text-sm"> (Teste gratuito de {plan.trialDays} dias)</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Até {plan.shopLimit} barbearia(s)
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Agendamentos Online
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSubscriptionClick(plan)} 
                className="w-full" 
                disabled={userSubscription?.planId === plan.id && userSubscription?.status === 'active'}
              >
                {userSubscription?.planId === plan.id && userSubscription?.status === 'active' ? 'Plano Atual' : 'Assinar Agora'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Assinatura</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <PaymentForm
              planId={selectedPlan.id}
              planName={selectedPlan.name}
              planPrice={selectedPlan.price}
              isSubmitting={isPending}
              onSubmit={handleFormSubmit}
            />
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </DialogContent>
      </Dialog>

      <div className="text-center mt-12">
        <p>Precisa de mais? <a href="/contact" className="text-primary underline">Fale conosco para um plano personalizado</a>.</p>
      </div>
    </div>
  );
} 