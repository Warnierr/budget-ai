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
export type RecurringIncomeLike = {
  amount: number;
  frequency?: string | null;
  isRecurring?: boolean | null;
  startDate?: string | null;
};

export type SubscriptionLike = {
  amount: number;
  frequency: string;
  billingDate: number;
  isActive?: boolean | null;
};

export function shouldTriggerRecurringIncome(
  income: RecurringIncomeLike,
  date: Date,
  today: Date
): boolean {
  if (income.frequency === "once" || !income.startDate) {
    return false;
  }

  const start = new Date(income.startDate);
  start.setHours(0, 0, 0, 0);

  if (start > today) {
    return false;
  }

  switch (income.frequency) {
    case "monthly":
      return (
        monthsBetween(start, date) >= 1 &&
        isSameDayOfMonth(start, date)
      );
    case "weekly":
      return (
        daysBetween(start, date) >= 7 &&
        (date.getTime() - start.getTime()) % WEEK_IN_MS === 0
      );
    case "yearly":
      return (
        yearsBetween(start, date) >= 1 &&
        start.getDate() === date.getDate() &&
        start.getMonth() === date.getMonth()
      );
    default:
      return false;
  }
}

export function getSubscriptionChargeForDate(
  subscription: SubscriptionLike,
  date: Date
): number {
  if (subscription.isActive === false) {
    return 0;
  }

  const dayOfMonth = date.getDate();

  if (subscription.billingDate !== dayOfMonth) {
    return 0;
  }

  if (subscription.frequency === "monthly") {
    return subscription.amount;
  }

  if (subscription.frequency === "yearly") {
    return subscription.amount / 12;
  }

  return 0;
}

function daysBetween(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function monthsBetween(start: Date, end: Date) {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
}

function yearsBetween(start: Date, end: Date) {
  let years = end.getFullYear() - start.getFullYear();
  if (
    end.getMonth() < start.getMonth() ||
    (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())
  ) {
    years--;
  }
  return years;
}

function isSameDayOfMonth(start: Date, date: Date) {
  const startDay = start.getDate();
  const daysInTargetMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const targetDay = Math.min(startDay, daysInTargetMonth);
  return date.getDate() === targetDay;
}

const WEEK_IN_MS = 1000 * 60 * 60 * 24 * 7;


