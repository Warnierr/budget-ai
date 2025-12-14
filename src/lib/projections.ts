export type Subscription = {
  amount: number;
  frequency: string; // "monthly" | "yearly" | etc.
  billingDate?: number;
  isActive?: boolean;
};

export type RecurringIncome = {
  amount: number;
  frequency: string; // "monthly" | "weekly" | "yearly"
  isRecurring?: boolean;
  startDate?: string;
};

/**
 * Calcule le prélèvement d'abonnement pour une date donnée.
 * Hypothèse simple : mensuel par défaut, yearly si précisé.
 */
export function getSubscriptionChargeForDate(subscription: Subscription, date: Date): number {
  if (!subscription) return 0;
  if (subscription.isActive === false) return 0;

  const freq = subscription.frequency?.toLowerCase();
  const billingDay = subscription.billingDate ?? 1;

  if (freq === "yearly") {
    return date.getDate() === billingDay ? subscription.amount : 0;
  }

  // mensuel par défaut
  return date.getDate() === billingDay ? subscription.amount : 0;
}

/**
 * Détermine si un revenu récurrent doit se déclencher à la date cible.
 * Logique simple alignée sur l'ancien comportement.
 */
export function shouldTriggerRecurringIncome(
  income: RecurringIncome,
  targetDate: Date,
  today: Date
): boolean {
  if (!income?.isRecurring) return false;
  const freq = income.frequency?.toLowerCase();

  if (income.startDate) {
    const start = new Date(income.startDate);
    if (start > targetDate) return false;
  }

  switch (freq) {
    case "weekly": {
      const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays % 7 === 0;
    }
    case "yearly":
      return (
        targetDate.getMonth() === today.getMonth() &&
        targetDate.getDate() === today.getDate()
      );
    case "monthly":
    default:
      return targetDate.getDate() === today.getDate();
  }
}
