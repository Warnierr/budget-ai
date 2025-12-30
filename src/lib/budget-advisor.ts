/**
 * Budget Advisor - Conseils budgétaires intelligents
 * 
 * Règles financières implémentées :
 * - Règle 50/30/20 (Elizabeth Warren)
 * - Règle du logement (max 33%)
 * - Fonds d'urgence (3-6 mois)
 * - Contrôle des abonnements
 */

// ============================================
// TYPES
// ============================================

export interface BudgetAnalysis {
  // Données brutes
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;

  // Répartition par type
  breakdown: {
    needs: number;      // Besoins essentiels
    wants: number;      // Envies/loisirs
    savings: number;    // Épargne
    subscriptions: number; // Abonnements
    housing: number;    // Logement
  };

  // Ratios (en %)
  ratios: {
    needs: number;
    wants: number;
    savings: number;
    subscriptions: number;
    housing: number;
  };

  // Score de santé financière (0-100)
  healthScore: number;

  // Insights et conseils
  insights: Insight[];
}

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  category: 'rule_50_30_20' | 'housing' | 'subscriptions' | 'savings' | 'spending' | 'general';
  title: string;
  message: string;
  recommendation?: string;
  value?: number;
  target?: number;
}

export interface MonthlyData {
  incomes: { amount: number; category: string; description: string }[];
  expenses: { amount: number; category: string; description: string }[];
  subscriptions: { amount: number; name: string }[];
}

// ============================================
// CATÉGORISATION BESOINS / ENVIES
// ============================================

const NEEDS_CATEGORIES = [
  'Logement',
  'Alimentation',
  'Transport',
  'Sante',
  'Assurance',
  'Banque',
  'Energie',
];

const WANTS_CATEGORIES = [
  'Loisirs',
  'Restaurants',
  'Shopping',
  'Voyage',
  'Abonnements', // Streaming, etc.
  'Autre',
];

const HOUSING_CATEGORIES = [
  'Logement',
];

const SUBSCRIPTION_KEYWORDS = [
  'spotify', 'netflix', 'disney', 'amazon prime', 'apple', 'deezer',
  'youtube', 'hbo', 'canal', 'ocs', 'orange', 'sfr', 'bouygues', 'free',
  'edf', 'engie', 'basic fit', 'fitness', 'gym', 'assurance', 'mutuelle',
];

/**
 * Détermine si une catégorie est un besoin essentiel
 */
export function isNeed(category: string): boolean {
  return NEEDS_CATEGORIES.some(c =>
    category.toLowerCase().includes(c.toLowerCase())
  );
}

/**
 * Détermine si une catégorie est une envie
 */
export function isWant(category: string): boolean {
  return WANTS_CATEGORIES.some(c =>
    category.toLowerCase().includes(c.toLowerCase())
  );
}

/**
 * Détermine si c'est du logement
 */
export function isHousing(category: string, description: string): boolean {
  const lowerDesc = description.toLowerCase();
  return (
    HOUSING_CATEGORIES.some(c => category.toLowerCase().includes(c.toLowerCase())) ||
    lowerDesc.includes('loyer') ||
    lowerDesc.includes('rent')
  );
}

/**
 * Détermine si c'est un abonnement
 */
export function isSubscription(description: string): boolean {
  const lowerDesc = description.toLowerCase();
  return SUBSCRIPTION_KEYWORDS.some(keyword => lowerDesc.includes(keyword));
}

// ============================================
// ANALYSE BUDGÉTAIRE
// ============================================

/**
 * Analyse complète du budget
 */
