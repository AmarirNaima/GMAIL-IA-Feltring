// app/page.tsx
"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, LogIn } from "lucide-react";
import { redirect } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  if (status === "authenticated" && session) {
    // Optional: you could also redirect
    window.location.href = "/dashboard";
    return null;
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      console.error("Erreur d'authentification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Filtre Gmail IA</CardTitle>
          <CardDescription>
            Connectez votre compte Gmail pour commencer
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-center">
            <Mail className="h-12 w-12 text-gray-400" />
          </div>
          <div className="text-center text-sm text-gray-500">
            <p>Cette application vous aidera à organiser votre boîte de réception en :</p>
            <ul className="mt-2 list-disc text-left pl-5">
              <li>Catégorisant automatiquement les emails</li>
              <li>Priorisant les messages importants</li>
              <li>Filtrant le contenu à faible priorité</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
            {isLoading ? (
              "Connexion en cours..."
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter avec Gmail
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
