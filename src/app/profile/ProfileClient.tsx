"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, KeyRound, Trash2, Edit } from "lucide-react";
import type { Plan, Subscription as PrismaSubscription } from '@prisma/client';

type Subscription = PrismaSubscription & { plan: Plan };

interface ProfileClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  subscription: Subscription | null;
}

export function ProfileClient({ user: initialUser, subscription }: ProfileClientProps) {
  const router = useRouter();
  const { update } = useSession();
  const [user, setUser] = useState(initialUser);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(initialUser.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameUpdate = async () => {
    if (newName.trim() === "" || newName === user.name) {
      setIsEditingName(false);
      return;
    }
    setIsUpdating(true);
    setError(null);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      const updatedUser = await response.json();
      if (!response.ok) throw new Error(updatedUser.error || 'Falha ao atualizar o nome.');
      
      await update({ name: updatedUser.name });
      
      setUser(updatedUser);
      setIsEditingName(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch('/api/user', { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao excluir a conta.');
      
      await signOut({ callbackUrl: '/' });
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Meu Perfil</CardTitle>
          <CardDescription>Gerencie suas informações pessoais e sua assinatura.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Nome</Label>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} disabled={isUpdating} />
                <Button onClick={handleNameUpdate} disabled={isUpdating}>
                  {isUpdating ? "Salvando..." : "Salvar"}
                </Button>
                <Button variant="ghost" onClick={() => setIsEditingName(false)} disabled={isUpdating}>Cancelar</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-lg">{user.name}</p>
                <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-lg text-muted-foreground">{user.email}</p>
          </div>

          <div className="space-y-2">
            <Label>Plano Atual</Label>
            {subscription ? (
              <div className="p-4 border rounded-md bg-secondary/50">
                <p className="font-semibold text-lg">{subscription.plan.name}</p>
                <p className="text-sm text-muted-foreground">
                  Acesso até: {new Date(subscription.currentPeriodEnd!).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ) : (
              <p className="text-lg text-muted-foreground">Você não possui uma assinatura ativa.</p>
            )}
          </div>

        </CardContent>
        <CardFooter className="flex flex-col items-start gap-6 border-t pt-6">
          <h3 className="font-semibold">Configurações Avançadas</h3>
          <div className="w-full space-y-4">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => router.push('/plans')}>
                <KeyRound className="h-4 w-4" />
                Gerenciar Assinatura
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full justify-start gap-2">
                    <Trash2 className="h-4 w-4" />
                    Excluir Conta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Você tem certeza?</DialogTitle>
                    <DialogDescription>
                      Esta ação é irreversível. Todos os seus dados, incluindo barbearias e agendamentos, serão permanentemente excluídos.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost">Cancelar</Button>
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
                      {isDeleting ? "Excluindo..." : "Sim, excluir minha conta"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
          </div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </CardFooter>
      </Card>
    </div>
  );
} 