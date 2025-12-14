/**
 * Parser Societe Generale
 * Format: Date operation;Libelle;Detail;Montant;Devise
 * ou: Date;Libelle;Debit;Credit
 */

import { BankParser, ParsedTransaction } from './types';
import { parseAmount, parseDate, normalizeLabel } from './utils';

export const sgParser: BankParser = {
  id: 'sg',
  name: 'Societe Generale',
  banks: ['Societe Generale', 'SG'],
  separator: ';',
  
  detect: (headers: string[]) => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    
    // SG utilise souvent des headers en francais avec points-virgules
    const hasSGHeaders = (
      (lowerHeaders.includes('date operation') || lowerHeaders.includes('date')) &&
      (lowerHeaders.includes('libelle') || lowerHeaders.includes('libellé')) &&
      (lowerHeaders.includes('montant') || (lowerHeaders.includes('debit') && lowerHeaders.includes('credit')))
    );
    
    return hasSGHeaders;
  },
  
  parseRow: (row: string[], headers: string[]): ParsedTransaction | null => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    
    // Trouver les colonnes
    let dateIdx = lowerHeaders.indexOf('date operation');
    if (dateIdx === -1) dateIdx = lowerHeaders.indexOf('date');
    
    let labelIdx = lowerHeaders.indexOf('libelle');
    if (labelIdx === -1) labelIdx = lowerHeaders.indexOf('libellé');
    
    const detailIdx = lowerHeaders.indexOf('detail') !== -1 
      ? lowerHeaders.indexOf('detail') 
      : lowerHeaders.indexOf('détail');
    
    const montantIdx = lowerHeaders.indexOf('montant');
    const debitIdx = lowerHeaders.indexOf('debit') !== -1 
      ? lowerHeaders.indexOf('debit') 
      : lowerHeaders.indexOf('débit');
    const creditIdx = lowerHeaders.indexOf('credit') !== -1 
      ? lowerHeaders.indexOf('credit') 
      : lowerHeaders.indexOf('crédit');
    
    if (dateIdx === -1 || labelIdx === -1) return null;
    
    const dateStr = row[dateIdx];
    const date = parseDate(dateStr);
    if (!date) return null;
    
    // Calculer le montant
    let amount = 0;
    if (montantIdx !== -1) {
      amount = parseAmount(row[montantIdx]);
    } else if (debitIdx !== -1 && creditIdx !== -1) {
      const debit = parseAmount(row[debitIdx]);
      const credit = parseAmount(row[creditIdx]);
      // Debit = sortie = negatif, Credit = entree = positif
      amount = credit > 0 ? credit : -Math.abs(debit);
    } else {
      return null;
    }
    
    // Construire le libelle
    let label = row[labelIdx] || '';
    if (detailIdx !== -1 && row[detailIdx]) {
      label = `${label} ${row[detailIdx]}`.trim();
    }
    
    return {
      date,
      label: normalizeLabel(label) || 'Transaction SG',
      amount,
      rawLine: row.join(';'),
    };
  },
};
