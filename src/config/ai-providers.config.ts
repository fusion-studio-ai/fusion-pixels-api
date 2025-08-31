import { registerAs } from '@nestjs/config'

export default registerAs('aiProviders', () => ({
  /*openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
    models: {
      text: 'gpt-4-turbo',
      vision: 'gpt-4-vision-preview',
      image: 'dall-e-3',
    },
    maxRetries: 3,
    timeout: 60000,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    models: {
      text: 'claude-3-sonnet-20240229',
      vision: 'claude-3-opus-20240229',
    },
    maxRetries: 3,
    timeout: 60000,
  },*/
  google: {
    apiKey: process.env.GOOGLE_AI_API_KEY,
    models: {
      text: 'gemini-pro',
      vision: 'gemini-pro-vision',
      image: 'imagen-002',
    },
    maxRetries: 3,
    timeout: 60000,
  },
  default: process.env.DEFAULT_AI_PROVIDER || 'openai',
}))
