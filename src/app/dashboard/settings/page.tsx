import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">
          Gérez vos préférences et vos informations personnelles.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Profil
            </CardTitle>
            <CardDescription>
              Vos informations personnelles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" defaultValue={session.user.name || ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={session.user.email || ''} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Préférences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Préférences
            </CardTitle>
            <CardDescription>
              Personnalisez votre expérience Budget AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Devise</Label>
                <Input defaultValue="EUR (€)" disabled />
                <p className="text-xs text-muted-foreground">{`La modification de la devise n'est pas encore disponible.`}</p>
              </div>
              <div className="space-y-2">
                <Label>Langue</Label>
                <Input defaultValue="Français" disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone de danger / Déconnexion */}
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-red-600">Zone de danger</CardTitle>
          </CardHeader>
          <CardContent>
             <Link href="/api/auth/signout">
              <Button variant="destructive" className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

