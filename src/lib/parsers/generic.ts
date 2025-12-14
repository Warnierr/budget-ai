/**
 * Parser CSV generique
 * Detecte automatiquement les colonnes date, montant, libelle
 */

import { BankParser, ParsedTransaction } from './types';
import { parseAmount, parseDate, normalizeLabel } from './utils';

// Patterns pour detecter les colonnes
const DATE_PATTERNS = ['date', 'dated', 'value date', 'operation', 'dateop', 'datevaleur'];
const AMOUNT_PATTERNS = ['amount', 'montant', 'debit', 'credit', 'sum', 'value', 'somme'];
const LABEL_PATTERNS = ['description', 'label', 'libelle', 'libellé', 'memo', 'detail', 'communication', 'name'];

function findColumnIndex(headers: string[], patterns: string[]): number {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  
  for (const pattern of patterns) {
    const index = lowerHeaders.findIndex(h => h.includes(pattern));
    if (index !== -1) return index;
  }
  
  return -1;
}

export const genericParser: BankParser = {
  id: 'generic',
  name: 'Format generique',
  banks: ['Autre', 'Export manuel'],
  
  detect: (headers: string[]) => {
    // Le parser generique est un fallback, il detecte toujours true
    // s'il trouve au moins une colonne date et une colonne montant
    const dateCol = findColumnIndex(headers, DATE_PATTERNS);
    const amountCol = findColumnIndex(headers, AMOUNT_PATTERNS);
    
    return dateCol !== -1 && amountCol !== -1;
  },
  
  parseRow: (row: string[], headers: string[]): ParsedTransaction | null => {
    const dateCol = findColumnIndex(headers, DATE_PATTERNS);
    const amountCol = findColumnIndex(headers, AMOUNT_PATTERNS);
    const labelCol = findColumnIndex(headers, LABEL_PATTERNS);
    
    // Chercher aussi debit/credit separes
    const debitCol = findColumnIndex(headers, ['debit', 'débit', 'sortie']);
    const creditCol = findColumnIndex(headers, ['credit', 'crédit', 'entree', 'entrée']);
    
    if (dateCol === -1) return null;
    
    const dateStr = row[dateCol];
    const date = parseDate(dateStr);
    if (!date) return null;
    
    // Calculer le montant
    let amount = 0;
    if (amountCol !== -1) {
      amount = parseAmount(row[amountCol]);
    } else if (debitCol !== -1 && creditCol !== -1) {
      // Colonnes debit/credit separees
      const debit = parseAmount(row[debitCol]);
      const credit = parseAmount(row[creditCol]);
      amount = credit - debit; // Debit = negatif, credit = positif
    } else {
      return null; // Pas de montant trouve
    }
    
    // Libelle
    let label = '';
    if (labelCol !== -1) {
      label = row[labelCol] || '';
    } else {
      // Fallback: concatener les colonnes non-numeriques
      label = row
        .filter((cell, i) => i !== dateCol && i !== amountCol && i !== debitCol && i !== creditCol)
        .filter(cell => cell && isNaN(parseFloat(cell.replace(/[,\s]/g, ''))))
        .join(' ')
        .trim();
    }
    
    if (!label) label = 'Transaction sans libelle';
    
    return {
      date,
      label: normalizeLabel(label),
      amount,
      rawLine: row.join(';'),
    };
  },
};
