interface ImageGeneratorProps {
  prompt: string;
  imageCount: number;
  isGenerating: boolean;
  onPromptChange: (prompt: string) => void;
  onImageCountChange: (count: number) => void;
  onGenerate: () => void;
}

export function ImageGenerator({
  prompt,
  imageCount,
  isGenerating,
  onPromptChange,
  onImageCountChange,
  onGenerate,
}: ImageGeneratorProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGenerating) {
      onGenerate();
    }
  };

  return (
    <form className="image-generator" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="prompt">プロンプト</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="生成したい画像の説明を入力してください..."
          rows={3}
          className="prompt-input"
          disabled={isGenerating}
        />
      </div>

      <div className="form-group">
        <label htmlFor="image-count">生成枚数</label>
        <select
          id="image-count"
          value={imageCount}
          onChange={(e) => onImageCountChange(Number(e.target.value))}
          className="aspect-ratio-select"
          disabled={isGenerating}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map(count => (
            <option key={count} value={count}>
              {count}枚
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className={`generate-btn ${isGenerating ? "generating" : ""}`}
        disabled={isGenerating || !prompt.trim()}
      >
        {isGenerating ? (
          <>
            <span className="spinner">⏳</span>
            生成中... ({imageCount}枚同時生成)
          </>
        ) : (
          <>
            🎨 画像を生成する ({imageCount}枚)
          </>
        )}
      </button>
    </form>
  );
}