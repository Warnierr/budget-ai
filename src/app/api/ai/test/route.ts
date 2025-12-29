import { NextResponse, NextRequest } from 'next/server';
import { chatWithFinancialContext } from '@/lib/openrouter';
import { getOpenRouterApiKey } from '@/lib/server-env';

// Simple test endpoint that bypasses authentication and uses dummy financial data
export async function POST(req: NextRequest) {
    try {
        const apiKey = getOpenRouterApiKey();
        if (!apiKey || apiKey.includes('%')) {
            return NextResponse.json({ error: 'Clé API manquante ou invalide' }, { status: 500 });
        }
        const body = await req.json().catch(() => ({}));
        const { message = 'Analyse ma santé financière' } = body;
        // Minimal dummy financial data (empty but valid shape)
        const rawData = {
            accounts: [],
            incomes: [],
            expenses: [],
            subscriptions: [],
            goals: [],
            summary: { monthLabel: '', currentMonthIncome: 0, currentMonthExpenses: 0, fixedCharges: 0, freeToSpend: 0 },
            upcomingIncomes: [],
            upcomingExpenses: [],
        };
        const response = await chatWithFinancialContext(
            rawData,
            [], // empty conversation history
            message,
            undefined, // default privacy preferences
            { model: 'anthropic/claude-3.5-sonnet' }
        );
        return NextResponse.json({ response }, { status: 200 });
    } catch (e) {
        console.error('Test AI error:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
}
