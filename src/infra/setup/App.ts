import { INestApplication, Logger } from '@nestjs/common';
import { Env } from '../shared/env/env.schema';
import { EnvService } from '../shared/env/env.service';
import { prefixedLogger } from '../helpers/prefixed-logger';

export class App {
  private app: INestApplication;
  private nodeEnv: Env['NODE_ENV'] | undefined = undefined;
  private port: number | undefined = undefined;
  private logger: Logger;
  private envService: EnvService;

  constructor(app: INestApplication) {
    this.app = app;
    this.envService = app.get(EnvService);
    this.logger = prefixedLogger(this.envService.get('NODE_ENV'));
  }

  private loadEnvConfig() {
    this.nodeEnv = this.envService.get('NODE_ENV');
    this.port = this.envService.get('APP_PORT');
  }

  // private loadSwaggerApi() {
  //   return Swagger.run(this.app);
  // }

  // private loadHelmetConfig() {
  //   return this.app.use(
  //     helmet({
  //       contentSecurityPolicy: {
  //         directives: {
  //           'script-src': ["'self'", 'https://cdn.jsdelivr.net/'],
  //           'default-src': ["'self'", 'https://cdn.jsdelivr.net/'],
  //         },
  //       },
  //       xPoweredBy: undefined,
  //     }),
  //   );
  // }

  public async run() {
    try {
      this.loadEnvConfig();
      // this.loadHelmetConfig();
      // this.validateApiKey();
      // this.loadSwaggerApi();

      await this.app.listen(this.port!, '0.0.0.0', () => {
        this.logger.log(`Server started on port ${this.port}`);
      });
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to start the app: \nReason: ${err.message}\n`);
      process.exit(1);
    }
  }
}
