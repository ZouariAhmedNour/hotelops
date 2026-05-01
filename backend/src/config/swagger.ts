import { Express } from 'express';
import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// 🔹 Configuration Swagger
const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Maintenance Hôtelière',
      version: '1.0.0',
      description: 'API REST pour la gestion des tickets de maintenance',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },

  // ⚠️ IMPORTANT : passer en .ts
  apis: ['./src/routes/*.ts'],
};

// 🔹 Setup Swagger
export const setupSwagger = (app: Express): void => {
  const specs = swaggerJsdoc(options);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};