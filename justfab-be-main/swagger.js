const swaggerJsDoc = require('swagger-jsdoc');

// Swagger definition
const definition = {
  openapi: '3.0.0', // Use OpenAPI 3.0.0
};

// Options for swagger-jsdoc
const options = {
  definition,
  apis: ['./routes/*.js'], // Path to the API docs (use your routes folder)
};

// Generate Swagger docs
const specs = swaggerJsDoc(options);

module.exports = specs;