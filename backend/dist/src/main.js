"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    try {
        console.log('Creating NestJS application...');
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        console.log('NestJS application created successfully');
        const configService = app.get(config_1.ConfigService);
        console.log('ConfigService obtained');
        const port = configService.get('PORT') || 3000;
        console.log(`Starting server on port ${port}...`);
        await app.listen(port);
        console.log(`Application is running on: http://localhost:${port}`);
    }
    catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}
bootstrap().catch(error => {
    console.error('Bootstrap failed:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map