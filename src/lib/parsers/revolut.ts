/**
 * Parser Revolut
 * Format: Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
 */

import { BankParser, ParsedTransaction } from './types';
import { parseAmount, parseDate, normalizeLabel } from './utils';

export const revolutParser: BankParser = {
  id: 'revolut',
  name: 'Revolut',
  banks: ['Revolut'],
  
  detect: (headers: string[]) => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    
    // Revolut a ces colonnes specifiques
    return (
      lowerHeaders.includes('type') &&
      lowerHeaders.includes('product') &&
      lowerHeaders.includes('started date') &&
      lowerHeaders.includes('description') &&
      lowerHeaders.includes('amount')
    );
  },
  
  parseRow: (row: string[], headers: string[]): ParsedTransaction | null => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    
    const typeIdx = lowerHeaders.indexOf('type');
    const dateIdx = lowerHeaders.indexOf('completed date') !== -1 
      ? lowerHeaders.indexOf('completed date') 
      : lowerHeaders.indexOf('started date');
    const descIdx = lowerHeaders.indexOf('description');
    const amountIdx = lowerHeaders.indexOf('amount');
    const stateIdx = lowerHeaders.indexOf('state');
    
    if (dateIdx === -1 || amountIdx === -1) return null;
    
    // Ignorer les transactions non completees
    if (stateIdx !== -1 && row[stateIdx]?.toLowerCase() !== 'completed') {
      return null;
    }
    
    const dateStr = row[dateIdx];
    const date = parseDate(dateStr);
    if (!date) return null;
    
    const amount = parseAmount(row[amountIdx]);
    if (amount === 0) return null;
    
    // Construire le libelle
    let label = row[descIdx] || '';
    const type = row[typeIdx] || '';
    
    // Ajouter le type si pertinent
    if (type && !['CARD_PAYMENT', 'TRANSFER', 'TOPUP'].includes(type.toUpperCase())) {
      label = `${type}: ${label}`;
    }
    
    return {
      date,
      label: normalizeLabel(label) || 'Transaction Revolut',
      amount,
      rawLine: row.join(','),
    };
  },
};
