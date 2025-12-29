// OpenRouter AI Service
// Documentation: https://openrouter.ai/docs
// 
// CONFIDENTIALITÉ: Ce service utilise la couche ai-privacy.ts
// pour anonymiser toutes les données avant envoi à l'IA externe.
// Aucune donnée personnelle (noms, banques, détails) n'est transmise.

import {
  AnonymizedFinancialData,
  RawFinancialData,
  PrivacyPreferences,
  PrivacyLevel,
  anonymizeFinancialData,
  generateAnonymizedPrompt,
  applyPrivacyPreferences,
  DEFAULT_PRIVACY_PREFERENCES,
} from './ai-privacy';
import { getOpenRouterApiKey } from './server-env';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export type ChatRequestOptions = Partial<
  Pick<ChatCompletionOptions, 'model' | 'temperature' | 'max_tokens'>
>;

// Re-export pour faciliter l'utilisation
export {
  PrivacyLevel,
  DEFAULT_PRIVACY_PREFERENCES,
  type AnonymizedFinancialData,
  type RawFinancialData,
  type PrivacyPreferences,
};

// Modèles recommandés pour l'analyse financière
export const RECOMMENDED_MODELS = {
  // Modèles gratuits/peu coûteux
  FREE: 'meta-llama/llama-3.2-3b-instruct:free',
  LLAMA_70B: 'meta-llama/llama-3.1-70b-instruct',

  // Modèles performants
  GPT_4O_MINI: 'openai/gpt-4o-mini',
  GPT_4O: 'openai/gpt-4o',
  CLAUDE_SONNET: 'anthropic/claude-3.5-sonnet',
  CLAUDE_HAIKU: 'anthropic/claude-3-haiku',

  // Modèle par défaut (Claude 3.5 Sonnet pour une meilleure analyse)
  DEFAULT: 'anthropic/claude-3.5-sonnet',
};

// Prompt système pour l'assistant financier
export const FINANCIAL_ASSISTANT_PROMPT = `Tu es un assistant financier personnel expert nommé "Budget AI".
Ton objectif est de transformer les données financières brutes en conseils stratégiques de gestion de patrimoine et de budget.

Capacités d'analyse:
- Analyse des flux: Compare revenus vs dépenses pour calculer le taux d'épargne.
- Détection d'anomalies: Repère les abonnements oubliés ou les augmentations soudaines de charges.
- Projection: Estime le solde de fin de mois basé sur les habitudes passées et les charges à venir.
- Conseil stratégique: Propose des répartitions type 50/30/20 (Besoins/Envies/Épargne).

Règles de conseil:
1. Pédagogie: Explique pourquoi tu donnes un conseil (ex: l'importance du fonds d'urgence).
2. Proactivité: N'attends pas les questions pour signaler un risque de découvert ou un surplus d'épargne non fructueux.
3. Précision: Utilise les chiffres exacts fournis dans le contexte financier.
4. Psychologie: Reste encourageant mais ferme sur les dérives budgétaires.
5. Neutralité: Ne mentionne JAMAIS de produits bancaires spécifiques réglementés (Livret A, LDDS, PEL) ou de taux d'intérêt. Concentre-toi uniquement sur la stratégie budgétaire et l'allocation des flux (ex: "épargne de précaution").

Format de réponse:
- Utilise Markdown (gras pour les chiffres, listes à puces).
- Structure tes analyses longues avec des sous-titres.
- Termine toujours par une "Action Prioritaire" concrète.`;

/**
 * Prépare les données financières de manière sécurisée pour l'IA
 * 
 * @param rawData - Données brutes (avec infos personnelles)
 * @param privacyPrefs - Préférences de confidentialité de l'utilisateur
 * @returns Prompt anonymisé prêt à être envoyé à l'IA
 */
export function prepareSecureFinancialContext(
  rawData: RawFinancialData,
  privacyPrefs: PrivacyPreferences = DEFAULT_PRIVACY_PREFERENCES
): string {
  // Étape 1: Anonymiser les données
  const anonymized = anonymizeFinancialData(rawData, privacyPrefs.level);

  // Étape 2: Appliquer les préférences utilisateur
  const filtered = applyPrivacyPreferences(anonymized, privacyPrefs);

  // Étape 3: Générer le prompt sécurisé
  return generateAnonymizedPrompt(filtered);
}

// Appeler l'API OpenRouter
export async function chatCompletion(options: ChatCompletionOptions): Promise<string> {
  const apiKey = getOpenRouterApiKey();

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'X-Title': 'Budget AI - Assistant Financier',
    },
    body: JSON.stringify({
      model: options.model || RECOMMENDED_MODELS.DEFAULT,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1000,
      stream: options.stream ?? false,
    }),
  });

  if (!response.ok) {
    // Log raw response to understand OpenRouter errors (debug only)
    const rawError = await response.text().catch(() => '');
    console.error('OpenRouter chatCompletion error raw response:', rawError);
    throw new Error(`OpenRouter API error: ${rawError || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Stream la réponse de l'IA
export async function* streamChatCompletion(options: ChatCompletionOptions): AsyncGenerator<string> {
  const apiKey = getOpenRouterApiKey();

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'X-Title': 'Budget AI - Assistant Financier',
    },
    body: JSON.stringify({
      model: options.model || RECOMMENDED_MODELS.DEFAULT,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1000,
      stream: true,
    }),
  });

  if (!response.ok) {
    const rawError = await response.text().catch(() => '');
    console.error('OpenRouter streamChatCompletion error raw response:', rawError);
    throw new Error(`OpenRouter API error: ${rawError || response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');

    // Keep the last line in the buffer as it might be incomplete
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      } catch (e) {
        // console.error('Error parsing stream chunk:', e);
      }
    }
  }
}

