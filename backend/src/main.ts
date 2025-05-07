import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    });

    app.setGlobalPrefix('api');

    // Enable validation pipes
    app.useGlobalPipes(new ValidationPipe());

    // Configure Swagger
    const config = new DocumentBuilder()
        .setTitle('JUZT F1 API')
        .setDescription('The JUZT F1 API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(8080);
}
bootstrap();