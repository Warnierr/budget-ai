const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'test@gmail.com';
  const newPassword = 'Password123!';

  // Hasher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Mettre à jour l'utilisateur
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log('✅ Mot de passe réinitialisé avec succès !');
  console.log(`Email: ${email}`);
  console.log(`Nouveau mot de passe: ${newPassword}`);
  console.log(`\nVous pouvez maintenant vous connecter avec ces identifiants.`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

