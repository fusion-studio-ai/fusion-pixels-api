import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Enable logger for Vercel deployments
    logger: ['error', 'warn', 'log'],
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  // CORS - Updated for Vercel
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  })

  // API prefix
  app.setGlobalPrefix('api')

  // Swagger - Only enable in development
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('FusionPixels API')
      .setDescription('AI-powered image generation with real-time capabilities')
      .setVersion('1.0')
      .addTag('ai', 'AI-powered features')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
  }

  // Get port from environment or use default
  const port = process.env.PORT || 3001
  await app.listen(port)

  // Log startup only in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 FusionPixels API running on http://localhost:${port}`)
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`)
    console.log(`🤖 AI SDK integrated and ready!`)
  }
}

bootstrap()
