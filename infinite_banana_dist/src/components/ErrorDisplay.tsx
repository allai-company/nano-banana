import { useState, useEffect } from 'react';

export interface ErrorInfo {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
}

interface ErrorDisplayProps {
  errors: ErrorInfo[];
  onDismiss: (id: string) => void;
}

export function ErrorDisplay({ errors, onDismiss }: ErrorDisplayProps) {
  if (errors.length === 0) return null;

  return (
    <div className="error-display">
      {errors.map((error) => (
        <ErrorItem
          key={error.id}
          error={error}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

interface ErrorItemProps {
  error: ErrorInfo;
  onDismiss: (id: string) => void;
}

function ErrorItem({ error, onDismiss }: ErrorItemProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 10 seconds for non-error messages
    if (error.type !== 'error') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(error.id);
    }, 300); // Allow exit animation
  };

  const getIcon = () => {
    switch (error.type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❌';
    }
  };

  return (
    <div className={`error-item ${error.type} ${!isVisible ? 'hiding' : ''}`}>
      <div className="error-content">
        <span className="error-icon">{getIcon()}</span>
        <div className="error-text">
          <p className="error-message">{error.message}</p>
          <p className="error-timestamp">
            {error.timestamp.toLocaleTimeString('ja-JP')}
          </p>
        </div>
      </div>
      <button
        className="error-dismiss"
        onClick={handleDismiss}
        title="閉じる"
      >
        ×
      </button>
    </div>
  );
}