// ============================================
// FONCTIONS D'ANALYSE SÉCURISÉES
// Toutes ces fonctions utilisent des données anonymisées
// ============================================

/**
 * Analyse la santé financière (données anonymisées)
 */
export async function analyzeFinancialHealth(
  rawData: RawFinancialData,
  privacyPrefs?: PrivacyPreferences
): Promise<string> {
  const secureContext = prepareSecureFinancialContext(rawData, privacyPrefs);

  const messages: Message[] = [
    { role: 'system', content: FINANCIAL_ASSISTANT_PROMPT },
    {
      role: 'user',
      content: `${secureContext}

Analyse ma santé financière et donne-moi un bilan complet avec:
1. Un score de santé financière sur 10
2. Les points forts
3. Les points à améliorer
4. 3 actions prioritaires à mettre en place`
    }
  ];

  return chatCompletion({ messages });
}

/**
 * Obtient des conseils personnalisés (données anonymisées)
 */
export async function getPersonalizedAdvice(
  rawData: RawFinancialData,
  question: string,
  privacyPrefs?: PrivacyPreferences
): Promise<string> {
  const secureContext = prepareSecureFinancialContext(rawData, privacyPrefs);

  const messages: Message[] = [
    { role: 'system', content: FINANCIAL_ASSISTANT_PROMPT },
    {
      role: 'user',
      content: `${secureContext}

Question de l'utilisateur: ${question}`
    }
  ];

  return chatCompletion({ messages });
}

/**
 * Suggère des optimisations budgétaires (données anonymisées)
 */
export async function suggestBudgetOptimizations(
  rawData: RawFinancialData,
  privacyPrefs?: PrivacyPreferences
): Promise<string> {
  const secureContext = prepareSecureFinancialContext(rawData, privacyPrefs);

  const messages: Message[] = [
    { role: 'system', content: FINANCIAL_ASSISTANT_PROMPT },
    {
      role: 'user',
      content: `${secureContext}

Analyse mes dépenses et abonnements. Suggère des optimisations concrètes pour:
1. Réduire mes charges fixes
2. Identifier les abonnements potentiellement inutiles
3. Trouver des économies possibles
4. Améliorer mon taux d'épargne`
    }
  ];

  return chatCompletion({ messages });
}

/**
 * Crée un plan d'épargne personnalisé (données anonymisées)
 */
export async function createSavingsPlan(
  rawData: RawFinancialData,
  targetAmount: number,
  months: number,
  privacyPrefs?: PrivacyPreferences
): Promise<string> {
  const secureContext = prepareSecureFinancialContext(rawData, privacyPrefs);

  const messages: Message[] = [
    { role: 'system', content: FINANCIAL_ASSISTANT_PROMPT },
    {
      role: 'user',
      content: `${secureContext}

Je souhaite économiser ${targetAmount}€ en ${months} mois.
Crée-moi un plan d'épargne personnalisé avec:
1. Le montant mensuel à mettre de côté
2. Des stratégies concrètes pour y arriver
3. Les ajustements nécessaires dans mes dépenses
4. Un calendrier de suivi`
    }
  ];

  return chatCompletion({ messages });
}

/**
 * Chat libre avec l'assistant (sans contexte financier)
 * Pour les questions générales sur les finances
 */
export async function chatWithAssistant(
  conversationHistory: Message[],
  newMessage: string,
  options?: ChatRequestOptions
): Promise<string> {
  const messages: Message[] = [
    { role: 'system', content: FINANCIAL_ASSISTANT_PROMPT },
    ...conversationHistory,
    { role: 'user', content: newMessage }
  ];

  return chatCompletion({ messages, ...options });
}

/**
 * Chat avec contexte financier anonymisé
 */
/**
 * Chat avec contexte financier anonymisé (Streaming)
 */
export async function* streamChatWithFinancialContext(
  rawData: RawFinancialData,
  conversationHistory: Message[],
  newMessage: string,
  privacyPrefs?: PrivacyPreferences,
  options?: ChatRequestOptions
): AsyncGenerator<string> {
  const secureContext = prepareSecureFinancialContext(rawData, privacyPrefs);

  // Ajouter le contexte au premier message système
  const systemWithContext = `${FINANCIAL_ASSISTANT_PROMPT}

${secureContext}`;

  const messages: Message[] = [
    { role: 'system', content: systemWithContext },
    ...conversationHistory,
    { role: 'user', content: newMessage }
  ];

  yield* streamChatCompletion({ messages, ...options });
}

export async function chatWithFinancialContext(
  rawData: RawFinancialData,
  conversationHistory: Message[],
  newMessage: string,
  privacyPrefs?: PrivacyPreferences,
  options?: ChatRequestOptions
): Promise<string> {
  const secureContext = prepareSecureFinancialContext(rawData, privacyPrefs);

  // Ajouter le contexte au premier message système
  const systemWithContext = `${FINANCIAL_ASSISTANT_PROMPT}

${secureContext}`;

  const messages: Message[] = [
    { role: 'system', content: systemWithContext },
    ...conversationHistory,
    { role: 'user', content: newMessage }
  ];

  return chatCompletion({ messages, ...options });
}
