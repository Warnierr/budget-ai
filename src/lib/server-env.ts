import "server-only";
import fs from "fs";
import path from "path";

let cachedOpenRouterKey: string | null = null;

const PLACEHOLDER_SNIPPETS = [
  "%openrouter_api_key%",
  "votre-cle",
  "your-key",
  "openrouter api key",
];

function normalizeKey(value?: string | null): string {
  return value?.replace(/\s+/g, "") ?? "";
}

function looksLikePlaceholder(value: string): boolean {
  if (!value) return true;
  if (value.includes("%")) return true; // Catch Windows unresolved vars
  const normalized = value.toLowerCase();
  return PLACEHOLDER_SNIPPETS.some((snippet) => normalized.includes(snippet));
}

function resolveKeyFilePath(): string {
  if (process.env.OPENROUTER_API_KEY_FILE) {
    return path.isAbsolute(process.env.OPENROUTER_API_KEY_FILE)
      ? process.env.OPENROUTER_API_KEY_FILE
      : path.join(process.cwd(), process.env.OPENROUTER_API_KEY_FILE);
  }
  return path.join(process.cwd(), "config", "openrouter.key");
}

function readKeyFromFile(): { key: string; path: string } {
  const filePath = resolveKeyFilePath();

  if (!fs.existsSync(filePath)) {
    return { key: "", path: filePath };
  }

  const raw = fs.readFileSync(filePath, "utf8");
  return { key: normalizeKey(raw), path: filePath };
}

export function getOpenRouterApiKey(): string {
  if (cachedOpenRouterKey) {
    return cachedOpenRouterKey;
  }

  const envKey = normalizeKey(process.env.OPENROUTER_API_KEY);
  if (envKey && !looksLikePlaceholder(envKey)) {
    cachedOpenRouterKey = envKey;
    return envKey;
  }

  const { key: fileKey, path: filePath } = readKeyFromFile();
  if (fileKey && !looksLikePlaceholder(fileKey)) {
    cachedOpenRouterKey = fileKey;
    return fileKey;
  }

  const triedSources = [
    envKey ? "OPENROUTER_API_KEY (.env / variables système)" : null,
    fileKey ? filePath : null,
  ]
    .filter(Boolean)
    .join(", ") || "aucune source détectée";

  throw new Error(
    [
      "OPENROUTER_API_KEY introuvable.",
      `Sources vérifiées: ${triedSources}`,
      'Ajoutez la clé dans .env.local (OPENROUTER_API_KEY="sk-...")',
      `ou créez ${filePath} contenant votre clé.`,
    ].join("\n")
  );
}

export function resetOpenRouterApiKeyCache(): void {
  cachedOpenRouterKey = null;
}
