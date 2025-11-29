/**
 * AI Privacy Layer - Protection des données personnelles
 * 
 * Stratégie de confidentialité:
 * 1. ANONYMISATION - Aucun nom réel n'est envoyé à l'IA
 * 2. AGRÉGATION - Seuls les totaux et moyennes sont partagés
 * 3. CATÉGORISATION - Les transactions sont groupées par catégorie
 * 4. CONTRÔLE UTILISATEUR - L'utilisateur choisit le niveau de détail
 * 
 * Les données restent 100% locales (dans ta base de données).
 * Seul un "résumé anonymisé" est envoyé à l'IA pour obtenir des conseils.
 */

// Niveaux de confidentialité
export enum PrivacyLevel {
  MINIMAL = 'minimal',     // Uniquement totaux globaux
  STANDARD = 'standard',   // Totaux + catégories agrégées
  DETAILED = 'detailed',   // Catégories détaillées (sans noms)
}

// Types de données brutes (stockées localement)
export interface RawFinancialData {
  accounts: Array<{
    id: string;
    name: string;           // Ex: "Compte Société Générale" - JAMAIS envoyé
    type: string;           // Ex: "checking" - OK à envoyer
    balance: number;
    bank?: string;          // Ex: "Société Générale" - JAMAIS envoyé
  }>;
  incomes: Array<{
    id: string;
    name: string;           // Ex: "Salaire ACME Corp" - JAMAIS envoyé
    amount: number;
    date: string;
    category?: string;      // Ex: "Salaire" - OK à envoyer
    isRecurring: boolean;
  }>;
  expenses: Array<{
    id: string;
    name: string;           // Ex: "Restaurant Le Petit Bistrot" - JAMAIS envoyé
    amount: number;
    date: string;
    category?: string;      // Ex: "Restauration" - OK à envoyer
  }>;
  subscriptions: Array<{
    id: string;
    name: string;           // Ex: "Netflix" - Anonymisé en "Streaming"
    amount: number;
    frequency: string;
    category?: string;
  }>;
  goals: Array<{
    id: string;
    name: string;           // Ex: "Vacances Maldives" - Anonymisé en "Voyage"
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
  }>;
  summary?: {
    monthLabel: string;
    currentMonthIncome: number;
    currentMonthExpenses: number;
    fixedCharges: number;
    freeToSpend: number;
  };
  upcomingIncomes?: Array<{
    amount: number;
    date: string;
    category?: string;
    isRecurring?: boolean;
  }>;
  upcomingExpenses?: Array<{
    amount: number;
    date: string;
    category?: string;
  }>;
}

// Données anonymisées envoyées à l'IA
export interface AnonymizedFinancialData {
  // Métriques globales (aucune donnée personnelle)
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  summary?: {
    monthLabel: string;
    fixedCharges: number;
    freeToSpend: number;
  };
  
  // Répartition par type de compte (sans noms)
  accountTypes: Array<{
    type: string;           // "checking", "savings", "investment", "crypto"
    count: number;
    totalBalance: number;
  }>;
  
  // Dépenses par catégorie (agrégées)
  expensesByCategory: Array<{
    category: string;       // "Alimentation", "Transport", etc.
    amount: number;
    percentage: number;
  }>;
  
  // Revenus par type (agrégés)
  incomesByType: Array<{
    type: string;           // "Salaire", "Freelance", "Investissement"
    amount: number;
    isRecurring: boolean;
  }>;
  
  // Abonnements par catégorie (anonymisés)
  subscriptionsByCategory: Array<{
    category: string;       // "Streaming", "Télécom", "Logiciels"
    count: number;
    monthlyTotal: number;
  }>;
  upcomingIncomes: Array<{
    amount: number;
    date: string;
    category: string;
  }>;
  upcomingExpenses: Array<{
    amount: number;
    date: string;
    category: string;
  }>;
  
  // Objectifs (anonymisés)
  goals: Array<{
    category: string;       // "Épargne", "Voyage", "Achat", "Urgence"
    targetAmount: number;
    currentAmount: number;
    progressPercent: number;
    hasDeadline: boolean;
  }>;
  
