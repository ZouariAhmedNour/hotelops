import app from "./app";
import { port } from "./config/env";
import { prisma } from "./config/prisma";

async function main() {
  try {
    await prisma.$connect();

    console.log("Base de données connectée");

    app.listen(port, "0.0.0.0", () => {
      console.log(`Serveur démarré sur le port ${port}`);
      console.log(`Swagger disponible sur http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error("Erreur de connexion à la BDD:", error);
    process.exit(1);
  }
}

main();