export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  createdAt: Date;
  filename: string;
}

export interface ImageBatch {
  id: string;
  prompt: string;
  aspectRatio: AspectRatio;
  images: GeneratedImage[];
  createdAt: Date;
  model: string;
}

export interface ImageMetadata {
  id: string;
  prompt: string;
  aspectRatio: AspectRatio;
  createdAt: string;
  model: string;
  files: string[];
}