import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/infra/app.module';
import { App } from './setup/App';

async function bootstrap() {
  const appInstance = await NestFactory.create(AppModule);
  await new App(appInstance).run();
}
bootstrap().catch((err) => {
  console.log(`Error starting app... ${err}`);
  process.exit(1);
});
