"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      const res = await fetch("/api/user/plan");
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    };
    fetchPlan();
  }, []);

  if (status === "loading") return <div>Carregando...</div>;
  if (status === "unauthenticated") return <div>Faça login para ver seu perfil.</div>;

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <strong>Email:</strong> {session?.user?.email}
          </div>
          <div className="mb-4">
            <strong>Plano atual:</strong>{" "}
            {plan ? (
              <>
                {plan.name} <span className="text-muted-foreground">({plan.status})</span>
                <br />
                {plan.trialEnd && (
                  <span>
                    Expira em: {new Date(plan.trialEnd).toLocaleDateString()}
                  </span>
                )}
                {plan.paymentEnd && (
                  <span>
                    Expira em: {new Date(plan.paymentEnd).toLocaleDateString()}
                  </span>
                )}
              </>
            ) : (
              "Carregando..."
            )}
          </div>
          <Button onClick={() => window.location.href = "/plans"}>Ver Planos</Button>
        </CardContent>
      </Card>
    </div>
  );
} 