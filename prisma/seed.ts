// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed de la base de données (données démo)');

  // Utilisateur de démonstration
  const demoPassword = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@budget-ai.com' },
    update: {},
    create: {
      email: 'demo@budget-ai.com',
      name: 'Utilisateur Démo',
      password: demoPassword,
    },
  });

  console.log('✅ Utilisateur démo prêt:', demoUser.email);

  // Compte bancaire par défaut (vérifie s'il existe déjà)
  const existingMain = await prisma.bankAccount.findFirst({
    where: { userId: demoUser.id, name: 'Compte Principal' },
  });

  const mainAccount =
    existingMain ??
    (await prisma.bankAccount.create({
      data: {
        userId: demoUser.id,
        name: 'Compte Principal',
        type: 'checking',
        initialBalance: 2500,
        bank: 'Budget AI Demo Bank',
        color: '#3B82F6',
        isDefault: true,
      },
    }));

  console.log('✅ Compte bancaire créé:', mainAccount.name);

  const currentDate = new Date();
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

  // Revenus démo
  await prisma.income.createMany({
    data: [
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'Salaire du mois',
        amount: 2800,
        frequency: 'monthly',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
        isRecurring: true,
        description: 'Salaire principal',
      },
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'Mission Freelance',
        amount: 500,
        frequency: 'once',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
        isRecurring: false,
        description: 'Mission ponctuelle',
      },
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'Salaire mois précédent',
        amount: 2800,
        frequency: 'monthly',
        date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 5),
        isRecurring: true,
        description: 'Salaire précédent',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Revenus créés');

  // Dépenses démo
  await prisma.expense.createMany({
    data: [
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'Loyer',
        amount: 850,
        status: 'paid',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        description: 'Appartement',
      },
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'Électricité',
        amount: 65,
        status: 'paid',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        description: 'Facture énergie',
      },
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'Courses',
        amount: 90,
        status: 'paid',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 7),
        description: 'Supermarché',
      },
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'Restaurant',
        amount: 45,
        status: 'paid',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 14),
        description: 'Dîner',
      },
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'Cinéma',
        amount: 24,
        status: 'paid',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 16),
        description: 'Sortie loisir',
      },
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'Courses mois précédent',
        amount: 280,
        status: 'paid',
        date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 15),
        description: 'Courses du mois dernier',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Dépenses créées');

  // Abonnements démo
  await prisma.subscription.createMany({
    data: [
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'Netflix',
        amount: 13.49,
        frequency: 'monthly',
        billingDate: 15,
        isActive: true,
        url: 'https://www.netflix.com',
      },
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'Spotify',
        amount: 9.99,
        frequency: 'monthly',
        billingDate: 10,
        isActive: true,
        url: 'https://www.spotify.com',
      },
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'Salle de sport',
        amount: 29.9,
        frequency: 'monthly',
        billingDate: 1,
        isActive: true,
      },
      {
        userId: demoUser.id,
        bankAccountId: mainAccount.id,
        name: 'YouTube Premium',
        amount: 11.99,
        frequency: 'monthly',
        billingDate: 5,
        isActive: false,
        url: 'https://www.youtube.com',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Abonnements créés');

  // Objectifs démo
  await prisma.goal.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'Vacances en Italie',
        targetAmount: 2000,
        currentAmount: 850,
        deadline: new Date(currentDate.getFullYear(), 6, 1),
        description: 'Voyage d’été',
        isCompleted: false,
      },
      {
        userId: demoUser.id,
        name: "Fonds d'urgence",
        targetAmount: 5000,
        currentAmount: 2100,
        deadline: new Date(currentDate.getFullYear() + 1, 0, 1),
        description: 'Filet de sécurité',
        isCompleted: false,
      },
      {
        userId: demoUser.id,
        name: 'Nouveau MacBook',
        targetAmount: 1500,
        currentAmount: 450,
        deadline: new Date(currentDate.getFullYear(), 11, 31),
        description: 'Upgrade matériel',
        isCompleted: false,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Objectifs créés');

  console.log('\n🎉 Seed terminé avec succès !');
  console.log('\n📝 Compte de démonstration :');
  console.log('   Email: demo@budget-ai.com');
  console.log('   Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

