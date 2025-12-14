import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const goalUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().min(1).optional(),
  currentAmount: z.number().min(0).optional(),
  deadline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isCompleted: z.boolean().optional(),
});

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = goalUpdateSchema.parse(json);

    const existingGoal = await prisma.goal.findUnique({
      where: { id: params.id },
    });

    if (!existingGoal || existingGoal.userId !== session.user.id) {
      return new NextResponse("Objectif introuvable", { status: 404 });
    }

    const { deadline, ...rest } = body;
    const updatedGoal = await prisma.goal.update({
      where: { id: params.id },
      data: {
        ...rest,
        deadline: deadline === undefined ? existingGoal.deadline : deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }
    console.error("[GOALS_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const existingGoal = await prisma.goal.findUnique({
      where: { id: params.id },
    });

    if (!existingGoal || existingGoal.userId !== session.user.id) {
      return new NextResponse("Objectif introuvable", { status: 404 });
    }

    await prisma.goal.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[GOALS_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


