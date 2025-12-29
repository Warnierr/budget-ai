import { NextResponse } from 'next/server';
import { getOpenRouterApiKey } from '@/lib/server-env';

export async function GET() {
    try {
        const apiKey = getOpenRouterApiKey();
        if (!apiKey || apiKey.includes('%')) {
            return NextResponse.json({ error: 'Clé API manquante ou invalide' }, { status: 500 });
        }
        // Simple request to OpenRouter health endpoint (if exists) – we'll just ping the base URL
        const res = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'GET',
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) {
            const txt = await res.text();
            return NextResponse.json({ error: `OpenRouter error ${res.status}`, detail: txt }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json({ message: 'Clé API fonctionnelle', models: data }, { status: 200 });
    } catch (e) {
        console.error('Ping IA error:', e);
        return NextResponse.json({ error: 'Erreur interne', detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
}
