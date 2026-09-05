const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Inventory Management System API',
      version: '1.0.0',
      description: 'REST API for managing product inventory, stock status and dashboard statistics.',
    },
    servers: [{ url: '/' }],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

module.exports = swaggerJsdoc(options);
