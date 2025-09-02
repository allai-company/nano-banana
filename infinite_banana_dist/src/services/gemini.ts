import { GoogleGenAI } from "@google/genai";
import { withRetry } from "../utils/retry";
import type { AspectRatio, GeneratedImage } from "../types";

export interface GenerateImagesOptions {
  prompt: string;
  aspectRatio: AspectRatio;
  imageCount: number;
  apiKey: string;
}

export class GeminiImageService {
  private genAI: GoogleGenAI | null = null;

  private initialize(apiKey: string) {
    if (!this.genAI || this.currentApiKey !== apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
      this.currentApiKey = apiKey;
    }
  }

  private currentApiKey: string = "";


  private async generateSingleImage(
    prompt: string, 
    aspectRatio: AspectRatio,
    index: number
  ): Promise<GeneratedImage> {
    if (!this.genAI) {
      throw new Error("Gemini AI not initialized");
    }

    return await withRetry(async () => {
      
      const result = await this.genAI!.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: prompt,
      } as any);
      
      
      // Check candidates in response
      const candidates = result.candidates;
      
      if (!candidates || candidates.length === 0) {
        throw new Error("No image generated - no candidates returned");
      }

      const candidate = candidates[0];
      const parts = candidate.content?.parts;
      
      if (!parts || parts.length === 0) {
        throw new Error("No image data in response - no parts found");
      }

      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          // Accept any data, not just image/ mime types since Gemini might not set them correctly
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png'; // Default to PNG if no mime type
          
          // Convert base64 to blob URL
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });
          const url = URL.createObjectURL(blob);

          const now = new Date();
          const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
          
          return {
            id: `${Date.now()}-${index}`,
            url,
            prompt,
            aspectRatio,
            createdAt: now,
            filename: `${timestamp}_img-${index + 1}.png`
          };
        }
      }
      
      throw new Error("No image data found in response - no valid image parts");
    }, {
      maxRetries: 2,
      baseDelay: 2000
    });
  }

  async generateImages(options: GenerateImagesOptions): Promise<GeneratedImage[]> {
    this.initialize(options.apiKey);
    
    const { prompt, aspectRatio, imageCount } = options;

    // Generate images in parallel (1-10 images)
    const promises = Array.from({ length: imageCount }, (_, index) =>
      this.generateSingleImage(prompt, aspectRatio, index)
    );

    try {
      // Use Promise.allSettled to handle partial failures
      const results = await Promise.allSettled(promises);
      const successfulImages: GeneratedImage[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulImages.push(result.value);
        } else {
          errors.push(`Image ${index + 1}: ${result.reason}`);
        }
      });

      if (successfulImages.length === 0) {
        throw new Error(`All image generation failed: ${errors.join(', ')}`);
      }


      return successfulImages;
    } catch (error) {
      throw error;
    }
  }

  // Clean up blob URLs to prevent memory leaks
  static cleanupBlobUrls(images: GeneratedImage[]) {
    images.forEach(image => {
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    });
  }
}

export const geminiService = new GeminiImageService();