export function analyzeBudget(data: MonthlyData): BudgetAnalysis {
  // Calculs de base
  const monthlyIncome = data.incomes.reduce((sum, i) => sum + i.amount, 0);
  const monthlyExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlySavings = monthlyIncome - monthlyExpenses;

  // Calcul des abonnements (Exclure le logement/loyer des abonnements pour l'analyse)
  const realSubscriptions = data.subscriptions.filter(s => !isHousing('', s.name));
  const subscriptionsTotal = realSubscriptions.reduce((sum, s) => sum + s.amount, 0);

  // Catégorisation des dépenses
  let needsTotal = 0;
  let wantsTotal = 0;
  let housingTotal = 0;

  for (const expense of data.expenses) {
    if (isHousing(expense.category, expense.description)) {
      housingTotal += expense.amount;
      needsTotal += expense.amount;
    } else if (isNeed(expense.category)) {
      needsTotal += expense.amount;
    } else {
      wantsTotal += expense.amount;
    }
  }

  // Calcul des ratios
  const ratios = {
    needs: monthlyIncome > 0 ? (needsTotal / monthlyIncome) * 100 : 0,
    wants: monthlyIncome > 0 ? (wantsTotal / monthlyIncome) * 100 : 0,
    savings: monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0,
    subscriptions: monthlyIncome > 0 ? (subscriptionsTotal / monthlyIncome) * 100 : 0,
    housing: monthlyIncome > 0 ? (housingTotal / monthlyIncome) * 100 : 0,
  };

  // Générer les insights
  const insights = generateInsights(monthlyIncome, {
    needs: needsTotal,
    wants: wantsTotal,
    savings: monthlySavings,
    subscriptions: subscriptionsTotal,
    housing: housingTotal,
  }, ratios);

  // Calculer le score de santé
  const healthScore = calculateHealthScore(ratios, monthlySavings);

  return {
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    breakdown: {
      needs: needsTotal,
      wants: wantsTotal,
      savings: monthlySavings,
      subscriptions: subscriptionsTotal,
      housing: housingTotal,
    },
    ratios,
    healthScore,
    insights,
  };
}

// ============================================
// GÉNÉRATION DES INSIGHTS
// ============================================

