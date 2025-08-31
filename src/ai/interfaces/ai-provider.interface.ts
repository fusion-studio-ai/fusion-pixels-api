export interface AIProviderConfig {
  apiKey: string
  models: {
    text: string
    vision?: string
    image?: string
  }
  maxRetries?: number
  timeout?: number
}

export interface EnhancePromptParams {
  prompt: string
  category?: string
  style?: string
  provider?: string
}

export interface GenerateImageParams {
  prompt: string
  enhancedPrompt?: string
  provider?: string
  model?: string
  settings?: {
    style?: string
    ratio?: string
    quality?: string
    seed?: number
  }
}

export interface AIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    provider: string
    model: string
    tokensUsed?: number
    processingTime: number
  }
}
