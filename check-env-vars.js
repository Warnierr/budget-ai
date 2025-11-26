const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

function checkEnv(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`Fichier trouvé: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const hasSecret = content.includes('NEXTAUTH_SECRET=');
    const hasUrl = content.includes('NEXTAUTH_URL=');
    console.log(`- Contient NEXTAUTH_SECRET: ${hasSecret ? 'OUI' : 'NON'}`);
    console.log(`- Contient NEXTAUTH_URL: ${hasUrl ? 'OUI' : 'NON'}`);
  } else {
    console.log(`Fichier NON trouvé: ${filePath}`);
  }
}

console.log('Diagnostic Environnement:');
console.log('CWD:', process.cwd());
checkEnv(envLocalPath);
checkEnv(envPath);