  // Tendances (calculées localement)
  trends: {
    incomeChange: number;       // % par rapport au mois précédent
    expenseChange: number;
    savingsChange: number;
    topExpenseCategory: string;
  };
}

// Mapping des noms d'abonnements vers des catégories génériques
const SUBSCRIPTION_CATEGORY_MAP: Record<string, string> = {
  // Streaming
  'netflix': 'Streaming vidéo',
  'disney': 'Streaming vidéo',
  'amazon prime': 'Streaming vidéo',
  'canal': 'Streaming vidéo',
  'hbo': 'Streaming vidéo',
  'apple tv': 'Streaming vidéo',
  'spotify': 'Streaming musique',
  'deezer': 'Streaming musique',
  'apple music': 'Streaming musique',
  'youtube': 'Streaming vidéo',
  
  // Télécom
  'orange': 'Télécom',
  'sfr': 'Télécom',
  'bouygues': 'Télécom',
  'free': 'Télécom',
  'sosh': 'Télécom',
  'red': 'Télécom',
  
  // Logiciels
  'adobe': 'Logiciels',
  'microsoft': 'Logiciels',
  'notion': 'Logiciels',
  'dropbox': 'Logiciels',
  'google': 'Logiciels',
  'icloud': 'Logiciels',
  
  // Fitness
  'basic fit': 'Sport & Fitness',
  'fitness': 'Sport & Fitness',
  'gym': 'Sport & Fitness',
  
  // Autres
  'assurance': 'Assurance',
  'mutuelle': 'Santé',
  'edf': 'Énergie',
  'engie': 'Énergie',
};

// Mapping des noms d'objectifs vers des catégories génériques
const GOAL_CATEGORY_MAP: Record<string, string> = {
  'vacances': 'Voyage',
  'voyage': 'Voyage',
  'voiture': 'Achat véhicule',
  'auto': 'Achat véhicule',
  'maison': 'Immobilier',
  'appartement': 'Immobilier',
  'apport': 'Immobilier',
  'urgence': 'Fonds d\'urgence',
  'sécurité': 'Fonds d\'urgence',
  'épargne': 'Épargne générale',
  'retraite': 'Retraite',
  'études': 'Éducation',
  'formation': 'Éducation',
  'mariage': 'Événement',
  'bébé': 'Famille',
  'enfant': 'Famille',
};

/**
 * Anonymise les données financières avant envoi à l'IA
 */
