const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testLogin() {
  const email = 'test@gmail.com';
  const passwordToTest = 'Password123!';

  console.log('=== Test de connexion ===');
  console.log(`Email: ${email}`);
  console.log(`Mot de passe testé: ${passwordToTest}`);
  console.log('');

  // Récupérer l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('❌ Utilisateur non trouvé');
    return;
  }

  console.log('✅ Utilisateur trouvé:', user.name);
  console.log('');

  // Tester le mot de passe
  const isValid = await bcrypt.compare(passwordToTest, user.password);
  
  console.log('Hash stocké en BDD:', user.password.substring(0, 30) + '...');
  console.log('Mot de passe valide?', isValid ? '✅ OUI' : '❌ NON');

  if (!isValid) {
    console.log('');
    console.log('Le mot de passe ne correspond pas. Je vais le réinitialiser...');
    
    const newHash = await bcrypt.hash(passwordToTest, 12);
    await prisma.user.update({
      where: { email },
      data: { password: newHash },
    });
    
    console.log('✅ Mot de passe réinitialisé avec succès!');
    console.log(`Vous pouvez maintenant vous connecter avec: ${passwordToTest}`);
  }
}

testLogin()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

