import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { generateText, generateObject, CoreMessage, ToolCallPart, ToolResultPart } from 'ai'
import { google } from '@ai-sdk/google'
import { AIModel } from './enums/ai-provider.enum'
import { z } from 'zod' // Add this import at the top
import { safetyRatingSchema } from '@ai-sdk/google/internal'

export enum AIProvider {
  GOOGLE = 'google',
}

// Existing interfaces
export interface EnhancePromptRequest {
  prompt: string
  category?: string
  style?: string
}

export interface AIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    provider: string
    model: string
    processingTime: number
    tokensUsed?: number
  }
}

// Image Generation Interfaces
export interface TextToImageRequest {
  prompt: string
  enhancePrompt?: boolean
  style?: 'photorealistic' | 'artistic' | 'minimalist' | 'commercial' | 'logo' | 'cartoon'
  aspectRatio?: 'square' | 'landscape' | 'portrait'
  quality?: 'standard' | 'high' | 'ultra'
  includeText?: boolean // Whether to include text response with image
}

export interface ImageEditingRequest {
  prompt: string
  baseImage: string // base64 encoded image
  operation?: 'add' | 'remove' | 'modify' | 'style_transfer' | 'inpaint'
  preserveOriginal?: boolean
  includeText?: boolean
}

export interface MultiImageCompositionRequest {
  prompt: string
  images: string[] // array of base64 encoded images
  compositionType?: 'merge' | 'style_transfer' | 'product_mockup' | 'collage'
  includeText?: boolean
}

export interface IterativeRefinementRequest {
  prompt: string
  previousImage?: string // base64 encoded
  conversationHistory?: string[]
  refinementType?: 'adjust' | 'enhance' | 'modify'
  includeText?: boolean
}

export interface HighFidelityTextRequest {
  text: string
  style: 'logo' | 'poster' | 'banner' | 'business_card' | 'social_media'
  colorScheme?: string
  fontStyle?: string
  background?: string
}

export interface GeneratedImageResult {
  imageBase64?: string
  imageUrl?: string
  format: string
  mediaType: string
  dimensions?: { width: number; height: number }
  fileSize?: number
  fileName?: string
}

