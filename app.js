const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openApiSpec = require('./openapi.json');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// JSON Body-Parser Middleware
app.use(express.json());

// Swagger UI unter /api-docs bereitstellen
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Auth Routen (login, verify, logout)
app.use(authRoutes);

// Task Routen (alle unter /tasks)
app.use('/tasks', taskRoutes);

module.exports = app;
