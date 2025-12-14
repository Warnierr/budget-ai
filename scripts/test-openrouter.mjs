#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import process from 'process';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_KEY_FILE = path.join(process.cwd(), 'config', 'openrouter.key');
const PLACEHOLDER_HINTS = ['%openrouter_api_key%', 'votre-cle', 'your-key'];

function normalize(value) {
  return value?.trim() ?? '';
}

function looksLikePlaceholder(value) {
  if (!value) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_HINTS.some((hint) => lower.includes(hint));
}

function resolveKeyFilePath() {
  if (process.env.OPENROUTER_API_KEY_FILE) {
    return path.isAbsolute(process.env.OPENROUTER_API_KEY_FILE)
      ? process.env.OPENROUTER_API_KEY_FILE
      : path.join(process.cwd(), process.env.OPENROUTER_API_KEY_FILE);
  }
  return DEFAULT_KEY_FILE;
}

function loadApiKey() {
  const envKey = normalize(process.env.OPENROUTER_API_KEY);
  if (envKey && !looksLikePlaceholder(envKey)) {
    return { key: envKey, source: 'OPENROUTER_API_KEY' };
  }

  const keyFilePath = resolveKeyFilePath();
  if (fs.existsSync(keyFilePath)) {
    const fileKey = normalize(fs.readFileSync(keyFilePath, 'utf8'));
    if (fileKey && !looksLikePlaceholder(fileKey)) {
      return { key: fileKey, source: keyFilePath };
    }
  }

  throw new Error(
    `Impossible de trouver la clé OpenRouter. Ajoutez OPENROUTER_API_KEY dans .env.local ou créez ${keyFilePath}.`,
  );
}

async function main() {
  try {
    const { key, source } = loadApiKey();
    console.log(`🔐 Clé chargée depuis ${source}. Envoi d'une requête de test...`);

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'Budget AI - Test CLI',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          { role: 'system', content: 'Tu es un assistant amical qui réponds en français.' },
          { role: 'user', content: 'Simple test de connexion. Réponds juste par "pong".' },
        ],
        max_tokens: 16,
      }),
    });

    const raw = await response.text();
    if (!response.ok) {
      console.error('❌ Échec de la requête OpenRouter:', raw || response.statusText);
      process.exit(1);
    }

    const data = JSON.parse(raw);
    const content = data?.choices?.[0]?.message?.content?.trim();
    console.log('✅ Réponse OpenRouter:', content || '(réponse vide)');
  } catch (error) {
    console.error('❌ Test OpenRouter impossible:', error.message || error);
    process.exit(1);
  }
}

main();

