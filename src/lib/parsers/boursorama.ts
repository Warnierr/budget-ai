/**
 * Parser Boursorama
 * Format: dateOp;dateVal;label;category;categoryParent;supplierFound;amount;accountNum;accountLabel;accountBalance
 */

import { BankParser, ParsedTransaction } from './types';
import { parseAmount, parseDate, normalizeLabel } from './utils';

export const boursoramaParser: BankParser = {
  id: 'boursorama',
  name: 'Boursorama',
  banks: ['Boursorama', 'Boursorama Banque'],
  separator: ';',
  
  detect: (headers: string[]) => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    
    // Boursorama a des colonnes specifiques
    return (
      (lowerHeaders.includes('dateop') || lowerHeaders.includes('date op')) &&
      lowerHeaders.includes('label') &&
      lowerHeaders.includes('amount')
    );
  },
  
  parseRow: (row: string[], headers: string[]): ParsedTransaction | null => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    
    let dateIdx = lowerHeaders.indexOf('dateop');
    if (dateIdx === -1) dateIdx = lowerHeaders.indexOf('date op');
    if (dateIdx === -1) dateIdx = lowerHeaders.indexOf('dateval');
    
    const labelIdx = lowerHeaders.indexOf('label');
    const amountIdx = lowerHeaders.indexOf('amount');
    const categoryIdx = lowerHeaders.indexOf('category');
    
    if (dateIdx === -1 || labelIdx === -1 || amountIdx === -1) return null;
    
    const dateStr = row[dateIdx];
    const date = parseDate(dateStr);
    if (!date) return null;
    
    const amount = parseAmount(row[amountIdx]);
    if (amount === 0) return null;
    
    // Boursorama fournit deja une categorie, on peut la conserver
    let label = row[labelIdx] || '';
    const category = categoryIdx !== -1 ? row[categoryIdx] : '';
    
    // Optionnel: prefixer avec la categorie Boursorama
    // if (category) label = `[${category}] ${label}`;
    
    return {
      date,
      label: normalizeLabel(label) || 'Transaction Boursorama',
      amount,
      rawLine: row.join(';'),
    };
  },
};
