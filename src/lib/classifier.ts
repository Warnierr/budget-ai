/**
 * Service de classification des transactions
 * 
 * Priorité de classification :
 * 1. Règles utilisateur (apprentissage)
 * 2. Patterns connus (base de données interne)
 * 3. IA OpenRouter (fallback)
 */

import { prisma } from './prisma';

// ============================================
// TYPES
// ============================================

export interface ClassificationResult {
  category: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'user_rule' | 'pattern' | 'ai' | 'unknown';
  isRecurring: boolean;
  recurringType: 'subscription' | 'income' | null;
}

export interface TransactionToClassify {
  label: string;
  amount: number;
  date: Date;
}

// ============================================
// PATTERNS CONNUS
// ============================================

interface PatternDefinition {
  patterns: string[];
  category: string;
  isRecurring: boolean;
  recurringType: 'subscription' | 'income' | null;
}

const KNOWN_PATTERNS: PatternDefinition[] = [
  // ABONNEMENTS (streaming, services)
  {
    patterns: ['SPOTIFY', 'NETFLIX', 'DISNEY', 'AMAZON PRIME', 'APPLE MUSIC', 'DEEZER', 'YOUTUBE PREMIUM', 'HBO', 'CANAL+', 'OCS'],
    category: 'Abonnements',
    isRecurring: true,
    recurringType: 'subscription',
  },
  {
    patterns: ['ORANGE', 'SFR', 'BOUYGUES', 'FREE MOBILE', 'SOSH', 'RED BY SFR', 'B&YOU'],
    category: 'Abonnements',
    isRecurring: true,
    recurringType: 'subscription',
  },
  {
    patterns: ['EDF', 'ENGIE', 'TOTAL ENERGIE', 'VEOLIA', 'SUEZ'],
    category: 'Logement',
    isRecurring: true,
    recurringType: 'subscription',
  },
  {
    patterns: ['ASSURANCE', 'MAIF', 'MACIF', 'AXA', 'ALLIANZ', 'GROUPAMA', 'MATMUT'],
    category: 'Abonnements',
    isRecurring: true,
    recurringType: 'subscription',
  },
  
  // REVENUS RECURRENTS
  {
    patterns: ['SALAIRE', 'VIREMENT SALAIRE', 'PAIE', 'REMUNERATION', 'VIR SEPA'],
    category: 'Salaire',
    isRecurring: true,
    recurringType: 'income',
  },
  {
    patterns: ['CAF', 'ALLOCATION', 'POLE EMPLOI', 'FRANCE TRAVAIL', 'RSA', 'APL'],
    category: 'Aides',
    isRecurring: true,
    recurringType: 'income',
  },
  
  // LOGEMENT
  {
    patterns: ['LOYER', 'RENT', 'BAIL', 'LOCATION'],
    category: 'Logement',
    isRecurring: true,
    recurringType: 'subscription',
  },
  
  // ALIMENTATION
  {
    patterns: ['CARREFOUR', 'LECLERC', 'LIDL', 'AUCHAN', 'INTERMARCHE', 'SUPER U', 'CASINO', 'MONOPRIX', 'FRANPRIX', 'PICARD', 'BIOCOOP', 'NATURALIA'],
    category: 'Alimentation',
    isRecurring: false,
    recurringType: null,
  },
  {
    patterns: ['BOULANGERIE', 'PATISSERIE', 'BOUCHERIE', 'PRIMEUR'],
    category: 'Alimentation',
    isRecurring: false,
    recurringType: null,
  },
  
  // RESTAURANTS / LIVRAISON
  {
    patterns: ['UBER EATS', 'DELIVEROO', 'JUST EAT', 'FRICHTI', 'GETIR'],
    category: 'Restaurants',
    isRecurring: false,
    recurringType: null,
  },
  {
    patterns: ['MCDONALDS', 'BURGER KING', 'KFC', 'SUBWAY', 'DOMINOS', 'PIZZA HUT', 'STARBUCKS'],
    category: 'Restaurants',
    isRecurring: false,
    recurringType: null,
  },
  
  // TRANSPORT
  {
    patterns: ['SNCF', 'RATP', 'NAVIGO', 'TISSEO', 'TCL', 'RTM', 'TAN'],
    category: 'Transport',
    isRecurring: false,
    recurringType: null,
  },
  {
    patterns: ['UBER', 'BOLT', 'KAPTEN', 'HEETCH', 'BLABLACAR'],
    category: 'Transport',
    isRecurring: false,
    recurringType: null,
  },
  {
    patterns: ['TOTAL', 'SHELL', 'BP', 'ESSO', 'AVIA', 'INTERMARCHE STATION', 'CARBURANT', 'ESSENCE'],
    category: 'Transport',
    isRecurring: false,
    recurringType: null,
  },
  {
    patterns: ['PARKING', 'STATIONNEMENT', 'VINCI PARK', 'EFFIA', 'INDIGO'],
    category: 'Transport',
    isRecurring: false,
    recurringType: null,
  },
  
  // SANTE
  {
    patterns: ['PHARMACIE', 'PHARMACY'],
    category: 'Sante',
    isRecurring: false,
    recurringType: null,
  },
  {
    patterns: ['DOCTOLIB', 'MEDECIN', 'DOCTEUR', 'DR ', 'HOPITAL', 'CLINIQUE', 'LABORATOIRE', 'LABO '],
    category: 'Sante',
    isRecurring: false,
    recurringType: null,
  },
  {
    patterns: ['MUTUELLE', 'CPAM', 'SECU', 'AMELI'],
    category: 'Sante',
    isRecurring: true,
    recurringType: 'subscription',
  },
  
  // SHOPPING
  {
    patterns: ['AMAZON', 'FNAC', 'DARTY', 'BOULANGER', 'CDISCOUNT', 'ALIEXPRESS', 'ZALANDO', 'ASOS', 'H&M', 'ZARA', 'DECATHLON', 'IKEA', 'LEROY MERLIN', 'CASTORAMA'],
    category: 'Shopping',
    isRecurring: false,
    recurringType: null,
  },
  
  // LOISIRS
  {
    patterns: ['CINEMA', 'UGC', 'PATHE', 'GAUMONT', 'MK2'],
    category: 'Loisirs',
    isRecurring: false,
    recurringType: null,
  },
  {
    patterns: ['THEATRE', 'CONCERT', 'SPECTACLE', 'MUSEE', 'EXPOSITION'],
    category: 'Loisirs',
    isRecurring: false,
    recurringType: null,
  },
  {
    patterns: ['SALLE DE SPORT', 'FITNESS', 'BASIC FIT', 'KEEPCOOL', 'NEONESS', 'GYM'],
    category: 'Loisirs',
    isRecurring: true,
    recurringType: 'subscription',
  },
  
  // VOYAGE
  {
    patterns: ['BOOKING', 'AIRBNB', 'HOTEL', 'IBIS', 'NOVOTEL', 'ACCOR', 'B&B HOTEL'],
    category: 'Voyage',
    isRecurring: false,
    recurringType: null,
  },
  {
    patterns: ['AIR FRANCE', 'EASYJET', 'RYANAIR', 'VUELING', 'TRANSAVIA', 'LUFTHANSA'],
    category: 'Voyage',
    isRecurring: false,
    recurringType: null,
  },
  
  // BANQUE / FRAIS
  {
    patterns: ['FRAIS BANCAIRE', 'COMMISSION', 'AGIOS', 'COTISATION CARTE'],
    category: 'Banque',
    isRecurring: false,
    recurringType: null,
  },
  {
    patterns: ['RETRAIT DAB', 'RETRAIT ESPECES', 'ATM'],
    category: 'Retrait',
    isRecurring: false,
    recurringType: null,
  },
];

