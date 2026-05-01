import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';

export const registry = new OpenAPIRegistry();

export const setupSwagger = (app: Express) => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const document = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'API Maintenance Hôtelière',
      version: '1.0.0',
    },
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(document));
};