function generateInsights(
  income: number,
  breakdown: { needs: number; wants: number; savings: number; subscriptions: number; housing: number },
  ratios: { needs: number; wants: number; savings: number; subscriptions: number; housing: number }
): Insight[] {
  const insights: Insight[] = [];

  // ===== RÈGLE 50/30/20 =====

  // Besoins (objectif: 50%)
  if (ratios.needs <= 50) {
    insights.push({
      id: 'needs_ok',
      type: 'success',
      category: 'rule_50_30_20',
      title: 'Besoins maîtrisés',
      message: `Vos besoins essentiels représentent ${ratios.needs.toFixed(0)}% de vos revenus.`,
      recommendation: 'Continuez ainsi ! Vous êtes dans la norme des 50%.',
      value: ratios.needs,
      target: 50,
    });
  } else if (ratios.needs <= 60) {
    insights.push({
      id: 'needs_warning',
      type: 'warning',
      category: 'rule_50_30_20',
      title: 'Besoins légèrement élevés',
      message: `Vos besoins représentent ${ratios.needs.toFixed(0)}% (objectif: 50%).`,
      recommendation: 'Cherchez des économies sur les factures ou l\'alimentation.',
      value: ratios.needs,
      target: 50,
    });
  } else {
    insights.push({
      id: 'needs_danger',
      type: 'danger',
      category: 'rule_50_30_20',
      title: 'Besoins trop élevés',
      message: `Vos besoins représentent ${ratios.needs.toFixed(0)}% de vos revenus !`,
      recommendation: 'Vos charges fixes sont trop lourdes. Envisagez de renégocier ou de réduire.',
      value: ratios.needs,
      target: 50,
    });
  }

  // Envies (objectif: 30%)
  if (ratios.wants <= 30) {
    insights.push({
      id: 'wants_ok',
      type: 'success',
      category: 'rule_50_30_20',
      title: 'Loisirs équilibrés',
      message: `Vos loisirs représentent ${ratios.wants.toFixed(0)}% de vos revenus.`,
      value: ratios.wants,
      target: 30,
    });
  } else if (ratios.wants <= 40) {
    insights.push({
      id: 'wants_warning',
      type: 'warning',
      category: 'rule_50_30_20',
      title: 'Loisirs un peu élevés',
      message: `Vos loisirs représentent ${ratios.wants.toFixed(0)}% (objectif: 30%).`,
      recommendation: 'Identifiez les dépenses plaisir récurrentes à réduire.',
      value: ratios.wants,
      target: 30,
    });
  } else {
    insights.push({
      id: 'wants_danger',
      type: 'danger',
      category: 'rule_50_30_20',
      title: 'Trop de dépenses plaisir',
      message: `Vos loisirs représentent ${ratios.wants.toFixed(0)}% de vos revenus !`,
      recommendation: 'Réduisez les sorties, restaurants et achats impulsifs.',
      value: ratios.wants,
      target: 30,
    });
  }

  // Épargne (objectif: 20%)
  if (ratios.savings >= 20) {
    insights.push({
      id: 'savings_excellent',
      type: 'success',
      category: 'savings',
      title: 'Excellente épargne !',
      message: `Vous épargnez ${ratios.savings.toFixed(0)}% de vos revenus (${breakdown.savings.toFixed(0)}€/mois).`,
      recommendation: 'Bravo ! Pensez à diversifier : livret A, assurance-vie, PEA.',
      value: ratios.savings,
      target: 20,
    });
  } else if (ratios.savings >= 10) {
    insights.push({
      id: 'savings_ok',
      type: 'info',
      category: 'savings',
      title: 'Épargne correcte',
      message: `Vous épargnez ${ratios.savings.toFixed(0)}% (objectif: 20%).`,
      recommendation: `Essayez d'atteindre ${(income * 0.2).toFixed(0)}€/mois d'épargne.`,
      value: ratios.savings,
      target: 20,
    });
  } else if (ratios.savings >= 0) {
    insights.push({
      id: 'savings_warning',
      type: 'warning',
      category: 'savings',
      title: 'Épargne insuffisante',
      message: `Vous n'épargnez que ${ratios.savings.toFixed(0)}% de vos revenus.`,
      recommendation: 'Mettez en place un virement automatique dès réception du salaire.',
      value: ratios.savings,
      target: 20,
    });
  } else {
    insights.push({
      id: 'savings_danger',
      type: 'danger',
      category: 'savings',
      title: 'Vous êtes en déficit !',
      message: `Vous dépensez ${Math.abs(breakdown.savings).toFixed(0)}€ de plus que vos revenus.`,
      recommendation: 'Action urgente : identifiez les dépenses à supprimer immédiatement.',
      value: ratios.savings,
      target: 20,
    });
  }

  // ===== RÈGLE LOGEMENT (max 33%) =====

  if (breakdown.housing > 0) {
    if (ratios.housing <= 30) {
      insights.push({
        id: 'housing_excellent',
        type: 'success',
        category: 'housing',
        title: 'Loyer maîtrisé',
        message: `Votre loyer représente ${ratios.housing.toFixed(0)}% de vos revenus.`,
        recommendation: 'Excellent ! Vous êtes bien en dessous du seuil des 33%.',
        value: ratios.housing,
        target: 33,
      });
    } else if (ratios.housing <= 33) {
      insights.push({
        id: 'housing_ok',
        type: 'info',
        category: 'housing',
        title: 'Loyer dans la norme',
        message: `Votre loyer représente ${ratios.housing.toFixed(0)}% (limite: 33%).`,
        value: ratios.housing,
        target: 33,
      });
    } else if (ratios.housing <= 40) {
      insights.push({
        id: 'housing_warning',
        type: 'warning',
        category: 'housing',
        title: 'Loyer élevé',
        message: `Votre loyer représente ${ratios.housing.toFixed(0)}% (recommandé: < 33%).`,
        recommendation: 'Envisagez une colocation ou un déménagement à terme.',
        value: ratios.housing,
        target: 33,
      });
    } else {
      insights.push({
        id: 'housing_danger',
        type: 'danger',
        category: 'housing',
        title: 'Loyer trop élevé !',
        message: `Votre loyer représente ${ratios.housing.toFixed(0)}% de vos revenus.`,
        recommendation: 'Votre logement pèse trop lourd. Cherchez des solutions.',
        value: ratios.housing,
        target: 33,
      });
    }
  }

  // ===== ABONNEMENTS =====

  if (breakdown.subscriptions > 0) {
    if (ratios.subscriptions <= 5) {
      insights.push({
        id: 'subs_ok',
        type: 'success',
        category: 'subscriptions',
        title: 'Abonnements contrôlés',
        message: `Vos abonnements : ${breakdown.subscriptions.toFixed(0)}€/mois (${ratios.subscriptions.toFixed(0)}%).`,
        value: breakdown.subscriptions,
      });
    } else if (ratios.subscriptions <= 10) {
      insights.push({
        id: 'subs_warning',
        type: 'warning',
        category: 'subscriptions',
        title: 'Abonnements à surveiller',
        message: `Vos abonnements : ${breakdown.subscriptions.toFixed(0)}€/mois (${ratios.subscriptions.toFixed(0)}%).`,
        recommendation: 'Faites le tri : utilisez-vous vraiment tous ces services ?',
        value: breakdown.subscriptions,
      });
    } else {
      insights.push({
        id: 'subs_danger',
        type: 'danger',
        category: 'subscriptions',
        title: 'Trop d\'abonnements !',
        message: `Vos abonnements : ${breakdown.subscriptions.toFixed(0)}€/mois (${ratios.subscriptions.toFixed(0)}%).`,
        recommendation: 'Annulez les abonnements peu utilisés. Économie potentielle importante.',
        value: breakdown.subscriptions,
      });
    }
  }

  // ===== CONSEIL GÉNÉRAL =====

  if (income > 0 && breakdown.savings > 0) {
    const monthsToEmergencyFund = (income * 3) / breakdown.savings;
    if (monthsToEmergencyFund <= 12) {
      insights.push({
        id: 'emergency_fund',
        type: 'info',
        category: 'general',
        title: 'Fonds d\'urgence',
        message: `À ce rythme, vous aurez 3 mois de salaire en ${monthsToEmergencyFund.toFixed(0)} mois.`,
        recommendation: 'Objectif : 3 à 6 mois de dépenses en épargne de précaution.',
      });
    }
  }

  return insights;
}

