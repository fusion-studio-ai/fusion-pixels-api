# FusionPixels Backend - Complete Project Structure with AI SDK

## 📁 Complete Project Structure

```
fusionpixels-api/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── local-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── decorators/
│   │       ├── user.decorator.ts
│   │       └── roles.decorator.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       ├── update-user.dto.ts
│   │       └── update-preferences.dto.ts
│   ├── projects/
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts
│   │   ├── projects.module.ts
│   │   ├── entities/
│   │   │   └── project.entity.ts
│   │   └── dto/
│   │       ├── create-project.dto.ts
│   │       ├── update-project.dto.ts
│   │       └── project-stats.dto.ts
│   ├── images/
│   │   ├── images.controller.ts
│   │   ├── images.service.ts
│   │   ├── images.module.ts
│   │   ├── entities/
│   │   │   └── image.entity.ts
│   │   ├── dto/
│   │   │   ├── generate-image.dto.ts
│   │   │   ├── update-image.dto.ts
│   │   │   └── image-search.dto.ts
│   │   ├── processors/
│   │   │   ├── image-generation.processor.ts
│   │   │   ├── image-enhancement.processor.ts
│   │   │   └── image-analysis.processor.ts
│   │   └── interfaces/
│   │       ├── image-generation.interface.ts
│   │       └── image-metadata.interface.ts
│   ├── ai/ (NEW - AI SDK Integration)
│   │   ├── ai.controller.ts
│   │   ├── ai.service.ts
│   │   ├── ai.module.ts
│   │   ├── services/
│   │   │   ├── openai.service.ts
│   │   │   ├── anthropic.service.ts
│   │   │   ├── google-ai.service.ts
│   │   │   └── provider-manager.service.ts
│   │   ├── dto/
│   │   │   ├── enhance-prompt.dto.ts
│   │   │   ├── generate-suggestions.dto.ts
│   │   │   ├── analyze-image.dto.ts
│   │   │   └── stream-generation.dto.ts
│   │   ├── interfaces/
│   │   │   ├── ai-provider.interface.ts
│   │   │   ├── generation-params.interface.ts
│   │   │   └── streaming-response.interface.ts
│   │   ├── enums/
│   │   │   ├── ai-provider.enum.ts
│   │   │   └── generation-status.enum.ts
│   │   └── utils/
│   │       ├── prompt-builder.util.ts
│   │       └── response-formatter.util.ts
│   ├── storage/
│   │   ├── storage.service.ts
│   │   ├── storage.module.ts
│   │   ├── services/
│   │   │   ├── gcs.service.ts
│   │   │   ├── local.service.ts
│   │   │   └── cdn.service.ts
│   │   ├── dto/
│   │   │   ├── upload-file.dto.ts
│   │   │   └── file-metadata.dto.ts
│   │   └── interfaces/
│   │       └── storage-provider.interface.ts
│   ├── streaming/ (NEW - Real-time Features)
│   │   ├── streaming.gateway.ts
│   │   ├── streaming.service.ts
│   │   ├── streaming.module.ts
│   │   ├── dto/
│   │   │   ├── stream-event.dto.ts
│   │   │   └── progress-update.dto.ts
│   │   └── interfaces/
│   │       └── stream-event.interface.ts
│   ├── analytics/
│   │   ├── analytics.controller.ts
│   │   ├── analytics.service.ts
│   │   ├── analytics.module.ts
│   │   ├── entities/
│   │   │   ├── usage-stat.entity.ts
│   │   │   └── generation-log.entity.ts
│   │   └── dto/
│   │       ├── analytics-query.dto.ts
│   │       └── usage-report.dto.ts
│   ├── billing/
│   │   ├── billing.controller.ts
│   │   ├── billing.service.ts
│   │   ├── billing.module.ts
│   │   ├── entities/
│   │   │   ├── subscription.entity.ts
│   │   │   └── payment.entity.ts
│   │   └── dto/
│   │       ├── subscription.dto.ts
│   │       └── payment.dto.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   ├── api-key.decorator.ts
│   │   │   └── rate-limit.decorator.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   ├── validation-exception.filter.ts
│   │   │   └── ai-provider-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── api-key.guard.ts
│   │   │   └── credits.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   ├── cache.interceptor.ts
│   │   │   └── analytics.interceptor.ts
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts
│   │   │   ├── parse-uuid.pipe.ts
│   │   │   └── file-validation.pipe.ts
│   │   ├── middleware/
│   │   │   ├── logger.middleware.ts
│   │   │   ├── cors.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   ├── interfaces/
│   │   │   ├── api-response.interface.ts
│   │   │   ├── pagination.interface.ts
│   │   │   └── user-context.interface.ts
│   │   ├── enums/
│   │   │   ├── user-role.enum.ts
│   │   │   ├── subscription-plan.enum.ts
│   │   │   └── file-type.enum.ts
│   │   └── utils/
│   │       ├── encryption.util.ts
│   │       ├── validation.util.ts
│   │       ├── file.util.ts
│   │       └── date.util.ts
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   ├── storage.config.ts
│   │   ├── ai-providers.config.ts (NEW)
│   │   └── streaming.config.ts (NEW)
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 001-create-users-table.ts
│   │   │   ├── 002-create-projects-table.ts
│   │   │   ├── 003-create-images-table.ts
│   │   │   ├── 004-create-analytics-tables.ts
│   │   │   └── 005-add-ai-provider-fields.ts (NEW)
│   │   ├── seeds/
│   │   │   ├── user.seed.ts
│   │   │   ├── project.seed.ts
│   │   │   └── demo-data.seed.ts
│   │   └── data-source.ts
│   ├── health/
│   │   ├── health.controller.ts
│   │   ├── health.service.ts
│   │   ├── health.module.ts
│   │   └── indicators/
│   │       ├── database.indicator.ts
│   │       ├── redis.indicator.ts
│   │       └── ai-providers.indicator.ts (NEW)
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
│   ├── auth/
│   │   ├── auth.controller.spec.ts
│   │   └── auth.service.spec.ts
│   ├── ai/ (NEW)
│   │   ├── ai.controller.spec.ts
│   │   ├── ai.service.spec.ts
│   │   └── provider-manager.spec.ts
│   ├── images/
│   │   ├── images.controller.spec.ts
│   │   └── images.service.spec.ts
│   ├── e2e/
│   │   ├── auth.e2e-spec.ts
│   │   ├── images.e2e-spec.ts
│   │   └── ai.e2e-spec.ts (NEW)
│   └── helpers/
│       ├── test-utils.ts
│       └── mock-data.ts
├── docs/
│   ├── api/
│   │   ├── authentication.md
│   │   ├── image-generation.md
│   │   ├── ai-integration.md (NEW)
│   │   └── streaming.md (NEW)
│   ├── deployment/
│   │   ├── docker.md
│   │   ├── cloud-run.md
│   │   └── monitoring.md
│   └── development/
│       ├── setup.md
│       ├── contributing.md
│       └── ai-sdk-usage.md (NEW)
├── scripts/
│   ├── build.sh
│   ├── test.sh
│   ├── deploy.sh
│   ├── migrate.sh
│   └── seed.sh
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── nginx.conf
├── .env
├── .env.example
├── .env.test
├── .env.production
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.js
├── README.md
└── CHANGELOG.md
```

