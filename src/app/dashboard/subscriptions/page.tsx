import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SubscriptionsClient } from "./subscriptions-client";

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user's subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Format for client component
  const formattedSubscriptions = subscriptions.map(sub => ({
    id: sub.id,
    name: sub.name,
    plan: sub.description || undefined,
    amount: sub.amount,
    frequency: sub.frequency,
    billingDate: sub.billingDate,
    isActive: sub.isActive,
    logo: undefined, // Could be added later
  }));

  return <SubscriptionsClient subscriptions={formattedSubscriptions} />;
}
