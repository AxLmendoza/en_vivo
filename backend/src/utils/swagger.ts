import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow AI API',
      version: '1.0.0',
      description: 'API para TaskFlow AI - Asistente de productividad inteligente',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://api.taskflowai.com'
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production'
          ? 'Production server'
          : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'TaskFlow AI API Documentation',
  }));
};