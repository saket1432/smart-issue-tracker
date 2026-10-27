const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Issue & Resolution Tracker API',
      version: '1.0.0',
      description:
        'API for user authentication, ticket management, admin actions, notifications, and smart issue tracking. To use protected operations, run POST /api/auth/login, copy the returned token, click Authorize, and paste the token without the Bearer prefix.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
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
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './server.js'],
};

module.exports = swaggerJsdoc(options);
