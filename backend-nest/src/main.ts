import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    const db = app.get(DatabaseService);

  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await db.initSchema();
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}

void bootstrap();