export interface ImageGenerationResponse {
  success: boolean
  images?: GeneratedImageResult[]
  textResponse?: string
  enhancedPrompt?: string
  originalPrompt: string
  error?: string
  metadata?: {
    provider: string
    model: string
    processingTime: number
    tokensUsed?: number
    imagesGenerated: number
  }
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name)

  constructor(private readonly configService: ConfigService) {
    this.logger.log('AIService initialized with AI SDK Google Provider')
  }

  /**
   * Get Gemini 2.0 Flash model for text generation
   */
  private getTextModel() {
    return google(AIModel.GEMINI_2_FLASH)
  }

  /**
   * Get Gemini 2.5 Flash Image Preview model for image generation
   */
  private getImageModel() {
    return google(AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW)
  }

  /**
   * Convert base64 string to AI SDK image format
   */
  private base64ToImagePart(base64Data: string, mimeType: string = 'image/png') {
    return {
      type: 'image' as const,
      image: `data:${mimeType};base64,${base64Data}`,
    }
  }

  /**
   * Extract images from AI SDK response files
   */
  private extractImagesFromFiles(files: any[]): GeneratedImageResult[] {
    const images: GeneratedImageResult[] = []

    for (const file of files) {
      if (file.mediaType?.startsWith('image/')) {
        // Convert file data to base64 if needed
        const base64Data = file.data instanceof Buffer ? file.data.toString('base64') : file.data

        images.push({
          imageBase64: base64Data,
          imageUrl: file.url || undefined,
          format: file.mediaType.includes('jpeg') ? 'jpeg' : 'png',
          mediaType: file.mediaType,
          fileSize: file.size || this.calculateBase64FileSize(base64Data),
          fileName: file.name || `generated_image.${file.mediaType.includes('jpeg') ? 'jpg' : 'png'}`,
        })
      }
    }

    return images
  }

  /**
   * Calculate file size from base64 string
   */
  private calculateBase64FileSize(base64String: string): number {
    return Math.round((base64String.length * 3) / 4)
  }

  // ============================================
  // TEXT GENERATION METHODS
  // ============================================

  /**
   * Enhanced prompt generation using Gemini 2.0 Flash
   */
  async enhancePrompt(request: EnhancePromptRequest): Promise<AIResponse<string>> {
    const startTime = Date.now()
    const { prompt, category = 'general', style = 'photorealistic' } = request

    try {
      this.logger.debug(`Enhancing prompt with Gemini 2.0 Flash: "${prompt.substring(0, 50)}..."`)

      const model = this.getTextModel()

      const result = await generateText({
        model,
        prompt: `You are an expert prompt engineer for AI image generation. You specialize in creating highly detailed, optimized prompts.

Original prompt: "${prompt}"
Category: ${category}
Style preference: ${style}

Transform this into a professional AI image generation prompt:

Enhancement Rules:
1. Add specific visual details: lighting, composition, perspective
2. Include technical photography terms: "shot with", lens specs, camera settings
3. Add quality boosters: "high detail", "8K", "professional photography", "award-winning"
4. Specify style descriptors that match the category
5. Include mood and atmosphere details
6. Add artistic techniques if relevant: "depth of field", "bokeh", "golden ratio composition"
7. Keep under 150 words but be descriptive
8. Optimize for modern AI image generation models (Google Gemini 2.5 Flash Image Preview)

Return ONLY the enhanced prompt, no explanations:`,
        maxOutputTokens: 200,
        temperature: 0.8,
      })

      const processingTime = Date.now() - startTime
      this.logger.debug(`Prompt enhanced in ${processingTime}ms with Gemini 2.0 Flash`)

      return {
        success: true,
        data: result.text.trim(),
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime,
          tokensUsed: result.usage?.totalTokens,
        },
      }
    } catch (error) {
      this.logger.error(`Prompt enhancement failed with Gemini 2.0 Flash:`, error.message)

      return {
        success: false,
        error: error.message,
        data: prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime: Date.now() - startTime,
        },
      }
    }
  }

  /**
   * Generate creative prompt suggestions using Gemini 2.0 Flash
   */
  async generatePromptSuggestions(category: string, count: number = 3): Promise<AIResponse<string[]>> {
    const startTime = Date.now()

    try {
      const model = this.getTextModel()

      const result = await generateText({
        model,
        prompt: `Generate ${count} creative and highly detailed image prompts for ${category} imagery.

Each prompt should be:
- 30-60 words long
- Professionally detailed with specific visual elements
- Include lighting, mood, composition details
- Add technical photography specifications
- Optimized for AI image generation (Google Gemini 2.5 Flash Image Preview)
- Unique and diverse in approach
- Include quality keywords like "8K", "professional", "award-winning"

Category: ${category}

Format as numbered list:
1. [First detailed prompt with technical specs]
2. [Second detailed prompt with different style/mood]  
3. [Third detailed prompt with unique perspective]`,
        maxOutputTokens: 500,
        temperature: 1.0,
      })

      const suggestions = result.text
        .split('\n')
        .filter((line) => line.trim() && /^\d+\./.test(line))
        .map((line) => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, count)

      return {
        success: true,
        data: suggestions,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime: Date.now() - startTime,
          tokensUsed: result.usage?.totalTokens,
        },
      }
    } catch (error) {
      this.logger.error('Prompt suggestions failed with Gemini 2.0 Flash:', error.message)

      return {
        success: false,
        error: error.message,
        data: [],
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime: Date.now() - startTime,
        },
      }
    }
  }

  /**
   * Analyze and improve existing prompt
   */
  async analyzePrompt(prompt: string): Promise<
    AIResponse<{
      analysis: string
      improvements: string[]
      score: number
    }>
  > {
    const startTime = Date.now()

    try {
      const model = this.getTextModel()

      const schema = z.object({
        analysis: z.string(),
        improvements: z.array(z.string()).max(5),
        score: z.number().min(1).max(10),
      })

      const result = await generateObject({
        model,
        providerOptions: {
          google: {
            responseModalities: ['TEXT'],
          },
        },
        schema,
        prompt: `Analyze this AI image generation prompt and provide improvement suggestions:

Prompt: "${prompt}"

Provide:
1. Analysis: What's good and what's missing
2. Improvements: 3-5 specific suggestions
3. Score: Rate the prompt quality from 1-10`,
      })

      return {
        success: true,
        data: result.object,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime: Date.now() - startTime,
          tokensUsed: result.usage?.totalTokens,
        },
      }
    } catch (error) {
      this.logger.error('Prompt analysis failed:', error.message)

      return {
        success: false,
        error: error.message,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_FLASH,
          processingTime: Date.now() - startTime,
        },
      }
    }
  }

  // ============================================
  // IMAGE GENERATION METHODS
  // ============================================

  /**
   * 1. Text-to-Image: Generate images from descriptive prompts
   */
  async generateImageFromText(request: TextToImageRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now()
    let { prompt, enhancePrompt = true, style = 'photorealistic', includeText = false } = request

    try {
      this.logger.debug(`Generating image from text: "${prompt.substring(0, 50)}..."`)

      // Enhance prompt if requested
      let enhancedPrompt = prompt
      if (enhancePrompt) {
        const enhanced = await this.enhancePrompt({ prompt, style })
        if (enhanced.success) {
          enhancedPrompt = enhanced.data!
        }
      }

      // Add style-specific enhancements
      const styledPrompt = this.addStyleEnhancements(enhancedPrompt, style, request.aspectRatio, request.quality)

      const model = this.getImageModel()

      const result = await generateText({
        model,
        prompt: styledPrompt,
        providerOptions: this.getProviderOptions(includeText),
      })

      const images = this.extractImagesFromFiles(result.files || [])

      return {
        success: true,
        images,
        textResponse: includeText ? result.text : undefined,
        enhancedPrompt,
        originalPrompt: prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: result.usage?.totalTokens,
          imagesGenerated: images.length,
        },
      }
    } catch (error) {
      this.logger.error('Text-to-image generation failed:', error.message)

      return {
        success: false,
        error: error.message,
        originalPrompt: prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          imagesGenerated: 0,
        },
      }
    }
  }

  /**
   * 2. Image+Text-to-Image (Editing): Edit images using text prompts
   */
  async editImageWithText(request: ImageEditingRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now()

    try {
      this.logger.debug(`Editing image with text: "${request.prompt.substring(0, 50)}..."`)

      // Prepare the editing prompt based on operation type
      const editingPrompt = this.createEditingPrompt(request.prompt, request.operation, request.preserveOriginal)

      const model = this.getImageModel()

      // Prepare messages with image and text
      const messages: CoreMessage[] = [
        {
          role: 'user',
          content: [{ type: 'text', text: editingPrompt }, this.base64ToImagePart(request.baseImage)],
        },
      ]

      const result = await generateText({
        model,
        messages,
        providerOptions: {
          google: {
            responseModalities: request.includeText ? ['TEXT', 'IMAGE'] : ['IMAGE'],
          },
        },
      })

      const images = this.extractImagesFromFiles(result.files || [])

      return {
        success: true,
        images,
        textResponse: request.includeText ? result.text : undefined,
        originalPrompt: request.prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: result.usage?.totalTokens,
          imagesGenerated: images.length,
        },
      }
    } catch (error) {
      this.logger.error('Image editing failed:', error.message)

      return {
        success: false,
        error: error.message,
        originalPrompt: request.prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          imagesGenerated: 0,
        },
      }
    }
  }

  /**
   * 3. Multi-Image Composition: Combine multiple images
   */
  async composeMultipleImages(request: MultiImageCompositionRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now()

    try {
      this.logger.debug(`Composing multiple images: "${request.prompt.substring(0, 50)}..."`)

      // Create composition prompt
      const compositionPrompt = this.createCompositionPrompt(
        request.prompt,
        request.compositionType,
        request.images.length
      )

      const model = this.getImageModel()

      // Prepare content with text and all images
      const content: any[] = [{ type: 'text', text: compositionPrompt }]

      request.images.forEach((imageBase64) => {
        content.push(this.base64ToImagePart(imageBase64))
      })

      const messages: CoreMessage[] = [
        {
          role: 'user',
          content,
        },
      ]

      const result = await generateText({
        model,
        messages,
        providerOptions: {
          google: {
            responseModalities: request.includeText ? ['TEXT', 'IMAGE'] : ['IMAGE'],
          },
        },
      })

      const images = this.extractImagesFromFiles(result.files || [])

      return {
        success: true,
        images,
        textResponse: request.includeText ? result.text : undefined,
        originalPrompt: request.prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: result.usage?.totalTokens,
          imagesGenerated: images.length,
        },
      }
    } catch (error) {
      this.logger.error('Multi-image composition failed:', error.message)

      return {
        success: false,
        error: error.message,
        originalPrompt: request.prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          imagesGenerated: 0,
        },
      }
    }
  }

  /**
   * 4. Iterative Refinement: Progressive image editing
   */
  async refineImageIteratively(request: IterativeRefinementRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now()

    try {
      this.logger.debug(`Iterative refinement: "${request.prompt.substring(0, 50)}..."`)

      // Create refinement prompt with conversation context
      const refinementPrompt = this.createRefinementPrompt(
        request.prompt,
        request.conversationHistory,
        request.refinementType
      )

      const model = this.getImageModel()

      // Prepare content
      const content: any[] = [{ type: 'text', text: refinementPrompt }]

      if (request.previousImage) {
        content.push(this.base64ToImagePart(request.previousImage))
      }

      const messages: CoreMessage[] = [
        {
          role: 'user',
          content,
        },
      ]

      const result = await generateText({
        model,
        messages,
        providerOptions: {
          google: {
            responseModalities: request.includeText ? ['TEXT', 'IMAGE'] : ['IMAGE'],
          },
        },
      })

      const images = this.extractImagesFromFiles(result.files || [])

      return {
        success: true,
        images,
        textResponse: request.includeText ? result.text : undefined,
        originalPrompt: request.prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: result.usage?.totalTokens,
          imagesGenerated: images.length,
        },
      }
    } catch (error) {
      this.logger.error('Iterative refinement failed:', error.message)

      return {
        success: false,
        error: error.message,
        originalPrompt: request.prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          imagesGenerated: 0,
        },
      }
    }
  }

  /**
   * 5. High-Fidelity Text: Generate images with legible text
   */
  async generateHighFidelityText(request: HighFidelityTextRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now()

    try {
      this.logger.debug(`Generating high-fidelity text image: "${request.text}"`)

      // Create text-focused prompt
      const textPrompt = this.createTextPrompt(
        request.text,
        request.style,
        request.colorScheme,
        request.fontStyle,
        request.background
      )

      const model = this.getImageModel()

      const result = await generateText({
        model,
        prompt: textPrompt,
        providerOptions: {
          google: {
            responseModalities: ['TEXT', 'IMAGE'], // Always include text for text-based designs
          },
        },
      })

      const images = this.extractImagesFromFiles(result.files || [])

      return {
        success: true,
        images,
        textResponse: result.text,
        originalPrompt: request.text,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: result.usage?.totalTokens,
          imagesGenerated: images.length,
        },
      }
    } catch (error) {
      this.logger.error('High-fidelity text generation failed:', error.message)

      return {
        success: false,
        error: error.message,
        originalPrompt: request.text,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          imagesGenerated: 0,
        },
      }
    }
  }

  // ============================================
  // ADVANCED FEATURES
  // ============================================

  /**
   * Generate with Google Search grounding
   */
  async generateImageWithSearch(prompt: string, searchQuery?: string): Promise<ImageGenerationResponse> {
    const startTime = Date.now()

    try {
      this.logger.debug(`Generating image with search grounding: "${prompt.substring(0, 50)}..."`)

      const model = this.getImageModel()

      const finalPrompt = searchQuery ? `${prompt}. Use the latest information about: ${searchQuery}` : prompt

      const result = await generateText({
        model,
        prompt: finalPrompt,
        tools: {
          google_search: google.tools.googleSearch({}),
        },
        providerOptions: {
          google: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        },
      })

      const images = this.extractImagesFromFiles(result.files || [])

      return {
        success: true,
        images,
        textResponse: result.text,
        originalPrompt: prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: result.usage?.totalTokens,
          imagesGenerated: images.length,
        },
      }
    } catch (error) {
      this.logger.error('Image generation with search failed:', error.message)

      return {
        success: false,
        error: error.message,
        originalPrompt: prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          imagesGenerated: 0,
        },
      }
    }
  }

  /**
   * Generate image from URL context
   */
  async generateImageFromUrl(prompt: string, url: string): Promise<ImageGenerationResponse> {
    const startTime = Date.now()

    try {
      this.logger.debug(`Generating image from URL context: "${url}"`)

      const model = this.getImageModel()

      const result = await generateText({
        model,
        prompt: `Based on the content from ${url}: ${prompt}`,
        tools: {
          url_context: google.tools.urlContext({}),
        },
        providerOptions: {
          google: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        },
      })

      const images = this.extractImagesFromFiles(result.files || [])

      return {
        success: true,
        images,
        textResponse: result.text,
        originalPrompt: prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: result.usage?.totalTokens,
          imagesGenerated: images.length,
        },
      }
    } catch (error) {
      this.logger.error('Image generation from URL failed:', error.message)

      return {
        success: false,
        error: error.message,
        originalPrompt: prompt,
        metadata: {
          provider: AIProvider.GOOGLE,
          model: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          imagesGenerated: 0,
        },
      }
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Add style-specific enhancements to prompt
   */
  private addStyleEnhancements(prompt: string, style?: string, aspectRatio?: string, quality?: string): string {
    let enhanced = prompt

    // Style enhancements
    switch (style) {
      case 'photorealistic':
        enhanced +=
          ', photorealistic, high-resolution, professional photography, detailed textures, natural lighting, realistic shadows'
        break
      case 'artistic':
        enhanced +=
          ', artistic style, creative composition, vibrant colors, expressive brushstrokes, fine art, gallery quality'
        break
      case 'minimalist':
        enhanced +=
          ', minimalist design, clean lines, simple composition, negative space, modern aesthetic, elegant simplicity'
        break
      case 'commercial':
        enhanced +=
          ', commercial photography, studio lighting, product showcase, professional, marketing ready, brand quality'
        break
      case 'logo':
        enhanced += ', logo design, vector style, clean graphics, brand identity, scalable design, corporate aesthetic'
        break
      case 'cartoon':
        enhanced += ', cartoon style, animated, colorful, playful design, character illustration, family-friendly'
        break
    }

    // Quality enhancements
    if (quality === 'high' || quality === 'ultra') {
      enhanced += ', 4K resolution, ultra-high quality, sharp details, premium finish, award-winning'
    }

    // Aspect ratio hints
    if (aspectRatio === 'landscape') {
      enhanced += ', landscape orientation, wide composition, horizontal format, cinematic aspect'
    } else if (aspectRatio === 'portrait') {
      enhanced += ', portrait orientation, vertical composition, tall format, magazine style'
    } else if (aspectRatio === 'square') {
      enhanced += ', square format, balanced composition, social media ready'
    }

    return enhanced
  }

  /**
   * Create editing prompt based on operation type
   */
  private createEditingPrompt(prompt: string, operation?: string, preserveOriginal?: boolean): string {
    let editPrompt = ''

    switch (operation) {
      case 'add':
        editPrompt = `Add ${prompt} to the provided image. Ensure the new element blends naturally with the existing scene, matching lighting, perspective, and style perfectly.`
        break
      case 'remove':
        editPrompt = `Remove ${prompt} from the provided image. Fill in the area naturally to maintain visual coherence and realistic appearance.`
        break
      case 'modify':
        editPrompt = `Modify the provided image by ${prompt}. Keep the overall composition while making the requested changes seamlessly.`
        break
      case 'style_transfer':
        editPrompt = `Transform the provided image into ${prompt} style. Preserve the content and composition while changing the artistic style completely.`
        break
      case 'inpaint':
        editPrompt = `Using the provided image, ${prompt}. Focus on seamless integration with the existing elements and realistic results.`
        break
      default:
        editPrompt = `${prompt} using the provided image as a base. Make the changes look natural and professionally executed.`
    }

    if (preserveOriginal) {
      editPrompt +=
        ' Preserve as much of the original image as possible while making only the necessary changes. Maintain the original quality and style.'
    }

    return editPrompt
  }

  /**
   * Create composition prompt for multiple images
   */
  private createCompositionPrompt(prompt: string, compositionType?: string, imageCount?: number): string {
    let compositionPrompt = ''

    switch (compositionType) {
      case 'merge':
        compositionPrompt = `Create a seamless composition by merging the ${imageCount} provided images. ${prompt}. Blend them naturally with consistent lighting, perspective, and color grading.`
        break
      case 'style_transfer':
        compositionPrompt = `Transfer the style from the first image to the content of the second image. ${prompt}. Maintain the composition while adopting the artistic style completely.`
        break
      case 'product_mockup':
        compositionPrompt = `Create a professional product mockup using the provided images. ${prompt}. Ensure realistic placement, proper lighting, and commercial quality presentation.`
        break
      case 'collage':
        compositionPrompt = `Create an artistic collage using the provided ${imageCount} images. ${prompt}. Arrange them creatively while maintaining visual harmony and aesthetic appeal.`
        break
      default:
        compositionPrompt = `Compose a new image using the provided ${imageCount} images. ${prompt}. Create a cohesive, professional final result with unified style and lighting.`
    }

    return compositionPrompt
  }

  /**
   * Create refinement prompt with conversation context
   */
  private createRefinementPrompt(prompt: string, conversationHistory?: string[], refinementType?: string): string {
    let refinementPrompt = ''

    if (conversationHistory && conversationHistory.length > 0) {
      refinementPrompt += `Previous conversation context: ${conversationHistory.join(' → ')}\n\n`
    }

    switch (refinementType) {
      case 'adjust':
        refinementPrompt += `Make subtle adjustments to the provided image: ${prompt}. Keep the overall composition and make only minor, precise changes.`
        break
      case 'enhance':
        refinementPrompt += `Enhance the provided image by ${prompt}. Improve the quality, details, or visual appeal while maintaining the original concept and style.`
        break
      case 'modify':
        refinementPrompt += `Modify the provided image: ${prompt}. Make the requested changes while preserving the overall aesthetic and maintaining professional quality.`
        break
      default:
        refinementPrompt += `Continue refining the provided image: ${prompt}. Build upon the previous iterations with careful attention to detail.`
    }

    return refinementPrompt
  }

  /**
   * Create text-focused prompt for high-fidelity text rendering
   */
  private createTextPrompt(
    text: string,
    style: string,
    colorScheme?: string,
    fontStyle?: string,
    background?: string
  ): string {
    let textPrompt = `Create a ${style} design featuring the text "${text}"`

    if (fontStyle) {
      textPrompt += ` in ${fontStyle} typography`
    }

    if (colorScheme) {
      textPrompt += ` using ${colorScheme} colors`
    }

    if (background) {
      textPrompt += ` on ${background} background`
    }

    // Add style-specific requirements
    switch (style) {
      case 'logo':
        textPrompt +=
          '. Professional logo design, clean vector style, scalable, brand-appropriate, memorable, versatile for different applications.'
        break
      case 'poster':
        textPrompt +=
          '. Eye-catching poster design, balanced composition, readable hierarchy, impactful visual, attention-grabbing, suitable for printing.'
        break
      case 'banner':
        textPrompt +=
          '. Web banner design, horizontal layout, clear messaging, call-to-action focused, web-optimized, professional appearance.'
        break
      case 'business_card':
        textPrompt +=
          '. Professional business card layout, elegant typography, contact information layout, premium feel, print-ready design.'
        break
      case 'social_media':
        textPrompt +=
          '. Social media post design, engaging visual, optimized for digital platforms, shareable, trendy, platform-appropriate.'
        break
    }

    textPrompt +=
      ' Ensure all text is legible, well-positioned, and professionally rendered with perfect typography. The text should be the main focus and clearly readable.'

    return textPrompt
  }

  // ============================================
  // HEALTH CHECK METHODS
  // ============================================

  /**
   * Check Gemini text generation health
   */
  async checkProviderHealth(): Promise<boolean> {
    try {
      const model = this.getTextModel()

      await generateText({
        model,
        prompt: 'Test connection',
        maxOutputTokens: 5,
      })

      this.logger.debug('Gemini 2.0 Flash health check passed')
      return true
    } catch (error) {
      this.logger.warn('Gemini 2.0 Flash health check failed:', error.message)
      return false
    }
  }

  /**
   * Check image generation health
   */
  async checkImageGenerationHealth(): Promise<boolean> {
    try {
      const testResult = await this.generateImageFromText({
        prompt: 'simple red circle on white background',
        enhancePrompt: false,
        quality: 'standard',
      })

      return testResult.success && (testResult.images?.length ?? 0) > 0
    } catch (error) {
      this.logger.warn('Image generation health check failed:', error.message)
      return false
    }
  }

  /**
   * Get comprehensive provider info
   */
  getProviderInfo() {
    return {
      provider: AIProvider.GOOGLE,
      sdk: 'AI SDK (@ai-sdk/google)',
      models: {
        text: AIModel.GEMINI_2_FLASH,
        image: AIModel.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
      },
      capabilities: [
        'Ultra-fast text generation',
        'Advanced prompt enhancement',
        'Creative suggestions',
        'Native image generation',
        'Image editing with text',
        'Multi-image composition',
        'Iterative refinement',
        'High-fidelity text rendering',
        'Google Search grounding',
        'URL context integration',
        'Multi-language support',
        'Safety filtering',
      ],
      imageFeatures: {
        textToImage: true,
        imageEditing: true,
        multiImageComposition: true,
        iterativeRefinement: true,
        highFidelityText: true,
        searchGrounding: true,
        urlContext: true,
        safetyFiltering: true,
        supportedFormats: ['PNG', 'JPEG'],
        nativeFileHandling: true,
        synthIDWatermark: true,
      },
      features: {
        speed: 'Ultra-fast (Google optimized)',
        quality: 'High',
        costEfficiency: 'Excellent',
        creativity: 'Very High',
        reliability: 'Production-ready',
        integration: 'Native AI SDK',
      },
      note: 'Complete AI service using AI SDK native Google provider with full Gemini capabilities and image generation.',
    }
  }

  // Add this helper function after the class declaration but before other methods
  private getSafetyRatings() {
    return {
      safetyRatings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          probability: 'NEGLIGIBLE',
          probabilityScore: 0.11027937,
          severity: 'HARM_SEVERITY_LOW',
          severityScore: 0.28487435,
          blocked: true,
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          probability: 'HIGH',
          probabilityScore: 0.95422274,
          severity: 'HARM_SEVERITY_MEDIUM',
          severityScore: 0.43398145,
          blocked: true,
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          probability: 'NEGLIGIBLE',
          probabilityScore: 0.11085559,
          severity: 'HARM_SEVERITY_NEGLIGIBLE',
          severityScore: 0.19027223,
          blocked: true,
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          probability: 'NEGLIGIBLE',
          probabilityScore: 0.22901751,
          severity: 'HARM_SEVERITY_NEGLIGIBLE',
          severityScore: 0.09089675,
          blocked: true,
        },
      ],
    }
  }

  // Helper function to get provider options with safety ratings
  private getProviderOptions(includeText: boolean = false) {
    return {
      google: {
        responseModalities: includeText ? ['TEXT', 'IMAGE'] : ['IMAGE'],
      },
      safetyRatingSchema: this.getSafetyRatings(),
    }
  }
}
