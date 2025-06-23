'use server';

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { Session } from "next-auth";

export async function handleCheckout(planId: string) {
    const session: Session | null = await getServerSession(authOptions);
    
    // A verificação de `accessToken` agora usará o tipo global
    if (!session?.user?.id || !(session as any).accessToken) {
        // Isso não deveria acontecer se o usuário já estiver na página de planos,
        // mas é uma verificação de segurança importante.
        throw new Error("User is not authenticated or session is invalid.");
    }

    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    const res = await fetch(`${apiBaseUrl}/checkout/${planId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(session as any).accessToken}`
        },
    });

    if (!res.ok) {
        const error = await res.json();
        console.error("Checkout error:", error);
        // No futuro, poderíamos redirecionar para uma página de erro com uma mensagem amigável
        // redirect(`/plans?error=${encodeURIComponent(error.error || "Failed to initiate checkout.")}`);
        throw new Error(error.error || "Failed to initiate checkout.");
    }
    
    const data = await res.json();

    if (data.trial) {
        // Se o plano for um teste, redirecionar para o dashboard com uma mensagem de sucesso
        redirect('/dashboard?trial=true');
    } else if (data.init_point) {
        // Se for um pagamento real, redirecionar para a URL de checkout do Mercado Pago
        redirect(data.init_point);
    } else {
        // Fallback para um caso inesperado
        redirect('/plans?error=checkout_failed');
    }
}

export async function processDirectPayment(formData: {
    planId: string;
    token: string;
    paymentMethodId: string;
}) {
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user?.id || !(session as any).accessToken) {
        throw new Error("User is not authenticated or session is invalid.");
    }

    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    const res = await fetch(`${apiBaseUrl}/process-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(session as any).accessToken}`
        },
        body: JSON.stringify(formData),
    });

    const result = await res.json();

    if (!res.ok) {
        console.error("Payment error:", result);
        throw new Error(result.message || "Falha ao processar o pagamento.");
    }
    
    // Se o pagamento for bem-sucedido, redireciona para o perfil/dashboard
    redirect('/profile?payment=success');
} 