// ============================================
// FONCTIONS DE CLASSIFICATION
// ============================================

/**
 * Normalise un libellé pour la comparaison
 */
function normalizeLabel(label: string): string {
  return label
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/[^A-Z0-9\s]/g, ' ')     // Garder que lettres/chiffres
    .replace(/\s+/g, ' ')             // Normaliser espaces
    .trim();
}

/**
 * Vérifie si un libellé correspond à un pattern
 */
function matchesPattern(label: string, pattern: string): boolean {
  const normalizedLabel = normalizeLabel(label);
  const normalizedPattern = normalizeLabel(pattern);
  return normalizedLabel.includes(normalizedPattern);
}

/**
 * Classification par patterns connus
 */
function classifyByPatterns(label: string): ClassificationResult | null {
  const normalizedLabel = normalizeLabel(label);
  
  for (const definition of KNOWN_PATTERNS) {
    for (const pattern of definition.patterns) {
      if (matchesPattern(label, pattern)) {
        return {
          category: definition.category,
          confidence: 'high',
          source: 'pattern',
          isRecurring: definition.isRecurring,
          recurringType: definition.recurringType,
        };
      }
    }
  }
  
  return null;
}

/**
 * Classification par règles utilisateur
 */
async function classifyByUserRules(
  userId: string,
  label: string
): Promise<ClassificationResult | null> {
  try {
    const rules = await prisma.importRule.findMany({
      where: { userId },
      orderBy: { usageCount: 'desc' },
    });
    
    const normalizedLabel = normalizeLabel(label);
    
    for (const rule of rules) {
      let matches = false;
      
      switch (rule.matchType) {
        case 'contains':
          matches = normalizedLabel.includes(normalizeLabel(rule.pattern));
          break;
        case 'startsWith':
          matches = normalizedLabel.startsWith(normalizeLabel(rule.pattern));
          break;
        case 'regex':
          try {
            const regex = new RegExp(rule.pattern, 'i');
            matches = regex.test(label);
          } catch {
            matches = false;
          }
          break;
        default:
          matches = normalizedLabel.includes(normalizeLabel(rule.pattern));
      }
      
      if (matches) {
        // Incrémenter le compteur d'utilisation
        await prisma.importRule.update({
          where: { id: rule.id },
          data: { usageCount: { increment: 1 } },
        });
        
        return {
          category: rule.category,
          confidence: 'high',
          source: 'user_rule',
          isRecurring: rule.isRecurring,
          recurringType: rule.recurringType as 'subscription' | 'income' | null,
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lecture règles utilisateur:', error);
    return null;
  }
}

/**
 * Classification par IA (OpenRouter)
 * Fallback quand les patterns ne matchent pas
 */
async function classifyByAI(label: string, amount: number): Promise<ClassificationResult | null> {
  try {
    // Vérifier si OpenRouter est configuré
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return null;
    }
    
    const isExpense = amount < 0;
    const categories = isExpense
      ? ['Alimentation', 'Transport', 'Logement', 'Loisirs', 'Sante', 'Shopping', 'Abonnements', 'Restaurants', 'Voyage', 'Banque', 'Autre']
      : ['Salaire', 'Aides', 'Remboursement', 'Vente', 'Autre'];
    
    const prompt = `Tu es un assistant de classification de transactions bancaires.
Analyse ce libellé de transaction et donne-moi la catégorie la plus appropriée.

Libellé: "${label}"
Montant: ${amount}€ (${isExpense ? 'dépense' : 'revenu'})

Catégories possibles: ${categories.join(', ')}

Réponds UNIQUEMENT avec le nom de la catégorie, rien d'autre.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });
    
    if (!response.ok) {
      console.error('Erreur OpenRouter:', response.status);
      return null;
    }
    
    const data = await response.json();
    const category = data.choices?.[0]?.message?.content?.trim();
    
    if (category && categories.includes(category)) {
      return {
        category,
        confidence: 'medium',
        source: 'ai',
        isRecurring: false,
        recurringType: null,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur classification IA:', error);
    return null;
  }
}

// ============================================
// FONCTION PRINCIPALE
// ============================================

/**
 * Classifie une transaction avec le système hybride
 * Priorité: règles utilisateur > patterns > IA > inconnu
 */
export async function classifyTransaction(
  userId: string,
  transaction: TransactionToClassify
): Promise<ClassificationResult> {
  const { label, amount } = transaction;
  
  // 1. Vérifier les règles utilisateur (priorité max)
  const userRuleResult = await classifyByUserRules(userId, label);
  if (userRuleResult) {
    return userRuleResult;
  }
  
  // 2. Vérifier les patterns connus
  const patternResult = classifyByPatterns(label);
  if (patternResult) {
    return patternResult;
  }
  
  // 3. Appeler l'IA (fallback)
  const aiResult = await classifyByAI(label, amount);
  if (aiResult) {
    return aiResult;
  }
  
  // 4. Inconnu
  return {
    category: amount >= 0 ? 'Autre revenu' : 'Autre',
    confidence: 'low',
    source: 'unknown',
    isRecurring: false,
    recurringType: null,
  };
}

/**
 * Classifie un batch de transactions
 */
export async function classifyTransactions(
  userId: string,
  transactions: TransactionToClassify[]
): Promise<ClassificationResult[]> {
  const results: ClassificationResult[] = [];
  
  for (const transaction of transactions) {
    const result = await classifyTransaction(userId, transaction);
    results.push(result);
  }
  
  return results;
}

/**
 * Crée une règle utilisateur à partir d'une correction
 */
export async function learnFromCorrection(
  userId: string,
  originalLabel: string,
  category: string,
  isRecurring: boolean = false,
  recurringType: 'subscription' | 'income' | null = null
): Promise<void> {
  try {
    // Extraire un pattern du libellé (premiers mots significatifs)
    const words = normalizeLabel(originalLabel).split(' ').filter(w => w.length > 2);
    const pattern = words.slice(0, 3).join(' '); // 3 premiers mots
    
    if (!pattern) return;
    
    // Vérifier si la règle existe déjà
    const existingRule = await prisma.importRule.findFirst({
      where: {
        userId,
        pattern: { contains: pattern },
      },
    });
    
    if (existingRule) {
      // Mettre à jour la règle existante
      await prisma.importRule.update({
        where: { id: existingRule.id },
        data: {
          category,
          isRecurring,
          recurringType,
          usageCount: { increment: 1 },
        },
      });
    } else {
      // Créer une nouvelle règle
      await prisma.importRule.create({
        data: {
          userId,
          pattern,
          matchType: 'contains',
          category,
          isRecurring,
          recurringType,
        },
      });
    }
  } catch (error) {
    console.error('Erreur création règle:', error);
  }
}
