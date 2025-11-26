import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schéma de validation pour la création d'un objectif
const goalSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  targetAmount: z.number().min(1, "Le montant cible doit être positif"),
  currentAmount: z.number().default(0),
  deadline: z.string().optional().transform((str) => str ? new Date(str) : null),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("[GOALS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = goalSchema.parse(json);

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        name: body.name,
        targetAmount: body.targetAmount,
        currentAmount: body.currentAmount,
        deadline: body.deadline,
        description: body.description,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }
    console.error("[GOALS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