---

## 🤖 AI SDK Integration Files Breakdown

### AI Module Structure (`src/ai/`)

#### Core AI Service Files:

**ai.service.ts** - Main AI orchestration service

```typescript
// Central AI service that coordinates all providers
export class AIService {
  // Multi-provider management
  // Prompt enhancement
  // Streaming capabilities
  // Provider fallback logic
}
```

**provider-manager.service.ts** - AI provider management

```typescript
// Manages multiple AI providers
export class ProviderManagerService {
  // Health checks
  // Load balancing
  // Cost optimization
  // Provider switching
}
```

#### Provider-Specific Services:

**openai.service.ts** - OpenAI integration

```typescript
// OpenAI DALL-E and GPT integration
export class OpenAIService {
  // Image generation
  // Text enhancement
  // Vision capabilities
}
```

**anthropic.service.ts** - Anthropic Claude integration  
**google-ai.service.ts** - Google AI integration

#### AI Controller (`ai.controller.ts`)

```typescript
// REST endpoints and SSE streaming
@Controller("ai")
export class AIController {
  // POST /ai/enhance-prompt
  // POST /ai/suggest-prompts
  // SSE /ai/stream-enhance
  // POST /ai/analyze-image
}
```

---

## 🌊 Streaming Module Structure (`src/streaming/`)

**streaming.gateway.ts** - WebSocket gateway

```typescript
// Real-time communication with frontend
@WebSocketGateway()
export class StreamingGateway {
  // Image generation progress
  // Real-time updates
  // User notifications
}
```

**streaming.service.ts** - Streaming orchestration

```typescript
// Manages streaming events and progress
export class StreamingService {
  // Progress tracking
  // Event emission
  // Client management
}
```

---

## 📊 Enhanced Entities with AI SDK Support

### Updated User Entity

```typescript
// src/users/entities/user.entity.ts
@Entity("users")
export class User {
  // ... existing fields

  @Column({ nullable: true })
  preferredAiProvider: string; // 'openai' | 'anthropic' | 'google'

  @Column("jsonb", { nullable: true })
  aiProviderSettings: {
    openai?: { model: string; temperature: number };
    anthropic?: { model: string; maxTokens: number };
    google?: { model: string; safety: string };
  };

  @Column({ default: 0 })
  totalGenerations: number;

  @Column({ default: 0 })
  successfulGenerations: number;
}
```

### Updated Image Entity

