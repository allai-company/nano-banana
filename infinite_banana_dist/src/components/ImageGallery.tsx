import type { ImageBatch } from "../types";

interface ImageGalleryProps {
  batches: ImageBatch[];
  onPromptReuse: (prompt: string) => void;
  onRegenerateABatch: (batchId: string) => void;
}

export function ImageGallery({
  batches,
  onPromptReuse,
  onRegenerateABatch,
}: ImageGalleryProps) {
  if (batches.length === 0) {
    return (
      <div className="image-gallery empty">
        <div className="empty-state">
          <p>🖼️ まだ画像が生成されていません</p>
          <p>プロンプトを入力して生成ボタンを押してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      {batches.map((batch) => (
        <div key={batch.id} className="image-batch">
          <div className="batch-header">
            <h3 className="batch-prompt">"{batch.prompt}"</h3>
            <div className="batch-info">
              <span className="aspect-ratio">{batch.aspectRatio}</span>
              <span className="created-time">
                {batch.createdAt.toLocaleString("ja-JP")}
              </span>
            </div>
          </div>

          <div className="batch-grid">
            {batch.images.length === 0 ? (
              <div className="loading-grid">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="loading-placeholder">
                    <div className="loading-spinner">⏳</div>
                    <p>生成中...</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="image-grid">
                {batch.images.map((image) => (
                  <div key={image.id} className="image-card">
                    <img src={image.url} alt={image.prompt} />
                    <div className="image-overlay">
                      <button
                        onClick={() => onPromptReuse(image.prompt)}
                        className="reuse-prompt-btn"
                        title="このプロンプトを再利用"
                      >
                        📝 プロンプト再利用
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => onRegenerateABatch(batch.id)}
              className="regenerate-batch-btn"
              title="同じプロンプトで再生成"
            >
              🔄
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}