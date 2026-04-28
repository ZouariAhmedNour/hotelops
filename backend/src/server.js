const app = require('./app');
const { port } = require('./config/env');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
try {
await prisma.$connect();
console.log('Base de données connectée');
app.listen(port, () => {
console.log(`Serveur démarré sur le port ${port}`);
console.log(`Swagger disponible sur http://localhost:${port}/api-docs`);

});
} catch (error) {
console.error('Erreur de connexion à la BDD:', error);
process.exit(1);
}
}
main();