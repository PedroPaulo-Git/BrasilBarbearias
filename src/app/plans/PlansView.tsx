"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Plan, Subscription } from "@prisma/client";
import { PaymentForm } from "@/components/PaymentForm";
import { useRouter } from "next/navigation";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PlansViewProps {
  plans: (Plan & { price: number })[];
  userSubscription: (Partial<Subscription> & { plan?: Partial<Plan> & { price?: number } }) | null;
}

export function PlansView({ plans, userSubscription }: PlansViewProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const router = useRouter();

  // keep local copy of subscription so we can update after payment without full reload
  type UserSubscription = PlansViewProps["userSubscription"];
  const [subscription, setSubscription] = useState<UserSubscription>(userSubscription);

  // Utility to refresh subscription from API
  const fetchUserSubscription = async () => {
    try {
      const res = await fetch("/api/user/subscribe", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch subscription");
      const data = await res.json();
      console.log('data fetchUserSubscription ->', data)
      // The API returns a simplified object. Map it to the same shape used in this component.
    //   setSubscription((prev) => ({
    //     ...prev,
    //     status: data.status,
    //     planId: selectedPlanId ?? prev?.planId,
    //     plan: {
    //       ...prev?.plan,
    //       name: data.name,
    //       price: data.price ?? prev?.plan?.price,
    //       shopLimit: data.shopLimit ?? prev?.plan?.shopLimit,
    //     },
    //     currentPeriodEnd: data.paymentEnd ?? prev?.currentPeriodEnd,
    //   } as any));
    // } 
    setSubscription({
      status: data.status,
      planId: data.planId,
      currentPeriodEnd: data.paymentEnd,
      currentPeriodStart: data.paymentStart,
      plan: {
        name: data.name,
        price: data.price,
        shopLimit: data.shopLimit,
      },
    });
    console.error('PlansView ->',plans, data, subscription)
    }
    catch (error) {
      console.error('PlansView error ->',plans, error);
    }
  };

  const handleSubscriptionClick = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handlePaymentCompletion = async () => {
    // Esta função agora é chamada no onSubmit do Brick.
    // O formulário mostrará a mensagem "Processando...".
    // O usuário fechará o diálogo manualmente e verá o status atualizado
    // no dashboard, que será atualizado pelo webhook.
    // router.refresh(); // REMOVIDO PARA EVITAR RE-RENDER
    console.log('[PlansView] handlePaymentCompletion foi chamado.');

    await fetchUserSubscription();
  };
  
  const handleDialogClose = () => {
    setSelectedPlanId(null);
  };
  console.error('PlansView ->',plans, userSubscription)
  useEffect(() => {
    console.log('PlansView useEffect ->', plans, userSubscription, subscription);
  }, [subscription]);
  
  const currentPlanPrice = subscription?.plan?.price ?? -1;
  const hasActiveSubscription = subscription?.status === 'active';
  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">
          {hasActiveSubscription ? "Melhore seu plano" : "Escolha o plano perfeito para você"}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {hasActiveSubscription
            ? "Aproveite mais benefícios e eleve sua gestão."
            : "Acesse todas as nossas ferramentas e impulsione seu negócio."}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.planId === plan.id && hasActiveSubscription;
          console.log('isCurrentPlan ->', isCurrentPlan)
          console.log('hasActiveSubscription ->', hasActiveSubscription)
          console.log('plan.price ->', plan.price)
          console.log('currentPlanPrice ->', currentPlanPrice)
          let buttonText = 'Assinar Agora';
          if (hasActiveSubscription) {
            if (isCurrentPlan) {
              buttonText = 'Plano Atual';
            } else if (plan.price > currentPlanPrice) {
              buttonText = 'Fazer Upgrade';
            } else {
              buttonText = 'Fazer Downgrade';
            }
          }

          return (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">R$ {plan.price.toFixed(2)}</span>/mês
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
                  onClick={() => handleSubscriptionClick(plan.id)} 
                  className="w-full" 
                  disabled={isCurrentPlan}
                >
                  {buttonText}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <Dialog open={!!selectedPlanId} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Assinatura</DialogTitle>
            <DialogDescription>
              Escolha sua forma de pagamento preferida. O ambiente é seguro e protegido.
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <PaymentForm
              planId={selectedPlan.id}
              planPrice={selectedPlan.price}
              onPaymentSuccess={handlePaymentCompletion}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="text-center mt-12">
        <p>Precisa de mais? <a href="/contact" className="text-primary underline">Fale conosco para um plano personalizado</a>.</p>
      </div>
    </div>
  );
} 