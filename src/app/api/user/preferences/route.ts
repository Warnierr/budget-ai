import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET - Récupérer les préférences utilisateur
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dashboardWidgets: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Parser le JSON des préférences
    const widgets = JSON.parse(user.dashboardWidgets || '{}');

    return NextResponse.json({ widgets });
  } catch (error) {
    console.error("Erreur GET preferences:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Mettre à jour les préférences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { widgets } = body;

    if (!widgets || typeof widgets !== 'object') {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    // Mettre à jour en BDD
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dashboardWidgets: JSON.stringify(widgets)
      }
    });

    return NextResponse.json({ success: true, widgets });
  } catch (error) {
    console.error("Erreur PUT preferences:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

