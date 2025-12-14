/**
 * Utilitaires pour le parsing CSV
 */

/**
 * Parse un montant depuis une string
 * Gere les formats: "1234.56", "1 234,56", "-1234.56", "(1234.56)"
 */
export function parseAmount(value: string): number {
  if (!value || value.trim() === '') return 0;
  
  let cleaned = value.trim();
  
  // Gerer le format (1234.56) = negatif
  const isParenthesesNegative = cleaned.startsWith('(') && cleaned.endsWith(')');
  if (isParenthesesNegative) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Supprimer les espaces (separateurs de milliers)
  cleaned = cleaned.replace(/\s/g, '');
  
  // Detecter le separateur decimal
  // Si on a "1.234,56" -> format europeen
  // Si on a "1,234.56" -> format americain
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  
  if (lastComma > lastDot) {
    // Format europeen: virgule = decimal
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // Format americain ou simple: point = decimal
    cleaned = cleaned.replace(/,/g, '');
  }
  
  // Supprimer les symboles de devise
  cleaned = cleaned.replace(/[€$£¥]/g, '');
  
  const amount = parseFloat(cleaned);
  
  if (isNaN(amount)) return 0;
  
  return isParenthesesNegative ? -Math.abs(amount) : amount;
}

/**
 * Parse une date depuis une string
 * Formats supportes: DD/MM/YYYY, YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY
 */
export function parseDate(value: string): Date | null {
  if (!value || value.trim() === '') return null;
  
  const cleaned = value.trim();
  
  // Format ISO: YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS
  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
    const date = new Date(cleaned);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Format europeen: DD/MM/YYYY ou DD-MM-YYYY
  const euMatch = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (euMatch) {
    const [, day, month, year] = euMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Format americain: MM/DD/YYYY
  const usMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    // Heuristique: si le premier nombre > 12, c'est probablement DD/MM
    if (parseInt(month) <= 12) {
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) return date;
    }
  }
  
  // Fallback: laisser JS essayer
  const fallback = new Date(cleaned);
  if (!isNaN(fallback.getTime())) return fallback;
  
  return null;
}

/**
 * Parse une ligne CSV en tenant compte des guillemets
 */
export function parseCSVLine(line: string, separator: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Double quote = quote literal
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Detecte le separateur CSV le plus probable
 */
export function detectSeparator(lines: string[]): string {
  const separators = [',', ';', '\t', '|'];
  const counts: Record<string, number[]> = {};
  
  for (const sep of separators) {
    counts[sep] = [];
  }
  
  // Compter les occurrences de chaque separateur par ligne
  for (const line of lines.slice(0, 5)) { // 5 premieres lignes
    for (const sep of separators) {
      const count = (line.match(new RegExp(`\\${sep}`, 'g')) || []).length;
      counts[sep].push(count);
    }
  }
  
  // Le bon separateur a un nombre constant d'occurrences
  let bestSep = ',';
  let bestScore = 0;
  
  for (const sep of separators) {
    const vals = counts[sep];
    if (vals.every(v => v > 0) && vals.every(v => v === vals[0])) {
      // Toutes les lignes ont le meme nombre de separateurs
      if (vals[0] > bestScore) {
        bestScore = vals[0];
        bestSep = sep;
      }
    }
  }
  
  return bestSep;
}

/**
 * Normalise un libelle de transaction
 * Supprime les infos inutiles (dates de carte, numeros, etc.)
 */
export function normalizeLabel(label: string): string {
  return label
    .trim()
    // Supprimer les dates de carte (CARTE 12/01, CB*1234)
    .replace(/^(CARTE|CB|VIR|VIREMENT|PRLV|PRELEVEMENT)\s*[\d\/\*]+\s*/i, '')
    // Supprimer les numeros de reference
    .replace(/\s+\d{6,}$/g, '')
    // Normaliser les espaces
    .replace(/\s+/g, ' ')
    .trim();
}
