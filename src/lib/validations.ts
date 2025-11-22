import { z } from 'zod';

// Validation des dépenses
export const expenseSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  amount: z.number().positive('Le montant doit être positif').max(1000000),
  date: z.date(),
  categoryId: z.string().cuid().optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['pending', 'paid']).default('pending'),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

// Validation des revenus
export const incomeSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  amount: z.number().positive('Le montant doit être positif').max(1000000),
  frequency: z.enum(['monthly', 'once', 'weekly', 'yearly']),
  date: z.date(),
  isRecurring: z.boolean().default(false),
  description: z.string().max(500).optional(),
});

export type IncomeInput = z.infer<typeof incomeSchema>;

// Validation des abonnements
export const subscriptionSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  amount: z.number().positive('Le montant doit être positif').max(10000),
  frequency: z.enum(['monthly', 'yearly']).default('monthly'),
  billingDate: z.number().min(1).max(31),
  categoryId: z.string().cuid().optional(),
  description: z.string().max(500).optional(),
  url: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  reminderDays: z.number().min(0).max(30).default(3),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;

// Validation des catégories
export const categorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide').optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// Validation des budgets
export const budgetSchema = z.object({
  categoryId: z.string().cuid(),
  amount: z.number().positive('Le montant doit être positif').max(1000000),
  month: z.date(),
});

export type BudgetInput = z.infer<typeof budgetSchema>;

// Validation des objectifs
export const goalSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  targetAmount: z.number().positive('Le montant doit être positif'),
  currentAmount: z.number().min(0).default(0),
  deadline: z.date().optional(),
  description: z.string().max(500).optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;

// Validation de l'inscription
export const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Validation de la connexion
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type LoginInput = z.infer<typeof loginSchema>;

