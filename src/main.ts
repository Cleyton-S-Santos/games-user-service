import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';

config()
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Game auth api')
    .setDescription('The Game auth API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  const PORT = Number(process.env.PORT)

  await app.listen(PORT && PORT != undefined && !Number.isNaN(PORT)? PORT : 3000, () => {
    console.log("up on port " + PORT && PORT != undefined && !Number.isNaN(PORT)? PORT : 3000)
  });
}
bootstrap();