```typescript
// src/images/entities/image.entity.ts
@Entity("images")
export class Image {
  // ... existing fields

  @Column()
  aiProvider: string; // Which provider was used

  @Column({ nullable: true })
  aiModel: string; // Specific model used

  @Column({ nullable: true })
  enhancedPrompt: string; // AI-enhanced version

  @Column("jsonb", { nullable: true })
  aiMetadata: {
    enhancementTime: number;
    generationTime: number;
    tokensUsed: number;
    provider: string;
    model: string;
  };

  @Column({ default: 0 })
  enhancementScore: number; // Quality score from AI
}
```

---

## 🔧 Configuration Files

### AI Providers Configuration (`src/config/ai-providers.config.ts`)

```typescript
export const aiProvidersConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    models: {
      text: "gpt-4-turbo",
      vision: "gpt-4-vision-preview",
      image: "dall-e-3",
    },
    rateLimit: {
      requests: 100,
      window: 60000,
    },
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    models: {
      text: "claude-3-sonnet-20240229",
      vision: "claude-3-opus-20240229",
    },
  },
  google: {
    apiKey: process.env.GOOGLE_AI_API_KEY,
    models: {
      text: "gemini-pro",
      vision: "gemini-pro-vision",
      image: "imagen-002",
    },
  },
};
```

### Streaming Configuration (`src/config/streaming.config.ts`)

```typescript
export const streamingConfig = {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6,
  allowEIO3: true,
};
```

---

## 📋 DTOs for AI SDK Integration

### Enhanced Prompt DTO (`src/ai/dto/enhance-prompt.dto.ts`)

```typescript
export class EnhancePromptDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsEnum(["openai", "anthropic", "google"])
  provider?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  creativity?: number; // 0-2 scale
}
```

### Stream Generation DTO (`src/ai/dto/stream-generation.dto.ts`)

```typescript
export class StreamGenerationDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsObject()
  settings?: {
    provider?: string;
    model?: string;
    style?: string;
    ratio?: string;
    quality?: string;
  };

  @IsOptional()
  @IsBoolean()
  enhancePrompt?: boolean = true;

  @IsOptional()
  @IsBoolean()
  streamProgress?: boolean = true;
}
```

---

## 🧪 Testing Structure with AI SDK

### AI Service Tests (`test/ai/ai.service.spec.ts`)

```typescript
describe("AIService", () => {
  // Test prompt enhancement
  // Test provider switching
  // Test streaming capabilities
  // Test error handling
  // Test rate limiting
});
```

### E2E Tests (`test/e2e/ai.e2e-spec.ts`)

```typescript
describe("AI Integration (e2e)", () => {
  // Test full generation workflow
  // Test streaming endpoints
  // Test provider fallbacks
  // Test authentication
});
```

---

## 📚 Documentation Structure

### AI SDK Usage Guide (`docs/development/ai-sdk-usage.md`)

- How to add new providers
- Streaming implementation
- Error handling patterns
- Performance optimization

### API Documentation (`docs/api/ai-integration.md`)

- All AI endpoints
- WebSocket events
- Response formats
- Rate limits

---

## 🚀 Scripts and Automation

### Build Script (`scripts/build.sh`)

```bash
#!/bin/bash
echo "Building FusionPixels API with AI SDK..."
npm run build
echo "Running AI provider health checks..."
npm run test:ai-providers
```

### Migration Script (`scripts/migrate.sh`)

```bash
#!/bin/bash
echo "Running database migrations..."
npm run migration:run
echo "Seeding AI provider configurations..."
npm run seed:ai-config
```

---

## 📦 Package.json Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/bull": "^10.0.0",
    "@nestjs/websockets": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/throttler": "^5.0.0",

    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.20",
    "@ai-sdk/anthropic": "^0.0.15",
    "@ai-sdk/google": "^0.0.18",

    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "bull": "^4.11.0",
    "bcrypt": "^5.1.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "@google-cloud/storage": "^7.0.0",
    "multer": "^1.4.5",
    "uuid": "^9.0.0",
    "socket.io": "^4.7.0"
  }
}
```

---

## 🏁 Implementation Order

### Phase 1: Core Setup (Week 1)

1. **Project initialization** with all folders
2. **Database entities** and migrations
3. **Authentication system**
4. **Basic AI service** setup

### Phase 2: AI SDK Integration (Week 1-2)

1. **AI providers** configuration
2. **Prompt enhancement** service
3. **Multi-provider** management
4. **Streaming** implementation

### Phase 3: Advanced Features (Week 2-3)

1. **Image generation** with queues
2. **Real-time** progress tracking
3. **Analytics** and monitoring
4. **Storage** integration

### Phase 4: Testing & Polish (Week 3-4)

1. **Unit tests** for all services
2. **E2E tests** for workflows
3. **Performance** optimization
4. **Documentation** completion

This complete project structure gives you a production-ready backend with cutting-edge AI SDK integration! 🚀
