"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { connectCanvas, type OnboardingState } from "./actions";

const initialState: OnboardingState = {};

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState(connectCanvas, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Conectar ao Canvas</CardTitle>
          <CardDescription>
            Cole a URL da sua instituição e o token pessoal que você gerou em Conta →
            Configurações → &quot;+ Novo token de acesso&quot; no Canvas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="baseUrl">URL da instituição</Label>
              <Input id="baseUrl" name="baseUrl" placeholder="pucpr.instructure.com" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="token">Token pessoal de acesso</Label>
              <Input id="token" name="token" type="password" placeholder="Cole seu token aqui" required />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Conectando..." : "Conectar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
