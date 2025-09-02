import { useState } from "react";
import "./App.css";
import { ImageGenerator } from "./components/ImageGenerator";
import { ImageGallery } from "./components/ImageGallery";
import { ApiKeyManager } from "./components/ApiKeyManager";
import { ErrorDisplay, type ErrorInfo } from "./components/ErrorDisplay";
import { geminiService } from "./services/gemini";
import type { ImageBatch } from "./types";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageCount, setImageCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batches, setBatches] = useState<ImageBatch[]>([]);
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };

  const addError = (message: string, type: ErrorInfo['type'] = 'error') => {
    const error: ErrorInfo = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    setErrors(prev => [error, ...prev.slice(0, 4)]); // Keep max 5 errors
  };

  const dismissError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };


  const handleGenerate = async () => {
    if (!apiKey.trim() || !prompt.trim()) {
      alert("APIキーとプロンプトの両方を入力してください。");
      return;
    }
    
    setIsGenerating(true);
    
    // Create batch with loading state
    const batchId = Date.now().toString();
    const loadingBatch: ImageBatch = {
      id: batchId,
      prompt,
      aspectRatio: "1:1" as const,
      images: [], // Empty images array shows loading state
      createdAt: new Date(),
      model: "gemini-2.5-flash-image-preview"
    };
    
    setBatches(prev => [loadingBatch, ...prev]);
    
    try {
      const images = await geminiService.generateImages({
        prompt,
        aspectRatio: "1:1" as const,
        imageCount,
        apiKey
      });
      
      // Update the batch with generated images
      const completedBatch: ImageBatch = { 
        ...loadingBatch, 
        images 
      };
      
      setBatches(prev => 
        prev.map(batch => 
          batch.id === batchId 
            ? completedBatch
            : batch
        )
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      addError(`画像生成に失敗しました: ${errorMessage}`);
      
      // Remove the failed batch
      setBatches(prev => prev.filter(batch => batch.id !== batchId));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="app">
      <ErrorDisplay errors={errors} onDismiss={dismissError} />
      
      <header className="app-header">
        <h1>🍌 nano-banana</h1>
        <p>Gemini 2.5 Flash Image による画像生成アプリ</p>
      </header>

      <div className="app-content">
        <div className="control-panel">
          <ApiKeyManager onApiKeyChange={handleApiKeyChange} />
          
          <ImageGenerator 
            prompt={prompt}
            imageCount={imageCount}
            isGenerating={isGenerating}
            onPromptChange={setPrompt}
            onImageCountChange={setImageCount}
            onGenerate={handleGenerate}
          />
        </div>

        <div className="gallery-panel">
          <ImageGallery 
            batches={batches} 
            onPromptReuse={setPrompt}
            onRegenerateABatch={async (batchId) => {
              const batch = batches.find(b => b.id === batchId);
              if (batch && !isGenerating) {
                setIsGenerating(true);
                
                // Create new batch for regenerated images
                const newBatchId = Date.now().toString();
                const regeneratedBatch: ImageBatch = {
                  id: newBatchId,
                  prompt: batch.prompt,
                  aspectRatio: "1:1" as const,
                  images: [], // Loading state
                  createdAt: new Date(),
                  model: "gemini-2.5-flash-image-preview"
                };
                
                setBatches(prev => [regeneratedBatch, ...prev]);
                
                try {
                  const images = await geminiService.generateImages({
                    prompt: batch.prompt,
                    aspectRatio: "1:1" as const,
                    imageCount: batch.images.length || 4, // Use original batch size
                    apiKey
                  });
                  
                  const regeneratedCompleteBatch: ImageBatch = {
                    ...regeneratedBatch,
                    images
                  };
                  
                  setBatches(prev => 
                    prev.map(b => 
                      b.id === newBatchId 
                        ? regeneratedCompleteBatch
                        : b
                    )
                  );

                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : '不明なエラー';
                  addError(`再生成に失敗しました: ${errorMessage}`);
                  
                  setBatches(prev => prev.filter(b => b.id !== newBatchId));
                } finally {
                  setIsGenerating(false);
                }
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}

export default App;