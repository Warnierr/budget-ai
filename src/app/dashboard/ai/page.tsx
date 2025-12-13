'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Shield, 
  Brain,
  TrendingUp,
  PiggyBank,
  Lightbulb,
  Settings,
  Loader2,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PrivacyPreferences {
  level: 'minimal' | 'standard' | 'detailed';
  shareAccountTypes: boolean;
  shareExpenseCategories: boolean;
  shareSubscriptions: boolean;
  shareGoals: boolean;
  shareTrends: boolean;
}

const QUICK_PROMPTS = [
  {
    icon: TrendingUp,
    label: 'Analyse financière',
    prompt: 'Analyse ma santé financière et donne-moi un score sur 10 avec des conseils.',
  },
  {
    icon: PiggyBank,
    label: 'Plan d\'épargne',
    prompt: 'Comment puis-je améliorer mon taux d\'épargne ce mois-ci ?',
  },
  {
    icon: Lightbulb,
    label: 'Optimiser mes dépenses',
    prompt: 'Quels abonnements ou dépenses pourrais-je réduire ?',
  },
  {
    icon: Brain,
    label: 'Conseil personnalisé',
    prompt: 'Quel est le meilleur conseil financier pour ma situation actuelle ?',
  },
];

const DEFAULT_PRIVACY: PrivacyPreferences = {
  level: 'standard',
  shareAccountTypes: true,
  shareExpenseCategories: true,
  shareSubscriptions: true,
  shareGoals: true,
  shareTrends: true,
};

type ModelOption = {
  value: string;
  label: string;
  tagline: string;
  cost: string;
  badge?: string;
};

const MODEL_OPTIONS: readonly ModelOption[] = [
  {
    value: 'meta-llama/llama-3.2-3b-instruct:free',
    label: 'Llama 3.2 3B (gratuit)',
    tagline: 'Idéal pour tester et pour les réponses rapides sans coût.',
    cost: '💸 Gratuit',
    badge: 'IA conseillée',
  },
  {
    value: 'openai/gpt-4o-mini',
    label: 'GPT-4o mini',
    tagline: 'Très bon compromis logique/créativité pour plans détaillés.',
    cost: '⚡ Premium OpenAI',
  },
  {
    value: 'anthropic/claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet',
    tagline: 'Excellente rédaction FR et analyses longues.',
    cost: '🧠 Premium Anthropic',
  },
  {
    value: 'meta-llama/llama-3.1-70b-instruct',
    label: 'Llama 3.1 70B',
    tagline: 'Modèle open-source plus puissant pour scénarios complexes.',
    cost: '⚙️ Crédit OpenRouter',
  },
] as const;

type ModelValue = ModelOption['value'];

export default function AIAssistantPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const [privacy, setPrivacy] = useState<PrivacyPreferences>(DEFAULT_PRIVACY);
  const [selectedModel, setSelectedModel] = useState<ModelValue>(MODEL_OPTIONS[0].value);
  const activeModel = MODEL_OPTIONS.find(model => model.value === selectedModel) ?? MODEL_OPTIONS[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message de bienvenue
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `👋 Bonjour ! Je suis **Budget AI**, ton assistant financier personnel.

Je peux t'aider à :
- 📊 Analyser ta situation financière
- 💡 Optimiser tes dépenses et abonnements
- 🎯 Atteindre tes objectifs d'épargne
- 📈 Améliorer ta gestion budgétaire

🔒 **Ta vie privée est protégée** : tes données sont anonymisées avant d'être analysées. Aucun nom, banque ou détail personnel n'est partagé.

Pose-moi une question ou utilise les suggestions rapides ci-dessous !`,
        timestamp: new Date(),
      }]);
    }
  }, [messages.length]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
          includeFinancialContext: includeContext,
          privacyPreferences: privacy,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur de communication');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de contacter l\'assistant',
        variant: 'destructive',
      });
      
      // Message d'erreur dans le chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Désolé, je n\'ai pas pu traiter ta demande. Vérifie que le service IA est bien configuré (clé API OpenRouter).',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearConversation = () => {
    setMessages([]);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Lists
        if (line.startsWith('- ')) {
          return `<li key="${i}">${line.slice(2)}</li>`;
        }
        if (line.match(/^\d+\. /)) {
          return `<li key="${i}">${line.replace(/^\d+\. /, '')}</li>`;
        }
        return line ? `<p key="${i}">${line}</p>` : '<br />';
      })
      .join('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-600" />
              Assistant IA
            </h1>
            <p className="text-gray-600 mt-1">Ton conseiller financier personnel</p>
          </div>
          <div className="w-full md:w-80">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
              <Settings className="h-4 w-4" />
              Choix du modèle IA
            </label>
            <div className="flex flex-col gap-1">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelValue)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {MODEL_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{activeModel.cost}</span>
                {activeModel.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] uppercase tracking-wide">
                    {activeModel.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {activeModel.tagline}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrivacySettings(!showPrivacySettings)}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Confidentialité
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearConversation}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Nouvelle conversation
          </Button>
        </div>
      </div>

      {/* Privacy Settings Panel */}
      {showPrivacySettings && (
        <Card className="mb-4 border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Paramètres de confidentialité
            </CardTitle>
            <CardDescription>
              Contrôle quelles données anonymisées sont partagées avec l&apos;IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {includeContext ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <Label>Inclure mon contexte financier</Label>
              </div>
              <Switch
                checked={includeContext}
                onCheckedChange={setIncludeContext}
              />
            </div>
            
            {includeContext && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t">
                {[
                  { key: 'shareAccountTypes', label: 'Types de comptes' },
                  { key: 'shareExpenseCategories', label: 'Catégories dépenses' },
                  { key: 'shareSubscriptions', label: 'Abonnements' },
                  { key: 'shareGoals', label: 'Objectifs' },
                  { key: 'shareTrends', label: 'Tendances' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Switch
                      id={key}
                      checked={privacy[key as keyof PrivacyPreferences] as boolean}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                    <Label htmlFor={key} className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
              🔒 Tes données sont <strong>anonymisées</strong> avant envoi. 
              Aucun nom de compte, banque ou transaction n&apos;est transmis à l&apos;IA.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              onClick={() => sendMessage(prompt.prompt)}
              disabled={isLoading}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
            >
              <prompt.icon className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">{prompt.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                <span className="text-gray-600">Réflexion en cours...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Form */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pose ta question financière..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            <Sparkles className="h-3 w-3 inline mr-1" />
            Propulsé par OpenRouter • Tes données restent privées et anonymisées
          </p>
        </div>
      </Card>
    </div>
  );
}