// ============================================
// SCORE DE SANTÉ FINANCIÈRE
// ============================================

function calculateHealthScore(
  ratios: { needs: number; wants: number; savings: number; subscriptions: number; housing: number },
  savings: number
): number {
  let score = 100;

  // Pénalités besoins (objectif 50%)
  if (ratios.needs > 50) {
    score -= Math.min(20, (ratios.needs - 50) * 2);
  }

  // Pénalités envies (objectif 30%)
  if (ratios.wants > 30) {
    score -= Math.min(15, (ratios.wants - 30) * 1.5);
  }

  // Bonus/malus épargne (objectif 20%)
  if (ratios.savings >= 20) {
    score += Math.min(10, (ratios.savings - 20) * 0.5);
  } else if (ratios.savings >= 0) {
    score -= (20 - ratios.savings) * 1.5;
  } else {
    // Déficit = grosse pénalité
    score -= 30 + Math.abs(ratios.savings);
  }

  // Pénalité logement (objectif 33%)
  if (ratios.housing > 33) {
    score -= Math.min(15, (ratios.housing - 33) * 1.5);
  }

  // Pénalité abonnements (objectif 5%)
  if (ratios.subscriptions > 5) {
    score -= Math.min(10, (ratios.subscriptions - 5) * 2);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ============================================
// FORMATAGE
// ============================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Bon';
  if (score >= 40) return 'À améliorer';
  return 'Critique';
}