export function anonymizeFinancialData(
  rawData: RawFinancialData,
  privacyLevel: PrivacyLevel = PrivacyLevel.STANDARD
): AnonymizedFinancialData {
  // Calculs de base
  const totalBalance = rawData.accounts.reduce((sum, a) => sum + a.balance, 0);
  const monthlyIncome = rawData.summary?.currentMonthIncome ?? rawData.incomes.reduce((sum, i) => sum + i.amount, 0);
  const monthlyExpenses = rawData.summary?.currentMonthExpenses ?? rawData.expenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsRate = monthlyIncome > 0 
    ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) 
    : 0;
  const summaryInfo = rawData.summary
    ? {
        monthLabel: rawData.summary.monthLabel,
        fixedCharges: rawData.summary.fixedCharges,
        freeToSpend: rawData.summary.freeToSpend,
      }
    : undefined;

  // Niveau MINIMAL - Uniquement les totaux
  if (privacyLevel === PrivacyLevel.MINIMAL) {
    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      summary: summaryInfo,
      accountTypes: [],
      expensesByCategory: [],
      incomesByType: [],
      subscriptionsByCategory: [],
      upcomingIncomes: [],
      upcomingExpenses: [],
      goals: [],
      trends: {
        incomeChange: 0,
        expenseChange: 0,
        savingsChange: 0,
        topExpenseCategory: 'Non communiqué',
      },
    };
  }

  // Agrégation par type de compte
  const accountTypes = Object.entries(
    rawData.accounts.reduce((acc, account) => {
      const type = account.type || 'other';
      if (!acc[type]) acc[type] = { count: 0, totalBalance: 0 };
      acc[type].count++;
      acc[type].totalBalance += account.balance;
      return acc;
    }, {} as Record<string, { count: number; totalBalance: number }>)
  ).map(([type, data]) => ({ type, ...data }));

  // Agrégation des dépenses par catégorie
  const expensesByCategory = Object.entries(
    rawData.expenses.reduce((acc, expense) => {
      const category = expense.category || 'Autres';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, amount]) => ({
    category,
    amount,
    percentage: monthlyExpenses > 0 ? Math.round((amount / monthlyExpenses) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  // Agrégation des revenus par type
  const incomesByType = Object.entries(
    rawData.incomes.reduce((acc, income) => {
      const type = income.category || 'Autres';
      if (!acc[type]) acc[type] = { amount: 0, isRecurring: false };
      acc[type].amount += income.amount;
      acc[type].isRecurring = acc[type].isRecurring || income.isRecurring;
      return acc;
    }, {} as Record<string, { amount: number; isRecurring: boolean }>)
  ).map(([type, data]) => ({ type, ...data }));

  // Anonymisation des abonnements
  const subscriptionsByCategory = Object.entries(
    rawData.subscriptions.reduce((acc, sub) => {
      const category = categorizeSubscription(sub.name);
      if (!acc[category]) acc[category] = { count: 0, monthlyTotal: 0 };
      acc[category].count++;
      acc[category].monthlyTotal += sub.frequency === 'yearly' ? sub.amount / 12 : sub.amount;
      return acc;
    }, {} as Record<string, { count: number; monthlyTotal: number }>)
  ).map(([category, data]) => ({ category, ...data }));

  // Anonymisation des objectifs
  const goals = rawData.goals.map(goal => ({
    category: categorizeGoal(goal.name),
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    progressPercent: goal.targetAmount > 0 
      ? Math.round((goal.currentAmount / goal.targetAmount) * 100) 
      : 0,
    hasDeadline: !!goal.deadline,
  }));

  // Calcul des tendances
  const topExpenseCategory = expensesByCategory[0]?.category || 'Aucune';

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    summary: summaryInfo,
    accountTypes,
    expensesByCategory: privacyLevel === PrivacyLevel.DETAILED 
      ? expensesByCategory 
      : expensesByCategory.slice(0, 5), // Top 5 seulement en mode standard
    incomesByType,
    subscriptionsByCategory,
    upcomingIncomes: (rawData.upcomingIncomes || []).map(income => ({
      amount: income.amount,
      date: income.date,
      category: income.category || 'Revenu planifié',
    })),
    upcomingExpenses: (rawData.upcomingExpenses || []).map(expense => ({
      amount: expense.amount,
      date: expense.date,
      category: expense.category || 'Dépense planifiée',
    })),
    goals,
    trends: {
      incomeChange: 0, // TODO: Calculer avec l'historique
      expenseChange: 0,
      savingsChange: 0,
      topExpenseCategory,
    },
  };
}

/**
 * Catégorise un abonnement de manière anonyme
 */
function categorizeSubscription(name: string): string {
  const nameLower = name.toLowerCase();
  
  for (const [keyword, category] of Object.entries(SUBSCRIPTION_CATEGORY_MAP)) {
    if (nameLower.includes(keyword)) {
      return category;
    }
  }
  
  return 'Autre abonnement';
}

/**
 * Catégorise un objectif de manière anonyme
 */
function categorizeGoal(name: string): string {
  const nameLower = name.toLowerCase();
  
  for (const [keyword, category] of Object.entries(GOAL_CATEGORY_MAP)) {
    if (nameLower.includes(keyword)) {
      return category;
    }
  }
  
  return 'Objectif personnel';
}

/**
 * Génère le prompt pour l'IA avec les données anonymisées
 */
export function generateAnonymizedPrompt(data: AnonymizedFinancialData): string {
  const formatCurrency = (n: number) => `${n.toFixed(2)}€`;

  let prompt = `
📊 SITUATION FINANCIÈRE ANONYMISÉE:

💰 Vue d'ensemble:
- Patrimoine disponible (encaissé aujourd'hui): ${formatCurrency(data.totalBalance)}
- Revenus mensuels: ${formatCurrency(data.monthlyIncome)}
- Dépenses mensuelles: ${formatCurrency(data.monthlyExpenses)}
- Taux d'épargne: ${data.savingsRate}%
`;

  if (data.summary) {
    prompt += `
🧾 Résumé ${data.summary.monthLabel}:
- Charges fixes: ${formatCurrency(data.summary.fixedCharges)}
- Reste à vivre estimé: ${formatCurrency(data.summary.freeToSpend)}
`;
  }

  if (data.accountTypes.length > 0) {
    prompt += `
🏦 Répartition des comptes:
${data.accountTypes.map(a => `- ${a.count} compte(s) ${a.type}: ${formatCurrency(a.totalBalance)}`).join('\n')}
`;
  }

  if (data.expensesByCategory.length > 0) {
    prompt += `
📉 Dépenses par catégorie:
${data.expensesByCategory.map(e => `- ${e.category}: ${formatCurrency(e.amount)} (${e.percentage}%)`).join('\n')}
`;
  }

  if (data.subscriptionsByCategory.length > 0) {
    const totalSubs = data.subscriptionsByCategory.reduce((sum, s) => sum + s.monthlyTotal, 0);
    prompt += `
📅 Abonnements (${formatCurrency(totalSubs)}/mois):
${data.subscriptionsByCategory.map(s => `- ${s.category}: ${s.count} abo(s), ${formatCurrency(s.monthlyTotal)}/mois`).join('\n')}
`;
  }

  if (data.upcomingIncomes.length > 0) {
    prompt += `
📆 Revenus confirmés à venir (top 5):
${data.upcomingIncomes.slice(0, 5).map(item => `- ${item.category}: ${formatCurrency(item.amount)} le ${new Date(item.date).toLocaleDateString('fr-FR')}`).join('\n')}

⚠️ Ces revenus ne sont pas encore encaissés : ne pas les additionner au patrimoine disponible.
`;
  }

  if (data.upcomingExpenses.length > 0) {
    prompt += `
⚠️ Dépenses planifiées (top 5):
${data.upcomingExpenses.slice(0, 5).map(item => `- ${item.category}: ${formatCurrency(item.amount)} le ${new Date(item.date).toLocaleDateString('fr-FR')}`).join('\n')}
`;
  }

  if (data.goals.length > 0) {
    prompt += `
🎯 Objectifs financiers:
${data.goals.map(g => `- ${g.category}: ${g.progressPercent}% atteint (${formatCurrency(g.currentAmount)}/${formatCurrency(g.targetAmount)})`).join('\n')}
`;
  }

  prompt += `
📈 Tendance principale: Catégorie de dépense #1 = ${data.trends.topExpenseCategory}
`;

  return prompt;
}
/**
 * Préférences de confidentialité utilisateur
 */
export interface PrivacyPreferences {
  level: PrivacyLevel;
  shareAccountTypes: boolean;
  shareExpenseCategories: boolean;
  shareSubscriptions: boolean;
  shareGoals: boolean;
  shareTrends: boolean;
}

export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  level: PrivacyLevel.STANDARD,
  shareAccountTypes: true,
  shareExpenseCategories: true,
  shareSubscriptions: true,
  shareGoals: true,
  shareTrends: true,
};

/**
 * Applique les préférences de confidentialité
 */
export function applyPrivacyPreferences(
  data: AnonymizedFinancialData,
  prefs: PrivacyPreferences
): AnonymizedFinancialData {
  return {
    ...data,
    accountTypes: prefs.shareAccountTypes ? data.accountTypes : [],
    expensesByCategory: prefs.shareExpenseCategories ? data.expensesByCategory : [],
    subscriptionsByCategory: prefs.shareSubscriptions ? data.subscriptionsByCategory : [],
    goals: prefs.shareGoals ? data.goals : [],
    trends: prefs.shareTrends ? data.trends : {
      incomeChange: 0,
      expenseChange: 0,
      savingsChange: 0,
      topExpenseCategory: 'Non communiqué',
    },
  };
}

