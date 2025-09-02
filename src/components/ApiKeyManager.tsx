import { useState, useEffect } from "react";

interface ApiKeyManagerProps {
  onApiKeyChange: (apiKey: string) => void;
}

export function ApiKeyManager({ onApiKeyChange }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [shouldSave, setShouldSave] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("nano-banana-api-key");
    if (savedKey) {
      setApiKey(savedKey);
      onApiKeyChange(savedKey);
    }
  }, [onApiKeyChange]);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    onApiKeyChange(value);
    
    if (shouldSave) {
      localStorage.setItem("nano-banana-api-key", value);
    } else {
      localStorage.removeItem("nano-banana-api-key");
    }
  };

  const handleSaveToggle = (save: boolean) => {
    setShouldSave(save);
    
    if (save && apiKey) {
      localStorage.setItem("nano-banana-api-key", apiKey);
    } else {
      localStorage.removeItem("nano-banana-api-key");
    }
  };

  return (
    <div className="api-key-manager">
      <label htmlFor="api-key">Gemini API キー</label>
      <div className="api-key-input-group">
        <input
          id="api-key"
          type={isVisible ? "text" : "password"}
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          placeholder="AIzaSy... で始まる API キーを入力"
          className="api-key-input"
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="toggle-visibility-btn"
          title={isVisible ? "隠す" : "表示"}
        >
          {isVisible ? "🙈" : "👁️"}
        </button>
      </div>
      
      <div className="api-key-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={shouldSave}
            onChange={(e) => handleSaveToggle(e.target.checked)}
          />
          APIキーをローカル保存する（任意）
        </label>
      </div>
    </div>
  );
}