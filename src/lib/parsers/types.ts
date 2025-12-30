/**
 * Types pour le parsing de fichiers bancaires CSV
 */

// Transaction parsee depuis un fichier CSV
export interface ParsedTransaction {
  date: Date;
  label: string;
  amount: number; // Negatif = depense, positif = revenu
  rawLine?: string; // Ligne brute pour debug
}

// Resultat du parsing d'un fichier
export interface ParseResult {
  success: boolean;
  transactions: ParsedTransaction[];
  bankSource: string; // Nom du parser utilise
  errors: string[];
  skippedLines: number;
}

// Interface pour un parser bancaire
export interface BankParser {
  // Identifiant unique du parser
  id: string;
  
  // Nom affiche a l'utilisateur
  name: string;
  
  // Banques supportees
  banks: string[];
  
  // Detecte si ce parser peut traiter le fichier
  // basé sur les headers ou les premieres lignes
  detect: (headers: string[], firstRows: string[][]) => boolean;
  
  // Parse une ligne de donnees
  parseRow: (row: string[], headers: string[]) => ParsedTransaction | null;
  
  // Separateur CSV (par defaut: ,)
  separator?: string;
  
  // Nombre de lignes a ignorer au debut
  skipLines?: number;
}

// Configuration pour l'import
export interface ImportConfig {
  bankAccountId: string;
  skipDuplicates: boolean;
}

// Stats d'import
export interface ImportStats {
  total: number;
  imported: number;
  skipped: number; // Doublons
  errors: number;
}
