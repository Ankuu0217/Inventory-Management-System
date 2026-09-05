const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  // eslint-disable-next-line no-console
  console.error(`Invalid or missing environment variables:\n${details}`);
  process.exit(1);
}

const env = parsed.data;

module.exports = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGODB_URI,
  corsOrigin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: env.RATE_LIMIT_MAX,
  logLevel: env.LOG_LEVEL,
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
};
