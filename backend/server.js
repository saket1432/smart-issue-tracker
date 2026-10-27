const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./src/config/db');
const swaggerSpec = require('./src/config/swagger');

const authRoutes = require('./src/routes/authRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const slaRoutes = require('./src/routes/slaRoutes');
const healthRoutes = require('./src/routes/healthRoutes');

dotenv.config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
}
connectDB();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Check that the API server is running
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: API server is running
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Issue & Resolution Tracker API is running',
    status: 'ok',
  });
});

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sla', slaRoutes);
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    responseInterceptor: (response) => {
      const isLoginResponse = response.status === 200
        && String(response.url || '').endsWith('/api/auth/login');

      if (isLoginResponse) {
        try {
          const responseBody = response.data ?? response.body ?? response.text;
          const payload = typeof responseBody === 'string'
            ? JSON.parse(responseBody)
            : responseBody;
          if (payload?.token && window.ui) {
            window.ui.preauthorizeApiKey('bearerAuth', payload.token);
          }
        } catch (error) {
          // Leave Swagger unauthorized if the login response cannot be parsed.
        }
      }

      return response;
    },
  },
}));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong on the server',
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('========================================');
  console.log('Smart Issue Tracker API is running');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Swagger URL: http://localhost:${PORT}/api-docs`);
  console.log(`MongoDB target: ${process.env.MONGODB_URI ? 'configured database' : 'localhost:27017/smart-issue-tracker'}`);
  console.log('========================================');
});
