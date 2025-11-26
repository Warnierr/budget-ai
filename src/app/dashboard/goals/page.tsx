import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GoalsClient } from "./goals-client";

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const goals = await prisma.goal.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Sérialisation des dates pour le client
  const formattedGoals = goals.map(goal => ({
    ...goal,
    deadline: goal.deadline?.toISOString() || null,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  }));

  return <GoalsClient initialGoals={formattedGoals} />;
}

