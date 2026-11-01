import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { openApiSpec } from './docs/openapi.js';

export function createApp(): Application {
  const app = express();

  // Security Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow all in dev or if origin is in whitelist or null/server-to-server
        if (!origin || ENV.CLIENT_URL.includes('*') || ENV.CLIENT_URL.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive for preview/demos
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: ENV.RATE_LIMIT_WINDOW_MS,
    max: ENV.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Muitas requisições enviadas. Tente novamente em alguns minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  });
  app.use('/api/', limiter);

  // Body Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // HTTP Request Logging
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Healthcheck route
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Ciclo Reciclagem Backend API',
      version: '1.0.0',
      uptime: process.uptime(),
    });
  });

  app.get('/', (_req: Request, res: Response) => res.redirect('/docs'));
  app.get('/openapi.json', (_req: Request, res: Response) => res.json(openApiSpec));
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customSiteTitle: 'Ciclo API — Swagger UI',
      swaggerOptions: { displayRequestDuration: true, persistAuthorization: true },
    })
  );

  // Mount API endpoints
  app.use('/api', apiRouter);

  // 404 Handler
  app.use(notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
