import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app/config.service';
import { GlobalExceptionFilter } from './common/filters';
import * as cookieParser from 'cookie-parser';
import { AccessGuard } from './common/guards';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig = app.get(AppConfigService);
  const reflector = new Reflector();
  app.use(cookieParser());
  app.use(morgan('dev'));
  app.setGlobalPrefix('api');
  app.enableCors({ origin: appConfig.origin, credentials: true });
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalGuards(new AccessGuard(reflector));
  await app.listen(appConfig.port);
}
bootstrap();
