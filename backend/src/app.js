const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const routes = require('./routes');
const swaggerSpec = require('./docs/swagger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(compression());

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.use('/api', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
