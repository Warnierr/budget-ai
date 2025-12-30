/**
 * Factory de parsers CSV bancaires
 * Detecte automatiquement le format et parse les transactions
 */

import { BankParser, ParseResult, ParsedTransaction } from './types';
import { parseCSVLine, detectSeparator } from './utils';

// Import des parsers
import { revolutParser } from './revolut';
import { sgParser } from './sg';
import { bnpParser } from './bnp';
import { boursoramaParser } from './boursorama';
import { genericParser } from './generic';

// Liste des parsers par ordre de priorite
// Les parsers specifiques sont testes avant le generique
const PARSERS: BankParser[] = [
  revolutParser,
  boursoramaParser,
  sgParser,
  bnpParser,
  genericParser, // Fallback
];

export { PARSERS };
export * from './types';
export * from './utils';

/**
 * Parse un fichier CSV complet
 */
export function parseCSVFile(content: string): ParseResult {
  const errors: string[] = [];
  const transactions: ParsedTransaction[] = [];
  let skippedLines = 0;
  
  // Normaliser les fins de ligne
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedContent.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    return {
      success: false,
      transactions: [],
      bankSource: 'unknown',
      errors: ['Fichier trop court (minimum 2 lignes : header + donnees)'],
      skippedLines: 0,
    };
  }
  
  // Detecter le separateur
  const separator = detectSeparator(lines);
  
  // Parser les headers
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine, separator);
  
  // Parser les premieres lignes de donnees pour la detection
  const firstDataRows = lines.slice(1, 4).map(line => parseCSVLine(line, separator));
  
  // Detecter le parser a utiliser
  let selectedParser: BankParser | null = null;
  
  for (const parser of PARSERS) {
    // Utiliser le separateur du parser si specifie
    const parserSep = parser.separator || separator;
    const testHeaders = parseCSVLine(headerLine, parserSep);
    const testRows = lines.slice(1, 4).map(line => parseCSVLine(line, parserSep));
    
    if (parser.detect(testHeaders, testRows)) {
      selectedParser = parser;
      break;
    }
  }
  
  if (!selectedParser) {
    return {
      success: false,
      transactions: [],
      bankSource: 'unknown',
      errors: ['Format de fichier non reconnu. Verifiez que le fichier contient des colonnes date, montant et libelle.'],
      skippedLines: 0,
    };
  }
  
  // Utiliser le separateur du parser selectionne
  const finalSeparator = selectedParser.separator || separator;
  const finalHeaders = parseCSVLine(headerLine, finalSeparator);
  
  // Parser toutes les lignes
  const skipLines = selectedParser.skipLines || 0;
  const dataLines = lines.slice(1 + skipLines);
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const lineNumber = i + 2 + skipLines; // +2 car header + index 0-based
    
    try {
      const row = parseCSVLine(line, finalSeparator);
      
      // Ignorer les lignes vides ou trop courtes
      if (row.length < 2 || row.every(cell => !cell.trim())) {
        skippedLines++;
        continue;
      }
      
      const transaction = selectedParser.parseRow(row, finalHeaders);
      
      if (transaction) {
        transactions.push(transaction);
      } else {
        skippedLines++;
      }
    } catch (error) {
      errors.push(`Ligne ${lineNumber}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      skippedLines++;
    }
  }
  
  return {
    success: transactions.length > 0,
    transactions,
    bankSource: selectedParser.id,
    errors,
    skippedLines,
  };
}

/**
 * Retourne la liste des banques supportees
 */
export function getSupportedBanks(): { id: string; name: string; banks: string[] }[] {
  return PARSERS.map(parser => ({
    id: parser.id,
    name: parser.name,
    banks: parser.banks,
  }));
}

/**
 * Detecte le format d'un fichier sans le parser completement
 */
export function detectBankFormat(content: string): { parser: string; confidence: 'high' | 'medium' | 'low' } | null {
  const lines = content.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim());
  
  if (lines.length < 2) return null;
  
  const separator = detectSeparator(lines);
  const headers = parseCSVLine(lines[0], separator);
  const firstRows = lines.slice(1, 4).map(line => parseCSVLine(line, separator));
  
  for (const parser of PARSERS) {
    const parserSep = parser.separator || separator;
    const testHeaders = parseCSVLine(lines[0], parserSep);
    const testRows = lines.slice(1, 4).map(line => parseCSVLine(line, parserSep));
    
    if (parser.detect(testHeaders, testRows)) {
      // Le parser generique = confidence low
      const confidence = parser.id === 'generic' ? 'low' : 'high';
      return { parser: parser.id, confidence };
    }
  }
  
  return null;
}
