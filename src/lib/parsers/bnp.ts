/**
 * Parser BNP Paribas
 * Format courant: Date;Libelle;Montant
 * ou: Date operation;Date valeur;Libelle;Debit;Credit
 */

import { BankParser, ParsedTransaction } from './types';
import { parseAmount, parseDate, normalizeLabel } from './utils';

export const bnpParser: BankParser = {
  id: 'bnp',
  name: 'BNP Paribas',
  banks: ['BNP Paribas', 'BNP'],
  separator: ';',
  
  detect: (headers: string[]) => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    
    // BNP a souvent "date operation" et "date valeur"
    const hasBNPHeaders = (
      lowerHeaders.some(h => h.includes('date')) &&
      (lowerHeaders.includes('libelle') || lowerHeaders.includes('libellé')) &&
      (lowerHeaders.includes('montant') || lowerHeaders.includes('debit') || lowerHeaders.includes('débit'))
    );
    
    // Detecter aussi par le format des premieres lignes
    return hasBNPHeaders;
  },
  
  parseRow: (row: string[], headers: string[]): ParsedTransaction | null => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    
    // Trouver les colonnes
    let dateIdx = lowerHeaders.findIndex(h => h.includes('date'));
    let labelIdx = lowerHeaders.findIndex(h => h.includes('libelle') || h.includes('libellé'));
    
    const montantIdx = lowerHeaders.indexOf('montant');
    const debitIdx = lowerHeaders.findIndex(h => h.includes('debit') || h.includes('débit'));
    const creditIdx = lowerHeaders.findIndex(h => h.includes('credit') || h.includes('crédit'));
    
    if (dateIdx === -1 || labelIdx === -1) return null;
    
    const dateStr = row[dateIdx];
    const date = parseDate(dateStr);
    if (!date) return null;
    
    // Calculer le montant
    let amount = 0;
    if (montantIdx !== -1 && row[montantIdx]) {
      amount = parseAmount(row[montantIdx]);
    } else if (debitIdx !== -1 || creditIdx !== -1) {
      const debit = debitIdx !== -1 ? parseAmount(row[debitIdx]) : 0;
      const credit = creditIdx !== -1 ? parseAmount(row[creditIdx]) : 0;
      amount = credit > 0 ? credit : -Math.abs(debit);
    } else {
      return null;
    }
    
    const label = row[labelIdx] || '';
    
    return {
      date,
      label: normalizeLabel(label) || 'Transaction BNP',
      amount,
      rawLine: row.join(';'),
    };
  },
};
