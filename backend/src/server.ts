import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { closeDatabase, connectDatabase } from './database/db.js';

async function startServer() {
  if (!ENV.JWT_SECRET || !ENV.GOOGLE_CLIENT_ID) {
    throw new Error('JWT_SECRET e GOOGLE_CLIENT_ID precisam estar configurados.');
  }
  await connectDatabase(ENV.MONGODB_URI, ENV.NODE_ENV !== 'production');
  const app = createApp();

  const server = app.listen(ENV.PORT, () => {
    console.log(`
  ♻️  CICLO — RASTREIO DE RECICLAGEM · BACKEND
  ==============================================
  🚀 Servidor rodando em: http://localhost:${ENV.PORT}
  📄 Documentação interativa: http://localhost:${ENV.PORT}/docs
  🩺 Health check: http://localhost:${ENV.PORT}/health
  🌱 Ambiente: ${ENV.NODE_ENV}
  ==============================================
  `);
  });

  const shutdown = (signal: string) => {
    console.log(`Recebido ${signal}, encerrando servidor HTTP...`);
    server.close(async () => {
      await closeDatabase();
      console.log('Servidor encerrado com sucesso.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((error: unknown) => {
  console.error('Não foi possível iniciar a API. Verifique MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID e a conexão MongoDB.');
  if (error instanceof Error) console.error(error.message);
  process.exitCode = 1;
});
